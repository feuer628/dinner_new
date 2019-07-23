import Vue from "vue";
import Vuex from "vuex";
import {User} from "../models/models";

Vue.use(Vuex);

export const store = new Vuex.Store<StoreState>({
    state: {
        dataLoading: false,
        auth: false,
        user: null
    }
});

export interface StoreState {
    dataLoading: boolean;
    auth: boolean;
    user: User | null;
}