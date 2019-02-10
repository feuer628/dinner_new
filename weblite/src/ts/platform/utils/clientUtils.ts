import {StringMap} from "types";
import {CommonUtils} from "./commonUtils";

/**
 * Вспомогательный класс для работы с клиентом
 */
export class ClientUtils {

    /**
     * Приватный конструктор
     */
    private constructor() {}

    /**
     * Получить короткое имя пользователя
     * @param {StringMap} clientProperties словарь свойств клиента
     * @returns {string} короткое имя пользователя
     */
    static getClientShortName(clientProperties: StringMap): string {
        const internalName = clientProperties.INTERNAL_NAME;
        return CommonUtils.isBlank(internalName) ? clientProperties.SHORT_NAME : internalName;
    }
}