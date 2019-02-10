import {Inject} from "platform/ioc";
import {Component, UI} from "platform/ui";
import {DatePeriodSelectorComponent, FilterEvent} from "../../components/datePeriodSelectorComponent";
import {TaxCalendarEmpty} from "../../components/taxCalendarEmpty";
import {GlobalEvent} from "../../model/globalEvent";
import {TaskCategory, TaskFilter, TaxCalendarService, TaxTask} from "../../service/taxCalendarService";
import {TaxSettingsService} from "../../service/taxSettingsService";
import {DateUtils} from "../../utils/dateUtils";
import {TaxTaskItem} from "./taxTaskItem";

/**
 * Компонент отображающий блок с таблицей задач из определенной категории.
 */
@Component({
    // language=Vue
    template: `
        <div>
            <div v-if="isTaxSystemDefined" class="page-header form-row">
                <span class="title">{{ taskCategory.label }}</span>
                <div class="form-row">
                    <date-period-selector ref="datePeriodSelector" @change="onPeriodChange" class="margL16" :show-period-presets="false"></date-period-selector>
                    <search placeholder="Поиск задач" class="margL8" :value="filter.searchQuery" @search="onSearch"></search>
                </div>
            </div>
            <div v-if="showNoActualTasksMessage" class="operations-empty-list__message">
                На текущий момент актуальных задач нет
            </div>
            <tax-calendar-empty v-if="isTasksEmpty && isInitialized"
                                :has-tax-system="isTaxSystemDefined"
                                :filter-disabled="canonicalFilter"
                                @reset="resetFilter()"></tax-calendar-empty>
            <template v-if="isInitialized">
                <div class="operations-table tax-calendar">
                    <tax-task-item v-for="(task, index) in tasks" :task="task" :tax-category="taskCategory" :key="index"></tax-task-item>
                </div>

                <div v-if="futureTasks.length" class="page-header form-row margT20">
                    <span class="title">{{ taskCategories['FUTURE'].label }}</span>
                </div>
                <div v-if="futureTasks.length" class="operations-table tax-calendar">
                    <tax-task-item v-for="(task, index) in futureTasks" :task="task" tax-category="FUTURE" :key="index"></tax-task-item>
                </div>
            </template>
            <spinner v-else/>
        </div>
    `,
    components: {TaxCalendarEmpty, TaxTaskItem}
})

export class TasksPage extends UI {

    $refs: {
        datePeriodSelector: DatePeriodSelectorComponent
    };
    /** Сервис для работы с задачами налогового календаря */
    @Inject
    private taxCalendarService: TaxCalendarService;
    /** Сервис по работе с настройками налогов */
    @Inject
    private taxSettingsService: TaxSettingsService;
    /** Текущее служебное название типа задач */
    private taskCategory = TaskCategory.ACTUAL;
    /** Список задач выбранной категории */
    private tasks: TaxTask[] = [];
    /** Список задач на Будущее. Отображается только для Актуальных задач */
    private futureTasks: TaxTask[] = [];
    /** Признак настроенной системы налогообложения */
    private isTaxSystemDefined = false;
    /** Флаг завершения инициализации */
    private isInitialized = false;
    /** Типы задач */
    private taskCategories = TaskCategory;
    /** Модель фильтра для загрузки задач */
    private filter: TaskFilter = {
        searchQuery: "",
        bdate: "",
        edate: ""
    };

    /**
     * Определяет подходит ли маршрут для открытия компонента со списком задач календаря.
     * Если подходит, то выполняет переход и обновляет компонент с использованием параметров маршрута.
     * @param {VueRouter.Route} route маршрут
     * @param {VueRouter.Resolver} next функция разрешения перехода
     * @param {TasksPage} component компонент со списком задач календаря
     */
    private static resolveRoute(route: VueRouter.Route, next: VueRouter.Resolver, component?: TasksPage): void {
        const taskCategory = TaskCategory.valueByName(route.params.taskType.toUpperCase());
        if (![TaskCategory.ACTUAL, TaskCategory.COMPLETED, TaskCategory.OVERDUE].includes(taskCategory)) {
            next(false);
            return;
        }
        const firstLoad = !component;
        const updateComponent = async (tasksPage: TasksPage) => {
            tasksPage.taskCategory = taskCategory;
            if (firstLoad) {
                tasksPage.isTaxSystemDefined = await tasksPage.taxSettingsService.hasTaxSystemInSettings();
            }
            await tasksPage.loadTasks();
        };
        if (firstLoad) {
            next(updateComponent);
        } else {
            next();
            updateComponent(component);
        }
    }

    /**
     * @inheritDoc
     */
    beforeRouteEnter(to: VueRouter.Route, from: VueRouter.Route, next: VueRouter.Resolver): void {
        TasksPage.resolveRoute(to, next);
    }

    /**
     * @inheritDoc
     */
    beforeRouteUpdate(to: VueRouter.Route, from: VueRouter.Route, next: VueRouter.Resolver): void {
        TasksPage.resolveRoute(to, next, this);
    }

    /**
     * Инициализирует компонент и подписывается на событие обновления списка
     * @inheritDoc
     */
    created(): void {
        UI.on(GlobalEvent.REFRESH_TAX_TASKS_LIST, this.loadTasks);
    }

    /**
     * Обновляет список задач
     */
    private async loadTasks(): Promise<void> {
        this.isInitialized = false;
        try {
            // Нет смысла пытаться загрузить события, если не указана система налогообложения
            if (this.isTaxSystemDefined) {
                this.tasks = await this.taxCalendarService.getTaxTasksList(this.filter, this.taskCategory);
                if (this.taskCategory === TaskCategory.ACTUAL) {
                    this.futureTasks = await this.taxCalendarService.getTaxTasksList(this.filter, TaskCategory.FUTURE);
                } else {
                    this.futureTasks = [];
                }
            }
        } finally {
            this.isInitialized = true;
        }
    }

    /**
     * Следит за изменением периода фильтрации задач
     * @param event
     */
    private async onPeriodChange(event: FilterEvent): Promise<void> {
        this.filter.bdate = event.startDate;
        this.filter.edate = DateUtils.parseDate(event.endDate).isSame(moment(), "day") ? "" : event.endDate;
        await this.loadTasks();
    }

    /**
     * Отправляет запрос на фильтрацию задач по строке поиска
     * @param searchQuery
     */
    private async onSearch(searchQuery: string): Promise<void> {
        this.filter.searchQuery = searchQuery;
        await this.loadTasks();
    }

    /**
     * Сбрасывает фильтры поиска задач
     */
    private async resetFilter(): Promise<void> {
        this.filter.searchQuery = "";
        this.$refs.datePeriodSelector.resetDate();
        this.filter.bdate = "";
        this.filter.edate = "";
        await this.loadTasks();
    }

    /**
     * Возвращает признак наличия задач в списке
     */
    private get isTasksEmpty(): boolean {
        return this.tasks.length + this.futureTasks.length === 0;
    }

    /**
     * Возвращает признак примененного фильтра
     */
    private get canonicalFilter(): boolean {
        return !(this.filter.searchQuery || this.filter.bdate || this.filter.edate);
    }

    /**
     *  Возвращает признак отображения сообщения в случае отсутствия актуальных задач
     */
    private get showNoActualTasksMessage(): boolean {
        return !this.tasks.length && this.futureTasks.length && this.taskCategory.name === "ACTUAL";
    }
}
