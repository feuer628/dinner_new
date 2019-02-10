import {Component, Prop, UI} from "platform/ui";

/**
 * Компонент для реализации списка с бесконечной подгрузкой.
 * Для использования добавить на страницу после компонента, который отображает список и
 * указать функцию для подгрузки списка, которая будет вызываться при скроле или изменении размера окна.
 *
 * На время загрузки данных будет отображен спиннер.
 * https://github.com/PeachScript/vue-infinite-loading
 * Версия v2.2.3 от 11.12.2017
 */
@Component({
    // language=Vue
    template: `
        <div class="infinite-loading-container">
            <div v-show="isLoading">
                <spinner></spinner>
            </div>
            <div class="infinite-status-prompt" v-show="isNoResults">
                <slot name="no-results"></slot>
            </div>
            <div class="infinite-status-prompt" v-show="isNoMore">
                <slot name="no-more"></slot>
            </div>
        </div>
    `
})
export class InfiniteLoading extends UI {

    /** Признак отсутствия данных, подлежащих загрузке */
    isComplete = false;

    /** Таймаут проверки времени загрузки. */
    private LOOP_CHECK_TIMEOUT = 1000;

    /** Максимальное количество проверок. При превышении будет выдана ошибка */
    private LOOP_CHECK_MAX_CALLS = 10;

    private scrollParent: any = null;

    private scrollHandler: any = null;

    private isLoading = false;

    /** Признак первоначальной загрузки. */
    private isFirstLoad = true;

    private debounceTimer: any = null;

    private debounceDuration = 50;

    /** Статус проверки на бесконечную загрузку */
    private infiniteLoopChecked = false;

    private infiniteLoopTimer: any = null;

    private continuousCallTimes = 0;

    private stateChanger: any = null;

    @Prop({default: 100, type: Number})
    private distance: number;

    @Prop({default: "bottom", type: String})
    private direction: string;

    @Prop({default: false, type: Boolean})
    private forceUseInfiniteWrapper: boolean;

    /**
     * Признак, того, что инициализация первичных данных будет произведена в родительском компоненте
     */
    @Prop({default: false, type: Boolean})
    private manualDataInit: boolean;

    /**
     * Условие отрисовки блока если нет результатов для загрузки
     * @return {boolean}
     */
    private get isNoResults(): boolean {
        const noResultsSlot = this.$slots["no-results"];
        const isBlankNoResultsSlot = (noResultsSlot && noResultsSlot[0].elm && noResultsSlot[0].elm.textContent === "");

        return !this.isLoading && this.isComplete && this.isFirstLoad && !isBlankNoResultsSlot;
    }

    /**
     * Условие отрисовки блока если больше нет данных для загрузки
     * @return {boolean}
     */
    private get isNoMore(): boolean {
        const noMoreSlot = this.$slots["no-more"];
        const isBlankNoMoreSlot = (noMoreSlot && noMoreSlot[0].elm && noMoreSlot[0].elm.textContent === "");

        return !this.isLoading && this.isComplete && !this.isFirstLoad && !isBlankNoMoreSlot;
    }

    /**
     * Действия выполняемые после встраивания компонента.
     * Навешивание обработчиков событий.
     * @inheritDoc
     */
    mounted(): void {
        this.scrollParent = this.getScrollParent();

        this.scrollHandler = function scrollHandlerOriginal(event: any) {
            if (!this.isLoading) {
                clearTimeout(this.debounceTimer);

                if (event && event.constructor === Event) {
                    this.debounceTimer = setTimeout(this.attemptLoad, this.debounceDuration);
                } else {
                    this.attemptLoad();
                }
            }
        }.bind(this);

        if (!this.manualDataInit) {
            setTimeout(this.scrollHandler, 1);
        }
        this.scrollParent.addEventListener("scroll", this.scrollHandler);

        this.$on("$InfiniteLoading:loaded", (event: any) => {
            this.isFirstLoad = false;

            if (this.isLoading) {
                this.$nextTick(this.attemptLoad.bind(null, true));
            }

            if (!event || event.target !== this) {
                // предупреждение о возможных ошибках при вызове событий `loaded` and `complete` через экземпляр компонента из $refs
            }
        });

        this.$on("$InfiniteLoading:complete", (event: any) => {
            this.isLoading = false;
            this.isComplete = true;

            // force re-complation computed properties to fix the problem of get slot text delay
            this.$nextTick(() => {
                this.$forceUpdate();
            });

            this.scrollParent.removeEventListener("scroll", this.scrollHandler);

            if (!event || event.target !== this) {
                // предупреждение о возможных ошибках при вызове событий `loaded` and `complete` через экземпляр компонента из $refs
            }
        });

        this.$on("$InfiniteLoading:reset", () => {
            this.isLoading = false;
            this.isComplete = false;
            this.isFirstLoad = true;
            this.scrollParent.addEventListener("scroll", this.scrollHandler);
            setTimeout(this.scrollHandler, 1);
        });

        /**
         * change state for this component, pass to the callback
         */
        this.stateChanger = {
            loaded: () => {
                this.$emit("$InfiniteLoading:loaded", {target: this});
            },
            complete: () => {
                this.$emit("$InfiniteLoading:complete", {target: this});
            },
            reset: () => {
                this.$emit("$InfiniteLoading:reset", {target: this});
            },
        };

        /**
         * watch for the `force-use-infinite-wrapper` property
         */
        this.$watch("forceUseInfiniteWrapper", () => {
            this.scrollParent = this.getScrollParent();
        });
        // добавляем слушатель на изменение размера окна. Чтобы при увеличении высоты окна вызывался метод подгрузки
        window.addEventListener("resize", () => this.attemptLoad(true));
    }

    /**
     * Для адаптации опции keep-alive, работает только для версии Vue 2.2.0 и выше, см.: https://vuejs.org/v2/api/#keep-alive
     * @inheritDoc
     */
    deactivated(): void {
        this.isLoading = false;
        this.scrollParent.removeEventListener("scroll", this.scrollHandler);
    }

    /**
     * Устанавливает слушатель на событие scroll
     * @inheritDoc
     */
    activated(): void {
        this.scrollParent.addEventListener("scroll", this.scrollHandler);
    }

    /**
     * Удаляет слушатель на событие scroll
     * @inheritDoc
     */
    destroyed(): void {
        if (!this.isComplete) {
            this.scrollParent.removeEventListener("scroll", this.scrollHandler);
        }
    }

    /**
     * Пытается вызвать метод загрузки списка
     * @param {Boolean} isContinuousCall  the flag of continuous call, it will be true
     *                                    if this method be called in the `loaded`
     *                                    event handler
     */
    private attemptLoad(isContinuousCall: boolean): void {
        const currentDistance = this.getCurrentDistance();

        if (!this.isComplete && currentDistance <= this.distance &&
            (this.$el.offsetWidth + this.$el.offsetHeight) > 0) {
            this.isLoading = true;

            this.$emit("fetchData", this.stateChanger);

            if (isContinuousCall && !this.forceUseInfiniteWrapper && !this.infiniteLoopChecked) {
                // check this component whether be in an infinite loop if it is not checked
                // more details: https://github.com/PeachScript/vue-infinite-loading/issues/55#issuecomment-316934169
                this.continuousCallTimes += 1; // save the times of calls

                clearTimeout(this.infiniteLoopTimer);
                this.infiniteLoopTimer = setTimeout(() => {
                    this.infiniteLoopChecked = true;
                }, this.LOOP_CHECK_TIMEOUT);

                // throw warning if the times of continuous calls large than the maximum times
                if (this.continuousCallTimes > this.LOOP_CHECK_MAX_CALLS) {
                    // выполнение callback функции более чем ${LOOP_CHECK_MAX_CALLS} за короткое время,
                    // скорее всего найден неверный scroll wrapper который не имеет фиксированной высоты или максимальной высоты.
                    // Для принудительной установки элемента в качестве scroll wrapper'а  и исключения автоматического поиска,
                    // необходимо установите опцию force-use-infinite-wrapper в true
                    this.infiniteLoopChecked = true;
                }
            }
        } else {
            this.isLoading = false;
        }
    }

    /**
     * get current distance from the specified direction
     * @return {Number}     distance
     */
    private getCurrentDistance(): number {
        let distance;

        if (this.direction === "top") {
            distance = isNaN(this.scrollParent.scrollTop) ?
                this.scrollParent.pageYOffset :
                this.scrollParent.scrollTop;
        } else {
            const infiniteElmOffsetTopFromBottom = this.$el.getBoundingClientRect().top;
            const scrollElmOffsetTopFromBottom = this.scrollParent === window ?
                window.innerHeight :
                this.scrollParent.getBoundingClientRect().bottom;

            distance = infiniteElmOffsetTopFromBottom - scrollElmOffsetTopFromBottom;
        }

        return distance;
    }

    /**
     * get the first scroll parent of an element
     * @param  {DOM} elm    cache element for recursive search
     * @return {DOM}        the first scroll parent
     */
    private getScrollParent(elm: any = this.$el): any {
        let result;

        if (elm.tagName === "BODY") {
            result = window;
        } else if (!this.forceUseInfiniteWrapper && ["scroll", "auto"].indexOf(getComputedStyle(elm).overflowY) > -1) {
            result = elm;
        } else if (elm.hasAttribute("infinite-wrapper") || elm.hasAttribute("data-infinite-wrapper")) {
            result = elm;
        }

        return result || this.getScrollParent(elm.parentNode);
    }
}