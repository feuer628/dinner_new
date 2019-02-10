/**
 * Сущность письма
 */
export type Letter = {

    /** Тип письма */
    type: LetterType;

    /** Идентификатор документа */
    id: string;

    /** Отправитель письма */
    sender: string;

    /** Получатель письма */
    recipient: string;

    /** Тема письма */
    subject: string;

    /** Дата письма */
    date: string;

    /** Признак важного письма */
    important: boolean;

    /** Признак избранного письма */
    marked: boolean;

    /** Признак того что в письме есть вложения */
    hasAttachments: boolean;

    /** признак того что письмо прочитано */
    read: boolean;
};

/**
 * Тип письма
 */
export enum LetterType {
    /** Входящие */
    INBOX = "inbox",

    /** Исходящие */
    OUTBOX = "outbox",

    /** Черновики */
    DRAFT = "draft"
}