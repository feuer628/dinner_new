import Vue from "vue";
import Component from "vue-class-component";
import MessageDialog from '../components/dialogs/messageDialog';
import Common from "../utils/common";
import {LimitType} from "../models/limitType";
import {Organization, OrgGroup} from "../models/models";

@Component({
    // language=Vue
    template:
`
<div>
    <h4>Группы организаций <b-button @click="showModal()" pill variant="outline-success" size="sm"><font-awesome-icon icon="plus"></font-awesome-icon></b-button></h4>
    <hr/>
    <b-card-group columns>
        <b-card v-for="orgGroup in orgGroups" :key="orgGroup.id" :title="orgGroup.name" :sub-title="orgGroup.description">
            <b-card-text>
                <div><b>{{getLimitTypeDesc(orgGroup.limit_type)}}</b></div>
                <template v-if="orgGroup.compensation_flag">
                    <div>Обеды компенсируются работодателем</div>
                    <div v-if="!!orgGroup.limit"><b>Лимит: {{orgGroup.limit}} ₽</b></div>
                    <div v-if="!!orgGroup.hard_limit"><b-badge variant="warning">Ограничение суммы заказа: {{orgGroup.hard_limit}} ₽</b-badge></div>
                </template>
                <hr/>
                <div v-if="orgGroup.orgs.length">Организации в группе:</div>
                <div v-else>К этой группе не добавлено ни одной организации</div>
                <b-badge v-for="org in orgGroup.orgs" :key="org.id" pill variant="info" class="ml5">{{org.name}}</b-badge>
            </b-card-text>
            <div slot="footer">
                <b-button :disabled="!!orgGroup.orgs.length" @click="deleteGroup(orgGroup)" pill variant="outline-danger" size="sm"><font-awesome-icon icon="trash"></font-awesome-icon></b-button>
                <b-button @click="showModal(orgGroup)" pill variant="outline-warning" size="sm"><font-awesome-icon icon="edit"></font-awesome-icon> Редактировать</b-button>
            </div>
        </b-card>
    </b-card-group>
    <b-modal ref="addOrgGroupModal" id="org-group-modal" class="w-300" centered :title="(!!currentGroup.id ? 'Изменение' : 'Добавление') + ' группы организаций'">
        <b-form-input v-model="currentGroup.name" placeholder="Название группы" class="mb10"></b-form-input>
        <b-form-input v-model="currentGroup.description" placeholder="Описание" class="mb10"></b-form-input>
        <b-form-select v-model="currentGroup.limit_type" :options="limitTypes()" value-field="id" class="mb10"></b-form-select>
        <template v-if="currentGroup.limit_type !== 0">
            <b-form-checkbox v-model="currentGroup.compensation_flag" :value="true">Работодатель компенсирует оплату обедов</b-form-checkbox>
            <template v-if="currentGroup.compensation_flag">
                Лимит:
                <b-form-input v-model="currentGroup.limit" placeholder="Лимит" type="number"></b-form-input>
                Ограничение суммы обеда:
                <b-form-input v-model="currentGroup.hard_limit" placeholder="Ограничение суммы обеда" type="number"></b-form-input>
            </template>
        </template>
        <div>Организации:</div>
        <template v-for="org in orgs">
            <b-form-checkbox v-if="org.group_id === null || org.group_id === currentGroup.id" v-model="currentGroup.orgs" :key="org.id" :value="org" inline>{{org.name}}</b-form-checkbox>
        </template>
        <div slot="modal-footer" class="alignR">
            <b-button variant="outline-secondary" size="sm" @click="hideModal">Отмена</b-button>
            <b-button variant="success" size="sm" @click="editGroup">{{!!currentGroup.id ? 'Изменить' : 'Добавить'}}</b-button>
        </div>
    </b-modal>
</div>
`
})
export class OrgGroups extends Vue {

    messageDialog: MessageDialog = Common.getMessageDialog();

    private currentGroup: OrgGroup = this.initCurrentGroup();

    private orgGroups: OrgGroup[] = [];

    private orgs: Organization[] = [];

    private async mounted(): Promise<void> {
        await this.refreshData();
    }

    private async refreshData(): Promise<void> {
        this.orgGroups = await this.loadItems<OrgGroup>("org_groups/full");
        this.orgs = await this.loadItems<Organization>("organizations");
    }

    private initCurrentGroup(): OrgGroup {
        return {
            name: "",
            limit_type: 0,
            compensation_flag: false,
            limit: 0,
            hard_limit: 0,
            description: "",
            orgs: []
        };
    }

    private limitTypes() {
        return LimitType.values();
    }

    private getLimitTypeDesc(type: number) {
        return LimitType.valueOf(type);
    }

    private showModal(group: OrgGroup) {
        // Если редактируется организация
        if (group) {
            this.currentGroup = {
                id: group.id,
                name: group.name,
                limit_type: group.limit_type,
                compensation_flag: group.compensation_flag,
                limit: group.limit,
                hard_limit: group.hard_limit,
                description: group.description,
                orgs: group.orgs
            }
        } else {
            this.currentGroup = this.initCurrentGroup();
        }
        (<any> this.$refs["addOrgGroupModal"]).show();
    }

    private hideModal(): void {
        (<any> this.$refs["addOrgGroupModal"]).hide();
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

    private async editGroup(): Promise<void> {
        if (!!this.currentGroup.id) {
            await this.$http.put(`/org_groups/${this.currentGroup.id}`, this.currentGroup);
        } else {
            await this.$http.post(`/org_groups`, this.currentGroup);
        }
        await this.refreshData();
        this.hideModal();
    }

    private async deleteGroup(group: OrgGroup): Promise<void> {
        try {
            if (await this.$bvModal.msgBoxConfirm(`Вы уверены что хотите удалить группу '${group.name}'`)) {
                await this.$http.delete(`/org_groups/${group.id}`);
                await this.refreshData();
            }
        } catch (e) {
            await this.messageDialog.showInternalError();
        }

    }
}