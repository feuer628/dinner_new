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

import {Inject} from "platform/ioc";
import {Component, Prop, UI, Watch} from "platform/ui";
import {News, NewsService} from "../../service/newsService";

/**
 * Компонент отображения новости
 */
@Component({
    // language=Vue
    template: `
        <div v-if="errorMessage" class="news__error">
            <div class="fs24">{{errorMessage}}</div>
            <button class="btn" @click="loadNews">Повторить</button>
        </div>
        <div v-else-if="news">
            <div class="news__date">{{news.date | displayDate}}</div>
            <div class="news__header">
                {{news.subject}}
                <span v-if="news.important" class="news__important">Важная новость</span>
            </div>
            <div v-safe-html="news.body" class="breakWord"></div>
            <div class="app-content-inner__footer">
                <div></div>
                <router-link :to="{name: 'events'}" class="btn">Назад</router-link>
            </div>
        </div>
        <spinner v-else></spinner>
    `
})
export class NewsView extends UI {

    /** Идентификатор новости для отображения */
    @Prop({type: String, required: true})
    private newsId: string;

    /** Сервис новостей */
    @Inject
    private readonly newsService: NewsService;

    /** Новость */
    private news: News = null;

    /** Сообщение об ошибке */
    private errorMessage: string = null;

    /**
     * Обрабатывает изменение параметра с идентификатором новости для отображения
     */
    @Watch("newsId", {immediate: true})
    private async onNewsIdChange(): Promise<void> {
        this.news = null;
        await this.loadNews();
    }

    /**
     * Загружает новость
     */
    private async loadNews(): Promise<void> {
        this.errorMessage = null;
        try {
            this.news = await this.newsService.getNews(this.newsId);
        } catch (error) {
            this.news = null;
            this.errorMessage = error.message;
        }
    }
}