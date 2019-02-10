import {InfiniteLoading} from "components/infinite_loading/infiniteLoading";
import {CatchErrors} from "platform/decorators";
import {Inject} from "platform/ioc";
import {PrintService} from "platform/services/printService";
import {Component, UI} from "platform/ui";
import {FormatterFactory} from "platform/ui/formatters/formatterFactory";
import {DatePeriodSelectorComponent, FilterEvent} from "../../components/datePeriodSelectorComponent";
import {FilterReset} from "../../components/filterReset";
import {MessageComponent} from "../../components/message/messageComponent";
import {DocumentPrintHelper} from "../../components/print/documentPrintHelper";
import {DocumentType} from "../../model/document";
import {Letter, LetterType} from "../../model/letter";
import {Status} from "../../model/status";
import {DocumentListFilter, DocumentService} from "../../service/documentService";
import {DateUtils} from "../../utils/dateUtils";
import {RefUtils} from "../../utils/refUtils";
import {LetterListItem} from "./letterListItem";

/**
 * Компонент отображающий блок с таблицей писем из определенной папки и блок фильтрации списка.
 */
@Component({
    // language=Vue
    template: `
        <div>
            <div class="page-header form-row">
                <span class="title">{{folderInfo.name}}</span>
                <div class="form-row">
                    <div v-if="selectedLetters.length > 0" class="btn-group">
                        <div title="Распечатать" class="btn icon icon-print" @click="printSelected"></div>
                        <div v-if="isInboxFolder" title="Удалить" class="btn icon icon-delete" @click="deleteSelectedWithConfirm"></div>
                        <div v-if="isDraftFolder" title="Удалить" class="btn icon icon-delete" @click="deleteSelected"></div>
                    </div>

                    <date-period-selector ref="datePeriodSelector" @change="onPeriodChange" class="margL16"></date-period-selector>
                    <search :value="query" @search="onSearch" placeholder="Найти письмо" class="margL8"></search>
                </div>
            </div>

            <div v-if="letters.length" class="letters-table">
                <template v-for="letter in letters">
                    <letter-list-item :letter="letter" :client-letter="!isInboxFolder" @select="onLetterSelected" :key="letter.id"></letter-list-item>
                </template>
            </div>
            <infinite-loading @fetchData="onFetchData" ref="infiniteLoading"></infinite-loading>
            <filter-reset v-if="onLettersLoaded && !letters.length"
                          :no-filter-text="noDataMessage"
                          with-filter-text="Отсутствуют письма по заданному фильтру"
                          :filter-disabled="isCanonicalFilter()"
                          @reset="resetFilter"></filter-reset>
            <span v-if=""></span>

            <message ref="confirmMessage">
                <span>Удалить выбранные письма без возможности восстановления?</span>
                <div class="notify__links">
                    <a @click="confirmDelete">Удалить</a>
                    <a @click="$refs.confirmMessage.close()">Отмена</a>
                </div>

                <div v-if="isImportantLetterSelected" class="notify__message">
                    Письма с пометкой<span class="icon icon-important"></span>"Важное" удалить нельзя.
                </div>
            </message>

            <message :auto-close="true" ref="warnMessage">
                <span class="notify__message">Письма с пометкой<span class="icon icon-important"></span>"Важное" удалить нельзя.</span>
            </message>
        </div>
    `,
    components: {LetterListItem, InfiniteLoading, FilterReset},
})
export class LettersList extends UI {

    $refs: {
        infiniteLoading: InfiniteLoading,
        datePeriodSelector: DatePeriodSelectorComponent
        confirmMessage: MessageComponent,
        warnMessage: MessageComponent
    };

    /** Сервис по работе с документами */
    @Inject
    private documentService: DocumentService;
    /** Сервис по работе с печатью */
    @Inject
    private printService: PrintService;
    /** Список писем */
    private letters: Letter[] = [];
    /** Текущее служебное название папки с письмами */
    private folder = LetterType.INBOX;
    /** Массив выбранных писем */
    private selectedLetters: Letter[] = [];
    /** Начальный индекс списка для загрузки */
    private firstIndex = 0;
    /** Размер страницы для загрузки */
    private pageSize = 20;
    /** Дата начала выборки. По умолчанию получаем за последний месяц */
    private startDate = "";
    /** Дата окончания выборки */
    private endDate = moment().format(FormatterFactory.DATE_FORMAT);
    /** Поля документа по которым ведется поиск. SUBJ_LETTER: 5, LETTER_BODY: 6 */
    private searchFields: number[] = [5, 6];
    /** Дополнительная строка запроса. Используется для поиска */
    private query = "";
    /** Признак загрузки писем */
    private onLettersLoaded = false;

    /**
     * Определяет подходит ли маршрут для открытия компонента со списком писем.
     * Если подходит, то выполняет переход и обновляет компонент с использованием параметров маршрута.
     * @param {VueRouter.Route} route маршрут
     * @param {VueRouter.Resolver} next функция разрешения перехода
     * @param {LettersList} component компонент со списком писем
     */
    private static resolveRoute(route: VueRouter.Route, next: VueRouter.Resolver, component?: LettersList): void {
        const folder = route.params.folder as LetterType;
        if (![LetterType.INBOX, LetterType.OUTBOX, LetterType.DRAFT].includes(folder)) {
            next(false);
            return;
        }
        const updateComponent = (lettersList: LettersList) => {
            lettersList.folder = folder;
            lettersList.resetInfiniteComponent();
        };
        if (component) {
            next();
            updateComponent(component);
        } else {
            next(updateComponent);
        }
    }

    /**
     * @inheritDoc
     */
    beforeRouteEnter(to: VueRouter.Route, from: VueRouter.Route, next: VueRouter.Resolver): void {
        LettersList.resolveRoute(to, next);
    }

    /**
     * @inheritDoc
     */
    beforeRouteUpdate(to: VueRouter.Route, from: VueRouter.Route, next: VueRouter.Resolver): void {
        LettersList.resolveRoute(to, next, this);
    }

    /**
     * Обработчик выбора периода фильтрации писем. Устанавливает даты из события и инициирует обновление списка
     * @param {FilterEvent} event
     */
    private onPeriodChange(event: FilterEvent): void {
        this.startDate = event.startDate;
        this.endDate = event.endDate;
        this.resetInfiniteComponent();
    }

    /**
     * Обработчик события для инициализации поиска по списку
     * @param {} query
     */
    private onSearch(query: string): void {
        this.query = query;
        this.resetInfiniteComponent();
    }

    /**
     * Признак выделения важного письма, для отображения сообщения
     * @return {boolean}
     */
    private get isImportantLetterSelected(): boolean {
        for (const letter of this.selectedLetters) {
            if (letter.important) {
                return true;
            }
        }
        return false;
    }

    /**
     * Признак выделения обычного письма, для отображения сообщения
     * @return {boolean}
     */
    private get isCommonLetterSelected(): boolean {
        for (const letter of this.selectedLetters) {
            if (!letter.important) {
                return true;
            }
        }
        return false;
    }

    /**
     * Проверяет, что настройки фильтра (период, поисковая фраза) соответствуют значениям по умолчанию
     * @return {boolean} {@code true}, если настройки фильтра соответствуют значениям по умолчанию
     */
    private isCanonicalFilter() {
        return !this.query && !this.startDate && (!this.endDate ||
            DateUtils.parseDate(this.endDate).startOf("day").isSame(moment().startOf("day")));
    }

    /**
     * Сбрасываем список писем, первоначальный индекс и вызываем соответствующее событие у компонента с загрузкой списка
     */
    private resetInfiniteComponent(): void {
        this.onLettersLoaded = false;
        this.letters = [];
        this.selectedLetters = [];
        this.firstIndex = 0;
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
            const temp: Letter[] = await this.loadLetters();
            this.letters = this.letters.concat(temp);
            // если загруженный список меньше размера страницы, значит мы загрузили все записи.
            if (temp.length === this.pageSize) {
                $state.loaded();
            } else {
                $state.complete();
            }
            // устанавливаем первый индекс после загрузки для следующей выборки
            this.firstIndex = this.letters.length;
            this.onLettersLoaded = true;
        } catch (error) {
            this.$refs.infiniteLoading.$emit("$InfiniteLoading:complete");
            throw error;
        }
    }

    /**
     * Обработчик выбора писем в списке. Добавляет или удаляет из списка выбранных писем.
     * @param event событие
     */
    private onLetterSelected(event: any): void {
        if (event.checked) {
            this.selectedLetters.push(event.selectedLetter);
        } else {
            this.selectedLetters = this.selectedLetters.filter(selectedLetter => selectedLetter.id !== event.selectedLetter.id);
        }
    }

    /**
     * Осуществляет загрузку списка писем
     * @return {Promise<Letter[]>}
     */
    private async loadLetters(): Promise<Letter[]> {
        const response = await this.documentService.getList(DocumentType.LETTER, this.createFilter());
        return response.map((letterObject: { [key: string]: any }): Letter => {
            return {
                type: this.folder,
                id: letterObject.DOC_ID,
                sender: letterObject.SENDER,
                recipient: letterObject.RECIPIENT,
                subject: letterObject.SUBJ_LETTER,
                date: letterObject.ACT_TIME,
                important: letterObject.IMPORTANCE === "2",
                marked: letterObject.MARKED === 1,
                hasAttachments: letterObject.ATT_CNT > 0,
                read: letterObject.READED === 1
            };
        });
    }

    /**
     * Создает фильтр для получения списка писем
     * @return {DocumentListFilter} фильтр для получения списка писем
     */
    private createFilter(): DocumentListFilter {
        return {
            fields: [
                {name: "DATE_DOC"},
                {name: "NUM_DOC"},
                {name: "SENDER"},
                {name: "RECIPIENT"},
                {name: "SUBJ_LETTER"},
                {name: "IMPORTANCE"}
            ],
            statuses: this.folderInfo.statuses.map(value => value.code),
            query: this.makeQuery(RefUtils.escapeFieldValue(this.query)),
            filterId: this.folderInfo.filterId,
            firstIndex: this.firstIndex,
            pageSize: this.pageSize,
            bdate: this.startDate,
            edate: this.endDate
        };
    }

    private deleteSelectedWithConfirm(): void {
        // если выделено одно или более писем и все они Важные отображаем предупреждение, иначе сообщение с подтверждением
        if (this.isImportantLetterSelected && !this.isCommonLetterSelected) {
            this.$refs.warnMessage.show();
        } else {
            this.$refs.confirmMessage.show();
        }
    }

    /**
     * TODO блокирование ссылки подтверждения удаления, если операция удаления еще не завершена
     * Удаляет выбранные письма и закрывает сообщение
     */
    private async confirmDelete(): Promise<void> {
        await this.deleteSelected();
        this.$refs.confirmMessage.close();
    }

    /**
     * Удаляем выбранные письма
     * @return {Promise<void>}
     */
    @CatchErrors
    private async deleteSelected(): Promise<void> {
        const selectedIds = this.selectedLetters.filter((selected: Letter) => {
            return !selected.important;
        }).map((selected: Letter) => {
            return selected.id;
        });
        const response = await this.documentService.removeList(DocumentType.LETTER, selectedIds);
        const errorsMessages = response.filter((el: any) => {
            return el && el.code === "ERROR";
        });
        if (errorsMessages.length > 0) {
            throw new Error("Ошибка при удалении. " + errorsMessages.map((el: any) => {
                return el.message;
            }).join(", "));
        }
        this.resetInfiniteComponent();
    }

    /**
     * Печатает выбранные письма
     * @return {Promise<void>}
     */
    @CatchErrors
    private async printSelected(): Promise<void> {
        await this.printService.print(new DocumentPrintHelper(this.selectedLetters.map((selected: Letter) => {
            return {id: selected.id, docType: "doc/letter"};
        }), this.folderInfo.filterId));
    }

    /**
     * Формирует строку запроса для поиска
     * @return {string} строка запроса для поиска
     */
    private makeQuery(query: string): string {
        return this.searchFields.map((fieldId: number) => {
            return `[${fieldId}] hasIgnoreCase '${query}'`;
        }).join(" || ");
    }

    /**
     * Возвращает информацию о текущей папке
     * @return {FolderInfo} информация о текущей папке
     */
    private get folderInfo(): FolderInfo {
        // TODO: В приложении для корпоративных клиентов можно редактировать письма в статусах "Отвергнут" и "Подписан"
        switch (this.folder) {
            case LetterType.INBOX:
                return {
                    name: "Входящие",
                    filterId: "inbox",
                    statuses: [Status.DELIVERED_TO_CLIENT]
                };
            case LetterType.OUTBOX:
                return {
                    name: "Отправленные",
                    filterId: "outbox",
                    statuses: [Status.READY, Status.ON_EXECUTE, Status.ACCEPTED, Status.EXECUTED, Status.ON_SIGN, Status.REJECTED]
                };
            case LetterType.DRAFT:
                return {
                    name: "Черновики",
                    filterId: "outbox",
                    statuses: [Status.NEW]
                };
        }
        throw new Error("Неизвестная папка: " + this.folder);
    }

    /**
     * Сбрасывает фильтр поиска писем
     */
    private resetFilter(): void {
        this.query = "";
        this.$refs.datePeriodSelector.resetDate();
        this.startDate = "";
        this.endDate = "";
        this.resetInfiniteComponent();
    }

    /**
     * Возвращает текст сообщения об отсутствии данных
     */
    private get noDataMessage(): string {
        return `В папке "${this.folderInfo.name}" нет писем`;
    }

    /**
     * Возвращает признак нахождения в папке Черновики
     * @return {boolean} признак нахождения в папке Черновики
     */
    private get isDraftFolder(): boolean {
        return this.folder === LetterType.DRAFT;
    }

    /**
     * Возвращает признак нахождения в папке Входящие
     * @return {boolean} признак нахождения в папке Входящие
     */
    private get isInboxFolder(): boolean {
        return this.folder === LetterType.INBOX;
    }
}

/**
 * Информация о папке
 */
type FolderInfo = {

    /** Название папки */
    name: string;

    /** Идентификатор фильтра для писем в папке */
    filterId: string;

    /** Статусы писем в папке */
    statuses: Status[];
};