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
import {ModalContainer} from "platform/ui/modalContainer";

/**
 * Диалог прогресса
 */
@Component({
    // language=Vue
    template: `
        <transition name="fade" @after-leave="onAfterLeave">
            <div v-if="visible" class="progress-dialog">
                <div class="progress-dialog__spinner"></div>
            </div>
        </transition>
    `
})
export class ProgressDialog extends UI {

    /** Виден ли диалог. Используется для анимаций появления и исчезновения диалога. */
    private visible = false;

    /**
     * Показываете диалог
     */
    show(): ProgressDialog {
        this.$mount();
        return this;
    }

    /**
     * @inheritDoc
     */
    mounted(): void {
        ModalContainer.addChild(this, false);
        // Не даем менять элементы ввода во время отображения диалога
        document.addEventListener("focusin", this.blurActiveElement);
        this.blurActiveElement();
        this.visible = true;
    }

    /**
     * Закрывает диалог
     */
    close(): void {
        this.visible = false;
    }

    /**
     * @inheritDoc
     */
    beforeDestroy(): void {
        document.removeEventListener("focusin", this.blurActiveElement);
        ModalContainer.removeChild(this);
    }

    /**
     * Убирает фокус с активного элемента
     */
    private blurActiveElement(): void {
        if (document.activeElement) {
            (document.activeElement as any).blur();
        }
    }

    /**
     * Обрабатывает завершение анимации исчезновения диалога
     */
    private onAfterLeave(): void {
        this.$destroy();
    }
}