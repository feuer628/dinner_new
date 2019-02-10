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

import {CatchErrors} from "platform/decorators";
import {Inject} from "platform/ioc";
import {Component, UI} from "platform/ui";
import {RecentRecipient, RecentRecipientsService} from "../../service/recentRecipientsService";

@Component({
    // language=Vue
    template: `
        <div v-if="recentRecipients.length">
            <div class="recipients-block_title">Последние получатели</div>
            <div class="recipient-item"
                 v-for="(recipient, index) in recentRecipients"
                 :key="recipient.id"
                 :title="recipient.rcpt_name"
                 @click="$emit('select', recipient)">
                <div class="ellipsis">{{ recipient.rcpt_name }}</div>
                <div class="recipient-account">{{ recipient.rcpt_account }}</div>
            </div>
        </div>
    `,
})
export class RecentRecipientsList extends UI {

    /** Сервис по работе со списком последних получателей */
    @Inject private recentRecipientsService: RecentRecipientsService;

    /** Список последних получателей */
    private recentRecipients: RecentRecipient[] = [];

    /**
     * Загружает список последних получателей
     * @inheritDoc
     * @return {Promise<void>}
     */
    @CatchErrors
    async created(): Promise<void> {
        // инициализация списка последних получателей
        this.recentRecipients = await this.recentRecipientsService.getList();
    }
}