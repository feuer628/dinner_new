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
import {PlainContent} from "../model/document";
import {FormPaymentType} from "../model/formPaymentType";
import {Status} from "../model/status";

const ROOT_SERVICE_URL = "/ibank2/protected/services/tax_calendar/";

/**
 * Сервис для работы с задачами налогового календаря
 */
@Service("TaxCalendarService")
@Singleton
export class TaxCalendarService {

    /** HTTP-транспорт */
    @Inject
    private http: Http;

    /** Признак возможности работы с налоговым календарем */
    private taxCalendarAvailable = false;

    /**
     * Подгружает возможности работы с налоговым календарем
     */
    async init(): Promise<void> {
        this.taxCalendarAvailable = await this.http.get<boolean>(`${ROOT_SERVICE_URL}available`);
    }

    /**
     * Возвращает признак возможности работы с налоговым календарем
     * @return признак возможности работы с налоговым календарем
     */
    isTaxCalendarAvailable(): boolean {
        return this.taxCalendarAvailable;
    }

    /**
     * Получить задачи налогового календаря
     * @param {TaskFilter} filter параметры фильтра
     * @param category категория списка
     * @return {Promise<Event[]>} список событий
     */
    async getTaxTasksList(filter: TaskFilter, category: TaskCategory): Promise<TaxTask[]> {
        const tasks = await this.http.get<TaxTaskResponse[]>(ROOT_SERVICE_URL + "tasks", {...filter, category: category.name});
        return tasks.map(task => {
            return {
                id: task.id,
                endDate: task.endDate,
                eventId: task.eventId,
                eventDate: task.eventDate,
                title: task.title,
                description: task.description,
                comments: task.comments,
                docInfo: task.docInfo ? {
                    ...task.docInfo,
                    docStatus: Status.valueOf(task.docInfo.docStatus)
                } as TaxDocInfo : null,
                penaltyDocInfo: task.penaltyDocInfo ? {
                    ...task.penaltyDocInfo,
                    docStatus: Status.valueOf(task.penaltyDocInfo.docStatus)
                } as TaxDocInfo : null,
                documentContentContainer: {
                    ...task.documentContentContainer,
                    paymentForm: FormPaymentType.valueByName(task.documentContentContainer.paymentForm)
                }
            } as TaxTask;
        });
    }

    /**
     * Отправляет запрос для завершения задачи
     * @param task задача
     */
    async completeTask(task: TaxTask): Promise<void> {
        return this.http.post<void>(ROOT_SERVICE_URL + "task/complete", {id: task.id, eventId: task.eventId, comment: task.comments});
    }

    /**
     * Отправляет запрос для возобновления задачи
     * @param id идентификатор задачи
     */
    async restoreTask(id: string): Promise<void> {
        return await this.http.post<void>(`${ROOT_SERVICE_URL}task/${id}/restore`);
    }
}

/** Информация о задаче уплаты в бюджет по событию календаря */
export type TaxTask = TaxTaskBase & {
    /** Информация о платежном поручении */
    docInfo?: TaxDocInfo;
    /** Информация о платежном поручении на уплату пени */
    penaltyDocInfo?: TaxDocInfo;
    /** Объект, содержащий информацию для создания платежа в клиентском формате */
    documentContentContainer: DocumentContentContainer;
};

/** Информация о созданном документе для задачи налогового календаря */
export type TaxDocInfo = TaxDocInfoBase & {
    /** Статус документа */
    docStatus: Status;
};

/** Общая информация о задаче уплаты в бюджет по событию календаря */
export type TaxTaskBase = {
    /** Идентификатор задачи календаря */
    id?: string;
    /** Идентификатор события */
    eventId?: string;
    /** Дата завершения задачи */
    endDate?: string;
    /** Дата события */
    eventDate: string;
    /** Заголовок события */
    title: string;
    /** Описание события */
    description: string;
    /** Комментарий */
    comments?: string;
};

/** Информация от сервера о задаче уплаты в бюджет по событию календаря */
export type TaxTaskResponse = TaxTaskBase & {
    /** Информация о платежном поручении */
    docInfo?: TaxDocInfoResponse;
    /** Информация о платежном поручении на уплату пени */
    penaltyDocInfo?: TaxDocInfoResponse;
    /** Объект, содержащий информацию для создания платежа в серверном формате */
    documentContentContainer: DocumentContentContainerResponse;
};

/** Общая информация о созданном документе для задачи налогового календаря */
export type TaxDocInfoBase = {
    /** Идентификатор платежного поручения */
    docId: string;
    /** Дата документа */
    docDate: string;
};

/** Информация от сервера о созданном документе для задачи налогового календаря */
export type TaxDocInfoResponse = TaxDocInfoBase & {
    /** Статус документа */
    docStatus: string;
};

/** Серверный формат объекта с информацией для создания платежа */
export type DocumentContentContainerResponse = {
    /** Форма создания платежа */
    paymentForm: string;
    /** Контент для создания документа по событию */
    paymentContent: PlainContent;
    /** Контент для создания документа по просроченному событию */
    penaltyContent: PlainContent;
};

/** Клиентский формат объекта с информацией для создания платежа */
export type DocumentContentContainer = {
    /** Форма создания платежа */
    paymentForm: FormPaymentType;
    /** Контент для создания документа по событию */
    paymentContent: PlainContent;
    /** Контент для создания документа по просроченному событию */
    penaltyContent: PlainContent;
};

/** Фильтр запроса списка задач */
export type TaskFilter = {
    /** Поисковый запрос */
    searchQuery?: string,
    /** Дата начала интервала запроса */
    bdate?: string,
    /** Дата окончания интервала запроса */
    edate?: string
};

/** Категория списка задач налогового календаря */
@Enum("name")
export class TaskCategory extends (<IStaticEnum<TaskCategory>> EnumType) {
    static readonly ACTUAL = new TaskCategory("ACTUAL", "Актуальные");
    static readonly COMPLETED = new TaskCategory("COMPLETED", "Завершенные");
    static readonly OVERDUE = new TaskCategory("OVERDUE", "Просроченные");
    static readonly FUTURE = new TaskCategory("FUTURE", "Задачи на будущее");

    constructor(public name: string, public label: string) {
        super();
    }
}