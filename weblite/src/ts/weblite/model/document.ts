import {Status} from "./status";

/**
 * Простой контент, фактически это маркер индексного типа для строковых значений
 */
export type PlainContent = {
    [key: string]: string;
};

/**
 * Контент документа
 * В качестве значений могут быть:
 *  - строковые данные, для обычных полей, таких как NUM_DOC, DATE_DOC
 *  - массив PlainContent, для списковых полей, таких как LIMITS, EMPLOYEES
 */
export type DocumentContent = {
    [key: string]: string | PlainContent[]
};

/**
 * Тип документа
 */
export enum DocumentType {
    /** Письма */
    LETTER = "doc/letter",
    /** Платежное поручение */
    PAYMENT = "doc/payment",
    /** Настройка каналов рассылки уведомлений */
    CHANNELS_SETTINGS = "doc/channels_settings",
    /** Настройка уведомления о текущих остатках */
    DELIVERY_BALANCE = "doc/delivery_balance",
    /** Настройка уведомления о движении средств по счету */
    DELIVERY_FUNDS = "doc/delivery_funds",
    /** Настройка уведомления о входящих банковских документах */
    DELIVERY_INCOMING = "doc/delivery_incoming",
    /** Настройка уведомления о входе в систему */
    DELIVERY_LOGGED_ON = "doc/delivery_logged_on",
    /** Настройка уведомления с выпиской по счету */
    DELIVERY_OPERS = "doc/delivery_opers",
    /** Настройка уведомления об отвержении документа */
    DELIVERY_REJECT = "doc/delivery_reject",
    /** Настройка уведомления о поступлении в банк документа */
    DELIVERY_STATUS = "doc/delivery_status",
    /** Отзыв документа */
    RECALL = "doc/recall"
}

/**
 * Представление документа в системе iBank2
 */
export class Document {
    /** Статус */
    status = Status.NEW;
    /** Идентификатор */
    id: string = null;
    /** Тип */
    type: DocumentType = this.meta.type;
    /** Время последнего статуса документа */
    stateTime: string = null;
    /** Версия */
    version = 0;
    /** Вложения */
    attachments: Attachment[] = [];
    /** Количество вложений */
    attachmentsCount = 0;
    /** Признак непрочитанного документа */
    unread = false;
    /** Комментарий банка к документу */
    comment: string = null;
    /** Комментарий клиента к документу */
    clientComment: string = null;
    /** Массив адресов на которые отправляются уведомления об изменении статуса документа. */
    observeAddresses: ObserveAddress[] = [];
    /** Идентификатор владельца документа. */
    ownerId: string = null;
    /** Идентификатор получателя документа */
    recipient: string = null;
    /** Информация о подписях под документом */
    signers: SignRecord[] = [];
    /** Количество подписей под документом */
    signsCount: number = null;
    /** Необходимое количество подписей под документом */
    requiredSignsCount: string = null;
    /** Описание причины изменения статуса */
    statusDesc: string = null;
    /** БИК банка */
    bankBic: string = null;
    /** Название банка */
    bankName: string = null;
    /** Счет банка */
    bankAccount: string = null;
    /** Признак подтверждения документа */
    confirmed = false;
    /** Признак наличия банковских подписей (сделанные ключом операциониста) */
    hasBankSign = false;

    constructor(public content: DocumentContent, public meta: DocumentMeta) {
    }

}

/** Вложение */
export type Attachment = {
    /** Идентификатор. Старый ключ: "ID" */
    id: string;
    /** Название. Старый ключ: "NAME" */
    name: string;
    /** Размер. Старый ключ: "SIZE" */
    size: number;
    /** Тип. Старый ключ: "TYPE" */
    type: string;
};

/** Адрес уведомления об изменении статуса документа */
export type ObserveAddress = {
    /** Тип. Старый ключ: "ADDRESS_TYPE". TODO: вынести в enum */
    type: string;
    /** Адрес. Старый ключ: "ADDRESS" */
    address: string;
};

/** Информация о подписи */
export type SignRecord = {
    /** Тип действия */
    type: SignRecordType;
    /** Группа подписи */
    group: number;
    /** ФИО подписанта */
    owner?: string;
    /** Дата и время подписи */
    timestamp?: string;
    /** Идентификатор ключа подписи */
    keyId: string;
    /** Тип владельца ключа */
    principal: number;
    /** Должность владельца ключа ЭП */
    ownerPosition?: string;
};

/** Тип записи о подписи */
export enum SignRecordType {
    NONE = -1,
    SIGN = 1,
    SIGN_WITH_VISUALIZATION = 47,
    EXECUTE_AND_SIGN = 40,
    EXPORT_AND_SIGN = 39,
    OTP_CONFIRM = 14,
    MTP_CONFIRM = 17,
    TAN_CONFIRM = 18,
    MAC_CONFIRM = 31,
    SMS_CONFIRM = 30,
    AGSES_CONFIRM = 41
}

/**
 * Мета информация о документе: тип, описание, список полей
 */
export type DocumentMeta = {
    /** Тип документа, например, doc/payment */
    type: DocumentType;
    /** Описание документа, например, Платежное поручение */
    description: string;
    /** Описание полей */
    fields: FieldInfo[];
    /** Карта соответствия имени поля и его описания */
    fieldsMap: FieldInfoMap;
    /** Метаданные о полях */
    metaFields: MetaFields;
};

/** Метаданные о полях */
export type MetaFields = {
    [code: string]: string;
};

/** Описание поля документа */
export type FieldInfo = {
    /** Идентификатор поля */
    id: number;
    /** Наименование поля */
    name: string;
    /** Описание поля */
    description: string;
    /** Форматер поля */
    type: string;
    /** Правило форматирования */
    rule?: string;
    /** Обязательность */
    required: boolean;
    /** Флаг исключено ли поле из подписи */
    excluded: boolean;
    /** Описание вложенных полей */
    fields?: FieldInfo[]
    /** Карта соответствия имени вложенного поля и его описания */
    fieldsMap?: FieldInfoMap;
};

export type FieldInfoMap = {
    [key: string]: FieldInfo;
};