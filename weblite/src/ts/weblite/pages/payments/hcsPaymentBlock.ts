import {Inject} from "platform/ioc";
import {Cache, CacheKey} from "platform/services/cache";
import {Component, UI} from "platform/ui";
import {CommonUtils} from "platform/utils/commonUtils";
import {Prop} from "vue-property-decorator";
import {SendConfirmDialog} from "../../components/dialogs/sendConfirmDialog";
import {BtnReturn} from "../../model/btnReturn";
import {ClientInfo} from "../../model/clientInfo";
import {DocumentContent} from "../../model/document";
import {HcsType, HcsTypes} from "../../model/hcsTypes";
import {ValidationResult} from "../../model/validationResult";
import {ClientService} from "../../service/clientService";
import {DateTimeService} from "../../service/dateTimeService";
import {ReferenceService, ThesaurusResponse} from "../../service/referenceService";
import {DateUtils} from "../../utils/dateUtils";
import {ValidationUtils} from "../../utils/validationUtils";
import {PaymentHelper} from "./paymentHelper";

/** Разделитель блоков с информацией о клиенте в назначении платежа при платеже за третье лицо */
const SEPARATOR = "//";
/** Шаблон проверки наличия кода валютной операции */
const VO_CODE_PATTERN = new RegExp("^\\{VO.{5}\\}");
/** Шаблон для проверки информации о платеже за услуги ЖКХ */
const HCS_PATTERN = new RegExp(".*<.*>$");
/** Длина кода валютной операции */
const VO_CODE_LENGTH = 9;
/** Длина префикса в строке со сведениями о платеже за услуги ЖКХ */
const HCS_PREFIX_LENGTH = 3;
/** Длина поля "Детали платежа" */
const PAYMENT_DETAILS_LENGTH = 210;
/** Префикс месяца/года в строке информации о платеже ЖКХ */
const PERIOD_PREFIX = "ПРД";

@Component({
    // language=Vue
    template: `
        <div v-if="hcsData.hcsPayment">
            <div class="separate-line"></div>

            <div class="form-row">
                <!-- Платеж за услуги ЖКХ -->
                <x-checkbox v-model="hcsData.hcsEnabled" @input="onHcsCheckboxChanged" :disabled="hcsData.hcsCheckboxDisabled">
                    Оплата услуг ЖКХ
                </x-checkbox>
            </div>

            <div class="form-row">
                <!-- Тип оплаты -->
                <v-select v-model="hcsData.hcsType" :options="hcsTypes" :disabled="!hcsData.hcsType"
                          name="HCS_TYPE" :validation-result="getValidationResult('HCS_TYPE')"
                          @afterselect="onHcsTypeChange" label="value" title="Оплатить по" class="full">
                </v-select>
            </div>
            <div class="form-row">
                <!-- Идентификатор -->
                <x-textfield v-model="hcsData.id" :format="{type: 'text', rule: '20'}" :readonly="!hcsData.hcsType"
                             name="HCS_ID" :validation-result="getValidationResult('HCS_ID')" v-validate="{hcs_id_regex: hcsData}"
                             @input="onHcsDetailsChange" :placeholder="hcsData.hcsType ? hcsData.hcsType.placeholder : ''"
                             :title="hcsData.hcsType ? hcsData.hcsType.value : ''" class="medium"></x-textfield>
            </div>
            <div class="form-row">
                <!-- Месяц -->
                <v-select v-model="hcsData.month" :options="months" @afterselect="onHcsMonthChange"
                          :disabled="!hcsData.hcsType || !hcsData.hcsType.dateEnabled" title="Месяц" class="small">
                </v-select>
                <!-- Год -->
                <v-select v-model="hcsData.year" :options="years" @afterselect="onHcsYearsChange"
                          :disabled="!hcsData.hcsType || !hcsData.hcsType.dateEnabled" title="Год" class="small">
                </v-select>
            </div>
        </div>
    `
})
export class HcsPaymentBlock extends UI {

    /** Контент документа */
    @Prop({required: true})
    private content: DocumentContent;

    /** Сервис по работе с клиентом */
    @Inject private clientService: ClientService;
    /** Сервис для получения времени сервера */
    @Inject private dateTimeService: DateTimeService;
    /** Сервис для работы со справочниками */
    @Inject private referenceService: ReferenceService;
    /** Сервис для работы с кэшем */
    @Inject private cache: Cache;
    /** Информация о клиенте */
    private clientInfo: ClientInfo = null;
    /** Типы оплат за услуги ЖКХ */
    private hcsTypes = HcsTypes.VALUES;
    /** Месяцы */
    private months = PaymentHelper.MONTHS;
    /** Список годов. 5 лет, один будущий, текущий и 3 предыдущих */
    private years = PaymentHelper.YEARS;
    /** Данные платежа за услуги ЖКХ */
    private hcsData: HcsData = new HcsData();
    /** Режим проверки платежа в ГИС ЖКХ */
    private checkHcsMode: string;
    /** Признак проверки ИНН */
    private needCheckInn: boolean;

    /**
     * Обрабатывает изменения реквизитов получателя
     * @return {Promise}
     */
    async handleChangeRcptInfo(): Promise<void> {
        this.hcsData.hcsPayment = await this.needShowHcsPanel();
        await this.enableAndFillHcsPanel(this.hcsData.hcsPayment);
    }

    /**
     * Проверяет и заполняет контент документа
     * @returns {Promise<boolean>}
     */
    async checkHcsInfo(): Promise<boolean> {
        // Проверяем правильность заполнения панели "Оплата услуг ЖКХ"
        const message = `Получатель является поставщиком услуг ЖКХ. Если платеж за услуги ЖКХ, укажите сведения о платеже в блоке "Оплата услуг ЖКХ".`;
        let isValid = true;
        if (this.hcsData.hcsPayment && this.checkHcsMode === "warning" && !this.hcsData.hcsEnabled) {
            isValid = await new SendConfirmDialog().show(message) === BtnReturn.YES;
        }
        if (isValid) {
            // Обновляем информацию о платеже за услуги ЖКХ. Необходимо вызывать перед основными проверками, т.к. изменяется поле PAYMENT_DETAILS
            this.processHcsInfo();
            return this.$errors.count() === 0;
        }
        return false;
    }

    /**
     * Возвращает строку со сведениями о платеже за услуги ЖКХ
     * @return строка со сведениями о платеже за услуги ЖКХ, либо null, если в деталях платежа отсутствует корректная подсторока со сведениями
     *         о платеже за услуги ЖКХ
     */
    getHcsStringFromPaymentDetails(): string {
        const paymentDetails = this.content.PAYMENT_DETAILS as string;
        let hcsString;
        if (!paymentDetails) {
            return null;
        }

        if (HCS_PATTERN.test(paymentDetails)) {
            // Получаем строку по новому формату
            hcsString = paymentDetails.substring(paymentDetails.lastIndexOf("<") + 1, paymentDetails.length - 1);
        } else {
            // Получаем строку по старому формату
            const hcsPostfixIndex = paymentDetails.indexOf("///");
            if (hcsPostfixIndex === -1) {
                return null;
            }
            hcsString = paymentDetails.substring(0, hcsPostfixIndex);
            // Если присутствует код валютной операции, отрежем его
            if (hcsString.startsWith("{VO")) {
                if (!VO_CODE_PATTERN.test(hcsString)) {
                    return null;
                }
                hcsString = hcsString.substring(VO_CODE_LENGTH);
            }
            // Отсекаем информацию о бюджетном платеже за третье лицо
            if (this.content.IS_TAX_FOR_THIRD_PARTY === "1") {
                let lastIndex = hcsString.lastIndexOf(SEPARATOR);
                if (lastIndex === -1) {
                    return null;
                }
                lastIndex = lastIndex + SEPARATOR.length;
                hcsString = hcsString.substring(lastIndex);
            }
        }

        if (hcsString.length > HCS_PREFIX_LENGTH && HcsTypes.findByName(hcsString.substring(0, HCS_PREFIX_LENGTH))) {
            return hcsString;
        }
        return null;
    }

    /**
     * Возвращает значение чекбокса платежа за услуги ЖКХ
     * @return {boolean}
     */
    get hcsEnabled(): boolean {
        return this.hcsData.hcsEnabled;
    }

    /**
     * Возвращает признак платежа за услуги ЖКХ
     * @return {boolean}
     */
    get hcsPayment(): boolean {
        return this.hcsData.hcsPayment;
    }

    /**
     * Инициализирует необходимые для работы данные.
     * Подготавливает панель "Оплата услуг ЖКХ"
     * @inheritDoc
     * @return {Promise<void>}
     */
    async created(): Promise<void> {
        this.clientInfo = this.clientService.getClientInfo();
        this.checkHcsMode = this.clientInfo.clientProperties["DOCUMENTS.PAYMENT.CHECK_HCS.MODE"];
        this.needCheckInn = this.clientInfo.clientProperties["DOCUMENTS.CHECK_INN.ENABLE"] === "true";
        this.hcsData.hcsCheckboxDisabled = this.checkHcsMode === "error";
        this.hcsData.hcsPayment = await this.needShowHcsPanel();
        if (this.hcsData.hcsPayment) {
            this.hcsData.hcsEnabled = true;
            await this.enableAndFillHcsPanel(true);
        }
    }

    /**
     * Обновляет детали платежного поручения при изменении типа платежа в ГИС ЖКХ
     * @param hcsType новое значение
     */
    private async onHcsTypeChange(hcsType: HcsType): Promise<void> {
        this.hcsData.hcsType = hcsType;
        await this.enableDateFields(this.hcsData.hcsType.dateEnabled);
        await this.updateHcsDetails();
        this.$validator.errors.remove("HCS_ID");
        await this.$validator.validate("HCS_ID", this.hcsData.id);
    }

    /**
     * Обновляет детали платежного поручения при изменении идентификатора платежа в ГИС ЖКХ
     */
    private async onHcsDetailsChange(): Promise<void> {
        await this.updateHcsDetails();
    }

    /**
     * Обновляет детали платежного поручения при изменении месяца оплаты за услуги ГИС ЖКХ
     */
    private async onHcsMonthChange(newValue: string): Promise<void> {
        this.hcsData.month = newValue;
        await this.updateHcsDetails();
    }

    /**
     * Обновляет детали платежного поручения при изменении года оплаты за услуги ГИС ЖКХ
     */
    private async onHcsYearsChange(newValue: string): Promise<void> {
        this.hcsData.year = newValue;
        await this.updateHcsDetails();
    }

    /**
     * Обновляет детали платежного поручения при изменении чекбокса оплаты за услуги ГИС ЖКХ
     */
    private async onHcsCheckboxChanged(newValue: boolean): Promise<void> {
        this.hcsData.hcsEnabled = newValue;
        await this.enableAndFillHcsPanel(newValue);
    }

    /**
     * Обрабатывает информацию о платеже за услуги ЖКХ перед сохранением.
     * Проверяет корректность заполнения блока "Оплата услуг ЖКХ" и обновляет поле PAYMENT_DETAILS, добавляя информацию о платеже за услуги ЖКХ
     */
    private processHcsInfo(): void {
        if (!this.hcsData.hcsPayment || !this.hcsData.hcsEnabled) {
            return;
        }
        if (!this.hcsData.hcsType) {
            this.$errors.add({
                field: "HCS_TYPE", msg: this.hcsData.id ? "Не указан вид сведений о платеже за услуги ЖКХ" :
                    `Получатель является поставщиком услуг ЖКХ. Укажите сведения о платеже в блоке "Оплата услуг ЖКХ".`
            });
            return;
        }
        if (!this.hcsData.id) {
            this.$errors.add({field: "HCS_ID", msg: "Не указаны сведения о платеже за услуги ЖКХ"});
            return;
        }
        this.updateHcsDetails();
    }

    /**
     * Изменяет редактируемость и предзаполняет панель "Оплата услуг ЖКХ".
     * В зависимости от переданного флага enable очищает поля панели, либо предзаполняет его.
     * @param enable флаг: редактируемая ли панель, или нет
     */
    private async enableAndFillHcsPanel(enable: boolean): Promise<void> {
        const hcsString = this.getHcsStringFromPaymentDetails();
        if (hcsString) {
            await this.parseHcsString(hcsString);
        }
        if (enable) {
            this.hcsData.hcsEnabled = true;
            this.$validator.attach({name: "HCS_ID", rules: "hcs_id_regex"});
            // при включении блока с ГИС ЖКХ, тип платежа может не быть установлен, так как детали платежа были очищены, выставим по умолчанию
            if (!this.hcsData.hcsType) {
                this.hcsData.hcsType = HcsTypes.IPD;
            }
            await this.enableDateFields(this.hcsData.hcsType.dateEnabled);
            this.updateHcsDetails();
        } else {
            this.$validator.detach("HCS_ID");
            await this.enableDateFields(false);
            this.hcsData.hcsType = null;
            this.hcsData.hcsEnabled = false;
            this.updateHcsDetails();
            this.hcsData.id = "";
        }
    }

    /**
     * Изменяет редактируемость полей месяц и год.
     * В зависимости от переданного флага enable очищает поля, либо предзаполняет значениями по умолчанию.
     * @param enable флаг: редактируемые ли поля, или нет
     */
    private async enableDateFields(enable: boolean): Promise<void> {
        const wasEnabled = !CommonUtils.isBlank(this.hcsData.month);
        if (!enable) {
            this.hcsData.month = "";
            this.hcsData.year = "";
            return;
        }
        if (wasEnabled) {
            return;
        }
        const date = DateUtils.parseDate((await this.dateTimeService.getDateTime()).substring(0, 10)).toDate();
        if (date.getDate() < 15) {
            date.setMonth(date.getMonth() - 1);
        }
        this.hcsData.month = PaymentHelper.MONTHS[date.getMonth()];
        this.hcsData.year = date.getFullYear().toString();
    }

    /**
     * Обновляет поле PAYMENT_DETAILS в зависимости от значений в полях панели "Оплата услуг ЖКХ"
     */
    private updateHcsDetails(): void {
        let resultDetails = "";
        let paymentDetails = this.content.PAYMENT_DETAILS as string;
        if (VO_CODE_PATTERN.test(paymentDetails)) {
            resultDetails += paymentDetails.substring(0, VO_CODE_LENGTH);
            paymentDetails = paymentDetails.substring(VO_CODE_LENGTH).trim();
        }
        let hcsPostfixIndex: number = paymentDetails.indexOf("///");
        // Отсекаем информацию о бюджетном платеже за третье лицо
        if (this.content.IS_TAX_FOR_THIRD_PARTY === "1") {
            const strWithThirdParty: string = hcsPostfixIndex === -1 ? paymentDetails : paymentDetails.substring(0, hcsPostfixIndex);
            let lastIndex: any = strWithThirdParty.lastIndexOf(SEPARATOR);
            if (lastIndex !== -1) {
                lastIndex = lastIndex + SEPARATOR.length;
                resultDetails += paymentDetails.substring(0, lastIndex);
                paymentDetails = paymentDetails.substring(lastIndex);
            }
        }

        // Вырезаем информацию о ЖКХ в старом формате, если таковая имеется - необходимо для копирования и редактирования старых документов
        hcsPostfixIndex = paymentDetails.indexOf("///");
        if (hcsPostfixIndex !== -1 && HcsTypes.findByName(paymentDetails.substring(0, HCS_PREFIX_LENGTH))) {
            paymentDetails = paymentDetails.substring(hcsPostfixIndex + 3);
        }

        if (HCS_PATTERN.test(paymentDetails)) {
            paymentDetails = paymentDetails.substring(0, paymentDetails.lastIndexOf("<"));
        }
        resultDetails += paymentDetails;
        // Формирование новой строки с информацией о ЖКХ
        let hcsString = "";
        const hcsId = this.hcsData.id;
        if (this.hcsData.hcsType) {
            hcsString = this.hcsData.hcsType.name + hcsId;
            // для НЕ ИПД добавим сведения о дате
            if (this.hcsData.hcsType.id !== "1") {
                hcsString += `;${PERIOD_PREFIX}${this.hcsData.monthNumber}.${this.hcsData.year}`;
            }
            hcsString = `<${hcsString}>`;
        }
        this.content.PAYMENT_DETAILS = resultDetails += hcsString;
    }

    /**
     * Проверяет, нужно ли показывать панель "Оплата услуг ЖКХ"
     * @return {Promise} true если нужно показывать панель "Оплата услуг ЖКХ", иначе false
     */
    private async needShowHcsPanel(): Promise<boolean> {
        const rcptInn = this.content.RCPT_INN as string;
        const payerInn = this.content.PAYER_INN as string;
        if (!["warning", "error"].includes(this.checkHcsMode) || !rcptInn || rcptInn === payerInn ||
            !this.isInnLengthValid(rcptInn)) {
            return false;
        }

        return this.isHcsProvider(rcptInn, payerInn);
    }

    /**
     * Инициализирует информацию о платеже за услуги ЖКХ из строки со сведениями о платеже за услуги ЖКХ
     * @param hcsString строка со сведениями о платеже за услуги ЖКХ
     */
    private async parseHcsString(hcsString: string): Promise<void> {
        const semicolonIndex = hcsString.lastIndexOf(";");
        this.hcsData.hcsType = HcsTypes.findByName(hcsString.substring(0, HCS_PREFIX_LENGTH));
        this.hcsData.id = semicolonIndex === -1 ? hcsString.substring(HCS_PREFIX_LENGTH) : hcsString.substring(HCS_PREFIX_LENGTH, semicolonIndex);
        const periodIndex = hcsString.indexOf(PERIOD_PREFIX);
        const dateIndex = periodIndex === -1 ? semicolonIndex + 1 : periodIndex + PERIOD_PREFIX.length;
        if (dateIndex !== -1) {
            const date = hcsString.substring(dateIndex).split(".");
            if (date.length === 2) {
                const month = PaymentHelper.MONTHS[parseInt(date[0], 10) - 1];
                const year = parseInt(date[1], 10);
                const currentYear = parseInt((await this.dateTimeService.getDateTime()).substring(6, 10), 10);
                // Проверим, что месяц и год имеют верное значение
                if (PaymentHelper.MONTHS.includes(month) && year >= currentYear - 3 && year <= currentYear + 1) {
                    this.hcsData.month = month;
                    this.hcsData.year = year.toString();
                }
            }
        }
    }

    /**
     * Проверяет, существует ли поставщик ЖКУ в ГИС ЖКХ с заданным ИНН.
     * Проверяет по справочнику, только если задано клиентское свойство DOCUMENTS.PAYMENT.CHECK_HCS.MODE в "error" или "warning"
     * и ИНН получателя не равен ИНН плательщика
     * @param rcptInn ИНН получателя
     * @param payerInn ИНН плательщика
     * @return {Promise} {@code true} если существует поставщик ЖКУ в ГИС ЖКХ с заданным ИНН получателя, иначе {@code false}
     */
    private async isHcsProvider(rcptInn: string, payerInn: string): Promise<boolean> {
        // 1. Клиентское свойство DOCUMENTS.PAYMENT.CHECK_HCS.MODE должно быть установлено в "error" или "warning"
        if (["warning", "error"].indexOf(this.checkHcsMode) === -1) {
            return false;
        }
        // 2. ИНН получателя и ИНН плательщика должны отличаться и быть заданными
        if (rcptInn === payerInn || !rcptInn || !payerInn) {
            return false;
        }
        let cache: { [key: string]: boolean } = this.cache.get(CacheKey.HCS_PROVIDERS_CACHE_KEY);
        if (!cache) {
            cache = {};
            this.cache.put(CacheKey.HCS_PROVIDERS_CACHE_KEY, cache);
        }
        if (CommonUtils.exists(cache[rcptInn])) {
            return cache[rcptInn];
        }

        const hcsProvidersRef = await this.referenceService
            .getFilteredReference<ThesaurusResponse<any>>("hcs_provider", {query: `[0] == '${rcptInn}'`});
        const isHcsProvider = hcsProvidersRef.content.length > 0;
        cache[rcptInn] = isHcsProvider;
        return isHcsProvider;
    }

    /**
     * Проверка длины ИНН.
     * @param inn          ИНН, длину которого необходимо проверить. ИНН не должно быть null.
     * @param validLengths перечисление длин ИНН, которые можно считать корректными.
     *                     Если перечисление пустое, то корректными длинами будут считаться 10, 12 символов
     * @return {@code true}, если ИНН корректной длины
     */
    private isInnLengthValid(inn: string, validLengths = [10, 12]): boolean {
        if (!this.needCheckInn) {
            return true;
        }
        return validLengths.some((item: number) => inn.length === item);
    }

    /**
     * Возвращает статус валидации поля
     * @param {string} fieldName
     * @return {ValidationResult}
     */
    private getValidationResult(fieldName: string): ValidationResult {
        return ValidationUtils.getValidationResult(fieldName, this.$errors);
    }
}

/* Сведения о платеже за услуги ЖКХ */
export class HcsData {
    /** Идентификатор платежа */
    id = "";
    /** Название месяца */
    month = "";
    /** Год */
    year = "";
    /** Признак активности чекбокса платежа за услуги ЖКХ */
    hcsCheckboxDisabled = false;
    /** Признак платежа за услуги ЖКХ. На основе данных контента */
    hcsPayment = false;
    /** Значение чекбокса платежа за услуги ЖКХ */
    hcsEnabled = false;
    /** Тип платежа */
    hcsType: HcsType = null;

    /**
     * Двузначный идентификатор месяца
     * @returns {string}
     */
    get monthNumber(): string {
        const index = PaymentHelper.MONTHS.indexOf(this.month) + 1;
        return index < 10 ? "0" + index : String(index);
    }
}
