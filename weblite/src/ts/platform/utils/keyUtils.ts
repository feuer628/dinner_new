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

import {PluginSession} from "default/PluginHelper";

/**
 * Вспомогательные методы для работы с ключами
 */
export class KeyUtils {

    /**
     * Не дает создать экземпляр класса
     */
    private constructor() {
    }

    /**
     * Обновляет информацию в сессии о закэшированных ключах на данном хранилище.
     * Получает актуальную информацию о ключах и объединяет ее с имеющейся дополнительной информацией о ключах.
     * Ключи, отсутствующие в актуальном списке, удаляются из кэша.
     * @param session сессия плагина
     * @param keystoreId идентификатор хранилища ключа
     * @param updatedKeys ключи
     */
    static async saveKeysForStorage(session: PluginSession, keystoreId: string, updatedKeys: { [key: string]: any }): Promise<void> {
        const oldCache = await session.getProperty(keystoreId) || {};
        const newCache: any = {};
        for (const alias of Object.keys(updatedKeys)) {
            const updatedKey = updatedKeys[alias];
            const cachedKey = oldCache[alias];
            if (cachedKey) {
                for (const keyField of Object.keys(cachedKey)) {
                    if (cachedKey.hasOwnProperty(keyField) && !updatedKey.hasOwnProperty(keyField)) {
                        updatedKey[keyField] = cachedKey[keyField];
                    }
                }
            }
            newCache[alias] = updatedKey;
        }
        await session.setProperty(keystoreId, newCache);
    }
}