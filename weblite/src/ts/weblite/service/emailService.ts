import {Service} from "platform/decorators/service";
import {Inject, Singleton} from "platform/ioc";
import {Http} from "platform/services/http";
import {AccountInfoPrintParams} from "../components/print/accountInfoPrintHelper";

/** Основная часть URL к сервису по работе с email */
const ROOT_SERVICE_URL = "/ibank2/protected/services/email/docs";

/**
 * Сервис по работе с email
 */
@Service("EmailService")
@Singleton
export class EmailService {

    /** HTTP-транспорт */
    @Inject
    private http: Http;

    /**
     * Отправляет письмо c информацией о счете
     * @param {AccountEmailSendRequest} sendingData данные для отправки
     * @return {Promise<string[]>}
     */
    async sendAccountInfoToEmail(sendingData: AccountEmailSendRequest): Promise<void> {
        await this.http.post<string[]>(`${ROOT_SERVICE_URL}/accountInfo`, sendingData);
    }

    /**
     * Отправляет письмо с документом
     * @param {AccountEmailSendRequest} sendingData данные для отправки
     * @return {Promise<string[]>}
     */
    async sendDocumentToEmail(sendingData: DocumentEmailSendRequest): Promise<void> {
        await this.http.post<string[]>(`${ROOT_SERVICE_URL}/documentsInfo`, sendingData);
    }

    /**
     * Отправляет письмо с документами операций
     * @param {OperationDocumentEmailSendRequest} request запрос на отправку
     */
    async sendOperationDocumentToEmail(request: OperationDocumentEmailSendRequest): Promise<void> {
        await this.http.post<string[]>(`${ROOT_SERVICE_URL}/operationDocument`, request);
    }
}

/** Данные, необходимые для отправки реквизитов счета */
export type AccountEmailSendRequest = {

    /** Идентификатор сотрудника */
    employeeId: string;

    /** Список получателей */
    recipients: string[];

    /** Тип отправляемых данных */
    contentType: string;

    /** Описание отправляемых данных */
    content: AccountInfoPrintParams;
};

/** Данные, необходимые для отправки документа */
export type DocumentEmailSendRequest = {

    /** Идентификатор сотрудника */
    employeeId: string,

    /** Список документов */
    docDataList: DocData[],

    /** Список получателей */
    recipientsList: string[]
};

/** Данные документа */
export type DocData = {

    /** Идентификатор документа */
    docId: string,

    /** Тип документа (без префикса "doc/") */
    docType: string
};

/** Запрос на отправку письма с документами операций */
export type OperationDocumentEmailSendRequest = {

    /** Идентификатор счета, которому принадлежат операции */
    accountId: string;

    /** Является ли счет внешним */
    externalAccount?: boolean;

    /** Хеши операций */
    operationsHashes: string[];

    /** Список email адресов получателей документов операций */
    emails: string[];
};