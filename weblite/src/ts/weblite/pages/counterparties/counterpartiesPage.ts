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
import {Component, UI, Watch} from "platform/ui";
import {CommonUtils} from "platform/utils/commonUtils";
import {DatePeriodSelectorComponent, FilterEvent} from "../../components/datePeriodSelectorComponent";
import {AddCounterpartyDialog} from "../../components/dialogs/counterparty/addCounterpartyDialog";
import {FilterReset} from "../../components/filterReset";
import {TemplatePage} from "../../components/templatePage";
import {GlobalEvent} from "../../model/globalEvent";
import {ClientService} from "../../service/clientService";
import {CounterpartiesService, Counterparty, CounterpartyCategory, CounterpartyFilter} from "../../service/counterpartiesService";
import {DateUtils} from "../../utils/dateUtils";
import {CounterpartyItem} from "./counterpartyItem";

@Component({
    // language=Vue
    template: `
        <template-page>
            <template slot="main">
                <div class="page-header form-row">
                    <v-select class="w250 counterparty-category-dropdown" :options="counterpartyCategories" v-model="filter.category">
                        <template slot="option" slot-scope="option">
                            <span>{{ option.label }}</span>
                            <span class="message-badge" v-if="option.count > 0">{{option.count}}</span>
                        </template>
                    </v-select>
                    <date-period-selector ref="datePeriodSelector" @change="onPeriodChange" class="margL8"></date-period-selector>
                    <search placeholder="Поиск контрагентов" class="full margL8" :value="filter.searchQuery" @search="onSearch">
                    </search>
                </div>

                <transition-group name="flip-list" tag="div" class="operations-table operations-table__counterparty">
                    <counterparty-item v-for="(counterparty, index) in counterpartiesFiltered" :key="index" class="flip-list-item"
                                       :counterparty="counterparty" @mark="onMarkCounterparty"></counterparty-item>
                </transition-group>
                <filter-reset v-if="!counterpartiesFiltered.length"
                              no-filter-text="Контрагенты отсутствуют"
                              with-filter-text="Отсутствуют контрагенты по заданному фильтру"
                              :filter-disabled="isCanonicalFilter()"
                              @reset="resetFilter"></filter-reset>
            </template>

            <template slot="sidebar-top">
                <button class="btn btn-primary sidebar-btn" @click="addCounterparty">Добавить контрагента</button>
            </template>
        </template-page>
    `,
    components: {TemplatePage, CounterpartyItem, FilterReset},
    name: "CounterpartiesPage"
})
export class CounterpartiesPage extends UI {

    $refs: {
        datePeriodSelector: DatePeriodSelectorComponent
    };

    /** Сервис для работы с контрагентами */
    @Inject
    private counterpartiesService: CounterpartiesService;
    /** Сервис для работы с клиентом */
    @Inject
    private clientService: ClientService;
    /** Список контрагентов */
    private counterparties: Counterparty[] = [];
    /** Список контрагентов отфильтрованный */
    private counterpartiesFiltered: Counterparty[] = [];
    /** Фильтр контрагентов */
    private filter: CounterpartyFilter = {
        category: CounterpartyCategory.ALL,
        searchQuery: ""
    };
    /** Категории контрагентов */
    private counterpartyCategories = [CounterpartyCategory.ALL, CounterpartyCategory.MARKED];

    /**
     * Инициализирует компонент и подписывается на событие обновления списка
     * @inheritDoc
     */
    async created(): Promise<void> {
        if (await this.clientService.hasIndicatorLicense()) {
            this.counterpartyCategories.push(CounterpartyCategory.ON_LIQUIDATION, CounterpartyCategory.PAY_ATTENTION);
        }
        UI.on(GlobalEvent.REFRESH_COUNTERPARTIES_LIST, async () => this.loadAndInitData());
    }

    /**
     * Инициализирует данные страницы, загружает список контрагентов
     * @inheritDoc
     */
    @CatchErrors
    async activated(): Promise<void> {
        await this.loadAndInitData();
    }

    /**
     * Загружает и инициализирует данные, необходимые для работы
     */
    private async loadAndInitData(): Promise<void> {
        this.counterparties = await this.counterpartiesService.getCounterparties();
        this.counterpartiesFiltered = [...this.counterparties];
        this.initFilter();
        this.filterConterparties();
        this.sortConterparties();
    }

    /**
     * Открывает диалог для добавления нового контрагента
     */
    private async addCounterparty(): Promise<void> {
        const id = await new AddCounterpartyDialog().show();
        if (id) {
            this.$router.push({name: "counterpartyView", params: {id, tab: "info"}});
        }
    }

    /**
     * Инициализирует фильтр. Считает количество контрагентов по всем категориям
     */
    private initFilter(): void {
        const counterpartiesByCategory: { [category: string]: number } = {};
        for (const counterparty of this.counterparties) {
            if (counterparty.indicatorInfo) {
                if (counterparty.indicatorInfo.criticalFacts) {
                    counterpartiesByCategory[CounterpartyCategory.ON_LIQUIDATION.value] =
                        (counterpartiesByCategory[CounterpartyCategory.ON_LIQUIDATION.value] || 0) + 1;
                }
                if (counterparty.indicatorInfo.payAttentionFacts) {
                    counterpartiesByCategory[CounterpartyCategory.PAY_ATTENTION.value] =
                        (counterpartiesByCategory[CounterpartyCategory.PAY_ATTENTION.value] || 0) + 1;
                }
            }
            if (counterparty.isMarked) {
                counterpartiesByCategory[CounterpartyCategory.MARKED.value] =
                    (counterpartiesByCategory[CounterpartyCategory.MARKED.value] || 0) + 1;
            }
        }
        for (const category of this.counterpartyCategories) {
            category.count = counterpartiesByCategory[category.value];
        }
    }

    /**
     * Фильтрует список контрагентов при изменении поискового запроса
     * @param searchQuery поисковый запрос
     */
    private async onSearch(searchQuery: string): Promise<void> {
        this.filter.searchQuery = searchQuery;
        this.filterConterparties();
    }

    /**
     * Фильтрует список контрагентов при изменении категории
     */
    @Watch("filter.category")
    private async onCategoryChange(): Promise<void> {
        this.filterConterparties();
    }

    /**
     * Фильтрует список контрагентов при изменении периода
     * @param event событие фильтрации
     */
    private async onPeriodChange(event: FilterEvent): Promise<void> {
        this.filter.bdate = event.startDate;
        this.filter.edate = event.endDate;
        this.filterConterparties();
    }

    /**
     * Фильтрует список контрагентов в соответствии с параметрами фильтра
     */
    private filterConterparties(): void {
        if (this.isCanonicalFilter()) {
            this.counterpartiesFiltered = [...this.counterparties];
            return;
        }
        this.counterpartiesFiltered = this.counterparties.filter((counterparty: Counterparty) => {
            // фильтруем по категории контрагента
            if (this.filter.category === CounterpartyCategory.MARKED && !counterparty.isMarked) {
                return false;
            }
            if (this.filter.category === CounterpartyCategory.ON_LIQUIDATION &&
                (!counterparty.indicatorInfo || counterparty.indicatorInfo.criticalFacts === 0)) {
                return false;
            }
            if (this.filter.category === CounterpartyCategory.PAY_ATTENTION &&
                (!counterparty.indicatorInfo || counterparty.indicatorInfo.payAttentionFacts === 0)) {
                return false;
            }
            // фильтруем по дате последнего события
            if (this.filter.bdate && (DateUtils.parseDate(counterparty.lastEventDate).isBefore(DateUtils.parseDate(this.filter.bdate).startOf("day")) ||
                (this.filter.edate && DateUtils.parseDate(counterparty.lastEventDate).isAfter(DateUtils.parseDate(this.filter.edate).endOf("day"))))) {
                return false;
            }
            //  фильтруем по названию, ИНН, комментарию
            const query = this.filter.searchQuery;
            if (!CommonUtils.isBlank(query) &&
                !(counterparty.name.includes(query) || counterparty.inn.includes(query) || counterparty.comment.includes(query))) {
                return false;
            }
            return true;
        });
        this.sortConterparties();
    }

    /**
     * Сортирует список контрагентов
     */
    private sortConterparties(): void {
        this.counterpartiesFiltered.sort((counterparty1, counterparty2) => {
            if (counterparty1.isMarked !== counterparty2.isMarked) {
                return counterparty1.isMarked ? -1 : 1;
            }
            if (counterparty1.lastEventDate === counterparty2.lastEventDate) {
                return 0;
            }
            return counterparty1.lastEventDate > counterparty2.lastEventDate ? -1 : 1;
        });
    }

    /**
     * Инициализирует фильтр, для обновления бэйджей и сортирует список
     */
    private onMarkCounterparty(): void {
        this.initFilter();
        this.sortConterparties();
    }

    /**
     * Проверяет, что настройки фильтра (период, поисковая фраза и категория контрагента) соответствуют значениям по умолчанию
     * @return {boolean} {@code true}, если настройки фильтра соответствуют значениям по умолчанию
     */
    private isCanonicalFilter() {
        return !this.filter.searchQuery && this.filter.category === CounterpartyCategory.ALL && !this.filter.bdate && (!this.filter.edate ||
            DateUtils.parseDate(this.filter.edate).startOf("day").isSame(moment().startOf("day")));
    }

    /**
     * Сбрасывает фильтры поиска контрагента
     */
    private resetFilter(): void {
        this.filter.searchQuery = "";
        this.filter.category = CounterpartyCategory.ALL;
        this.$refs.datePeriodSelector.resetDate();
        this.filter.bdate = "";
        this.filter.edate = "";
        this.counterpartiesFiltered = [...this.counterparties];
    }
}
