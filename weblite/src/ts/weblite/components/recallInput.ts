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

import {CatchErrors} from "platform/decorators";
import {Container} from "platform/ioc";
import {Component, Prop, UI} from "platform/ui";
import {PermissionsService} from "../service/permissionsService";

/**
 * Компонент для отображения кнопки. При клике на кнопку на ее месте отображается поле ввода причины для отзыва документа
 */
@Component({
    // language=Vue
    template: `
        <div v-if="hasPermission" class="action-input">
            <transition :name="transition" mode="in-out">
                <div v-if="inputMode" class="action-input__field">
                    <input ref="input"
                           maxLength="210"
                           v-on="$listeners"
                           v-model.trim="value"
                           placeholder="Укажите причину отзыва"
                           :readonly="progress"
                           @keyup.enter="action"
                           @blur="onBlur"
                           @keyup.esc="closeInput"
                           @click.stop/>
                    <transition name="fade">
                        <button v-if="!!value"
                                class="icon action-input__button"
                                :class="progress ? 'icon-spinner' : ['link', 'icon-recall']"
                                title="Отозвать"
                                @mousedown.prevent
                                @click.stop="action"></button>
                    </transition>
                </div>
                <a v-else
                   class="btn action-input__title-button"
                   :class="{'icon-circle-recall': asIcon}"
                   :title="asIcon ? 'Отозвать' : ''"
                   @click.stop="showInput">
                       {{ asIcon ? '' : 'Отозвать' }}
                </a>
            </transition>
        </div>
    `
})
export class RecallInput extends UI {

    $refs: {
        /** Поле ввода */
        input: HTMLInputElement
    };

    /** Обработчик отправки */
    @Prop({required: true, type: Function})
    private handler: (value: string) => void | Promise<void>;

    /** Признак отображения элемента в виде иконки */
    @Prop({type: Boolean, default: false})
    private asIcon: boolean;

    /** Признак необходимости убирать поле ввода при снятии фокуса */
    @Prop({type: Boolean, default: false})
    private closeInputOnBlur: boolean;

    /** Тип анимации для смены состояния. Возможные значения: "fade", "extend" */
    @Prop({type: String, default: "fade"})
    private transition: string;

    /** Признак наличия прав на действие */
    private hasPermission = Container.get(PermissionsService).hasRecallPermission();

    /** Значение поля ввода */
    private value = "";

    /** Признак отображения компонента в виде поля ввода */
    private inputMode = false;

    /** Признак процесса обработки действия */
    private progress = false;

    /**
     * Смена состояния на отображение кнопки
     */
    private closeInput(): void {
        this.inputMode = false;
        this.$emit("inputModeChange", this.inputMode);
    }

    /**
     * Смена состояния компонента с кнопки на поле ввода значения
     */
    private async showInput(): Promise<void> {
        this.inputMode = true;
        this.$emit("inputModeChange", this.inputMode);
        this.value = "";
        await this.$nextTick();
        this.$refs.input.focus();
    }

    /**
     * Обрабатывает действие отправки и вызывает переданный в виде свойства обработчик
     * @return {Promise<void>}
     */
    @CatchErrors
    private async action(): Promise<void> {
        if (this.progress || !this.value) {
            return;
        }
        try {
            this.progress = true;
            await this.handler(this.value);
            this.closeInput();
        } finally {
            this.progress = false;
        }
    }

    /**
     * Обработчик снятия фокуса
     */
    private onBlur(): void {
        if (this.closeInputOnBlur) {
            this.closeInput();
        }
    }
}