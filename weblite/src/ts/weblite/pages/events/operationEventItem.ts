import {CatchErrors} from "platform/decorators";
import {Inject} from "platform/ioc";
import {PrintService} from "platform/services/printService";
import {Component, Prop, UI} from "platform/ui";
import {AmountType} from "../../components/amountComponent";
import {EmailInput} from "../../components/emailInput";
import {MessageComponent} from "../../components/message/messageComponent";
import {OperationPrintHelper} from "../../components/print/operationPrintHelper";
import {AccountOperationService} from "../../service/accountOperationService";
import {EmailService} from "../../service/emailService";
import {Event, OperationType} from "../../service/eventsService";

/**
 * Компонент отображения строки с информацией по операции.
 */
@Component({
    // language=Vue
    template: `
        <div class="operations-table__row" :class="{ 'pinned': pinned }" @click="goToOperationView">
            <div class="operations-table__cell">
                {{ event.date | displayDate }}
            </div>
            <!-- Сумма -->
            <amount class="operations-table__cell alignR" :value="event.amount" :type="getAmountType()"></amount>
            <!-- Отправитель/Получатель -->
            <div class="operations-table__cell w100pc maxW0">
                <div class="operation-title"><span>{{ event.title }}</span></div>
                <span class="operation-description">{{ event.description }}</span>
            </div>
            <!-- Статус и панель быстрых действий -->
            <div class="operations-table__cell overflowV">
                <div class="operation-actions">
                    <email-input :as-icon="true"
                                 :close-input-on-blur="true"
                                 transition="extend"
                                 class="margR8"
                                 @focus="pinned=true"
                                 @blur="pinned=false"
                                 :handler="onSendMail"></email-input>
                    <a title="Распечатать" class="icon icon-circle-print" @click.stop="onPrint()"></a>
                    <!-- TODO повтор пока отключен -->
                    <!--<a title="Повторить" v-if="isCopyAvailable()" class="icon icon-circle-copy" @click.stop="onCopy()"></a>-->
                </div>
            </div>
        </div>
    `,
    components: {EmailInput}
})
export class OperationEventItem extends UI {

    /** Сервис по работе с печатью */
    @Inject
    private printService: PrintService;

    /** Сервис по работе с email */
    @Inject
    private emailService: EmailService;

    /** Сервис загрузки операций */
    @Inject
    private accountOperationService: AccountOperationService;

    /** Отображаемая операция */
    @Prop({required: true})
    private event: Event;

    /** Признак зафиксированной панели действий */
    private pinned = false;

    /**
     * Перейти на страницу просмотра операции
     */
    private goToOperationView(): void {
        this.$router.push({name: "operationView", params: {accountId: this.event.accountId, operationUid: this.event.id}});
    }

    /** Получить тип отображения суммы */
    private getAmountType() {
        switch (this.event.operationType) {
            case OperationType.EXPENSE:
                return AmountType.EXPENSE;
            case OperationType.INCOME:
                return AmountType.INCOME;
            default:
                throw new Error(`Неизвестный тип операции: ${this.event.operationType}, UID: ${this.event.id}`);
        }
    }

    /**
     * Печать операции
     * @return {Promise<void>}
     */
    @CatchErrors
    private async onPrint(): Promise<void> {
        // Для печати используется oper_hash. Т.к. в краткой информации данное поле отсутствует, загружаем полную информацию об операции
        const operation = await this.accountOperationService.getOperation(this.event.accountId, this.event.id);
        await this.printService.print(new OperationPrintHelper({
            operations: [{
                hash: operation.operHash,
                code: operation.operCode
            }],
            accountId: this.event.accountId,
            external: false
        }));
    }

    private onCopy(): void {
        // TODO повтор
    }

    /**
     * Обрабатывает запрос на отправку документа операции по email
     * @param {string} email адрес получателя email
     */
    private async onSendMail(email: string): Promise<void> {
        // Для экспорта используется oper_hash. Т.к. в краткой информации данное поле отсутствует, загружаем полную информацию об операции
        const operation = await this.accountOperationService.getOperation(this.event.accountId, this.event.id);
        await this.emailService.sendOperationDocumentToEmail({
            accountId: this.event.accountId,
            externalAccount: false,
            operationsHashes: [operation.operHash],
            emails: [email]
        });
        MessageComponent.showToast("Письмо с документом успешно отправлено");
    }

    /**
     * Проверяет, возможен ли повтор операции
     * @return {boolean}
     */
    private isCopyAvailable(): boolean {
        return this.event.operationCode === "01";
    }
}
