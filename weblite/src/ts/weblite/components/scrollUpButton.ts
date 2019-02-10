import {Component, UI} from "platform/ui";

/**
 * Компонент элемента возврата к началу страницы
 */
@Component({
    // language=Vue
    template: `
        <transition name="scroll-up">
            <a v-if="isScrolled" :class="['scroll-up-btn','icon','icon-arrow-up']" @click="scrollUp"></a>
        </transition>
    `,
})
export class ScrollUpButton extends UI {

    /** Количество прокрученных px */
    private static readonly SCROLLED_SIZE = 200;
    /** Шаг интервала прокрутки */
    private static readonly STEP_INTERVAL = 15;
    /** Продолжительность прокрутки в ms */
    private static readonly DURATION = 210;
    /** Прокручена ли страница по оси Y */
    private isScrolled = false;

    /**
     * Добавляет обработку события прокрутки при создании компонента.
     * @inheritDoc
     */
    created(): void {
        window.addEventListener("scroll", this.handleScroll);
    }

    /**
     * Удаляет обработчик после удаления компонента.
     * @inheritDoc
     */
    destroyed(): void {
        window.removeEventListener("scroll", this.handleScroll);
    }

    /**
     * Отображает элемент при превышении значения прокрутки(px) по оси Y над заданным значением.
     */
    private handleScroll(): void {
        this.isScrolled = window.pageYOffset > ScrollUpButton.SCROLLED_SIZE;
    }

    /**
     * Прокручивает страницу вверх.
     */
    private scrollUp(): void {
        const scrollStep = -window.pageYOffset / (ScrollUpButton.DURATION / ScrollUpButton.STEP_INTERVAL);
        const scrollIntervalId = setInterval(() => {
            if (window.pageYOffset) {
                window.scrollBy(0, scrollStep);
            } else {
                clearInterval(scrollIntervalId);
            }
        }, ScrollUpButton.STEP_INTERVAL);
    }
}