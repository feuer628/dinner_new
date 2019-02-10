import {Component, Prop} from "ui";
import {XTextComponent} from "./xTextComponent";

/** Компонент текстового поля */
@Component({
    // language=Vue
    template: `
        <label class="textfield withTitle-field" :class="validationResult.classObject">
            <span class="fieldTitle" @click="input.focus()">{{ title }}</span>
            <input ref="input"
                   :class="inputClass"
                   :type="type"
                   :name="name"
                   v-model="fieldState.displayValue"
                   :placeholder="placeholder"
                   :readonly="readonly"
                   :maxlength="fieldLength"
                   @keypress="handleKeyPress"
                   @keyup="handleKeyUp"
                   @keydown="handleKeyDown"
                   @paste="handlePaste"
                   @drop="handlePaste"
                   @blur="handleFocusOut"
                   @focus="handleFocus"
                   @keypress.enter="$emit('submit', this)"/>
            <error-bulb :error-message="validationResult.errorMessage"></error-bulb>
        </label>
    `
})
export class XTextField extends XTextComponent {

    /** Тип поля */
    @Prop({default: "text", type: String})
    protected type: string;

    @Prop({default: "text", type: String})
    private inputClass: string;
}