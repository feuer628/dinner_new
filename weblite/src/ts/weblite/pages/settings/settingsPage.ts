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

import {Inject} from "platform/ioc";
import {Component, UI} from "platform/ui";
import {Icon} from "platform/ui/icon";
import {TemplatePage} from "../../components/templatePage";
import {PermissionsService} from "../../service/permissionsService";

/**
 * Компонент страницы настроек.
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
                    <router-link :key="item.path" v-for="item in menuItemList" :to="item.path">
                        <span :class="['icon', item.icon]"></span>
                        {{item.text}}</router-link>
                </div>
            </template>
        </template-page>
    `,
    components: {TemplatePage}
})
export class SettingsPage extends UI {

    /** Сервис для получения прав клиента */
    @Inject
    private permissionsService: PermissionsService;

    /**
     * Возвращает список элементов меню на странице
     * @return {MenuItem[]} список элементов меню на странице
     */
    private get menuItemList(): MenuItem[] {
        const result: MenuItem[] = [];
        if (this.permissionsService.isTaxCalendarAvailable()) {
            result.push({path: "/settings/taxes", text: "Налоги", icon: Icon.TAXES});
        }
        if (this.permissionsService.hasNotificationsPermissions()) {
            result.push({path: "/settings/notifications", text: "Уведомления", icon: Icon.NOTIFICATIONS});
        }
        if (this.permissionsService.hasWebChannelPermission()) {
            result.push({path: "/settings/interface", text: "Внешний вид", icon: Icon.INTERFACE});
        }
        return result;
    }
}

/**
 * Элемент меню на странице
 */
type MenuItem = {
    /** Адрес, на который ведет элемент меню */
    path: string;
    /** Текст для отображения на элементе меню */
    text: string;
    /** Иконка пункта меню */
    icon: string
};