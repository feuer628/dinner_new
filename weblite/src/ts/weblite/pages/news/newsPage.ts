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
import {NewsSubjectsPanel} from "./newsSubjectsPanel";

/**
 * Страница новости
 */
@Component({
    // language=Vue
    template: `
        <template-page>
            <template slot="main">
                <router-view class="app-content__inner"></router-view>
            </template>
            <template slot="sidebar-top">
                <news-subjects-panel></news-subjects-panel>
            </template>
        </template-page>
    `,
    components: {TemplatePage, NewsSubjectsPanel}
})
export class NewsPage extends UI {
}