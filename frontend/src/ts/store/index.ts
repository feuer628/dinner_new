import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export const store = new Vuex.Store<StoreState>({
    state: {
        auth: false
    }
});

export type StoreState = {
    auth: boolean
}