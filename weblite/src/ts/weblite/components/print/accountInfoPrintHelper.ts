import {AbstractPrintHelper} from "platform/services/printService";

/**
 * Класс-помощник для печати реквизитов счета
 */
export class AccountInfoPrintHelper extends AbstractPrintHelper {

    /**
     * Конструктор класса
     * @param {AccountInfoPrintParams} printParams
     */
    constructor(private printParams: AccountInfoPrintParams) {
        super();
    }

    protected getRequestData(): any {
        return this.printParams;
    }

    protected getFilterId(): string {
        return "";
    }

    protected getAction(): string {
        return `${AbstractPrintHelper.ENDPOINT}/accountInfo`;
    }
}

export type AccountInfoPrintParams = {
    branchId: string;
    accountNumber: string;
};