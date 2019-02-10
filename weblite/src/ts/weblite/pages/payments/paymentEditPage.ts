import {CatchErrors} from "platform/decorators";
import {Container, Inject} from "platform/ioc";
import {FormatterOptions} from "platform/types";
import {Component, UI, Watch} from "platform/ui";
import {ModalContainer} from "platform/ui/modalContainer";
import {ButtonGroupData} from "platform/ui/xButtonGroup";
import {CommonUtils} from "platform/utils/commonUtils";
import {DocumentAction} from "../../common/documentAction";
import {ConfirmDialog} from "../../components/dialogs/confirmDialog";
import {DocumentSuccessSendDialog} from "../../components/dialogs/documentSuccessSendDialog";
import {ProgressDialog} from "../../components/dialogs/progressDialog";
import {FileDropArea} from "../../components/fileDropArea";
import {FileLink} from "../../components/fileLink";
import {ContractorInfo, IndicatorServiceComponent} from "../../components/indicatorServiceComponent";
import {TemplatePage} from "../../components/templatePage";
import {Account} from "../../model/account";
import {BankInfo} from "../../model/bankInfo";
import {BtnReturn} from "../../model/btnReturn";
import {ChargeBasis, ChargeBasisValues} from "../../model/chargeBasisValues";
import {ChargeCreatorStatus, ChargeCreatorStatuses} from "../../model/chargeCreatorStatuses";
import {ClientInfo} from "../../model/clientInfo";
import {ClientType} from "../../model/clientType";
import {Document, DocumentContent, DocumentMeta, DocumentType, FieldInfoMap} from "../../model/document";
import {FormPaymentType} from "../../model/formPaymentType";
import {GlobalEvent} from "../../model/globalEvent";
import {NdsValue} from "../../model/ndsValue";
import {PaymentChargeFields} from "../../model/paymentChargeFields";
import {Status} from "../../model/status";
import {ValidationResult} from "../../model/validationResult";
import {BankData, BankService} from "../../service/bankService";
import {ClientService} from "../../service/clientService";
import {CounterpartiesService} from "../../service/counterpartiesService";
import {DateTimeService} from "../../service/dateTimeService";
import {DocumentBehaviorService} from "../../service/documentBehaviorService";
import {ContentType, DocumentService} from "../../service/documentService";
import {ImportService} from "../../service/importService";
import {RecentRecipient, RecentRecipientsService} from "../../service/recentRecipientsService";
import {SignatureService} from "../../service/signatureService";
import {TransactionService} from "../../service/transactionService";
import {AccountUtils} from "../../utils/accountUtils";
import {DateFormat, DateUtils} from "../../utils/dateUtils";
import {ValidationUtils} from "../../utils/validationUtils";
import {HcsPaymentBlock} from "./hcsPaymentBlock";
import {PaymentHelper, PaymentTypeItem} from "./paymentHelper";
import {PaymentRefresher} from "./paymentRefresher";
import {PaymentValidator} from "./paymentValidator";
import {RecentRecipientsList} from "./recentRecipientsList";
import {SendPaymentHelper} from "./sendPaymentHelper";
import {ThirdPartyPaymentHelper} from "./thirdPartyPaymentHelper";

/** Шаблон подстроки с информацией о НДС в поле "Назначение платежа" документа */
const NDS_DETAILS_REGEX = /в\s+т\.ч\.\s+НДС\s+(\d{1,2}\.?\d{0,2})%\s+-\s+[\s\d]+\.\d{2}/g;
/**
 * Предустановленные данные документа для платежа в Таможню. Используется так же для очистки полей при переключении к другим типам
 */
const CUSTOMS_DATA = {
    RCPT_INN: "7730176610",
    RCPT_KPP: "773001001",
    RCPT_NAME: "МОУ ФК (ФТС России)",
    RCPT_BANK_BIC: "044501002",
    RCPT_ACCOUNT: "40101810800000002901",
    CHARGE_OKATO: "45328000",
    RCPT_BANK_NAME: "ОПЕРУ-1 БАНКА РОССИИ, г.МОСКВА 701"
};
/** Сообщение при невозможности отправить документ в банк */
const ERROR_SEND_DOC = "Невозможно отправить документ в банк. Проверьте корректность заполненных реквизитов.";
/** Процент НДС по умолчанию */
const DEFAULT_NDS_VALUE = "18";

@Component({
    // language=Vue
    template: `
        <template-page>
            <template slot="main">
                <div v-if="initialized" class="app-content__inner">
                    <!-- TODO верстка -->
                    <div v-if="warningMessage" class="notify" style="margin-bottom: 20px">
                        {{warningMessage}}
                    </div>
                    <div class="form-row page-header">
                        <div class="title">Заплатить или перевести</div>
                        <x-button-group @input="onPaymentTypeChange" :value="selectedPaymentType" :buttons="paymentTypes"></x-button-group>
                    </div>

                    <div v-if="showKppField" class="form-row">
                        <x-textfield v-model="c.KPP" :format="f.KPP" title="КПП плательщика" name="KPP"
                                     :validation-result="getValidationResult('KPP')" class="small"></x-textfield>
                    </div>

                    <div v-if="showKppField" class="separate-line"></div>

                    <div class="form-row" :class="{ 'form-row-wrap': !isCounterparty() }">
                        <!-- ИНН получателя -->
                        <x-textfield v-focus.lazy="!isCustoms()" :readonly="isCustoms()" v-model="c.RCPT_INN" :format="f.RCPT_INN" title="ИНН получателя"
                                     @input="onRcptInnChanged"
                                     name="RCPT_INN" ref="innInput" :validation-result="getValidationResult('RCPT_INN')"
                                     class="small"></x-textfield>

                        <!-- КПП получателя -->
                        <x-textfield v-if="!isCounterparty()" :readonly="isCustoms()" v-model="c.RCPT_KPP" :format="f.RCPT_KPP" title="КПП получателя"
                                     name="RCPT_KPP" :validation-result="getValidationResult('RCPT_KPP')"
                                     class="small"></x-textfield>

                        <div class="wrapRow"></div>

                        <!-- Наименование получателя -->
                        <x-textfield :readonly="isCustoms()" v-model="c.RCPT_NAME" :format="f.RCPT_NAME" title="Наименование получателя"
                                     name="RCPT_NAME" :validation-result="getValidationResult('RCPT_NAME')"
                                     class="full"></x-textfield>
                    </div>

                    <!-- Блок Индикатор -->
                    <indicator v-if="isDataForIndicatorValid()" ref="indicator" :inn="c.RCPT_INN" @found="onIndicatorEvent"></indicator>

                    <div class="form-row">
                        <!-- БИК банка получателя -->
                        <x-textfield :readonly="isCustoms()" :value="c.RCPT_BANK_BIC" @input="onRcptBankBicFilled"
                                     :format="f.RCPT_BANK_BIC" title="БИК банка получателя"
                                     name="RCPT_BANK_BIC" :validation-result="getValidationResult('RCPT_BANK_BIC')"
                                     class="small"></x-textfield>

                        <!-- Счет получателя -->
                        <x-textfield :readonly="isCustoms()" v-model="c.RCPT_ACCOUNT" :format="f.RCPT_ACCOUNT" title="Счет получателя"
                                     name="RCPT_ACCOUNT" :validation-result="getValidationResult('RCPT_ACCOUNT')"
                                     class="full"></x-textfield>
                    </div>

                    <div class="form-row">
                        <!-- Наименование банка получателя -->
                        <v-select :disabled="isCustoms()"
                                  v-model="c.RCPT_BANK_NAME"
                                  title="Наименование банка получателя"
                                  :searchable="!isCustoms()"
                                  :clearable="false"
                                  :no-drop-if-selected="true"
                                  :clear-search-on-blur="false"
                                  :emit-on-created="false"
                                  label="bank_name"
                                  @afterselect="onBankSelect"
                                  @search="searchRcptBank"
                                  :options="banks"
                                  name="RCPT_BANK_NAME"
                                  :validation-result="getValidationResult('RCPT_BANK_NAME')"
                                  class="full">
                        </v-select>
                    </div>

                    <div class="separate-line"></div>

                    <!-- Блок полей отображаемых только для бюджетных платежей -->
                    <template v-if="isBudget">
                        <div class="form-row">
                            <!-- Статус составителя расчетного документа (поле 101) -->
                            <v-select v-model="selectedChargeCreator"
                                      :options="chargeCreatorStatuses"
                                      label="value"
                                      title="Статус составителя расчетного документа (поле 101)"
                                      @afterselect="onChargeCreatorSelect"
                                      name="CHARGE_CREATOR"
                                      :validation-result="getValidationResult('CHARGE_CREATOR')"
                                      class="full">
                                <template slot="selected-option" slot-scope="option">
                                    {{ option.id + ' - ' + option.value }}
                                </template>
                                <template slot="option" slot-scope="option">
                                    <span :title="option.value">{{ option.id + ' - ' + option.value }}</span>
                                </template>
                            </v-select>
                        </div>

                        <div class="form-row">
                            <!-- КБК (поле 104) -->
                            <x-textfield v-focus.lazy="isCustoms()" v-model="c.CHARGE_KBK" :format="kbkFieldFormat" title="КБК (поле 104)"
                                         name="CHARGE_KBK" :validation-result="getValidationResult('CHARGE_KBK')"
                                         class="medium"></x-textfield>
                        </div>

                        <div class="form-row">
                            <!-- ОКТМО (поле 105) -->
                            <x-textfield v-model="c.CHARGE_OKATO" :format="f.CHARGE_OKATO" title="ОКТМО (поле 105)"
                                         name="CHARGE_OKATO" :validation-result="getValidationResult('CHARGE_OKATO')"
                                         :readonly="isCustoms()" class="medium"></x-textfield>
                        </div>

                        <div v-if="!isOtherBudget()" class="form-row">
                            <!-- Основание платежа для платежа (поле 106) в таможню или налоговую -->
                            <v-select v-model="selectedChargeBasis"
                                      :options="chargeBasisValues"
                                      label="value"
                                      name="CHARGE_BASIS"
                                      :validation-result="getValidationResult('CHARGE_BASIS')"
                                      title="Основание платежа (поле 106)"
                                      @afterselect="onChargeBasisSelect"
                                      class="full">
                                <template slot="selected-option" slot-scope="option">
                                    {{ option.id + ' - ' + option.value }}
                                </template>
                                <template slot="option" slot-scope="option">
                                    <span :title="option.value">{{ option.id + ' - ' + option.value }}</span>
                                </template>
                            </v-select>
                        </div>

                        <div v-if="isCustoms() || isTax()" class="form-row">
                            <!-- Налоговый период или Код таможенного органа (поле 107) если платеж в Налоговую или в Таможню -->
                            <!-- TODO сделать заполнение налогового периода раздельным: Период + (Месяц,Квартал,Год) + Год -->
                            <x-textfield v-model="c.CHARGE_PERIOD" :format="f.CHARGE_PERIOD" name="CHARGE_PERIOD"
                                         :validation-result="getValidationResult('CHARGE_PERIOD')"
                                         :title="(isCustoms() ? 'Код таможенного органа' : 'Налоговый период') + ' (поле 107)'"
                                         class="medium"></x-textfield>
                        </div>

                        <div v-if="(isCustoms() || isTax()) && chargeNumDocFieldShowed" class="form-row">
                            <!-- ИСФЛ или Номер документа (поле 108) -->
                            <x-textfield v-model="c.CHARGE_NUM_DOC" :format="f.CHARGE_NUM_DOC" name="CHARGE_NUM_DOC"
                                         :validation-result="getValidationResult('CHARGE_NUM_DOC')"
                                         title="Номер документа (поле 108)"
                                         class="medium"></x-textfield>
                        </div>

                        <div v-if="isCustoms() || isTax()" class="form-row">
                            <!-- Дата документа (поле 109) -->
                            <v-date-picker popover-visibility="focus" v-model="chargeDateDoc" mode="single">
                                <x-textfield :value="props.inputValue"
                                             name="CHARGE_DATE_DOC"
                                             :validation-result="getValidationResult('CHARGE_DATE_DOC')"
                                             @change.native="processDateValue(props, $event.target.value)"
                                             title="Дата документа (поле 109)"
                                             class="medium calendar-period"
                                             inputClass="filter-input"
                                             slot-scope="props"></x-textfield>
                            </v-date-picker>
                        </div>

                        <div class="form-row">
                            <!-- Код (УИН) -->
                            <x-textfield v-model="c.CODE" :format="f.CODE" title="Код (УИН)"
                                         name="CODE" :validation-result="getValidationResult('CODE')"
                                         class="medium"></x-textfield>
                        </div>

                        <div v-if="isOtherBudget() || isTax()" class="form-row">
                            <!-- Платеж за третье лицо -->
                            <x-checkbox v-model="c.IS_TAX_FOR_THIRD_PARTY" @input="onThirdPartyFlagChange" true-value="1" false-value="0">
                                Платеж за третье лицо
                            </x-checkbox>
                        </div>

                        <template v-if="thirdPartyPayment">
                            <div class="form-row">
                                <!-- ИНН третьего лица -->
                                <x-textfield v-model="c.PAYER_INN" :format="f.PAYER_INN" title="ИНН" name="PAYER_INN" @input="onThirdPartyInnChange"
                                             :validation-result="getValidationResult('PAYER_INN')" class="small"></x-textfield>

                                <!-- КПП третьего лица -->
                                <x-textfield v-model="c.KPP" :format="f.KPP" title="КПП" name="KPP" :readonly="chargeForPhysics"
                                             :validation-result="getValidationResult('KPP')" class="small"></x-textfield>

                                <div class="wrapRow"></div>
                            </div>
                            <div class="form-row">
                                <!-- Наименование / ФИО -->
                                <x-textfield :value="thirdPartyPayerName" :format="{type: 'text', rule: '160;/'}"
                                             @input="onThirdPartyNameChange" title="Наименование / ФИО"
                                             class="medium"></x-textfield>
                            </div>
                        </template>

                        <div class="separate-line"></div>
                    </template>

                    <div class="form-row">
                        <!-- Сумма -->
                        <x-textfield v-model="c.AMOUNT" @input="onAmountChanged"
                                     name="AMOUNT" :validation-result="getValidationResult('AMOUNT')"
                                     :format="f.AMOUNT" title="Сумма, ₽" class="small"></x-textfield>

                        <!-- Заплатить со счета -->
                        <account-select title="Заплатить со счета" v-model="selectedAccount" class="full" :accounts="accounts"></account-select>
                    </div>

                    <div class="form-row">
                        <!-- Назначение -->
                        <x-textarea :rows="5" v-model="c.PAYMENT_DETAILS" :format="f.PAYMENT_DETAILS" :allow-overflow="true"
                                    name="PAYMENT_DETAILS" :validation-result="getValidationResult('PAYMENT_DETAILS')"
                                    title="Назначение" :counter="true" class="full" @keydown.enter.prevent></x-textarea>
                    </div>

                    <div class="form-row">
                        <!-- Блок выбора НДС -->
                        <x-button-group v-model="selectedNdsValue" :buttons="ndsValues"></x-button-group>

                        <!-- Очередность платежа -->
                        <div>Очередность платежа:</div>
                        <x-button-group v-model="selectedQueue" :buttons="queueValues"></x-button-group>
                    </div>

                    <div v-if="isCounterparty()" class="form-row margT24 w470">
                        <!-- УИП -->
                        <x-textfield v-model="c.CODE" :format="f.CODE" title="УИП" class="full"></x-textfield>
                    </div>

                    <div class="form-row w470">
                        <!-- Рез. поле -->
                        <x-textfield name="REZ_FIELD" v-model="c.REZ_FIELD" :format="f.REZ_FIELD" title="Рез. поле" class="full"></x-textfield>
                    </div>

                    <!-- Блок оплаты ГИС ЖКХ -->
                    <hcs-payment-block ref="hcsComponent" :content="c"></hcs-payment-block>

                    <div v-if="isCounterparty() && urgentPaymentType" class="form-row">
                        <!-- Срочный платеж -->
                        <x-checkbox v-model="urgentPayment">
                            Срочный платеж
                        </x-checkbox>
                    </div>

                    <!-- TODO блок Отправить уведомление об оплате -->

                    <div class="app-content-inner__footer">
                        <div>
                            <progress-button class="btn btn-primary" :handler="send">Отправить</progress-button>
                            <a class="btn" @click.stop="saveDraftAndLeave()">Сохранить черновик</a>
                        </div>
                        <a class="btn" @click="goToEvents">Отмена</a>
                    </div>
                </div>
                <spinner v-else></spinner>
            </template>
            <template slot="sidebar-top">
                <div class="payment-sidebar-section">
                    <file-drop-area @drop="onImportFiles" class="payment-import-file-drop">
                        <div class="payment-import-file-drop__content">
                            Перетащите или
                            <file-link @select="onImportFiles">загрузите</file-link>
                            <br>
                            файл импорта
                        </div>
                    </file-drop-area>
                    <div class="payment-import-file-hint">Файлы формата 1С, iBank2, УФЭБС.</div>
                </div>
                <recent-recipients-list v-if="isCounterparty()" @select="onSelectRecipient"></recent-recipients-list>
            </template>
        </template-page>
    `,
    components: {TemplatePage, RecentRecipientsList, HcsPaymentBlock, FileDropArea, FileLink}
})
export class PaymentEditPage extends UI {

    /** Ссылки на дочерние компоненты */
    $refs: {
        indicator: IndicatorServiceComponent,
        hcsComponent: HcsPaymentBlock
    };
    /** Сервис по работе с документами */
    @Inject private documentService: DocumentService;
    /** Сервис для предзаполнения документа */
    @Inject private documentBehaviorService: DocumentBehaviorService;
    /** Сервис по работе с банками */
    @Inject private bankService: BankService;
    /** Сервис по работе с клиентом */
    @Inject private clientService: ClientService;
    /** Сервис для получения текущего времени */
    @Inject private dateTimeService: DateTimeService;
    /** Сервис для работы с транзакциями */
    @Inject private transactionService: TransactionService;
    /** Сервис по работе с подписями */
    @Inject private signatureService: SignatureService;
    /** Сервис по работе со списком последних получателей */
    @Inject private recentRecipientsService: RecentRecipientsService;
    /** Сервис импорта файлов */
    @Inject private importService: ImportService;
    /** Сервис для работы с контрагентами */
    @Inject private counterpartiesService: CounterpartiesService;
    /** Документ */
    private document: Document = null;
    /** Типы платежей */
    private paymentTypes: ButtonGroupData[] = [
        {id: 1, text: FormPaymentType.COUNTERPARTY.value},
        {
            id: 2, nestedData: [
                {id: 21, text: FormPaymentType.TAX.value},
                {id: 22, text: FormPaymentType.CUSTOMS.value},
                {id: 23, text: FormPaymentType.BUDGET.value}
            ]
        }
    ];
    /** Типы НДС */
    private ndsValues: ButtonGroupData[] = [];
    /** Типы очередностей платежа */
    private queueValues: ButtonGroupData[] = [
        {id: 1, text: "1"},
        {id: 2, text: "2"},
        {id: 3, text: "3"},
        {id: 4, text: "4"},
        {id: 5, text: "5"}
    ];
    /** Выбранный тип очередности платежа. Для новых документов очередность по умолчанию 5 */
    private selectedQueue = this.queueValues[4];
    /** Выбранный тип платежа */
    private selectedPaymentType = this.paymentTypes[0];
    /** Выбранный тип НДС */
    private selectedNdsValue: ButtonGroupData = null;
    /** Тип действия над документом */
    private action: DocumentAction = null;
    /** Информация о клиенте */
    private clientInfo: ClientInfo = null;
    /** Признак инициализации редактора */
    private initialized = false;
    /** Информация о найденных банках */
    private banks: BankData[] = [];
    /** Список счетов */
    private accounts: Account[] = [];
    /** Выбранный счет */
    private selectedAccount: Account = null;
    /** Карта банков и счетов, относящихся к ним */
    private banksByAccountId: {[key: string]: BankInfo} = {};
    /** Статусы составителя расчетного документа для поля (101) */
    private chargeCreatorStatuses: ChargeCreatorStatus[] = [];
    /** Основания платежа для поля (106) */
    private chargeBasisValues: ChargeBasis[] = [];
    /** Дата документа для поля (108) */
    private chargeDateDoc: Date = null;
    /** Выбранный статус составителя */
    private selectedChargeCreator: ChargeCreatorStatus = null;
    /** Выбранный тип основания платежа */
    private selectedChargeBasis: ChargeBasis = null;
    /** Признак выбора платежа в Таможню */
    private isCustomsPaymentSelected = false;
    /** Признак срочности платежа */
    private urgentPayment = false;
    /** Вид срочного платежа */
    private urgentPaymentType: PaymentTypeItem = null;
    /** Текущий объект таймера */
    private currentTimer: number = null;
    /** Признак отображения диалога с подтверждением сохранения документа */
    private needToConfirmLeave = true;
    /** Идентификатор черновика из которого создается документ */
    private draftId: string = null;
    /** Название плательщика - третьего лица */
    private thirdPartyPayerName = "";
    /** Валидатор */
    private validator: PaymentValidator = null;
    /** Рефрешер контента документа */
    private refresher: PaymentRefresher = null;
    /** Helper для документа */
    private helper: PaymentHelper = null;
    /** Helper для платежа за третье лицо */
    private thirdPartyHelper: ThirdPartyPaymentHelper = null;
    /** Список полей, участвующих в валидации */
    private fields = ["KPP", "RCPT_INN", "RCPT_KPP", "RCPT_NAME", "RCPT_BANK_BIC", "RCPT_ACCOUNT", "RCPT_BANK_NAME", "CHARGE_CREATOR",
        "CHARGE_KBK", "CHARGE_OKATO", "CHARGE_PERIOD", "CHARGE_NUM_DOC", "CHARGE_DATE_DOC", "CODE", "PAYER_INN", "KPP", "AMOUNT", "PAYMENT_DETAILS"];
    /** Системное значение НДС заданное в documents.payment.nds */
    private systemDefaultNdsProperty = "";
    /** Текст уведомления */
    private warningMessage: string;

    /**
     * Подготавливает или загружает документ в зависимости от параметров роутинга.
     * Инициализирует необходимые для работы данные.
     * @inheritDoc
     * @return {Promise<void>}
     */
    @CatchErrors
    async created(): Promise<void> {
        this.action = this.getDocumentAction();
        this.clientInfo = this.clientService.getClientInfo();
        this.systemDefaultNdsProperty = this.getNdsPercent();
        this.ndsValues = [
            {id: 1, text: `${this.systemDefaultNdsProperty}%`},
            {id: 2, text: NdsValue._10},
            {id: 3, text: NdsValue._0},
            {id: 4, text: NdsValue.NO_NDS}
        ];
        this.refresher = new PaymentRefresher(this.clientInfo, this.$errors);
        this.validator = new PaymentValidator(this.clientInfo, this.$errors);
        this.helper = new PaymentHelper(this.clientInfo);
        this.thirdPartyHelper = new ThirdPartyPaymentHelper(this.clientInfo);
        this.accounts = await this.clientService.getActiveAccounts(true);
        this.clientInfo.banks.forEach((bankInfo: BankInfo): void => {
            bankInfo.accounts.forEach((account: Account): void => {
                this.banksByAccountId[account.ibankAccountId] = bankInfo;
            });
        });
        // порядок важен, загружаем документ здесь, ниже уже будут вызваны watcher'ы
        await this.processDocAction();
        // определяем тип формы платежа
        await this.initPaymentType();
        // при наличии предзаполненных полей - применяем их
        await this.applyPreparedContentIfExists();
        // Обновляем форму документа
        await this.updateForm();
        if (!this.selectedNdsValue) {
            this.selectedNdsValue = this.ndsValues[0];
        }
        this.initialized = true;
    }

    /**
     * Очищает
     * @inheritDoc
     */
    destroyed(): void {
        // если передавался контент документа, надо его очистить
        this.documentBehaviorService.deleteBehavior();
    }

    /**
     * Осуществляет проверку счетов клиента. У клиента должен быть хотя бы один активный счет.
     * @param {VueRouter.Route} to      целевой объект Route, к которому осуществляется переход.
     * @param {VueRouter.Route} from    текущий путь, с которого осуществляется переход к новому.
     * @param {VueRouter.Resolver} next функция, вызов которой разрешает хук.
     * @inheritDoc
     * @returns {Promise<void>}
     */
    @CatchErrors
    async beforeRouteEnter(to: VueRouter.Route, from: VueRouter.Route, next: VueRouter.Resolver): Promise<void> {
        const clientAccounts = await Container.get(ClientService).getActiveAccounts();
        if (clientAccounts.length === 0) {
            next(false);
            throw new Error("Нет активных счетов для совершения операции. Обратитесь в банк");
        }
        next();
    }

    /**
     * Обрабатывает хук ухода со страницы, выводит предупреждение, и в случае согласия, сохраняет черновик
     * @param {VueRouter.Route} to      целевой объект Route, к которому осуществляется переход.
     * @param {VueRouter.Route} from    текущий путь, с которого осуществляется переход к новому.
     * @param {VueRouter.Resolver} next функция, вызов которой разрешает хук.
     * @inheritDoc
     * @returns {Promise<void>}
     */
    @CatchErrors
    async beforeRouteLeave(to: VueRouter.Route, from: VueRouter.Route, next: VueRouter.Resolver): Promise<void> {
        if (ModalContainer.isUiBlocked()) {
            next(false);
            return;
        }
        if (!this.needToConfirmLeave) {
            next();
            return;
        }
        const dialog = new ConfirmDialog();
        const btnReturn = await dialog.show("Платеж не отправлен. Сохранить черновик?");
        if (BtnReturn.YES === btnReturn) {
            const draftId = await this.saveDraft();
            const currentRouter = this.$router;
            next();
            await new DocumentSuccessSendDialog().show({
                router: currentRouter,
                routerData: {name: "paymentEdit", params: {id: draftId, action: "edit"}},
                message: "Черновик успешно сохранен"
            });
        } else if (BtnReturn.NO === btnReturn) {
            next();
        }
    }

    /**
     * Создает новый документ или загружает документ при копировании.
     * @return {Promise<void>}
     */
    private async processDocAction(): Promise<void> {
        if (this.actionOf(DocumentAction.NEW, DocumentAction.COPY)) {
            this.document = await this.documentService.createEmpty(DocumentType.PAYMENT);
        }
        if (this.actionOf(DocumentAction.EDIT)) {
            this.document = await this.documentService.load(DocumentType.PAYMENT, this.$route.params.id);
        }
        if (this.actionOf(DocumentAction.COPY)) {
            const originDocument = await this.documentService.load(DocumentType.PAYMENT, this.$route.params.id);
            this.document.content = originDocument.content;
        }
    }

    /**
     * Инициализирует форму платежа
     */
    private async initPaymentType(): Promise<void> {
        // проверяем, была ли передана форма документа
        let paymentForm = this.documentBehaviorService.getFormPaymentType();
        if (!paymentForm) {
            // если форма не была передана - определяем тип формы по контенту
            paymentForm = this.helper.getFormPaymentType(this.c);
        }
        this.selectedPaymentType = this.paymentTypes[1].nestedData.find(value => value.text === paymentForm.value) ||
            this.paymentTypes[0];
        await this.changePaymentType(this.actionOf(DocumentAction.NEW));
    }

    /**
     * Обновляет форму документа.
     * Заполняет данные в контенте документа на основе информации клиента, выбранного счета и банка.
     * Устанавливает значения формы на основе контента документа
     */
    private async updateForm(): Promise<void> {
        // всегда обновляем информацию о клиенте, она могла поменяться
        this.refresher.updatePayerInfo(this.c);
        // обновляем информацию о банке получателя (она могла измениться)
        await this.refresher.updateRcptBankInfo(this.c);
        // определяем - есть ли доступные срочные виды платежа
        const paymentTypeCode = this.c.PAYMENT_TYPE_CODE;
        this.c.PAYMENT_TYPE = "";
        this.c.PAYMENT_TYPE_CODE = "";
        const urgentPaymentTypes = await this.helper.getUrgentPaymentTypes();
        if (urgentPaymentTypes.length) {
            // если есть - можем отображать галочку срочного платежа
            this.urgentPaymentType = urgentPaymentTypes[0];
            if (urgentPaymentTypes.find(value => {
                return value.code === paymentTypeCode;
            })) {
                this.urgentPayment = true;
            }
        }

        // поле Срок платежа отсутствует на форме, должно быть очищено
        this.c.TERM = "";
        // признак срочности не используется
        this.c.IS_URGENT = "";
        if (this.actionOf(DocumentAction.NEW)) {
            this.selectedAccount = AccountUtils.getAccountFromCacheOrDefault(this.accounts);
            // очередность по умолчанию для новых документов 5
            this.c.QUEUE = "5";
            // Вид операции. В соответствии с указанием ЦБ, для платежного поручения всегда 01
            this.c.TYPE_OPER = "01";
            // платеж в пользу третьих лиц по умолчанию выключен
            this.c.IS_TAX_FOR_THIRD_PARTY = "0";
        } else if (this.actionOf(DocumentAction.COPY, DocumentAction.EDIT, DocumentAction.IMPORT)) {
            if (this.isBudget && /\d{2}\.\d{2}\.\d{4}/.test(this.c.CHARGE_DATE_DOC as string)) {
                this.chargeDateDoc = DateUtils.parseDate(this.c.CHARGE_DATE_DOC as string).toDate();
            }
            // ищем статус составителя среди доступных для данного типа формы статусов, если не находим - устанавливаем пустой
            this.selectedChargeCreator = this.chargeCreatorStatuses.find(status => status.id === (this.c.CHARGE_CREATOR as string)) || null;
            // если среди доступных статусов составителя не найден статус из контента документа, обновляем его и выполняем обновление связанных полей
            if (!this.selectedChargeCreator && this.chargeCreatorStatuses.length > 0) {
                this.selectedChargeCreator = this.chargeCreatorStatuses[0];
                this.onChargeCreatorSelect(this.selectedChargeCreator);
            }
            // для Прочих бюджетных Оснований нет
            const basises = ChargeBasisValues.getByFormType(FormPaymentType.valueOf(this.selectedPaymentType.text));
            this.selectedChargeBasis = basises && basises.find(basis => basis.id === this.c.CHARGE_BASIS) || this.chargeBasisValues[0] || null;
            // выставляем очередность платежа и НДС из деталей платежа
            this.selectedQueue = this.queueValues[parseInt(<string> this.c.QUEUE, 10) - 1];
            // если в контенте было невалидное значение выставляем по умолчанию (через вотчер)
            if (!this.selectedQueue) {
                this.selectedQueue = this.queueValues[4];
            }
            this.onPaymentDetailsChange();
            // при выставлении обновится информации в контенте о счете и банке плательщика, обновлено имя и ИНН плательщика
            const account = this.accounts.find(value => {
                if (value.accountNumber === this.c.PAYER_ACCOUNT) {
                    return !this.c.PAYER_BANK_BIC || this.c.PAYER_BANK_BIC === this.banksByAccountId[value.ibankAccountId].bic;
                }
                return false;
            });
            this.selectedAccount = account || this.accounts[0];
            if (this.thirdPartyPayment) {
                this.thirdPartyPayerName = this.thirdPartyHelper.getThirdPartyNameFromDetails(this.c.PAYMENT_DETAILS as string,
                    this.c.CHARGE_CREATOR as string) || "";
                this.thirdPartyHelper.prepareThirdPartyPanel(this.c, this.selectedAccount);
            }
        }
    }

    /**
     * Проверяет номер счета получателя и его ключевание после заполнения, проверяет счет на бюджетность.
     * @return {Promise<void>}
     */
    @Watch("document.content.RCPT_ACCOUNT")
    private async onRcptAccountFilled(): Promise<void> {
        this.validator.checkRcptAccountKeyAndPutError(this.c);
        await this.processRcptAccount();
    }

    /**
     * Заполняет поле CHARGE_DATE_DOC в контенте документа
     */
    @Watch("chargeDateDoc")
    private onChargeDateDocChange(newDate: Date): void {
        this.c.CHARGE_DATE_DOC = moment(newDate).format(DateFormat.DATE);
    }

    /**
     * Обработчик ввода в поле Назначение платежа.
     * Проверяет введенное значение и если там содержится строка "НДС не облагается", выставляем данный тип НДС автоматически
     */
    @Watch("document.content.PAYMENT_DETAILS")
    private onPaymentDetailsChange(): void {
        const paymentDetails = (<string> this.c.PAYMENT_DETAILS).toLowerCase();
        if (paymentDetails.indexOf(PaymentHelper.NONE_NDS_MSG.toLowerCase()) !== -1) {
            this.selectedNdsValue = this.ndsValues[this.ndsValues.length - 1];
            return;
        }
        if (paymentDetails.indexOf(NdsValue._10) !== -1) {
            this.selectedNdsValue = this.ndsValues[1];
            return;
        }
        if (paymentDetails.indexOf(" " + NdsValue._0) !== -1) {
            this.selectedNdsValue = this.ndsValues[2];
            return;
        }
        if (paymentDetails.indexOf(`${this.systemDefaultNdsProperty}%`) !== -1) {
            this.selectedNdsValue = this.ndsValues[0];
            return;
        }
    }

    /**
     * Добавляет рассчитанное значение НДС к Назначению платежа в зависимости от выбранного типа
     */
    @Watch("selectedNdsValue")
    private onNdsValueChange(): void {
        this.onPaymentDataChange();
    }

    /**
     * Устанавливает в контент очередность платежа
     */
    @Watch("selectedQueue")
    private onQueueValueChange(): void {
        this.c.QUEUE = this.selectedQueue.text;
    }

    /**
     * Обработчик выбора счета плательщика.
     * Заполняет в контенте документа поля с номером счета плательщика и БИКом банка плательщика
     * @param {Account} account выбранный счет
     */
    @Watch("selectedAccount")
    private onAccountSelect(account: Account): void {
        this.refresher.updatePayerBankInfo(this.c, account, this.banksByAccountId);
        this.processPayerFields();
    }

    /**
     * Отслеживаем изменение флага срочного платежа и меняем контент документа в зависимости
     * от установленного значения
     * @param {boolean} newValue новое значение флага
     */
    @Watch("urgentPayment")
    private onUrgentPaymentFlagChange(newValue: boolean) {
        this.c.PAYMENT_TYPE = newValue ? this.urgentPaymentType.type : "";
        this.c.PAYMENT_TYPE_CODE = newValue ? this.urgentPaymentType.code : "";
    }

    /**
     * Заполняет контент данными из выбранного получателя
     * @param {RecentRecipient} recipient выбранный получатель
     */
    private async onSelectRecipient(recipient: RecentRecipient): Promise<void> {
        // В случае, если значения полей не изменяются, их обработчики не вызовутся стандартным механизмом. Вызовем их вручную
        const needInvokeIndicatorManualy = this.c.RCPT_INN === recipient.rcpt_inn;
        const needRefreshBankInfoManualy = this.c.RCPT_BANK_BIC === recipient.rcpt_bank_bic;
        this.c.RCPT_INN = recipient.rcpt_inn;
        this.c.RCPT_NAME = recipient.rcpt_name;
        this.c.RCPT_ACCOUNT = recipient.rcpt_account;
        this.c.RCPT_BANK_BIC = recipient.rcpt_bank_bic;
        if (needInvokeIndicatorManualy) {
            await this.$refs.indicator.check();
        }
        if (needRefreshBankInfoManualy) {
            await this.onRcptBankBicFilled(recipient.rcpt_bank_bic);
        }
    }

    /**
     * Осуществляет поиск банка по БИК. Если банк найден, заполняется поле
     * Наименование банка получателя, список банков очищается.
     * @param newValue новое значение
     * @return {Promise<void>}
     */
    @CatchErrors
    private async onRcptBankBicFilled(newValue: string): Promise<void> {
        await this.fillRcptBankInfo(newValue);
    }

    /**
     * Осуществляет поиск банка по БИК. Если банк найден, заполняется поле
     * Наименование банка получателя, список банков очищается.
     * @param rcptBankBic новое значение
     * @return {Promise<void>}
     */
    private async fillRcptBankInfo(rcptBankBic: string): Promise<void> {
        this.c.RCPT_BANK_BIC = rcptBankBic;
        if (this.c.RCPT_BANK_BIC.length === 9) {
            this.refresher.setRcptBankInfoToContent(this.c, await this.bankService.getBank(<string> this.c.RCPT_BANK_BIC));
            this.banks = [];
            this.validator.checkRcptAccountKeyAndPutError(this.c);
            await this.processRcptAccount();
        }
    }

    /**
     * Обрабатывает дату введенную пользователем. Так как на поле нет форматтера, проверяем дату здесь.
     * @param props свойства объекта date-picker
     * @param {string} text введенный текст
     */
    private processDateValue(props: any, text: string): void {
        if (CommonUtils.isBlank(text)) {
            return;
        }
        // значения в поле Дата документа может быть 0 или валидная дата
        if (text === "0") {
            this.c.CHARGE_DATE_DOC = "0";
            return;
        }
        let isSet = false;
        if (/\d{1,2}\.\d{1,2}\.\d{4}/.test(text)) {
            const date = DateUtils.parseDate(text);
            if (date.isValid()) {
                props.updateValue(moment(date).format(DateFormat.DATE));
                isSet = true;
            }
        }
        if (!isSet) {
            this.$errors.add({field: "CHARGE_DATE_DOC", msg: "Введите корректную дату в формате ДД.ММ.ГГГГ или 0"});
            this.c.CHARGE_DATE_DOC = "";
        }
    }

    /**
     * Следит за изменением поля Сумма, обновляет НДС в поле Назначение
     * Watcher не используется специально, чтобы не пересчитывался НДС при копировании и создании из черновика
     */
    private onAmountChanged(): void {
        this.onPaymentDataChange();
    }

    /**
     * Осуществляет поиск банка получателя с задержкой ввода
     * @param {string} query
     * @param {(...args: any[]) => void} loading
     * @return {Promise<void>}
     */
    @CatchErrors
    private async searchRcptBank(query: string, loading: (...args: any[]) => void): Promise<void> {
        loading(true);
        clearTimeout(this.currentTimer);
        const delay = new Promise((resolve, reject) => {
            this.currentTimer = setTimeout(async () => {
                try {
                    this.banks = (await this.bankService.getBanks({bank_name: query, pageSize: 5, pageNumber: 0})).content;
                    loading(false);
                } catch (error) {
                    reject(error);
                }
            }, 1000);
        });

        try {
            delay.then(() => {
                clearTimeout(this.currentTimer);
                loading(false);
            });
        } catch (error) {
            clearTimeout(this.currentTimer);
            loading(false);
            throw error;
        }
    }

    /**
     * Обработчик выбора банка получателя.
     * Проставляет в контент документа поля: корреспондентский счет, название и БИК банка
     * Проверяет номер счета плательщика и его ключевание после заполнения, так как БИК изменился
     * @return {void}
     */
    @CatchErrors
    private async onBankSelect(bank: BankData): Promise<void> {
        this.refresher.setRcptBankInfoToContent(this.c, bank);
        this.validator.checkRcptAccountKeyAndPutError(this.c);
        await this.processRcptAccount();
    }

    /**
     * Обработчик смены типа платежа.
     * Очищает поля документа, которые скрываются.
     * @param selectedType выбранный тип формы
     */
    private async onPaymentTypeChange(selectedType: ButtonGroupData): Promise<void> {
        this.warningMessage = null;
        this.selectedPaymentType = selectedType;
        // Сброс переданного извне контента при смене формы TODO: убрать после кастомизации формы для оплат задач налогового календаря
        this.documentBehaviorService.deleteBehavior();
        await this.changePaymentType(true);
        // выключаем признак платежа за третье лицо при переключении типа формы
        this.c.IS_TAX_FOR_THIRD_PARTY = "0";
        this.updateThirdPartyPaymentDetails();
        // устанавливаем курсор на первое редактируемое поле
        const input: any = window.document.querySelector("input[type=text]:not([readonly])");
        if (input) {
            input.focus();
        }
    }

    /**
     * Обновляет детали платежного поручения при изменении названия получателя - третьего лица
     * @param newValue новое значение
     */
    private onThirdPartyNameChange(newValue: string): void {
        this.thirdPartyPayerName = newValue;
        this.thirdPartyHelper.updateThirdPartyPaymentDetails(this.c, this.thirdPartyPayerName);
    }

    /**
     * Обновляет КПП третьего лица при изменении ИНН плательщика - третьего лица
     */
    private onThirdPartyInnChange(): void {
        this.thirdPartyHelper.updateThirdPartyKpp(this.c);
    }

    /**
     * Обрабатывает изменения реквизитов получателя
     */
    private async onRcptInnChanged(): Promise<void> {
        if ([10, 12].includes(this.c.RCPT_INN.length) && this.initialized) {
            await this.$refs.hcsComponent.handleChangeRcptInfo();
        }
    }

    /**
     * Меняет тип платежной формы, очищает и обновляет поля контента в соответствии с типом.
     */
    private async changePaymentType(processBudgetFields = false): Promise<void> {
        // очищаем значения предустановленных полей при переключении с платежа в Таможню
        if (this.isCustomsPaymentSelected) {
            for (const field of Object.keys(CUSTOMS_DATA)) {
                this.c[field] = "";
            }
        }
        // сбрасываем флаг
        this.isCustomsPaymentSelected = false;
        // проставляем признак бюджетного платежа для всех типов кроме Контрагенту
        this.c.IS_CHARGE = this.isCounterparty() ? "0" : "1";
        // ТЗ 109753. поле Код платежа на форме не отображается
        this.c.CHARGE_TYPE = "";
        this.fillChargeCreatorAndBasisLists();
        // устанавливаем значения в форме в зависимости от типа платежа
        switch (FormPaymentType.valueOf(this.selectedPaymentType.text)) {
            case FormPaymentType.COUNTERPARTY:
                this.c.RCPT_KPP = "";
                this.c.KPP = "";
                break;
            case FormPaymentType.TAX:
                // устанавливаем основание платежа по умолчанию для платежа в налоговую: ТП - платежи текущего года
                this.selectedChargeBasis = this.chargeBasisValues.find(value => "ТП" === value.id) || null;
                break;
            case FormPaymentType.CUSTOMS:
                // устанавливаем основание платежа по умолчанию для платежа в таможню
                this.selectedChargeBasis = this.chargeBasisValues[0];
                // заполняем контент документа информацией необходимой для платежа
                for (const field of Object.keys(CUSTOMS_DATA)) {
                    this.c[field] = (CUSTOMS_DATA as any)[field];
                }
                this.isCustomsPaymentSelected = true;
                // обновляем информацию о банке
                await this.refresher.updateRcptBankInfo(this.c);
                break;
            case FormPaymentType.BUDGET:
                break;
        }

        if (!this.isCounterparty()) {
            this.urgentPayment = false;
        }

        if (processBudgetFields) {
            await this.processBudgetFields(this.isBudget);
        }
        if (!this.thirdPartyPayment) {
            this.processPayerFields();
            this.refresher.updateKpp(this.c);
        }
        // очищаем ошибки валидации
        this.$errors.clear();
    }

    /**
     * Заполняет списки выбора Статуса составителя (поле 101), Основания платежа (поле 106)
     */
    private fillChargeCreatorAndBasisLists(): void {
        this.chargeBasisValues = [];
        this.chargeCreatorStatuses = [];
        if (!this.isCounterparty()) {
            if (this.thirdPartyPayment) {
                this.chargeCreatorStatuses = ChargeCreatorStatuses.getStatusesForThirdParty(FormPaymentType.valueOf(this.selectedPaymentType.text));
            } else {
                const clientType = ClientType.valueOf(this.clientInfo.clientInfo.type);
                this.chargeCreatorStatuses = ChargeCreatorStatuses.getByFormType(FormPaymentType.valueOf(this.selectedPaymentType.text), clientType);
            }
            this.chargeBasisValues = ChargeBasisValues.getByFormType(FormPaymentType.valueOf(this.selectedPaymentType.text));
            this.selectedChargeCreator = this.chargeCreatorStatuses[0];
        }
    }

    /**
     * Заполняет поля контента документа (Наименование получателя и КПП) на основании информации о контрагенте из Индикатора
     * @param {ContractorInfo} contractor
     */
    private onIndicatorEvent(contractor: ContractorInfo): void {
        // заполняем, если банк не отключил этот функционал
        if (this.helper.useIndicatorForFillContractors()) {
            // поле КПП получателя для платежа Контрагенту скрыто, если получатель не найден, очищаем это поле
            if (contractor) {
                this.c.RCPT_NAME = contractor.paymentName;
                this.c.RCPT_KPP = contractor.kpp;
            } else if (this.isCounterparty()) {
                this.c.RCPT_KPP = "";
            }
        }
    }

    /**
     * Выполняет действия с контентом при изменении данных (Поля Сумма и тип НДС) влияющих на поле Назначение
     */
    @CatchErrors
    private onPaymentDataChange(): void {
        // если документ импортирован, то значение ставки НДС не задано для вычисления на основании деталей платежа
        if (!this.selectedNdsValue) {
            return;
        }
        const selectedNds = this.selectedNdsValue === this.ndsValues[0] ? `${this.systemDefaultNdsProperty}%` : this.selectedNdsValue.text;
        // значение НДС сбрасывается при импорте платежного поручения
        const formattedNds = this.selectedNdsValue ? this.helper.getFormattedNds(selectedNds, <string> this.c.AMOUNT) : null;
        if (CommonUtils.isBlank(formattedNds)) {
            return;
        }
        // если Назначение содержит значение НДС, ничего не делаем
        let paymentDetails = <string> this.c.PAYMENT_DETAILS;
        if (paymentDetails.indexOf(formattedNds) !== -1) {
            return;
        }
        // иначе заменяем текущее значение в Назначении платежа
        let regex: RegExp;
        if (paymentDetails.indexOf(PaymentHelper.NONE_NDS_MSG) !== -1) {
            regex = new RegExp(PaymentHelper.NONE_NDS_MSG, "g");
        } else {
            regex = NDS_DETAILS_REGEX;
        }
        let newPaymentDetails = paymentDetails.replace(regex, formattedNds);
        if (paymentDetails === newPaymentDetails) {
            // Обрезаем информацию о платеже за услуги ЖКХ
            let hcsString = "";
            if (this.$refs.hcsComponent && this.$refs.hcsComponent.hcsEnabled) {
                hcsString = this.$refs.hcsComponent.getHcsStringFromPaymentDetails();
                paymentDetails = paymentDetails.substring(0, paymentDetails.lastIndexOf("<"));
            }
            newPaymentDetails = paymentDetails + " " + formattedNds;
            if (hcsString) {
                newPaymentDetails += "<" + hcsString + ">";
            }
        }
        const isLengthInvalid = newPaymentDetails.length > 210;
        if (isLengthInvalid) {
            this.$errors.add({field: "PAYMENT_DETAILS", msg: `Строка "${formattedNds}" не умещается в поле "Назначение платежа"`});
        }
        this.c.PAYMENT_DETAILS = newPaymentDetails;
    }

    /**
     * Обработчик выбора статуса составителя. Проставляет идентификатор в контент документа.
     * @param {ChargeCreatorStatus} chargeCreator
     */
    private onChargeCreatorSelect(chargeCreator: ChargeCreatorStatus): void {
        this.c.CHARGE_CREATOR = chargeCreator.id;
        this.refresher.updateKpp(this.c);
        // обновляем в контенте информацию о клиенте на основе данных о Статусе составителя
        this.processPayerFields();
    }

    /**
     * Обработчик выбора основания платежа. Проставляет идентификатор в контент документа.
     * @param {ChargeBasis} chargeBasis
     */
    private onChargeBasisSelect(chargeBasis: ChargeBasis): void {
        this.c.CHARGE_BASIS = chargeBasis.id;
    }

    /**
     * Отслеживает изменение флага срочного платежа и меняет контент документа в зависимости
     * от установленного значения
     */
    private onThirdPartyFlagChange() {
        this.updateThirdPartyPaymentDetails();
    }

    /**
     * Валидирует документ на сервере. Вызывается только если локальная валидация прошла успешно.
     * Ошибки, которые пользователь может исправить биндятся к полям, которые не может, отображаются глобально.
     * @return {Promise<void>}
     */
    private async validate(): Promise<boolean> {
        const errors = await this.documentService.validate(DocumentType.PAYMENT, this.document);
        for (const fieldId of Object.keys(errors)) {
            if (fieldId.startsWith("WARN_")) {
                continue;
            }
            this.$errors.add({field: fieldId, msg: (errors as any)[fieldId]});
        }
        if (this.$errors.count() !== 0) {
            // проверяем на ошибки, которые не может исправить пользователь. Идентификаторы полей не участвующих в валидации
            for (const error of this.$errors.items) {
                if (!this.fields.includes(error.field)) {
                    UI.emit(GlobalEvent.HANDLE_ERROR, new Error(error.msg));
                }
            }
            throw new Error(ERROR_SEND_DOC);
        }
        return true;
    }

    /**
     * Валидирует и отправляет платежное поручение
     * @return {Promise<void>}
     */
    @CatchErrors
    private async send(): Promise<void> {
        // запрашиваем номер и дату для нового документа при создании
        if (this.actionOf(DocumentAction.NEW, DocumentAction.EDIT, DocumentAction.COPY, DocumentAction.IMPORT)) {
            const document = await this.documentService.create(DocumentType.PAYMENT);
            this.c.NUM_DOC = document.content.NUM_DOC;
            this.c.DATE_DOC = document.content.DATE_DOC;
        }
        this.$errors.clear();
        // проверяем сначала заполнение полей, корректность введенных данных и проверяем документ на сервере
        const isValidAndConfirmed = await this.$refs.hcsComponent.checkHcsInfo() &&
            await this.validator.checkDocument(this.document, this.selectedAccount) && await this.validate();
        // пользователь не подтвердил отправку во время проверок или есть ошибки, которые необходимо исправить
        if (!isValidAndConfirmed) {
            return;
        }

        const sendHelper = new SendPaymentHelper();
        let documentSent = false;

        // Сохраняем и подписываем платеж
        const [docId, status] = await sendHelper.saveAndSignPayment(this.document, ContentType.DOCUMENT, this.documentBehaviorService.getExtContent());
        if (status === Status.REQUIRES_CONFIRMATION) {
            // Подтверждаем платеж
            try {
                documentSent = !!await sendHelper.confirmPayment(docId, this.document.content);
            } catch (error) {
                // Если при подтверждении платежа возникла ошибка, то показываем ее
                UI.emit(GlobalEvent.HANDLE_ERROR, error);
            }
        } else {
            documentSent = true;
        }

        this.needToConfirmLeave = false;
        if (documentSent) {
            await this.doAfterSend(docId);
            const currentRouter = this.$router;
            this.$router.push({name: "events"}, async () => {
                await new DocumentSuccessSendDialog().show({
                    router: currentRouter,
                    routerData: {name: "paymentView", params: {id: docId}},
                    message: "Платеж успешно отправлен"
                });
            });
        } else {
            this.$router.push({name: "paymentView", params: {id: docId}});
        }
    }

    /**
     * Выполнение дополнительных действий после отправки документа
     * @param docId идентификатор документа
     */
    private async doAfterSend(docId: string): Promise<void> {
        try {
            if (this.isCounterparty()) {
                await this.recentRecipientsService.saveByDocument(this.document);
            }
        } catch (e) {
            UI.emit(GlobalEvent.HANDLE_ERROR, e);
        }
        try {
            await this.counterpartiesService.createOrUpdateCounterparty(docId);
        } catch (e) {
            UI.emit(GlobalEvent.HANDLE_ERROR, e);
        }
    }

    /**
     * Сохраняет/обновляет черновик и осуществляет переход к списку событий
     * @return {Promise<void>}
     */
    @CatchErrors
    private async saveDraftAndLeave(): Promise<void> {
        const draftId = await this.saveDraft();
        this.needToConfirmLeave = false;
        const currentRouter = this.$router;
        this.$router.push({name: "events"}, async () => {
            await new DocumentSuccessSendDialog().show({
                router: currentRouter,
                routerData: {name: "paymentEdit", params: {id: draftId, action: "edit"}},
                message: "Черновик успешно сохранен"
            });
        });
    }

    /**
     * Сохраняет/обновляет черновик
     * @return {Promise<void>}
     */
    private async saveDraft(): Promise<string> {
        // запрашиваем номер и дату для нового документа при создании
        if (this.actionOf(DocumentAction.NEW, DocumentAction.EDIT, DocumentAction.COPY, DocumentAction.IMPORT)) {
            const document = await this.documentService.create(DocumentType.PAYMENT);
            this.c.NUM_DOC = document.content.NUM_DOC;
            this.c.DATE_DOC = document.content.DATE_DOC;
        }
        // Сохраняем
        return await this.documentService.save(this.document, ContentType.DRAFT, this.documentBehaviorService.getExtContent());
    }

    /**
     * Применяет переданный набор предзаполненных полей к контенту
     */
    private async applyPreparedContentIfExists(): Promise<void> {
        const preparedContent = this.documentBehaviorService.getPreparedContent();
        this.warningMessage = this.documentBehaviorService.getWarningMessage();
        if (preparedContent) {
            if (preparedContent.RCPT_BANK_BIC) {
                await this.fillRcptBankInfo(preparedContent.RCPT_BANK_BIC);
            }
            Object.keys(preparedContent).forEach(fieldName => this.c[fieldName] = preparedContent[fieldName]);
        }
    }

    /**
     * Определяет тип действия над документом
     * @returns {DocumentAction} тип действия над документом
     */
    private getDocumentAction(): DocumentAction {
        if (this.$route.params.id && "new" === this.$route.params.id.toLowerCase()) {
            return DocumentAction.NEW;
        }
        if (CommonUtils.isBlank(this.$route.params.action)) {
            throw new Error("Отсутствуют параметры запроса для отображения страницы Платежное поручение");
        }
        switch (this.$route.params.action.toLowerCase()) {
            case "copy":
                return DocumentAction.COPY;
            default:
                return DocumentAction.EDIT;
        }
    }

    /**
     * Проверяет присутствие действия в списке переданных действий
     * @param {DocumentAction} actions действия над документом
     * @returns {boolean} {@code true} если есть нужное действие, иначе {@code false}
     */
    private actionOf(...actions: DocumentAction[]): boolean {
        return actions.includes(this.action);
    }

    /**
     *  Устанавливает название плательщика с постфиксами
     *  если платеж бюджетный и/или счет плательщика расчетный Д.У.
     *  Пока эта автоматическая корректировка не распространяется на клиентов - банков-корреспондентов
     */
    private processPayerFields(): void {
        this.refresher.updatePayerInfoWithPostfix(this.c, this.selectedAccount);
    }

    /**
     * Проверяет бюджетность счета по номеру счета получателя и БИКу банка получателя и меняет тип формы при необходимости
     */
    private async processRcptAccount(): Promise<void> {
        const rcptBankBic = <string> this.c.RCPT_BANK_BIC;
        const rcptAccount = <string> this.c.RCPT_ACCOUNT;
        if (rcptAccount.length === 20 && rcptBankBic.length === 9) {
            // если введенный счет является бюджетным и тип платежа Контрагенту, необходимо переключить тип платежа на Прочие бюджетные
            if (await this.helper.getAccountBudgetLevel(rcptAccount, rcptBankBic) > 0 && this.isCounterparty()) {
                // тип платежа Прочие бюджетные
                this.selectedPaymentType = this.paymentTypes[1].nestedData[2];
                await this.changePaymentType(true);
                // выключаем признак платежа за третье лицо при переключении типа формы
                this.c.IS_TAX_FOR_THIRD_PARTY = "0";
                this.updateThirdPartyPaymentDetails();
            }
        }
    }

    /**
     * Включает/выключает бюджетные поля
     * @param isBudget осуществляется ли платеж в бюджет РФ
     */
    private async processBudgetFields(isBudget: boolean): Promise<void> {
        const paymentChargeFields = new PaymentChargeFields("CHARGE_CREATOR", "CHARGE_BASIS",
            "CHARGE_PERIOD", "CHARGE_OKATO", "CHARGE_KBK",
            "CHARGE_NUM_DOC", "CHARGE_DATE_DOC");
        if (isBudget) {
            if (await this.helper.isGisGmpAcc(<string> this.c.RCPT_ACCOUNT, <string> this.c.RCPT_BANK_BIC)) {
                this.selectedChargeCreator = ChargeCreatorStatuses.getDefaultGisGmsStatus();
            }
            if (this.selectedChargeCreator) {
                paymentChargeFields.apply(this.selectedChargeCreator, this.c);
            }
        } else {
            paymentChargeFields.clear(this.c);
        }

        this.processPayerFields();
        this.refresher.updateKpp(this.c);
    }

    /**
     * Проверяет есть ли у документа необходимые данные для компонента Индикатор
     * @return true, если есть необходимые данные, false в противном случае
     */
    private isDataForIndicatorValid(): boolean {
        // документ на просмотре в статусах: "Новый" (код 0), "Подписан" (код 1), "Требует подтверждения" (код 30)
        // или документ открыт на редактирование (статуса нет - null)
        return [0, 1, 30, null].indexOf(this.document.status.code) !== -1;
    }

    /**
     * Выполняет действия связанные с платежом за третье лицо
     */
    private updateThirdPartyPaymentDetails(): void {
        this.fillChargeCreatorAndBasisLists();
        if (this.thirdPartyPayment) {
            this.c.KPP = "";
            this.c.PAYER_INN = "";
            this.thirdPartyHelper.enableAndFillThirdPartyPanel(this.c, this.selectedAccount);
        } else {
            // очищаем и возвращаем детали платежа, ИНН, КПП к первоначальным значениям
            this.thirdPartyPayerName = "";
            this.thirdPartyHelper.updateThirdPartyPaymentDetails(this.c);
            this.processPayerFields();
            // очищаем поле КПП, чтобы оно проставилось в методе
            this.c.KPP = "";
            this.refresher.updateKpp(this.c);
        }
    }

    /**
     * Обрабатывает импорт файлов
     * @param fileList список файлов
     */
    @CatchErrors
    private async onImportFiles(fileList: File[]): Promise<void> {
        const progressDialog = new ProgressDialog().show();
        // Сброс переданного извне контента при импорте файлов TODO: убрать после кастомизации формы для оплат задач налогового календаря
        this.documentBehaviorService.deleteBehavior();
        try {
            // TODO: Не вызывать updateForm два раза
            const importedContent = await this.importService.createContent(DocumentType.PAYMENT, fileList[0]);
            // Очищаем форму
            this.action = DocumentAction.NEW;
            this.document = await this.documentService.createEmpty(DocumentType.PAYMENT);
            await this.updateForm();
            // Заполняем форму импортированным контентом
            this.action = DocumentAction.IMPORT;
            // Убираем выбранное значение ставки НДС чтобы оно вычислялось на основании деталей платежа
            this.selectedNdsValue = null;
            this.document.content = importedContent;
            await this.initPaymentType();
            await this.updateForm();
            // TODO: показывать сообщение об успешном импорте
        } finally {
            progressDialog.close();
        }
    }

    /**
     * Осуществляет переход на список событий
     */
    private goToEvents(): void {
        this.needToConfirmLeave = false;
        this.$router.push({name: "events"});
    }

    /**
     * Возвращает контент документа
     * @returns {DocumentContent} контент документа
     */
    private get c(): DocumentContent {
        return this.document.content;
    }

    /**
     * Возвращает meta документа
     * @returns {DocumentMeta} meta документа
     */
    private get m(): DocumentMeta {
        return this.document.meta;
    }

    /**
     * Возвращает информацию о полях документа
     * @returns {FieldInfoMap} информация о полях документа
     */
    get f(): FieldInfoMap {
        return this.document.meta.fieldsMap;
    }

    /**
     * Возвращает признак платежа в Таможню
     * @return {boolean}
     */
    private isCustoms(): boolean {
        return this.selectedPaymentType.text === FormPaymentType.CUSTOMS.value;
    }

    /**
     * Возвращает признак платежа в Налоговую
     * @return {boolean}
     */
    private isTax(): boolean {
        return this.selectedPaymentType.text === FormPaymentType.TAX.value;
    }

    /**
     * Возвращает признак платежа контрагенту
     * @return {boolean}
     */
    private isCounterparty(): boolean {
        return this.selectedPaymentType.text === FormPaymentType.COUNTERPARTY.value;
    }

    /**
     * Возвращает признак прочих бюджетных платежей
     * @return {boolean}
     */
    private isOtherBudget(): boolean {
        return this.selectedPaymentType.text === FormPaymentType.BUDGET.value;
    }

    /**
     * Возвращает признак бюджетного платежа
     * @returns {boolean}
     */
    private get isBudget(): boolean {
        return this.c.IS_CHARGE === "1";
    }

    /**
     * Возвращает признак отображения поля 108. Для статуса составителя 16 поле не отображается
     * @return {string}
     */
    private get chargeNumDocFieldShowed(): boolean {
        return this.selectedChargeCreator === null || this.selectedChargeCreator.id !== "16";
    }

    /**
     * Возвращает правило валидации поля
     * @param {string} fieldName название поля
     * @return {string} правило валидации поля
     */
    private v(fieldName: string): string {
        return ValidationUtils.getValidationRule(this.f[fieldName]);
    }

    /**
     * Возвращает статус валидации поля
     * @param {string} fieldName
     * @return {ValidationResult}
     */
    private getValidationResult(fieldName: string): ValidationResult {
        return ValidationUtils.getValidationResult(fieldName, this.$errors);
    }

    /**
     * Возвращает форматер для поля КБК
     * ТЗ 53185: Ввод буквенно-цифровых КБК. Если свойство отключено разрешаем вводить только цифры
     */
    private get kbkFieldFormat(): FormatterOptions {
        return this.clientInfo.clientProperties["DOCUMENTS.BCC_ALPHANUMERIC.ENABLE"] === "true" ?
            {type: "text", rule: "20;!0123456789АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯABCDEFGHIJKLMNOPQRSTUVWXYZ"} : {type: "text", rule: "20;!0123456789"};
    }

    /**
     * Возвращает {@code true} если доступно редактирование поля КПП
     * @return {boolean}
     */
    private get showKppField(): boolean {
        const type = ClientType.valueOf(this.clientInfo.clientInfo.type);
        return [ClientType.CORPORATE, ClientType.BANK_CORR].includes(type) && this.helper.isKppEditable(this.isBudget);
    }

    /**
     * Возвращает признак платежа за третье лицо
     * @return {boolean}
     */
    private get thirdPartyPayment(): boolean {
        return this.c.IS_TAX_FOR_THIRD_PARTY === "1";
    }

    /**
     * Возвращает процент НДС из заданного системного свойства,
     * если системное свойство не задано, то берется значение по умолчанию
     */
    private getNdsPercent(): string {
        const defaultNds = this.clientInfo.clientProperties["DOCUMENTS.PAYMENT.NDS"];
        return defaultNds ? defaultNds : DEFAULT_NDS_VALUE;
    }

    /**
     * Проверяет относится ли статус составителя к физическим лицам
     */
    private get chargeForPhysics() {
        return this.thirdPartyHelper.isChargeForPhysics(this.selectedChargeCreator.id);
    }
}
