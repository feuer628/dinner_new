import Component from "vue-class-component";
import {Provider} from "../models/models";
import {UI} from "../components/ui";

@Component({
    // language=Vue
    template:
`
<div>
    <h4>
        Поставщики
        <b-button @click="showModal(modalId)" pill variant="outline-success" size="sm"><font-awesome-icon icon="plus"></font-awesome-icon></b-button>
    </h4>
    <b-list-group>
        <b-list-group-item v-for="(provider, index) in providers" :key="provider.id" :variant="index % 2 ? 'default' : 'light'">
            <div>
                <p><b>{{provider.name}}</b> <a v-if="provider.url" :href="provider.url"><font-awesome-icon icon="external-link-alt"></font-awesome-icon></a></p>
                <p>{{provider.emails}}</p>
                <p v-if="provider.description" class="xs"><b>Описание:</b> {{provider.description}}</p>
            </div>
            <div class="xs">
                <b-button @click="showModalProvider(provider)" pill variant="outline-warning" size="sm"><font-awesome-icon icon="edit"></font-awesome-icon> Редактировать</b-button>
            </div>
        </b-list-group-item>
    </b-list-group>
    <b-modal :id="modalId" class="w-300" centered :title="(!!current.id ? 'Изменение' : 'Добавление нового') + ' поставщика'">
        <b-form-input v-model="current.name" placeholder="Название поставщика" class="mb10"></b-form-input>
        <b-form-input v-model="current.emails" placeholder="E-mail'ы поставщика" class="mb10"></b-form-input>
        <b-form-input v-model="current.description" placeholder="Описание" class="mb10"></b-form-input>
        <b-form-input v-model="current.url" placeholder="Адрес сайта поставщика" class="mb10"></b-form-input>
        <b-form-input v-model="current.logo" placeholder="Ссылка на логотип"></b-form-input>
        
        <div slot="modal-footer" class="alignR">
            <b-button variant="outline-secondary" size="sm" @click="hideModal(modalId)">Отмена</b-button>
            <b-button variant="success" size="sm" @click="editProvider">{{!!current.id ? 'Изменить' : 'Добавить'}}</b-button>
        </div>
    </b-modal>
</div>
`
})
export class Providers extends UI {

    private modalId = "modalProviderId";

    private providers: Provider[] = [];

    private current: Provider = this.initCurrent();

    private async mounted(): Promise<void> {
        this.providers = await this.rest.loadItems<Provider>("providers");
    }

    private initCurrent(): Provider {
        return {
            name: "",
            emails: "",
            description: "",
            url: "",
            logo: ""
        };
    }

    private showModalProvider(provider: Provider) {
        this.current = provider ? {...provider} : this.initCurrent();
        this.showModal(this.modalId);
    }

    private async editProvider(): Promise<void> {
        if (!!this.current.id) {
            await this.$http.put(`/providers/${this.current.id}`, this.current);
        } else {
            await this.$http.post(`/providers`, this.current);
        }
        this.providers = await this.rest.loadItems<Provider>("providers");
        this.hideModal(this.modalId);
    }
}