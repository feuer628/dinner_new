import {Component, UI, Watch} from "platform/ui";
import {SelectMixin} from "../select";

@Component
export class PointerScroll extends UI {

    mixin: SelectMixin;

    created() {
        this.mixin = <any> this;
    }

    @Watch("typeAheadPointer")
    onTypeAheadPointer() {
        this.maybeAdjustScroll();
    }

    /**
     * Adjust the scroll position of the dropdown list
     * if the current pointer is outside of the
     * overflow bounds.
     * @returns {*}
     */
    maybeAdjustScroll() {
        const pixelsToPointerTop = this.pixelsToPointerTop();
        const pixelsToPointerBottom = this.pixelsToPointerBottom();

        if (pixelsToPointerTop <= this.viewport().top) {
            return this.scrollTo(pixelsToPointerTop);
        } else if (pixelsToPointerBottom >= this.viewport().bottom) {
            return this.scrollTo(this.viewport().top + this.pointerHeight());
        }
    }

    /**
     * The distance in pixels from the top of the dropdown
     * list to the top of the current pointer element.
     * @returns {number}
     */
    pixelsToPointerTop() {
        let pixelsToPointerTop = 0;
        if (this.mixin.$refs.dropdownMenu) {
            for (let i = 0; i < this.mixin.typeAheadPointer; i++) {
                pixelsToPointerTop += (<HTMLElement> this.mixin.$refs.dropdownMenu.children[i]).offsetHeight;
            }
        }
        return pixelsToPointerTop;
    }

    /**
     * The distance in pixels from the top of the dropdown
     * list to the bottom of the current pointer element.
     * @returns {*}
     */
    pixelsToPointerBottom() {
        return this.pixelsToPointerTop() + this.pointerHeight();
    }

    /**
     * The offsetHeight of the current pointer element.
     * @returns {number}
     */
    pointerHeight() {
        let pointer = 0;
        if (this.mixin.$refs.dropdownMenu) {
            pointer = (<HTMLElement> this.mixin.$refs.dropdownMenu.children[this.mixin.typeAheadPointer]).offsetHeight;
        }
        return pointer;
    }

    /**
     * The currently viewable portion of the dropdownMenu.
     * @returns {{top: (string|*|number), bottom: *}}
     */
    viewport() {
        return {
            top: this.mixin.$refs.dropdownMenu ? this.mixin.$refs.dropdownMenu.scrollTop : 0,
            bottom: this.mixin.$refs.dropdownMenu ? this.mixin.$refs.dropdownMenu.offsetHeight + this.mixin.$refs.dropdownMenu.scrollTop : 0
        };
    }

    /**
     * Scroll the dropdownMenu to a given position.
     * @param position
     * @returns {*}
     */
    scrollTo(position: any) {
        return this.mixin.$refs.dropdownMenu ? this.mixin.$refs.dropdownMenu.scrollTop = position : null;
    }
}
