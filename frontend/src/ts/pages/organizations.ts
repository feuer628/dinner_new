import Vue from "vue";
import Component from "vue-class-component";
import MessageDialog from '../components/dialogs/messageDialog';
import Common from "../utils/common";
import {Organization, OrgGroup} from "../models/models";

@Component({
    // language=Vue
    template:
`
<div>
    <h4>
        Организации
        <b-button v-b-modal.add-org-modal pill variant="outline-success" size="sm"><font-awesome-icon icon="plus"></font-awesome-icon></b-button>
    </h4>
    <b-list-group>
        <b-list-group-item v-for="org in orgs">
        <div>
            <b-button pill variant="outline-danger" size="sm"><font-awesome-icon icon="trash"></font-awesome-icon></b-button>
            {{org.name}} 
        </div>
        <div>
            <template v-if="org.group">Принадлежит группе: {{org.group.name}}</template>
            <template v-else>Не принадлежит никакой группе (можно добавить в группу на странице групп организаций)</template>
        </div>
        </b-list-group-item>
    </b-list-group>
    <b-modal ref="addOrgModal" id="add-org-modal" class="w-300" centered title="Добавление новой организации">
        <b-form-input v-model="newOrg.name" placeholder="Название организации"></b-form-input>
        <div slot="modal-footer" class="alignR">
            <b-button variant="outline-secondary" size="sm" @click="hideModal('addOrgModal')">Отмена</b-button>
<!--            <b-button variant="success" size="sm" @click="addNewOrg('addOrgModal')">Добавить</b-button>-->
        </div>
    </b-modal>
</div>
`
})
export class Organizations extends Vue {

    messageDialog: MessageDialog = Common.getMessageDialog();

    private orgs: Organization[] = [];

    private newOrg: Organization = {name: "", to_name: "", group_id: null, group: null};

    private orgGroups: OrgGroup[] = [];

    /**
     * хук. загрузка необходимой информации
     */
    private async mounted(): Promise<void> {
        this.orgs = await this.loadItems<Organization>("organizations/full");
        this.orgGroups = await this.loadItems<OrgGroup>("org_groups/full");
    }

    private hideModal(name: string): void {
        (<any> this.$refs[name]).hide();
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