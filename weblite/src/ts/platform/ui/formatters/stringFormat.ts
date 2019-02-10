import {CommonUtils} from "../../utils/commonUtils";
import {FormatterUtils} from "../../utils/formatterUtils";

/**
 * Класс описывающий текстовый форматтер
 */
export class StringFormat {

    /** Шаблон поиска вхождений в строке символа запятой */
    static COMMA_REGEXP = /,/g;
    /** Паттерн форматтера */
    pattern: string;
    /** Длинна форматтера */
    len: number;
    /** Инверсия паттерна */
    inverse: boolean;
    /** Признак текста фиксированной длинны */
    fixed: boolean;
    /** Признак числового значения для форматирования */
    isNumber: boolean;
    /** Количество разрядов у числового значения */
    fractSize?: number;

    /**
     * Конструктор
     * @param pattern   паттерн форматтера
     * @param length    длинна форматтера
     * @param isInverse инверсия паттерна
     * @param isFixed   признак текста фиксированной длинны
     * @param isNumber  признак числового значения для форматирования
     */
    constructor(pattern: string, len: number, isInverse?: boolean, isFixed?: boolean, isNumber?: boolean) {
        this.pattern = pattern;
        this.length = len;
        this.inverse = isInverse;
        this.fixed = isFixed;
        this.isNumber = isNumber;
    }

    /**
     * Подготавливает строку к виду BigDecimal
     */
    private static prepareDecimal(str: string) {
        if (str.indexOf(",") !== -1) {
            str = str.replace(StringFormat.COMMA_REGEXP, ".");
        }
        return str.indexOf(" ") !== -1 ? str.deleteWhiteSpaces() : str;
    }

    /**
     * Форматирует строку
     */
    format(str: string): string {
        if (str && this.isNumber) {
            return new BigDecimal(StringFormat.prepareDecimal(str)).format(-1, this.fractionalSize || 0);
        }
        return str;
    }

    /**
     * Форматирует по разрядам
     */
    formatAmount(val: string): string {
        let decimalValue = this.format(val);
        if (decimalValue) {
            for (let i = decimalValue.length - (this.fractionalSize ?  this.fractionalSize + 4 : 3); i > 0; i -= 3) {
                decimalValue = FormatterUtils.replaceCharAt(decimalValue, i, " " + decimalValue.charAt(i));
            }
        }
        return decimalValue;
    }

    /**
     * Форматирует строку и проверяет длинну (если строка фиксированной длинны)
     */
    parseObject(str: string): string {
        if (this.fixed && (str.length !== this.length)) {
            throw new Error("Invalid length : " + str.length);
        }
        return this.format(this.parse(str));
    }

    /**
     * Обрезает строку до первого символа, который нельзя использовать в рамках форматтера
     */
    parse(str: string): string {
        let pos = 0;
        for (; pos < str.length && pos < this.length; pos++) {
            if (this.inverse !== (this.pattern.indexOf(str.charAt(pos)) !== -1)) {
                break;
            }
        }
        return str.substring(0, pos);
    }

    /**
     * Проверяет строку на соответствие форматтеру
     */
    checkString(str: string): boolean {
        if (!CommonUtils.exists(str)) {
            return false;
        }
        for (const char of str) {
            if (this.inverse !== (this.pattern.indexOf(char) !== -1)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Утснавливает количество разрядов
     */
    set fractionalSize(size: number) {
        this.fractSize = size;
    }

    /**
     * Получает количество разрядов
     */
    get fractionalSize(): number {
        return this.fractSize;
    }

    /**
     * Утсанавливает длинну форматтера
     */
    set length(length: number) {
        this.len = length;
    }

    /**
     * Получает длинну форматтера
     */
    get length(): number {
        return this.len;
    }
}