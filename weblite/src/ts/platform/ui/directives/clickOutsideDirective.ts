/**
 * Директива предназначена для выполнения действия при клике (нажатии для мобильных устройств) вне элемента, на котором она установлена.
 * Например, для скрытия выпадающих элементов. Для этого необходимо добавить директиву v-click-outside="onClickOutside" на список,
 * тогда при клике в любом месте, кроме него, он будет скрыт.
 */
export class ClickOutsideDirective implements DirectiveOptions {

    /** Имя директивы */
    static readonly NAME = "click-outside";

    /** Массив элементов с функциями для которых указана данная директива */
    private static readonly instances: any[] = [];

    /** События на которые срабатывает директива */
    private static readonly events: string[] = ("ontouchstart" in window || navigator.msMaxTouchPoints > 0 ? ["touchstart", "click"] : ["click"]);

    /**
     * Функция обработчик события click/touch. Если используется модификатор once, то будет выполнено действие у последнего элемента в стэке,
     * иначе будут вызваны обработчики всех элементов.
     * @param {Event} event click/touch
     */
    private static onEvent(event: Event): void {
        const instance: any = ClickOutsideDirective.instances[ClickOutsideDirective.instances.length - 1];
        if (instance && instance.once !== undefined && instance.once) {
            ClickOutsideDirective.eventListener(event, instance);
            return;
        }
        ClickOutsideDirective.instances.forEach((instanceItem: any) => {
            ClickOutsideDirective.eventListener(event, instanceItem);
        });
    }

    /**
     * Выполняет действия при вызове события
     * @param {Event} event событие
     * @param instance объект
     */
    private static eventListener(event: Event, instance: any): void {
        if (event.target !== instance.el && !instance.el.contains(event.target) && typeof instance.callback === "function") {
            instance.callback(event);
        }
    }

    bind(el: HTMLElement, binding: VNodeDirective): void {
        ClickOutsideDirective.instances.push({el, callback: binding.value, once: binding.modifiers && binding.modifiers.once});
        // необходимо отсортировать элементы, чтобы вложенные закрывались первыми
        ClickOutsideDirective.instances.sort((a: any, b: any): number => {
            return a.el.contains(b.el) ? 1 : -1;
        });
        if (ClickOutsideDirective.instances.length === 1) {
            ClickOutsideDirective.events.forEach((e: any) => document.addEventListener(e, ClickOutsideDirective.onEvent));
        }
    }

    update(el: HTMLElement, binding: VNodeDirective): void {
        if (typeof binding.value !== "function") {
            throw new Error("Ошибка биндинга. Аргумент должен быть функцией");
        }
        const instance = ClickOutsideDirective.instances.find((i: any) => i.el === el);
        instance.callback = binding.value;
    }

    unbind(el: HTMLElement): void {
        ClickOutsideDirective.instances.pop();
        if (ClickOutsideDirective.instances.length === 0) {
            ClickOutsideDirective.events.forEach((e: any) => document.removeEventListener(e, ClickOutsideDirective.onEvent));
        }
    }
}