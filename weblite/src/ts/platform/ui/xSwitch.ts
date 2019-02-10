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

import {Component, Prop, UI} from "../ui";

/**
 * Компонент переключения
 */
@Component({
    // language=Vue
    template: `
        <label class="switch"
               :class="size"
               ref="label"
               :disabled="disabled"
               :tabindex="disabled ? false : 0"
               @keydown.prevent.enter.space="$refs.label.click()"
               @mousedown="isMouseDown = true"
               @mouseup="isMouseDown = false"
               @mouseout="isMouseDown = false"
               @blur="isMouseDown = false">
            <input type="checkbox"
                   v-model="current"
                   :value="nativeValue"
                   :true-value="trueValue"
                   :false-value="falseValue"
                   :disabled="disabled"
                   :name="name"
                   @click.stop/>
            <span class="check" :class="[{ 'is-elastic': isMouseDown && !disabled }, type]"/>
            <span class="control-label"><slot/></span>
        </label>
    `
})
export class XSwitch extends UI {

    /** Значение компонента */
    @Prop({default: false})
    private value: any;

    /** Значение value для элемента input */
    @Prop()
    private nativeValue: any;

    /** Значение отмеченного компонента */
    @Prop({default: true})
    private trueValue: any;

    /** Значение неотмеченного компонента */
    @Prop()
    private falseValue: any;

    /** Тип цвета компонента: primary, warning */
    @Prop({type: String})
    private type: string;

    /** Размер компонента: small, medium, large */
    @Prop({type: String})
    private size: string;

    /** Недоступность компонента */
    @Prop({type: Boolean, default: false})
    private disabled: boolean;

    /** Значение name для элемента input */
    @Prop({type: String})
    private name: string;

    /** Зажата ли кнопка мыши */
    private isMouseDown = false;

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