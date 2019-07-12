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
    <h3>Роли и действия</h3>
    <p>Тут список ролей</p>
    <div v-for="role in roles">{{role.name}}</div>
    <b-button pill variant="outline-success" size="sm">Добавить роль</b-button>
    <p>Тут список действий</p>
    <div v-for="action in actions">{{action.desc}}</div>
    <b-button pill variant="outline-success" size="sm">Добавить действие</b-button>
</div>
`
})
export class Roles extends Vue {

    messageDialog: MessageDialog = Common.getMessageDialog();

    private roles: Role[] = [];

    private actions: Action[] = [];

    /**
     * хук. загрузка необходимой информации
     */
    private async mounted(): Promise<void> {
        this.roles = await this.getRoles();
        this.actions = await this.getActions();
    }

    private async getRoles(): Promise<Role[]> {
        try {
            const response = await axios.get<Role[]>("/roles");
            return response.data;
        } catch (e) {
            await this.messageDialog.showInternalError();
        }
        return [];
    }

    private async getActions(): Promise<Action[]> {
        try {
            const response = await axios.get<Action[]>("/actions");
            return response.data;
        } catch (e) {
            await this.messageDialog.showInternalError();
        }
        return [];
    }
}

type Role = {
    id?: number;
    name: string;
}

type Action = {
    id?: number;
    desc: string;
}
