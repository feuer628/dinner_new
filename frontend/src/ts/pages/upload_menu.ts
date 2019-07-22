import Component from "vue-class-component";
import {MenuItem, User} from "../models/models";
import {UI} from "../components/ui";

@Component({
    // language=Vue
    template:
`
<div>
    <div class="mb10">
        <b-form-file v-model="file" :state="Boolean(file)" name="menu"
                     accept=".xls, .xlsx" class="w400"
                     placeholder="Выберите файл с меню (XLS формат)..">
        </b-form-file>
    </div>
    <b-button v-if="file" @click="upload" variant="primary" size="sm">Обработать файл..</b-button>
    <p>{{result.name}}</p>
    <p v-for="item in result.data" :key="item">{{item}}</p>
    <b-table :items="templateItems" :fields="templateFields" class="w800" small></b-table>
</div>
`
})
export class UploadMenu extends UI {

    private file: any = null;

    private result: ParseResult = {name: "", data: []};

    private templateItems: MenuItem[] = [];

    private templateFields = {
        name: {label: "Название"},
        price: {label: "Цена (₽)", class: "w100 text-center"},
        weight: {label: "Выход", class: "w100 text-center"}
    };

    private async created(): Promise<void> {
        this.templateItems = await this.rest.loadItems<MenuItem>("menu/templates");
    }

    private async upload() {
        const formData = new FormData();
        formData.append("menu", this.file);
        this.result = (await this.$http.post("/menu/upload", formData)).data;
    }
}

type ParseResult = {
    name: string;
    data: any[];
}