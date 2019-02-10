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
import {FieldInfo} from "../model/document";
import {ValidationResult} from "../model/validationResult";

/**
 * Вспомогательный класс для валидации
 */
export class ValidationUtils {

    /** Конструктор */
    private constructor() {
    }

    /**
     * Возвращает правило валидации поля
     * @param {FieldInfo} fieldInfo информация о поле
     * @return {string} правило валидации поля
     */
    static getValidationRule(fieldInfo: FieldInfo): string {
        const validationRule: string[] = [];
        if (fieldInfo.required) {
            validationRule.push("required");
        }
        if (fieldInfo.type === "number") {
            validationRule.push("amount");
        }
        if (fieldInfo.type === "fixed-text") {
            validationRule.push("min:" + fieldInfo.rule.substring(0, fieldInfo.rule.indexOf(";")));
        }
        return validationRule.join("|");
    }

    /**
     * Возвращает статус валидации поля
     * @param {string} fieldId идентификатор поля
     * @param errors ошибки валидации поля
     * @return {ValidationResult}
     */
    static getValidationResult(fieldId: string, errors: ErrorBag): ValidationResult {
        return new ValidationResult(fieldId, errors);
    }
}
