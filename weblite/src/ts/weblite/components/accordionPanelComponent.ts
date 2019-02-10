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

import {Component, UI} from "platform/ui";

/**
 * Компонент разворачивающегося блока
 */
@Component({
    // language=Vue
    template: `
        <div class="accordion-component" :class="{ active: showPanel }">
            <div @click="togglePanel" class="accordion-component__header">
                <slot name="header"></slot>
                <i class="dropdown-indicator"></i>
            </div>
            <transition name="fade">
                <div v-if="showPanel" class="accordion-component__content">
                    <slot name="content"></slot>
                </div>
            </transition>
        </div>
    `
})
export class AccordionPanelComponent extends UI {

    /** Признак отображения панели с контентом */
    private showPanel = false;

    /**
     * Скрывает/отображает панель
     */
    private togglePanel(): void {
        this.showPanel = !this.showPanel;
    }

    /**
     * Отправляет событие отмены редактирования
     */
    private cancelEditing(): void {
        this.$emit("cancel", true);
    }
}