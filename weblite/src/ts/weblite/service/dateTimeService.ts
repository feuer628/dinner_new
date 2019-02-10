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

/**
 * Сервис для получения текущего времени
 */
@Service("DateTimeService")
@Singleton
export class DateTimeService {

    /** Сервис HTTP-транспорта */
    @Inject
    private http: Http;

    /**
     * Возвращает текущее время в формате dd.MM.yyyy HH:mm GMTXXX
     * @return {Promise<string>} текущее время в формате dd.MM.yyyy HH:mm GMTXXX
     */
    async getDateTime(): Promise<string> {
        return this.http.get<string>("/ibank2/protected/services/datetime");
    }
}