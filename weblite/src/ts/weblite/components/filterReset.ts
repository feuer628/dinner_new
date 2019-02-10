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
 * Компонент для отображения сообщения об отсутствии данных и кнопки сброса фильтра. При использовании кнопки эмитит событие "reset"
 */
@Component({
    // language=Vue
    template: `
        <div class="operations-table__empty">
            <template v-if="filterDisabled">
                {{ noFilterText }}
            </template>
            <template v-else>
                {{ withFilterText }}
                <div class="margT20">
                    <a @click="$emit('reset')">
                        Сбросить фильтр
                    </a>
                </div>
            </template>
        </div>
    `
})
export class FilterReset extends UI {

    /** Признак отсутствия фильтрации данных */
    @Prop({required: true, type: Boolean})
    private filterDisabled: boolean;

    /** Текст сообщения об отсутствии данных при отключенном фильтре */
    @Prop({required: true, type: String})
    private noFilterText: string;

    /** Текст сообщения об отсутствии данных при включеном фильтре */
    @Prop({required: true, type: String})
    private withFilterText: string;
}