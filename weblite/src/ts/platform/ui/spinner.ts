import {Component, UI} from "platform/ui";

/**
 * Компонент для отбражения анимации при ajax-запросах
 */
@Component({
    // language=Vue
    template: `
        <span class="loading-wave-dots">
            <span class="wave-item"></span>
            <span class="wave-item"></span>
            <span class="wave-item"></span>
            <span class="wave-item"></span>
            <span class="wave-item"></span>
        </span>
    `
})
export class Spinner extends UI {
}