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

/**
 * Сервис для работы с транзакциями
 */
@Service("TransactionService")
@Singleton
export class TransactionService {

    /** Сервис HTTP-транспорта */
    @Inject
    private http: Http;

    /**
     * Отправляет на сервер запрос на выполнение нескольких команд в рамках одной транзакции
     * @param {CommandRequest[]} commandList список команд
     * @return {Promise<CommandResponse[]>} список результатов выполнения команд
     */
    async execute(commandList: CommandRequest[]): Promise<CommandResponse[]> {
        return this.http.post<CommandResponse[]>(`/ibank2/protected/services/transaction/execute`, {commandList});
    }
}

/**
 * Запрос на выполнение команды в транзакции
 */
export type CommandRequest = {
    /** Идентификатор запроса */
    id?: string;
    /** Наименование команды */
    commandName: string;
    /** Параметры для выполнения команды */
    params: { [key: string]: any };
};

/**
 * Ответ на запрос на выполнение команды в транзакции
 */
export type CommandResponse = {
    /** Идентификатор выполненного запроса */
    requestId?: string;
    /** Наименование выполненной команды */
    commandName: string;
    /** Результаты выполнения команды */
    results: { [key: string]: any };
};