/**
 * Глобальные события
 */
export enum GlobalEvent {

    /** Событие обработки ошибки */
    HANDLE_ERROR = "HANDLE_ERROR",

    /** Событие очистки очереди ошибок */
    CLEAR_ERRORS = "CLEAR_ERRORS",

    /** Событие обновления списка событий */
    REFRESH_EVENTS_LIST = "REFRESH_EVENTS_LIST",

    /** Событие обновления списка контрагентов */
    REFRESH_COUNTERPARTIES_LIST = "REFRESH_COUNTERPARTIES_LIST",

    /** Событие удаления счета контрагента */
    REMOVE_COUNTERPARTY_ACCOUNT = "REMOVE_COUNTERPARTY_ACCOUNT",

    /** Событие удаления контакта контрагента */
    REMOVE_COUNTERPARTY_CONTACT = "REMOVE_COUNTERPARTY_CONTACT",

    /** Событие обновления списка задач налогового календаря */
    REFRESH_TAX_TASKS_LIST = "REFRESH_TAX_TASKS_LIST",
}