import {Component, Prop, UI} from "ui";

/**
 * Компонент чекбокс
 */
@Component({
    // language=Vue
    template: `
        <label class="checkbox" :disabled="disabled">
            <input v-model="current"
                   :false-value="falseValue"
                   :true-value="trueValue"
                   type="checkbox"
                   :value="nativeValue"
                   :disabled="disabled"
                   @click.stop/>
            <span><slot></slot></span>
        </label>
    `
})
export class XCheckBox extends UI {

    /** Значение компонента */
    @Prop({default: false})
    private value: any;

    /** Значение value для input формы. Актуально если значение компонента является массивом */
    @Prop()
    private nativeValue: any;

    /** Недоступность чекбокса, по-умолчанию - false */
    @Prop({default: false, type: Boolean})
    private disabled: boolean;

    /** Значение отмеченного чекбокса */
    @Prop({default: true})
    private trueValue: any;

    /** Значение неотмеченного чекбокса */
    @Prop({default: false})
    private falseValue: any;

    /**
     * Возвращает текущее значение компонента
     * @return {any} текущее значение компонента
     */
    private get current(): any {
        return this.value;
    }

    /**
     * Генерирует событие изменения текущего значения компонента
     * @param value новое значение компонента
     */
    private set current(value: any) {
        this.$emit("input", value);
    }
}