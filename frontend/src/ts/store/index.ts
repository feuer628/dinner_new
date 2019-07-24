import Vue from "vue";
import Vuex from "vuex";
import {MenuItem, OrderInfo, User} from "../models/models";

Vue.use(Vuex);

export const store = new Vuex.Store<StoreState>({
    state: {
        tabsOrders: {},
        tabsMenu: {},
        dataLoading: false,
        auth: false,
        user: null
    }
});

export interface StoreState {
    tabsOrders: TabsOrder;
    tabsMenu: TabsMenu;
    dataLoading: boolean;
    auth: boolean;
    user: User | null;
}

export type TabsMenu = {
    [key: string]: MenuItem[];
};

export type TabsOrder = {
    [key: string]: OrderInfo;
}