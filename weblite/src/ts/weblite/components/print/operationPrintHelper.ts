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

import {AbstractPrintHelper} from "platform/services/printService";

/**
 * Класс-помощник для печати выписки
 */
export class OperationPrintHelper extends AbstractPrintHelper {

    /**
     * Конструктор класса
     * @param {PrintStatementParam} params
     */
    constructor(private params: PrintOperationsParam) {
        super();
    }

    protected getRequestData(): any {
        return this.params;
    }

    protected getFilterId(): string {
        return "";
    }

    protected getAction(): string {
        return `${AbstractPrintHelper.ENDPOINT}/operationDocument`;
    }
}

/** Параметры печати операции из выписки */
export type PrintOperationsParam = {

    /** Идентификатор счета */
    operations: OperationPrintInfo[];
    /** Идентификатор счета */
    accountId: string;
    /** Признак внешнего счета */
    external: boolean;
};

export type OperationPrintInfo = {
    /** Хэш операции */
    hash: string,
    /** Код операции */
    code: string
};