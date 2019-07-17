import {RawLocation, Route} from "vue-router";
import Vue from "vue";
import Common from "../utils/common";

export class LogoutService {

    static logOutHook<V extends Vue = Vue>(to: Route, from: Route, next: (to?: RawLocation | false | ((vm: V) => any) | void) => void) {
        if (Vue.cookies.get("auth")) {
            Vue.cookies.remove("auth");
            Vue.cookies.remove("token");
            Common.messageDialog.showInfo("Вы вышли из учетной записи");
            next("/");
        } else {
            next("/sign_in");
        }
    }
}