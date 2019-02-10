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

import {Component, Prop, UI} from "platform/ui";
import {Event} from "../../service/eventsService";

/**
 * Компонент отображения строки с информацией о новости
 */
@Component({
    // language=Vue
    template: `
        <div class="operations-table__row news-row" @click="goToNewsPage">
            <div class="operations-table__cell">
                {{ event.date | displayDate }}
            </div>
            <div class="operations-table__cell">
                <div class="icon icon-info-bubble"></div>
            </div>
            <div class="operations-table__cell w100pc maxW0">
                <div class="operation-title"><span>{{ event.title }}</span></div>
            </div>
            <div class="operations-table__cell" :title="event.important ? 'Важная новость' : ''">
                <div v-if="event.important" class="icon icon-important"></div>
            </div>
        </div>
    `
})
export class NewsEventItem extends UI {

    /** Информация о новости */
    @Prop({type: Object, required: true})
    private event: Event;

    /**
     * Открывает страницу новости
     */
    private goToNewsPage(): void {
        this.$router.push({name: "news", params: {newsId: this.event.id}});
    }
}
