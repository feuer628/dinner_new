import {Component, UI} from "platform/ui";
import {TemplatePage} from "../../components/templatePage";

/**
 * Компонент страницы писем.
 */
@Component({
    // language=Vue
    template: `
        <template-page>
            <template slot="main">
                <router-view></router-view>
            </template>

            <template slot="sidebar-top">
                <router-link :to="{name: 'letterCreate'}" class="btn btn-primary sidebar-btn">Новое письмо</router-link>

                <div class="app-sidebar__links">
                    <router-link :to="{name: 'letterList', params: {folder: 'inbox'}}"><span class="icon icon-incoming"></span>Входящие</router-link>
                    <router-link :to="{name: 'letterList', params: {folder: 'outbox'}}"><span class="icon icon-outgoing"></span>Отправленные</router-link>
                    <router-link :to="{name: 'letterList', params: {folder: 'draft'}}"><span class="icon icon-draft"></span>Черновики</router-link>
                </div>
            </template>
        </template-page>
    `,
    components: {TemplatePage}
})
export class LettersPage extends UI {
}
