import Vue from "vue";
import Vuex from "vuex";
import {MenuItem, User} from "../models/models";

Vue.use(Vuex);

export const store = new Vuex.Store<StoreState>({
    state: {
        tabsMenu: {},
        dataLoading: false,
        auth: false,
        user: null
    }
});

export interface StoreState {
    tabsMenu: TabsMenu;
    dataLoading: boolean;
    auth: boolean;
    user: User | null;
}

export type TabsMenu = {
    [key: string]: MenuItem[];
};