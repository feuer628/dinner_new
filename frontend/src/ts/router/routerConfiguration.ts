import VueRouter, {RouteConfig} from "vue-router";
import menu from '../pages/menu';
import registration from '../pages/registration';
import authorization from '../pages/authorization';
import {Roles} from '../pages/roles';
import {Organizations} from "../pages/organizations";
import {OrgGroups} from "../pages/org_groups";

/**
 * Класс отвечающий за создание роутингов и инициализацию роутера
 */
export class RouterConfiguration {

    /** Экземпляр роутера */
    private static router: VueRouter;

    /**
     * Возвращает инициализированный экземпляр роутера
     * @returns {VueRouter} роутер
     */
    static getRouter(): VueRouter {
        if (!RouterConfiguration.router) {
            RouterConfiguration.router = new VueRouter({
                base: "/",
                routes: RouterConfiguration.createRoutes(),
                scrollBehavior: (() => ({x: 0, y: 0}))
            });
        }
        return RouterConfiguration.router;
    }

    private static createRoutes(): RouteConfig[] {
        // const permissionsService = PermissionsService;
        // const settingsChildren: RouteConfig[] = [];
        // if (permissionsService.isTaxCalendarAvailable()) {
        //     settingsChildren.push({
        //         path: "/settings/taxes",
        //         component: TaxSettingsPage
        //     });
        // }
        // if (permissionsService.hasNotificationsPermissions()) {
        //     settingsChildren.push({
        //         path: "/settings/notifications",
        //         component: NotificationsSettingsPage
        //     });
        // }
        // if (permissionsService.hasWebChannelPermission()) {
        //     settingsChildren.push({
        //         path: "/settings/interface",
        //         component: InterfaceSettingsPage
        //     });
        // }
        // if (settingsChildren.length) {
        //     routes.push({
        //         path: "/settings",
        //         component: SettingsPage,
        //         redirect: settingsChildren[0].path,
        //         children: settingsChildren
        //     });
        // }
        // if (permissionsService.hasPaymentPermission()) {
        //     routes.push(...[
        //         {
        //             path: "/payment/view/:id",
        //             name: "paymentView",
        //             component: PaymentViewPage
        //         },
        //         {
        //             path: "/payment/:id",
        //             name: "paymentNew",
        //             component: PaymentEditPage
        //         },
        //         {
        //             path: "/payment/:id/:action",
        //             name: "paymentEdit",
        //             component: PaymentEditPage
        //         }
        //     ]);
        // }
        // if (permissionsService.hasLetterPermission()) {
        //     routes.push(...[
        //         {
        //             path: "/letters",
        //             redirect: "/letters/inbox"
        //         },
        //         {
        //             path: "/letters/:folder",
        //             name: "letters",
        //             component: LettersPage,
        //             children: [
        //                 {
        //                     path: "",
        //                     name: "letterList",
        //                     component: LettersList
        //                 }
        //             ],
        //         },
        //         {
        //             path: "/letters/view/:folder/:id",
        //             name: "letterView",
        //             component: LetterViewPage
        //         },
        //         {
        //             path: "/letters/edit/:id/:action",
        //             name: "letterEdit",
        //             component: LetterEditPage
        //         },
        //         {
        //             path: "/letters/edit/new",
        //             name: "letterCreate",
        //             component: LetterEditPage
        //         },
        //     ]);
        // }
        // if (permissionsService.isTaxCalendarAvailable()) {
        //     routes.push(...[
        //         {
        //             path: "/tax_calendar",
        //             redirect: "tax_calendar/actual"
        //         },
        //         {
        //             path: "/tax_calendar/:taskType",
        //             name: "tax_calendar",
        //             component: TaxCalendarPage,
        //             children: [
        //                 {
        //                     path: "",
        //                     name: "tasksList",
        //                     component: TasksPage
        //                 }
        //             ],
        //         },
        //     ]);
        // }
        return [
            {
                path: "/logout",
                // beforeEnter: async () => await Container.get(LogoutService).logout()
            },
            // {
            //     path: "*",
            //     redirect: "/events"
            // },
            {
                path: "/menu",
                name: "menu",
                component: menu
            },
            {
                path: "/registration",
                name: "registration",
                component: registration
            },
            {
                path: "/authorization",
                name: "authorization",
                component: authorization
            },
            {
                path: "/roles",
                name: "roles",
                component: Roles
            },
            {
                path: "/org_groups",
                name: "org_groups",
                component: OrgGroups
            },
            {
                path: "/organizations",
                name: "orgs",
                component: Organizations
            },
            // {
            //     path: "/counterparties",
            //     name: "counterparties",
            //     component: CounterpartiesPage
            // },
            // {
            //     path: "/counterparties/:id/:tab",
            //     name: "counterpartyView",
            //     component: CounterpartyView
            // },
            // {
            //     path: "/statement",
            //     component: StatementPage
            // },
            // {
            //     path: "/operation/:accountId/:operationUid",
            //     name: "operationView",
            //     component: OperationViewPage
            // },
            // {
            //     path: "/news/:newsId",
            //     component: NewsPage,
            //     children: [{
            //         path: "",
            //         name: "news",
            //         component: NewsView,
            //         props: route => ({newsId: route.params.newsId}),
            //     }]
            // },
        ];
    }
}
