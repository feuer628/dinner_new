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
import {Component, UI} from "platform/ui";
import {NewsService, NewsSubject} from "../../service/newsService";

/** Количество тем новостей для отображения */
const NEWS_SUBJECT_COUNT = 4;

/**
 * Компонент отображения тем последних новостей
 */
@Component({
    // language=Vue
    template: `
        <div>
            <div v-if="errorMessage" class="news__error news__error--inSidebar">
                <div>{{errorMessage}}</div>
                <button class="btn" @click="loadNewsSubjectList">Повторить</button>
            </div>
            <div v-else-if="newsSubjectList" class="app-sidebar__links newsList">
                <div class="newsList__header">Последние новости</div>
                <template v-for="news in newsSubjectList">
                    <router-link :to="{name: 'news', params: {newsId: news.id}}">
                        <div class="news__date">
                            {{news.date | displayDate}}
                            <span v-if="news.important" class="news__important">Важная новость</span>
                        </div>
                        <div>{{news.subject}}</div>
                    </router-link>
                </template>
            </div>
            <spinner v-else></spinner>
        </div>
    `
})
export class NewsSubjectsPanel extends UI {

    /** Сервис новостей */
    @Inject
    private readonly newsService: NewsService;

    /** Список тем новостей */
    private newsSubjectList: NewsSubject[] = null;

    /** Сообщение об ошибке */
    private errorMessage: string = null;

    /**
     * @inheritDoc
     */
    async created(): Promise<void> {
        await this.loadNewsSubjectList();
    }

    /**
     * Загружает список тем новостей
     */
    private async loadNewsSubjectList(): Promise<void> {
        this.errorMessage = null;
        try {
            this.newsSubjectList = await this.newsService.getNewsSubjectList(NEWS_SUBJECT_COUNT);
        } catch (error) {
            this.errorMessage = error.message;
            this.newsSubjectList = null;
        }
    }
}