import Vue from 'vue'
import Router from 'vue-router'
import App from './pages/App'
import menu from './pages/menu'
import BootstrapVue from "bootstrap-vue"

import settingsService from './service/settingsService'
import employeeService from './service/employeeServices'
import {RouterConfiguration} from "./router/routerConfiguration";



// const router = new Router({
//     routes: [
//         {
//             path: '/',
//             name: 'home'
//         },
//         {
//             path: '/menu',
//             name: 'menu',
//             component: menu,
//         },
//         {
//             path: '/post/:id',
//             name: 'post',
//             props: true,
//         },
//     ],
//     mode: 'history'
// });

// загружаем настройки заказов
settingsService.loadSettings();
// загружаем информацию о пользователе
employeeService.loadEmployeeInfo();


/**
 * Точка входа в приложение
 */
export async function start() {

    const router = RouterConfiguration.getRouter();
    Vue.config.productionTip = false;
    Vue.use(BootstrapVue);
    new Vue({
        el: '#app',
        render: h => h(App),
        router
    });
    // const router = RouterConfiguration.getRouter();
    //
    // const appFrame = new AppFrame({router});
    //
    // appFrame.$mount("#workspace");
}