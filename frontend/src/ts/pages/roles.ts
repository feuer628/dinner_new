import Vue from "vue";
import Component from "vue-class-component";
import axios from "axios";
import MessageDialog from '../components/dialogs/messageDialog';
import Common from "../utils/common";

@Component({
    // language=Vue
    template:
`
<div>
    <div v-for="role in roles">{{role.name}}</div>
</div>
`
})
export class Roles extends Vue {

    messageDialog: MessageDialog = Common.getMessageDialog();

    private roles: Role[] = [];

    /**
     * хук. загрузка необходимой информации
     */
    private async mounted(): Promise<void> {
        try {
            const response = await axios.get<Role[]>("/roles");
            console.log(response);
            this.roles = response.data;
        } catch (e) {
            console.error(e);
            await this.messageDialog.showError("Внутренняя ошибка сервера.");
        }

    }
}

type Role = {
    id?: number;
    name: string;
}
