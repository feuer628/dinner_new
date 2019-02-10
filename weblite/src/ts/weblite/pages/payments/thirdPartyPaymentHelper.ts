import {CommonUtils} from "platform/utils/commonUtils";
import {Account} from "../../model/account";
import {ClientInfo} from "../../model/clientInfo";
import {ClientType} from "../../model/clientType";
import {DocumentContent} from "../../model/document";
import {PaymentHelper} from "./paymentHelper";

/** Шаблон проверки наличия кода валютной операции */
const VO_CODE_PATTERN = new RegExp("^\\{VO.{5}\\}");
/** Длина кода валютной операции */
const VO_CODE_LENGTH = 9;
/** Разделитель блоков с информацией о клиенте в назначении платежа при платеже за третье лицо */
const SEPARATOR = "//";
// Статусы составителя физического лица
const CHARGE_CREATOR_FOR_PHYSICS = ["09", "10", "11", "12", "13", "24"];

/**
 * Утилитный класс для работы с функционалом "Реквизиты третьего лица"
 */
export class ThirdPartyPaymentHelper {

    /** Helper */
    private helper: PaymentHelper = null;

    /**
     * Конструктор
     * @param {ClientInfo} clientInfo информация о клиенте
     */
    constructor(private clientInfo: ClientInfo) {
        this.helper = new PaymentHelper(this.clientInfo);
    }

    /**
     * Подготавливает панель "Реквизиты третьего лица". Вызывается при создании/копировании/редактировании документа
     * @param content контент документа
     * @param account выбранный счет
     */
    prepareThirdPartyPanel(content: DocumentContent, account: Account): void {
        if (content.IS_TAX_FOR_THIRD_PARTY === "0") {
            return;
        }

        const chargeCreator = content.CHARGE_CREATOR as string;
        if ((content.PAYER_INN as string) === "0" && chargeCreator === "13") {
            content.PAYER_INN = "";
        }
        this.updateThirdPartyPaymentDetails(content);
        this.updateThirdPartyKpp(content);
        this.processThirdPartyPayerName(content, account);
    }

    /**
     * Выполняет действия при включении признака "Платеж за третье лицо"
     * @param content контент документа
     * @param account выбранный счет
     */
    enableAndFillThirdPartyPanel(content: DocumentContent, account: Account): void {
        // В назначение платежа добавляется подстрока с ИНН клиента, КПП клиента (при необходимости) и пустым местом для Наименования/ФИО 3-го лица;
        let resultDetails = "";
        let paymentDetails = content.PAYMENT_DETAILS as string;
        if (VO_CODE_PATTERN.test(paymentDetails as string)) {
            resultDetails = paymentDetails.substring(0, VO_CODE_LENGTH);
            paymentDetails = paymentDetails.substring(VO_CODE_LENGTH);
        }
        resultDetails += this.getClientInfoString() + SEPARATOR + paymentDetails;
        content.PAYMENT_DETAILS = resultDetails;
        this.processThirdPartyPayerName(content, account);
        this.updateThirdPartyKpp(content);
    }

    /**
     * Возвращает строку с информацией о клиенте.
     * Для юридических лиц и банков-корреспондентов: <ИНН клиента>//<КПП клиента>//
     * Для ИП, нотариусов, адвокатов, КФХ: <ИНН клиента>//
     * @param payerKppString КПП
     * @return строка с информацией о клиенте
     */
    getClientInfoString(payerKppString?: string): string {
        const clientType = ClientType.valueOf(this.clientInfo.clientInfo.type);
        const inn = this.clientInfo.clientInfo.inn;
        let payerKpp = payerKppString;
        if (clientType === ClientType.CORPORATE || clientType === ClientType.BANK_CORR) {
            if (!payerKpp) {
                const kpps: string[] = this.helper.getClientKpps();
                payerKpp = kpps.length ? kpps[0] : "";
            }
            return inn + SEPARATOR + payerKpp + SEPARATOR;
        } else {
            return inn + SEPARATOR;
        }
    }

    /**
     * Обновляет поле PAYMENT_DETAILS в зависимости от значений в полях панели "Реквизиты третьего лица"
     * @param content контент документа
     * @param thirdPartyPayerName имя плательщика - третьего лица
     */
    updateThirdPartyPaymentDetails(content: DocumentContent, thirdPartyPayerName?: string): void {
        let voCodeDetails = "";
        let paymentDetails = content.PAYMENT_DETAILS as string;
        if (VO_CODE_PATTERN.test(paymentDetails)) {
            voCodeDetails = paymentDetails.substring(0, VO_CODE_LENGTH);
            paymentDetails = paymentDetails.substring(VO_CODE_LENGTH);
        }

        let payerKpp = "";
        const chargeCreator = content.CHARGE_CREATOR as string;

        const thirdPartyName = CommonUtils.exists(thirdPartyPayerName) ? thirdPartyPayerName :
            this.getThirdPartyNameFromDetails(content.PAYMENT_DETAILS as string, chargeCreator);
        if (thirdPartyName !== null) {
            paymentDetails = paymentDetails.substring(paymentDetails.indexOf(SEPARATOR) + SEPARATOR.length);
            const clientType = ClientType.valueOf(this.clientInfo.clientInfo.type);
            if (clientType === ClientType.CORPORATE || clientType === ClientType.BANK_CORR) {
                const separatorIndex = paymentDetails.indexOf(SEPARATOR);
                payerKpp = paymentDetails.substring(0, separatorIndex);
                paymentDetails = paymentDetails.substring(separatorIndex + SEPARATOR.length);
            }
            paymentDetails = paymentDetails.substring(paymentDetails.indexOf(SEPARATOR) + SEPARATOR.length);
        }
        let thirdPartyDetails = "";
        if ((content.IS_TAX_FOR_THIRD_PARTY as string) === "1") {
            thirdPartyDetails = this.getClientInfoString(payerKpp) + (thirdPartyName || "") +
                this.getThirdPartyNamePostfix(chargeCreator) + SEPARATOR;
        }
        content.PAYMENT_DETAILS = voCodeDetails + thirdPartyDetails + paymentDetails;
    }

    /**
     * Возвращает наименование 3-го лица из назначение платежа
     * @param paymentDetails назначение платежа
     * @param chargeCreator  статус составителя
     * @return наименование 3-го лица, либо {@code null}, если в назначении платежа отсутствует корректная подстрока со сведениями о
     *          платеже за третье лицо
     */
    getThirdPartyNameFromDetails(paymentDetails: string, chargeCreator: string): string {
        if (CommonUtils.isBlank(paymentDetails)) {
            return null;
        }

        let thirdPartyName = paymentDetails;
        // Если присутствует код валютной операции, отрежем его
        if (thirdPartyName.startsWith("{VO")) {
            if (!VO_CODE_PATTERN.test(thirdPartyName)) {
                return null;
            }
            thirdPartyName = thirdPartyName.substring(VO_CODE_LENGTH);
        }

        if (!thirdPartyName.includes(SEPARATOR)) {
            return null;
        }
        thirdPartyName = thirdPartyName.substring(thirdPartyName.indexOf(SEPARATOR) + SEPARATOR.length);

        const clientType = ClientType.valueOf(this.clientInfo.clientInfo.type);
        if (clientType === ClientType.CORPORATE || clientType === ClientType.BANK_CORR) {
            if (!thirdPartyName.includes(SEPARATOR)) {
                return null;
            }
            thirdPartyName = thirdPartyName.substring(thirdPartyName.indexOf(SEPARATOR) + SEPARATOR.length);
        }

        if (!thirdPartyName.includes(SEPARATOR)) {
            return null;
        }
        thirdPartyName = thirdPartyName.substring(0, thirdPartyName.indexOf(SEPARATOR));

        const postfix: any = this.getThirdPartyNamePostfix(chargeCreator);
        if (postfix) {
            const postfixIndex: any = thirdPartyName.indexOf(postfix);
            if (postfixIndex !== -1) {
                thirdPartyName = thirdPartyName.substring(0, postfixIndex);
            }
        }
        return thirdPartyName;
    }

    /**
     * Устанавливает название плательщика с постфиксами в случае, если платеж за третье лицо
     * @param content контент документа
     * @param account выбранный счет
     */
    processThirdPartyPayerName(content: DocumentContent, account: Account): void {
        const lastName = this.clientInfo.clientInfo.lastName;
        const firstName = this.clientInfo.clientInfo.firstName;
        let clientName = "";
        if (lastName || firstName) {
            if (lastName) {
                clientName = lastName;
            }
            if (firstName) {
                clientName += " " + firstName;
            }
            const middleName = this.clientInfo.clientInfo.middleName;
            if (middleName) {
                clientName += " " + middleName;
            }
            clientName = clientName.trim();
        } else {
            clientName = this.clientInfo.clientInfo.name;
        }

        const clientType = ClientType.valueOf(this.clientInfo.clientInfo.type);
        let postfix = "";
        switch (clientType) {
            case ClientType.INDIVIDUAL:
                postfix = " (ИП)";
                break;
            case ClientType.NOTARY:
                postfix = " (нотариус)";
                break;
            case ClientType.LAWYER:
                postfix = " (адвокат)";
                break;
            case ClientType.FARM:
                postfix = " (КФХ)";
                break;
        }
        clientName += postfix;

        // если счет был Д.У., надо выставить постфикс
        const trustAccountComment = this.helper.getTrustAccountComment(content.PAYER_ACCOUNT as string, account);
        if (trustAccountComment) {
            clientName += trustAccountComment;
        }

        // Если сконструированная строка для поля "Плательщик" превышает его размер, значит в нем или присутствует
        // комментарий к счету Д.У., или связка ФИО + постфикс слишком длинная (или возможно обе эти причины)
        if (clientName.length > 160) {
            // если комментарий к счету Д.У. существует, то пытаемся поместиться в 160 символов удалив его из наименования
            if (trustAccountComment) {
                clientName.replace(trustAccountComment, "");
            }
            // если наименование все равно слишком длинное, то обрезаем его до 160 символов и на этапе проверок получаем исключение
            if (clientName.length > 160) {
                clientName = clientName.substring(0, 160);
            }
        }
        content.PAYER_NAME = clientName;
    }

    /**
     * Обновляет поле КПП при изменении статуса составителя
     * @param content контент документа
     */
    updateThirdPartyKpp(content: DocumentContent): void {
        // выбранное значение "Статуса составителя"
        if (this.isChargeForPhysics(content.CHARGE_CREATOR as string)) {
            content.KPP = "0";
        }
        // для 8 статуса составителя при вводе ИНН физического лица в поле КПП подставим 0
        if (content.CHARGE_CREATOR === "08" && content.PAYER_INN && content.PAYER_INN.length === 12) {
            content.KPP = "0";
        }
    }

    /**
     * Проверяет относится ли статус составителя к физическим лицам
     * @param chargeCreator статус составителя
     */
    isChargeForPhysics(chargeCreator: string): boolean {
        return CHARGE_CREATOR_FOR_PHYSICS.includes(chargeCreator);
    }

    /**
     * Возвращает постфикс наименования третьего лица в зависимости от статуса составителя
     * @param chargeCreator статус составителя
     * @return постфикс наименования третьего лица в зависимости от статуса составителя
     */
    private getThirdPartyNamePostfix(chargeCreator: string): string {
        switch (chargeCreator) {
            case "09":
                return " (ИП)";
            case "10":
                return " (нотариус)";
            case "11":
                return " (адвокат)";
            case "12":
                return " (КФХ)";
            default:
                return "";
        }
    }

    /**
     * Обновляет поле ИНН при изменении статуса составителя
     * @param content контент документа
     */
    private updateThirdPartyInn(content: DocumentContent): void {
        if (["13", "24"].includes(content.CHARGE_CREATOR as string) && CommonUtils.isBlank(content.PAYER_INN as string)) {
            content.PAYER_INN = "0";
        }
    }
}