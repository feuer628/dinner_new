import {Component, UI} from "platform/ui";
import {CommonUtils} from "platform/utils/commonUtils";
import {GlobalEvent} from "../model/globalEvent";
import {ErrorMessageComponent, ErrorWrapper} from "./message/errorMessageComponent";

@Component({
    // language=Vue
    template: `
        <div class="globalErrors">
            <error-message-component v-for="errorWrapper in errorWrappers" :errorWrapper="errorWrapper"
                                     :key="errorWrapper.uuid" @close="onClose">
            </error-message-component>
        </div>
    `,
    components: {ErrorMessageComponent}
})
export class ErrorHandler extends UI {

    /** Максимальное количество одновременно отображаемых ошибок */
    private static readonly MAX_ERRORS = 3;

    /** Контейнер ошибок */
    private errorWrappers: ErrorWrapper[] = [];

    /**
     * Подписывается на обработку событий
     * @inheritDoc
     */
    created(): void {
        UI.on(GlobalEvent.HANDLE_ERROR, (error: Error) => {
            if (this.errorWrappers.length === ErrorHandler.MAX_ERRORS) {
                this.errorWrappers.shift();
            }
            this.errorWrappers.push({uuid: CommonUtils.uuid(), error});
            window.console.error(error);
        });
        UI.on(GlobalEvent.CLEAR_ERRORS, () => {
            this.errorWrappers = [];
        });
        // устанавливаем глобальный слушатель на "click"
        window.addEventListener("click", (event: Event) => {
            // не скрываем ошибки, если целевой элемент отмечен классом "keep-errors-on-click"
            if (!(event.target as Element).classList.contains("keep-errors-on-click")) {
                this.errorWrappers = [];
            }
        }, true);
        // устанавливаем глобальный слушатель на "keypress", "keydown" не использовать, проблемы с IE
        window.addEventListener("keypress", (event: KeyboardEvent) => {
            // не скрываем ошибки, если нажаты клавиши Ctrl или Command (для mac os) для возможности копирования текста ошибки
            if (event.ctrlKey || event.metaKey) {
                return;
            }
            this.errorWrappers = [];
        });
    }

    /**
     * Удаляет ошибку при закрытии
     * @param {ErrorWrapper} errorWrapper контейнер ошибок
     */
    private onClose(errorWrapper: ErrorWrapper) {
        this.errorWrappers.splice(this.errorWrappers.indexOf(errorWrapper), 1);
    }
}