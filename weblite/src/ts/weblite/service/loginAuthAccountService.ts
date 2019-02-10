/*
 *  STRICTLY CONFIDENTIAL
 *  TRADE SECRET
 *  PROPRIETARY:
 *        "BIFIT" JSC, TIN 7719617469
 *        105203, Russia, Moscow, Nizhnyaya Pervomayskaya, 46
 *  (c) "BIFIT" JSC, 2018
 *
 *  СТРОГО КОНФИДЕНЦИАЛЬНО
 *  КОММЕРЧЕСКАЯ ТАЙНА
 *  СОБСТВЕННИК:
 *        АО "БИФИТ", ИНН 7719617469
 *        105203, Россия, Москва, ул. Нижняя Первомайская, д. 46
 * (c) АО "БИФИТ", 2018
 */

import {Service} from "platform/decorators/service";
import {Inject, Singleton} from "platform/ioc";
import {Http} from "platform/services/http";

/**
 * Сервис по работе с учетными записями входа по логину
 */
@Singleton
@Service("LoginAuthAccountService")
export class LoginAuthAccountService {

    @Inject
    private http: Http;

    /**
     * Сгенерировать серверную половину сессионного пароля
     * @return {Promise<string>} серверная половина сессионного пароля
     */
    async generateSessionPassword(): Promise<string> {
        return this.http.get<string>("/ibank2/protected/services/loginAuthAccounts/generateSessionPassword");
    }

    /**
     * Установить ЭП в сессию
     * @return {Promise<ExtAuthResponse>} ответ сервера с информацией для расширенной аутентификации
     */
    async installEs(request: EsInstallationRequest): Promise<ExtAuthResponse> {
        return this.http.post<ExtAuthResponse>("/ibank2/protected/services/loginAuthAccounts/installEs", request);
    }

    /**
     * Расширенная аутентификация
     * @param params параметры расширенной аутентификации
     * @return {Promise<ExtAuthResponse>} ответ сервера с информацией для расширенной аутентификации
     */
    async extAuth(params: { [key: string]: string }): Promise<ExtAuthResponse> {
        return this.http.post<ExtAuthResponse>("/ibank2/protected/services/loginAuthAccounts/extAuth", params);
    }

    /**
     * Отправляет SMS с кодом для расширенной аутентификации при установке ЭП в сессию
     * @return номер отправленного SMS-кода
     */
    async sendExtAuthSms(): Promise<string> {
        return this.http.get<string>(`/ibank2/protected/services/loginAuthAccounts/sendExtAuthSms`);
    }
}

/** Структура, описывающая модель запроса на установку ЭП в сессию */
export type EsInstallationRequest = {
    /** Идентификатор ЭП */
    esId: string,
    /** Серийный номер токена */
    tokenSerial?: string,
    /** Клиентская половина сессионного пароля (HEX строка) */
    clientHalfPass: string,
    /** Подпись сессионного пароля в формате CMS (HEX строка) */
    sign: string
};

/** Ответ сервера с информацией для расширенной аутентификации */
export type ExtAuthResponse = {
    /** Код ответа */
    code: number,
    /** Информация для расширенной аутентификации */
    extAuthInfo: { [key: string]: string },
    /** Сообщение об ошибке */
    errorMessage: string
};