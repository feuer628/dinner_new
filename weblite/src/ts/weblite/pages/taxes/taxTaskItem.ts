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

import {CatchErrors} from "platform/decorators";
import {Inject} from "platform/ioc";
import {Component, Prop, UI} from "platform/ui";
import {CommonUtils} from "platform/utils/commonUtils";
import {DocumentUtils} from "../../common/documentUtils";
import {BtnReturn} from "../../model/btnReturn";
import {ClientType} from "../../model/clientType";
import {PlainContent} from "../../model/document";
import {FormPaymentType} from "../../model/formPaymentType";
import {GlobalEvent} from "../../model/globalEvent";
import {Status} from "../../model/status";
import {ClientService} from "../../service/clientService";
import {DocumentBehaviorService} from "../../service/documentBehaviorService";
import {TaskCategory, TaxCalendarService, TaxDocInfo, TaxTask} from "../../service/taxCalendarService";
import {IndicatorTaxOfficeModel, TaxSettings, TaxSettingsService} from "../../service/taxSettingsService";
import {DateFormat, DateUtils} from "../../utils/dateUtils";
import {CompleteTaskDialog} from "./completeTaskDialog";
import {RecoveryTaskDialog} from "./recoveryTaskDialog";

/**
 * Компонент отображения строки с информацией по задаче налогового календаря
 */
@Component({
    // language=Vue
    template: `
        <div class="operations-table__row">
            <div class="operations-table__cell" :class="{bold: isImportant}">
                {{ task.eventDate | displayDate }}
            </div>
            <!-- Описание задачи -->
            <div class="operations-table__cell w100pc maxW0">
                <div class="operation-title" :class="{bold: isImportant}">
                    {{ task.title }}
                    <span v-if="isCompleted"> (завершена {{ task.endDate }})</span>
                </div>
                <span v-if="showDescription" class="operation-description block">{{ task.description }}</span>
                <span v-if="task.docInfo" :class="['operation-docLink', 'block', isRejected(task.docInfo) ? 'rejected' : '']">
                    <!-- TODO верстка: -->
                    <a @click="goToPayment(task.docInfo)">
                        {{ getDocDescriptionBeginning(task.docInfo) }}
                    </a>
                        {{ getDocDescriptionEnding(false) }}
                </span>

                <span v-if="task.penaltyDocInfo" :class="['operation-docLink', 'block', isRejected(task.penaltyDocInfo) ? 'rejected' : '']">
                    <a @click="goToPayment(task.penaltyDocInfo)">
                        {{ getDocDescriptionBeginning(task.penaltyDocInfo) }}
                    </a>
                        {{ getDocDescriptionEnding(true) }}
                </span>
                <span v-if="task.comments" class="operation-description block">
                    {{ task.comments }}
                </span>
            </div>
            <!-- Панель быстрых действий -->
            <div class="operations-table__cell overflowV">
                <div class="operation-actions">
                    <a title="Уплатить" v-if="isPayable" class="icon icon-ruble" @click.stop="goToNewPayment(false)"></a>
                    <a title="Уплатить пени" v-if="isPenaltyPayable" class="icon icon-percent" @click.stop="goToNewPayment(true)"></a>
                    <a title="Завершить" v-if="!isCompleted" class="icon icon-done" @click.stop="completeTask"></a>
                    <a title="Возобновить" v-if="isCompleted" class="icon icon-restore" @click.stop="restoreTask"></a>
                </div>
            </div>
        </div>
    `
})
export class TaxTaskItem extends UI {

    @Inject
    private clientService: ClientService;
    /** Сервис для передачи поведения в компонент документа */
    @Inject
    private documentBehaviorService: DocumentBehaviorService;
    /** Сервис для работы с налоговыми событиями */
    @Inject
    private taxCalendarService: TaxCalendarService;
    /** Сервис для работы с настройками налогов */
    @Inject
    private taxSettingsService: TaxSettingsService;
    /** Отображаемая задача */
    @Prop({required: true})
    private task: TaxTask;
    /** Категория задачи */
    @Prop({required: true})
    private taxCategory: TaskCategory;

    /**
     * Завершает задачу
     */
    async completeTask(): Promise<void> {
        const result = await new CompleteTaskDialog().show();
        if (result !== null) {
            this.task.comments = result;
            await this.taxCalendarService.completeTask(this.task);
            UI.emit(GlobalEvent.REFRESH_TAX_TASKS_LIST);
        }
    }

    /**
     * Возобновляет задачу
     */
    async restoreTask(): Promise<void> {
        const isOverdue = DateUtils.parseDate(this.task.eventDate).isBefore(
            this.isDocumentDelivered(this.task.docInfo) ? DateUtils.parseDate(this.task.docInfo.docDate) : moment(), "day");

        if (await new RecoveryTaskDialog().show(isOverdue) === BtnReturn.YES) {
            await this.taxCalendarService.restoreTask(this.task.id);
            UI.emit(GlobalEvent.REFRESH_TAX_TASKS_LIST);
        }
    }

    /**
     * Осуществляет переход на страницу платежа
     */
    @CatchErrors
    async goToNewPayment(penalty: boolean): Promise<void> {
        const taxSettings = await this.taxSettingsService.getTaxSettings();
        const formPaymentType = this.task.documentContentContainer.paymentForm;
        let recipientContentPart: PlainContent = null;
        let warningMessage: string;
        if (taxSettings.taxOffice.fillFromIndicator) {
            try {
                const indicatorResponse = await this.taxSettingsService.getIndicatorTaxOffice();
                recipientContentPart = this.getIndicatorTaxOfficeContent(indicatorResponse);
            } catch (e) {
                warningMessage = `Внимание! В данный момент сервис "Индикатор" не доступен. Проверьте, пожалуйста,
                    актуальность реквизитов ${FormPaymentType.BUDGET === formPaymentType ?
                    `"Фонда социального страхования" (для платежа в ФСС).` :
                    `"Инспекции Федеральной налоговой службы" (для платежа в налоговую).`}`;
            }
        }
        if (!recipientContentPart) {
            recipientContentPart = FormPaymentType.BUDGET === formPaymentType ?
                this.getInsuranceOfficeContent(taxSettings) : this.getTaxOfficeContent(taxSettings);
        }
        const eventContentPart = penalty ? this.task.documentContentContainer.penaltyContent : this.task.documentContentContainer.paymentContent;

        this.documentBehaviorService.setBehavior({
            formPaymentType: formPaymentType,
            content: {
                ...eventContentPart,
                PAYMENT_DETAILS: eventContentPart.PAYMENT_DETAILS + " НДС не облагается",
                ...recipientContentPart,
                CHARGE_CREATOR: this.getCreatorStatus(formPaymentType)
            },
            extContent: {
                taxEventId: this.task.eventId,
                taxTaskId: CommonUtils.trimToNull(this.task.id),
                taxPenalty: penalty.toString()
            },
            warningMessage: warningMessage
        });
        this.$router.push({name: "paymentNew", params: {id: "new"}});
    }

    /**
     * Осуществляет переход на страницу просмотра/редактирования существующего платежа
     * @param docId идентификатор документа
     */
    goToPaymentView(docId: string) {
        this.$router.push({name: "paymentView", params: {id: docId}});
    }

    /**
     * Осуществляет переход на страницу редактирования если документ "Черновик", иначе на страницу просмотра
     */
    private goToPayment(docInfo: TaxDocInfo): void {
        this.isDraft(docInfo) ? this.goToPaymentEdit(docInfo.docId) : this.goToPaymentView(docInfo.docId);
    }

    /**
     * Формирует часть контента документа на основании реквизитов ФСС
     * @param taxSettings объект с настройками
     */
    private getInsuranceOfficeContent(taxSettings: TaxSettings): PlainContent {
        return {
            RCPT_INN: CommonUtils.trimToEmpty(taxSettings.insuranceOffice.inn),
            RCPT_KPP: CommonUtils.trimToEmpty(taxSettings.insuranceOffice.kpp),
            RCPT_NAME: CommonUtils.trimToEmpty(taxSettings.insuranceOffice.name),
            RCPT_BANK_BIC: CommonUtils.trimToEmpty(taxSettings.taxOffice.bic),
            RCPT_BANK_NAME: CommonUtils.trimToEmpty(taxSettings.taxOffice.bankName),
            RCPT_ACCOUNT: CommonUtils.trimToEmpty(taxSettings.taxOffice.account),
            CHARGE_OKATO: CommonUtils.trimToEmpty(taxSettings.taxOffice.oktmo)
        };
    }

    /**
     * Формирует часть контента документа на основании реквизитов ФНС
     * @param taxSettings объект с настройками
     */
    private getTaxOfficeContent(taxSettings: TaxSettings): PlainContent {
        return {
            RCPT_INN: CommonUtils.trimToEmpty(taxSettings.taxOffice.inn),
            RCPT_KPP: CommonUtils.trimToEmpty(taxSettings.taxOffice.kpp),
            RCPT_NAME: CommonUtils.trimToEmpty(taxSettings.taxOffice.name),
            RCPT_BANK_BIC: CommonUtils.trimToEmpty(taxSettings.taxOffice.bic),
            RCPT_BANK_NAME: CommonUtils.trimToEmpty(taxSettings.taxOffice.bankName),
            RCPT_ACCOUNT: CommonUtils.trimToEmpty(taxSettings.taxOffice.account),
            CHARGE_OKATO: CommonUtils.trimToEmpty(taxSettings.taxOffice.oktmo)
        };
    }

    /**
     * Формирует часть контента документа на основании реквизитов ФНС из сервиса "Индикатор"
     * @param indicatorTaxOffice объект с настройками из сервиса "Индикатор"
     */
    private getIndicatorTaxOfficeContent(indicatorTaxOffice: IndicatorTaxOfficeModel): PlainContent {
        return {
            RCPT_INN: CommonUtils.trimToEmpty(indicatorTaxOffice.inn),
            RCPT_KPP: CommonUtils.trimToEmpty(indicatorTaxOffice.kpp),
            RCPT_NAME: CommonUtils.trimToEmpty(indicatorTaxOffice.name),
            RCPT_BANK_BIC: CommonUtils.trimToEmpty(indicatorTaxOffice.bic),
            RCPT_BANK_NAME: CommonUtils.trimToEmpty(indicatorTaxOffice.bankName),
            RCPT_ACCOUNT: CommonUtils.trimToEmpty(indicatorTaxOffice.account),
            CHARGE_OKATO: CommonUtils.trimToEmpty(indicatorTaxOffice.oktmo)
        };
    }

    /**
     * Возвращает статус составителя
     * @param formPaymentType тип формы платежа
     * @return статус составителя
     */
    private getCreatorStatus(formPaymentType: FormPaymentType): string {
        const clientType = ClientType.valueOf(this.clientService.getClientInfo().clientInfo.type);
        if (formPaymentType === FormPaymentType.BUDGET) {
            return "08";
        }
        switch (clientType) {
            case ClientType.CORPORATE:
                return "01";
            case ClientType.INDIVIDUAL:
                return "09";
            case ClientType.NOTARY:
                return "10";
            case ClientType.LAWYER:
                return "11";
            case ClientType.FARM:
                return "12";
        }
        return "";
    }

    /**
     * Осуществляет переход на страницу редактирования существующего платежа
     * @param docId идентификатор документа
     */
    private goToPaymentEdit(docId: string) {
        this.$router.push({name: "paymentEdit", params: {id: docId, action: "edit"}});
    }

    /**
     * Возвращает признак возможности оплаты по задаче
     * @return {boolean} признак возможности оплаты по задаче
     */
    private get isPayable(): boolean {
        return this.taxCategory !== TaskCategory.COMPLETED && (!this.task.docInfo || this.isRejected(this.task.docInfo));
    }

    /**
     * Возвращает признак возможности оплаты пенни по задаче
     * @return {boolean} признак возможности оплаты пенни по задаче
     */
    private get isPenaltyPayable(): boolean {
        return this.taxCategory === TaskCategory.OVERDUE &&
            (!this.task.penaltyDocInfo || this.isRejected(this.task.penaltyDocInfo));
    }

    /**
     * Возвращает признак отметки события как важного (если событие не завершено и не оплачено)
     */
    private get isImportant(): boolean {
        return this.taxCategory === TaskCategory.ACTUAL && !this.isDocumentDelivered(this.task.docInfo) ||
            this.taxCategory === TaskCategory.OVERDUE && !(this.isDocumentDelivered(this.task.docInfo) && this.isDocumentDelivered(this.task.penaltyDocInfo));
    }

    /**
     * Возвращает признак завершенной задачи
     * @return {boolean} признак завершенной задачи
     */
    private get isCompleted(): boolean {
        return this.taxCategory === TaskCategory.COMPLETED;
    }

    /**
     * Возвращает признак отображения описания задачи
     * @return {boolean} признак отображения описания задачи
     */
    private get showDescription(): boolean {
        return !this.task.docInfo && !this.task.penaltyDocInfo && !this.task.comments;
    }

    /**
     * Возвращает признак того, что документ отправлен в банк
     * @param docInfo информация о документе
     */
    private isDocumentDelivered(docInfo: TaxDocInfo): boolean {
        return docInfo && !DocumentUtils.isClientSideStatus(docInfo.docStatus);
    }

    /**
     * Возвращает признак того, что документ отвергнут
     * @param docInfo информация о документе
     * @return {boolean} признак того что документ отвергнут
     */
    private isRejected(docInfo: TaxDocInfo): boolean {
        return docInfo.docStatus === Status.REJECTED;
    }

    /**
     * Возвращает признак того, что документ является черновиком
     * @param docInfo информация о документе
     * @return признак того, что документ является черновиком
     */
    private isDraft(docInfo: TaxDocInfo): boolean {
        return docInfo.docStatus === Status.DRAFT;
    }

    /**
     * Возвращает описание документа
     * @return описание документа
     */
    private getDocDescriptionEnding(isPenaltyDoc: boolean): string {
        const docInfo: TaxDocInfo = isPenaltyDoc ? this.task.penaltyDocInfo : this.task.docInfo;
        const docDate = DateUtils.parseDate(docInfo.docDate);
        const target = isPenaltyDoc ? "по уплате пени" : "в бюджет";
        const rejectedPart = this.isRejected(docInfo) ? " было отвергнуто банком" : "";
        return `${target} от ${docDate.format(DateFormat.CURRENT_YEAR_FORMAT)}${rejectedPart}.`;
    }

    /**
     * Возвращает строку ссылочной части описания задачи в соответствии с результатами проверки на тип документа(Черновик)
     */
    private getDocDescriptionBeginning(docInfo: TaxDocInfo): string {
        return this.isDraft(docInfo) ? "Черновик платежного поручения" : "Платежное поручение";
    }
}
