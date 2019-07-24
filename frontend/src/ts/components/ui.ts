import Vue from "vue";
import {RestService} from "../service/restService";
import {MessageDialog} from "./dialogs/messageDialog";
import Common from "../utils/common";

export class UI extends Vue {

    protected messageDialog = Common.getMessageDialog();

    protected rest: RestService = new RestService(this);

    protected get dataLoading() {
        return this.$store.state.dataLoading;
    }

    protected set dataLoading(newValue: boolean) {
        this.$store.state.dataLoading = newValue;
    }

    protected showModal(name: string): void {
        this.$bvModal.show(name);
    }

    protected hideModal(name: string): void {
        this.$bvModal.hide(name);
        // (<any> this.$refs[name]).hide();
    }
}