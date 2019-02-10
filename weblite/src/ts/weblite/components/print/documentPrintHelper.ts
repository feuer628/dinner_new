import {AbstractPrintHelper, ExportType, PrintJob} from "platform/services/printService";

/**
 * Класс-помощник для печати документов
 */
export class DocumentPrintHelper extends AbstractPrintHelper {

    /**
     * Конструктор
     * @param {DocumentPrintParam[]} params параметры печати документов
     * @param filterId идентификатор фильтра (используется для писем)
     */
    constructor(protected params: DocumentPrintParam[], protected filterId = "") {
        super();
    }

    getPrintJob(exportType: ExportType, print: boolean): PrintJob {
        return {
            formAction: this.getAction(),
            params: {
                exportData: JSON.stringify(this.getRequestData()),
                locale: "ru",
                exportType,
                print,
                filterId: this.getFilterId()
            }
        };
    }

    protected getRequestData(): any {
        return this.params;
    }

    protected getFilterId(): string {
        return this.filterId;
    }

    protected getAction(): string {
        return `${AbstractPrintHelper.ENDPOINT}/document`;
    }
}

/** Параметры печати */
export type DocumentPrintParam = {
    /** Идентификатор */
    id: string;
    /** Тип */
    docType: string;
};