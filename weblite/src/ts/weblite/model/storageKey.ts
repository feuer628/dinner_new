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

/**
 * Ключи от значений хранилища
 */
export enum StorageKey {

    /** Информация о последнем используемом ключе ЭП */
    LAST_ACTIVE_KEY = "last_active_key",

    /** Время последнего действия клиента */
    LAST_ACTION_TIME = "__lastActionTime__",

    /** E-mail последнего получателя сообщения */
    EMAIL_TO_SEND = "email_to_send"
}