import Component from "vue-class-component";
import {UI} from "../../components/ui";
import {SystemProperty} from "../../models/models";

@Component({
    // language=Vue
    template:
`
<div>
    <h4 class="alignC">
        Системные свойства
        <b-button @click="showModalDialog()" pill variant="outline-success" size="sm"><font-awesome-icon icon="plus"></font-awesome-icon></b-button>
    </h4>
    <b-table :items="props" :fields="propFields" hover small class="w800 mAuto">
        <template slot="actions" slot-scope="row">
            <b-button size="sm" variant="outline-warning" @click="showModalDialog(row.item)" class="mr10">
                <font-awesome-icon icon="edit"></font-awesome-icon>
            </b-button>
            <b-button size="sm" variant="outline-danger" @click="removeProp(row.item)">
                <font-awesome-icon icon="trash"></font-awesome-icon>
            </b-button>
        </template>
    </b-table>
    <b-modal :id="modalId" centered title="Системное свойство">
        <b-form-group label-cols="4" label-cols-lg="3" label="Ключ" label-for="item_name">
            <b-form-input id="item_name" v-model="currentItem.name"></b-form-input>
        </b-form-group>
        <b-form-group label-cols="4" label-cols-lg="3" label="Значение" label-for="value">
            <b-form-input id="value" v-model="currentItem.value"></b-form-input>
        </b-form-group>
        
        <div slot="modal-footer" class="alignR">
            <b-button variant="outline-secondary" size="sm" @click="hideModal(modalId)">Отмена</b-button>
            <b-button variant="success" size="sm" @click="editProp">Добавить</b-button>
        </div>
    </b-modal>
</div>
`
})
export class SystemProperties extends UI {

    /** Идентификатор модального окна */
    private modalId = "SystemPropertiesModal";

    /** Шаблонные позиции меню, которые добавляются на каждый день */
    private props: SystemProperty[] = [];

    private currentItem: SystemProperty = this.initProp();

    /** Поля таблицы шаблонных позиций */
    private propFields = {
        name: {label: "Ключ"},
        value: {label: "Значение"},
        actions: {label: ""}
    };

    /** Хук создания компонента */
    private async created(): Promise<void> {
        await this.refreshData();
    }

    /** Обновляет данные с сервера */
    private async refreshData(): Promise<void> {
        this.props = await this.rest.loadItems<SystemProperty>("system_properties");
    }

    private initProp() {
        return {name: "", value: ""};
    }

    /** Показать модальное окно изменения/добавления позиции */
    private async showModalDialog(item?: SystemProperty): Promise<void> {
        this.currentItem = item ? {...item} : this.initProp();
        this.showModal(this.modalId);
    }

    private async editProp() {
        await this.rest.sendItem("system_properties", this.currentItem);
        await this.refreshData();
        this.hideModal(this.modalId);
    }

    private async removeProp(item: SystemProperty) {
        if (await this.$bvModal.msgBoxConfirm(`Вы уверены что хотите удалить '${item.name}'?`)) {
            await this.rest.removeItem("system_properties", item.name);
            await this.refreshData();
        }
    }
}