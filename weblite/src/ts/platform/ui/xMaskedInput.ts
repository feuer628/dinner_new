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

import {InputMask, MaskOptions} from "imask";
import {ValidationResult} from "../../weblite/model/validationResult";
import {Component, Prop, UI, Watch} from "../ui";
import {CommonUtils} from "../utils/commonUtils";

/**
 * Поле ввода с маской
 */
@Component({
    // language=Vue
    template: `
        <label v-if="showWrapper" class="textfield withTitle-field" :class="validationResult.classObject">
            <span class="fieldTitle" @click="$refs.input.focus()">{{ title }}</span>
            <input ref="input"
                   :name="name"
                   :type="type"
                   :maxlength="maxlength"
                   :placeholder="placeholder"
                   :readonly="readonly"
                   :disabled="disabled"
                   @input="onInput"
                   @keypress="$emit('keypress', $event)"
                   @keydown="$emit('keydown', $event)"
                   @keyup="$emit('keyup', $event)"
                   @paste="$emit('paste', $event)"
                   @drop="$emit('drop', $event)"
                   @focus="$emit('focus', $event)"
                   @blur="$emit('blur', $event)"/>
            <error-bulb :error-message="validationResult.errorMessage"></error-bulb>
        </label>
        <input v-else
               ref="input"
               :name="name"
               :type="type"
               :maxlength="maxlength"
               :placeholder="placeholder"
               :readonly="readonly"
               :disabled="disabled"
               @input="onInput"
               @keypress="$emit('keypress', $event)"
               @keydown="$emit('keydown', $event)"
               @keyup="$emit('keyup', $event)"
               @paste="$emit('paste', $event)"
               @drop="$emit('drop', $event)"
               @focus="$emit('focus', $event)"
               @blur="$emit('blur', $event)"/>
    `
})
export class XMaskedInput extends UI {

    $refs: {
        /** Поле ввода */
        input: HTMLInputElement
    };

    /** Заголовок поля */
    @Prop({default: null})
    private title: string;

    /** Название компонента */
    @Prop({type: String})
    private name: string;

    /** Тип компонента */
    @Prop({type: String})
    private type: string;

    /** Значение поля ввода */
    @Prop({type: String})
    private value: string;

    /** Максимальная длинна поля указанная в компоненте */
    @Prop({type: Number})
    private maxlength: number;

    /** Плейсхолдер */
    @Prop({type: String})
    private placeholder: string;

    /** Флаг, указывающий является ли поле доступным только для чтения */
    @Prop({type: Boolean, default: false})
    private readonly: boolean;

    /** Флаг, указывающий отключено ли поле */
    @Prop({type: Boolean, default: false})
    private disabled: boolean;

    /** Настройки маски */
    @Prop({type: Object})
    private mask: MaskOptions;

    /** Объект с результатами валидации поля */
    @Prop({default: () => new ValidationResult(), type: Object})
    private validationResult: ValidationResult;

    /** Объект, добавляющий маску полю ввода */
    private inputMask: InputMask = null;

    /**
     * @inheritDoc
     */
    mounted(): void {
        this.$refs.input.value = this.value;
        if (this.mask) {
            this.inputMask = new InputMask(this.$refs.input, this.mask);
            this.inputMask.on("accept", this.onMaskAccept);
        }
    }

    /**
     * Устанавливает фокус на элемент
     */
    focus(): void {
        if (this.$refs.input) {
            this.$refs.input.focus();
        }
    }

    /**
     * @inheritDoc
     */
    destroyed(): void {
        if (this.inputMask) {
            this.inputMask.destroy();
            this.inputMask = null;
        }
    }

    /**
     * Обрабатывает изменение параметра value
     * @param {string} newValue новое значение параметра
     */
    @Watch("value")
    private onValueChange(newValue: string): void {
        if (this.inputMask) {
            if (this.inputMask.unmaskedValue !== newValue) {
                this.inputMask.unmaskedValue = newValue;
            }
        } else {
            this.$refs.input.value = newValue;
        }
    }

    /**
     * Обрабатывает изменение параметра mask
     * @param {MaskOptions} newMask новое значение параметра
     */
    @Watch("mask", {deep: true})
    private onMaskChange(newMask: MaskOptions): void {
        if (newMask) {
            this.inputMask.updateOptions(newMask);
        } else if (this.inputMask) {
            this.inputMask.destroy();
            this.inputMask = null;
        }
    }

    /**
     * Обрабатывает событие изменения текста в поле ввода
     * @param event событие
     */
    private onInput(event: any): void {
        // При наличии маски событие input отправляется в методе onMaskAccept
        if (!this.inputMask) {
            this.$emit("input", event.target.value);
        }
    }

    /**
     * Обрабатывает изменение замаскированного в поле значения
     */
    private onMaskAccept(): void {
        this.$emit("input", this.inputMask.unmaskedValue);
    }

    /**
     * Возвращает признак отображения обертки над полем ввода
     */
    private get showWrapper(): boolean {
        return !CommonUtils.isBlank(this.title);
    }
}