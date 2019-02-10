import Vue from 'vue'
import Router from 'vue-router'
import App from './App'
import menu from './menu'
import BootstrapVue from "bootstrap-vue"

import settingsService from './services/settingsService'
import employeeService from './services/employeeServices'



const router = new Router({
    routes: [
        {
            path: '/',
            name: 'home'
        },
        {
            path: '/menu',
            name: 'menu',
            component: menu,
        },
        {
            path: '/post/:id',
            name: 'post',
            props: true,
        },
    ],
    mode: 'history'
});

// загружаем настройки заказов
settingsService.loadSettings();
// загружаем информацию о пользователе
employeeService.loadEmployeeInfo();
console.log("11112222222242342342342221111");


/**
 * Точка входа в приложение
 */
export async function start() {
    console.log(1231);
    console.log(Router);
    Vue.use(Router);
    console.log("BootstrapVue");
    console.log(BootstrapVue);

    Vue.use(BootstrapVue);
    new Vue({
        el: '#app',
        render: h => h(App),
        router
    });
    console.log("start");
}