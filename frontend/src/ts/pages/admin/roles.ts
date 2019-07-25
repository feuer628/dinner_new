import Component from "vue-class-component";
import {DbAction, DbRole, Role} from "../../models/models";
import {UI} from "../../components/ui";

@Component({
    // language=Vue
    template:
`
<div>
    <h4 class="alignC">Роли с правами действия <b-button v-b-modal="modalId" pill variant="outline-success" size="sm"><font-awesome-icon icon="plus"></font-awesome-icon></b-button></h4>
    <b-list-group>
        <b-list-group-item v-for="role in roles" :key="role.id" v-b-toggle="'rolecollapse-'+role.id">
            <b-button variant="outline-danger" size="sm" @click.stop="dropRole(role)"><font-awesome-icon icon="trash"></font-awesome-icon></b-button>
            {{role.name}} <font-awesome-icon icon="angle-down"></font-awesome-icon>
            <b-collapse :id="'rolecollapse-'+role.id" class="mt-2">
                <b-list-group>
                    <b-list-group-item v-for="action in actions" :key="action.id" @click.stop>
                        <b-form-checkbox v-model="role.actions[action.id]" :value="action.desc" @change="roleActionAssoc(role.id, action.id, !!role.actions[action.id])">{{action.desc}}</b-form-checkbox>
                    </b-list-group-item>
                </b-list-group>
            </b-collapse>
        </b-list-group-item>
    </b-list-group>
    <b-modal :id="modalId" class="w-300" centered title="Добавление новой роли">
        <b-form-input v-model="newRoleName" placeholder="Введите имя новой роли"></b-form-input>
        <div slot="modal-footer" class="alignR">
            <b-button variant="outline-secondary" size="sm" @click="hideModal()">Отмена</b-button>
            <b-button variant="success" size="sm" @click="addNewRole">Добавить</b-button>
        </div>
    </b-modal>
</div>
`
})
export class Roles extends UI {

    private newRoleName: string = "";

    private roles: Role[] = [];

    private actions: DbAction[] = [];

    /**
     * хук. загрузка необходимой информации
     */
    private async mounted(): Promise<void> {
        this.roles = await this.loadRoles();
        this.actions = await this.rest.loadItems<DbAction>("actions");
    }

    private async addNewRole(): Promise<void> {
        try {
            if (this.newRoleName) {
                await this.$http.post("/roles", {name: this.newRoleName});
                this.hideModal();
                this.roles = await this.rest.loadItems<Role>("roles");
            } else {
                await this.messageDialog.showWarning("Не задано имя новой роли");
            }
        } catch (e) {
            this.hideModal();
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
                this.roles = await this.rest.loadItems<Role>("roles");
            }
        } catch (e) {
            await this.messageDialog.showInternalError();
        }
    }

    private async loadRoles(): Promise<Role[]> {
        const roles = await this.rest.loadItems<DbRole>("roles");
        return roles.map(role => {
            const actions: {[id: number]: string} = {};
            for (const act of role.actions) {
                actions[act.id] = act.desc;
            }
            return {id: role.id, name: role.name, actions}
        });
    }
}