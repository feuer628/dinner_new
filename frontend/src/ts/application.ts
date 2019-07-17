import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-vue/dist/bootstrap-vue.min.css";
import "../scss/custom.scss";
import {library} from '@fortawesome/fontawesome-svg-core';
import {fas} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';

import Vue from 'vue';
import VueResource from 'vue-resource';
import VueRouter from "vue-router";
import {App} from './pages/App';
import BootstrapVue from "bootstrap-vue";
import settingsService from './service/settingsService';
import employeeService from './service/employeeServices';
import {RouterConfiguration} from "./router/routerConfiguration";
import {install} from "vue-cookies";
import Common from "./utils/common";

// загружаем настройки заказов
settingsService.loadSettings();
// загружаем информацию о пользователе
employeeService.loadEmployeeInfo();

/**
 * Точка входа в приложение
 */
(async () => {
    // Регистрация иконок
    library.add(fas);
    Vue.component('font-awesome-icon', FontAwesomeIcon);
    Vue.config.productionTip = false;

    Vue.use(BootstrapVue);
    Vue.use(VueResource);
    Vue.use(VueRouter);
    install(Vue);

    // Кладем токен аутентификации в заголовок запросов
    (<any> Vue).http.interceptors.push((request: any, next: any) => {
        request.headers.set('x-access-token', Vue.cookies.get("token"));
        next((response: any) => {
            if(response.status == 401 || response.status === 403) {
                Common.messageDialog.showWarning("Вы не авторизованы!");
                router.push("/sign_in");
            }
        });
    });

    const router = RouterConfiguration.getRouter();
    new Vue({
        el: '#app',
        render: h => h(App),
        router
    });
})();