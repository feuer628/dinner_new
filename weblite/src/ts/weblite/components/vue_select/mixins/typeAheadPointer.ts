import {Component, UI, Watch} from "platform/ui";
import {SelectMixin} from "../select";

@Component
export class TypeAheadPointer extends UI {

    typeAheadPointer = -1;

    mixin: SelectMixin;

    created() {
        this.mixin = <any> this;
    }

    @Watch("filteredOptions")
    filteredOptionsWatcher() {
        this.typeAheadPointer = 0;
    }

    /**
     * Move the typeAheadPointer visually up the list by
     * subtracting the current index by one.
     * @return {void}
     */
    typeAheadUp() {
        if (this.typeAheadPointer > 0) {
            this.typeAheadPointer--;
            if (this.mixin.maybeAdjustScroll) {
                this.mixin.maybeAdjustScroll();
            }
        }
    }

    /**
     * Move the typeAheadPointer visually down the list by
     * adding the current index by one.
     * @return {void}
     */
    typeAheadDown() {
        if (this.typeAheadPointer < (<any> this).filteredOptions.length - 1) {
            this.typeAheadPointer++;
            if (this.mixin.maybeAdjustScroll) {
                this.mixin.maybeAdjustScroll();
            }
        }
    }

    /**
     * Select the option at the current typeAheadPointer position.
     * Optionally clear the search input on selection.
     * @return {void}
     */
    typeAheadSelect() {
        if (this.mixin.filteredOptions[this.typeAheadPointer]) {
            this.mixin.select(this.mixin.filteredOptions[this.typeAheadPointer]);
        } else if (this.mixin.taggable && (<any> this).search.length) {
            this.mixin.select(this.mixin.search);
        }

        if (this.mixin.clearSearchOnSelect) {
            this.mixin.search = "";
        }
    }

}