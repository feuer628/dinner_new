import {Inject} from "platform/ioc";
import {ClientUtils} from "platform/utils/clientUtils";
import {ErrorBag} from "vee-validate";
import {CommonUtils} from "../../../platform/utils/commonUtils";
import {Account} from "../../model/account";
import {BankInfo} from "../../model/bankInfo";
import {ClientInfo} from "../../model/clientInfo";
import {ClientType} from "../../model/clientType";
import {DocumentContent} from "../../model/document";
import {BankData, BankService} from "../../service/bankService";
import {PaymentHelper} from "./paymentHelper";

/**
 * Класс для обновления информации в контенте документа платежного поручения
 */
export class PaymentRefresher {

    /** Сервис для работы с банками */
    @Inject
    private bankService: BankService;

    /** Helper */
    private helper: PaymentHelper = null;

    /**
     * Конструктор
     * @param {ClientInfo} clientInfo информация о клиенте
     * @param {"vee-validate".ErrorBag} $errors набор ошибок валидации
     */
    constructor(private clientInfo: ClientInfo, private $errors: ErrorBag) {
        this.helper = new PaymentHelper(this.clientInfo);
    }

    /**
     * Устанавливает значение для поля KPP.
     * Очищает или проставляет 0 или оставляет текущий в зависимости от статуса составителя и типа клиента
     * Логика подстановки kpp.                                                    ;
     * Бюджетный ли  ; св-во "DOC.CLN; Заполнено ли  ; Есть ли   ;;  Что в итоге  ;
     *   платеж?     ; KPP.CAN_EDIT" ; кпп в админе? ; доп. КПП? ;;  проставляем  ;
     * --------------;---------------;---------------;-----------;;---------------;
     *  true         ;  true         ;  true         ;    any    ;;  kpp из админа;
     *  true         ;  true         ;  false        ;    any    ;;  "0"          ;
     *  true         ;  false        ;  true         ;    any    ;;  kpp из админа;
     *  true         ;  false        ;  false        ;    any    ;;  "0"          ;
     *  false        ;  true         ;  true         ;    true   ;;  ""           ;
     *  false        ;  true         ;  true         ;    false  ;;  kpp из админа;
     *  false        ;  true         ;  false        ;    any    ;;  ""           ;
     *  false        ;  false        ;  true         ;    any    ;;  kpp из админа;
     *  false        ;  false        ;  false        ;    any    ;;  ""           ;
     * ---------------------------------------------------------------------------;
     * В случае бюджетного платежа со статусом составителя 03 или 19 в КПП проставляем "0",
     * @param content КПП из контента
     * @return КПП
     */
    updateKpp(content: DocumentContent): void {
        // Основной КПП
        const mainKpp = this.clientInfo.clientInfo.kpp;
        const kppFromContent = <string> content.KPP;
        const chargeCreator = <string> content.CHARGE_CREATOR;
        // Установлен ли уже КПП
        const hasUserKpp = !CommonUtils.isBlank(kppFromContent);
        // список всех КПП клиента
        const kpps = this.helper.getClientKpps();
        const isBudget = this.helper.isBudget(content);
        // признак возможности редактирования КПП
        const kppEditable = this.helper.isKppEditable(isBudget);
        const clientType = ClientType.valueOf(this.clientInfo.clientInfo.type);
        if (isBudget) {
            // значение "КПП" в зависимости от значения "Статуса составителя"
            // единственное допустимое значение "0" для
            // 1) статусов "03" "09" "10" "11" "12" "13" "16" "17" "19" "20" "24"
            // 2) статусов "02" "08" "28" в случае, если тип организационной формы не юридическое лицо и не банк-корреспондент
            if (["03", "09", "10", "11", "12", "13", "16", "17", "19", "20", "24"].indexOf(chargeCreator) !== -1 ||
                (clientType !== ClientType.BANK_CORR && clientType !== ClientType.CORPORATE && ["02", "08", "28"].indexOf(chargeCreator) !== -1)) {
                content.KPP = "0";
            } else if (["01", "02", "06", "08", "21", "28"].indexOf(chargeCreator) !== -1) {
                if (!kppEditable || !hasUserKpp) {
                    // подтягиваем КПП из информации о клиенте, если 1)поле пустое или 2)поле не редактируемое и
                    // заполнено значением, не присутствующим в информации о клиенте.
                    // подставляем "0", если у клиента не указано ни одного КПП
                    if (kpps.indexOf(kppFromContent) === -1) {
                        content.KPP = kpps.length === 0 ? "0" : kpps[0];
                    }
                }
            } else {
                if (!hasUserKpp) {
                    // по умолчанию (поле пустое) подтягиваем КПП из информации о клиенте
                    // подставляем "0", если у клиента не указано ни одного КПП
                    content.KPP = kpps.length === 0 ? "0" : kpps[0];
                }
            }
        } else {
            // Если поле не редактируемо и заполнено значением не присутствующим в информации о клиенте, то
            // если у пользователя есть основной КПП, подставляем его, иначе подставляем пустой КПП
            if (!kppEditable && kpps.indexOf(kppFromContent) === -1) {
                if (CommonUtils.isBlank(mainKpp)) {
                    content.KPP = "";
                } else {
                    content.KPP = mainKpp;
                }
            }
        }
    }

    /**
     * Проставляет в контент документа поля: ИНН плательщика и Имя плательщика, КПП плательщика
     * @param content контент документа
     * @return {void}
     */
    updatePayerInfo(content: DocumentContent): void {
        // обновляем поле ИНН, КПП плательщика только если это не платеж за третье лицо, так как пользователь будет его редактировать сам
        if (!this.helper.isThirdPartyPayment(content)) {
            content.PAYER_INN = this.clientInfo.clientInfo.inn;
            this.updateKpp(content);
        }
        content.PAYER_NAME = ClientUtils.getClientShortName(this.clientInfo.clientProperties);
    }

    /**
     *  Устанавливает название плательщика с постфиксами
     *  если платеж бюджетный и/или счет плательщика расчетный Д.У.
     *  Пока эта автоматическая корректировка не распространяется на клиентов - банков-корреспондентов
     */
    updatePayerInfoWithPostfix(content: DocumentContent, account: Account): void {
        const payerType = ClientType.valueOf(this.clientInfo.clientInfo.type);
        if (ClientType.BANK_CORR !== payerType) {
            let name = this.clientInfo.clientInfo.name;
            let inn = this.clientInfo.clientInfo.inn;
            // если счет был Д.У., надо выставить постфикс
            const trustAccountComment = this.helper.getTrustAccountComment(<string> content.PAYER_ACCOUNT, account);
            if ((trustAccountComment !== null)) {
                name = (name + trustAccountComment);
            }
            if (this.helper.isBudget(content)) {
                const cc = <string> content.CHARGE_CREATOR;
                if (["02", "08", "24", "28"].indexOf(cc) !== -1 && payerType === ClientType.INDIVIDUAL) {
                    name = this.helper.getClientName(name, trustAccountComment, " (ИП)");
                } else if (["09", "17"].indexOf(cc) !== -1) {
                    name = this.helper.getClientName(name, trustAccountComment, " (ИП)");
                } else if ((["02", "08", "24", "28"].indexOf(cc) !== -1 && payerType === ClientType.NOTARY) || cc === "10") {
                    name = this.helper.getClientName(name, trustAccountComment, " (нотариус)");
                } else if ((["02", "08", "24", "28"].indexOf(cc) !== -1 && payerType === ClientType.LAWYER) || cc === "11") {
                    name = this.helper.getClientName(name, trustAccountComment, " (адвокат)");
                } else if ((["02", "08", "24", "28"].indexOf(cc) !== -1 && payerType === ClientType.FARM) || cc === "12") {
                    name = this.helper.getClientName(name, trustAccountComment, " (КФХ)");
                } else if (cc === "18") {
                    name = <string> content.PAYER_NAME;
                } else if (cc === "19") {
                    inn = <string> content.PAYER_INN;
                } else if (["03", "05", "20", "22", "25", "26", "27"].indexOf(cc) !== -1) {
                    name = <string> content.PAYER_NAME;
                    inn = <string> content.PAYER_INN;
                }
            }
            // махинации с адресом в поле "Плательщик", если оно не редактируемое
            const address = this.helper.getAddressFrom(<string> content.PAYER_NAME);
            if (((address !== null) && (((name).length + (address).length) <= 156))) {
                name = name + "//" + address + "//";
            }
            // Если сконструированная строка для поля "Плательщик" превышает его размер, значит в нем или присутствует
            // комментарий к счету Д.У., или связка ФИО + постфикс слишком длинная (или возможно обе эти причины)
            if ((name.length > 160)) {
                // если комментарий к счету Д.У. существует, то пытаемся поместиться в 160 символов удалив его из наименования
                if ((trustAccountComment !== null)) {
                    name = name.replace(trustAccountComment, "");
                }
                // если наименование все равно слишком длинное, то обрезаем его до 160 символов и на этапе проверок получаем исключение
                if ((name.length > 160)) {
                    name = name.substring(0, 160);
                }
            }
            // обновляем поле ИНН плательщика только если это не платеж за третье лицо, так как пользователь будет его редактировать сам
            if (!this.helper.isThirdPartyPayment(content)) {
                content.PAYER_NAME = name;
                content.PAYER_INN = inn;
            }
        }
    }

    /**
     * Проставляет в контент документа поля: номер счета плательщика, корр. счет банка плательщика, БИК банка плательщика, название банка плательщика.
     * @param content контент документа
     * @param account выбранный счет клиента
     * @param banksByAccountId банки в разбивке по идентификаторам счетов
     * @return {void}
     */
    updatePayerBankInfo(content: DocumentContent, account: Account, banksByAccountId: { [key: string]: BankInfo }): void {
        content.PAYER_ACCOUNT = account.accountNumber;
        const payerBank = banksByAccountId[account.ibankAccountId];
        content.PAYER_BANK_ACC = payerBank.corrAcc;
        content.PAYER_BANK_BIC = payerBank.bic;
        content.PAYER_BANK_NAME = payerBank.name;
    }

    /**
     * Обновляет информацию о банке получателя. При ошибке (например, банк удален из справочника), очищаем поля Наименование банка получателя,
     * счет банка чтобы пользователь ввел их заново. К полю БИК отображаем ошибку.
     * @param content контент документа
     * @return {Promise<void>}
     */
    async updateRcptBankInfo(content: DocumentContent): Promise<void> {
        if (content.RCPT_BANK_BIC.length === 9) {
            try {
                const bank = await this.bankService.getBank(content.RCPT_BANK_BIC as string);
                this.setRcptBankInfoToContent(content, bank);
            } catch (mute) {
                content.RCPT_BANK_ACC = "";
                content.RCPT_BANK_NAME = "";
                this.$errors.add({field: "RCPT_BANK_BIC", msg: "Банк с указанным БИК отсутствует в справочнике"});
            }
        }
    }

    /**
     * Проставляет в контент документа поля: корреспондентский счет, название и БИК банка
     * @param content контент документа
     * @param bank информация о банке
     * @return {void}
     */
    setRcptBankInfoToContent(content: DocumentContent, bank: BankData): void {
        content.RCPT_BANK_ACC = bank.bill_corr;
        content.RCPT_BANK_BIC = bank.bik;
        content.RCPT_BANK_NAME = bank.bank_name;
    }
}
