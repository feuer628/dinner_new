/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "BIFIT" JSC, TIN 7719617469
 *       105203, Russia, Moscow, Nizhnyaya Pervomayskaya, 46
 * (c) "BIFIT" JSC, 2018
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       АО "БИФИТ", ИНН 7719617469
 *       105203, Россия, Москва, ул. Нижняя Первомайская, д. 46
 * (c) АО "БИФИТ", 2018
 */

import {Service} from "platform/decorators/service";
import {Inject} from "platform/ioc";
import {Http} from "platform/services/http";

/**
 * Сервис новостей
 */
@Service("NewsService")
export class NewsService {

    /** Сервис HTTP-транспорта */
    @Inject
    private readonly http: Http;

    /**
     * Возвращает новость с указанным идентификатором
     * @param {string} newsId идентификатор новости
     * @return {Promise<News>} новость
     */
    async getNews(newsId: string): Promise<News> {
        return await this.http.get<News>(`/ibank2/protected/services/news/${newsId}`);
    }

    /**
     * Возвращает темы последних новостей
     * @param {number} count количество новостей для загрузки
     * @return {Promise<NewsSubject[]>} темы последних новостей
     */
    getNewsSubjectList(count?: number): Promise<NewsSubject[]> {
        return this.http.get("/ibank2/protected/services/news/subjects", count ? {count} : null);
    }
}

/**
 * Информация о новости
 */
export type News = {
    /** Идентификатор */
    id: string;
    /** Дата */
    date: string;
    /** Тема */
    subject: string;
    /** Новость в формате HTML */
    body: string;
    /** Порядок отображения новости */
    appearanceId: number;
    /** Флаг важности новости */
    important: boolean;
    /** Дата завершения публикации новости */
    validTo: string;
    /** Флаг отображения новости в Интернет-банке */
    showInWeb: boolean;
    /** Флаг отображения новости в Интернет-банке Лайт */
    showInWebLite: boolean;
    /** Флаг отображения новости в Мобильном банке */
    showInMobile: boolean;
};

/**
 * Информация о теме новости
 */
export type NewsSubject = {
    /** Идентификатор */
    id: string;
    /** Дата */
    date: string;
    /** Тема */
    subject: string;
    /** Флаг важности новости */
    important: boolean;
};