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
 * Компонент отображения блока для добавления новых реквизитов или контакта
 */
@Component({
    // language=Vue
    template: `
        <div class="counterparty__add" @click="$emit('click')">
            <span class="icon plus"></span>
            <div>{{ label }}</div>
        </div>
    `
})
export class CreateAccountOrContactPanel extends UI {

    /** Надпись на плашке */
    @Prop({required: true, type: String})
    private label: string;
}
