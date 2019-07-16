import VueRouter, {RouteConfig} from "vue-router";
import menu from '../pages/menu';
import registration from '../pages/registration';
import authorization from '../pages/authorization';
import {Roles} from '../pages/roles';
import {Organizations} from "../pages/organizations";
import {OrgGroups} from "../pages/org_groups";
import {Providers} from "../pages/providers";

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
            {
                path: "/providers",
                name: "providers",
                component: Providers
            },
        ];
    }
}
