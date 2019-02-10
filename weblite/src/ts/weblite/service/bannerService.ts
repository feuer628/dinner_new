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
import {Service} from "platform/decorators/service";
import {Inject, Singleton} from "platform/ioc";
import {Http} from "platform/services/http";

/** Основная часть URL к сервисам по работе с баннерами */
const ROOT_BANNERS_URL = "/ibank2/protected/services/banners";

/**
 * Сервис по работе с баннерами
 */
@Service("BannerService")
@Singleton
export class BannerService {

    /** Адрес страницы с картинкой баннера */
    static readonly BANNER_URL = `/ibank2/weblite/img/banners/active_banner.png`;

    /** Сервис по работе с http */
    @Inject
    private http: Http;

    /**
     * Возвращает информацию по баннеру
     * @returns {Promise<RegionResponse>} информация по баннеру
     */
    async getInfo(): Promise<RegionResponse> {
        return this.http.get<RegionResponse>(`${ROOT_BANNERS_URL}/info`);
    }
}

/**
 * Регион
 */
export type Region = {

    /** Координаты активной области */
    coordinates: string,

    /** Адрес документа, на который следует перейти */
    href: string,

    /** Текст при наведении мышкой */
    title: string
};

/**
 * Ответ от сервиса на запрос получения информации по баннеру
 */
export type RegionResponse = {

    /** Признак существования баннера */
    exist: boolean,

    /** Список регионов */
    regions: Region[]
};
