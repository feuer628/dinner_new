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
import {ErrorBag} from "vee-validate";

/** Результат валидации поля */
export class ValidationResult {

    /** Идентификатор поля */
    private fieldId: string = null;
    /** Общий список ошибок */
    private errors: ErrorBag = null;

    /** Конструктор
     * @param {string} fieldId идентификатор поля
     * @param {"vee-validate".ErrorBag} errors общий список ошибок
     */
    constructor(fieldId: string = null, errors: ErrorBag = null) {
        this.fieldId = fieldId;
        this.errors = errors;
    }

    /**
     * Очищает сообщение об ошибке
     */
    clear(): void {
        if (this.errors && this.fieldId) {
            this.errors.remove(this.fieldId);
        }
    }

    /**
     * Возвращает объект с названиями классов стилей
     * @return { [key: string]: boolean }
     */
    get classObject(): { [key: string]: boolean } {
        const result: { [key: string]: boolean } = {};
        if (this.errors && this.fieldId) {
            result.invalid = this.errors.has(this.fieldId);
        }
        return result;
    }

    /**
     * Возвращает сообщение об ошибке
     * @return {string}
     */
    get errorMessage(): string {
        if (this.errors && this.fieldId) {
            return this.errors.first(this.fieldId);
        }
        return null;
    }
}