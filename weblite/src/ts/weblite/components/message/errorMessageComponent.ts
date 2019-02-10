import {Component, Prop, UI} from "platform/ui";

/**
 * Компонент отображения сообщений об ошибках
 */
@Component({
    // language=Vue
    template: `
        <transition name="fade">
            <div class="error-message keep-errors-on-click">
                <span class="icon icon-warning keep-errors-on-click">{{errorWrapper.error.message}}</span>
                <span class="icon icon-close" @click="close"></span>
            </div>
        </transition>
    `
})
export class ErrorMessageComponent extends UI {

    /** Событие закрытия ошибки */
    private static readonly CLOSE = "close";

    /** Идентификатор timeout */
    private timeoutId = -1;

    /** Контейнер ошибки */
    @Prop({required: true})
    private errorWrapper: ErrorWrapper;

    /** Интервал автозакрытия сообщения об ошибке */
    @Prop({type: Number, default: 30})
    private interval: number;

    /**
     * Устанавливает таймаут на закрытие сообщение об ошибке, если задан интервал
     * @inheritDoc
     */
    created(): void {
        if (this.interval >= 0) {
            this.timeoutId = setTimeout(() => {
                this.$emit(ErrorMessageComponent.CLOSE, this.errorWrapper);
            }, this.interval * 1000);
        }
    }

    /**
     * Закрывает сообщение об ошибке
     */
    private close(): void {
        if (this.timeoutId >= 0) {
            clearTimeout(this.timeoutId);
        }
        this.$emit(ErrorMessageComponent.CLOSE, this.errorWrapper);
    }
}

/**
 * Контейнер ошибки
 */
export type ErrorWrapper = {

    /** Уникальный идентификатор */
    uuid: string,

    /** Ошибка */
    error: Error
};