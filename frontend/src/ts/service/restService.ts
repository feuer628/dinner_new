import Vue from 'vue';

export class RestService {

    constructor(private ctx: Vue) {}

    async loadItems<T>(itemName: string) {
        const response = await this.ctx.$http.get(`/${itemName}`);
        return <T[]>response.data;
    }

}