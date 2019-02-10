/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "BIFIT" JSC, TIN 7719617469
 *       105203, Russia, Moscow, Nizhnyaya Pervomayskaya, 46
 * (c) "BIFIT" JSC, 2018
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       АО "БИФИТ", ИНН 7719617469
 *       105203, Россия, Москва, ул. Нижняя Первомайская, д. 46
 * (c) АО "БИФИТ", 2018
 */
import {Component, Prop, UI} from "platform/ui";

/**
 * Компонент-кнопка с отображением прогресса
 */
@Component({
    // language=Vue
    template: `
        <button class="progress-button" :disabled="isInProgress" @click="click">
            <div class="progress-button__content">
                <slot></slot>
            </div>
        </button>
    `
})
export class ProgressButton extends UI {

    /** Обработчик кнопки */
    @Prop({type: Function, required: true})
    private handler: (event: MouseEvent) => Promise<void>;

    /** Признак выполнения обработчика кнопки */
    private isInProgress = false;

    /**
     * Обрабатывает клик по кнопке
     * @param {MouseEvent} event
     * @return {Promise<void>}
     */
    private async click(event: MouseEvent): Promise<void> {
        try {
            this.isInProgress = true;
            await this.handler(event);
        } finally {
            this.isInProgress = false;
        }
    }
}