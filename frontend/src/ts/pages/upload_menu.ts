import Component from "vue-class-component";
import {MenuItem} from "../models/models";
import {UI} from "../components/ui";
import {Days} from "../models/days";
import moment = require("moment");

@Component({
    // language=Vue
    template:
`
<div>
    <div class="mb10 alignC">
        <b-form-file v-if="isMenuEmpty" v-model="file" :state="Boolean(file)" name="menu"
                     accept=".xlsx" class="w600"
                     placeholder="Выберите файл с меню (XLSX формат)..">
        </b-form-file>
        <b-button v-if="file && isMenuEmpty" @click="upload" variant="primary" size="sm">Обработать файл..</b-button>
        <b-button v-if="!isMenuEmpty" @click="clearParsedItems" variant="outline-warning" size="sm">Очистить</b-button>
        <b-button v-if="!isMenuEmpty" @click="confirmMenu" variant="primary" size="sm">Утвердить меню</b-button>
    </div>
    <div v-if="!isMenuEmpty" class="mb10 alignC">
        <span>Добавить</span>
        <b-form-input v-model="priceToAdd" size="sm" type="number" class="w60 inline"></b-form-input>
        <span>рублей к цене блюд типа</span>
        <b-form-select v-model="selectedTypeToAdd" :options="typeToAdd" size="sm" class="w200 inline"></b-form-select>
        <b-button v-if="selectedTypeToAdd && priceToAdd" @click="addToPrice" variant="outline-info" size="sm">Добавить</b-button>
    </div>
    <hr/>
    <div v-for="(items, dayIndex, index) in parsedMenuByDates">

        <div>
            <b-form-checkbox v-if="isMondayBlock(dayIndex)" v-model="autoFillDate" :value="true">Автоматически проставить даты на всю неделю соответственно</b-form-checkbox>
            <b>{{getDayByIndex(dayIndex)}}</b> <b-form-input v-model="menuDates[dayIndex]" @change="value => {menuDateChange(dayIndex, value);}"  type="date" class="w200 inline"></b-form-input>
        </div>
        <div v-if="items.length">
            <div class="w800 inline-block">Название блюда</div>
            <div class="w200 inline-block">Тип</div>
            <div class="w100 inline-block">Цена (руб.)</div>
        </div>
        <div v-for="(item, index) in items" :key="index" style="margin-bottom: 1px;">
            <b-form-input v-model="item.name" size="sm" class="w800 inline"></b-form-input>
            <b-form-input v-model="item.type" size="sm" class="w200 inline"></b-form-input>
            <b-form-input v-model="item.price" size="sm" type="number" class="w100 inline"></b-form-input>
            <b-button size="sm" variant="outline-warning" @click="removeItem(item)">
                <font-awesome-icon icon="trash"></font-awesome-icon>
            </b-button>
        </div>
    </div>
    <h5>Следующие позиции будут добавлены к меню каждого дня:</h5>
    <p><b>Изменить их можно на странице редактирования шаблонных позиций поставщика</b></p>
    <b-table :items="templateItems" :fields="templateFields" class="w800" small>
        <template slot="action" slot-scope="row">
            <b-button size="sm" variant="outline-warning" @click="removeTemplateItem(row.item)">
                <font-awesome-icon icon="trash"></font-awesome-icon>
            </b-button>
        </template>
    </b-table>
</div>
`
})
export class UploadMenu extends UI {

    private file: any = null;

    private parsedMenuByDates: {[key: string]: MenuItem[]} = {};

    private templateItems: MenuItem[] = [];

    private selectedTypeToAdd: any = null;

    private menuDates: {[key: string]: string} = {};

    private autoFillDate = true;

    private priceToAdd = 0;

    private templateFields = {
        name: {label: "Название"},
        price: {label: "Цена (₽)", class: "w100 text-center"},
        weight: {label: "Выход", class: "w100 text-center"},
        action: {label: "Удалить?", class: "w100 text-center"}
    };

    private get isMenuEmpty() {
        return !Object.keys(this.parsedMenuByDates).length;
    }

    private get typeToAdd() {
        const types: Set<string> = new Set();
        for (const key in this.parsedMenuByDates) {
            this.parsedMenuByDates[key].map(i => i.type).forEach(o => types.add(o));
        }
        return Array.from(types);
    }

    private async created(): Promise<void> {
        this.templateItems = await this.rest.loadItems<MenuItem>("menu/templates");
    }

    private isMondayBlock(index: string) {
        return Days.valueOf(index) === Days.MONDAY;
    }

    private menuDateChange(dayIndex: string, value: any): void {
        if (this.isMondayBlock(dayIndex) && this.autoFillDate) {
            this.menuDateChangeAll(value);
            return;
        }
        this.parsedMenuByDates[dayIndex].forEach(o => {
            o.menu_date = value;
        });
    }

    private menuDateChangeAll(value: any): void {
        for (const key in this.parsedMenuByDates) {
            const currentDate = moment(value).add(Number(key) - 1, "d").format("YYYY-MM-DD");
            this.parsedMenuByDates[key].forEach(o => {
                o.menu_date = currentDate;
            });
            this.menuDates[key] = currentDate;
        }
        this.$forceUpdate();
    }

    private getDayByIndex(dayIndex: number) {
        return Days.valueOf(dayIndex);
    }

    private clearParsedItems() {
        this.parsedMenuByDates = {};
        this.file = null;
    }

    private removeItem(currentBlock: number, item: MenuItem) {
        this.parsedMenuByDates[currentBlock] = this.parsedMenuByDates[currentBlock].filter(obj => obj !== item);
    }

    private removeTemplateItem(item: MenuItem) {
        this.templateItems = this.templateItems.filter(obj => obj !== item);
    }

    private addToPrice() {
        for(const key in this.parsedMenuByDates) {
            this.parsedMenuByDates[key].forEach(ii => {
                if (ii.type === this.selectedTypeToAdd) {
                    ii.price += Number(this.priceToAdd);
                }
            });
        }
        this.$bvToast.toast("Цены изменены", {title: "Успешно", autoHideDelay: 3000, variant: "warning"});
    }

    private async upload() {
        const formData = new FormData();
        formData.append("menu", this.file);
        this.parsedMenuByDates = (await this.$http.post("/menu/upload", formData)).data;
        for(const key in this.parsedMenuByDates) {
            this.menuDates[key] = "";
        }
    }

    private async confirmMenu() {
        try {
            if (await this.$bvModal.msgBoxConfirm(`Вы уверены что хотите утвердить это меню?`)) {
                const params = {
                    everydayItems: this.templateItems,
                    menuByDates: this.parsedMenuByDates
                };
                await this.$http.post(`/menu/confirm`, params);
                this.$router.push("/menu");
            }
        } catch (e) {
            await this.messageDialog.showInternalError();
        }
    }

}