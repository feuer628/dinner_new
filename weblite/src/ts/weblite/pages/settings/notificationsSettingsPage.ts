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
import {ButtonGroupData} from "platform/ui/xButtonGroup";
import {ChannelSettingsPanel, ChannelType} from "./channelSettingsPanel";

/**
 * Страница настроек уведомлений
 */
// TODO: Добавлять информацию о текущей вкладке в путь маршрута
@Component({
    // language=Vue
    template: `
        <div class="app-content__inner">
            <div class="page-header form-row">
                <span class="title">Уведомления</span>
                <x-button-group v-model="tab" :buttons="tabList"></x-button-group>
            </div>
            <div class="separate-line"></div>
            <transition name="fade" mode="out-in">
                <component :key="tab.name" :is="tab.component" v-bind="tab.props"></component>
            </transition>
        </div>
    `,
    components: {ChannelSettingsPanel}
})
export class NotificationsSettingsPage extends UI {

    /** Список вкладок в компоненте */
    private readonly tabList: Array<ButtonGroupData & Tab> = [
        {id: 1, text: "SMS", name: ChannelType.SMS, component: ChannelSettingsPanel, props: {type: ChannelType.SMS}},
        {id: 2, text: "E-mail", name: ChannelType.EMAIL, component: ChannelSettingsPanel, props: {type: ChannelType.EMAIL}}
    ];

    /** Текущая вкладка */
    private tab = this.tabList[0];
}

/**
 * Информация о вкладке
 */
type Tab = {
    /** Название вкладки */
    name: string;
    /** Компонент для отображения во вкладке */
    component: typeof UI;
    /** Параметры компонента во вкладке */
    props: { [key: string]: any };
};