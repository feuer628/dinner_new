import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-vue/dist/bootstrap-vue.min.css";
import "../scss/custom.scss";
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import Vue from 'vue'
import Router from 'vue-router'
import {App} from './pages/App'
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
(async () => {

    const router = RouterConfiguration.getRouter();
    library.add(fas);
    Vue.component('font-awesome-icon', FontAwesomeIcon);
    Vue.config.productionTip = false;
    Vue.use(BootstrapVue);
    new Vue({
        el: '#app',
        render: (h: any) => h(App),
        router
    });
    // const router = RouterConfiguration.getRouter();
    //
    // const appFrame = new AppFrame({router});
    //
    // appFrame.$mount("#workspace");
})();