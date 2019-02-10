import {Component, Prop, UI, Watch} from "platform/ui";

/**
 * Компонент поиска. Минимальная строка для поиска от 3-х символов, осуществляет задержку в 500 ms (по умолчанию) перед отправкой события.
 */
@Component({
    // language=Vue
    template: `
        <div class="searchBox">
            <input v-model.trim="query" @input="onInputChange" :placeholder="placeholder" autocomplete="off" type="text" maxlength="100"/>
            <div class="icon icon-close" @click="clearQuery" title="Очистить" v-if="isShowClearIcon"></div>
            <div class="icon icon-search" v-if="!isShowClearIcon"></div>
        </div>
    `
})
export class SearchComponent extends UI {

    @Prop({default: "", type: String})
    private placeholder: string;

    /** Задержка в 500 мс перед отправкой запроса на поиск */
    @Prop({default: 500, type: Number})
    private delay: number;

    /** Поисковый запрос */
    private query = "";

    /** Значение поискового поля */
    @Prop({default: "", type: String})
    private value: string;

    /** Признак того что поле поиска было очищено и вызвано событие, чтобы не вызывать событие при вводе пробелов */
    private cleared: boolean = null;

    /** Текущий объект таймера */
    private currentTimer: any = null;

    /**
     * Присваивает значение поля поиска в запрос(query)
     * @param value
     */
    @Watch("value")
    private setQuery() {
        return this.query = this.value;
    }

    /**
     * Возвращает условие отрисовки иконки Очистить поле ввода поиска
     * @return {boolean} если запрос введен, иконка отображается
     */
    private get isShowClearIcon(): boolean {
        return this.query.length > 0;
    }

    /**
     * Обработчик на поле ввода запроса для поиска. Останавливает предыдущий таймер и запускает новый с заданной задержкой (delay)
     */
    private onInputChange(): void {
        clearTimeout(this.currentTimer);
        if (this.query.length < 3) {
            // если удалили запрос, надо обновить список
            if (this.query.length === 0 && this.cleared !== null && !this.cleared) {
                this.emitSearchEvent();
                this.cleared = true;
            }
            return;
        }
        this.cleared = false;
        this.currentTimer = setTimeout(this.emitSearchEvent, this.delay);
    }

    /**
     * Очищает поле поиска
     */
    private clearQuery(): void {
        this.query = "";
        this.onInputChange();
    }

    /**
     * Инициирует событие поиска, передает строку для запроса
     */
    private emitSearchEvent(): void {
        this.$emit("search", this.query);
    }
}