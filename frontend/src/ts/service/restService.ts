import Vue from 'vue';

export class RestService {

    constructor(private ctx: Vue) {}

    /**
     * Загружает список объектов с сервера.
     * Возвращает пустой список, если объектов не найдено или если ошибка во время запроса
     * @param itemUrl название объектов, которые требуется загрузить, часть REST-пути
     */
    async loadItems<T>(itemUrl: string): Promise<T[]> {
        return <T[]> (await this.get(`/${itemUrl}`)) || [];
    }

    /**
     * Загружает объект с сервера.
     * Возвращает объект или null, если загрузить объект не удалось
     * @param itemUrl название группы объекта, который требуется загрузить, часть REST-пути
     * @param id      идентификатор объекта
     */
    async loadItem<T>(itemUrl: string, id?: string): Promise<T> {
        let url = `/${itemUrl}`;
        if (id) {
            url += `/${id}`
        }
        return <T> (await this.get(url));
    }

    /**
     * Загружает данные на сервер POST-запросом
     * @param url  путь загрузки данных
     * @param data данные
     */
    async sendItem(url: string, data: any): Promise<any> {
        try {
            this.ctx.$store.state.dataLoading = true;
            return (await this.ctx.$http.post(url, data)).data;
        } catch (e) {
            console.log("Ошибка запроса: " + e.status);
        } finally {
            this.ctx.$store.state.dataLoading = false;
        }
    }

    private async get(url: string) {
        try {
            this.ctx.$store.state.dataLoading = true;
            return (await this.ctx.$http.get(url)).data;
        } catch (e) {
            console.log("Ошибка запроса: " + e.status);
        } finally {
            this.ctx.$store.state.dataLoading = false;
        }
        return null;
    }

}