import MessageDialog from "../components/dialogs/messageDialog";

export default class Common {

    static messageDialog = new MessageDialog();

    public static showError(message: string) {
        this.messageDialog.showError(message);
    }

    static async showConfirmDialog(message: string): Promise<boolean>{
        return await this.messageDialog.showConfirm(message);
    }

    public static getMessageDialog(){
        return this.messageDialog;
    }
}