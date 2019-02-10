/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "BIFIT" JSC, TIN 7719617469
 *       105203, Russia, Moscow, Nizhnyaya Pervomayskaya, 46
 * (c) "BIFIT" JSC, 2018
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       АО "БИФИТ", ИНН 7719617469
 *       105203, Россия, Москва, ул. Нижняя Первомайская, д. 46
 * (c) АО "БИФИТ", 2018
 */

import {BifitMacConfirmationDialog} from "components/dialogs/payment/bifitMacConfirmationDialog";
import {ContinueConfirmDialog} from "components/dialogs/payment/continueConfirmDialog";
import {MacConfirmationDialog} from "components/dialogs/payment/macConfirmationDialog";
import {OtpConfirmationDialog} from "components/dialogs/payment/otpConfirmationDialog";
import {SmsConfirmationDialog} from "components/dialogs/payment/smsConfirmationDialog";
import {PinCodeDialog} from "components/dialogs/plugin/pinCodeDialog";
import * as CryptoUtil from "default/CryptoUtil";
import {ConfirmType} from "model/confirmationType";
import {Document, DocumentContent, DocumentType} from "model/document";
import {Status} from "model/status";
import {Inject} from "platform/ioc";
import {ClientService} from "service/clientService";
import {DateTimeService} from "service/dateTimeService";
import {ConfirmCase, ContentType, DocumentExtContent, DocumentService} from "service/documentService";
import {SignatureService} from "service/signatureService";
import {CommandRequest, TransactionService} from "service/transactionService";
import {BifitMacTokenHelper} from "utils/bifitMacTokenHelper";
import {TokenUtils} from "../../utils/tokenUtils";

/**
 * Помощник отправки платежа
 */
export class SendPaymentHelper {

    /** Сервис по работе с клиентом */
    @Inject
    private clientService: ClientService;

    /** Сервис для получения текущего времени */
    @Inject
    private dateTimeService: DateTimeService;

    /** Сервис по работе с документами */
    @Inject
    private documentService: DocumentService;

    /** Сервис для работы с транзакциями */
    @Inject
    private transactionService: TransactionService;

    /** Сервис по работе с подписями */
    @Inject
    private signatureService: SignatureService;

    /**
     * Сохраняет и подписывает платеж в одной транзакции
     * @param {Document} document информация о платеже
     * @param {string} contentType тип контента документа
     * @param extContent дополнительная информация о документе
     * @return {Promise<[string, Status]>} идентификатор и статус подписанного платежа
     */
    async saveAndSignPayment(document: Document, contentType = ContentType.DOCUMENT, extContent?: DocumentExtContent): Promise<[string, Status]> {
        const timestamp = await this.dateTimeService.getDateTime();
        const signature = await this.signatureService.generateSignature(document, timestamp);
        const commandList: CommandRequest[] = [
            {
                id: "save",
                commandName: "SAVE_DOCUMENT",
                params: {
                    docType: DocumentType.PAYMENT,
                    id: document.id,
                    content: document.content,
                    contentType,
                    extContent
                }
            },
            {
                commandName: "SIGN_DOCUMENT",
                params: {
                    "docType": DocumentType.PAYMENT,
                    "id:resultRef": "save.id",
                    "signature": signature,
                    "timestamp": timestamp
                }
            }
        ];
        const responses = await this.transactionService.execute(commandList);
        const docId = responses[0].results.id;
        const documentStatus = Status.valueOf(responses[1].results.statusCode);
        return [docId, documentStatus];
    }

    /**
     * Подписывает платеж
     * @param {string} docId идентификатор платежа
     * @param {Document} document информация о платеже
     * @return {Promise<Status>} статус платежа после подписи
     */
    async signPayment(docId: string, document: Document): Promise<Status> {
        const timestamp = await this.dateTimeService.getDateTime();
        const signature = await this.signatureService.generateSignature(document, timestamp);
        return await this.documentService.sign(DocumentType.PAYMENT, docId, timestamp, signature);
    }

    /**
     * Подтверждает платеж. Возвращает {@code null} в случае, если пользователь отменил подтверждение платежа.
     * @param {string} docId идентификатор платежа
     * @param {DocumentContent} documentContent контент платежа для подтверждения
     * @return {Promise<Status>} статус платежа после подтверждения или null
     */
    async confirmPayment(docId: string, documentContent: DocumentContent): Promise<Status> {
        const validateResponse = await this.documentService.validateBeforeConfirm(DocumentType.PAYMENT, docId);
        if (validateResponse.status !== "OK" && !await new ContinueConfirmDialog().show(validateResponse.errorMessage)) {
            // Пользователь отменил подтверждение платежа
            return null;
        }

        const confirmCase = await this.documentService.getConfirmCase(DocumentType.PAYMENT, docId);
        if (confirmCase === ConfirmCase.TRANSFER_TO_READY) {
            // Подтверждаем платеж без токена
            const confirmResponse = await this.documentService.confirm(DocumentType.PAYMENT, docId, {confirmType: ConfirmType.NONE});
            return confirmResponse.status;
        }

        if (![ConfirmCase.REQUIRES_CONFIRMATION,
            ConfirmCase.ADD_TRUSTED_RECIPIENT_QUESTION,
            ConfirmCase.ACTIVATE_DELETED_TRUSTED_RECIPIENT_QUESTION].includes(confirmCase)) {
            throw new Error("Некорректное действие, необходимое для подтверждения платежа: " + confirmCase);
        }

        // Индивидуальный предприниматель не может работать с доверенными получателями, но может подтверждать документы
        const clientTokensResponse = await this.clientService.getClientTokens();
        const tokenList = clientTokensResponse.paymentTokenInfoList;
        if (!tokenList || tokenList.length === 0) {
            throw new Error("Вам не привязано ни одного средства подтверждения, для которого разрешена данная операция.");
        }

        const selectedToken = await TokenUtils.select(tokenList);
        if (!selectedToken) {
            // Пользователь нажал кнопку "Отмена" в диалоге выбора токена
            return null;
        }

        if (selectedToken.confirmType === ConfirmType.SMS) {
            // Подтверждаем платеж по SMS
            return await new SmsConfirmationDialog().show({docId: docId, content: documentContent});
        }
        if (selectedToken.confirmType === ConfirmType.OTP) {
            // Подтверждаем платеж при помощи OTP-токена
            return await new OtpConfirmationDialog().show({docId: docId, content: documentContent, token: selectedToken});
        }
        if (selectedToken.confirmType === ConfirmType.MAC) {
            // Подтверждаем платеж при помощи MAC-токена
            return await new MacConfirmationDialog().show({docId: docId, content: documentContent, token: selectedToken});
        }
        if (selectedToken.confirmType === ConfirmType.BIFIT_MAC) {
            // Подтверждаем платеж при помощи MAC-токена BIFIT
            const session = await BifitMacTokenHelper.getMacTokenSession();
            const connectedTokenSerials = await session.listKeystores(CryptoUtil.KeystoreTypes.BIFIT_MACTOKEN);
            const bifitMacToken = tokenList.find(token => {
                if (token.confirmType !== ConfirmType.BIFIT_MAC) {
                    return false;
                }
                if (token.serialIsMasked) {
                    throw new Error("Сервер вернул MAC-токен BIFIT с замаскированным серийным номером");
                }
                return !!connectedTokenSerials.find(connectedTokenSerial => connectedTokenSerial === token.serial);
            });
            if (!bifitMacToken) {
                throw new Error("MAC-токен BIFIT не обнаружен. Подключите устройство к компьютеру.");
            }
            await session.setKeystore(bifitMacToken.serial, CryptoUtil.KeystoreTypes.BIFIT_MACTOKEN, false);
            if (!await session.isPinSet() && !await new PinCodeDialog().show({sessionName: session.name, tokenId: session.getCurrentTokenId()})) {
                // Пользователь нажал кнопку "Отмена" в диалоге ввода PIN-кода от MAC-токена BIFIT
                return null;
            }
            return await new BifitMacConfirmationDialog().show({docId: docId, content: documentContent, token: bifitMacToken});
        }
        throw new Error(`Подтверждение при помощи токена ${selectedToken.confirmType} не реализовано`);
    }
}
