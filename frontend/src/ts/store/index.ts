import Vue from "vue";
import Vuex from "vuex";
import {User} from "../models/models";

Vue.use(Vuex);

export const store = new Vuex.Store<StoreState>({
    state: {
        auth: false,
        user: null
    }
});

export interface StoreState {
    auth: boolean;
    user: User | null;
}