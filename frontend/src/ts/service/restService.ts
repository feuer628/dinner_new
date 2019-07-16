import Vue from 'vue';
import Common from "../utils/common";

export class RestService {

    constructor(private ctx: Vue) {}

    async loadItems<T>(itemName: string) {
        try {
            const response = await this.ctx.$http.get(`/${itemName}`);
            return <T[]>response.data;
        } catch (e) {
            await Common.messageDialog.showInternalError();
        }
        return [];
    }

}