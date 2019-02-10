import {DateUtils} from "../../weblite/utils/dateUtils";
import {CommonUtils} from "../utils/commonUtils";
import {FormatterFactory} from "./formatters/formatterFactory";

/**
 * Класс фильтров
 */
export class Filters {

    /**
     * Стандартный фильтр форматирования даты. Отображает год, если он не совпадает с текущим
     * Примеры:
     * <ul>
     *     <li>Дата текущего дня:           "Сегодня"</li>
     *     <li>Дата в рамках текущего года: "12 июня"</li>
     *     <li>Остальные случаи:            "12 июня 2017"</li>
     * </ul>
     * @param {string} date дата
     */
    static formatDisplayDateWithYear(date: string): string {
        return DateUtils.formatDisplayDate(DateUtils.parseDate(date));
    }

    /**
     * Стандартный фильтр форматирования даты.
     * Примеры:
     * <ul>
     *     <li>Дата текущего дня: "Сегодня"</li>
     *     <li>Остальные случаи:  "12 июня"</li>
     * </ul>
     * @param {string} date дата
     */
    static formatDisplayDate(date: string): string {
        return DateUtils.formatDisplayDate(DateUtils.parseDate(date), false);
    }

    /**
     * Фильтр форматирования даты возможностью указать произвольный формат
     * @param {string} date        дата
     * @param {string} format      формат отображаемой даты
     * @param {string} parseFormat формат исходной даты
     * @returns {string} отформатированая дата
     */
    static formatDate(date: string, format: string, parseFormat?: string): string {
        return DateUtils.parseDate(date, parseFormat).format(format);
    }

    /**
     * Фильтр суммы
     * @param value исходное значение суммы
     * @returns отформатированное значение суммы
     */
    static formatAmount(value: string): string {
        return FormatterFactory.getFormatter({type: "amount", rule: "%1.2d;19"}).formatAmount(value);
    }

    /**
     * Преобразует строку к нижнему регистру оставляя заглавной только первую букву
     * @param value исходная строка
     * @returns отформатированная строка
     */
    static capitalize(value: string): string {
        return CommonUtils.isBlank(value) ? "" : value[0].toUpperCase() + value.slice(1).toLowerCase();
    }

    /**
     * Фильтр форматирования размера в байтах
     * @param {number} value     значений в байтах
     * @param {number} precision количество знаков после запятой;
     * @returns {string} отформатированый размер в байтах
     */
    static formatBytes(value: number, precision: number): string {
        if (0 === value) {
            return "0 Bytes";
        }
        const c = 1024;
        const d = precision || 2;
        const e = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
        const f = Math.floor(Math.log(value) / Math.log(c));
        return parseFloat((value / Math.pow(c, f)).toFixed(d)) + " " + e[f];
    }

    /**
     * Фильтр форматирования номера телефона
     * TODO: добавить форматирование международных номеров телефонов
     * @param value исходная строка
     * @return {string} отформатированый номер телефона
     */
    static formatPhone(value: any): string {
        if (!value) {
            return "";
        }
        const stringValue = value.toString();
        if (stringValue.matches("\\+79\\d{9}")) {
            // Форматируем российский номер телефона
            return stringValue.substring(0, 2) +
                " (" + stringValue.substring(2, 5) + ") " +
                stringValue.substring(5, 8) + "-" +
                stringValue.substring(8, 10) + "-" +
                stringValue.substring(10, 12);
        }
        return stringValue;
    }

    /**
     * Фильтр, обеспечивающий склонение существительных в зависимости от заданного количества
     * @param {number} n          заданное количество
     * @param {string} onePiece   склонение существительного для количества, заканчивающегося на 1 и не на 11 (1 день, 41 день, 181 день);
     * @param {string} twoPieces  склонение существительного для количества, заканчивающегося на 2/3/4 и не на 12/13/14;
     * @param {string} fivePieces склонение существительного для количества, заканчивающегося на 0/5/6/7/8/9/11/12/13/14;
     * @returns {string} существительное в нужном склонении
     */
    static decl(n: number, onePiece: string, twoPieces: string, fivePieces: string): string {
        return arguments[n % 10 === 1 && n % 100 !== 11 ? 1 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 2 : 3];
    }
}