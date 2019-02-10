import {Inject} from "platform/ioc";
import {CommonUtils} from "platform/utils/commonUtils";
import {ErrorBag} from "vee-validate";
import {SendConfirmDialog} from "../../components/dialogs/sendConfirmDialog";
import {Account} from "../../model/account";
import {BtnReturn} from "../../model/btnReturn";
import {ClientInfo} from "../../model/clientInfo";
import {Document, DocumentContent} from "../../model/document";
import {BankData} from "../../service/bankService";
import {ReferenceService} from "../../service/referenceService";
import {AccountUtils} from "../../utils/accountUtils";
import {PaymentHelper} from "./paymentHelper";

/** Список ошибок проверки состояния банка */
// tslint:disable
const BANK_STATE_ERRORS: { [key: string]: string } = {
    "1": "У банка получателя отозвана лицензия.",
    "2": "В банке получателе введено конкурсное управление.",
    "3": "Корреспондентский счет банка получателя закрывается."
};
// tslint:enable
/**
 * Валидатор платежного поручения
 */
export class PaymentValidator {

    /** Helper */
    private helper: PaymentHelper;
    /** Сервис для работы со справочниками */
    @Inject
    private referenceService: ReferenceService;

    /**
     * Конструктор
     * @param {ClientInfo} clientInfo информация о клиенте
     * @param {"vee-validate".ErrorBag} $errors набор ошибок валидации
     */
    constructor(private clientInfo: ClientInfo, private $errors: ErrorBag) {
        this.helper = new PaymentHelper(this.clientInfo);
    }

    /**
     * Выполняет действия перед сохранением документа.
     * Проверяется правильность заполнения:
     * <ul>
     *      <li>НДС</li>
     *      <li>очередность платежа</li>
     *      <li>счет получателя</li>
     *      <li>счет плательщика</li>
     *      <li>КБК</li>
     *      <li>поля Плательщик</li>
     * </ul>
     * В процессе проверки может вызывать модальные окна с ожиданием действия от пользователя.
     * @param document проверяемый документ
     * @param selectedAccount выбранный счет списания
     * @returns Если все проверки пройдены и пользователь подтвердил все предупреждения возвращает результат валидации или
     * если пользователь не согласился хотя бы с одним предупреждением вернется {@code false}
     */
    async checkDocument(document: Document, selectedAccount: Account): Promise<boolean> {
        const content = document.content;
        const isBudget = this.helper.isBudget(content);
        if (selectedAccount.budget) {
            throw new Error("Счет списания входит в бюджет. Чтобы совершить платеж перейдите в Интернет-банк для корпоративных клиентов");
        }
        if (document.attachmentsCount) {
            throw new Error("Документ содержит вложения. Чтобы совершить платеж перейдите в Интернет-банк для корпоративных клиентов");
        }
        // Проверяем статус банка получателя
        let isValid = await this.checkBankState(content.RCPT_BANK_BIC as string);
        // Проверка на указание информации об НДС в Назначении платежа
        if (isValid) {
            isValid = await this.validateNdsInfo(content);
        }
        // Проверка корректности заполнения очередности платежа
        if (isValid) {
            isValid = await this.validateQueue(content);
        }
        // проверка счета получателя
        if (isValid) {
            isValid = await this.validateRcptAccount(document);
        }
        // проверка счета плательщика
        if (isValid) {
            // Для расчетного Д.У. счета плательщика в поле "Плательщик" должен быть указан комментарий к этому счету.
            this.processTrustAccountInfo(content, selectedAccount);
        }
        // проверка на не используемый номер КБК
        if (isValid && isBudget) {
            isValid = await this.validateKbk(content);
        }

        if (isValid) {
            const payerName = await this.helper.getPayerNameWithAddress(document);
            if (payerName === null) {
                isValid = false;
            } else {
                content.PAYER_NAME = payerName;
            }
        }
        return isValid;
    }

    /**
     * Проверяет ключевание счета получателя
     */
    checkRcptAccountKey(content: DocumentContent): boolean {
        const rcptBankBic = <string> content.RCPT_BANK_BIC;
        const rcptAccount = <string> content.RCPT_ACCOUNT;
        const rcptBankAccount = <string> content.RCPT_BANK_ACC;
        if (rcptBankBic.length === 9 && rcptAccount.length === 20) {
            return AccountUtils.checkCbit(rcptAccount, rcptBankAccount, rcptBankBic);
        }
        return true;
    }

    /**
     * Проверяет ключевание счета получателя и проставляет ошибку к полю при неуспешной валидации
     * @param content контент документа
     */
    checkRcptAccountKeyAndPutError(content: DocumentContent): void {
        const result = this.checkRcptAccountKey(content);
        this.$errors.remove("RCPT_ACCOUNT");
        if (!result) {
            this.$errors.add({field: "RCPT_ACCOUNT", msg: "Ошибка ключевания счета"});
        }
    }

    /**
     * Проверяет статус банка по БИКу и выводит сообщение с предупреждением
     * @param {string} bic     БИК для проверки
     * @return {Promise<boolean>} {@code true}, если банк без ограничений или клиент согласился с предупреждением, иначе {@code false}
     */
    private async checkBankState(bic: string): Promise<boolean> {
        const bankData = await this.referenceService.getTopic<BankData>("russian_swift", bic);
        if (!bankData) {
            // если нет информации по банку
            return true;
        }
        const stateCode = bankData.state;
        if (stateCode === "0") {
            return true;
        }
        const errorMsg = BANK_STATE_ERRORS[stateCode];
        if (!errorMsg) {
            return true;
        }
        const result = await new SendConfirmDialog().show(errorMsg);
        return result === BtnReturn.YES;
    }

    /**
     * Проверяет КБК на не используемые значения
     * @param kbk КБК
     * @return {Promise<string>} сообщение о не используемом КБК если он найден в справочнике, иначе {@code null}
     */
    private async checkUnusedKbk(kbk: string): Promise<string> {
        const kbkRef = await this.referenceService.getReference<KbkRefItem>("kbk_unused");
        let message: string = null;
        for (const kbkItem of kbkRef) {
            if (kbkItem.kbk === kbk) {
                message = kbkItem.message_ru;
                break;
            }
        }
        return message;
    }

    /**
     * Проверяет номер КБК по справочнику не активных.
     * Если значение клиентского свойства DOCUMENTS.PAYMENT.ENABLE_BUDGET_CONTROL равно false
     * отображает диалог подтверждения, иначе выкидывает исключение
     * @param content контент документа
     * @return {Promise<boolean>}
     */
    private async validateKbk(content: DocumentContent): Promise<boolean> {
        const message = await this.checkUnusedKbk(<string> content.CHARGE_KBK);
        if (message) {
            // если не включена проверка контроля бюджетных полей, то просто выводим предупреждение
            if (this.clientInfo.clientProperties["DOCUMENTS.PAYMENT.ENABLE_BUDGET_CONTROL"] === "false") {
                // отображение диалога с текстом предупреждения о не активном КБК
                return await new SendConfirmDialog().show(message) === BtnReturn.YES;
            }
            this.$errors.add({field: "CHARGE_KBK", msg: "Некорректное значение в поле \"КБК\". " + message});
            return false;
        }
        return true;
    }

    /**
     * Проверяет заполненность поля Счет получателя с учетом значения клиентского свойства.
     * Если значение свойства заполнено и "error" - будет отображено сообщение с ошибкой
     * Иначе будет отображено сообщение с текстом из свойства.
     * При пустом счете и свойстве вернет {@code false}
     * @param document документ
     * @return {Promise<void>}
     */
    private async validateRcptAccount(document: Document): Promise<boolean> {
        const m = document.meta;
        const content = document.content;
        const wrn = this.clientInfo.clientProperties["DOCUMENTS.PAYMENT.WARNNULLRCPTACC"];
        if (CommonUtils.isBlank(<string> content.RCPT_ACCOUNT)) {
            if (!CommonUtils.isBlank(wrn)) {
                if ("error" === wrn) {
                    this.$errors.add({field: "RCPT_ACCOUNT", msg: "Не заполнено поле " + m.fieldsMap.RCPT_ACCOUNT.description});
                    return false;
                }
                // отображение диалога с текстом предупреждения, в случае отсутствия счета получателя в платежном поручении
                return await new SendConfirmDialog().show(wrn) === BtnReturn.YES;
            }
            // счет не заполнен, свойство тоже, отображаем ошибку
            this.$errors.add({field: "RCPT_ACCOUNT", msg: "Не заполнено поле"});
            return false;
        }
        const result = AccountUtils.checkCbit(<string> content.RCPT_ACCOUNT, <string> content.RCPT_BANK_ACC, <string> content.RCPT_BANK_BIC);
        if (!result) {
            this.$errors.add({field: "RCPT_ACCOUNT", msg: "Ошибка ключевания счета"});
            return false;
        }
        return true;
    }

    /**
     * Проверяет очередность платежа.
     * @param content контент документа
     * @return {@code true), если по результатам проверок документ следует сохранить,
     *         {@code false} в обратном случае
     * @throws второй способ информирования о том, что документ не нужно сохранять
     */
    private async validateQueue(content: DocumentContent): Promise<boolean> {
        let result = true;
        // условие "Бюджетный платеж"
        const isCharge = (<string> content.IS_CHARGE) === "1";
        // выбранное значение очередности платежа
        const selectedQueue = <string> content.QUEUE;
        const accountNumber = <string> content.RCPT_ACCOUNT;
        if (!CommonUtils.isBlank(accountNumber) && accountNumber.length !== 20) {
            this.$errors.add({field: "RCPT_ACCOUNT", msg: "Неверно заполнено поле"});
            return false;
        }
        const accountQueueAndCharge = await this.helper.getAccountQueueChargeAndGisgmp(accountNumber, <string> content.RCPT_BANK_BIC);
        // Найдена ли маска для счета получателя в справочнике rcpt_charge_accounts
        if (accountQueueAndCharge === null) {
            if (isCharge) {
                // проверяем свойство на отключение проверки маски счета получателя
                if (this.clientInfo.clientProperties["DOCUMENTS.PAYMENT.CHECK_CHARGE_ACC"] !== "false") {
                    if (CommonUtils.isBlank(accountNumber)) {
                        this.$errors.add({field: "RCPT_ACCOUNT", msg: "Поле обязательно для заполнения"});
                        return false;
                    }
                    const accountNumberPart = [accountNumber.substring(0, 5)];
                    this.$errors.add({field: "RCPT_ACCOUNT", msg: `Счет ${accountNumberPart} не является бюджетным`});
                    return false;
                } else {
                    let queueProp = this.clientInfo.clientProperties["DOCUMENTS.PAYMENT.WRONG_BUDGET_QUEUE"];
                    if (!CommonUtils.isBlank(queueProp) && selectedQueue !== "5") {
                        queueProp = CommonUtils.newLine(queueProp);
                        // отображаем диалог с предупреждением о том что очередность бюджетного платежа отлична от 5
                        result = await new SendConfirmDialog().show(queueProp) === BtnReturn.YES;
                    }
                }
            }
        } else {
            if (isCharge) {
                const queueList: string[] = accountQueueAndCharge.queue;
                if (queueList.length !== 0) {
                    this.checkQueueInQueueList(queueList, selectedQueue);
                } else {
                    const accountNumberPart = [accountNumber.substring(0, 5)];
                    this.$errors.add({
                        field: "RCPT_ACCOUNT", msg:
                            `Для счета ${accountNumberPart} не заданы допустимые значения очередности. Обратитесь в банк`
                    });
                    return false;
                }
            } else {
                if (accountQueueAndCharge.charge_only === "1") {
                    this.$errors.add({field: "RCPT_ACCOUNT", msg: "Платеж является бюджетным. Необходимо заполнить бюджетные поля."});
                    return false;
                }
            }
        }
        return result;
    }

    /**
     * Проверяет наличие НДС в поле "Назначение"
     * @param content контент документа
     * @returns true если НДС указан или отображает диалог с согласием в зависимости от свойства DOCUMENTS.PAYMENT.CHECK_NDS
     */
    private async validateNdsInfo(content: DocumentContent): Promise<boolean> {
        const result = (<string> content.PAYMENT_DETAILS).indexOf("НДС") !== -1;
        const checkNds = this.clientInfo.clientProperties["DOCUMENTS.PAYMENT.CHECK_NDS"];
        if (!(checkNds === "none" || result)) {
            const msg = "В поле \"Назначение платежа\" не указан НДС";
            let errorCase = false;
            if (checkNds === "error") {
                // Проверяется условие:
                // платеж - бюджетный, отсутствует упоминание об НДС (проверено выше) и очередность платежа равна "5"
                if (this.helper.isBudget && "5" === (<string> content.QUEUE)) {
                    errorCase = true;
                }
            }
            if (checkNds !== "error" || errorCase === true) {
                // отображаем диалог с предупреждением о том что не указан НДС в назначении платежа
                return await new SendConfirmDialog().show(msg) === BtnReturn.YES;
            }
        }
        // если по свойству указание НДС обязательно и оно не указано, отображаем ошибку к полю
        if (checkNds !== "none" && !result) {
            this.$errors.add({field: "PAYMENT_DETAILS", msg: `В поле "Назначение платежа" не указан НДС`});
            return false;
        }
        return true;
    }

    /**
     * Проверяет счет плательщика, если он имеет тип Расчетный Д.У., добавляет к полю "Плательщик" комментарий к счету
     * @param content контент документа
     * @param selectedAccount выбранный счет списания
     */
    private processTrustAccountInfo(content: DocumentContent, selectedAccount: Account): void {
        const trustAccountComment = this.helper.getTrustAccountComment(<string> content.PAYER_ACCOUNT, selectedAccount);
        if (trustAccountComment !== null) {
            // При бюджетном платеже, если определенные статусы составителя
            // то комментарий к счету "Расчетный Д.У." не добавляем в поле "Плательщик" (см. баг 53001)
            if (!(this.helper.isBudget(content) && ["03", "05", "18", "20", "22", "25", "26"].indexOf(<string> content.CHARGE_CREATOR) !== -1)) {
                const payer = <string> content.PAYER_NAME;
                if (payer.indexOf(trustAccountComment) === -1) {
                    // комментария в поле нет, возможны два варианта
                    if ((payer + trustAccountComment).length <= 160) {
                        content.PAYER_NAME = payer + trustAccountComment;
                    } else {
                        throw new Error("Невозможно добавить в поле \"Плательщик\" комментарий " +
                            "к счету Д.У. Комментарий слишком длинный. Обратитесь в Банк.");
                    }
                }
            }
        }
    }

    /**
     * Проверяет что заданная очередность "queue" присутствует в списке очередностей "queue-list".
     * @param queueList список допустимых очередностей
     * @param queue проверяемая очередность
     * @throws кидается сообщение, если очередность не входит в список допустимых очередностей
     */
    private checkQueueInQueueList(queueList: string[], queue: string): void {
        if (queueList.indexOf(queue) !== -1) {
            return;
        }
        let msg = "Очередность платежа должна равняться ";
        if (queueList.length !== 1) {
            msg = msg + "одному из значений: ";
        }
        for (const q of queueList) {
            msg = msg + "\"" + q + "\", ";
        }
        // удалим последнюю запятую с пробелом
        throw new Error(msg.substring(0, msg.length - 2));
    }
}

/**
 * Описание кода КБК
 */
export type KbkRefItem = {
    /** Идентификатор записи */
    id: string,
    /** КБК */
    kbk: string,
    /** Сообщение на русском */
    message_ru: string,
    /** Сообщение на английском */
    message_en: string
};
