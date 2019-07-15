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
        <b-button @click="showModal()" pill variant="outline-success" size="sm"><font-awesome-icon icon="plus"></font-awesome-icon></b-button>
    </h4>
    <b-list-group>
        <b-list-group-item v-for="(org, index) in orgs" :key="org.id" :variant="index % 2 ? 'default' : 'light'">
        <div>
            <b>{{org.name}}</b>
            <b-badge variant="warning" v-if="org.group">В группе: {{org.group.name}}</b-badge>
            <b-badge variant="success" v-else>без группы</b-badge>
        </div>
        <div class="xs">
            <p>"Кому" в шапке заявлений: <b>{{org.to_name}}</b></p>
            <b-button @click="deleteOrg(org)" pill variant="outline-danger" size="sm"><font-awesome-icon icon="trash"></font-awesome-icon></b-button>
            <b-button @click="showModal(org)" pill variant="outline-warning" size="sm"><font-awesome-icon icon="edit"></font-awesome-icon> Редактировать</b-button>
        </div>
        </b-list-group-item>
    </b-list-group>
    <b-modal ref="editOrgModal" id="org-modal" class="w-300" centered :title="(!!currentOrg.id ? 'Изменение' : 'Добавление') + ' организации'">
        <b-form-input v-model="currentOrg.name" placeholder="Название организации" class="mb10"></b-form-input>
        <b-form-input v-model="currentOrg.to_name" placeholder="'Кому' в шапке заявлений" class="mb10"></b-form-input>
        
        <div slot="modal-footer" class="alignR">
            <b-button variant="outline-secondary" size="sm" @click="hideModal">Отмена</b-button>
            <b-button variant="success" size="sm" @click="editOrganization">{{!!currentOrg.id ? 'Изменить' : 'Добавить'}}</b-button>
        </div>
    </b-modal>
</div>
`
})
export class Organizations extends Vue {

    messageDialog: MessageDialog = Common.getMessageDialog();

    private orgs: Organization[] = [];

    private currentOrg: Organization = this.initCurrentOrganization();

    /**
     * хук. загрузка необходимой информации
     */
    private async mounted(): Promise<void> {
        this.orgs = await this.loadItems<Organization>("organizations/full");
    }

    private initCurrentOrganization(): Organization {
        return {
            name: "",
            to_name: "",
            group_id: null,
            group: null
        };
    }

    private showModal(org: Organization) {
        // Если редактируется организация
        if (org) {
            this.currentOrg = {
                id: org.id,
                name: org.name,
                to_name: org.to_name,
                group_id: org.group_id,
                group: org.group
            }
        } else {
            this.currentOrg = this.initCurrentOrganization();
        }
        (<any> this.$refs["editOrgModal"]).show();
    }

    private hideModal(): void {
        (<any> this.$refs["editOrgModal"]).hide();
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

    private async editOrganization(): Promise<void> {
        if (!!this.currentOrg.id) {
            await this.$http.put(`/organizations/${this.currentOrg.id}`, this.currentOrg);
        } else {
            await this.$http.post(`/organizations`, this.currentOrg);
        }
        this.orgs = await this.loadItems<Organization>("organizations/full");
        this.hideModal();
    }

    private async deleteOrg(org: Organization): Promise<void> {
        try {
            if (await this.$bvModal.msgBoxConfirm(`Вы уверены что хотите удалить группу '${org.name}'?`)) {
                await this.$http.delete(`/organizations/${org.id}`);
                this.orgs = await this.loadItems<Organization>("organizations/full");
            }
        } catch (e) {
            await this.messageDialog.showInternalError();
        }
    }
}