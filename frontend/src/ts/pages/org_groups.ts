import Component from "vue-class-component";
import {LimitType} from "../models/limitType";
import {Organization, OrgGroup, Provider} from "../models/models";
import {UI} from "../components/ui";

@Component({
    // language=Vue
    template:
`
<div>
    <h4>Группы организаций <b-button @click="showModalGroup()" pill variant="outline-success" size="sm"><font-awesome-icon icon="plus"></font-awesome-icon></b-button></h4>
    <hr/>
    <b-card-group columns>
        <b-card v-for="orgGroup in orgGroups" :key="orgGroup.id" :title="orgGroup.name" :sub-title="orgGroup.description">
            <b-card-text>
                <div v-if="!!orgGroup.provider_id">Поставщик: <b-badge pill variant="primary">{{getProviderName(orgGroup.provider_id)}}</b-badge></div>
                <div v-else><b>Поставщик обедов не задан</b></div>
                <hr/>
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
                <b-button @click="showModalGroup(orgGroup)" pill variant="outline-warning" size="sm"><font-awesome-icon icon="edit"></font-awesome-icon> Редактировать</b-button>
            </div>
        </b-card>
    </b-card-group>
    <b-modal :id="modalId" class="w-300" centered :title="(!!currentGroup.id ? 'Изменение' : 'Добавление') + ' группы организаций'">
        <b-form-input v-model="currentGroup.name" placeholder="Название группы" class="mb10"></b-form-input>
        <b-form-input v-model="currentGroup.description" placeholder="Описание" class="mb10"></b-form-input>
        <b-form-select v-model="currentGroup.limit_type" :options="limitTypes()" value-field="id" class="mb10"></b-form-select>
        <template v-if="currentGroup.limit_type !== 0">
            <b-form-checkbox v-model="currentGroup.compensation_flag" :value="true">Работодатель компенсирует оплату обедов</b-form-checkbox>
            <template v-if="currentGroup.compensation_flag">
                Лимит:
                <b-form-input v-model="currentGroup.limit" placeholder="Лимит" type="number"></b-form-input>
                Ограничение суммы обеда:
                <b-form-input v-model="currentGroup.hard_limit" placeholder="Ограничение суммы обеда" type="number" class="mb10"></b-form-input>
            </template>
        </template>
        <b-form-select v-model="currentGroup.provider_id" :options="providers" value-field="id" text-field="name" class="mb10">
            <template slot="first">
                <option :value="null" disabled>Выберите поставщика</option>
            </template>
        </b-form-select>
        <div>Организации:</div>
        <template v-for="org in orgs">
            <b-form-checkbox v-if="org.group_id === null || org.group_id === currentGroup.id" v-model="currentGroup.orgs" :key="org.id" :value="org" inline>{{org.name}}</b-form-checkbox>
        </template>
        <div slot="modal-footer" class="alignR">
            <b-button variant="outline-secondary" size="sm" @click="hideModal(modalId)">Отмена</b-button>
            <b-button :variant="!!currentGroup.id ? 'primary' : 'success'" size="sm" @click="editGroup">{{!!currentGroup.id ? 'Изменить' : 'Добавить'}}</b-button>
        </div>
    </b-modal>
</div>
`
})
export class OrgGroups extends UI {

    private modalId = "modalOrgGroupId";

    private currentGroup: OrgGroup = this.initCurrentGroup();

    private orgGroups: OrgGroup[] = [];

    private orgs: Organization[] = [];

    private providers: Provider[] = [];

    private async mounted(): Promise<void> {
        await this.refreshData();
    }

    private async refreshData(): Promise<void> {
        this.orgGroups = await this.rest.loadItems<OrgGroup>("org_groups/full");
        this.orgs = await this.rest.loadItems<Organization>("organizations");
        this.providers = await this.rest.loadItems<Provider>("providers");
    }

    private initCurrentGroup(): OrgGroup {
        return {
            name: "",
            limit_type: 0,
            compensation_flag: false,
            provider_id: null,
            limit: 0,
            hard_limit: 0,
            description: "",
            orgs: []
        };
    }

    private getProviderName(provider_id: number) {
        const provider = this.providers.find(p => p.id === provider_id);
        return provider && provider.name || "<ИМЯ НЕ НАЙДЕНО>";
    }

    private limitTypes() {
        return LimitType.values();
    }

    private getLimitTypeDesc(type: number) {
        return LimitType.valueOf(type);
    }

    private showModalGroup(group: OrgGroup) {
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
                provider_id: group.provider_id,
                orgs: group.orgs
            }
        } else {
            this.currentGroup = this.initCurrentGroup();
        }
        this.showModal(this.modalId);
    }

    private async editGroup(): Promise<void> {
        if (!!this.currentGroup.id) {
            await this.$http.put(`/org_groups/${this.currentGroup.id}`, this.currentGroup);
        } else {
            await this.$http.post(`/org_groups`, this.currentGroup);
        }
        await this.refreshData();
        this.hideModal(this.modalId);
    }

    private async deleteGroup(group: OrgGroup): Promise<void> {
        try {
            if (await this.$bvModal.msgBoxConfirm(`Вы уверены что хотите удалить группу '${group.name}'?`)) {
                await this.$http.delete(`/org_groups/${group.id}`);
                await this.refreshData();
            }
        } catch (e) {
            await this.messageDialog.showInternalError();
        }
    }
}