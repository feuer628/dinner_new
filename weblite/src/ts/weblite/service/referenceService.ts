import {Service} from "platform/decorators/service";
import {Inject, Singleton} from "platform/ioc";
import {Http} from "platform/services/http";
import {CommonUtils} from "platform/utils/commonUtils";

export enum References {
    MAILBOX = "mailboxes"
}

/** Основная часть URL к сервисам по работе со справочниками */
const ROOT_REF_URL = "/ibank2/protected/services/refs";

/**
 * Сервис для работы со справочниками
 */
@Service("ReferenceService")
@Singleton
export class ReferenceService {

    /** HTTP-транспорт */
    @Inject
    private http: Http;

    /**
     * Получает справочник со всеми записями
     * @param {string} reference наименование справочника
     * @return {Promise<T[]>} список всех записей справочника
     */
    async getReference<T>(reference: string): Promise<T[]> {
        return (await this.http.get<any>(`${ROOT_REF_URL}/${reference}`)).content;
    }

    /**
     * Получает справочник с отфильтрованными данными
     * @param {string} reference наименование справочника
     * @param {ThesaurusRequest} filter фильтр
     * @return {Promise<ThesaurusResponse<T>>} справочник
     */
    async getFilteredReference<T>(reference: string, filter: ThesaurusRequest): Promise<ThesaurusResponse<T>> {
        const params = {
            fields: filter.fields || null,
            pageNumber: CommonUtils.exists(filter.pageNumber) ? filter.pageNumber : null,
            pageSize: CommonUtils.exists(filter.pageSize) ? filter.pageSize : null,
            query: filter.query || null,
            sortingFields: filter.sortingParams ? filter.sortingParams.map(sortParam => sortParam.sortDir + sortParam.columnId) : null
        };
        return this.http.post<any>(`${ROOT_REF_URL}/${reference}/filter`, params);
    }

    /**
     * Получает запись из справочника
     * @param reference наименование справочника
     * @param topicId   идентификатор записи
     * @returns запись справочника
     */
    async getTopic<T>(reference: string, topicId: string): Promise<T> {
        return this.http.get<T>(`${ROOT_REF_URL}/${reference}/${topicId}`);
    }

    /**
     * Сохраняет запись в справочник
     * @param reference наименование справочника
     * @param content   контент записи
     * @param topicId   идентификатор записи
     * @returns идентификатор новой записи
     */
    async saveTopic<T>(reference: string, content: T, topicId?: string): Promise<string> {
        return this.http.post<string>(`${ROOT_REF_URL}/${reference}`, {topicId: topicId || "", content: content});
    }

    /**
     * Удаляет запись из справочника
     * @param reference наименование справочника
     * @param topicId   идентификатор записи
     */
    async deleteTopic(reference: string, topicId: string): Promise<void> {
        await this.http.delete<any>(`${ROOT_REF_URL}/${reference}/${topicId}`);
    }
}

/**
 * Параметр сортировки
 */
export type SortParam = {
    /** Идентификатор колонки */
    columnId: string,
    /** Направление сортировки (+/-) */
    sortDir: "+" | "-"
};

/**
 * Запрос на получение справочника
 */
export type ThesaurusRequest = {
    /** Список запрашиваемых полей статьи справочника. При пустом значении запрашиваются все поля */
    fields?: string[],

    /** Запрос для выборки необходимых статей */
    query?: string,

    /** Номер страницы, которую нужно получить */
    pageNumber?: number,

    /** Количество записей в странице */
    pageSize?: number,

    /** Список идентификаторов полей по которым сортируется справочник */
    sortingParams?: SortParam[]
};

/**
 * Ответ на запрос справочника
 */
export type ThesaurusResponse<T> = {

    /** Заголовок ответа */
    header: {

        /** Размер справочника */
        size: string
    },

    /** Список записей справочника */
    content: T[]
};