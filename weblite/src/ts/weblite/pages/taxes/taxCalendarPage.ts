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
import {TemplatePage} from "../../components/templatePage";

/**
 * Компонент налогового календаря
 */
@Component({
    // language=Vue
    template: `
        <template-page>
            <template slot="main">
                <router-view></router-view>
            </template>

            <template slot="sidebar-top">
                <div class="app-sidebar__links">
                    <router-link :to="{name: 'tasksList', params: {taskType: 'actual'}}"><span class="icon icon-actual"></span>Актуальные</router-link>
                    <router-link :to="{name: 'tasksList', params: {taskType: 'completed'}}"><span class="icon icon-completed"></span>Завершенные</router-link>
                    <router-link :to="{name: 'tasksList', params: {taskType: 'overdue'}}"><span class="icon icon-overdue"></span>Просроченные</router-link>
                </div>
            </template>
        </template-page>
    `,
    components: {TemplatePage}
})
export class TaxCalendarPage extends UI {
}
