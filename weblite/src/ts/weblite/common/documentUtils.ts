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

import {Container} from "platform/ioc";
import {Status} from "../model/status";
import {ClientService} from "../service/clientService";

export class DocumentUtils {

    /**
     * Статусы, в которых возможно редактирование документа
     * @type {Status[]}
     */
    private static readonly EDITABLE_STATUSES = [
        /** Новый */
        Status.NEW,
        /** Подписан */
        Status.ON_SIGN,
        /**  Требует подтверждения */
        Status.REQUIRES_CONFIRMATION,
        /** На акцепт */
        Status.FOR_ACCEPTANCE,
        /** Не акцептован */
        Status.NOT_ACCEPTED,
        /** Черновик */
        Status.DRAFT
    ];

    /**
     * Статусы, в которых документ находится на стороне клиента (не передан банку в обработку)
     * @type {Status[]}
     */
    private static readonly CLIENT_SIDE_STATUSES = DocumentUtils.EDITABLE_STATUSES.concat([Status.REJECTED]);

    /**
     * Статусы, в которых возможен отзыв документа
     * @type {Status[]}
     */
    private static readonly RECALLABLE_STATUSES = [
        /** Доставлен */
        Status.READY,
        /** На обработке */
        Status.ON_EXECUTE,
        /** На исполнении */
        Status.ACCEPTED,
        /** В картотеке */
        Status.IN_CATALOG
    ];

    /** Конструктор */
    private constructor() {
    }

    /**
     * Возвращает признак того, что документ в переданном статусе можно отредактировать
     * @param {Status} status статус
     * @return {boolean} признак возможности редактирования
     */
    static isEditableStatus(status: Status): boolean {
        // TODO: дополнительные условия:
        // 1) Для документов, которые могут быть акцептованы ("doc/payment", "doc/currency_payment", "doc/payment_app), требуется логика проверки значения
        // системного свойства "documents.partial_accepted.can_edit" и, собственно частичного акцепта
        // 2) Некоторые документы могут быть нередактируемыми независимо от статуса (например, входящие или устаревшие) или зависеть от других
        // условий (как в бюджетировании)
        return this.EDITABLE_STATUSES.includes(status) ||
            Status.REJECTED === status && Container.get(ClientService).getClientInfo().clientProperties["DOCUMENTS.REJECTED.CAN_EDIT"] === "true";
    }

    /**
     * Возвращает признак того, что документ в переданном статусе находится на стороне клиента (не передан банку в обработку)
     * @param {Status} status статус
     * @return {boolean} признак того, что документ в переданном статусе находится на стороне клиента (не передан банку в обработку)
     */
    static isClientSideStatus(status: Status): boolean {
        return this.CLIENT_SIDE_STATUSES.includes(status);
    }

    /**
     * Возвращает признак того, что документ в переданном статусе можно отозвать
     * @param {Status} status статус
     * @return {boolean} признак возможности отзыва
     */
    static isRecallableStatus(status: Status): boolean {
        if (status === Status.EXECUTED) {
            return Container.get(ClientService).getClientInfo().clientProperties["DOCUMENTS.RECALL.APPLY2EXECUTED"] === "true";
        }
        return DocumentUtils.RECALLABLE_STATUSES.includes(status);
    }
}