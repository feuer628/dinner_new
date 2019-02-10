import {Account} from "./account";

/**
 * Класс содержащий информацию о банке
 */
export type BankInfo = {

    /** Идентификатор банка в системе ЦБ РФ */
    bic: string;
    /** Корреспондентский счет банка в системе ЦБ РФ */
    corrAcc: string;
    /** Идентификатор банка в системе SWIFT */
    swift: string;
    /** Идентификатор банка в системе IBANK */
    ibankCode: string;
    /** Наименование Банка в системе ЦБ РФ */
    name: string;
    /** Наименование Банка в системе IBANK */
    ibankName: string;
    /** Наименование Банка на английском в системе IBANK */
    ibankNameEn: string;
    /** Краткое наименование Банка в системе IBANK */
    ibankShortName: string;
    /** ИНН Банка в системе IBANK */
    ibankInn: string;
    /** Список счетов */
    accounts: Account[];
};