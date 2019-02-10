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
import {Event} from "../../service/eventsService";

/**
 * Компонент-заглушка для отображения неизвестных типов событий
 */
@Component({
    // language=Vue
    template: `
        <div class="operations-table__row">
            <div class="operations-table__cell"/>
            <div class="operations-table__cell"/>
            <div class="operations-table__cell w100pc maxW0">
                <div class="operation-title">Ошибка: Неизвестный тип операции</div>
            </div>
        </div>
    `
})
export class UnknownEventItem extends UI {

    /** Отображаемое событие */
    @Prop({required: true})
    private event: Event;
}