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

import {DocumentType} from "model/document";
import {Service} from "platform/decorators/service";
import {Inject, Singleton} from "platform/ioc";
import {Http} from "platform/services/http";

/**
 * Сервис работы с отправкой SMS с одноразовым паролем для подтверждения документов
 */
@Service("DocumentSmsService")
@Singleton
export class DocumentSmsService {

    /** Сервис HTTP-транспорта */
    @Inject
    private http: Http;

    /**
     * Отправляет запрос на отправку одноразовых паролей для подтверждения документа по SMS
     * @param {DocumentType} docType тип подтверждаемого документа
     * @param {string} docId идентификатор подтверждаемого документа
     * @param {number} sessionId уникальный идентификатор сессии, в рамках которой выполняется подтверждение
     */
    async sendOtpBySms(docType: DocumentType, docId: string, sessionId: number): Promise<void> {
        const type = docType.substring(4);
        await this.http.post(`/ibank2/protected/services/otp_by_sms/doc/${type}`, {
            sessionId: String(sessionId),
            docIds: [docId]
        });
    }
}