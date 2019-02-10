import {Singleton} from "platform/ioc";
import {Service} from "../decorators/service";

/**
 * Сервис кэширования данных
 */
@Service("Cache")
@Singleton
export class Cache {

    private cache = Object.create(null);

    put(key: string, value: any): void {
        this.cache[key] = value;
    }

    get<T>(key: string): T {
        return <T> this.cache[key];
    }

    remove(key: string): void {
        delete this.cache[key];
    }

    clear(): void {
        this.cache = Object.create(null);
    }
}

/** Ключи для сервиса кэширования данных */
export enum CacheKey {
    /**
     * Ключ для хранения данных о поставщиках ЖКХ услуг
     */
    HCS_PROVIDERS_CACHE_KEY = "hcs-providers-cache",
    /**
     * Ключ для размещения в кэше идентификатора счета
     */
    SELECTED_ACCOUNT_ID_KEY = "selected-account-id",
    /**
     * Ключ для хранения данных о контрагентах
     * В кеше хранятся результаты запросов на получение фактов деятельности контрагента
     */
    INDICATOR_CONTRACTORS_CACHE_KEY = "indicator-contractors-cache",
    /**
     * Ключ для хранения данных о масках бюджетных счетов
     */
    CHARGE_RCPT_ACCOUNTS_CACHE_KEY = "charge-rcpt-accounts-cache",
    /**
     * Ключ для хранения данных о банках из справочника "russian_swift"
     */
    BANKS_INFO = "BANKS_INFO"
}