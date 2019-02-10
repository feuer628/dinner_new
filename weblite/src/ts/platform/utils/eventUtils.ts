export class EventUtils {

    // Ctrl либо Cmd для macOS
    static isControlKey(event: KeyboardEvent) {
        return event.ctrlKey || event.metaKey || event.key === "Control";
    }

    static isDeletion(event: KeyboardEvent) {
        return event.keyCode === 8 || event.keyCode === 46;
    }

    /**
     * FOR KEYPRESS EVENT ONLY
     * @param event
     * @returns {boolean} true - если введен символ
     */
    static isCharInput(event: KeyboardEvent) {
        const which = event.which;
        return !EventUtils.isControlKey(event)
            && (which === undefined || which !== 0) && which !== 8;
    }

    static getClipboardData = (event: ClipboardEvent | DragEvent) => {
        if (event.type === "drop") {
            return (<DragEvent> event).dataTransfer.getData("text");
        }
        event = <ClipboardEvent> event;
        return event.clipboardData
            ? event.clipboardData.getData("text/plain")
            : (<any> window).clipboardData.getData("Text");
    }

    /**
     * Добавить обработчик событий
     * @param {HTMLElement} element                         елемент
     * @param {string} events                               названия событий через пробел
     * @param {EventListenerOrEventListenerObject} callback обработчик событий
     * @param {boolean | AddEventListenerOptions} options   дополнительные опции к событию
     */
    static addEventListener(element: HTMLElement, events: string,
                            callback: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {
        events.split(" ").forEach((event: string) => element.addEventListener(event, callback));
    }
}