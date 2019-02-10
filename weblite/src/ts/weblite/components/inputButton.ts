import {MaskOptions} from "imask";
import {CatchErrors} from "platform/decorators";
import {Component, Prop, UI, Watch} from "platform/ui";

/**
 * Кнопка, которую можно перевести в режим ввода текста
 */
@Component({
    // language=Vue
    template: `
        <div class="input-button">
            <transition name="fade" mode="in-out">
                <div v-if="inputMode || progress" class="input-button__field-wrapper">
                    <x-masked-input ref="input"
                           :maxLength="maxLength"
                           :placeholder="placeholder"
                           :readonly="progress"
                           :value="value"
                           @input="$emit('input', $event)"
                           :mask="mask"
                           @keyup.enter="onSubmit"
                           @blur="onBlur"
                           @keyup.esc="onEscape"
                           @click.stop/>
                    <transition name="fade">
                        <button v-if="!!value"
                                type="button"
                                class="input-button__submit-button icon"
                                :class="progress ? ['icon-spinner'] : ['link', iconClass]"
                                :title="text"
                                @mousedown.prevent
                                @click.stop="onSubmit">
                        </button>
                    </transition>
                </div>
                <button v-else
                        type="button"
                        class="btn btn-primary input-button__title-button"
                        @click.stop="$emit('update:inputMode', true)">
                    {{text}}
                </button>
            </transition>
        </div>
    `
})
export class InputButton extends UI {

    $refs: {
        /** Поле ввода */
        input: HTMLInputElement
    };

    /** Значение поля ввода */
    @Prop({type: String})
    private value: string;

    /**
     * Нужно ли отображать компонент в режиме ввода текста.
     * Используйте sync для двойного связывания.
     */
    @Prop({type: Boolean, default: true})
    private inputMode: boolean;

    /** Текст на кнопке */
    @Prop({type: String})
    private text: string;

    /** Максимальная длина текста в поле ввода */
    @Prop({type: Number})
    private maxLength: number;

    /** Настройки маски для поля ввода */
    @Prop({type: Object})
    private mask: MaskOptions;

    /** Текст для отображения на фоне поля ввода */
    @Prop({type: String, default: ""})
    private placeholder: string;

    /** Класс иконки для отображения на кнопке отправки */
    @Prop({type: String, default: "icon-send"})
    private iconClass: string;

    /** Отображать ли компонент в режиме выполнения операции */
    @Prop({type: Boolean, default: false})
    private progress: boolean;

    /**
     * Обрабатывает изменение параметра отображения компонента в режиме ввода текста
     * @param {boolean} newInputMode новое значение параметра
     */
    @Watch("inputMode")
    private onInputModeChange(newInputMode: boolean): void {
        if (newInputMode) {
            this.$emit("input", "");
            this.$nextTick(() => {
                const input = this.$refs.input;
                input.focus();
                input.selectionStart = input.selectionEnd = input.value.length;
            });
        }
    }

    /**
     * Обрабатывает событие нажатия на кнопку Escape
     */
    private onEscape(): void {
        if (this.progress) {
            return;
        }
        this.$emit("update:inputMode", false);
    }

    /**
     * Обрабатывает событие снятия фокуса с поля ввода
     */
    private onBlur(): void {
        if (this.progress) {
            return;
        }
        if (this.value) {
            return;
        }
        this.$emit("update:inputMode", false);
    }

    /**
     * Обрабатывает событие отправки введенного значения
     */
    @CatchErrors
    private async onSubmit(): Promise<void> {
        if (this.progress) {
            return;
        }
        if (!this.value) {
            return;
        }
        this.$emit("submit", this.value);
    }
}