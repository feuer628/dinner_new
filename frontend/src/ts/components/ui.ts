import Vue from "vue";
import {RestService} from "../service/restService";
import {MessageDialog} from "./dialogs/messageDialog";
import Common from "../utils/common";

export class UI extends Vue {

    protected messageDialog: MessageDialog = Common.getMessageDialog();

    protected rest: RestService = new RestService(this);

    protected showModal(name: string): void {
        this.$bvModal.show(name);
    }

    protected hideModal(name: string): void {
        this.$bvModal.hide(name);
        // (<any> this.$refs[name]).hide();
    }
}