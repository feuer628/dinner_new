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

import {Component, UI} from "../ui";

/** Код клавиши Escape */
const ESCAPE_KEY_CODE = 27;

/**
 * Контейнер модальных компонентов
 */
@Component({
    // language=Vue
    template: `
        <div class="modal-container"></div>`
})
export class ModalContainer extends UI {

    /** Единственный экземпляр компонента */
    private static instance: ModalContainer;

    /** Информация о модальных компонентах в контейнере */
    private readonly children: ChildItem[] = [];

    /**
     * Добавляет модальный компонент в контейнер
     * @param component модальный компонент
     * @param closable может ли пользователь закрыть компонент
     */
    static addChild(component: UI, closable = false): void {
        if (component.$el.parentNode) {
            throw new Error("Компонент уже имеет родительский элемент");
        }
        this.instance.$el.appendChild(component.$el);
        this.instance.children.push({component, closable});
    }

    /**
     * Убирает модальный компонент из контейнера
     * @param {UI} component модальный компонент
     */
    static removeChild(component: UI): void {
        const index = this.instance.children.findIndex(item => item.component === component);
        if (index !== -1) {
            this.instance.children.splice(index, 1);
            this.instance.$el.removeChild(component.$el);
        }
    }

    /**
     * Возвращает заблокирован ли интерфейс модальным компонентом
     */
    static isUiBlocked(): boolean {
        const children = this.instance.children;
        return children.length > 0 && !children[children.length - 1].closable;
    }

    /**
     * @inheritDoc
     */
    mounted(): void {
        ModalContainer.instance = this;
        document.body.addEventListener("keyup", this.onKeyUp);
        this.$router.beforeEach(this.beforeRouteChangeGuard);
    }

    /**
     * Обрабатывает нажатие на кнопку клавиатуры
     * @param event событие нажатия
     */
    private onKeyUp(event: any): void {
        if (event.keyCode !== ESCAPE_KEY_CODE || this.children.length === 0) {
            return;
        }
        const lastComponent = this.children[this.children.length - 1];
        if (lastComponent.closable) {
            lastComponent.component.$destroy();
        }
    }

    /**
     * Обрабатывает начало перехода на другую страницу
     * @param {VueRouter.Route} to информация о странице, к которой осуществляется переход
     * @param {VueRouter.Route} from информация о странице, с которой осуществляется переход
     * @param {VueRouter.Resolver} next функция разрешения перехода
     */
    private beforeRouteChangeGuard(to: VueRouter.Route, from: VueRouter.Route, next: VueRouter.Resolver): void {
        if (this.children.length === 0) {
            next();
            return;
        }
        const lastComponent = this.children[this.children.length - 1];
        if (lastComponent.closable) {
            lastComponent.component.$destroy();
        }
        next(false);
    }
}

/**
 * Дочерний элемент контейнера
 */
type ChildItem = {

    /** Модальный компонент */
    component: UI;

    /** Может ли пользователь закрыть компонент */
    closable: boolean;
};