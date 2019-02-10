import {Service} from "platform/decorators/service";
import {Inject, Singleton} from "platform/ioc";
import {Cache} from "platform/services/cache";
import {Http} from "platform/services/http";
import {StringMap} from "platform/types";
import {CommonUtils} from "platform/utils/commonUtils";
import {ConfirmType} from "../model/confirmationType";
import {Attachment, Document, DocumentContent, DocumentMeta, DocumentType, FieldInfo, ObserveAddress, PlainContent, SignRecord} from "../model/document";
import {Status} from "../model/status";
import {ClientService} from "./clientService";
import {DateTimeService} from "./dateTimeService";
import {DocumentListFilter} from "./documentService";
import {SignatureService} from "./signatureService";
import {CommandRequest, CommandResponse, TransactionService} from "./transactionService";

/** Основная часть URL к сервисам по работе с документами */
const ROOT_DOCS_URL = "/ibank2/protected/services/docs";

/**
 * Сервис по работе с документами
 */
@Service("DocumentService")
@Singleton
export class DocumentService {

    /** Сервис HTTP-транспорта */
    @Inject private http: Http;
    /** Сервис для работы с кэшем */
    @Inject private cacheService: Cache;
    /** Сервис по работе с информацией о клиенте */
    @Inject private clientService: ClientService;
    /** Сервис для получения текущего времени */
    @Inject private dateTimeService: DateTimeService;
    /** Сервис для работы с транзакциями */
    @Inject private transactionService: TransactionService;
    /** Сервис по работе с подписями */
    @Inject private signatureService: SignatureService;

    /**
     * Возвращает кол-во не прочитанных(необработанных) документов
     * @param {DocumentType} docType тип документа
     */
    async getUnprocessedCount(docType: DocumentType): Promise<number> {
        const type = docType.substring(4);
        return this.http.get<number>(`${ROOT_DOCS_URL}/${type}/unprocessedCount`);
    }

    /**
     * Создает документ
     * @param {string} docType тип документа
     */
    async create(docType: DocumentType): Promise<Document> {
        const type = docType.substring(4);
        const content = await this.http.get<any>(`${ROOT_DOCS_URL}/${type}/new`);
        const emptyDoc = await this.createEmpty(docType);
        return new Document({...emptyDoc.content, ...content}, emptyDoc.meta);
    }

    /**
     * Создает пустой документ
     * @param docType тип документа
     * @returns пустой документ
     */
    async createEmpty(docType: DocumentType): Promise<Document> {
        const meta = await this.getMeta(docType);
        const content: DocumentContent = {};
        // создаем пустые поля, которые есть в описании
        for (const field of meta.fields) {
            content[field.name] = field.type === "list" ? [] : "";
        }
        return new Document(content, meta);
    }

    /**
     * Возвращает загруженный документ
     * @param {DocumentType} docType тип документа
     * @param {string} docId         идентификатор документа
     * @returns {Promise<Document>} документ
     */
    async load(docType: DocumentType, docId: string): Promise<Document> {
        const type = docType.substring(4);
        const response = await this.http.get<DocumentResponse>(`${ROOT_DOCS_URL}/${type}/${docId}`);
        return await this.parseDocumentResponse(response);
    }

    /**
     * Загружает список документов
     * @param {DocumentType} docType тип документов для загрузки
     * @param {string[]} docIdList   список идентификаторов документов для загрузки
     * @return {Promise<Document[]>} список документов
     */
    async loadList(docType: DocumentType, docIdList: string[]): Promise<Document[]> {
        const type = docType.substring(4);
        const responseList = await this.http.post<DocumentResponse[]>(`${ROOT_DOCS_URL}/${type}/list`, docIdList);
        const documents = [];
        for (const response of responseList) {
            documents.push(await this.parseDocumentResponse(response));
        }
        return documents;
    }

    /**
     * Валидирует документ
     * @param docType тип документа
     * @param document документ
     */
    async validate(docType: DocumentType, document: Document): Promise<StringMap> {
        const request: ValidateDocumentRequest = {
            content: document.content,
            docId: document.id
        };
        return await this.http.post<StringMap>(`${ROOT_DOCS_URL}/${document.type.substring(4)}/validate`, request);
    }

    /**
     * Возвращает описание документа
     * @param {string} docType          тип документа
     * @returns {Promise<DocumentMeta>} описание документа
     */
    async getMeta(docType: DocumentType): Promise<DocumentMeta> {
        const type = docType.substring(4);
        const cacheMetaKey = type + ".meta";
        let meta = this.cacheService.get<DocumentMeta>(cacheMetaKey);
        if (!meta) {
            meta = await this.http.get<DocumentMeta>(`${ROOT_DOCS_URL}/${type}/meta`);
            meta.fieldsMap = {};
            meta.fields.forEach((field: FieldInfo) => {
                meta.fieldsMap[field.name] = field;
                field.fieldsMap = {};
                if (field.type === "list") {
                    field.fields.forEach((innerField: FieldInfo) => {
                        field.fieldsMap[innerField.name] = innerField;
                    });
                }
            });
            Object.freeze(meta);
            this.cacheService.put(cacheMetaKey, meta);
        }
        return meta;
    }

    /**
     * Установить/снять пометку о прочтении документа
     * @param {DocumentType} docType тип документа
     * @param {string} docId         идентификатор документа
     * @param {boolean} isRead       пометка о прочтении
     */
    async setRead(docType: DocumentType, docId: string, isRead: boolean): Promise<void> {
        const type = docType.substring(4);
        return this.http.post<void>(`${ROOT_DOCS_URL}/${type}/${docId}/setRead`, isRead);
    }

    /**
     * Получить Url для загрузки вложения
     * @param {DocumentType} docType тип документа
     * @param {string} docId         идентификатор документа
     * @param {string} attachmentId  идентификатор файла
     * @returns {string} Url для загрузки
     */
    getAttachmentUrl(docType: DocumentType, docId: string, attachmentId: string): string {
        const type = docType.substring(4);
        return `${ROOT_DOCS_URL}/${type}/${docId}/attachments/${attachmentId}/asFile`;
    }

    /**
     * Загрузить вложение документа
     * @param {DocumentType} docType тип документа
     * @param {string} docId         идентификатор документа
     * @param {string} attachmentId  идентификатор файла
     * @returns {Promise<Blob>} вложение в blob объекте
     */
    async getAttachment(docType: DocumentType, docId: string, attachmentId: string): Promise<Blob> {
        const response = await fetch(this.getAttachmentUrl(docType, docId, attachmentId), {
            method: "GET",
            credentials: "same-origin",
        });
        return response.blob();
    }

    /**
     * Групповое удаление документов. Возвращает список, который может содержать объекты с ошибками
     * @param docType тип документа
     * @param {string[]} documentIds идентификаторы документов
     * @return список, который может содержать объекты с ошибками. [null, {code: "ERROR", message: "Ошибка удаления документа"}, null, null]
     */
    async removeList(docType: DocumentType, documentIds: string[]): Promise<any[]> {
        const type = docType.substring(4);
        return this.http.post<any>(`${ROOT_DOCS_URL}/${type}/removeList`, documentIds);
    }

    /**
     * Возвращает список документов
     * @param {DocumentType} docType тип документа
     * @param {DocumentListFilter} docFilter фильтр
     * @return {Promise<any>} список документов
     */
    async getList(docType: DocumentType, docFilter: DocumentListFilter): Promise<PlainContent[]> {
        const type = docType.substr(4);
        const response = await this.http.post<any>(`${ROOT_DOCS_URL}/${type}/filter`, docFilter);
        return response.documentList;
    }

    /**
     * Удалить документ
     * @param {DocumentType} docType тип документа
     * @param {string} docId идентификатор документа
     */
    async remove(docType: DocumentType, docId: string): Promise<void> {
        const type = docType.substring(4);
        await this.http.delete(`${ROOT_DOCS_URL}/${type}/${docId}`, {docId});
    }

    /**
     * Загрузить вложения на сервер
     * @param {DocumentType} docType ип документа
     * @param {string} docId идентификатор документа
     * @param {FormData} data список вложений
     */
    async uploadAttachments(docType: DocumentType, docId: string, data: FormData): Promise<Attachment[]> {
        const type = docType.substring(4);
        return this.http.post<Attachment[]>(`${ROOT_DOCS_URL}/${type}/${docId}/attachments`, data, {headers: {}});
    }

    /**
     * Проверяет устарел ли документ и кидает ошибку если устарел
     * @param docType тип документа
     */
    async checkDocDeprecated(docType: DocumentType): Promise<void> {
        const documentMeta = await this.getMeta(docType);
        if (CommonUtils.exists(documentMeta.metaFields.deprecated)) {
            throw new Error(`Операция невозможна. Документы "${documentMeta.description}" доступны только для просмотра`);
        }
    }

    /**
     * Сохранить получателей документа
     * @param {DocumentType} docType тип документа
     * @param {string} docId         идентификатор документа
     * @param {string[]} ids         список идентификаторов получателей
     * @returns {Promise<void>}
     */
    async saveRecipients(docType: DocumentType, docId: string, ids: string[]): Promise<void> {
        const type = docType.substring(4);
        return this.http.post<void>(`${ROOT_DOCS_URL}/${type}/${docId}/recipients`, ids);
    }

    /**
     * Получить список получателей документа
     * @param {DocumentType} docType тип документа
     * @param {string} docId         идентификатор документа
     * @returns {Promise<string[]>} список получателей документа
     */
    async getRecipients(docType: DocumentType, docId: string): Promise<string []> {
        const type = docType.substring(4);
        return this.http.get<string []>(`${ROOT_DOCS_URL}/${type}/${docId}/recipients`);
    }

    /**
     * Удалить вложения документа
     * @param {DocumentType} docType тип документа
     * @param {string} docId         идентификатор документа
     * @param {string[]} ids с       список идентификаторов получателей
     * @returns {Promise<void>}
     */
    async deleteAttachments(docType: DocumentType, docId: string, ids: string[]): Promise<void> {
        const type = docType.substring(4);
        return this.http.post<void>(`${ROOT_DOCS_URL}/${type}/${docId}/attachments/remove`, ids);
    }

    /**
     * Сохраняет документ
     * @param {Document} document документ
     * @param contentType тип контента документа
     * @param extContent дополнительная информация о документе
     * @return {Promise<string>} идентификатор сохраненного документа
     */
    async save(document: Document, contentType = ContentType.DOCUMENT, extContent?: DocumentExtContent): Promise<string> {
        const request: SaveDocumentRequest = {
            content: document.content,
            docId: document.id,
            clientComment: document.clientComment,
            observeAddresses: document.observeAddresses,
            linkedDocument: null,
            contentType,
            extContent
        };
        return await this.http.post<string>(`${ROOT_DOCS_URL}/${document.type.substring(4)}`, request);
    }

    /**
     * Создает и отправляет документ "Отзыв" на основе переданного документа и указанной причины
     * @param {Document} recallableDocument отзываемый документ
     * @param {string} recallReason причина отзыва
     * @return {Promise<CommandResponse[]>} список результатов выполнения команд
     */
    async sendRecall(recallableDocument: Document, recallReason: string): Promise<CommandResponse[]> {
        const recall = await this.create(DocumentType.RECALL);
        recall.content.CLN_NAME = this.clientService.getClientInfo().clientInfo.name;
        recall.content.RECALL_DOC_TYPE = recallableDocument.type;
        recall.content.RECALL_DOC_ID = recallableDocument.id;
        recall.content.REASON = recallReason;
        const timestamp = await this.dateTimeService.getDateTime();
        const signature = await this.signatureService.generateSignature(recall, timestamp, [recallableDocument]);
        const commandList: CommandRequest[] = [
            {
                id: "save",
                commandName: "SAVE_DOCUMENT",
                params: {
                    docType: DocumentType.RECALL,
                    id: recall.id,
                    content: recall.content,
                    attachment: {
                        attachName: recallableDocument.id,
                        attachType: recallableDocument.type,
                        content: recallableDocument.content
                    }
                }
            },
            {
                commandName: "SIGN_DOCUMENT",
                params: {
                    "docType": DocumentType.RECALL,
                    "id:resultRef": "save.id",
                    "signature": signature,
                    "timestamp": timestamp
                }
            }
        ];
        return await this.transactionService.execute(commandList);
    }

    /**
     * Подписывает документ
     * @param {DocumentType} docType тип документа
     * @param {string} docId идентификатор документа
     * @param {string} timestamp отметка времени подписи
     * @param {string} signature подпись под документом
     * @return {Promise<Status>} статус документа после подписи
     */
    async sign(docType: DocumentType, docId: string, timestamp: string, signature: string): Promise<Status> {
        const type = docType.substring(4);
        const documentStatusCode = await this.http.post<string>(`${ROOT_DOCS_URL}/${type}/${docId}/sign`, {
            sign: signature,
            timestamp: timestamp
        });
        return Status.valueOf(documentStatusCode);
    }

    /**
     * Проверяет документ перед подтверждением
     * @param {DocumentType} docType тип документа
     * @param {string} docId идентификатор документа
     * @return {Promise<ValidateBeforeConfirmResponse>} результат проверки документа
     */
    async validateBeforeConfirm(docType: DocumentType, docId: string): Promise<ValidateBeforeConfirmResponse> {
        const type = docType.substring(4);
        return this.http.get<ValidateBeforeConfirmResponse>(`${ROOT_DOCS_URL}/${type}/${docId}/validateBeforeConfirm`);
    }

    /**
     * Возвращает действие, которое нужно выполнить при подтверждении документа
     * @param {DocumentType} docType тип документа
     * @param {string} docId идентификатор документа
     * @return {Promise<ConfirmCase>} действие, которое нужно выполнить при подтверждении документа
     */
    async getConfirmCase(docType: DocumentType, docId: string): Promise<ConfirmCase> {
        const type = docType.substring(4);
        return this.http.get<ConfirmCase>(`${ROOT_DOCS_URL}/${type}/${docId}/confirmCase`);
    }

    /**
     * Возвращает уникальный идентификатор сессии подтверждения документа
     * @return {Promise<number>} уникальный идентификатор сессии подтверждения документа
     */
    async getConfirmSessionId(): Promise<number> {
        return this.http.get<number>(`${ROOT_DOCS_URL}/confirmSessionId`);
    }

    /**
     * Возвращает информацию, необходимую для подтверждения документа при помощи MAC-токена BIFIT
     * @param {DocumentType} docType тип подтверждаемого документа
     * @param {string} docId идентификатор подтверждаемого документа
     * @return {Promise<ConfirmData>} информация, необходимая для подтверждения документа при помощи MAC-токена BIFIT
     */
    async getDataToConfirm(docType: DocumentType, docId: string): Promise<ConfirmData> {
        const type = docType.substring(4);
        return this.http.get<ConfirmData>(`${ROOT_DOCS_URL}/${type}/${docId}/confirmData`);
    }

    /**
     * Подтверждает документ
     * @param {DocumentType} docType тип документа
     * @param {string} docId идентификатор документа
     * @param {ConfirmRequest} request запрос на подтверждение документа
     * @return {Promise<ConfirmResponse>} результат подтверждения документа
     */
    async confirm(docType: DocumentType, docId: string, request: ConfirmRequest): Promise<ConfirmResponse> {
        const type = docType.substring(4);
        const result = await this.http.post<any>(`${ROOT_DOCS_URL}/${type}/${docId}/confirm`, request);
        return {
            docId: String(result.docId),
            status: Status.valueOf(result.statusCode)
        };
    }

    /**
     * Преобразует ответ сервера DocumentResponse в объект Document
     * @param {DocumentResponse} documentResponse ответ сервера DocumentResponse
     * @return {Promise<Document>} объект Document
     */
    private async parseDocumentResponse(documentResponse: DocumentResponse): Promise<Document> {
        const docType = documentResponse.type;
        const meta = await this.getMeta(docType);
        const document = new Document(documentResponse.content, meta);
        document.status = Status.valueOf(documentResponse.status);
        document.id = documentResponse.id;
        document.type = documentResponse.type;
        document.version = documentResponse.version;
        document.comment = documentResponse.comment;
        document.clientComment = documentResponse.clientComment;
        document.observeAddresses = documentResponse.observeAddresses;
        document.stateTime = documentResponse.stateTime;
        document.unread = documentResponse.unread;
        document.attachments = documentResponse.attachments;
        document.attachmentsCount = documentResponse.attachments ? documentResponse.attachments.length : 0;
        document.ownerId = documentResponse.ownerId;
        document.recipient = documentResponse.recipient;
        document.signers = documentResponse.signers;
        document.signsCount = documentResponse.signsCount;
        document.requiredSignsCount = documentResponse.requiredSignsCount;
        document.statusDesc = documentResponse.statusDesc;
        document.bankBic = documentResponse.bankBic;
        document.bankName = documentResponse.bankName;
        document.bankAccount = documentResponse.bankAccount;
        document.confirmed = documentResponse.confirmed;
        document.hasBankSign = documentResponse.hasBankSign;
        return document;
    }
}

/** Ответ сервиса на запрос получения документа */
type DocumentResponse = {
    /** Статус. Старый ключ: "ST" */
    status: string;
    /** Контент */
    content: any
    /** Идентификатор. Старый ключ: "ID" */
    id: string;
    /** Тип. Старый ключ: "CT" */
    type: DocumentType;
    /** Время последнего статуса документа. Старый ключ: "T" */
    stateTime: string;
    /** Версия. Старый ключ: "V" */
    version: number;
    /** Вложения. Старый ключ: "ATTS" */
    attachments: Attachment[];
    /** Признак не прочитанного документа. Старый ключ: "R" */
    unread: boolean;
    /** Комментарий банка к документу. Старый ключ: "C" */
    comment: string;
    /** Комментарий клиента к документу. Старый ключ: "CC" */
    clientComment: string;
    /** Массив адресов на которые отправляются уведомления об изменении статуса документа. Старый ключ: "OA" */
    observeAddresses: ObserveAddress[];
    /** Идентификатор владельца документа */
    ownerId: string;
    /** Идентификатор получателя документа. Старый ключ: "RECIPIENT" */
    recipient: string;
    /** Информация о подписях под документом. Старый ключ: "SGS" */
    signers: SignRecord[];
    /** Количество подписей под документом. Старый ключ: "SC" */
    signsCount: number;
    /** Необходимое количество подписей под документом. Старый ключ: "RS" */
    requiredSignsCount: string;
    /** Описание причины изменения статуса. Старый ключ: "M" */
    statusDesc: string;
    /** БИК банка. Старый ключ: "BB" */
    bankBic: string;
    /** Название банка. Старый ключ: "BN" */
    bankName: string;
    /** Счет банка. Старый ключ: "BA" */
    bankAccount: string;
    /** Признак подтверждения документа. Старый ключ: "DC" */
    confirmed: boolean;
    /** Признак наличия банковских подписей (сделанные ключом операциониста). Старый ключ: "HBS" */
    hasBankSign: boolean;
};

/** Запрос на сохранение документа */
type SaveDocumentRequest = {
    /** Контент документа */
    content: DocumentContent;
    /** Идентификатор документа */
    docId: string;
    /** Комментарий клиента */
    clientComment: string;
    /** Информация об уведомлениях aka Observers */
    observeAddresses: ObserveAddress[];
    /** Информация о связанном документе */
    linkedDocument: LinkedDocumentInfo;
    /** Тип контента документа */
    contentType: string,
    /** Дополнительная информация о документе */
    extContent?: DocumentExtContent
};

/** Информация о связанном документе */
type LinkedDocumentInfo = {
    /** Тип связанного документа */
    docType: string;
    /** Идентификатор связанного документа */
    docId: string;
};

/** Формализованный список полей, которые передаются в качестве дополнительного контента (дополнительной информации о документе) */
export type DocumentExtContent = {
    /** Идентификатор задачи */
    taxEventId?: string,
    /** Идентификатор события */
    taxTaskId?: string,
    /** Признак уплаты пени */
    taxPenalty?: string
};

/** Запрос на валидацию документа */
type ValidateDocumentRequest = {
    /** Контент документа */
    content: DocumentContent,
    /** Идентификатор документа */
    docId: string,
    /** Признак игнорирования ошибок валидации с типом "Предупреждение" */
    ignoreWarnings?: boolean
};

/**
 * Базовая модель данных для фильтров
 */
export type DocumentListFilter = {
    /** Список полей для выборки. Если отсутствует - все поля */
    fields?: FieldFilter[];
    /** Коды статусов */
    statuses: number[];
    /** Начальный период */
    bdate?: string;
    /** Конечный период */
    edate?: string;
    /** Запрос для выборки необходимых документов */
    query?: string;
    /** Название фильтра для загрузчика списка */
    filterId?: string;
    /** Индекс первого загружаемого элемента */
    firstIndex?: number;
    /** Размер страницы */
    pageSize?: number;
};

export type FieldFilter = {
    /** Идентификтор поля */
    id?: number;
    /** Наименование поля */
    name?: string;
    /** Ожидаемое имя поля */
    alias?: string;
};

/**
 * Результат проверки документа перед подтверждением
 */
export type ValidateBeforeConfirmResponse = {

    /** Статус проверки */
    status: "OK" | "ERROR";

    /** Сообщение об ошибке, возникшей при проверке документа перед подтверждением */
    errorMessage: string | null;

    /** Дополнительная информация о документе */
    data: {[key: string]: string};
};

/**
 * Перечисление действий, которые можно выполнить при подтверждении документа
 */
export enum ConfirmCase {

    /** Запрос на добавление получателя в доверенные */
    ADD_TRUSTED_RECIPIENT_QUESTION = "ADD_TRUSTED_RECIPIENT_QUESTION",

    /** Запрос на перевод доверенного получателя из статуса "Удален" в "Активный" */
    ACTIVATE_DELETED_TRUSTED_RECIPIENT_QUESTION = "ACTIVATE_DELETED_TRUSTED_RECIPIENT_QUESTION",

    /** Необходимо подтвердить документ средствами подтверждения */
    REQUIRES_CONFIRMATION = "REQUIRES_CONFIRMATION",

    /** Необходимо перевести документ в статус "Доставлен" без подтверждения */
    TRANSFER_TO_READY = "TRANSFER_TO_READY"
}

/**
 * Тип контента в документе.
 * Необходим для вызова необходимых проверок при сохранении документов, до того как документу будет установлен статус.<br/>
 * <ul>
 * <li>DOCUMENT - обычный документ, к которому применяются все проверки</li>
 * <li>PATTERN - шаблон документа, допускается возможность не заполнения необходимых полей</li>
 * <li>DRAFT - черновик документа, к которому не применяются проверки бизнес-логики документа, а так же: <br/>
 * допускается возможность не заполнения всех необходимых полей, <br/>
 * проверяется корректность заполненных полей на соответствие типу поля в документе<br/>
 * </li>
 * </ul>
 */
export enum ContentType {

    /** Готовый к сохранению документ */
    DOCUMENT = "DOCUMENT",
    /** Шаблон */
    PATTERN = "PATTERN",
    /** Черновик */
    DRAFT = "DRAFT"
}

/**
 * Информация, необходимая для подтверждения документа при помощи MAC-токена BIFIT
 */
export type ConfirmData = {

    /** Строка для отображения на экране MAC-токена BIFIT */
    displayData: string;

    /** Хэш данных для подтверждения в формате hex */
    digest: string;
};

/**
 * Запрос на подтверждение документа
 */
export type ConfirmRequest = {

    /** Тип подтверждения */
    confirmType: ConfirmType;

    /** Одноразовый пароль */
    otp?: string;

    /** Хеш токена, при помощи которого выполняется подтверждение */
    tokenHash?: string;

    /** Идентификатор сессии, в рамках которой выполняется подтверждение */
    sessionId?: number;
};

/**
 * Ответ сервиса на запрос на подтверждение документа
 */
export type ConfirmResponse = {

    /** Идентификатор подтвержденного документа */
    docId: string;

    /** Статус документа после подтверждения */
    status: Status;
};