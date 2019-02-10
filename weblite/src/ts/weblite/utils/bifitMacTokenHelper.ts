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

import * as PluginHelper from "default/PluginHelper";
import {PluginSession} from "default/PluginHelper";
import {CookieUtils} from "platform/utils/cookieUtils";

/**
 * Помощник по работ с MAC-токеном BIFIT
 */
export class BifitMacTokenHelper {

    /** Наименование сессии MAC-токена BIFIT */
    private static readonly SESSION_NAME = "__bifit_mac_token__";

    /** Наименование куки для сессии MAC-токена BIFIT */
    private static readonly TOKEN_COOKIE_NAME = "MSESSIONID";

    /**
     * Не дает создавать экземпляры класса
     */
    private constructor() {
    }

    /**
     * Получить сессию работы с MAC-токеном BIFIT.
     * В случае, если сессии нет, восстанавливаем ее
     * @returns {Promise<PluginSession>} сессия работы с MAC-токеном BIFIT
     */
    static async getMacTokenSession(): Promise<PluginSession> {
        let macTokenSession: PluginSession;
        try {
            macTokenSession = PluginHelper.getSession(this.SESSION_NAME);
        } catch (error) {
            // восстанавливаем сессию
            const sessionId = CookieUtils.getCookie(this.TOKEN_COOKIE_NAME);
            macTokenSession = await PluginHelper.restoreSession(sessionId, this.SESSION_NAME);
            // специально не восстанавливаем последний использованный MAC-токен, тк токены "равнозначны" и выбирается первый попавшийся через checkDeviceReady
            CookieUtils.setIBank2Cookie(this.TOKEN_COOKIE_NAME, macTokenSession.sessionId);
        }
        return macTokenSession;
    }

    /**
     * Закрывает сессию работы с MAC-токеном BIFIT
     */
    static async closeMacTokenSession(): Promise<void> {
        await PluginHelper.closeSession(BifitMacTokenHelper.SESSION_NAME);
    }
}