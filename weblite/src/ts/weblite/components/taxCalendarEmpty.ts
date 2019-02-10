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
 * Компонент для отображения сообщения о необходимости настройки системы налогообложения, а так же при пустом списке задач
 */
@Component({
    // language=Vue
    template: `
         <div class="tax-calendar_empty">
            <template v-if="hasTaxSystem">
                <template v-if="filterDisabled">
                    <span>Список задач пуст</span>
                </template>
                <template v-else>
                    <span>Отсутствуют задачи по заданному фильтру</span>
                    <div class="margT20">
                        <a @click="$emit('reset')" class="underline">
                            Сбросить фильтр
                        </a>
                    </div>
                </template>
            </template>
            <template v-else>
                <span>Для просмотра налогового календаря укажите систему налогообложения в </span>
                <span>
                    <router-link to="/settings/taxes" class="underline">
                        Настройках
                    </router-link>
                </span>
            </template>
        </div>
    `
})
export class TaxCalendarEmpty extends UI {

    /** Признак заданной системы налогообложения в настройках */
    @Prop({required: true, type: Boolean})
    private hasTaxSystem: boolean;

    /** Признак отсутствия фильтрации */
    @Prop({required: true, type: Boolean})
    private filterDisabled: string;
}
