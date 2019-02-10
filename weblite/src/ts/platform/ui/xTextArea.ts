import {ErrorBulb} from "../../weblite/components/errorBulb";
import {Component, Prop, Watch} from "../ui";
import {XTextComponent} from "./xTextComponent";

/** Регулярное выражение для поиска символов переноса и табуляции */
const wrapRegExp = /[\n\r\t]/g;

@Component({
    // TODO верстка
    // TODO Отображать иконку с тултипом для сообщений с ошибками
    // language=Vue
    template: `
        <div class="textarea"
             :class="[{'withTitle-box': title}, {'withCounter': counter && fieldLength}, validationResult.classObject]"
             :readonly="readonly"
             @click="input.focus()">
            <span v-if="title" class="fieldTitle">{{ title }}</span>
            <textarea ref="input"
                      v-model="fieldState.displayValue"
                      :name="name"
                      :readonly="readonly"
                      :maxlength="fieldLength"
                      :rows="rows"
                      @keypress="handleKeyPress"
                      @keyup="handleKeyUp"
                      @keydown="handleKeyDown"
                      @paste="handlePaste"
                      @drop="handlePaste"
                      @blur="handleFocusOut"
                      @focus="handleFocus"
                      @keypress.enter="handleEnter"/>
            <div class="textarea__fake-style"></div>
            <!-- Cчетчик введенных символов -->
            <span class="counter" v-if="counter && fieldLength">{{ fieldState.displayValue.length }}/{{ fieldLength }}</span>
            <error-bulb :error-message="validationResult.errorMessage"></error-bulb>
        </div>
    `
})
export class XTextArea extends XTextComponent {

    /** Количество строк в текстовой области */
    @Prop()
    private rows: number;

    /** Признак, указывающий вырезаются ли переносы */
    @Prop({default: false, type: Boolean})
    private wrapText: boolean;

    /** Признак отображения счетчика введенных символов */
    @Prop({default: false, type: Boolean})
    private counter: boolean;

    /** Отслеживаем изменения в текстовом поле и вырезаем переносы если требуется */
    @Watch("value", {immediate: true})
    private wrapOnValueChanged(newValue: string) {
        if (this.wrapText) {
            this.wrapContent(newValue);
        }
    }

    /**
     * Заменяет в вводимом контенте перенос на пустой символ
     */
    private wrapContent(value: string) {
        if (this.needWrap(value)) {
            const wrappedValue = value.replace(wrapRegExp, "");
            if (wrappedValue !== value) {
                this.fieldState.displayValue = wrappedValue;
                this.$emit("input", this.fieldState.displayValue);
            }
        }
    }

    /**
     * Определяет наличие запрещенных спец символов
     * @param value
     * @returns {*|boolean}
     */
    private needWrap(value: string): boolean {
        return value && (value.indexOf("\n") !== -1 || value.indexOf("\r") !== -1 || value.indexOf("\t") !== -1);
    }

    /** Блокируем добавление переносов по enter если wrap-text true */
    private handleEnter(event: KeyboardEvent) {
        this.wrapText
            ? event.preventDefault()
            : this.$emit("input", this.fieldState.displayValue);
    }
}