import Vue from "vue";
import {RestService} from "../service/restService";
import MessageDialog from "../components/dialogs/messageDialog";
import Common from "../utils/common";

export class UI extends Vue {

    protected messageDialog: MessageDialog = Common.getMessageDialog();

    protected rest: RestService = new RestService(this);
}