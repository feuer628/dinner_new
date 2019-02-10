import {CatchErrors} from "platform/decorators";
import {Inject} from "platform/ioc";
import {PrintService} from "platform/services/printService";
import {Component, UI} from "platform/ui";
import {CommonUtils} from "platform/utils/commonUtils";
import {DocumentUtils} from "../../common/documentUtils";
import {DocumentSuccessSendDialog} from "../../components/dialogs/documentSuccessSendDialog";
import {RemoveConfirmDialog} from "../../components/dialogs/removeConfirmDialog";
import {EmailInput} from "../../components/emailInput";
import {MessageComponent} from "../../components/message/messageComponent";
import {DocumentPrintHelper} from "../../components/print/documentPrintHelper";
import {RecallInput} from "../../components/recallInput";
import {TemplatePage} from "../../components/templatePage";
import {BtnReturn} from "../../model/btnReturn";
import {ChargeBasis, ChargeBasisValues} from "../../model/chargeBasisValues";
import {ChargeCreatorStatus, ChargeCreatorStatuses} from "../../model/chargeCreatorStatuses";
import {ClientInfo} from "../../model/clientInfo";
import {ClientType} from "../../model/clientType";
import {Document, DocumentType, FieldInfoMap} from "../../model/document";
import {FormPaymentType} from "../../model/formPaymentType";
import {GlobalEvent} from "../../model/globalEvent";
import {Status} from "../../model/status";
import {ClientService} from "../../service/clientService";
import {DocumentListFilter, DocumentService} from "../../service/documentService";
import {EmailService} from "../../service/emailService";
import {PermissionsService} from "../../service/permissionsService";
import {RecentRecipientsService} from "../../service/recentRecipientsService";
import {PaymentHelper} from "./paymentHelper";
import {SendPaymentHelper} from "./sendPaymentHelper";

@Component({
    // language=Vue
    template: `
        <template-page>
            <template slot="main">
                <div v-if="document" class="app-content__inner">
                    <div class="form-row page-header">
                        <span class="title">
                            Платеж № {{ c.NUM_DOC }} от {{ c.DATE_DOC | displayDateWithYear}}
                            <doc-status :document="document"></doc-status>
                        </span>
                        <div class="btn-group">
                            <div class="btn icon icon-print" title="Распечатать" @click="print"></div>
                            <div v-if="isRemovable()" class="btn icon icon-delete" title="Удалить" @click="onRemove"></div>
                        </div>
                    </div>

                    <div v-if="hasStatusDescription()" class="form-row margB30" :style="{ color: '#' + document.status.color }">{{ document.statusDesc }}</div>

                    <div v-if="showKppField" class="form-row">
                        <x-textfield :readonly="true" :value="c.KPP" :format="f.KPP" title="КПП плательщика" class="small"></x-textfield>
                    </div>

                    <div v-if="showKppField" class="separate-line"></div>

                    <div class="form-row" :class="{ 'form-row-wrap': !isCounterparty() }">
                        <!-- ИНН получателя -->
                        <x-textfield :readonly="true" :value="c.RCPT_INN" :format="f.RCPT_INN" title="ИНН получателя" class="small"></x-textfield>

                        <!-- КПП получателя -->
                        <x-textfield v-if="!isCounterparty()" :readonly="true" :value="c.RCPT_KPP" :format="f.RCPT_KPP" title="КПП получателя"
                                     class="small"></x-textfield>

                        <div class="wrapRow"></div>

                        <!-- Наименование получателя -->
                        <x-textfield :readonly="true" :value="c.RCPT_NAME" :format="f.RCPT_NAME" title="Наименование получателя" class="full"></x-textfield>
                    </div>

                    <div class="form-row">
                        <!-- БИК банка получателя -->
                        <x-textfield :readonly="true" :value="c.RCPT_BANK_BIC" :format="f.RCPT_BANK_BIC" title="БИК банка получателя"
                                     class="small"></x-textfield>

                        <!-- Счет получателя -->
                        <x-textfield :readonly="true" :value="c.RCPT_ACCOUNT" :format="f.RCPT_ACCOUNT" title="Счет получателя" class="full"></x-textfield>
                    </div>

                    <div class="form-row">
                        <!-- Наименование банка получателя -->
                        <x-textfield :readonly="true" :value="c.RCPT_BANK_NAME" :format="f.RCPT_BANK_NAME" title="Наименование банка получателя"
                                     class="full"></x-textfield>
                    </div>

                    <div class="separate-line"></div>

                    <!-- Блок полей отображаемых только для бюджетных платежей -->
                    <template v-if="isBudget">

                        <div class="form-row">
                            <!-- Статус составителя расчетного документа (поле 101) -->
                            <x-textfield :readonly="true" :value="selectedChargeCreator.id + ' - ' + selectedChargeCreator.value"
                                         title="Статус составителя расчетного документа (поле 101)"
                                         class="full"></x-textfield>
                        </div>

                        <div class="form-row">
                            <!-- КБК (поле 104) -->
                            <x-textfield :readonly="true" :value="c.CHARGE_KBK" :format="f.CHARGE_KBK" title="КБК (поле 104)" class="medium"></x-textfield>
                        </div>

                        <div class="form-row">
                            <!-- ОКТМО (поле 105) -->
                            <x-textfield :readonly="true" :value="c.CHARGE_OKATO" :format="f.CHARGE_OKATO" title="ОКТМО (поле 105)"
                                         class="medium"></x-textfield>
                        </div>

                        <div v-if="!isOtherBudget()" class="form-row">
                            <!-- Основание платежа для платежа (поле 106) в таможню или налоговую -->
                            <x-textfield :readonly="true" :value="selectedChargeBasis.id + ' - ' + selectedChargeBasis.value"
                                         title="Основание платежа (поле 106)"
                                         class="full"></x-textfield>
                        </div>

                        <div v-if="isCustoms() || isTax()" class="form-row">
                            <!-- Налоговый период или Код таможенного органа (поле 107) если платеж в Налоговую или в Таможню -->
                            <x-textfield :readonly="true" :value="c.CHARGE_PERIOD" :format="f.CHARGE_PERIOD"
                                         :title="(isCustoms() ? 'Код таможенного органа' : 'Налоговый период') + ' (поле 107)'"
                                         class="medium"></x-textfield>
                        </div>

                        <div class="form-row">
                            <!-- ИСФЛ или Номер документа (поле 108) -->
                            <x-textfield :readonly="true" :value="c.CHARGE_NUM_DOC" :format="f.CHARGE_NUM_DOC"
                                         :title="(isOtherBudget() ? 'ИСФЛ' : 'Номер документа') + ' (поле 108)'"
                                         class="medium"></x-textfield>
                        </div>

                        <div v-if="isCustoms() || isTax()" class="form-row">
                            <!-- Дата документа (поле 109) -->
                            <x-textfield :readonly="true" :value="c.CHARGE_DATE_DOC" :format="f.CHARGE_DATE_DOC" title="Дата документа (поле 109)"
                                         class="medium"></x-textfield>
                        </div>

                        <div class="form-row">
                            <!-- Код (УИН) -->
                            <x-textfield :readonly="true" :value="c.CODE" :format="f.CODE" title="Код (УИН)" class="medium"></x-textfield>
                        </div>

                        <div class="separate-line"></div>
                    </template>

                    <!-- TODO отображение комиссий -->
                    <div class="form-row">
                        <!-- Сумма -->
                        <x-textfield :readonly="true" :value="c.AMOUNT | amount" title="Сумма, ₽" class="small"></x-textfield>

                        <!-- Списано со счета -->
                        <x-textfield :readonly="true" :value="c.PAYER_ACCOUNT" :format="f.PAYER_ACCOUNT" title="Списано со счета"
                                     class="full"></x-textfield>
                    </div>

                    <div class="form-row">
                        <!-- Назначение -->
                        <x-textarea :readonly="true" :rows="5" :value="c.PAYMENT_DETAILS" title="Назначение" class="full"></x-textarea>
                    </div>

                    <div v-if="isCounterparty() && fieldNotEmpty(c.CODE)" class="form-row margT24 w470">
                        <!-- УИП -->
                        <x-textfield :readonly="true" :value="c.CODE" title="УИП" class="full"></x-textfield>
                    </div>

                    <div v-if="fieldNotEmpty(c.REZ_FIELD)" class="form-row w470">
                        <!-- Рез. поле -->
                        <x-textfield :readonly="true" :value="c.REZ_FIELD" :format="f.REZ_FIELD" title="Рез. поле" class="full"></x-textfield>
                    </div>

                    <div v-if="fieldNotEmpty(c.PAYMENT_TYPE)" class="form-row">
                        <!-- Вид платежа -->
                        <x-textfield :readonly="true" :value="c.PAYMENT_TYPE" title="Вид платежа" class="small"></x-textfield>
                    </div>

                    <!-- TODO Кнопки Печать/Отозвать должны отображаться только для соответствующих статусов -->
                    <div class="app-content-inner__footer payment-footer">
                        <div>
                            <progress-button v-if="isSendable()" class="btn btn-primary" :handler="onSend">Отправить</progress-button>
                            <a v-if="isEditable()" class="btn" :class="{'btn-primary': !isSendable()}" @click="onEdit">Изменить</a>
                            <a class="btn" v-else :class="{'btn-primary': !isSendable()}" @click="onCopy">Повторить</a>
                            <email-input class="margL16" :handler="onSendMail"></email-input>
                            <recall-input v-if="isRecallable()" class="margL16" :handler="onRecall"></recall-input>
                        </div>
                        <a class="btn " @click="goToEvents">Назад</a>
                    </div>
                </div>

                <spinner v-else></spinner>

            </template>
            <template slot="sidebar-top">
                <div v-if="!!recall" class="sidebar-content">
                    <div class="sidebar-row margB8">
                        <span class="sidebar-row-title">Отзыв</span>
                        <span class="light">{{ recall.content.DATE_DOC | displayDateWithYear }}</span>
                    </div>
                    <div class="margB8 breakWord">
                        {{ recall.content.REASON }}
                    </div>
                    <div class="margB30">
                        <doc-status :document="recall"></doc-status>
                    </div>
                    <template v-if="!!recall.statusDesc">
                        <div class="sidebar-row-title margB8">
                            Комментарий
                        </div>
                        <div class="breakWord">
                            <span>{{ recall.statusDesc }}</span>
                        </div>
                    </template>
                    <a v-if="isRecallRemovable()" class="btn block margT40" @click="onRecallRemove">Удалить</a>
                </div>
            </template>
        </template-page>
    `,
    components: {TemplatePage, EmailInput, RecallInput}
})
export class PaymentViewPage extends UI {

    /** Сервис по работе с документами */
    @Inject
    private documentService: DocumentService;
    /** Сервис по работе с печатью */
    @Inject
    private printService: PrintService;
    /** Сервис по работе с информацией о клиенте */
    @Inject
    private clientService: ClientService;
    /** Сервис по работе с email */
    @Inject
    private emailService: EmailService;
    /** Сервис по работе со списком последних получателей */
    @Inject
    private recentRecipientsService: RecentRecipientsService;
    /** Сервис для получения прав */
    @Inject
    private permissionsService: PermissionsService;
    /** Документ */
    private document: Document = null;
    /** Тип формы платежного поручения */
    private paymentType = FormPaymentType.COUNTERPARTY;
    /** Выбранный статус составителя */
    private selectedChargeCreator: ChargeCreatorStatus = null;
    /** Выбранный тип основания платежа */
    private selectedChargeBasis: ChargeBasis = null;
    /** Информация о клиенте */
    private clientInfo: ClientInfo = null;
    /** Helper для документа */
    private helper: PaymentHelper = null;
    /** Отзыв, связанный с просматриваемым документом */
    private recall: Document = null;
    /** Признак завершенной инициализации компонента */
    private initComplete = false;

    /**
     * Загружает документ для просмотра, определяет тип платежа
     * @inheritDoc
     * @returns {Promise<void>}
     */
    @CatchErrors
    async created(): Promise<void> {
        this.clientInfo = this.clientService.getClientInfo();
        this.helper = new PaymentHelper(this.clientInfo);
        await this.refresh();
        this.initComplete = true;
    }

    /**
     * Обновляет данные формы
     */
    private async refresh(): Promise<void> {
        this.document = await this.documentService.load(DocumentType.PAYMENT, this.$route.params.id);
        this.paymentType = this.helper.getFormPaymentType(this.c);
        // Тип платежа Контрагенту если платеж не бюджетный
        if (this.isBudget) {
            this.selectedChargeCreator = ChargeCreatorStatuses.getStatuses(<string> this.c.DATE_DOC)
                .find(value => value.id === <string> this.c.CHARGE_CREATOR);
        }
        // КБК начинается с цифр 182 - платеж в Налоговую
        if (this.paymentType === FormPaymentType.TAX) {
            this.selectedChargeBasis = ChargeBasisValues.getTax().find(value => value.id === <string> this.c.CHARGE_BASIS);
        }
        // КБК начинается с цифр 153 - платеж в Таможню
        if (this.paymentType === FormPaymentType.CUSTOMS) {
            this.selectedChargeBasis = ChargeBasisValues.getCustoms().find(value => value.id === <string> this.c.CHARGE_BASIS);
        }
        if (this.permissionsService.hasRecallPermission()) {
            await this.loadRecall();
        }
    }

    /**
     * Отправляет документ
     */
    @CatchErrors
    private async onSend(): Promise<void> {
        if (this.document.attachmentsCount) {
            throw new Error("Документ содержит вложения. Чтобы совершить платеж перейдите в Интернет-банк для корпоративных клиентов");
        }
        const sendHelper = new SendPaymentHelper();

        let documentSent = false;
        let documentChanged = false;

        let status = this.document.status;

        if ([Status.NEW, Status.ON_SIGN, Status.PREPARED].includes(status)) {
            status = await sendHelper.signPayment(this.document.id, this.document);
            documentChanged = true;
            documentSent = status !== Status.REQUIRES_CONFIRMATION;
        }

        if (status === Status.REQUIRES_CONFIRMATION) {
            try {
                documentSent = !!await sendHelper.confirmPayment(this.document.id, this.document.content);
                documentChanged = documentSent || documentChanged;
            } catch (error) {
                // Если при подтверждении платежа возникла ошибка, то показываем ее
                UI.emit(GlobalEvent.HANDLE_ERROR, error);
            }
        }

        if (documentSent) {
            try {
                if (this.isCounterparty()) {
                    await this.recentRecipientsService.saveByDocument(this.document);
                }
            } finally {
                const currentRouter = this.$router;
                this.$router.push({name: "events"}, async () => {
                    await new DocumentSuccessSendDialog().show({
                        router: currentRouter,
                        routerData: {name: "paymentView", params: {id: this.document.id}},
                        message: "Платеж успешно отправлен"
                    });
                });
            }
        } else if (documentChanged) {
            await this.refresh();
        }
    }

    /**
     * Открывает документ на редактирование
     */
    private onEdit(): void {
        this.$router.push({name: "paymentEdit", params: {id: this.document.id, action: "edit"}});
    }

    /**
     * Создает копию документа
     */
    private onCopy(): void {
        this.$router.push({name: "paymentEdit", params: {id: this.document.id, action: "copy"}});
    }

    /**
     * Печатает документ
     */
    @CatchErrors
    private async print(): Promise<void> {
        await this.printService.print(new DocumentPrintHelper([{
            id: this.document.id,
            docType: DocumentType.PAYMENT
        }]));
    }

    private async onSendMail(email: string): Promise<void> {
        await this.emailService.sendDocumentToEmail({
            employeeId: this.clientService.getClientInfo().employeeInfo.id,
            docDataList: [{
                docId: this.document.id,
                docType: DocumentType.PAYMENT.substr(4)
            }],
            recipientsList: [email]
        });
        MessageComponent.showToast("Письмо с документом успешно отправлено");
    }

    /**
     * Отзыв документа
     * @param {string} reason причина отзыва
     * @return {Promise<void>}
     */
    private async onRecall(reason: string): Promise<void> {
        const responses = await this.documentService.sendRecall(this.document, reason);
        if (Status.valueOf(responses[1].results.statusCode) === Status.ON_SIGN) {
            MessageComponent.showToast("Отзыв подписан. Для отправки требуются дополнительные подписи");
        } else {
            MessageComponent.showToast("Отзыв документа успешно отправлен");
        }
        await this.loadRecall();
    }

    /**
     * Проверяет и, если есть, загружает связанный с текущим документом отзыв
     * @return {Promise<void>}
     */
    private async loadRecall() {
        const filter: DocumentListFilter = {
            fields: [
                {name: "REASON"}
            ],
            statuses: [
                Status.NEW,
                Status.READY,
                Status.ON_EXECUTE,
                Status.ACCEPTED,
                Status.EXECUTED,
                Status.ON_SIGN,
                Status.REJECTED
            ].map(status => status.code),
            // Поиск по RECALL_DOC_ID
            query: `[4] == ${this.document.id}`
        };
        const recallResult = await this.documentService.getList(DocumentType.RECALL, filter);
        if (!recallResult.length) {
            this.recall = null;
        } else {
            this.recall = await this.documentService.load(DocumentType.RECALL, recallResult[0].DOC_ID);
        }
    }

    /**
     * Удаляет документ
     */
    @CatchErrors
    private async onRemove(): Promise<void> {
        if (await new RemoveConfirmDialog().show("Удалить документ без возможности восстановления?") === BtnReturn.YES) {
            await this.documentService.remove(DocumentType.PAYMENT, this.document.id);
            this.goToEvents();
        }
    }

    /**
     * Осуществляет переход к списку событий
     */
    private goToEvents(): void {
        this.$router.push({name: "events"});
    }

    /**
     * Удаляет отзыв
     */
    @CatchErrors
    private async onRecallRemove(): Promise<void> {
        if (await new RemoveConfirmDialog().show("Удалить отзыв документа?") === BtnReturn.YES) {
            await this.documentService.remove(DocumentType.RECALL, this.recall.id);
            await this.loadRecall();
        }
    }

    /**
     * Возвращает контент документа
     * @returns {DocumentContent} контент документа
     */
    private get c() {
        return this.document.content;
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
        return this.paymentType === FormPaymentType.CUSTOMS;
    }

    /**
     * Возвращает признак платежа в Налоговую
     * @return {boolean}
     */
    private isTax(): boolean {
        return this.paymentType === FormPaymentType.TAX;
    }

    /**
     * Возвращает признак платежа контрагенту
     * @return {boolean}
     */
    private isCounterparty(): boolean {
        return this.paymentType === FormPaymentType.COUNTERPARTY;
    }

    /**
     * Возвращает признак прочих бюджетных платежей
     * @return {boolean}
     */
    private isOtherBudget(): boolean {
        return this.paymentType === FormPaymentType.BUDGET;
    }

    /**
     * Возвращает можно ли отправить документ
     * @return {boolean} можно ли отправить документ
     */
    private isSendable(): boolean {
        return this.document && [Status.NEW, Status.ON_SIGN, Status.PREPARED, Status.REQUIRES_CONFIRMATION].includes(this.document.status);
    }

    /**
     * Возвращает признак возможности отредактировать документ
     * @return {boolean} признак возможности отредактировать документ
     */
    private isEditable(): boolean {
        return this.document && DocumentUtils.isEditableStatus(this.document.status);
    }

    /**
     * Возвращает признак возможности удалить отзыв документа
     * @return {boolean} признак возможности удалить отзыв документа
     */
    private isRecallRemovable(): boolean {
        return DocumentUtils.isClientSideStatus(this.recall.status);
    }

    /**
     * Возвращает признак возможности удалить документ
     * @return {boolean} признак возможности удалить документ
     */
    private isRemovable(): boolean {
        return this.document && DocumentUtils.isClientSideStatus(this.document.status);
    }

    /**
     * Возвращает признак возможности отозвать документ
     * @return {boolean} признак возможности отозвать документ
     */
    private isRecallable(): boolean {
        // Проверка на инициализацию компонента нужна, чтобы исключить "мелькание" кнопки отзыва при загрузке
        return this.initComplete && !this.recall && this.document && DocumentUtils.isRecallableStatus(this.document.status);
    }

    /**
     * Возвращает признак отображения комментария к статусу
     * @return {boolean}
     */
    private hasStatusDescription(): boolean {
        // По бизнес-логике комментарий может быть указан ещё для двух статусов: FOR_ACCEPTANCE и IN_CATALOG.
        // Так как соответствующий фунционал в версии "Web для ИП" не реализован, эти статусы в проверках не участвуют
        return Status.REJECTED === this.document.status && !!this.document.statusDesc;
    }

    /**
     * Возвращает признак бюджетного платежа
     * @returns {boolean}
     */
    get isBudget(): boolean {
        return this.c.IS_CHARGE === "1";
    }

    /**
     * Возвращает признак что значение поля не пустое
     * @param {string} value
     * @return {boolean}
     */
    private fieldNotEmpty(value: string): boolean {
        return !CommonUtils.isBlank(value);
    }

    /**
     * Возвращает {@code true} если поле КПП необходимо отобразить на форме просмотра документа
     * @return {boolean}
     */
    private get showKppField(): boolean {
        const type = ClientType.valueOf(this.clientInfo.clientInfo.type);
        return this.fieldNotEmpty(this.c.KPP as string) && [ClientType.CORPORATE, ClientType.BANK_CORR].includes(type) &&
            this.helper.isKppEditable(this.isBudget);
    }
}
