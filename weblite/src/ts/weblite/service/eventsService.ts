/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "BIFIT" JSC, TIN 7719617469
 *       105203, Russia, Moscow, Nizhnyaya Pervomayskaya, 46
 * (c) "BIFIT" JSC, 2018
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       АО "БИФИТ", ИНН 7719617469
 *       105203, Россия, Москва, ул. Нижняя Первомайская, д. 46
 * (c) АО "БИФИТ", 2018
 */

import {Service} from "platform/decorators/service";
import {Enum, EnumType, IStaticEnum} from "platform/enum";
import {Inject, Singleton} from "platform/ioc";
import {Http} from "platform/services/http";

const ROOT_SERVICE_URL = "/ibank2/protected/services/events/list";

/**
 * Сервис событий
 */
@Service("EventsService")
@Singleton
export class EventsService {

    /** HTTP-транспорт */
    @Inject
    private http: Http;

    /**
     * Получить события
     * @param {EventFilter} eventFilter параметры фильтра
     * @return {Promise<Event[]>} список событий
     */
    async getEventList(eventFilter: EventFilter): Promise<Event[]> {
        const filter = {
            ...eventFilter,
            category: eventFilter.category.value
        };
        return this.http.get<Event[]>(ROOT_SERVICE_URL, filter);
    }
}

/** Фильтр запроса списка событий */
export type EventFilter = {

    /** Категория событий */
    category: EventCategory,

    /** Начальный индекс загружаемого списка событий */
    firstIndex: number,

    /** Поисковый запрос */
    searchQuery?: string,

    /** Идентификатор счета */
    accountId?: string,

    /** Дата начала интервала запроса */
    bdate?: string,

    /** Дата окончания интервала запроса */
    edate?: string
};

/** Событие */
export type Event = {
    id: string,
    title: string,
    description: string,
    amount: string,
    date: string,
    status: string,
    type: EventType,
    operationCode: string,
    operationType: OperationType,
    accountId: string,
    important: boolean
};

/** Категории событий, по которым происходит фильтрация */
@Enum("value")
export class EventCategory extends (<IStaticEnum<EventCategory>> EnumType) {
    static readonly ALL = new EventCategory("ALL", "Все события");
    static readonly INCOME = new EventCategory("INCOME", "Поступления");
    static readonly EXPENSE = new EventCategory("EXPENSE", "Списания");
    static readonly DRAFT = new EventCategory("DRAFT", "Черновики");
    static readonly NEWS = new EventCategory("NEWS", "Новости");

    constructor(public value: string, public label: string) {
        super();
    }
}

/** Тип события */
export enum EventType {

    /** Документ "Платежное поручение" */
    PAYMENT = "PAYMENT",

    /** Операция из выписки */
    OPERATION = "OPERATION",

    /** Новость */
    NEWS = "NEWS",
}

/** Тип операции из выписки */
export enum OperationType {

    /** Доходная операция */
    INCOME = "INCOME",

    /** Расходная операция */
    EXPENSE = "EXPENSE",

    /** Неизветный тип / не операция */
    UNKNOWN = "UNKNOWN"
}