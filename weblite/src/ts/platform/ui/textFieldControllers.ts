import {TextfieldState} from "../types";
import {StringFormat} from "../ui/formatters/stringFormat";
import {CommonUtils} from "../utils/commonUtils";
import {EventUtils} from "../utils/eventUtils";
import {FormatterUtils} from "../utils/formatterUtils";

export interface IFormatterController {
    formatter: StringFormat;

    /**
     * Проверяет строку на соответствие форматтеру
     * @param {string} value проверяемое значение
     * @return {boolean} true, если строка корректна
     */
    checkValue(value: string): boolean;

    onKeyPress?(state: TextfieldState, event: KeyboardEvent, inputField: HTMLInputElement): TextfieldState;
    onPaste?(state: TextfieldState, inputField: HTMLInputElement, event: ClipboardEvent | DragEvent): TextfieldState;
    onKeyDown?(state: TextfieldState, event: KeyboardEvent, inputField: HTMLInputElement): TextfieldState;
    onFocus?(state: TextfieldState, inputField: HTMLInputElement, value: string): TextfieldState;
    onKeyUp?(state: TextfieldState, event: KeyboardEvent): TextfieldState;
    onBlur?(state: TextfieldState, value: string): TextfieldState;

    /**
     * Форматирует значение текстового поля в отображаемый пользователю вид
     * @param {string} value значение поля
     * @return {string} отображаемое текстовым полем, отформатированное значение
     */
    formatToDisplayValue?(value: string): string;
}

export abstract class FormatterController implements IFormatterController {
    constructor(public formatter: StringFormat) {
    }
    checkValue(value: string): boolean {
        return this.formatter.checkString(value);
    }
}

export class TextController extends FormatterController {

    onKeyPress(state: TextfieldState, event: KeyboardEvent, inputField: HTMLInputElement): TextfieldState {
        if (EventUtils.isControlKey(event) || !EventUtils.isCharInput(event)) {
            return null;
        }
        const charTyped = String.fromCharCode(event.which);
        const isSelected = inputField.selectionEnd !== inputField.selectionStart;
        if (!FormatterUtils.passes(charTyped, this.formatter)
            || (state.displayValue.length >= this.formatter.length && !isSelected)) {
            event.preventDefault();
        }
        return null;
    }

    onPaste(state: TextfieldState, inputField: HTMLInputElement, event: ClipboardEvent | DragEvent): TextfieldState {
        const selected = inputField.selectionEnd - inputField.selectionStart;
        const data = EventUtils.getClipboardData(event);
        if (CommonUtils.exists(data)) {
            if (!this.canPaste(data, state.displayValue, selected)) {
                event.preventDefault();
            }
        }
        return null;
    }

    private canPaste(data: string, currVal: string, selected: number) {
        if (this.formatter.length < currVal.length + data.length - selected) {
            return false;
        }
        const allowedChars = this.formatter.pattern;
        if (!allowedChars) {
            return true;
        }
        for (let i = 0; i < data.length; i++) {
            if ((allowedChars.indexOf(data.charAt(i)) === -1) === this.formatter.inverse) {
                return false;
            }
        }
        return true;
    }
}

export class IntegerController extends TextController {

    onKeyUp(state: TextfieldState, event: KeyboardEvent): TextfieldState {
        if (state.displayValue.startsWith("0")) {
            const newVal = this.formatter.format(state.displayValue);
            if (newVal !== state.displayValue) {
                return {
                    ...state,
                    pos: newVal.length,
                    displayValue: newVal
                };
            }
        }
        return null;
    }
}

export class DecimalController extends FormatterController {

    onKeyDown(state: TextfieldState, event: KeyboardEvent, inputField: HTMLInputElement): TextfieldState {
        if (EventUtils.isControlKey(event)) {
            // игнорируем Ctrl+z
            if (event.which === 90) {
                event.preventDefault();
            }
            return null;
        }
        const isSingleDeletion = EventUtils.isDeletion(event);
        if (!isSingleDeletion) {
            return null;
        }
        // Обрабатываем одиночное удаление символов вручную
        event.preventDefault();
        let val = state.displayValue;
        const isBackspace = event.key === "Backspace";
        let nextPos = isBackspace ? state.pos - 1 : state.pos;
        if (nextPos < 0) {
            return null;
        }

        const isFractional = val.indexOf(".") !== -1 && val.indexOf(".") < nextPos;
        if (val.charAt(nextPos) === ".") {
            // Удаление символа рядом с "."
            if (!isBackspace) {
                // Перескакиваем через точку
                nextPos = nextPos + 1;
            }
        } else if (isFractional) {
            // При удалении символа в дробной части, он меняется на "0"
            if (isBackspace || nextPos < val.length) {
                val = FormatterUtils.replaceCharAt(val, nextPos, "0");
                if (!isBackspace) {
                    // Перескакиваем через введенный "0"
                    nextPos = nextPos + 1;
                }
            }
        } else if (inputField.selectionEnd !== inputField.selectionStart) {
            val = this.formatter.format(FormatterUtils.replaceSubstrAt(val, inputField.selectionStart, inputField.selectionEnd, ""));
            if (isBackspace) {
                nextPos = nextPos + 1;
            }
        } else {
            val = FormatterUtils.replaceCharAt(val, nextPos, "");
        }
        return {
            ...state,
            pos: nextPos,
            displayValue: val
        };
    }

    onKeyPress(state: TextfieldState, event: KeyboardEvent, inputField: HTMLInputElement): TextfieldState {
        const isChar = EventUtils.isCharInput(event);
        if (!isChar) {
            return null;
        }

        let displayValue = state.displayValue;
        let pos = state.pos;

        const charTyped = String.fromCharCode(event.which);
        const formatted = displayValue.indexOf(".") !== -1;
        let fractional = formatted && (pos > displayValue.indexOf("."));

        if (charTyped === "." || charTyped === ",") {
            // "." и "," перекидывает курсор на дробную часть, отсекая символы справа
            // если мы уже в дробной части - игнорируем ввод
            if (!fractional) {
                displayValue = displayValue.substr(0, pos) + displayValue.substr(displayValue.indexOf("."));
                pos = pos + 1;
            }
            event.preventDefault();
        } else {
            const selected = inputField.selectionEnd - inputField.selectionStart;
            if (!FormatterUtils.passes(charTyped, this.formatter)
                || (charTyped === "0" && pos === 0 && displayValue.charAt(pos) !== "." && inputField.selectionEnd === pos && formatted)
                || (fractional && pos === displayValue.length && (displayValue.length - displayValue.indexOf(".") - 1 === this.formatter.fractionalSize))
                || (!formatted && (this.formatter.length - pos - 1 <= this.formatter.fractionalSize))
                || (selected
                    && displayValue.substring(inputField.selectionStart, inputField.selectionEnd).indexOf(".") !== -1
                    && displayValue.length - selected >= this.formatter.length - this.formatter.fractionalSize - 1)) {
                // Игнорируем ввод
                event.preventDefault();
                return null;
            } else {
                if (displayValue.length === this.formatter.length && displayValue.charAt(pos) === ".") {
                    // автопереход на дробную часть
                    pos = pos + 1;
                    fractional = true;
                }
                if ((fractional && !selected && (displayValue.length - pos - 1 <= this.formatter.fractionalSize))
                    || (pos === 0 && displayValue.startsWith("0."))) {
                    // В дробной части следующий символ заменяется на введенный
                    displayValue = FormatterUtils.replaceCharAt(displayValue, pos, charTyped);
                    pos = pos + 1;
                    event.preventDefault();
                } else if (displayValue.length < this.formatter.length || selected) {
                    pos = pos + 1;
                }
            }
        }
        return {
            displayValue,
            pos,
            isChar
        };
    }

    onPaste(state: TextfieldState, inputField: HTMLInputElement, event: ClipboardEvent | DragEvent): TextfieldState {
        event.preventDefault();

        let val = state.displayValue;
        const pos = state.pos;
        if (inputField.selectionEnd - inputField.selectionStart) {
            val = val.substr(0, inputField.selectionStart) + val.substr(inputField.selectionEnd);
        }
        if (val === "0.00" && pos === 0) {
            val = "";
        }
        const data = EventUtils.getClipboardData(event);
        if (CommonUtils.exists(data)) {
            // Вставляем только если значение влезает целиком
            if (this.canPaste(data, val)) {
                const newVal = val.substr(0, pos) + data + val.substr(pos);
                if (FormatterUtils.checkDecimalFormat(newVal, this.formatter)) {
                    return {
                        ...state,
                        displayValue: this.formatter.format(newVal),
                        pos: pos + data.length
                    };
                }
            }
        }
        return null;
    }

    onFocus(state: TextfieldState, inputField: HTMLInputElement, value: string): TextfieldState {
        const pos = inputField.selectionStart;
        const shift = state.displayValue.substr(0, pos).split(" ").length - 1;
        return {
            ...state,
            displayValue: this.formatter.format(value),
            pos: pos - shift
        };
    }

    onKeyUp(state: TextfieldState, event: KeyboardEvent): TextfieldState {
        if (state.isChar && !EventUtils.isControlKey(event)) {
            return {
                ...state,
                displayValue: this.formatter.format(state.displayValue)
            };
        }
        return null;
    }

    onBlur(state: TextfieldState, value: string): TextfieldState {
        return {
            ...state,
            displayValue: this.formatToDisplayValue(value)
        };
    }

    formatToDisplayValue(value: string): string {
        return this.formatter.formatAmount(value);
    }

    private canPaste(data: string, fieldValue: string): boolean {
        const isInt = data.indexOf(".") === -1 && data.indexOf(",") === -1 && fieldValue.indexOf(".") === -1;
        const availableSize = this.formatter.length - fieldValue.length - (isInt ? this.formatter.fractionalSize + 1 : 0);
        return availableSize >= data.length;
    }
}