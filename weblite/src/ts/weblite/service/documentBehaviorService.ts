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
import {Cache} from "platform/services/cache";
import {PlainContent} from "../model/document";
import {FormPaymentType} from "../model/formPaymentType";
import {DocumentExtContent} from "./documentService";

/** Ключ для хранения данных в кэше */
const CACHE_KEY = "document-behavior";

/**
 * Сервис для передачи данных для модификации поведения компонента редактирования документа
 */
@Service("DocumentBehaviorService")
@Singleton
export class DocumentBehaviorService {

    @Inject
    private cache: Cache;

    /**
     * Возвращает тип формы платежного поручения, устанавливаемый при инициализации документа. Возвращает null, если информация о форме отсутствует в кэше
     * @return тип формы платежного поручения, устанавливаемый при инициализации документа или null, если контент отсутствует
     */
    getFormPaymentType(): FormPaymentType {
        return !!this.cache.get(CACHE_KEY) ? this.cache.get<ExtendedDocumentBehavior>(CACHE_KEY).formPaymentType : null;
    }

    /**
     * Возвращает контент документа. Возвращает null, если информация отсутствует в кэше
     * @return контент документа или null, если контент отсутствует
     */
    getPreparedContent(): PlainContent {
        return !!this.cache.get(CACHE_KEY) ? this.cache.get<ExtendedDocumentBehavior>(CACHE_KEY).content : null;
    }

    /**
     * Возвращает дополнительную информацию о документе, если она была передана через сервис. Возвращает null, если информация отсутствует в кэше
     * @return дополнительная информация о документе или null, если дополнительная информация отсутствует
     */
    getExtContent(): DocumentExtContent {
        return !!this.cache.get(CACHE_KEY) ? this.cache.get<ExtendedDocumentBehavior>(CACHE_KEY).extContent : null;
    }

    /**
     * Возвращает текст уведомления
     */
    getWarningMessage(): string {
        return !!this.cache.get(CACHE_KEY) ? this.cache.get<ExtendedDocumentBehavior>(CACHE_KEY).warningMessage : null;
    }

    /**
     * Сохраняет в кэш объект с дополнительным поведением для документа
     * @param documentBehavior объект с дополнительным поведением для документа
     */
    setBehavior(documentBehavior: ExtendedDocumentBehavior): void {
        this.cache.put(CACHE_KEY, documentBehavior);
    }

    /**
     * Удаляет объект с контентом документа из кэша
     */
    deleteBehavior(): void {
        this.cache.remove(CACHE_KEY);
    }
}

/** Формат для передачи данных, которые будут использоваться в компоненте документа */
export type ExtendedDocumentBehavior = {
    /** Форма платежного поручения */
    formPaymentType?: FormPaymentType,
    /** Передаваемый контент */
    content?: PlainContent,
    /** Дополнительная информация о документе */
    extContent?: DocumentExtContent
    /** Текст уведомления */
    warningMessage?: string
};