import {CatchErrors} from "platform/decorators";
import {Container, Inject} from "platform/ioc";
import {Storage} from "platform/services/storage";
import {Component, Prop, UI} from "platform/ui";
import {StorageKey} from "../model/storageKey";
import {PermissionsService} from "../service/permissionsService";

/**
 * Компонент для отображения кнопки. При клике на кнопку отображается на ее месте поле ввода e-mail для отправки данных
 */
@Component({
    // language=Vue
    template: `
        <div v-if="hasPermission" class="action-input">
            <transition :name="transition" mode="in-out">
                <div v-if="inputMode" class="action-input__field">
                    <input ref="input"
                           maxLength="255"
                           v-model.trim="value"
                           placeholder="Введите e-mail"
                           :readonly="progress"
                           @keyup.enter="action"
                           @blur="onBlur"
                           @keyup.esc.stop="closeInput"
                           @click.stop/>
                    <transition name="fade">
                        <button v-if="!!value"
                                class="icon action-input__button"
                                :class="progress ? 'icon-spinner' : ['link', 'icon-send']"
                                title="Отправить на e-mail"
                                @mousedown.prevent
                                @click.stop="action"></button>
                     </transition>
                </div>
                <a v-else
                   class="btn action-input__title-button"
                   :class="{'icon-circle-mail': asIcon}"
                   :title="asIcon ? 'Отправить на e-mail' : ''"
                   @click.stop="showInput">
                       {{ asIcon ? '' : 'Отправить на e-mail' }}
                </a>
            </transition>
        </div>
    `
})
export class EmailInput extends UI {

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

    /** Сервис по работе с хранилищем браузера */
    @Inject
    private storage: Storage;

    /** Признак наличия прав на действие */
    private hasPermission = Container.get(PermissionsService).isEmailSendingAvailable();

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
        this.value = this.storage.get(StorageKey.EMAIL_TO_SEND, "");
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
        await this.validate();
        this.storage.set(StorageKey.EMAIL_TO_SEND, this.value);
        try {
            this.progress = true;
            await this.handler(this.value);
            this.closeInput();
        } finally {
            this.progress = false;
        }}

    /**
     * Обработчик снятия фокуса
     */
    private onBlur(): void {
        if (this.closeInputOnBlur) {
            this.closeInput();
        }
    }

    /**
     * Проверяет введенное значение, если валидация не пройдена, выкидывает ошибку.
     */
    private async validate(): Promise<void> {
        this.$validator.attach({name: "value", rules: "email"});
        const result = await this.$validator.validate("value", this.value);
        if (!result) {
            throw new Error(`Неверное значение e-mail "${this.value}"`);
        }
    }
}
