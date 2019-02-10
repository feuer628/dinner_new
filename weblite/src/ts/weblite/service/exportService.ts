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
import {Inject} from "platform/ioc";
import {Http} from "platform/services/http";
import {ExportType} from "platform/services/printService";

/**
 * Сервис экспорта
 */
@Service("ExportService")
export class ExportService {

    /** Сервис HTTP-транспорта */
    @Inject
    private http: Http;

    /**
     * Отправляет запрос на создание на сервере файла с выпиской для последующей загрузки
     * @param {ExportStatementRequest} request запрос
     * @return {Promise<string>} идентификатор созданного файла
     */
    async createStatementFile(request: ExportStatementRequest): Promise<string> {
        return await this.http.post<string>("/ibank2/protected/services/export/statement/createFile", request);
    }
}

/**
 * Запрос на создание на сервере файла выписки для последующей загрузки
 */
export type ExportStatementRequest = {

    /** Формат выписки */
    format: StatementFormat;

    /** Тип экспорта */
    exportType: ExportType;

    /** Идентификатор счета */
    accountId: string;

    /** Является ли счет внешним */
    external?: boolean;

    /** Дата начала периода выписки */
    beginDate?: string;

    /** Дата окончания периода выписки */
    endDate?: string;
};

/**
 * Формат выписки
 */
export enum StatementFormat {

    /** Сокращенный */
    BRIEF = "brief",

    /** Стандартный */
    STANDARD = "standard",

    /** Расширенный (Альбомный) */
    EXTENDED = "extended"
}
