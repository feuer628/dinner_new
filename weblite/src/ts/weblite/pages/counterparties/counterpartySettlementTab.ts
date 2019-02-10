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
import {DatePeriodSelectorComponent, FilterEvent} from "../../components/datePeriodSelectorComponent";
import {FilterReset} from "../../components/filterReset";
import {InfiniteLoading} from "../../components/infinite_loading/infiniteLoading";
import Moment = moment.Moment;
import {GlobalEvent} from "../../model/globalEvent";
import {CounterpartiesService, Counterparty, CounterpartyEventsFilter} from "../../service/counterpartiesService";
import {Event, EventCategory, EventType} from "../../service/eventsService";
import {DateUtils} from "../../utils/dateUtils";
import {MonthDelimiter} from "../events/monthDelimiter";
import {OperationEventItem} from "../events/operationEventItem";
import {PaymentEventItem} from "../events/paymentEventItem";
import {UnknownEventItem} from "../events/unknownEventItem";

@Component({
    // language=Vue
    template: `
        <div>
            <div class="page-header form-row">
                <v-select class="w200" :options="eventCategories" v-model="filter.category" @input="onCategoryChange"></v-select>
                <date-period-selector ref="datePeriodSelector" @change="onPeriodChange" class="margL8"></date-period-selector>
                <search placeholder="Поиск событий"
                        class="full margL8"
                        :value="filter.searchQuery"
                        @search="onSearch">
                </search>
            </div>
            <div class="operations-table">
                <template v-for="(event, index) in events">
                    <month-delimiter v-if="needAddMonthDelimiter(event, events[index - 1])" :events="events"
                                     :date="getMonthDate(event)" :show-summary="needShowSummary(event)"></month-delimiter>
                    <component :is="getComponentType(event)" :event="event"></component>
                </template>
            </div>
            <infinite-loading @fetchData="onFetchData" :manual-data-init="true" ref="infiniteLoading"></infinite-loading>
            <filter-reset v-if="eventsLoaded && !events.length"
                          no-filter-text="События отсутствуют"
                          with-filter-text="Отсутствуют события по заданному фильтру"
                          :filter-disabled="isCanonicalFilter()"
                          @reset="resetFilter"></filter-reset>
        </div>
    `,
    components: {MonthDelimiter, InfiniteLoading, FilterReset}
})
export class CounterpartySettlementTab extends UI {

    $refs: {
        infiniteLoading: InfiniteLoading,
        datePeriodSelector: DatePeriodSelectorComponent
    };

    /** Сервис для работы с контрагентами */
    @Inject
    private counterpartiesService: CounterpartiesService;

    /** Контрагент */
    @Prop({required: true, type: Object})
    private counterparty: Counterparty;

    /** Категории событий */
    private eventCategories = [EventCategory.ALL, EventCategory.INCOME, EventCategory.EXPENSE];

    /** Список событий */
    private events: Event[] = [];

    /** Признак того, что запрос списка событий был выполнен */
    private eventsLoaded = false;

    /** Модель фильтра для загрузки событий */
    private filter: CounterpartyEventsFilter = {
        category: EventCategory.ALL,
        firstIndex: 0,
        searchQuery: ""
    };

    /**
     * Инициализирует компонент и подписывается на событие обновления списка
     * @inheritDoc
     */
    created(): void {
        UI.on(GlobalEvent.REFRESH_EVENTS_LIST, this.resetInfiniteComponent);
    }

    /**
     * Перезагружает список событий
     * @inheritDoc
     * @return {Promise<void>}
     */
    activated(): void {
        this.resetInfiniteComponent();
    }

    /**
     * Очищает список событий
     * @inheritDoc
     * @return {Promise<void>}
     */
    deactivated(): void {
        this.events = [];
    }

    /**
     * Обработчик события поиска
     * @param searchQuery поисковый запрос
     */
    private async onSearch(searchQuery: string): Promise<void> {
        this.filter.searchQuery = searchQuery;
        this.resetInfiniteComponent();
    }

    /**
     * Обработчик события смены категории событий
     */
    private async onCategoryChange(): Promise<void> {
        this.resetInfiniteComponent();
    }

    /**
     * Обработчик изменения интервала дат
     * @param dateInterval объект с интервалом дат
     */
    private async onPeriodChange(dateInterval: FilterEvent): Promise<void> {
        this.filter.bdate = dateInterval.startDate;
        this.filter.edate = dateInterval.endDate;
        this.resetInfiniteComponent();
    }

    /**
     * Сброс загруженных данных состояния компонента постраничной загрузки
     */
    private resetInfiniteComponent(): void {
        this.eventsLoaded = false;
        this.events = [];
        this.filter.firstIndex = 0;
        this.$nextTick(() => {
            this.$refs.infiniteLoading.$emit("$InfiniteLoading:reset");
        });
    }

    /**
     * Обработчик, вызываемый для загрузки очередной порции списка
     * @param $state состояние компонента загрузки
     * @return {Promise<void>}
     */
    @CatchErrors
    private async onFetchData($state: any): Promise<void> {
        try {
            // Загрузка списка событий
            const temp = await this.counterpartiesService.getCounterpartyEvents(this.counterparty.id, this.filter);
            this.events = this.events.concat(temp);
            // если загруженный список меньше размера страницы, значит мы загрузили все записи.
            if (temp.length !== 0) {
                $state.loaded();
            } else {
                $state.complete();
            }
            // устанавливаем первый индекс после загрузки для следующей выборки
            this.filter.firstIndex = this.events.length;
            this.eventsLoaded = true;
        } catch (error) {
            this.$refs.infiniteLoading.$emit("$InfiniteLoading:complete");
            throw error;
        }
    }

    /**
     * Проверяет, нужно ли отображать разделитель с месячными итогами между двумя событиями
     * @param {Event} current текущее событие (которое обрабатывается в текущей итерации)
     * @param {Event} previous предыдущее событие (в ленте - более позднее)
     * @return {boolean} {@code true}, если два переданных события находятся в разных месяцах, иначе {@code false}
     */
    private needAddMonthDelimiter(current: Event, previous: Event): boolean {
        return current && previous && this.getMonthDate(current).isBefore(this.getMonthDate(previous));
    }

    /**
     * Проверяет, нужно ли отображать в разделителе итоговые суммы за месяц.
     * Отображаем, если не применен фильтр (исключение - номер счёта), если текщий месяц загружен полностью (или загружены все данные с сервера)
     * @param {Event} current текущее событие (которое обрабатывается в текущей итерации)
     * @return {boolean} {@code true}, если требуется отображать суммы
     */
    private needShowSummary(current: Event) {
        return this.isCanonicalFilter() && (this.getMonthDate(current).isAfter(this.getMonthDate(this.events[this.events.length - 1])) ||
            this.$refs.infiniteLoading.isComplete);
    }

    /**
     * Проверяет, что настройки фильтра (период, поисковая фраза и категория событий) соответствуют значениям по умолчанию
     * @return {boolean} {@code true}, если настройки фильтра соответствуют значениям по умолчанию
     */
    private isCanonicalFilter() {
        return !this.filter.searchQuery && this.filter.category === EventCategory.ALL && !this.filter.bdate && (!this.filter.edate ||
            DateUtils.parseDate(this.filter.edate).startOf("day").isSame(moment().startOf("day")));
    }

    /**
     * Возвращает {@code Moment} с датой, сброшенной на начало месяца
     * @param {Event} event событие
     * @return {moment.Moment} {@code Moment} с датой, сброшенной на начало месяца
     */
    private getMonthDate(event: Event): Moment {
        return DateUtils.parseDate(event.date).startOf("month");
    }

    /**
     * Возвращает наименование компонента, используемого в качестве элемента списка событий
     * @param {Event} event
     * @return {typeof UI}
     */
    private getComponentType(event: Event): typeof UI {
        switch (event.type) {
            case EventType.OPERATION:
                return OperationEventItem;
            case EventType.PAYMENT:
                return PaymentEventItem;
        }
        return UnknownEventItem;
    }

    /**
     * Сбрасывает фильтры поиска событий
     */
    private resetFilter(): void {
        this.filter.searchQuery = "";
        this.filter.category = EventCategory.ALL;
        this.$refs.datePeriodSelector.resetDate();
        this.filter.bdate = "";
        this.filter.edate = "";
        this.resetInfiniteComponent();
    }
}
