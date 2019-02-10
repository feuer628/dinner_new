import {Component, Prop, UI, Watch} from "platform/ui";
import {CommonUtils} from "platform/utils/commonUtils";
import {ValidationResult} from "../../model/validationResult";
import {ErrorBulb} from "../errorBulb";
import {Ajax} from "./mixins/ajax";
import {PointerScroll} from "./mixins/pointerScroll";
import {TypeAheadPointer} from "./mixins/typeAheadPointer";

@Component({
    // language=Vue
    template: `
        <div :dir="dir" class="dropdown v-select" :class="dropdownClasses" @focus="setFocusOnSearchInput">
            <div ref="toggle" @mousedown.prevent="toggleDropdown"
                 :class="['dropdown-toggle', {'withTitle-box': !!title}, {'withTitle-field': !!title}, validationResult.classObject]">
                <span ref="title" v-if="!!title" class="fieldTitle">{{ title }}</span>
                <slot v-for="option in valueAsArray" name="selected-option-container"
                      :option="getOption(option, label)" :deselect="deselect"
                      :multiple="multiple" :disabled="disabled">
                    <div class="selected-tag" v-bind:key="option.index">
                        <slot name="selected-option" v-bind="getOption(option, label)">
                            {{ getOptionLabel(option) }}
                        </slot>
                        <button v-if="multiple" :disabled="disabled" @click="deselect(option)" type="button" class="close"
                                aria-label="Удалить">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                </slot>

                <input
                        ref="search"
                        :name="name"
                        v-model="search"
                        @keydown.delete="maybeDeleteValue"
                        @keyup.esc="onEscape"
                        @keydown.up.prevent="typeAheadUp"
                        @keydown.down.prevent="typeAheadDown"
                        @keydown.enter.prevent="typeAheadSelect"
                        @blur="onSearchBlur"
                        @focus="onSearchFocus"
                        type="search"
                        class="form-control"
                        autocomplete="off"
                        :disabled="disabled"
                        :placeholder="searchPlaceholder"
                        :tabindex="tabindex"
                        :readonly="!searchable"
                        :style="{ width: isValueEmpty ? '100%' : 'auto' }"
                        :id="inputId"
                        aria-label="Введите запрос для поиска">

                <button
                        v-show="showClearButton"
                        :disabled="disabled"
                        @click="clearSelection"
                        type="button"
                        class="clear"
                        title="Очистить">
                    <span aria-hidden="true">&times;</span>
                </button>

                <i v-if="filteredOptions.length && (!mutableValue || !noDropIfSelected)"
                   ref="openIndicator" role="presentation" class="dropdown-indicator"></i>

                <slot name="spinner">
                    <div class="spinner" v-show="mutableLoading">Загрузка...</div>
                </slot>
            </div>

            <transition :name="transition">
                <ul ref="dropdownMenu" v-if="(!mutableValue || !noDropIfSelected) && dropdownOpen" class="dropdown-menu" :style="{ 'max-height': maxHeight }">
                    <li v-for="(option, index) in filteredOptions" v-bind:key="index"
                        :class="{ active: isOptionSelected(option), highlight: index === typeAheadPointer }"
                        @mouseover="typeAheadPointer = index"
                        @mousedown.prevent="select(option)">

                        <slot name="option" v-bind="getOption(option, label)">
                            {{ getOptionLabel(option) }}
                        </slot>

                    </li>
                    <li v-if="!filteredOptions.length" class="no-options">
                        <slot name="no-options">Ничего не найдено</slot>
                    </li>
                </ul>
            </transition>
            <error-bulb :error-message="validationResult.errorMessage"></error-bulb>
        </div>
    `,
    mixins: [PointerScroll, TypeAheadPointer, Ajax],
    components: {ErrorBulb}
})
export class Select extends UI {

    $refs: {
        title: HTMLElement,
        search: HTMLInputElement,
        openIndicator: HTMLElement,
        toggle: HTMLElement,
        dropdownMenu: HTMLElement
    };

    pointerScrollMixin: PointerScroll;

    mixin: SelectMixin;

    search = "";

    /** Объект с результатами валидации поля */
    @Prop({default: () => new ValidationResult(), type: Object})
    validationResult: ValidationResult;

    /** Название компонента */
    @Prop({default: null})
    name: string;

    /**
     * Contains the currently selected value. Very similar to a
     * `value` attribute on an <input>. You can listen for changes
     * using 'change' event using v-on
     * @type {Object||String||''}
     */
    @Prop({default: ""})
    value: any;

    /**
     * An array of strings or objects to be used as dropdown choices.
     * If you are using an array of objects, vue-select will look for
     * a `label` key (ex. [{label: 'This is Foo', value: 'foo'}]). A
     * custom label key can be set with the `label` prop.
     * @type {Array}
     */
    @Prop({default: []})
    options: any[];

    /** Заголовок поля */
    @Prop({default: null})
    title: string;

    /**
     * Disable the entire component.
     * @type {Boolean}
     */
    @Prop({default: false, type: Boolean})
    disabled: boolean;

    /**
     * Sets the max-height property on the dropdown list.
     * @deprecated
     * @type {String}
     */
    @Prop({default: "400px"})
    maxHeight: string;

    /**
     * Enable/disable filtering the options.
     * @type {Boolean}
     */
    @Prop({default: false, type: Boolean})
    searchable: boolean;

    /**
     * Признак отображения кнопки очистки поля (крестика)
     */
    @Prop({default: false, type: Boolean})
    clearable: boolean;

    /**
     * Equivalent to the `multiple` attribute on a `<select>` input.
     * @type {Boolean}
     */
    @Prop({default: false, type: Boolean})
    multiple: boolean;

    /**
     * Equivalent to the `placeholder` attribute on an `<input>`.
     * @type {String}
     */
    @Prop({default: ""})
    placeholder: string;

    /**
     * Sets a Vue transition property on the `.dropdown-menu`. vue-select
     * does not include CSS for transitions, you'll need to add them yourself.
     * @type {String}
     */
    @Prop({default: "fade"})
    transition: string;

    /**
     * Enables/disables clearing the search text when an option is selected.
     * @type {Boolean}
     */
    @Prop({default: true, type: Boolean})
    clearSearchOnSelect: boolean;

    /**
     * Enables/disables clearing the search text on blur option.
     * @type {Boolean}
     */
    @Prop({default: true, type: Boolean})
    clearSearchOnBlur: boolean;

    /**
     * Close a dropdown when an option is chosen. Set to false to keep the dropdown
     * open (useful when combined with multi-select, for example)
     * @type {Boolean}
     */
    @Prop({default: true, type: Boolean})
    closeOnSelect: boolean;

    /**
     * Tells vue-select what key to use when generating option
     * labels when each `option` is an object.
     * @type {String}
     */
    @Prop({default: "label"})
    label: string;

    /**
     * Callback to generate the label text. If {option}
     * is an object, returns option[this.label] by default.
     * @type {Function}
     * @param  {Object || String} option
     * @return {String}
     */
    @Prop({
        type: Function,
        default(option: any) {
            if (typeof option === "object") {
                if (!option.hasOwnProperty(this.label)) {
                    // tslint:disable-next-line
                    return console.warn(
                        `[vue-select warn]: Label key "option.${this.label}" does not` +
                        ` exist in options object ${JSON.stringify(option)}.\n` +
                        "http://sagalbot.github.io/vue-select/#ex-labels"
                    );
                }
                if (this.label && option[this.label]) {
                    return option[this.label];
                }
            }
            return option;
        }
    })
    getOptionLabel: (option: any) => any;

    /**
     * An optional callback function that is called each time the selected
     * value(s) change. When integrating with Vuex, use this callback to trigger
     * an action, rather than using :value.sync to retreive the selected value.
     * @type {Function}
     * @param {Object || String} val
     */
    @Prop({
        type: Function,
        default(val: any) {
            this.$emit("input", val);
        }
    })
    onChange: (val: any) => void;

    /**
     * Enable/disable creating options from searchInput.
     * @type {Boolean}
     */
    @Prop({default: false, type: Boolean})
    taggable: boolean;

    /**
     * Set the tabindex for the input field.
     * @type {Number}
     */
    @Prop({default: null, type: Number})
    tabindex: number;

    /**
     * When true, newly created tags will be added to
     * the options list.
     * @type {Boolean}
     */
    @Prop({default: false, type: Boolean})
    pushTags: boolean;

    /**
     * When true, existing options will be filtered
     * by the search text. Should not be used in conjunction
     * with taggable.
     * @type {Boolean}
     */
    @Prop({default: true, type: Boolean})
    filterable: boolean;

    /**
     * Callback to determine if the provided option should
     * match the current search text. Used to determine
     * if the option should be displayed.
     * @type   {Function}
     * @param  {Object || String} option
     * @param  {String} label
     * @param  {String} search
     * @return {Boolean}
     */
    @Prop({
        type: Function,
        default(option: any, label: any, search: any) {
            return (label || "").toLowerCase().indexOf(search.toLowerCase()) > -1;
        }
    })
    filterBy: (option: any, label: any, search: any) => boolean;

    /**
     * Callback to filter results when search text
     * is provided. Default implementation loops
     * each option, and returns the result of
     * this.filterBy.
     * @type   {Function}
     * @param  {Array} list of options
     * @param  {String} search text
     * @param  {Object} vSelect instance
     * @return {Boolean}
     */
    @Prop({
        type: Function,
        default(options: any, search: any) {
            return options.filter((option: any) => {
                let label = this.getOptionLabel(option);
                if (typeof label === "number") {
                    label = label.toString();
                }
                return this.filterBy(option, label, search);
            });
        }
    })
    filter: (options: any, search: any) => boolean;

    /**
     * User defined function for adding Options
     * @type {Function}
     */
    @Prop({
        type: Function,
        default(newOption: any) {
            if (typeof this.mutableOptions[0] === "object") {
                newOption = {[this.label]: newOption};
            }
            this.$emit("option:created", newOption);
            return newOption;
        }
    })
    createOption: (newOption: any) => any;

    /**
     * When false, updating the options will not reset the select value
     * @type {Boolean}
     */
    @Prop({default: false, type: Boolean})
    resetOnOptionsChange: boolean;

    /**
     * Disable the dropdown entirely.
     * @type {Boolean}
     */
    @Prop({default: false, type: Boolean})
    noDrop: boolean;

    /**
     * Sets the id of the input element.
     * @type {String}
     * @default {null}
     */
    @Prop({type: String})
    inputId: string;

    /**
     * Sets RTL support. Accepts 'ltr', 'rtl', 'auto'.
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/dir
     * @type {String}
     * @default 'auto'
     */
    @Prop({default: "auto", type: String})
    dir: string;

    /** Флаг при котором не отображается выпадающее меню если элемент уже выбран */
    @Prop({default: false, type: Boolean})
    noDropIfSelected: boolean;

    /** Флаг при котором будет вызвано событие input при создании компонента */
    @Prop({default: true, type: Boolean})
    emitOnCreated: boolean;

    open = false;
    mutableValue: any = "";
    mutableOptions: any[] = [];
    /** Признак инициализации компонента */
    componentCreated = false;

    /**
     * Clone props into mutable values,
     * attach any event listeners.
     */
    created(): void {
        this.mixin = <any> this;
        this.mutableValue = this.value;
        this.mutableOptions = this.options.slice(0);
        this.mixin.mutableLoading = this.mixin.loading;

        this.$on("option:created", this.maybePushTag);
    }

    /**
     * When the value prop changes, update
     * the internal mutableValue.
     * @param  {mixed} val
     * @return {void}
     */
    @Watch("value")
    valueWatcher(val: any): void {
        this.mutableValue = val;
    }

    /**
     * Maybe run the onChange callback.
     * @param  {string|object} val
     * @param  {string|object} old
     * @return {void}
     */
    @Watch("mutableValue")
    mutableValueWatcher(val: any, old: any): void {
        // при создании компонента и свойстве emitOnCreated событие input не вызывается
        if (!this.componentCreated && !this.emitOnCreated) {
            this.componentCreated = true;
            return;
        }
        // очищаем строку поиска при изменении значения value
        this.search = "";
        if (this.multiple) {
            if (this.onChange) {
                this.onChange(val);
            }
        } else {
            if (this.onChange && val !== old) {
                this.onChange(val);
            }
        }
    }

    /**
     * When options change, update
     * the internal mutableOptions.
     * @param  {array} val
     * @return {void}
     */
    @Watch("options")
    optionsWatcher(val: any) {
        this.mutableOptions = val;
    }

    /**
     * Maybe reset the mutableValue
     * when mutableOptions change.
     * @return {[type]} [description]
     */
    @Watch("mutableOptions")
    mutableOptionsWatcher() {
        if (!this.taggable && this.resetOnOptionsChange) {
            this.mutableValue = this.multiple ? [] : null;
        }
    }

    /**
     * Always reset the mutableValue when
     * the multiple prop changes.
     * @param  {Boolean} val
     * @return {void}
     */
    @Watch("multiple")
    multipleMatcher(val: any) {
        this.mutableValue = val ? [] : null;
    }

    /**
     * Select a given option.
     * @param  {Object|String} option
     * @return {void}
     */
    select(option: any) {
        if (!this.isOptionSelected(option)) {
            if (this.taggable && !this.optionExists(option)) {
                option = this.createOption(option);
            }

            if (this.multiple && !this.mutableValue) {
                this.mutableValue = [option];
            } else if (this.multiple) {
                this.mutableValue.push(option);
            } else {
                this.mutableValue = option;
            }
        }

        this.onAfterSelect(option);
    }

    /**
     * De-select a given option.
     * @param  {Object|String} option
     * @return {void}
     */
    deselect(option: any) {
        if (this.multiple) {
            let ref = -1;
            this.mutableValue.forEach((val: any) => {
                if (val === option || typeof val === "object" && val[this.label] === option[this.label]) {
                    ref = val;
                }
            });
            const index = this.mutableValue.indexOf(ref);
            this.mutableValue.splice(index, 1);
        } else {
            this.mutableValue = null;
        }
    }

    /**
     * Clears the currently selected value(s)
     * @return {void}
     */
    clearSelection() {
        this.mutableValue = this.multiple ? [] : null;
    }

    /**
     * Called from this.select after each selection.
     * @param  {Object|String} option
     * @return {void}
     */
    onAfterSelect(option: any) {
        if (this.closeOnSelect) {
            this.open = !this.open;
            this.$refs.search.blur();
        }

        if (this.clearSearchOnSelect) {
            this.search = "";
        }
        // сбрасываем ошибки валидации
        this.validationResult.clear();
        // возможно исправят https://github.com/sagalbot/vue-select/issues/345
        // чтобы реагировать на событие выбора только когда пользователь сам выбрал,
        // а не при инициализации компонента и установке начального значения по умолчанию
        this.$emit("afterselect", this.mutableValue);
    }

    /**
     * Toggle the visibility of the dropdown menu.
     * @param  {Event} e
     * @return {void}
     */
    toggleDropdown(e: any) {
        if (e.target === this.$refs.openIndicator || e.target === this.$refs.search || e.target === this.$refs.toggle ||
            e.target === this.$el || e.target === this.$refs.title) {
            if (this.open) {
                this.$refs.search.blur(); // dropdown will close on blur
            } else {
                if (!this.disabled) {
                    this.open = true;
                    this.$refs.search.focus();
                }
            }
        }
    }

    /**
     * Check if the given option is currently selected.
     * @param  {Object|String}  option
     * @return {Boolean}        True when selected | False otherwise
     */
    isOptionSelected(option: any): any {
        if (this.multiple && this.mutableValue) {
            let selected = false;
            this.mutableValue.forEach((opt: any) => {
                if (typeof opt === "object" && opt[this.label] === option[this.label]) {
                    selected = true;
                } else if (typeof opt === "object" && opt[this.label] === option) {
                    selected = true;
                } else if (opt === option) {
                    selected = true;
                }
            });
            return selected;
        }

        return this.mutableValue === option;
    }

    /**
     * If there is any text in the search input, remove it.
     * Otherwise, blur the search input to close the dropdown.
     * @return {void}
     */
    onEscape() {
        if (!this.search.length) {
            this.$refs.search.blur();
        } else {
            this.search = "";
        }
    }

    /**
     * Close the dropdown on blur.
     * @emits  {search:blur}
     * @return {void}
     */
    onSearchBlur() {
        if (this.clearSearchOnBlur && !this.multiple) {
            this.search = "";
        }
        this.open = false;
        this.$emit("search:blur");
    }

    /**
     * Устанавливает фокус на поле search при клике на сам блок селекта.
     * Необходимо для IE, который устанавливает фокус не на инпут, а на сам div
     */
    setFocusOnSearchInput(): void {
        this.$refs.search.focus();
    }

    /**
     * Open the dropdown on focus.
     * @emits  {search:focus}
     * @return {void}
     */
    onSearchFocus() {
        this.open = true;
        this.$emit("search:focus");
    }

    /**
     * Delete the value on Delete keypress when there is no
     * text in the search input, & there's tags to delete
     * @return {this.value}
     */
    maybeDeleteValue(): any {
        if (!this.$refs.search.value.length && this.mutableValue) {
            return this.multiple ? this.mutableValue.pop() : this.mutableValue = null;
        }
    }

    /**
     * Determine if an option exists
     * within this.mutableOptions array.
     *
     * @param  {Object || String} option
     * @return {boolean}
     */
    optionExists(option: any) {
        let exists = false;

        this.mutableOptions.forEach(opt => {
            if (typeof opt === "object" && opt[this.label] === option) {
                exists = true;
            } else if (opt === option) {
                exists = true;
            }
        });

        return exists;
    }

    /**
     * If push-tags is true, push the
     * given option to mutableOptions.
     *
     * @param  {Object || String} option
     * @return {void}
     */
    maybePushTag(option: any) {
        if (this.pushTags) {
            this.mutableOptions.push(option);
        }
    }

    /**
     * Получить элемент выпадающего списка в виде объекта
     * @param option         элемент выпадающего списка
     * @param {string} label ключ объекта
     * @returns {string}  элемент выпадающего списка в виде объекта
     */
    getOption(option: any, label: string): string {
        if (typeof option === "object") {
            return option;
        }
        const optionObj: any = {};
        optionObj[label] = option;
        return optionObj;
    }

    /**
     * Classes to be output on .dropdown
     * @return {Object}
     */
    get dropdownClasses(): any {
        return {
            open: this.dropdownOpen,
            single: !this.multiple,
            searching: this.searching,
            searchable: this.searchable,
            unsearchable: !this.searchable,
            loading: this.mixin.mutableLoading,
            rtl: this.dir === "rtl",
            disabled: this.disabled
        };
    }

    /**
     * Return the current state of the
     * search input
     * @return {Boolean} True if non empty value
     */
    get searching() {
        return !!this.search;
    }

    /**
     * Return the current state of the
     * dropdown menu.
     * @return {Boolean} True if open
     */
    get dropdownOpen() {
        return this.noDrop ? false : this.open && !this.mixin.mutableLoading;
    }

    /**
     * Return the placeholder string if it's set
     * & there is no value selected.
     * @return {String} Placeholder text
     */
    get searchPlaceholder(): any {
        if (this.isValueEmpty && this.placeholder) {
            return this.placeholder;
        }
    }

    /**
     * The currently displayed options, filtered
     * by the search elements value. If tagging
     * true, the search text will be prepended
     * if it doesn't already exist.
     *
     * @return {array}
     */
    get filteredOptions(): any {
        if (!this.filterable && !this.taggable) {
            return this.mutableOptions.slice();
        }
        const options: any = this.search.length ? (<any> this).filter(this.mutableOptions, this.search, this) : this.mutableOptions;
        if (this.taggable && this.search.length && !this.optionExists(this.search)) {
            options.unshift(this.search);
        }
        return options;
    }

    /**
     * Check if there aren't any options selected.
     * @return {Boolean}
     */
    get isValueEmpty() {
        if (this.mutableValue) {
            if (typeof this.mutableValue === "object") {
                return !Object.keys(this.mutableValue).length;
            }
            return !this.mutableValue.length;
        }

        return true;
    }

    /**
     * Return the current value in array format.
     * @return {Array}
     */
    get valueAsArray() {
        if (this.multiple) {
            return this.mutableValue;
        } else if (this.mutableValue) {
            return [].concat(this.mutableValue);
        }

        return [];
    }

    /**
     * Determines if the clear button should be displayed.
     * @return {Boolean}
     */
    get showClearButton() {
        return this.clearable && !this.multiple && !this.open && !CommonUtils.isBlank(this.mutableValue);
    }
}

export type SelectMixin = Select & Ajax & PointerScroll & TypeAheadPointer;