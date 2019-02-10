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
import {PrintService} from "platform/services/printService";
import {Component, Prop, UI} from "platform/ui";
import {DocumentUtils} from "../../common/documentUtils";
import {AmountType} from "../../components/amountComponent";
import {RemoveConfirmDialog} from "../../components/dialogs/removeConfirmDialog";
import {EmailInput} from "../../components/emailInput";
import {MessageComponent} from "../../components/message/messageComponent";
import {DocumentPrintHelper} from "../../components/print/documentPrintHelper";
import {RecallInput} from "../../components/recallInput";
import {BtnReturn} from "../../model/btnReturn";
import {DocumentType} from "../../model/document";
import {GlobalEvent} from "../../model/globalEvent";
import {Status} from "../../model/status";
import {ClientService} from "../../service/clientService";
import {DocumentService} from "../../service/documentService";
import {EmailService} from "../../service/emailService";
import {Event} from "../../service/eventsService";

/**
 * Компонент отображения строки с информацией по документу "Платежное поручение".
 */
@Component({
    // language=Vue
    template: `
        <div class="operations-table__row" :class="{ 'pinned': pinned }" @click="goToPayment">
            <div class="operations-table__cell">
                {{ event.date | displayDate }}
            </div>
            <!-- Сумма -->
            <amount class="operations-table__cell alignR" :value="event.amount" :type="getAmountType()"></amount>
            <!-- Отправитель/Получатель -->
            <div class="operations-table__cell w100pc maxW0">
                <div class="operation-title">{{ event.title }}</div>
                <span class="operation-description">{{ event.description }}</span>
            </div>
            <!-- Статус и панель быстрых действий -->
            <div class="operations-table__cell overflowV">
                <span class="operation-status" :style="{ color: '#' + status.color }">{{ status.name }}</span>
                <div class="operation-actions">
                    <email-input v-if="printable"
                                 :as-icon="true"
                                 :close-input-on-blur="true"
                                 transition="extend"
                                 class="margR8"
                                 @inputModeChange="pinned=$event"
                                 :handler="onSendMail"></email-input>
                    <recall-input v-if="recallable"
                                  :as-icon="true"
                                  :close-input-on-blur="true"
                                  transition="extend"
                                  class="margR8"
                                  @inputModeChange="pinned=$event"
                                  :handler="onRecall"></recall-input>
                    <a title="Распечатать" v-if="printable" class="icon icon-circle-print" @click.stop="onPrint"></a>
                    <a title="Повторить" v-if="repeatable" class="icon icon-circle-copy" @click.stop="onCopy"></a>
                    <a title="Удалить" v-if="removable" class="icon icon-circle-delete" @click.stop="onRemove"></a>
                </div>
            </div>
        </div>
    `,
    components: {EmailInput, RecallInput}
})
export class PaymentEventItem extends UI {

    /** Сервис по работе с информацией о клиенте */
    @Inject
    private clientService: ClientService;

    /** Сервис по работе с email */
    @Inject
    private emailService: EmailService;

    /** Сервис по работе с печатью */
    @Inject
    private printService: PrintService;

    /** Сервис по работе с документами */
    @Inject
    private documentService: DocumentService;

    /** Признак зафиксированной панели действий */
    private pinned = false;

    /** Отображаемый документ */
    @Prop({required: true})
    private event: Event;

    /** Статус */
    private status: Status = Status.valueOf(this.event.status);

    /**
     * Перейти на страницу платежа
     */
    private goToPayment(): void {
        let location: VueRouter.Location;
        if (this.draft) {
            location = {name: "paymentEdit", params: {id: this.event.id, action: "edit"}};
        } else {
            location = {name: "paymentView", params: {id: this.event.id}};
        }
        this.$router.push(location);
    }

    /**
     * Получить тип отображения суммы
     * @return {AmountType.REJECTED_EXPENSE | AmountType.UNPROCESSED_EXPENSE}
     */
    private getAmountType() {
        return this.status === Status.REJECTED ? AmountType.REJECTED_EXPENSE : AmountType.UNPROCESSED_EXPENSE;
    }

    /**
     * Возвращает признак возможности распечатать документ
     * @return {boolean} признак возможности распечатать документ
     */
    private get printable(): boolean {
        return !this.draft;
    }

    /**
     * Возвращает признак возможности удалить документ
     * @return {boolean} признак возможности удалить документ
     */
    private get removable(): boolean {
        return DocumentUtils.isClientSideStatus(this.status);
    }

    /**
     * Возвращает признак отображения кнопки "повторить". Кнопка отображается для тех документов, которые нельзя изменить
     * @return {boolean} признак отображения кнопки "повторить".
     */
    private get repeatable(): boolean {
        return !DocumentUtils.isEditableStatus(this.status);
    }

    /**
     * Возвращает признак возможности отозвать документ
     * @return {boolean} признак возможности отозвать документ
     */
    private get recallable(): boolean {
        return DocumentUtils.isRecallableStatus(this.status);
    }

    /**
     * Проверяет, является ли документ черновиком
     * @return {boolean} признак того, что документ является черновиком
     */
    private get draft(): boolean {
        return this.status === Status.DRAFT;
    }

    /**
     * Печать
     * @return {Promise<void>}
     */
    @CatchErrors
    private async onPrint(): Promise<void> {
        await this.printService.print(new DocumentPrintHelper([{
            id: this.event.id,
            docType: DocumentType.PAYMENT
        }]));
    }

    /**
     * Копирование
     */
    private onCopy(): void {
        this.$router.push({name: "paymentEdit", params: {id: this.event.id, action: "copy"}});
    }

    /**
     * Отправка по e-mail
     * @param {string} email адрес
     * @return {Promise<void>}
     */
    private async onSendMail(email: string): Promise<void> {
        await this.emailService.sendDocumentToEmail({
            employeeId: this.clientService.getClientInfo().employeeInfo.id,
            docDataList: [{
                docId: this.event.id,
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
        const document = await this.documentService.load(DocumentType.PAYMENT, this.event.id);
        // TODO рефакторинг: на странице просмотра платежа точно такой же код. Подумать над вынесением кода действий
        const responses = await this.documentService.sendRecall(document, reason);
        if (Status.valueOf(responses[1].results.statusCode) === Status.ON_SIGN) {
            MessageComponent.showToast("Отзыв подписан. Для отправки требуются дополнительные подписи");
        } else {
            MessageComponent.showToast("Отзыв документа успешно отправлен");
        }
    }

    /**
     * Удаление
     */
    @CatchErrors
    private async onRemove(): Promise<void> {
        if (await new RemoveConfirmDialog().show("Удалить документ без возможности восстановления?") === BtnReturn.YES) {
            await this.documentService.remove(DocumentType.PAYMENT, this.event.id);
            UI.emit(GlobalEvent.REFRESH_EVENTS_LIST);
        }
    }
}
