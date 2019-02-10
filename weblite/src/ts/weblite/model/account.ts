/**
 * Счет клиента
 */
export type Account = {

    /** Номер счета */
    accountNumber: string;
    /** Валюта счета */
    currency: string;
    /** Идентификатор счета в системе IBANK */
    ibankAccountId: string;
    /** Тип счета */
    type?: string;
    /** Текущий остаток средств на счете */
    remainder?: string;
    /** Дата занесения сведений о текущем остатке на счете */
    remainderDate?: string;
    /** Дата заведения счета */
    createDate?: string;
    /** Дата закрытия счета */
    closingDate?: string;
    /** Признак необходимости указания вложения при создании платежного поручения по счету */
    paymentAttachRequired?: boolean;
    /** Статус счета */
    status?: string;
    /** Комментарий */
    comments?: string;
    /** Комментарий на английском */
    commentsEn?: string;
    /** Внутрибанковский номер счета */
    intAccount?: string;
    /** признак бюджетируемости счета */
    budget?: boolean;
    /** Идентификатор назначения счета */
    assignmentId?: string;
    /** Свободный остаток средств по счету */
    freeBalance: string;
    /** Дата свободного остатка по счету */
    freeBalanceDate?: string;
    /** Алиас счета */
    clientComments?: string;
};

/**
 * Информация о балансах счетов
 */
export type BalanceInfo = {
    date: string,
    result: BalanceItem[]
};

/**
 * Объект с балансом по счету
 */
export type BalanceItem = {
    accountId: string,
    bic: string,
    account: string,
    date: string,
    balance: string,
    currency: string
};