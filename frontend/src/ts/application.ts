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
import {RouterConfiguration} from "./router/routerConfiguration";
import {install} from "vue-cookies";
import Common from "./utils/common";
import {store} from "./store";
import {Days} from "./models/days";
import moment = require("moment");

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

    Vue.filter('formatTabDate', function (value: string) {
        if (!value) {
            return ''
        }
        const date = moment(new Date(value));
        const dayText = Days.valueOf(date.weekday()).text;
        return dayText + " (" + moment(date).format("DD.MM") + ")"
    });

    // Кладем токен аутентификации в заголовок запросов
    (<any> Vue).http.interceptors.push((request: any, next: any) => {
        request.headers.set('x-access-token', Vue.cookies.get("token"));
        next((response: any) => {
            if(response.status == 401) {
                // Common.messageDialog.showWarning(response.body);
                router.push("/sign_in");
            }
            if(response.status == 403) {
                Common.messageDialog.showWarning(response.body);
                router.push("/");
            }
            if (response.status == 500) {
                Common.messageDialog.showWarning(response.body);
            }
        });
    });

    const router = RouterConfiguration.getRouter();
    new Vue({
        el: '#app',
        store,
        render: h => h(App),
        router
    });
})();