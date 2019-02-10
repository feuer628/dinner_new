import {Component, Prop, UI, Watch} from "ui";
import {FormatterFactory} from "ui/formatters/formatterFactory";
import {IFormatterController} from "ui/textFieldControllers";
import {ValidationResult} from "../../weblite/model/validationResult";
import {FormatterOptions, TextfieldState} from "../types";
import {FormatterUtils} from "../utils/formatterUtils";

@Component
export class XTextComponent extends UI {

    /** Заголовок поля */
    @Prop({default: null})
    title: string;

    /** Это значение автоматически сетится из v-model компонента */
    @Prop({default: ""})
    protected value: string;

    /** Объект с результатами валидации поля */
    @Prop({default: () => new ValidationResult(), type: Object})
    protected validationResult: ValidationResult;

    /** Название компонента */
    @Prop({default: null})
    protected name: string;

    /** Форма ввода текста */
    protected input: HTMLInputElement;

    /** Состояние текстового поля */
    protected fieldState: TextfieldState = {
        displayValue: this.value,
        pos: 0,
        isChar: false
    };

    /** Максимальная длинна поля указанная в компоненте */
    @Prop({default: null})
    private maxlength: number;

    /** Описание форматтера */
    @Prop()
    private format: FormatterOptions;

    /** Плейсхолдер */
    @Prop()
    private placeholder: string;

    /** Флаг, указывающий является ли поле доступным только для чтения */
    @Prop({default: false, type: Boolean})
    private readonly: boolean;

    /** Флаг, указывающий разрешено ли переполнение поля при превышении символов относительно формата */
    @Prop({default: false, type: Boolean})
    private allowOverflow: boolean;

    /**
     * Инициализирует компонент
     * @inheritDoc
     */
    mounted(): void {
        this.input = <HTMLInputElement> this.$refs.input;
        if (this.fieldLength && !this.allowOverflow) {
            this.fieldState.displayValue = this.fieldState.displayValue.substring(0, this.fieldLength);
        }
    }

    /** Устанавливает фокус в текстовое поле */
    setFocus() {
        this.input.focus();
    }

    /** Обрабатывает keyPress */
    protected handleKeyPress(event: KeyboardEvent) {
        if (this.controller && this.controller.onKeyPress) {
            const newState = this.controller.onKeyPress(this.fieldState, event, this.input);
            if (newState) {
                this.fieldState = newState;
                UI.nextTick(() => {
                    FormatterUtils.setCaretPosition(this.input, this.fieldState.pos);
                });
            }
        }
    }

    /** Обрабатывает keyDown */
    protected handleKeyDown(event: KeyboardEvent) {
        if (this.controller) {
            if (this.controller.onKeyDown) {
                this.fieldState.pos = this.input.selectionStart;
                this.fieldState.isChar = false;
                const newState = this.controller.onKeyDown(this.fieldState, event, this.input);
                if (newState) {
                    this.fieldState = newState;
                    UI.nextTick(() => {
                        FormatterUtils.setCaretPosition(this.input, this.fieldState.pos);
                    });
                }
            }
        }
        this.$emit("keydown", event);
    }

    /** Обрабатывает keyUp */
    protected handleKeyUp(event: KeyboardEvent) {
        if (this.controller && this.controller.onKeyUp) {
            const newState = this.controller.onKeyUp(this.fieldState, event);
            if (newState) {
                this.fieldState = newState;

                UI.nextTick(() => {
                    if (this.input.selectionStart === this.input.selectionEnd) {
                        FormatterUtils.setCaretPosition(this.input, this.fieldState.pos);
                    }
                });
            }
        }
        this.$emit("keyup", event);
    }

    /** Обрабатывает вставку */
    protected handlePaste(event: ClipboardEvent | DragEvent) {
        if (this.controller && this.controller.onPaste) {
            const newState = this.controller.onPaste(this.fieldState, this.input, event);
            if (newState) {
                this.fieldState = newState;
                UI.nextTick(() => {
                    FormatterUtils.setCaretPosition(this.input, this.fieldState.pos);
                });
            }
        }
    }

    /** Обрабатывает фокус */
    protected handleFocus() {
        if (this.controller && this.controller.onFocus) {
            setTimeout(() => {
                // !!! В текущей версии Chrome, во время фокуса некорректно возвращается текущее положение курсора.
                // setTimeout позволяет обойти этот баг
                const newState = this.controller.onFocus(this.fieldState, this.input, this.value);
                if (newState) {
                    this.fieldState = newState;
                    UI.nextTick(() => {
                        FormatterUtils.setCaretPosition(this.input, this.fieldState.pos);
                    });
                }
            }, 0);
        }
        this.$emit("focus");

    }

    /** Обрабатывает потерю фокуса */
    protected handleFocusOut() {
        if (this.controller && this.controller.onBlur) {
            this.fieldState = this.controller.onBlur(this.fieldState, this.value);
        }
        this.$emit("blur");
    }

    /** Максимальная длинна поля */
    protected get fieldLength(): number {
        return this.controller ? this.controller.formatter.length : this.maxlength;
    }

    /** Следит за изменением отображаемого значения */
    @Watch("fieldState.displayValue")
    private onDisplayValueChanged(newValue: string) {
        // модель нужно обновлять всегда, поэтому forceEmit = true и значение должно быть отформатировано
        this.processChangedValue(this.controller ? this.controller.formatter.format(newValue) : newValue, true);
        // сбрасываем ошибки валидации
        this.validationResult.clear();
    }

    /** Следит за изменением value */
    @Watch("value", {immediate: true})
    private onValueChanged(newValue: string) {
        this.processChangedValue(newValue);
    }

    /**
     * Обрабатывает значение инпута (введенное пользователем или обновленное из модели)
     * @param {string} newValue новое значение
     * @param {boolean} forceEmit признак вызова события для обновление модели. Используется при изменении отображаемого значения (вводимого пользователем)
     */
    private processChangedValue(newValue: string, forceEmit?: boolean) {
        const isActiveInput = this.input === document.activeElement;
        if (!this.controller) {
            this.fieldState.displayValue = newValue;
            if (forceEmit) {
                this.$emit("input", newValue);
            }
        } else {
            const checkedValue = this.controller.checkValue(newValue) ? newValue : "";
            const needFormat = !isActiveInput && this.controller && this.controller.formatToDisplayValue;
            this.fieldState.displayValue = needFormat ? this.controller.formatToDisplayValue(checkedValue) : checkedValue;
            if (!checkedValue || forceEmit) {
                // Если значение модели не прошло проверку форматтером, модель обнуляется
                this.$emit("input", checkedValue);
            }
        }
    }

    /** Контроллер текстового поля */
    private get controller(): IFormatterController {
        return this.format ? FormatterUtils.getFormatterController(FormatterFactory.getFormatter(this.format)) : null;
    }

    /** Следит за изменением навешиваемого форматтера */
    @Watch("format")
    private onFormatChanged() {
        if (this.controller) {
            const newValue = this.controller.formatter.parse(this.value);
            const needFormat = this.input !== document.activeElement && this.controller.formatToDisplayValue;
            this.fieldState.displayValue = needFormat ? this.controller.formatToDisplayValue(newValue) : newValue;
        }
    }
}
