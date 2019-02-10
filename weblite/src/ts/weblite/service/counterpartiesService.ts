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
import {Inject, Singleton} from "platform/ioc";
import {Http} from "platform/services/http";
import {ContractorInfo, ContractorInfoResponse} from "../components/indicatorServiceComponent";
import {ClientService} from "./clientService";
import {Event, EventCategory} from "./eventsService";

/** Основная часть URL к сервисам по работе с контрагентами */
const ROOT_SERVICE_URL = "/ibank2/protected/services/contractors";

/**
 * Сервис для работы с контрагентами
 */
@Service("CounterpartiesService")
@Singleton
export class CounterpartiesService {

    /** HTTP-транспорт */
    @Inject
    private http: Http;

    /** Сервис по работе с информацией о клиенте */
    @Inject
    private clientService: ClientService;

    /**
     * Возвращает список контрагентов
     * @return список контрагентов
     */
    async getCounterparties(): Promise<Counterparty[]> {
        const counterpartyList = await this.http.get<CounterpartyResponse[]>(ROOT_SERVICE_URL);
        return counterpartyList.map(counterparty => {
            let counterpartyObject = {
                ...counterparty
            } as Counterparty;
            if (counterparty.indicatorInfo) {
                counterpartyObject = {
                    ...counterpartyObject,
                    indicatorInfo: {
                        ...counterparty.indicatorInfo,
                        activityFacts: parseInt(counterparty.indicatorInfo.activityFacts, 10) || 0,
                        payAttentionFacts: parseInt(counterparty.indicatorInfo.payAttentionFacts, 10) || 0,
                        achievements: parseInt(counterparty.indicatorInfo.achievements, 10) || 0,
                        criticalFacts: parseInt(counterparty.indicatorInfo.criticalFacts, 10) || 0
                    }
                };
            }
            return counterpartyObject;
        });
    }

    /**
     * Возвращает контрагента, найденного по идентификатору
     * @param id идентификатор контрагента
     * @return контрагент
     */
    async getCounterparty(id: string): Promise<Counterparty> {
        return this.http.get<Counterparty>(`${ROOT_SERVICE_URL}/${id}`);
    }

    /**
     * Возвращает список событий по контрагенту
     * @param id идентификатор контрагента
     * @param eventFilter параметры фильтра
     * @return {Promise<Event[]>} список событий
     */
    async getCounterpartyEvents(id: string, eventFilter: CounterpartyEventsFilter): Promise<Event[]> {
        const filter = {
            ...eventFilter,
            category: eventFilter.category.value
        };
        return this.http.get<Event[]>(`${ROOT_SERVICE_URL}/${id}/events`, filter);
    }

    /**
     * Сохраняет контрагента
     * @param counterpartyRequest запрос на добавление контрагента
     * @return идентификатор сохраненного контрагента
     */
    async createCounterparty(counterpartyRequest: CounterpartyCreateRequest): Promise<string> {
        return this.http.post<string>(`${ROOT_SERVICE_URL}`, counterpartyRequest);
    }

    /**
     * Создает или обновляет существующего контрагента на основе документа
     * @param docId идентификатор документа
     */
    async createOrUpdateCounterparty(docId: string) {
        return this.http.post<string>(`${ROOT_SERVICE_URL}/fromDocument/${docId}`);
    }

    /**
     * Удаляет контрагента по его идентификатору
     * @param id идентификатор контрагента
     */
    async removeCounterparty(id: string): Promise<void> {
        await this.http.delete<void>(`${ROOT_SERVICE_URL}/${id}`);
    }

    /**
     * Добавляет или снимает отметку "избранного" контрагента
     * @param id идентификатор контрагента
     * @param isMarked признак избранного контрагента
     */
    async setCounterpartyMark(id: string, isMarked: boolean): Promise<void> {
        return this.http.post<void>(`${ROOT_SERVICE_URL}/${id}/mark`, isMarked.toString());
    }

    /**
     * Устанавливает комментарий к контрагенту
     * @param id идентификатор контрагента
     * @param comment комментарий к контрагенту
     */
    async setCounterpartyComment(id: string, comment: string): Promise<void> {
        return this.http.post<void>(`${ROOT_SERVICE_URL}/${id}/comment`, comment);
    }

    /**
     * Устанавливает наименование контрагента
     * @param id идентификатор контрагента
     * @param name наименование контрагента
     */
    async setCounterpartyName(id: string, name: string): Promise<void> {
        return this.http.post<void>(`${ROOT_SERVICE_URL}/${id}/name`, name);
    }

    /**
     * Сохраняет счет контрагента
     * @param counterpartyId идентификатор контрагента
     * @param account данные счета контрагента
     * @return идентификатор сохраненного контрагента
     */
    async saveCounterpartyAccount(counterpartyId: string, account: CounterpartyAccount): Promise<string> {
        const request: CounterpartyAccount = {
            bic: account.bic,
            account: account.account
        };
        if (account.id) {
            await this.http.post<void>(`${ROOT_SERVICE_URL}/${counterpartyId}/accounts/${account.id}`, request);
            return account.id;
        }
        return this.http.post<string>(`${ROOT_SERVICE_URL}/${counterpartyId}/accounts`, request);
    }

    /**
     * Удаляет счет контрагента
     * @param counterpartyId идентификатор контрагента
     * @param accountId идентификатор счета контрагента
     */
    async removeCounterpartyAccount(counterpartyId: string, accountId: string): Promise<void> {
        await this.http.delete(`${ROOT_SERVICE_URL}/${counterpartyId}/accounts/${accountId}`);
    }

    /**
     * Сохраняет контактные данные контрагента
     * @param counterpartyId идентификатор контрагента
     * @param contact контактные данные контрагента
     * @return идентификатор сохраненных контактных данных контрагента
     */
    async saveCounterpartyContact(counterpartyId: string, contact: CounterpartyContact): Promise<string> {
        const request: CounterpartyContact = {
            fio: contact.fio,
            position: contact.position,
            phone: contact.phone,
            email: contact.email
        };
        if (contact.id) {
            await this.http.post<void>(`${ROOT_SERVICE_URL}/${counterpartyId}/contacts/${contact.id}`, request);
            return contact.id;
        }
        return this.http.post<string>(`${ROOT_SERVICE_URL}/${counterpartyId}/contacts`, request);
    }

    /**
     * Удаляет контактные данные контрагента
     * @param counterpartyId идентификатор контрагента
     * @param contactId контактные данные контрагента
     */
    async removeCounterpartyContact(counterpartyId: string, contactId: string): Promise<void> {
        await this.http.delete(`${ROOT_SERVICE_URL}/${counterpartyId}/contacts/${contactId}`);
    }
}

/** Контрагент */
export type Counterparty = CounterpartyBase & {
    /** Информация о контрагенте, полученная из сервиса "Индикатор" */
    indicatorInfo?: ContractorInfo
};

/** Контрагент, общие поля */
export type CounterpartyBase = {
    /** Идентификатор контрагента */
    id: string,
    /** Идентификатор клиента */
    clientId: string,
    /** ИНН контрагента */
    inn?: string,
    /** КПП контрагента */
    kpp?: string,
    /** Форма документа, открываемая при создании п/п. 0 - контрагенту; 1 - в налоговую; 2 - в таможню; 3- прочие бюджетные */
    paymentForm?: number,
    /** Наименование контрагента */
    name: string,
    /** Признак "избранного" контрагента */
    isMarked: boolean,
    /** Комментарий к контрагенту */
    comment: string,
    /** Дата последнего взаимодействия с  */
    lastEventDate: string,
    /** Список счетов */
    accounts: CounterpartyAccount[],
    /** Список контактов */
    contacts: CounterpartyContact[],
};

/** Контрагент. Транспортный объект */
type CounterpartyResponse = CounterpartyBase & {
    /** Информация о контрагенте, полученная из сервиса "Индикатор" */
    indicatorInfo?: ContractorInfoResponse
};

/** Счет контрагента */
export type CounterpartyAccount = {
    /** Идентификатор счета */
    id?: string,
    /** БИК банка контрагента */
    bic: string,
    /** Номер счета контрагента */
    account: string
};

/** Контакт контрагента */
export type CounterpartyContact = {
    /** Идентификатор контакта */
    id?: string,
    /** ФИО контактного лица */
    fio?: string,
    /** Должность контактного лица */
    position?: string,
    /** Телефон */
    phone?: string,
    /** Электронная почта */
    email?: string
};

/** Фильтр запроса списка контрагентов */
export type CounterpartyFilter = {

    /** Категория событий */
    category: CounterpartyCategory,

    /** Поисковый запрос */
    searchQuery?: string,

    /** Дата начала интервала запроса */
    bdate?: string,

    /** Дата окончания интервала запроса */
    edate?: string
};

/** Контрагент, общие поля */
export type CounterpartyCreateRequest = {
    /** ИНН контрагента */
    inn: string,
    /** Наименование контрагента */
    name: string,
    /** Комментарий к контрагенту */
    comment?: string
};

/** Категории контрагентов, по которым происходит фильтрация */
export class CounterpartyCategory {

    static ALL = new CounterpartyCategory("ALL", "Все контрагенты");
    static MARKED = new CounterpartyCategory("MARKED", "Избранные");
    static ON_LIQUIDATION = new CounterpartyCategory("ON_LIQUIDATION", "На ликвидации");
    static PAY_ATTENTION = new CounterpartyCategory("PAY_ATTENTION", "Требуют внимания");

    /**
     * Конструктор
     * @param value значение
     * @param label отображаемое значение
     * @param count количество контрагентов в данной категории
     */
    constructor(public value: string, public label: string, public count = 0) {
    }
}

/** Запрос страницы ленты событий контрагента */
export type CounterpartyEventsFilter = {
    /** Категория событий */
    category: EventCategory,
    /** Начальный индекс загружаемого списка событий */
    firstIndex: number,
    /** Поисковый запрос */
    searchQuery: string,
    /** Дата начала интервала запроса */
    bdate?: string,
    /** Дата окончания интервала запроса */
    edate?: string,
};