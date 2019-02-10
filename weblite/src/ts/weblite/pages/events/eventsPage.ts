import {CatchErrors} from "platform/decorators";
import {Inject} from "platform/ioc";
import {Cache, CacheKey} from "platform/services/cache";
import {Component, UI, Watch} from "platform/ui";
import {DatePeriodSelectorComponent, FilterEvent} from "../../components/datePeriodSelectorComponent";
import {FilterReset} from "../../components/filterReset";
import {InfiniteLoading} from "../../components/infinite_loading/infiniteLoading";
import {TemplatePage} from "../../components/templatePage";
import {Account} from "../../model/account";
import {BankInfo} from "../../model/bankInfo";
import {Client} from "../../model/clientInfo";
import {GlobalEvent} from "../../model/globalEvent";
import {ClientService} from "../../service/clientService";
import {Event, EventCategory, EventFilter, EventsService, EventType} from "../../service/eventsService";
import {PermissionsService} from "../../service/permissionsService";
import {DateUtils} from "../../utils/dateUtils";
import {AccountItem} from "./accountItem";
import {MonthDelimiter} from "./monthDelimiter";
import {NewsEventItem} from "./newsEventItem";
import {OperationEventItem} from "./operationEventItem";
import {PaymentEventItem} from "./paymentEventItem";
import {UnknownEventItem} from "./unknownEventItem";
import Moment = moment.Moment;

@Component({
    // language=Vue
    template: `
        <template-page>
            <template slot="main">
                <div class="page-header form-row">
                    <v-select class="w200" :options="eventCategories" v-model="filter.category"></v-select>
                    <date-period-selector ref="datePeriodSelector" @change="onPeriodChange" class="margL8"></date-period-selector>
                    <search placeholder="Поиск событий"
                            class="full margL8"
                            :value="filter.searchQuery"
                            @search="onSearch">
                    </search>

                    <router-link v-if="permissionsService.hasStatementPermission()" to="/statement" title="Выписка" class="btn margL8">Выписка</router-link>

                    <!-- TODO второй этап разработки -->
                    <!--<div title="График" class="btn graphic-btn margL8">-->
                    <!--<span class="graphic-icon"></span>-->
                    <!--</div>-->
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
            </template>

            <template slot="sidebar-top">
                <router-link :to="{ name: 'paymentNew', params: {id: 'new'} }" tag="button" :disabled="!permissionsService.hasPaymentPermission()"
                             class="btn btn-primary sidebar-btn">
                    Заплатить или перевести
                </router-link>

                <div class="accounts-block" v-if="accounts">
                    <!-- Псевдо-элемент: выводит сумму на всех счетах -->
                    <account-item v-if="accounts.length > 1"
                                  :item="{accountNumber: 'На всех счетах', freeBalance: getTotalAmount(), currency: 'RUR'}"
                                  :selected="!selectedAccount"
                                  :main="true"
                                  @selectAccount="onChangeAccount(null)"></account-item>
                    <template v-for="(item, index) in accounts">
                        <account-item :item="item" :key="item.number"
                                      :selected="item === selectedAccount"
                                      @selectAccount="onChangeAccount"
                                      :bank="banksByAccountId[item.ibankAccountId]"
                                      :client="client"
                                      :editable="isBoss"></account-item>
                    </template>
                </div>
                <spinner v-else></spinner>
            </template>
        </template-page>
    `,
    components: {TemplatePage, AccountItem, MonthDelimiter, InfiniteLoading, FilterReset},
    // имя необходимо для правильной работы опции keep-alive в минифицированной версии приложения, так как название класса будет изменено.
    // используется в appFrame.cachedPages
    name: "EventsPage"
})
export class EventsPage extends UI {

    $refs: {
        infiniteLoading: InfiniteLoading,
        datePeriodSelector: DatePeriodSelectorComponent
    };

    /** Сервис для работы с кэшем */
    @Inject
    private cacheService: Cache;

    @Inject
    private clientService: ClientService;

    @Inject
    private eventsService: EventsService;

    @Inject
    private permissionsService: PermissionsService;

    /** Список счетов */
    private accounts: Account[] = null;

    /** Карта банков и счетов, относящихся к ним */
    private banksByAccountId: any = {};

    /** Информация о клиенте */
    private client: Client = null;

    /** Категории событий */
    private eventCategories = EventCategory.values();

    /** Модель фильтра для загрузки событий */
    private filter: EventFilter = {
        category: EventCategory.ALL,
        firstIndex: 0,
        searchQuery: ""
    };

    /** Список событий */
    private events: Event[] = [];

    /** Признак того, что запрос списка событий был выполнен */
    private eventsLoaded = false;

    /** Выбранный счет */
    private selectedAccount: Account = null;

    /** Признак что у залогиненного сотрудника роль Руководитель */
    private isBoss = false;

    /**
     * Инициализирует компонент и подписывается на событие обновления списка
     * @inheritDoc
     */
    created(): void {
        if (!this.client) {
            this.initClientInfo();
        }
        UI.on(GlobalEvent.REFRESH_EVENTS_LIST, this.resetInfiniteComponent);
    }

    /**
     * Обработчик хука при использовании keep-alive.
     * Вызывается всегда при переходе на страницу
     * @inheritDoc
     * @return {Promise<void>}
     */
    @CatchErrors
    async activated(): Promise<void> {
        this.resetInfiniteComponent();
        this.accounts = (await this.clientService.getAllAccounts(true)).filter(account => account.status !== "CLOSED");
        if (this.accounts.length === 1) {
            this.selectAccount(this.accounts[0]);
        }
    }

    /**
     * Обработчик хука при использовании keep-alive.
     * Вызывается всегда при переходе на другую страницу
     * @inheritDoc
     * @return {Promise<void>}
     */
    deactivated(): void {
        this.events = [];
    }

    private getTotalAmount(): string {
        return String(this.accounts
            .map((account: Account): BigDecimal => new BigDecimal(account.freeBalance || account.remainder))
            .reduce((total: BigDecimal, current: BigDecimal) => total.add(current)));
    }

    private async onChangeAccount(account: Account): Promise<void> {
        if (this.selectedAccount !== account) {
            this.selectAccount(account);
            this.resetInfiniteComponent();
        }
    }

    private selectAccount(account: Account): void {
        this.selectedAccount = account;
        if (account) {
            this.filter.accountId = account.ibankAccountId;
            this.cacheService.put(CacheKey.SELECTED_ACCOUNT_ID_KEY, account.ibankAccountId);
        } else {
            delete this.filter.accountId;
            this.cacheService.remove(CacheKey.SELECTED_ACCOUNT_ID_KEY);
        }
    }

    private async onSearch(searchQuery: string): Promise<void> {
        this.filter.searchQuery = searchQuery;
        this.resetInfiniteComponent();
    }

    @Watch("filter.category")
    private async onCategoryChange(): Promise<void> {
        this.resetInfiniteComponent();
    }

    private async onPeriodChange(event: FilterEvent): Promise<void> {
        this.filter.bdate = event.startDate;
        this.filter.edate = event.endDate;
        this.resetInfiniteComponent();
    }

    /** Сброс загруженных данных состояния компонента постраничной загрузки */
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
            const temp: Event[] = await this.eventsService.getEventList(this.filter);
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
     * Инициализация информации о клиенте
     */
    private initClientInfo(): void {
        const clientInfo = this.clientService.getClientInfo();
        this.client = clientInfo.clientInfo;
        this.isBoss = clientInfo.employeeInfo.role === "BOSS";
        clientInfo.banks.forEach((bankInfo: BankInfo): void => {
            // в банке может не быть открытых счетов
            if (bankInfo.accounts !== null) {
                bankInfo.accounts.forEach((account: Account): void => {
                    this.banksByAccountId[account.ibankAccountId] = bankInfo;
                });
            }
        });
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
            case EventType.NEWS:
                return NewsEventItem;
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
