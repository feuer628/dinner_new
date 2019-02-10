import {UI} from "../../ui";

/**
 * Директива для установки фокуса в поле ввода
 */
export class FocusDirective implements DirectiveOptions {

    /** Имя директивы */
    static readonly NAME = "focus";

    inserted(el: HTMLElement, binding: VNodeDirective): void {
        const action = () => {
            if (binding.value) {
                el.focus();
            } else {
                el.blur();
            }
        };
        if (document.body.contains(el)) {
            action();
        } else {
            UI.nextTick(action);
        }
    }

    componentUpdated(el: HTMLElement, binding: VNodeDirective): void {
        if (binding.modifiers.lazy) {
            if (Boolean(binding.value) === Boolean(binding.oldValue)) {
                return;
            }
        }

        if (binding.value) {
            el.focus();
        } else {
            el.blur();
        }
    }
}