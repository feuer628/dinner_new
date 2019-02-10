import {AbstractPrintHelper} from "platform/services/printService";

/**
 * Класс-помощник для печати выписки
 */
export class StatementPrintHelper extends AbstractPrintHelper {

    /**
     * Конструктор класса
     * @param {PrintStatementParam} params
     */
    constructor(private params: PrintStatementParam) {
        super();
    }

    protected getRequestData(): any {
        return this.params;
    }

    protected getFilterId(): string {
        return "";
    }

    protected getAction(): string {
        return `${AbstractPrintHelper.ENDPOINT}/statement`;
    }
}

/** Параметры печати выписки */
export type PrintStatementParam = {

    /** Идентификатор счета */
    accountId: string;
    /** Идентификатор клиента */
    clientId?: string;
    /** Дата с */
    beginDate: string;
    /** Дата по */
    endDate: string;
    /** Формат */
    format: string;
};