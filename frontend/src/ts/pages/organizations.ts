import Vue from "vue";
import Component from "vue-class-component";
import MessageDialog from '../components/dialogs/messageDialog';
import Common from "../utils/common";
import {LimitType} from "../models/limitType";

@Component({
    // language=Vue
    template:
`
<div>
    <h3>Организации и группы организаций</h3>
    <hr/>
    <h4>
        Группы организаций (нажать, чтобы открыть список входящих в группу организаций) 
        <b-button v-b-modal.add-org-modal pill variant="outline-success" size="sm"><font-awesome-icon icon="plus"></font-awesome-icon></b-button>
    </h4>
    <b-list-group>
        <b-list-group-item v-for="orgGroup in orgGroups" v-b-toggle="'groupcollapse-'+orgGroup.id">
        <div>
            <b-button variant="outline-danger" size="sm"><font-awesome-icon icon="trash"></font-awesome-icon></b-button>
            {{orgGroup.name}} <font-awesome-icon v-if="orgGroup.orgs.length" icon="angle-down"></font-awesome-icon>
        </div>
        <b-collapse :id="'groupcollapse-'+orgGroup.id" class="mt-2">
            <b-list-group>
                <b-list-group-item v-for="org in orgGroup.orgs" @click.stop>
                    {{org.name}}
                    <b-button variant="outline-warning" size="sm">Убрать из этой группы</b-button>
                </b-list-group-item>
            </b-list-group>
        </b-collapse>
        </b-list-group-item>
    </b-list-group>
    <h4>
        Организации
        <b-button v-b-modal.add-org-modal pill variant="outline-success" size="sm"><font-awesome-icon icon="plus"></font-awesome-icon></b-button>
    </h4>
    <b-list-group>
        <b-list-group-item v-for="org in orgs">
        <div>
            <b-button variant="outline-danger" size="sm"><font-awesome-icon icon="trash"></font-awesome-icon></b-button>
            {{org.name}} 
        </div>
        <div>
            <template v-if="org.group">Принадлежит группе: {{org.group.name}}</template>
            <template v-else>
                Не принадлежит никакой группе
                <b-button variant="outline-info" size="sm">Добавить в группу</b-button>
            </template>
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

type Organization = {
    id?: number;
    name: string;
    to_name: string | null;
    group_id: number | null;
    group: OrgGroup | null;
};

type OrgGroup = {
    id: number;
    limit_type: LimitType;
    limit: number | null;
    description: string | null;
    orgs: Organization[];
};