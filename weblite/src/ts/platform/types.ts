export type DocumentTreeItem = {
    label: string,
    link?: string,
    icon?: string,
    badge?: Badge,
    items?: DocumentTreeItem[],
    classes?: { [key: string]: boolean }
};

export type Badge = {
    value?: string,
    watchNode?: string,
    classes?: { [key: string]: boolean }
};

export type FormatterOptions = {
    type: string,
    rule: string
};

export type TextfieldState = {
    displayValue: string,
    pos: number,
    isChar: boolean
};

export type BankInfo = {
    BIC_CODE: string,
    BIC_ACC: string,
    NAME: string,
    IBANK_CODE: string,
    SWIFT_CODE?: string,
    ContactInfo?: BankContactInfo
};

export type BankContactInfo = {
    ADDR: string,
    WEB: string,
    EMAIL: string,
    phones: BankPhoneInfo[]
};

export type BankPhoneInfo = {
    NAME: string,
    NUM: string
};

export type EmployeeInfo = {
    lastName: string,
    firstName: string,
    patronymic: string,
    fio: string,
    role: string
};

export type RefItem = {
    value: string,
    text: string,
    color?: string
};

export type StringMap = {
    [key: string]: string
};

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
    exportData: string;
    /** Локаль */
    locale: string;
    /** Тип экспорта */
    exportType: string;
    /** Признак печати */
    print: boolean;
    /** Идентификатор фильтра */
    filterId: string;
};

/**
 * Лицензия на услугу Индикатор
 */
export type IndicatorLicense = {
    /** Наличие лицензии на модуль */
    hasLicense: boolean,
    /** Возможность включения лицензии на модуль */
    isEnableAllowed: boolean,
    /** Идентификатор сервиса */
    serviceId: string;
};