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
 * Компонент для отображения иконок об ошибках с тултипами.
 */
@Component({
    // language=Vue
    template: `
        <div class="tooltip icon icon-error" v-show="errorMessage">
            <div class="tooltip-text">{{ errorMessage }}</div>
        </div>
    `
})
export class ErrorBulb extends UI {

    /** Сообщение об ошибке для отображения */
    @Prop({default: null, type: String})
    private errorMessage: string;
}