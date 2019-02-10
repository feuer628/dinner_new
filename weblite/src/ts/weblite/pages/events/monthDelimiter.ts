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

import {Inject} from "platform/ioc";
import {Component, Prop, UI} from "platform/ui";
import {Event, EventsService, EventType, OperationType} from "../../service/eventsService";
import {DateUtils} from "../../utils/dateUtils";
import Moment = moment.Moment;

/**
 * Компонент отображает в ленте событий разделитель с месячными итогами (зачисления и списания)
 */
@Component({
    // language=Vue
    template: `
        <div class="operations-table__row monthDelimiter">
            <div class="operations-table__cell">
                {{ dateDisplayValue }}
            </div>
            <div class="operations-table__cell"></div>
            <div class="operations-table__cell"></div>
            <div class="operations-table__cell">
                <div class="summary" v-if="showSummary">
                    <!-- В table-cell некорректно отрабатывает top: 50% если он является родителем-->
                    <div>
                        <div class="summary__item">
                            + <amount :value="getIncome()"></amount>
                        </div>
                        <div class="summary__item">
                            - <amount :value="getExpense()"></amount>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class MonthDelimiter extends UI {

    @Inject
    private eventService: EventsService;

    /**
     * Месяц
     */
    @Prop({required: true})
    private date: Moment;

    /**
     * Список событий
     */
    @Prop({required: true})
    private events: Event[];

    /**
     * Признак необходимости отображать суммы с итогами
     */
    @Prop({type: Boolean, required: true})
    private showSummary: boolean;

    /**
     * Возвращает наименование месяца
     * @return {string}
     */
    private get dateDisplayValue() {
        return this.date.year() === moment().year() ? this.date.format("MMMM") : this.date.format("MMMM YYYY");
    }

    /**
     * Возвращает сумму поступлений
     * @return {string} сумма поступлений
     */
    private getIncome(): string {
        return String(this.getOperations().filter(event => event.operationType === OperationType.INCOME)
            .map(event => new BigDecimal(event.amount))
            .reduce((result: BigDecimal, current: BigDecimal) => result.add(current), BigDecimal.ZERO));
    }

    /**
     * Возвращает сумму списаний
     * @return {string} сумма списаний
     */
    private getExpense(): string {
        return String(this.getOperations().filter(event => event.operationType === OperationType.EXPENSE)
            .map(event => new BigDecimal(event.amount))
            .reduce((result: BigDecimal, current: BigDecimal) => result.add(current), BigDecimal.ZERO).toString());
    }

    /**
     * Возвращает список событий с типом "HISTORY_OPERATION" (операция из выписки)
     * @return {Event[]} список событий с типом "HISTORY_OPERATION" (операция из выписки)
     */
    private getOperations(): Event[] {
        return this.events.filter(event => {
            return event.type === EventType.OPERATION &&
                DateUtils.parseDate(event.date).startOf("month").isSame(this.date);
        });
    }
}
