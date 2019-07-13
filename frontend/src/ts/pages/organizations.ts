import Vue from "vue";
import Component from "vue-class-component";
import MessageDialog from '../components/dialogs/messageDialog';
import Common from "../utils/common";

@Component({
    // language=Vue
    template:
`
<div>
    <h3>Организации и группы организаций</h3>
    <hr/>
    <h4>
        Организации
        <b-button v-b-modal.add-org-modal pill variant="outline-success" size="sm"><font-awesome-icon icon="plus"></font-awesome-icon></b-button>
    </h4>
    <b-list-group>
        <b-list-group-item v-for="org in orgs">
            <b-button variant="outline-danger" size="sm"><font-awesome-icon icon="trash"></font-awesome-icon></b-button>
            {{org.name}}
        </b-list-group-item>
    </b-list-group>
    <b-modal ref="addOrgModal" id="add-org-modal" class="w-300" centered title="Добавление новой организации">
        <b-form-input v-model="newOrg.name" placeholder="Название организации"></b-form-input>
        <div slot="modal-footer" class="alignR">
            <b-button variant="outline-secondary" size="sm" @click="hideModal('addOrgModal')">Отмена</b-button>
<!--            <b-button variant="success" size="sm" @click="addNewOrg('addOrgModal')">Добавить</b-button>-->
        </div>
    </b-modal>
    <h4>Группы организаций</h4>
    <b-list-group>
        <b-list-group-item v-for="orgGroup in orgGroups">
            {{orgGroup.name}}
        </b-list-group-item>
    </b-list-group>
</div>
`
})
export class Organizations extends Vue {

    messageDialog: MessageDialog = Common.getMessageDialog();

    private orgs: Organization[] = [];

    private newOrg: Organization = {};

    private orgGroups: OrgGroup[] = [];

    /**
     * хук. загрузка необходимой информации
     */
    private async mounted(): Promise<void> {
        this.orgs = await this.loadItems<Organization>("organizations");
        this.orgGroups = await this.loadItems<OrgGroup>("org_groups");
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

type Organization = {[id: number]: any};
type OrgGroup = {[id: number]: any};