import {StringFormat} from "../ui/formatters/stringFormat";
import {DecimalController, IFormatterController, IntegerController, TextController} from "../ui/textFieldControllers";

export class FormatterUtils {
    static passes(charTyped: string, formatter: StringFormat) {
        const allowedChars = formatter.pattern;
        return !allowedChars || ((allowedChars.indexOf(charTyped) === -1) !== formatter.inverse);
    }

    /**
     * Установливить каретку в указанное положение
     * @param elem элемент, в котором устанавливается положение каретки
     * @param caretPos устанавливаемое положение картеки
     */
    static setCaretPosition(elem: HTMLInputElement, caretPos: number) {
        if (elem.selectionStart) {
            elem.focus();
            elem.setSelectionRange(caretPos, caretPos);
        } else {
            elem.focus();
        }
    }

    static getFormatterController(formatter: StringFormat): IFormatterController {
        if (formatter.isNumber) {
            return formatter.fractionalSize
                ? new DecimalController(formatter)
                : new IntegerController(formatter);
        }
        return new TextController(formatter);
    }

    /**
     * Заменить символ в поле
     * @param val строка, в которой производится изменение
     * @param pos индекс заменяемого символа
     * @param charTyped устаенавливаемый символ
     */
    static replaceCharAt(val: string, pos: number, charTyped: string) {
        return val.substr(0, pos) + charTyped + val.substr(pos + 1);
    }

    /**
     * Заменить подстроку в поле
     * @param val строка, в которой производится изменение
     * @param from начало заменяемой подстроки
     * @param to конец заменяемой подстроки
     * @param charTyped устаенавливаемый символ
     */
    static replaceSubstrAt(val: string, from: number, to: number, charTyped: string) {
        return val.substr(0, from) + charTyped + val.substr(to);
    }

    /**
     * Заменить символ в поле
     * @param val строка, в которой производится изменение
     * @param pos индекс заменяемого символа
     * @param charTyped устаенавливаемый символ
     */
    static insertCharAt(val: string, pos: number, charTyped: string) {
        return val.substr(0, pos) + charTyped + val.substr(pos);
    }

    // Проверка строки на соответствие decimal-формату: /^\d{1,intPart}(\.|,)?\d{1, fractionalPart}$/
    static checkDecimalFormat(decimal: string, formatter: StringFormat) {
        const numberValue = formatter.length - formatter.fractionalSize - 1;
        const fractional = formatter.fractionalSize;
        const regExp = new RegExp("^\\d{1," + numberValue + "}(\\.|,)?(\\d{1," + fractional + "})?$");
        return regExp.test(decimal.deleteWhiteSpaces());
    }
}