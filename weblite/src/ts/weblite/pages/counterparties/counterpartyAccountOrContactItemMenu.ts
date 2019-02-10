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
 * Компонент для вызова событий редактирования и удаления
 */
@Component({
    // language=Vue
    template: `
        <div class="info-block__menu">
            <div @click="$emit('edit')">Редактировать</div>
            <div @click="$emit('delete')">Удалить</div>
        </div>
    `
})
export class CounterpartyAccountOrContactItemMenu extends UI {

}