import Vue from "vue";
import Component from "vue-class-component";
import MessageDialog from '../components/dialogs/messageDialog';
import Common from "../utils/common";
import {DbAction, DbRole, Role} from "../models/models";

@Component({
    // language=Vue
    template:
`
<div>
    <h3>Роли и действия</h3>
    <hr/>
    <h4>
        Роли (нажать, чтобы открыть список действий) 
        <b-button v-b-modal.add-role-modal pill variant="outline-success" size="sm"><font-awesome-icon icon="plus"></font-awesome-icon></b-button>
    </h4>
    <b-list-group>
        <b-list-group-item v-for="role in roles" v-b-toggle="'rolecollapse-'+role.id">
            <b-button variant="outline-danger" size="sm" @click.stop="dropRole(role)"><font-awesome-icon icon="trash"></font-awesome-icon></b-button>
            {{role.name}} <font-awesome-icon icon="angle-down"></font-awesome-icon>
            <b-collapse :id="'rolecollapse-'+role.id" class="mt-2">
                <b-list-group>
                    <b-list-group-item v-for="action in actions" @click.stop>
                        <b-form-checkbox v-model="role.actions[action.id]" :value="action.desc" @change="roleActionAssoc(role.id, action.id, !!role.actions[action.id])">{{action.desc}}</b-form-checkbox>
                    </b-list-group-item>
                </b-list-group>
            </b-collapse>
        </b-list-group-item>
    </b-list-group>
    <b-modal ref="addRoleModal" id="add-role-modal" class="w-300" centered title="Добавление новой роли">
        <b-form-input v-model="newRoleName" placeholder="Введите имя новой роли"></b-form-input>
        <div slot="modal-footer" class="alignR">
            <b-button variant="outline-secondary" size="sm" @click="hideModal('addRoleModal')">Отмена</b-button>
            <b-button variant="success" size="sm" @click="addNewRole('addRoleModal')">Добавить</b-button>
        </div>
    </b-modal>
    <h4>Действия</h4>
    <b-list-group>
        <b-list-group-item v-for="action in actions">
            {{action.desc}}
        </b-list-group-item>
    </b-list-group>
</div>
`
})
export class Roles extends Vue {

    messageDialog: MessageDialog = Common.getMessageDialog();

    private roles: Role[] = [];

    private newRoleName: string = "";

    private actions: DbAction[] = [];

    /**
     * хук. загрузка необходимой информации
     */
    private async mounted(): Promise<void> {
        this.roles = await this.loadRoles();
        this.actions = await this.loadItems<DbAction>("actions");
    }

    private hideModal(name: string): void {
        (<any> this.$refs[name]).hide();
    }

    private async addNewRole(name: string): Promise<void> {
        try {
            if (this.newRoleName) {
                await this.$http.post("/roles", {name: this.newRoleName});
                (<any> this.$refs[name]).hide();
                this.roles = await this.loadItems<Role>("roles");
            } else {
                await this.messageDialog.showWarning("Не задано имя новой роли");
            }
        } catch (e) {
            await this.messageDialog.showInternalError();
        }
    }

    private async roleActionAssoc(roleId: number, actionId: number, newAssoc: boolean) {
        try {
            await this.$http.patch(`/roles/${roleId}/assoc/${actionId}`);
            this.roles = await this.loadRoles();
        } catch (e) {
            await this.messageDialog.showInternalError();
        }
    }

    private async dropRole(role: Role): Promise<void> {
        try {
            if (await this.$bvModal.msgBoxConfirm(`Вы уверены что хотите удалить роль '${role.name}'`)) {
                await this.$http.delete("/roles/" + role.id);
                this.roles = await this.loadItems<Role>("roles");
            }
        } catch (e) {
            await this.messageDialog.showInternalError();
        }
    }

    private async loadRoles(): Promise<Role[]> {
        const roles = await this.loadItems<DbRole>("roles");
        return roles.map(role => {
            const actions: {[id: number]: string} = {};
            for (const act of role.actions) {
                actions[act.id] = act.desc;
            }
            return {id: role.id, name: role.name, actions}
        });
    }

    private async loadItems<T>(refName: string): Promise<T[]> {
        try {
            const response = await this.$http.get(`/${refName}`);
            return <T[]>response.data;
        } catch (e) {
            await this.messageDialog.showInternalError();
        }
        return [];
    }
}