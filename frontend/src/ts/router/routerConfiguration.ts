import VueRouter, {RouteConfig} from "vue-router";
import menu from '../pages/menu';
import {SignIn} from "../pages/sign_in";
import {SignUp} from "../pages/sign_up";
import {Logout} from "../pages/logout";
import {Settings} from "../pages/settings";
import {MenuReviews} from "../pages/menu_reviews";
import {ProviderReviews} from "../pages/provider_reviews";
import {UploadMenu} from "../pages/upload_menu";
import {TemplateOrders} from "../pages/template_orders";
import {Admin} from "../pages/admin/admin";
import {Roles} from "../pages/admin/roles";
import {OrgGroups} from "../pages/admin/org_groups";
import {Organizations} from "../pages/admin/organizations";
import {Providers} from "../pages/admin/providers";
import {Users} from "../pages/admin/users";
import {NewUsers} from "../pages/admin/users_new";
import {SystemProperties} from "../pages/admin/system_properties";

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
                path: "/",
                redirect: "/menu"
            },
            {
                path: "/uploadMenu",
                name: "uploadMenu",
                component: UploadMenu
            },
            {
                path: "/admin",
                name: "admin",
                component: Admin,
                children: [
                    {
                        path: "roles",
                        name: "roles",
                        component: Roles
                    },
                    {
                        path: "org_groups",
                        name: "org_groups",
                        component: OrgGroups
                    },
                    {
                        path: "organizations",
                        name: "orgs",
                        component: Organizations
                    },
                    {
                        path: "providers",
                        name: "providers",
                        component: Providers
                    },
                    {
                        path: "users",
                        name: "users",
                        component: Users
                    },
                    {
                        path: "new_users",
                        name: "new_users",
                        component: NewUsers
                    },
                    {
                        path: "system_properties",
                        name: "system_properties",
                        component: SystemProperties
                    },
                ]
            },
            {
                path: "/templateOrders",
                name: "templateOrders",
                component: TemplateOrders
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
                path: "/sign_up",
                name: "sign_up",
                component: SignUp
            },
            {
                path: "/sign_in",
                name: "sign_in",
                component: SignIn
            },
            {
                path: "/logout",
                component: Logout
            },
            {
                path: "/settings",
                component: Settings
            },
            {
                path: "/menu_reviews",
                name: "menu_reviews",
                component: MenuReviews
            },
            {
                path: "/provider_reviews",
                name: "provider_reviews",
                component: ProviderReviews
            }
        ];
    }
}
