import Component from "vue-class-component"
import {MenuItem} from "../models/models";
import Common from "../utils/common";
import {UI} from "../components/ui";

/** Название REST-пути работы с пунктами меню */
const MENU_ITEMS = "menu_items";

@Component({
    // language=Vue
    template: `
<div v-if="tabs && user && user.organization.group">
    <b-tabs v-model="tabIndex" card>
        <b-tab v-for="tab in tabs" :key="tab.name" :title="tab.name | formatTabDate">
            <div v-if="tab.orderConfirmed" class="mb10">
                <h4 class="alignC">На этот день вы заказали следующее:</h4>
                <b-list-group class="w800 mAuto">
                    <b-list-group-item v-for="ordItem in tab.current" :key="ordItem.itemId" class="flex-column align-items-start">
                        <div class="d-flex w-100 justify-content-between">
                            <h6>{{ordItem.name}}</h6>
                            <span><b>{{ordItem.count}}</b> шт. по {{ordItem.price}}₽/шт</span>
                        </div>
                        <div v-if="ordItem.comment"><small>С комментом "{{ordItem.comment}}"</small></div>
                    </b-list-group-item>
                </b-list-group>
            </div>
            <div v-else>
                <div>
                    Выбрано блюд на {{totalPrice}}₽
                    <span v-if="user.organization.group.limit" class="xs">(компенсируется {{user.organization.group.limit}}₽)</span>
                    <b-badge v-if="limitExceeded" variant="warning">Превышение на {{totalPrice - user.organization.group.limit}}₽!</b-badge>
                </div>
                <b-badge v-if="hardLimitExceeded" variant="danger">
                    Ограничение суммы заказа {{user.organization.group.hard_limit}}₽. Такой заказ невозможно утвердить.
                </b-badge>
                <div v-if="user.organization.group.limit_type === 0">
                    Баланс {{user.balance}}₽
                    <b-badge v-if="user.balance < totalPrice" variant="danger">
                        Сумма заказа превышает ваш баланс. Такой заказ невозможно утвердить.
                    </b-badge>
                </div>
            </div>
            <div style="text-align: center;">
                <b-button v-if="!tab.orderConfirmed" :disabled="confirmButtonDisabled" @click="showOrderConfirmDialog" size="sm" variant="primary">Утвердить заказ</b-button>
                <b-button size="sm" variant="outline-info">В Весточку</b-button>
                <b-button size="sm" variant="outline-info">В Telegram</b-button>
                <b-button size="sm" variant="outline-warning">Попросить сбросить заказ</b-button>
            </div>
            <!--                    <span>-->
            <!--                        <b-form-checkbox v-model="menu.anotherEmployee" @input="orderForAnotherEmployee(!!menu.anotherEmployee, menu)">Заказать за другого сотрудника</b-form-checkbox>-->
            <!--                        <b-form-select v-model="menu.employeeInfo" size="sm" class="w200" :disabled="!menu.anotherEmployee" :options="menu.notOrderedEmployees" @input="changeEmployee(menu)"></b-form-select>-->
            <!--                        <b-button size="sm" v-if="!menu.ordered" variant="info" :disabled="menu.totalPrice === 0" -->
            <!--                                  @click="setResultMenu(menu)" v-b-modal.confirmMenu>-->
            <!--                            Утвердить-->
            <!--                        </b-button>-->
            <!--                    </span>-->
            <b-button :aria-expanded="tab.needShowMenu ? 'true' : 'false'" aria-controls="menu_table_collapse" @click="tab.needShowMenu = !tab.needShowMenu" size="sm">
                Свернуть / развернуть меню
            </b-button>
            <b-collapse id="menu_table_collapse" v-model="tab.needShowMenu">
                <b-table striped :items="tab.items" :fields="tab.orderConfirmed ? basicMenuFields : fullMenuFields" class="mt10">
                    <template slot="buttons" slot-scope="row">
                        <b-button-group>
                            <b-button size="sm" @click="add(row.item)" variant="info"><font-awesome-icon icon="plus"></font-awesome-icon></b-button>
                            <b-button disabled variant="light"><b>{{getOrderItemCount(row.item.name)}}</b></b-button>
                            <b-button :disabled="!getOrderItemCount(row.item.name)" size="sm" @click="dec(row.item)" variant="info"><font-awesome-icon icon="minus"></font-awesome-icon></b-button>
                        </b-button-group>
                    </template>
                </b-table>
            </b-collapse>
        </b-tab>

        <b-modal :id="modalId" title="Подтверждение заказа">
            <b-table :items="currentOrder" :fields="orderFields" stripped small>
                <template slot="comment" slot-scope="row">
                    <b-button size="sm" @click.stop="row.toggleDetails" variant="outline-info" :pressed.sync="row.detailsShowing">
                        <font-awesome-icon :icon="row.detailsShowing ? 'angle-up' : 'angle-down'"></font-awesome-icon>
                    </b-button>
                </template>
                <template slot="row-details" slot-scope="row">
                    <b-form-input v-model="row.item.comment" type="text" label-size="sm" placeholder="Ваш комментарий к позиции"></b-form-input>
                </template>
                <template slot="amount" slot-scope="row">
                    {{row.item.count}} * {{row.item.price}}₽ = {{row.item.count*row.item.price}}₽
                </template>
            </b-table>
            <div>Всего: {{totalPrice}}₽</div>
            <div v-if="user.organization.group.limit">Компенсация: -{{user.organization.group.limit}}₽</div>
            <div v-if="totalPay > 0"><b>К доплате: {{totalPay}}₽</b></div>
            <div slot="modal-footer" class="alignR">
                <b-button variant="outline-secondary" size="sm" @click="hideModal(modalId)">Отмена</b-button>
                <b-button variant="success" size="sm" @click="confirmOrder">Подтвердить заказ</b-button>
            </div>
        </b-modal>
    </b-tabs>
</div>
`
})
export default class Menu extends UI {

    private modalId = "modalOrderId";

    private tabs: MenuTab[] = [];

    private tabIndex = 0;

    private get currentOrder() {
        return this.tabs[this.tabIndex] && this.tabs[this.tabIndex].current || [];
    }

    private get activeTab() {
        return this.tabs[this.tabIndex];
    }

    private get user() {
        return this.$store.state.user;
    }

    private get limitExceeded() {
        return this.user.organization.group.limit && this.totalPrice > this.user.organization.group.limit;
    }

    private get hardLimitExceeded() {
        return this.user.organization.group.hard_limit && this.totalPrice > this.user.organization.group.hard_limit;
    }

    private get confirmButtonDisabled() {
        if (this.user.organization.group.limit_type === 0) {
            return this.user.balance < this.totalPrice;
        } else {
            return this.hardLimitExceeded;
        }
    }

    private get totalPay() {
        let total = this.totalPrice;
        if (this.user.organization.group.limit_type === 0) {
            return total;
        } else {
            total -= this.user.organization.group.limit;
            return  total;
        }
    }

    private get totalPrice() {
        let total = 0;
        this.currentOrder.forEach(item => {
            total += item.count * item.price;
        });
        return total;
    }

    private async created(): Promise<void> {
        this.$store.state.user = (await this.$http.get("/users/me")).data;
        if (this.$store.state.user.organization.group === null) {
            await Common.messageDialog.showWarning("Ваша организация не входит ни в одну группу.");
            return;
        }
        const menu = await this.rest.loadItems<MenuItem>(MENU_ITEMS);
        new Set(menu.map(m => m.menu_date)).forEach(async (menuDate: string) => {
            this.tabs.push({
                name: menuDate,
                items: menu.filter(m => m.menu_date === menuDate),
                current: [],
                orderConfirmed: false,
                needShowMenu: false
            });
            await this.loadOrderInfo(menuDate);
        });
    }

    private async showOrderConfirmDialog() {
        this.activeTab.current = this.currentOrder.filter(orderItem => {
            return orderItem.count !== 0;
        });
        if (!this.currentOrder.length) {
            await this.$bvModal.msgBoxOk("Вы ничего не выбрали.");
            return;
        }
        this.showModal(this.modalId);
    }

    private async confirmOrder() {
        const params = {
            order_date: this.activeTab.name,
            items: this.currentOrder
        };
        await this.$http.post("/orders", params);
        this.hideModal(this.modalId);
        await this.loadOrderInfo(this.activeTab.name);
    }

    private async loadOrderInfo(orderDate: string) {
        const response = (await this.$http.get(`/orders/date/${orderDate}`)).data;
        const tab = this.tabs.find(t => {return t.name === orderDate});
        if (tab) {
            tab.current = [];
            tab.orderConfirmed = response !== null;
            tab.needShowMenu = response === null;
            if (response !== null) {
                for (const orderItem of (<any[]>response.orderItems)) {
                    tab.current.push({
                        count: orderItem.count,
                        comment: orderItem.comment,
                        rating: orderItem.rating,
                        review: orderItem.review,
                        price: orderItem.price,
                        name: orderItem.name
                    })
                }
            } else {
                tab.needShowMenu = true;
            }
        }
    }

    private getOrderItemCount(name: string): number {
        const item = this.currentOrder.find(i => i.name === name);
        return item && item.count || 0;
    }

    private async add(item: MenuItem): Promise<void> {
        const currentOrderItem = this.currentOrder.find(s => s.name === item.name);
        if (currentOrderItem) {
            currentOrderItem.count++;
        } else {
            this.currentOrder.push({name: item.name, count: 1, comment: "", price: item.price});
        }
    }

    private dec(item: MenuItem): void {
        const currentOrderItem = this.currentOrder.find(s => s.name === item.name);
        if (currentOrderItem && currentOrderItem.count) {
            currentOrderItem.count--;
        }
    }

    /**
     * Описание колонок таблицы меню
     */
    private basicMenuFields = {
        price: {
            label: "Цена",
            class: "w80"
        },
        name: {
            label: "Наименование"
        },
        description: {
            label: "Подробно"
        },
        weight: {
            label: "Вес",
            class: "w80"
        },
        rating: {
            label: "Рейтинг",
            class: "w80"
        }
    };

    private fullMenuFields = {
        buttons: {
            label: "Количество",
            class: "w80"
        },
        ...this.basicMenuFields
    };

    private orderFields = {
        comment: {
            label: "",
            class: "w25"
        },
        amount: {
            label: "Стоимость",
            class: "text-center"
        },
        "item.name": {
            label: "Наименование"
        },
    }
}

type MenuTab = {
    name: string;
    items: MenuItem[];
    orderConfirmed: boolean;
    needShowMenu: boolean;
    current: OrderItem[];
}

type OrderItem = {
    count: number;
    name: string;
    comment: string;
    price: number;
    rating?: number;
    review?: string;
}