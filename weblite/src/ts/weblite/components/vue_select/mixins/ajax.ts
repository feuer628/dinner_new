import {Component, Prop, UI, Watch} from "platform/ui";
import {SelectMixin} from "../select";

@Component
export class Ajax extends UI {

    mixin: SelectMixin;

    mutableLoading = false;

    /**
     * Toggles the adding of a 'loading' class to the main
     * .v-select wrapper. Useful to control UI state when
     * results are being processed through AJAX.
     */
    @Prop({default: false, type: Boolean})
    loading: boolean;

    /**
     * Accept a callback function that will be
     * run when the search text changes.
     *
     * loading() accepts a boolean value, and can
     * be used to toggle a loading class from
     * the onSearch callback.
     *
     * @param {search}  String          Current search text
     * @param {loading} Function(bool)  Toggle loading class
     */
    @Prop({type: Function, default(search: any, loading: any) {}})
    onSearch: (search: any, loading: any) => any;

    created() {
        this.mixin = <any> this;
    }

    /**
     * If a callback & search text has been provided,
     * invoke the onSearch callback.
     */
    @Watch("search")
    searchWatcher() {
        if (this.mixin.search.length > 0) {
            // при поиске сбрасываем выбранное значение
            this.mixin.mutableValue = null;
            this.onSearch(this.mixin.search, this.toggleLoading);
            this.$emit("search", (<any> this).search, this.toggleLoading);
        }
    }

    /**
     * Sync the loading prop with the internal
     * mutable loading value.
     * @param val
     */
    @Watch("loading")
    loadingWatcher(val: any) {
        this.mutableLoading = val;
    }

    /**
     * Toggle this.loading. Optionally pass a boolean
     * value. If no value is provided, this.loading
     * will be set to the opposite of it's current value.
     * @param toggle Boolean
     * @returns {*}
     */
    toggleLoading(toggle?: boolean) {
        if (toggle == null) {
            return this.mutableLoading = !this.mutableLoading;
        }
        return this.mutableLoading = toggle;
    }
}