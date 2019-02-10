import {Component, Prop, UI, Watch} from "platform/ui";

/**
 * Компонент выбора из выпадающего списка
 */
@Component({
    // language=Vue
    template: `
        <div class="filter-component" :class="{ active: showDropDownMenu }">
            <div @click="onMainElementClick" class="filter-input">
                {{ current.text }}
            </div>
            <i class="dropdown-indicator"></i>
            <transition name="fade">
                <div v-if="showDropDownMenu" class="filter-dropdown" v-click-outside="onClickOutside">
                    <template v-for="btn in buttons">
                        <div @click="onSelect(btn)"
                             :class="[ 'filter-item', {'selected' : btn.text === current.text}]">{{ btn.text }}
                        </div>
                    </template>
                </div>
            </transition>
        </div>
    `
})
class DropDownMenu extends UI {

    /** Текущий выбранный элемент */
    @Prop({required: true})
    private current: ButtonGroupData;

    /** Набор кнопок для переключения */
    @Prop({required: true})
    private buttons: ButtonGroupData[];

    /** Идентификатор родительского элемента */
    @Prop({required: true})
    private parentId: number;

    /** Признак отображения выпадающего списка */
    private showDropDownMenu = false;

    /** Признак блокировки отображения списка */
    @Prop({default: true, type: Boolean})
    private blockClick: boolean;

    /**
     * Действия выполняемые при клике на элемент. Отображаем панель выбора из списка
     */
    private onMainElementClick(): void {
        if (!this.blockClick) {
            this.showDropDownMenu = true;
        }
    }

    /**
     * Скрывает панель выбора
     */
    private onClickOutside(): void {
        this.showDropDownMenu = false;
    }

    /**
     * Обработчик выбора элемента из выпадающего списка.
     * @param button выбранный элемент
     */
    private onSelect(button: ButtonGroupData): void {
        this.emitEvent(button);
        this.showDropDownMenu = false;
    }

    /**
     * Отправляет событие выбора элемента списка
     */
    private emitEvent(button: ButtonGroupData): void {
        this.$emit("change", button, this.parentId);
    }
}

/**
 * Компонент 'переключатель'. Предоставляет только один выбранный элемент из списка.
 */
@Component({
    // language=Vue
    template: `
        <div class="btn-group switch">
            <template v-for="(button, index) in buttons">
                <label :class="{
                'btn': !button.nestedData,
                'switch-select' : button.nestedData,
                'switch-active': value && value.id === button.id || (currentNestedSelectedElements[button.id]
                && value && value.id === currentNestedSelectedElements[button.id].id)
                }"
                       @click.prevent="onClick(button)">
                    <template v-if="!button.nestedData">
                        <input type="radio" name="options" :id="'option' + index" autocomplete="off" checked/>
                        <span>{{ button.text }}</span>
                    </template>
                    <drop-down-menu v-else
                                    :buttons="nestedElements(button)"
                                    :current="currentNestedSelectedElements[button.id]"
                                    :parentId="button.id"
                                    :block-click="blockClick(button)"
                                    @change="onSelect"></drop-down-menu>
                </label>
            </template>
        </div>
    `,
    components: {DropDownMenu}
})
export class XButtonGroup extends UI {

    /** Текущий выбранный элемент. Автоматически сетится из v-model */
    @Prop({required: true})
    private value: ButtonGroupData;

    /** Набор кнопок для переключения */
    @Prop({required: true})
    private buttons: ButtonGroupData[];

    /** Выбранные элементы в выпадающих списках, где ключ - идентификатор родительского компонента */
    private currentNestedSelectedElements: { [id: number]: ButtonGroupData } = {};

    /**
     * Инициализация компонента. Выставляем во все выпадающие списки выбранным первый элемент
     * @inheritDoc
     */
    created(): void {
        for (const btn of this.buttons) {
            if (btn.nestedData) {
                this.currentNestedSelectedElements[btn.id] = btn.nestedData[0];
            }
        }
        this.setUpValue(this.value);
    }

    /**
     * Выставляет значение в выпадающем списке при программном изменении
     * @param {ButtonGroupData} newValue выбранный элемент
     */
    @Watch("value")
    private onValueChange(newValue: ButtonGroupData): void {
        this.setUpValue(newValue);
    }

    /**
     * Устанавливает текущее значение компонента
     * @param {ButtonGroupData} newValue
     */
    private setUpValue(newValue: ButtonGroupData): void {
        const parent = this.buttons.find(value => value.nestedData && !!value.nestedData.find(value2 => value2.id === newValue.id));
        if (parent) {
            this.currentNestedSelectedElements[parent.id] = newValue;
        }
    }

    /**
     * Возвращает {@code true} если текущий выбранный элемент не находится среди элементов выпадающего списка.
     * Для блокировки первого клика на выпадающих списках.
     * @param {ButtonGroupData} button
     * @return {boolean}
     */
    private blockClick(button: ButtonGroupData): boolean {
        return button.nestedData.filter(value => value.id === this.value.id).length === 0;
    }

    /**
     * Возвращает элементы списка, которые содержат значения кроме выбранного
     * @param {ButtonGroupData} buttonData
     * @return {ButtonGroupData[]}
     */
    private nestedElements(buttonData: ButtonGroupData): ButtonGroupData[] {
        return buttonData.nestedData.filter(button => {
            return button !== this.currentNestedSelectedElements[buttonData.id];
        });
    }

    /**
     * Регистрирует событие выбора элемента из списка.
     * Если выбран одиночный элемент, сразу отправляет событие.
     * Если выбран элемент со списком будет выбран первый элемент из списка. При повторном нажатии на элемент будет отображен выпадающий список.
     * @param {ButtonGroupData} state
     */
    private onClick(state: ButtonGroupData) {
        if (!state.nestedData) {
            this.emitSelected(state);
        } else {
            if (this.blockClick(state)) {
                this.emitSelected(this.currentNestedSelectedElements[state.id]);
            }
        }
    }

    /** Вызывает событие выбора элемента */
    private emitSelected(state: ButtonGroupData): void {
        this.$emit("input", state);
    }

    /** Проставляет выбранный элемент и вызывает событие */
    private onSelect(value: ButtonGroupData, index: number): void {
        this.currentNestedSelectedElements[index] = value;
        this.emitSelected(value);
    }
}

/** Модель данных для текущего компонента */
export type ButtonGroupData = {
    /** Уникальный идентификатор */
    id: number,
    /** Текст. Может быть не задан для элементов содержащих список */
    text?: string,
    /** Список вложенных элементов */
    nestedData?: ButtonGroupData[];
};