import {GlobalEvent} from "../../../weblite/model/globalEvent";
import {Component, Prop, UI} from "../../ui";

/**
 * Шаблон для описания формы диалога
 */
@Component({
    // language=Vue
    template: `
        <div class="modal-overlay" @click="onOverlayClick">
            <div @click.stop="clearErrors" class="modal-dialog" id="custom-dialog" tabindex="-1" role="dialog" aria-hidden="true" :style="style">
                <div class="modal-header">
                    <div class="modal-title">{{ title }}</div>
                    <div v-if="closable" class="icon icon-close" @click="close"></div>
                </div>

                <div class="modal-body">
                    <slot name="content"/>
                </div>
                <div class="modal-footer">
                    <slot name="footer"/>
                </div>
            </div>
        </div>
    `
})
export class DialogForm extends UI {

    /** Флаг возможности закрытия формы диалога крестиком, кликом по оверлею или клавишей Escape. Используется в классе CustomDialog */
    @Prop({default: true})
    closable: boolean;

    @Prop()
    private title: string;

    @Prop({type: Number})
    private width: number;

    @Prop({type: Function})
    private close: any;

    /**
     * Обрабатывает нажатие на оверлей
     */
    private onOverlayClick(): void {
        if (this.closable) {
            this.close();
        }
        this.clearErrors();
    }

    /**
     * Убирает отображаемые глобальные сообщения об ошибках
     */
    private clearErrors(): void {
        UI.emit(GlobalEvent.CLEAR_ERRORS);
    }

    private get style(): any {
        const style: any = {};
        if (this.width) {
            style.width = this.width + "px";
        }
        return style;
    }

}
