import Vue from 'vue'
import Router from 'vue-router'
import Component from "vue-class-component";

Vue.use(Router);

@Component({
    // language=Vue
    template: `
    <div id="app">
 страница авторизации
    </div>`
})

export default class Login extends Vue {

}