import {Component, UI} from "platform/ui";
import {Prop} from "../../ui";

/**
 * Шаблон для описания простой формы диалога
 */
@Component({
    // TODO верстка
    // language=Vue
    template: `
        <transition name="fade">
            <div class="overlay" @click="close">
                <div @click.stop>
                    <div class="notify">
                        <slot name="content"></slot>
                        <div class="notify__links">
                            <slot name="controls"></slot>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    `,
})
export class SimpleDialogForm extends UI {

    @Prop({type: Function})
    private close: any;
}
