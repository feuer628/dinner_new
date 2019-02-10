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

import {Inject, Singleton} from "platform/ioc";
import {Service} from "../../platform/decorators/service";
import {Document} from "../model/document";
import {ReferenceService} from "./referenceService";

/** Наименование справочника */
const RECENT_RECIPIENTS_KEY = "weblite_recent_recipient";

/**
 * Сервис для работы с последними получателями
 */
@Service("RecentRecipientsService")
@Singleton
export class RecentRecipientsService {

    /** Сервис для работы со справочниками */
    @Inject private referenceService: ReferenceService;
    /** Список последних получателей */
    private list: RecentRecipient[] = null;

    /**
     * Возвращает список последних получателей клиента
     * @return {Promise<RecentRecipient[]>} список последних получателей клиента
     */
    async getList(): Promise<RecentRecipient[]> {
        if (!this.list) {
            await this.refreshList();
        }
        return this.list;
    }

    /**
     * Сохраняет получателя на основе контента документа
     * @param {Document} document документ
     * @return {Promise<string>} идентификатор сохраненного получателя
     */
    async saveByDocument(document: Document): Promise<void> {
        return this.save({
            rcpt_inn: document.content.RCPT_INN as string,
            rcpt_name: document.content.RCPT_NAME as string,
            rcpt_account: document.content.RCPT_ACCOUNT as string,
            rcpt_bank_bic: document.content.RCPT_BANK_BIC as string,
        });
    }

    /**
     * Загружает и обновляет список получателей
     */
    private async refreshList(): Promise<void> {
        this.list = (await this.referenceService
            .getFilteredReference<RecentRecipient>(RECENT_RECIPIENTS_KEY, {sortingParams: [{columnId: "act_time", sortDir: "-"}]})).content;
        this.list.forEach(Object.seal);
    }

    /**
     * Сохраняет получателя
     * @param {RecentRecipient} recipient сохраняемый получатель
     */
    private async save(recipient: RecentRecipient): Promise<void> {
        // Отправляем запрос на сохранение
        await this.referenceService.saveTopic<RecentRecipient>(RECENT_RECIPIENTS_KEY, recipient);
        // Перезагружаем список
        await this.refreshList();
    }
}

/**
 * Описание получателя
 */
export type RecentRecipient = {
    rcpt_inn: string,
    rcpt_name: string,
    rcpt_account: string,
    rcpt_bank_bic: string,
};
