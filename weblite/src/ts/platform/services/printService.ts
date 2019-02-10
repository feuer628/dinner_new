import {Singleton} from "platform/ioc";
import {Service} from "../decorators/service";
import {PrintFrame} from "../ui/print/printFrame";

/**
 * Сервис по работе с печатью
 */
@Service("PrintService")
@Singleton
export class PrintService {

    /**
     * Печать
     * @param {AbstractPrintHelper} printHelper класс-помощник для работы с сервисом печати
     * @return {Promise<void>}
     */
    async print(printHelper: AbstractPrintHelper): Promise<void> {
        const printJob = printHelper.getPrintJob(ExportType.HTML, true);
        await PrintFrame.print(printJob);
    }

    /**
     * Сохранение в формате PDF
     * @param {AbstractPrintHelper} printHelper класс-помощник для работы с сервисом печати
     */
    saveAsPdf(printHelper: AbstractPrintHelper): void {
        const printJob = printHelper.getPrintJob(ExportType.PDF, false);
        PrintFrame.print(printJob);
    }
}

/**
 * Абстрактный класс-помощник для работы с сервисом печати
 */
export abstract class AbstractPrintHelper {

    /** Основной URL экспорта */
    protected static ENDPOINT = "/ibank2/protected/services/export";

    /**
     * Возвращает задание печати
     * @param {string} exportType   тип экспорта
     * @param {boolean} print       признак печати
     * @return {PrintJob} задание печати
     */
    getPrintJob(exportType: ExportType, print: boolean): PrintJob {
        return {
            formAction: this.getAction(),
            params: {
                exportData: JSON.stringify(this.getRequestData()),
                locale: "ru",
                exportType,
                print
            }
        };
    }

    /**
     * Возвращает данные запроса
     * @return {string} данные запроса
     */
    protected abstract getRequestData(): any;

    /**
     * Возвращает идентификатор фильтра
     * @return {string} идентификатор фильтра
     */
    protected abstract getFilterId(): any;

    /**
     * Возвращает URL обработчика печати
     * @return {string} URL обработчика печати
     */
    protected abstract getAction(): string;
}

/** Задание печати */
export type PrintJob = {
    /** Action формы */
    formAction: string;
    /** Параметры формы */
    params: PrintFormParam;
};

/** Параметры формы */
export type PrintFormParam = {
    /** Данные запроса */
    exportData: any;
    /** Локаль */
    locale: string;
    /** Тип экспорта */
    exportType: ExportType;
    /** Признак печати */
    print: boolean;
    /** Идентификатор фильтра */
    filterId?: string;
};

/** Типы экспорта */
export enum ExportType {
    HTML = "HTML",
    RTF = "RTF",
    PDF = "PDF"
}