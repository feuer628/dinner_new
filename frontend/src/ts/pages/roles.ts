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
    <h4>Роли (нажать, чтобы открыть список действий) <b-button pill variant="outline-success" size="sm"><font-awesome-icon icon="plus"></font-awesome-icon></b-button></h4>
    <b-list-group>
        <b-list-group-item v-for="role in roles" v-b-toggle="'rolecollapse-'+role.id">
            <b-button variant="outline-danger" size="sm"><font-awesome-icon icon="trash"></font-awesome-icon></b-button>
            {{role.name}} <font-awesome-icon icon="angle-down"></font-awesome-icon>
            <b-collapse :id="'rolecollapse-'+role.id" class="mt-2">
                <b-list-group>
                    <b-list-group-item v-for="action in actions">
                        <b-form-checkbox :value="action.id">{{action.desc}}</b-form-checkbox>
                    </b-list-group-item>
                </b-list-group>
            </b-collapse>
        </b-list-group-item>
    </b-list-group>
    <h4>Действия</h4>
    <b-list-group>
        <b-list-group-item v-for="action in actions">
            <b-button variant="outline-danger" size="sm"><font-awesome-icon icon="trash"></font-awesome-icon></b-button>
            {{action.desc}}
        </b-list-group-item>
        <b-list-group-item>
            <b-button pill variant="outline-success" size="sm">Добавить действие</b-button>
        </b-list-group-item>
    </b-list-group>
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
