import {Singleton} from "platform/ioc";
import {Service} from "../decorators/service";

/** Структура данных параметров для URL */
export type UrlParams = {
    [key: string]: string | number | boolean
};

/**
 * Сервис HTTP-транспорта
 */
@Service("Http")
@Singleton
export class Http {

    /**
     * Выполнить POST-запрос на {@code url} с телом {@code body} и параметрами {@code options}
     * @param {string} url URL запроса
     * @param body         тело запроса
     * @param options      параметры запроса
     * @return {Promise<T>}
     */
    async post<T>(url: string, body?: any, options?: any): Promise<T> {
        return this.doRequest<T>("POST", url, {options, body});
    }

    /**
     * Выполнить GET-запрос на {@code url} c параметрами для URL {@code urlParams} и параметрами запроса {@code options}
     * @param {string} url URL запроса
     * @param urlParams    параметры для URL
     * @param options      параметры запроса
     * @return {Promise<T>}
     */
    async get<T>(url: string, urlParams?: UrlParams, options?: any): Promise<T> {
        return this.doRequest<T>("GET", url, {options, urlParams});
    }

    /**
     * Выполнить DELETE-запрос на {@code url} c параметрами для URL {@code urlParams} и параметрами запроса {@code options}
     * @param {string} url URL запроса
     * @param urlParams    параметры для URL
     * @param options      параметры запроса
     * @return {Promise<T>}
     */
    async delete<T>(url: string, urlParams?: UrlParams, options?: any): Promise<T> {
        return this.doRequest<T>("DELETE", url, {options, urlParams});
    }

    /**
     * Выполнить запрос на сервис
     * @param method метод запроса
     * @param url    URL запроса
     * @param params объект с параметрами запроса
     * @return {Promise<T>}
     */
    private async doRequest<T>(method: string, url: string, params: { options: any, body?: any, urlParams?: UrlParams }): Promise<T> {
        const paramsInit = this.prepareRequestParams(method, url, params);

        let response;
        try {
            response = await fetch(paramsInit.url, paramsInit.params);
        } catch (networkError) {
            throw new Error("Не удалось выполнить запрос, повторите позже");
        }

        if (!response.ok) {
            throw await this.handleError(response);
        }

        return this.parseResult<T>(response);
    }

    /**
     * Подготовить запрос
     * @param method метод запроса
     * @param url    URL запроса
     * @param params объект с параметрами, которые необходимо применить к запросу
     * @return {ParamsInit} объект с данными запроса
     */
    private prepareRequestParams(method: string, url: string, params: { options: any, body?: any, urlParams?: UrlParams }): ParamsInit {
        const requestParams = this.getDefaultRequestInit();
        requestParams.method = method;

        if (params.options) {
            this.setRequestInitOptions(requestParams, params.options);
        }

        if (params.body) {
            this.setRequestInitBody(requestParams, params.body);
        }

        if (params.urlParams) {
            url += this.buildQuery(params.urlParams);
        }

        return {url: url, params: requestParams};
    }

    /**
     * Создать запрос
     * @param urlParams параметры для URL запроса
     * @return {string} готовый запрос
     */
    private buildQuery(urlParams: UrlParams): string {
        return Object.keys(urlParams).reduce((query: string, key: string, idx: number, keys: string[]) => {
            query += encodeURIComponent(key) + "=" + encodeURIComponent(String(urlParams[key]));
            if (idx < keys.length - 1) {
                query += "&";
            }
            return query;
        }, "?");
    }

    /**
     * Установить тело запроса
     * @param requestInit параметры запроса
     * @param body        данные для установки
     */
    private setRequestInitBody(requestInit: RequestInit, body: any): void {
        if (typeof body !== "string" && !(body instanceof FormData)) {
            body = JSON.stringify(body);
        }
        requestInit.body = body;
    }

    /**
     * Установить параметры в данные запроса (кроме body и method, тк они передаются и устанавливаются отдельно)
     * @param requestInit данные запроса
     * @param options     параметры запроса
     */
    private setRequestInitOptions(requestInit: RequestInit, options: any): void {
        if (options.cache) {
            requestInit.cache = options.cache;
        }
        if (options.credentials) {
            requestInit.credentials = options.credentials;
        }
        if (options.headers) {
            requestInit.headers = options.headers;
        }
    }

    /**
     * Обработка ответа сервиса
     * @param response ответ сервиса
     * @return {Promise<T | undefined>} преобразованный ответа сервиса в зависимости от его контента или {@code undefined}
     */
    private async parseResult<T>(response: Response): Promise<T | undefined> {
        // Код 204 - запрос успешно выполнился, контента нет
        if (response.status === 204) {
            return undefined;
        }
        const contentType = response.headers.get("Content-Type");
        if (contentType.indexOf("application/json") !== -1) {
            return response.json();
        }

        if (contentType.indexOf("text/plain") !== -1) {
            return <Promise<any>> response.text();
        }

        throw new Error("Неподдерживаемый тип контента " + contentType);
    }

    /**
     * Возвращает пользовательские параметры, которые необходимо применить к запросу по умолчанию
     * @return {RequestInit} пользовательские параметры по умолчанию
     */
    private getDefaultRequestInit(): RequestInit {
        return {
            /** параметр передачи учетных данных в запросе */
            credentials: "same-origin",
            /** заголовки запроса */
            headers: {
                "Content-Type": "application/json;charset=UTF-8",
                "Accept-Language": "ru_RU"
            }
        };
    }

    /**
     * Обработка ошибок в ответе сервиса
     * @param response ответ сервиса
     * @return объект с ошибкой
     */
    private async handleError(response: Response): Promise<any> {
        if (response.status === 401) {
            // при неавторизованном обращении отправляем пользователя на форму входа
            window.location.replace("/");
            throw new Error("Доступ запрещен");
        }
        let error: any = new Error("Внутренняя ошибка сервера");
        try {
            const responseError = await response.json();
            if (responseError.message) {
                error = new Error(responseError.message);
            }
            if (responseError.code) {
                error.code = responseError.code;
            }
        } catch (e) {
            // пришел ответ, отличный от json
        }
        error.response = {
            status: response.status,
            statusText: response.statusText
        };
        return error;
    }
}

/** Структура данных запроса */
type ParamsInit = {
    /** URL запроса */
    url: string,
    /** Параметры, которые необходимо применить к запросу */
    params: RequestInit
};