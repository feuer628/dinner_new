import Vue from 'vue'
import Router from 'vue-router'
import Meta from 'vue-meta'
import App from './App.ts'
import Post from './components/Post.vue'
import Hello from './components/Hello.vue'
import menu from './menu.ts'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import bTab from 'bootstrap-vue/es/components/tabs/tab'
import bTabs from 'bootstrap-vue/es/components/tabs/tabs'
import bCard from 'bootstrap-vue/es/components/card/card'
import bTable from 'bootstrap-vue/es/components/table/table'
import bButton from 'bootstrap-vue/es/components/button/button'
import bFormInput from 'bootstrap-vue/es/components/form-input/form-input'
import bFormCheckbox from 'bootstrap-vue/es/components/form-checkbox/form-checkbox'
import bFormSelect from 'bootstrap-vue/es/components/form-select/form-select'

import settingsService from './services/settingsService'
import employeeService from './services/employeeServices'
import './style/menu.css'

Vue.use(Router);
Vue.use(Meta);
Vue.use(BootstrapVue);

Vue.component('b-tab', bTab);
Vue.component('b-tabs', bTabs);
Vue.component('b-card', bCard);
Vue.component('b-table', bTable);
Vue.component('b-button', bButton);
Vue.component('b-form-input', bFormInput);
Vue.component('b-form-checkbox', bFormCheckbox);
Vue.component('b-form-select', bFormSelect);

const Component = Vue.extend({
    // вывод типов включён
});

const router = new Router({
    routes: [
        {
            path: '/',
            name: 'home',
            component: Hello,
        },
        {
            path: '/menu',
            name: 'menu',
            component: menu,
        },
        {
            path: '/post/:id',
            name: 'post',
            component: Post,
            props: true,
        },
    ],
    mode: 'history'
});

// загружаем настройки заказов
settingsService.loadSettings();
// загружаем информацию о пользователе
employeeService.loadEmployeeInfo();

new Vue({
    el: '#app',
    render: h => h(App),
    router
});