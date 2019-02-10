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
import {Service} from "platform/decorators/service";
import {Inject, Singleton} from "platform/ioc";
import {Http} from "platform/services/http";
import {BifitMacTokenHelper} from "weblite/utils/bifitMacTokenHelper";

/** Имя параметра, по изменению которого уходит событие релогина */
const RELOGIN_KEY = "__relog__";

/**
 * Сервис выхода из приложения
 */
@Service("LogoutService")
@Singleton
export class LogoutService {

    /** Сервис HTTP-транспорта */
    @Inject
    private http: Http;

    /** Текущий идентификатор системы */
    private currentSystemId: string = null;

    /** Временная метка последнего релогина для текущей вкладки */
    private reloginTimestamp: string = null;

    /**
     * Инициализирует сервис
     */
    init(): void {
        try {
            this.currentSystemId = PluginHelper.getSession().getCurrentSystemId();
        } catch (ignore) {}
        // Подписываемся на событие релогина в других вкладках
        window.addEventListener("storage", event => {
            if (event.key === RELOGIN_KEY && event.newValue !== this.reloginTimestamp) {
                this.reload();
            }
        });
    }

    /**
     * Выполняет выход из приложения
     */
    async logout(): Promise<void> {
        try {
            await this.http.post("/ibank2/Logout");
            try {
                await PluginHelper.closeSession();
                await BifitMacTokenHelper.closeMacTokenSession();
            } catch (mute) {}
            try {
                // Отправляем событие релогина всем вкладкам
                this.reloginTimestamp = new Date().getTime() + "|" + this.currentSystemId;
                localStorage.setItem(RELOGIN_KEY, this.reloginTimestamp);
            } catch (mute) {}
            this.reload();
        } catch (mute) {
        }
    }

    /**
     * Перезагружает приложение
     */
    private reload(): void {
        window.location.replace("/");
    }
}