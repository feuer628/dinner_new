/**
 * Действие над документом
 */
export enum DocumentAction {

    /** Создание */
    NEW = "NEW",

    /** Редактирование */
    EDIT = "EDIT",

    /** Копирование */
    COPY = "COPY",

    /** Ответ */
    REPLY = "REPLY",

    /** Создание из файла */
    IMPORT = "IMPORT"
}