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
import {DocumentContent, DocumentType} from "../model/document";

/**
 * Сервис импорта файлов
 */
@Service("ImportService")
@Singleton
export class ImportService {

    /** HTTP-транспорт */
    @Inject
    private http: Http;

    /**
     * Преобразует файл импорта в контент документа
     * @param docType тип документа
     * @param file файл импорта
     */
    async createContent(docType: DocumentType, file: File): Promise<DocumentContent> {
        const type = docType.substring(4);
        const formData = new FormData();
        formData.append("file", file, file.name);
        return await this.http.post<DocumentContent>(`/ibank2/protected/services/import/${type}/createContent`, formData, {headers: {}});
    }
}