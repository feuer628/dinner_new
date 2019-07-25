import Vue from "vue";
import {RestService} from "../service/restService";
import {MessageDialog} from "./dialogs/messageDialog";
import Common from "../utils/common";

/**
 * Базовый класс-расширение для компонентов Vue
 * Включает в себя RestService для взаимодейтсвия с сервером
 */
export class UI extends Vue {

    protected messageDialog = Common.getMessageDialog();

    protected rest: RestService = new RestService(this);

    protected get dataLoading() {
        return this.$store.state.dataLoading;
    }

    protected set dataLoading(newValue: boolean) {
        this.$store.state.dataLoading = newValue;
    }

    protected toastCenter(text: string, title = "Информация", variant = "info") {
        this.$bvToast.toast(text, {toaster: "b-toaster-top-center", title, autoHideDelay: 3000, variant});
    }

    protected showModal(name: string): void {
        this.$bvModal.show(name);
    }

    protected hideModal(name: string): void {
        this.$bvModal.hide(name);
    }
}