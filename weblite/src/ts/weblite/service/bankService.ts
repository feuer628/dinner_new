import {Service} from "platform/decorators/service";
import {Inject, Singleton} from "platform/ioc";
import {Cache, CacheKey} from "platform/services/cache";
import {PageParam, RefUtils} from "../utils/refUtils";
import {ReferenceService, ThesaurusResponse} from "./referenceService";

/**
 * Сервис для работы с банками
 */
@Service("BankService")
@Singleton
export class BankService {

    /** Сервис для работы со справочниками */
    @Inject
    private referenceService: ReferenceService;
    /** Сервис по работе с кэшем */
    @Inject
    private cache: Cache;

    /**
     * Возвращает информацию о банке по его бику
     * @param bic бик
     * @return {Promise<BankData>} информация о банке
     */
    async getBank(bic: string): Promise<BankData> {
        return this.referenceService.getTopic<BankData>("russian_swift", bic);
    }

    /**
     * Возвращает информацию о банках постранично
     * @param filter фильтр
     * @returns информация о банках
     */
    async getBanks(filter: BankFilter): Promise<ThesaurusResponse<BankData>> {
        const request = RefUtils.buildPageRequest(filter);
        return this.referenceService.getFilteredReference<BankData>("russian_swift", request);
    }

    /**
     * Возвращает информацию о банках для указанных БИКов
     * @param  bics БИКи, по которым нужно получить информацию
     * @returns информация о банках
     */
    async getBanksByBics(bics: string[]): Promise<BankData[]> {
        const banksFromCache: BankData[] = [];
        const notFoundInCacheBics: string[] = [];
        for (const bic of bics) {
            const bank = this.getBankFromCache(bic);
            if (bank) {
                banksFromCache.push(bank);
            } else {
                notFoundInCacheBics.push(bic);
            }
        }
        if (notFoundInCacheBics.length) {
            const request = RefUtils.buildPageRequest({pageSize: notFoundInCacheBics.length, pageNumber: 0});
            request.query = `[bik] IN (${notFoundInCacheBics.map(bic => `'${bic}'`).join(",")})`;
            const response: ThesaurusResponse<BankData> = (await this.referenceService.getFilteredReference<BankData>("russian_swift", request));
            for (const bank of response.content) {
                this.addBankToCache(bank);
            }
            return [...response.content, ...banksFromCache];
        }
        return banksFromCache;
    }

    /**
     * Возвращает данные по банку из кеша
     * @param bic БИК банка
     * @return данные по банку
     */
    private getBankFromCache(bic: string): BankData {
        return this.cache.get(CacheKey.BANKS_INFO) ? this.cache.get<{ [key: string]: BankData }>(CacheKey.BANKS_INFO)[bic] : null;
    }

    /**
     * Добавляет данные по банку в кеш
     * @param bankData данные по банку
     */
    private addBankToCache(bankData: BankData): void {
        const banksCache = this.cache.get<{ [key: string]: BankData }>(CacheKey.BANKS_INFO) || {};
        banksCache[bankData.bik] = bankData;
        this.cache.put(CacheKey.BANKS_INFO, banksCache);
    }
}

/**
 * Информация о банке
 */
export type BankData = {
    /** БИК банка */
    bik?: string,
    /** Счет банка */
    bill_corr?: string,
    /** Наименование банка */
    bank_name: string,
    /** Город */
    city?: string,
    /** Статус банка */
    state?: string
};

/**
 * Фильтр для справочника банков
 */
export type BankFilter = BankData & PageParam;