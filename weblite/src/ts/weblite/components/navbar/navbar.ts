import {Container, Inject} from "platform/ioc";
import {Component, UI} from "platform/ui";
import {ClientUtils} from "platform/utils/clientUtils";
import {ClientService} from "../../service/clientService";
import {PermissionsService} from "../../service/permissionsService";
import {TaxCalendarService} from "../../service/taxCalendarService";
import {Chat} from "../chat";
import {LetterNotifier} from "./letterNotifier";

/**
 * Компонент с элементами навигации по приложению.
 */
@Component({
    // language=Vue
    template: `
        <header>
            <router-link to="/" class="logo">
                <img src="img/weblite_logo.svg">
            </router-link>
            <nav class="nav-menu">
                <router-link v-for="link in links" :to="link.path" :key="link.path" active-class="active">
                    {{link.name}}
                </router-link>
            </nav>
            <nav class="client-info">
                <span v-if="clientShortName" :title="clientShortName">{{ clientShortName }}</span>
                <div>
                    <chat></chat>
                    <letter-notifier v-if="permissionsService.hasLetterPermission()" routeTo="/letters"></letter-notifier>
                    <router-link v-if="permissionsService.hasSettingsPermissions()" to="/settings" title="Настройки" class="icon icon-setting"
                                 active-class="icon-setting-active active"></router-link>
                    <router-link title="Выход" to="/logout" class="icon icon-logout"></router-link>
                </div>
            </nav>
        </header>
    `,
    components: {LetterNotifier, Chat}
})
export class Navbar extends UI {

    /** Сервис по работе с пользователем */
    @Inject
    private clientService: ClientService;

    /** Сервис для получения прав */
    @Inject
    private permissionsService: PermissionsService;

    /** Сервис для работы с задачами налогового календаря */
    @Inject
    private taxCalendarService: TaxCalendarService;

    /** Короткое имя пользователя */
    private clientShortName: string = null;

    /** Список ссылок на страницы */
    private links: PageLink[] = [];

    /**
     * Инициализирует компонент
     * @inheritDoc
     */
    created(): void {
        this.links = this.getLinks();
        const clientInfo = this.clientService.getClientInfo();
        this.clientShortName = ClientUtils.getClientShortName(clientInfo.clientProperties);
        // устанавливаем заголовок для вкладки браузера
        document.title = this.clientShortName + " - " + document.title;
    }

    /**
     * Возвращает список ссылок на страницы разделов
     * @return список ссылок на страницы разделов
     */
    private getLinks(): PageLink[] {
        const links = [];
        links.push({name: "Деньги и события", path: "/events"});
        if (this.taxCalendarService.isTaxCalendarAvailable()) {
            links.push({name: "Налоговый календарь", path: "/tax_calendar"});
        }
        links.push({name: "Контрагенты", path: "/counterparties"});
        return links;
    }
}

/** Ссылка на страницу раздела */
type PageLink = {
    /** Наименование раздела */
    name: string,
    /** URL раздела */
    path: string
};
