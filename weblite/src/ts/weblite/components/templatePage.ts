import {Component, UI} from "platform/ui";
import {ScrollUpButton} from "./scrollUpButton";

@Component({
    // language=Vue
    template: `
        <div class="app-body">
            <!-- Основная область -->
            <div class="app-content">
                <slot name="main"></slot>
            </div>

            <!-- Боковое меню -->
            <div class="app-sidebar">
                <slot name="sidebar-top"></slot>
                <slot name="sidebar-center"></slot>
                <slot name="sidebar-bottom">
                    <banner></banner>
                </slot>
                <scroll-up-button></scroll-up-button>
            </div>
        </div>
    `,
    components: {ScrollUpButton}
})
export class TemplatePage extends UI {
}