import {Inject} from "platform/ioc";
import {Cache, CacheKey} from "platform/services/cache";
import {FormatterFactory} from "platform/ui/formatters/formatterFactory";
import {CommonUtils} from "platform/utils/commonUtils";
import {PayerAddressDialog} from "../../components/dialogs/payment/payerAddressDialog";
import {Account} from "../../model/account";
import {ChargeCreatorStatuses} from "../../model/chargeCreatorStatuses";
import {ClientInfo} from "../../model/clientInfo";
import {ClientType} from "../../model/clientType";
import {Document, DocumentContent, DocumentMeta} from "../../model/document";
import {FormPaymentType} from "../../model/formPaymentType";
import {NdsValue} from "../../model/ndsValue";
import {ReferenceService} from "../../service/referenceService";

/**
 * Утилитный класс для работы с документом Платежное поручение
 */
export class PaymentHelper {

    /** Сообщение, что документ не облагается НДС, в назначении платежа (не локализуется) */
    static NONE_NDS_MSG = "НДС не облагается";
    /** Максимальная длина поля наименования плательщика 160 за вычетом четырех разделителей. TODO инициализировать значение по мете */
    static PAYER_NAME_MAX_LENGTH = 156;
    /** Месяцы */
    static MONTHS = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    /** Список годов. 5 лет, один будущий, текущий и 3 предыдущих */
    static YEARS = [1, 0, -1, -2, -3].map(shift => String(new Date().getFullYear() + shift));
    /** Шаблон поиска символов, разделяющих маски счетов */
    private static readonly ACC_MASK_SEPARATOR_REGEXP = /[,\s]+/g;
    /** Шаблон поиска вхождений в строке символа звездочки */
    private static readonly ASTERISK_REGEXP = /\*/g;
    /** Шаблон поиска адреса в строке. (Пример: //ул. Ленина, д. 3// ) */
    private static readonly ADDRESS_REGEXP = /\/\/.*\/\//g;
    /** Сервис для работы с кэшем */
    @Inject
    private cache: Cache;
    /** Сервис для работы со справочниками */
    @Inject
    private referenceService: ReferenceService;

    /**
     * Конструктор
     * @param {ClientInfo} clientInfo информация о клиенте
     */
    constructor(private clientInfo: ClientInfo) {
    }

    /**
     * Определяет тип формы платежного поручения по контенту документа
     * @param {DocumentContent} content контент документа
     * @return {FormPaymentType} тип формы платежного поручения
     */
    getFormPaymentType(content: DocumentContent): FormPaymentType {
        const isBudget = content.IS_CHARGE === "1";
        const chargeKbk = <string> content.CHARGE_KBK;
        const chargeCreator = ChargeCreatorStatuses.findStatus(content.CHARGE_CREATOR as string);
        if (!isBudget) {
            return FormPaymentType.COUNTERPARTY;
        }
        // КБК начинается с цифр 182 или статус составителя относится к данному типу - платеж в Налоговую
        if (isBudget && (chargeKbk.startsWith("182") ||
                ChargeCreatorStatuses.getByFormType(FormPaymentType.TAX, ClientType.valueOf(this.clientInfo.clientInfo.type)).includes(chargeCreator))) {
            return FormPaymentType.TAX;
        }
        // КБК начинается с цифр 153 или статус составителя относится к данному типу - платеж в Таможню
        if (isBudget && (chargeKbk.startsWith("153") ||
                ChargeCreatorStatuses.getByFormType(FormPaymentType.CUSTOMS, ClientType.valueOf(this.clientInfo.clientInfo.type)).includes(chargeCreator))) {
            return FormPaymentType.CUSTOMS;
        }
        // КБК 0 или не начинается с 183 или 153 или статус составителя прочих бюджетных платежей - прочие бюджетные платежи
        if (isBudget && (chargeKbk === "0" ||
                ChargeCreatorStatuses.getByFormType(FormPaymentType.BUDGET, ClientType.valueOf(this.clientInfo.clientInfo.type)).includes(chargeCreator)
                || (!chargeKbk.startsWith("182") && !chargeKbk.startsWith("153")))) {
            return FormPaymentType.BUDGET;
        }
        return FormPaymentType.COUNTERPARTY;
    }

    /**
     * Возвращает строку с выбранными и рассчитанным типом НДС
     * @param {string} selectedNds выбранное значение НДС
     * @param {string} sum сумма документа
     * @return {string} строка с рассчитанным значением НДС
     */
    getFormattedNds(selectedNds: string, sum: string): string {
        let formattedNds = PaymentHelper.NONE_NDS_MSG;
        if (selectedNds !== NdsValue.NO_NDS) {
            if (!CommonUtils.isBlank(sum)) {
                const percentAsStr = selectedNds.substring(0, selectedNds.length - 1);
                const amount = new BigDecimal(sum);
                const intOrFloat = percentAsStr.match(/\./) ? percentAsStr : percentAsStr + ".00";
                const percent = new BigDecimal(intOrFloat).multiply(new BigDecimal("0.01"));
                const nds = FormatterFactory.getFormatter({type: "amount", rule: "%1.2d;19"})
                    .formatAmount(String(amount.subtract(amount.divide(percent.add(new BigDecimal(1)), BigDecimal.ROUND_HALF_EVEN))));
                formattedNds = `в т.ч. НДС ${percentAsStr}% - ${nds}`;
            } else {
                formattedNds = "";
            }
        }
        return formattedNds;
    }

    /**
     * Формирует строку с комментарием к расчетному Д.У. счету для подстановки в поле "PAYER_NAME"
     * @param accNumber номер счета плательщика
     * @param account текущий выбранный счет
     * @return Комментарий для подстановки в поле PAYER_NAME или null, если тип счета отличается от "Расчетный Д.У."
     */
    getTrustAccountComment(accNumber: string, account: Account): string {
        if (CommonUtils.isBlank(accNumber) || !account) {
            return null;
        }
        if (account.type !== "SETTLEMENT_DU") {
            return null;
        }
        let res = " Д.У.";
        const comments = account.comments;
        if (!CommonUtils.isBlank(comments)) {
            res = res + " " + comments.trim();
        }
        return res;
    }

    /**
     * Формирует строку для подстановки в поле "PAYER_NAME" по одному из шаблонов:
     * 1. "ФИО клиента" + при необходимости комментарий к расчетному Д.У. счету + "постфикс",
     * 2. "наименование клиента" с уже добавленным комментарием к расчетному Д.У. счету + "постфикс",
     * если он не содержится в наименовании клиента - если у клиента отсутствуют фамилия и имя
     * @param name наименование клиента с уже добавленным комментарием к расчетному Д.У. счету
     * @param trustAccountComment строка с комментарием к расчетному Д.У. счету
     * @param postfix постфикс
     * @return строка для подстановки в поле "PAYER_NAME"
     */
    getClientName(name: string, trustAccountComment: string, postfix: string): string {
        const lastName = this.clientInfo.clientInfo.lastName;
        const firstName = this.clientInfo.clientInfo.firstName;
        let res = null;
        // если у клиента отсутствуют фамилия и имя, то строку формируем из наименования
        if (CommonUtils.isBlank(lastName) && CommonUtils.isBlank(firstName)) {
            res = this.getClientNameWithPostfix(name, postfix);
        } else {
            let resultName = "";
            const partNameList = [lastName, firstName, this.clientInfo.clientInfo.middleName];
            for (const partName of partNameList) {
                if (!CommonUtils.isBlank(partName)) {
                    resultName = resultName + " " + partName;
                }
            }
            resultName = resultName.trim();
            if (trustAccountComment !== null) {
                resultName = resultName + trustAccountComment;
            }
            res = resultName + postfix;
        }
        return res;
    }

    /**
     * Возвращает адрес плательщика из строки с именем
     * @param {string} payerName строка с именем плательщика
     * @return {string}
     */
    getAddressFrom(payerName: string): string {
        const matcher = RegExp(".*//(.*)//$").exec(payerName);
        return matcher ? matcher[0] : null;
    }

    /**
     * Возвращает признак редактирования поля КПП плательщика
     * @param isBudget является ли платеж бюджетным
     * @return {boolean} {@code true} если системное свойство "DOCUMENTS.CLN_KPP.CAN_EDIT" в true
     * или плательщик является Банком-корреспондентом и платеж бюджетный
     */
    isKppEditable(isBudget: boolean): boolean {
        // клиент является банком-корреспондентом и платеж бюджетный или
        // системное свойство позволяет явно редактировать КПП
        return ClientType.BANK_CORR === ClientType.valueOf(this.clientInfo.clientInfo.type) && isBudget ||
            this.clientInfo.clientProperties["DOCUMENTS.CLN_KPP.CAN_EDIT"] === "true";
    }

    /**
     * Возвращает 'уровень' бюджетности счета
     * @param account счет
     * @param bic БИК
     * @return 'уровень' бюджетности счета:
     * 0 - счет не бюджетный
     * 1 - счет допускает совершение только бюджетных операций
     * 2 - счет считается по умолчанию бюджетным, но допускает совершение обычных платежей
     */
    async getAccountBudgetLevel(account: string, bic: string): Promise<number> {
        const accountQueueAndCharge = await this.getAccountQueueChargeAndGisgmp(account, bic);
        if (accountQueueAndCharge !== null) {
            if (accountQueueAndCharge.charge_only === "1") {
                return 1;
            } else {
                return 2;
            }
        }
        return 0;
    }

    /**
     * Возвращает по заданному счету "account" и БИКу "bic" запись в справочнике rcpt_charge_account с подходящими масками.
     * Нужно найти запись с самыми длинными подходящими масками.
     * Пример: счет начинается с "40102...", есть маски счета "401" и "40102" - выбираем "40102".
     *         БИК заканчивается на "...219", есть маски БИК "*********", "********9" и "*******19" - выбираем "*******19"
     *
     * Если номеру счета + БИК соответствует несколько записей с масками, то выбор записи выполняется по
     * следующим правилам в порядке уменьшения приоритета:
     * 1. Выбирается запись с маской счета наибольшей длины;
     * 2. Выбирается запись с маской БИК, которая содержит большее количество цифр;
     * 3. Выбирается первая запись;
     * @param accountNumber счет или первые цифры счета для которого ищется запись
     * @param bic     БИК банка заданного счета
     * @return Объект с данными, "queue": список (вектор строк) очередностей платежа,
     * "charge_only": признак бюджетности счета (строковое значение);
     * "gisgmp": Признак счета ГИС ГМП (0 - false, 1- true)
     * null, если счет не удовлетворяет ни одной маске в справочнике.
     */
    async getAccountQueueChargeAndGisgmp(accountNumber: string, bic: string): Promise<AccountMask> {
        const sortedRcptChargeAccountsList = await this.getSortedRcptChargeAccountsList();
        let neededItem = null;
        for (let i = 0; ((i < sortedRcptChargeAccountsList.length) && (neededItem === null)); i = (i + 1)) {
            const currentItem = sortedRcptChargeAccountsList[i];
            const accMask = currentItem.acc_mask.replace(PaymentHelper.ASTERISK_REGEXP, "\\d") + "\\d*";
            const bicMask = currentItem.bic_mask.replace(PaymentHelper.ASTERISK_REGEXP, "\\d") + "\\d*";
            // Если маска счета и маска БИКа подходят - завершаем на этом поиск и берем текущую запись
            if (accountNumber.matches(accMask) && bic.matches(bicMask)) {
                neededItem = currentItem;
                break;
            }
        }
        if (neededItem === null) {
            return null;
        }
        // по умолчанию доступны все очередности платежа
        neededItem.queue = ["1", "2", "3", "4", "5"];
        return neededItem;
    }

    /**
     * Возвращает признак, является ли счет счетом ГИС ГМП
     * @param accountNumber      проверяемый счет
     * @param bic БИК банка проверяемого счета
     * @return {@code true} если счет является счетом ГИС ГМП
     */
    async isGisGmpAcc(accountNumber: string, bic: string): Promise<boolean> {
        const accountQueueAndCharge = await this.getAccountQueueChargeAndGisgmp(accountNumber, bic);
        return accountQueueAndCharge !== null && "1" === accountQueueAndCharge.gisgmp;
    }

    /**
     * Возвращает список срочных видов платежей, доступных для установки в п/п
     * @returns {Promise<PaymentTypeItem[]>} список срочных видов платежей
     */
    async getUrgentPaymentTypes(): Promise<PaymentTypeItem[]> {
        const urgentDocTypes = this.clientInfo.clientProperties["DOCUMENTS.URGENT.DOC_TYPES"] || "";
        if (!urgentDocTypes.split(";").find(docType => docType.trim() === "payment")) {
            return [];
        }
        const list = await this.referenceService.getFilteredReference<PaymentTypeItem>("payment_types", {
            query: "[is_urgent] == 1"
        });
        return list.content.sort((a, b) => {
            return +a.appearance_id - +b.appearance_id;
        });
    }

    /**
     * Возвращает список всех возможных КПП клиента.
     * В итоговом векторе первым элементом является основное КПП,
     * а последующие элементы - дополнительные КПП.
     * @return массив со всеми возможными КПП клиента
     */
    getClientKpps(): string[] {
        const kpps: string[] = [];
        const mainKpp = this.clientInfo.clientInfo.kpp;
        if (!CommonUtils.isBlank(mainKpp)) {
            kpps.push(mainKpp);
        }
        kpps.push(...this.clientInfo.clientInfo.additionalKpp.split(";").filter(kpp => !CommonUtils.isBlank(kpp)));
        return kpps;
    }

    /**
     * Подставляет адрес в имя получателя
     * @return имя получателя с подставленным адресом (если выполняются все условия)
     * @private
     */
    async getPayerNameWithAddress(document: Document): Promise<string> {
        const content = document.content;
        const payerType = ClientType.valueOf(this.clientInfo.clientInfo.type);
        const isBudget = this.isBudget(content);
        const thirdPartyPayment = this.isThirdPartyPayment(content);
        let name = null;
        // Для бюджетного платежа за третье лицо манипуляции с адресом не требуются (104207)
        // Для банка-корреспондента манипуляции с адресом неактуальны и даже вредны (bugtrack 36300)
        // Для бюджетных документов со статусом составителя 03 или 20 не требуются манипуляции с адресом
        // т.к. формат имени плательщика для таких документов такой: имя клиента + свободный текст
        // Также не требуются манипуляции с адресом для бюджетных документов со статусом составителя 18, 22, 25, 26,
        // т.к. формат имени плательщика для таких документов такой: имя клиента + свободный текст в скобках.
        if (thirdPartyPayment || payerType === ClientType.BANK_CORR || ["03", "18", "20", "22", "25", "26"].indexOf(<string> content.CHARGE_CREATOR) !== -1) {
            name = <string> content.PAYER_NAME;
        } else {
            name = (<string> content.PAYER_NAME).replace(PaymentHelper.ADDRESS_REGEXP, "");
            const clientAddress = this.getClientAddress();
            // для бюджетного платежа логика подстановки адреса изменена под закон 107н от 19 марта 2013г
            if (isBudget) {
                if (this.isNeedToAppendAddressToPayer(content)) {
                    // Проверка, на случай наличия в name очень длинного комментария к счету Д.У.
                    if ((name.length >= PaymentHelper.PAYER_NAME_MAX_LENGTH)) {
                        throw new Error("Невозможно добавить адрес места нахождения плательщика в поле \"Плательщик\". Обратитесь в банк");
                    }
                    // Если старый адрес + имя плательщика меньше 156 символов, то записываем адрес после имени
                    if (!CommonUtils.isBlank(clientAddress) && name.length + clientAddress.length <= PaymentHelper.PAYER_NAME_MAX_LENGTH) {
                        name = this.appendAddressToPayerName(name, clientAddress);
                    } else {
                        const handMadeAddress = await new PayerAddressDialog().show({address: clientAddress, payerName: name});
                        if ((handMadeAddress === null)) {
                            name = null;
                        } else {
                            name = this.appendAddressToPayerName(name, handMadeAddress);
                        }
                    }
                }
            } else {
                // проверка условий на подстановку в имя клиента его адреса
                let needToCheck = this.isNeedToCheckPayerAddress(content, document.meta);
                if (needToCheck) {
                    // Если имя получателя и адрес клиента(из БД) меньше 156 символов
                    if (name.length + clientAddress.length <= PaymentHelper.PAYER_NAME_MAX_LENGTH && clientAddress !== "") {
                        name = this.appendAddressToPayerName(name, clientAddress);
                        needToCheck = false;
                    }
                }
                if (needToCheck) {
                    const systemProp = this.clientInfo.clientProperties["DOCUMENTS.PAYMENT.ADD_PAYER_ADDRESS"];
                    if (systemProp === "editable" && name.length < PaymentHelper.PAYER_NAME_MAX_LENGTH) {
                        // Проверяем есть ли в имени клиента на форме его адрес
                        const address = this.getAddressFrom(<string> content.PAYER_NAME);
                        // Если старый адрес + имя плательщика меньше 156 символов, то записываем адрес после имени
                        if (address !== null && name.length + address.length <= PaymentHelper.PAYER_NAME_MAX_LENGTH) {
                            name = this.appendAddressToPayerName(name, address);
                        } else {
                            const handMadeAddress = await new PayerAddressDialog().show({address: clientAddress, payerName: name});
                            if (!handMadeAddress) {
                                name = null;
                            } else {
                                name = this.appendAddressToPayerName(name, handMadeAddress);
                            }
                        }
                    } else {
                        throw new Error("Невозможно добавить адрес места нахождения плательщика в поле \"Плательщик\". Обратитесь в банк");
                    }
                }
            }
        }
        return name;
    }

    /**
     * Возвращает признак платежа за третье лицо
     * @param content контент документа
     * @return {boolean}
     */
    isThirdPartyPayment(content: DocumentContent): boolean {
        return content.IS_TAX_FOR_THIRD_PARTY === "1";
    }

    /**
     * Возвращает признак бюджетного платежа
     * @param content контент документа
     * @returns {boolean}
     */
    isBudget(content: DocumentContent): boolean {
        return content.IS_CHARGE === "1";
    }

    /**
     * Возвращает признак включенной функции автоматического заполнения данных получателя данными из сервиса "Индикатор"
     * @return {boolean} true, если системное свойство ONLINE.INDICATOR.USE_FOR_FILL_CONTRACTORS включено или не заполнено, иначе - false
     */
    useIndicatorForFillContractors(): boolean {
        return this.clientInfo.clientProperties["ONLINE.INDICATOR.USE_FOR_FILL_CONTRACTORS"] !== "false";
    }

    /**
     * Проверяет условия для подстановки в имя клиента его адреса.
     * Проверку необходимо оставить, так как пользователь может исправить Плательщика и Адрес через диалог.
     * @param content контент документа
     * @param meta мета документа
     * @return    true - Все условия выполняются, адрес подставлять надо
     *           false - условия НЕ выполняются, адрес подставлять НЕ надо
     */
    private isNeedToCheckPayerAddress(content: DocumentContent, meta: DocumentMeta): boolean {
        // 1. Проверка системного свойства
        if (this.clientInfo.clientProperties["DOCUMENTS.PAYMENT.ADD_PAYER_ADDRESS"] === "none") {
            return false;
        }
        // Контроль валидности суммы
        const strAmount = <string> content.AMOUNT;
        if (CommonUtils.isBlank(strAmount)) {
            return false;
        }
        // 2. Сумма и минималка
        // В случае импорта сумма может быть неадекватной
        let amount = null;
        try {
            amount = new BigDecimal(strAmount);
        } catch (unused) {
            throw new Error("Неверно заполнено поле " + meta.fieldsMap.AMOUNT.description);
        }
        let requiredAmount = this.clientInfo.clientProperties["DOCUMENTS.PAYMENT.IDENTIFICATION_REQUIRED_AMOUNT"];
        requiredAmount = requiredAmount === null ? "15000.00" : requiredAmount;
        const amountLimit = new BigDecimal(requiredAmount);
        if (amount.compareTo(amountLimit) < 1) {
            return false;
        }
        // 3. Для счетов только с 30111, 30231, 30304, 30303
        if (!this.checkByRcptAccount(content)) {
            return false;
        }
        // 4. Только для своих банков
        const rcptBic = <string> content.RCPT_BANK_BIC;
        const payerBic = <string> content.PAYER_BANK_BIC;
        if (CommonUtils.isBlank(rcptBic) || CommonUtils.isBlank(payerBic)) {
            return false;
        }
        return !(rcptBic.length !== 9 || payerBic.length !== 9);
    }

    /**
     * Проверяет счет, имя получателя и детали платежа
     * @param content контент документа
     * @returns {@code true} если в этих данных присутствует маска счета, заданная в свойстве
     */
    private checkByRcptAccount(content: DocumentContent): boolean {
        // получаем маски счетов из свойств
        const accsMaskProperty = this.clientInfo.clientProperties["DOCUMENTS.PAYMENT.FOREIGN_BANK_ACC"];
        // если свойство пустое - выходим из метода
        if (CommonUtils.isBlank(accsMaskProperty)) {
            return false;
        }
        const rcptAccount = <string> content.RCPT_ACCOUNT;
        const rcptName = <string> content.RCPT_NAME;
        const paymentDetails = <string> content.PAYMENT_DETAILS;
        if (rcptAccount === null || rcptName === null || paymentDetails === null) {
            return false;
        } else {
            const allAccsMasks = accsMaskProperty.replace(PaymentHelper.ACC_MASK_SEPARATOR_REGEXP, "|");
            // формируем паттерн для поиска
            const pattern = new RegExp(".*\\b(" + allAccsMasks + ")[0-9]{15}\\b.*");
            return pattern.test(rcptAccount) || pattern.test(rcptName) || pattern.test(paymentDetails);
        }
    }

    /**
     * Определяет, нужно ли подставлять адрес в наименование плательщика при бюджетном платеже
     * @param content контент документа
     * @returns {@code true} если нужно подставлять адрес в наименование плательщика при бюджетном платеже
     */
    private isNeedToAppendAddressToPayer(content: DocumentContent): boolean {
        let addressNeeded = false;
        const chargeCreator = <string> content.CHARGE_CREATOR;
        // доп проверка: тип организационной формы клиента - не юридическое лицо и не банк-корреспондент
        if (["02", "08", "19", "28"].indexOf(chargeCreator) !== -1) {
            const payerType = ClientType.valueOf(this.clientInfo.clientInfo.type);
            addressNeeded = payerType !== ClientType.CORPORATE && payerType !== ClientType.BANK_CORR;
        } else if (["09", "10", "11", "12", "13", "16", "17", "24"].indexOf(chargeCreator) !== -1) {
            // без проверок
            addressNeeded = true;
        }
        return addressNeeded;
    }

    /**
     * Возвращает адрес клиента
     */
    private getClientAddress(): string {
        const payerAddressType = this.clientInfo.clientProperties["DOCUMENTS.PAYMENT.PAYER_ADDRESS_TYPE"];
        return payerAddressType === "actual" ? this.clientInfo.contactInfo.factAddr : this.clientInfo.contactInfo.addr;
    }

    /**
     * Добавляет адрес к наименованию клиента
     * @param name имя клиента
     * @param address адрес
     */
    private appendAddressToPayerName(name: string, address: string): string {
        return name + "//" + address + "//";
    }

    /**
     * Возвращает строку c названием клиента и добавленной к названию строки postfix, если ее нет в названии.
     * @param {string} clientName имя клиента
     * @param {string} postfix постфикс
     * @return {string}
     */
    private getClientNameWithPostfix(clientName: string, postfix: string): string {
        return clientName.indexOf(postfix) === -1 ? clientName + postfix : clientName;
    }

    /**
     * Сравнивает два объекта с масками счета.
     * Функция-компаратор для сортировки масок счетов и БИКов получателей бюджетных платежей
     * @param {AccountMask} accountInfo1
     * @param {AccountMask} accountInfo2
     * @return {number}
     */
    private compareRcptChargeAccounts(accountInfo1: AccountMask, accountInfo2: AccountMask): number {
        const accMask1 = accountInfo1.acc_mask;
        const accMask2 = accountInfo2.acc_mask;
        if (CommonUtils.isBlank(accMask2)) {
            return 1;
        }
        if (CommonUtils.isBlank(accMask1)) {
            return -1;
        }
        const resAccMask = accMask2.length - accMask1.length;
        if (0 !== resAccMask) {
            return resAccMask;
        }
        const bicMask1 = accountInfo1.bic_mask;
        const bicMask2 = accountInfo2.bic_mask;
        if (CommonUtils.isBlank(bicMask2)) {
            return 1;
        }
        if (CommonUtils.isBlank(bicMask1)) {
            return -1;
        }
        // получаем разницу между кол-вом цифр в масках БИК
        const resBicMask = bicMask2.replace(PaymentHelper.ASTERISK_REGEXP, "").length -
            bicMask1.replace(PaymentHelper.ASTERISK_REGEXP, "").length;
        if (0 !== resBicMask) {
            return resBicMask;
        }
        // сравниваем маски счетов и БИКов лексикографически для определения окончательного порядка
        const accMaskCompareResult = accMask1.compareTo(accMask2);
        if (0 !== accMaskCompareResult) {
            return accMaskCompareResult;
        }
        return bicMask1.compareTo(bicMask2);
    }

    /**
     * Возвращает отсортированный список с информацией о масках счетов и БИКов получателей бюджетных платежей
     * в том же порядке, что и в {@code RcptChargeAccounts#compareTo}
     * @return отсортированный список с информацией о масках счетов и БИКов получателей бюджетных платежей
     */
    private async getSortedRcptChargeAccountsList(): Promise<AccountMask[]> {
        const masks: AccountMask[] = this.cache.get(CacheKey.CHARGE_RCPT_ACCOUNTS_CACHE_KEY);
        if (masks) {
            return masks;
        } else {
            const masksLoaded: AccountMask[] = (await this.referenceService
                .getReference<AccountMask>("rcpt_charge_accounts"))
                .sort(this.compareRcptChargeAccounts);
            this.cache.put(CacheKey.CHARGE_RCPT_ACCOUNTS_CACHE_KEY, masksLoaded);
            return masksLoaded;
        }
    }
}

/**
 * Вид платежа
 */
export type PaymentTypeItem = {
    /** Наименование вида платежа */
    type: string,
    /** Код вида платежа */
    code: string,
    /** Идентификатор вида платежа в рамках одного типа документа */
    appearance_id: string
};

/**
 * Тип маски счета получателя бюджетного платежа
 */
export type AccountMask = {
    /** Маска БИКа */
    bic_mask: string,
    /** Признак бюджетности */
    charge_only: string,
    /** Маска счета */
    acc_mask: string,
    /** Признак счета ГИС ГМП */
    gisgmp: string,
    /** Идентификатор */
    id: string,
    /** Список очередностей платежа */
    queue: string[]
};
