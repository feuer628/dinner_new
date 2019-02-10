import {Component, Prop, UI} from "platform/ui";
import {CatchErrors} from "../../platform/decorators";

/**
 * Компонент для inplace-редактирования.
 */
@Component({
    // language=Vue
    template: `
        <div class="inplace-input">
            <template v-if="!editMode">
                <a v-if="emptyLinkText" style="color: darkgray" class="inplace-out" @click="onEdit" :title="emptyLinkText">{{ emptyLinkText }}</a>
                <span v-else class="inplace-out" @dblclick="onEdit" title="Редактировать">{{ value }}</span>
                <span v-if="!emptyLinkText" class="icon icon-edit" @click="onEdit" title="Редактировать"></span>
            </template>
            <template v-else>
                <input v-model.trim="editableValue"
                       @keyup.enter="emitCompleteEvent"
                       @keyup.esc="dismissChanges"
                       :placeholder="placeholder"
                       autocomplete="off"
                       type="text"
                       ref="inplaceInput"
                       :maxlength="maxLength" v-click-outside="dismissChanges"/>
                <button @click.stop="emitCompleteEvent"
                        class="icon-checked-2"
                        title="Сохранить"></button>
                <button @click.stop="dismissChanges"
                        class="icon-close"
                        title="Отменить"></button>
            </template>
        </div>
    `
})
export class InplaceInput extends UI {

    $refs: {
        inplaceInput: HTMLInputElement
    };

    @Prop({default: "", type: String})
    private placeholder: string;

    /** Максимальный размер введенного значения */
    @Prop({default: 50, type: Number})
    private maxLength: number;

    /** Значение отображаемое в режиме просмотра */
    @Prop({default: "", type: String})
    private value: string;

    /** Название ссылки (Отображается если начальное значение не задано) */
    @Prop({default: "", type: String})
    private emptyLinkText: string;

    /** Значение введенное пользователем */
    private editableValue = "";

    /** Первоначальное значение */
    private oldValue = "";

    /** Режим редактирования */
    private editMode = false;

    /**
     * Инициализирует данные компонента
     * @inheritDoc
     */
    created(): void {
        this.editableValue = this.value;
        this.oldValue = this.editableValue;
    }

    /**
     * Инициирует событие, в котором передает измененное значение
     */
    @CatchErrors
    private emitCompleteEvent(): void {
        if (this.editableValue.length > this.maxLength) {
            throw new Error("Размер вводимого значения не должен превышать " + this.maxLength);
        }
        this.oldValue = this.editableValue;
        if (this.editableValue !== this.value) {
            this.$emit("input", this.editableValue);
        }
        this.closeInput();
    }

    private closeInput(): void {
        this.editMode = false;
    }

    private onEdit(): void {
        this.editMode = true;
        // если старого значения нет, значит оно было очищено, подставляем снова значение отображаемое в режиме просмотра
        this.editableValue = this.oldValue || this.value || "";
        this.$nextTick(() => {
            this.$refs.inplaceInput.setSelectionRange(0, this.editableValue.length);
            this.$refs.inplaceInput.focus();
        });
    }

    private dismissChanges(): void {
        this.closeInput();
        this.editableValue = this.oldValue;
    }
}