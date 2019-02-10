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
import {Storage} from "platform/services/storage";
import {CookieUtils} from "platform/utils/cookieUtils";
import {StorageKey} from "../model/storageKey";
import {ClientService} from "./clientService";
import {LogoutService} from "./logoutService";

/**
 * Монитор простоя приложения
 */
export class InactivityMonitor {

    /** Экземпляр монитора */
    private static instance: InactivityMonitor = new InactivityMonitor();

    /** Сервис для работы с браузерным хранилищем */
    @Inject
    private storage: Storage;

    /** Сервис по работе с информацией о клиенте */
    @Inject
    private clientService: ClientService;

    /** Сервис выхода из приложения */
    @Inject
    private logoutServise: LogoutService;

    /** Лимит времени простоя в минутах */
    private timeoutInterval: number;

    /**
     * Приватный конструктор
     */
    private constructor() {
    }

    /**
     * Возвращает экземпляр монитора
     * @return {InactivityMonitor}
     */
    static getInstance(): InactivityMonitor {
        return InactivityMonitor.instance;
    }

    /** Инициализация сервиса */
    start(): void {
        const customTimeout = this.clientService.getClientInfo().clientProperties["WORK_SESSION.COMPANY.INACTIVITY_TIMEOUT"];
        this.timeoutInterval = customTimeout ? +customTimeout : 30;
        this.updateActionTime();
        this.checkInactivity();
        window.addEventListener("keypress", () => this.updateActionTime());
        window.addEventListener("click", () => this.updateActionTime());
    }

    /**
     * Обновить время последнего действия клиента
     */
    private updateActionTime(): void {
        this.storage.set(StorageKey.LAST_ACTION_TIME, Date.now());
    }

    /**
     * Проверить простой приложения
     */
    private checkInactivity(): void {
        setTimeout(() => {
            const lastActionTime = this.storage.get(StorageKey.LAST_ACTION_TIME, Date.now());
            const thresholdActionTime = new Date().setMinutes(new Date().getMinutes() - this.timeoutInterval);
            if (lastActionTime < thresholdActionTime) {
                CookieUtils.setIBank2Cookie("TIMEOUT", "true");
                // logout - асинхронная функция. Нет необходимости её await'ить, т.к это последняя операция в этом методе
                this.logoutServise.logout();
            } else {
                this.checkInactivity();
            }
        }, 10000);
    }
}
