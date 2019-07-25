import Component from "vue-class-component";
import {MenuItem} from "../models/models";
import {UI} from "../components/ui";

@Component({
    // language=Vue
    template:
`
<div>
    <h4>Шаблонные позиции поставщика <b-button @click="showModalDialog()" pill variant="outline-success" size="sm"><font-awesome-icon icon="plus"></font-awesome-icon></b-button></h4>
    <b-table :items="templateItems" :fields="templateFields" hover small>
        <template slot="action" slot-scope="row">
            <b-button size="sm" variant="outline-warning" @click="showModalDialog(row.item)" class="mr10">
                <font-awesome-icon icon="edit"></font-awesome-icon>
            </b-button>
            <b-button size="sm" variant="outline-danger" @click="removeTemplateItem(row.item)">
                <font-awesome-icon icon="trash"></font-awesome-icon>
            </b-button>
        </template>
    </b-table>
    <b-modal :id="modalId" size="lg" centered :title="(!!currentItem.id ? 'Изменение' : 'Добавление') + ' позиции'">
        <b-form-group label-cols="4" label-cols-lg="3" label="Название блюда" label-for="item_name">
            <b-form-input id="item_name" v-model="currentItem.name"></b-form-input>
        </b-form-group>
        <b-form-group label-cols="4" label-cols-lg="3" label="Тип блюда" label-for="type">
            <b-form-input id="type" v-model="currentItem.type"></b-form-input>
        </b-form-group>
        <b-form-group label-cols="4" label-cols-lg="3" label="Цена" label-for="price">
            <b-form-input id="price" v-model="currentItem.price"></b-form-input>
        </b-form-group>
        <b-form-group label-cols="4" label-cols-lg="3" label="Вес (выход)" label-for="weight">
            <b-form-input id="weight" v-model="currentItem.weight"></b-form-input>
        </b-form-group>
        <b-form-group label-cols="4" label-cols-lg="3" label="Описание" label-for="description">
            <b-form-input id="description" v-model="currentItem.description"></b-form-input>
        </b-form-group>
        <div slot="modal-footer" class="alignR">
            <b-button variant="outline-secondary" size="sm" @click="hideModal()">Отмена</b-button>
            <b-button :variant="!!currentItem.id ? 'primary' : 'success'" size="sm" @click="editTemplateOrder">{{!!currentItem.id ? 'Изменить' : 'Добавить'}}</b-button>
        </div>
    </b-modal>
</div>
`
})
export class TemplateOrders extends UI {

    /** Шаблонные позиции меню, которые добавляются на каждый день */
    private templateItems: MenuItem[] = [];

    private currentItem: MenuItem = this.initTemplateItem();

    /** Поля таблицы шаблонных позиций */
    private templateFields = {
        name: {label: "Название"},
        type: {label: "Тип блюда"},
        price: {label: "Цена (₽)", class: "w100 text-center"},
        weight: {label: "Выход", class: "w100 text-center"},
        description: {label: "Описание"},
        action: {label: "", class: "w200 text-center"}
    };

    /** Хук создания компонента */
    private async created(): Promise<void> {
        await this.refreshData();
    }

    /** Обновляет данные с сервера */
    private async refreshData(): Promise<void> {
        this.templateItems = await this.rest.loadItems<MenuItem>("menu/templates");
    }

    /** Инициализирует шаблонную позицию */
    private initTemplateItem(): MenuItem {
        return {
            name: "",
            type: "",
            price: 0,
            weight: "",
            description: ""
        };
    }

    /** Показать модальное окно изменения/добавления позиции */
    private async showModalDialog(item?: MenuItem): Promise<void> {
        this.currentItem = item ? {...item} : this.initTemplateItem();
        this.showModal();
    }

    /** Изменить позицию */
    private async editTemplateOrder(): Promise<void> {
        if (!!this.currentItem.id) {
            await this.$http.put(`/menu/templates/${this.currentItem.id}`, this.currentItem);
        } else {
            await this.rest.sendItem("menu/templates", this.currentItem);
        }
        await this.refreshData();
        this.hideModal();
    }

    /** Удаляет позицию из шаблонных позиций */
    private async removeTemplateItem(item: MenuItem): Promise<void> {
        if (await this.$bvModal.msgBoxConfirm(`Вы уверены что хотите удалить '${item.name}'?`)) {
            await this.rest.removeItem("menu/templates", <number> item.id);
            await this.refreshData();
        }
    }

}