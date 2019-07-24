import Vue from 'vue';

export class RestService {

    constructor(private ctx: Vue) {}

    /**
     * Загружает список объектов с сервера.
     * Возвращает пустой список, если объектов не найдено или если ошибка во время запроса
     * @param itemName название объектов, которые требуется загрузить, часть REST-пути
     */
    async loadItems<T>(itemName: string): Promise<T[]> {
        return <T[]> (await this.get(`/${itemName}`)) || [];
    }

    /**
     * Загружает объект с сервера.
     * Возвращает объект или null, если загрузить объект не удалось
     * @param itemName название группы объекта, который требуется загрузить, часть REST-пути
     * @param id       идентификатор объекта
     */
    async loadItem<T>(itemName: string, id?: string): Promise<T> {
        let url = `/${itemName}`;
        if (id) {
            url += `/${id}`
        }
        return <T> (await this.get(url));
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