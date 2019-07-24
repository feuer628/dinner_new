import Component from "vue-class-component"
import {MenuItem, OrderInfo, OrderItem} from "../models/models";
import Common from "../utils/common";
import {UI} from "../components/ui";

/** Название REST-пути работы с пунктами меню */
const MENU_ITEMS = "menu_items";

@Component({
    // language=Vue
    template: `
<div>
    <div v-if="!tabNames.length">
        <h4 class="alignC">Меню еще не загружено. Ожидайте.</h4>
    </div>
    <div v-if="tabNames.length && user && user.organization.group">
        <b-tabs @input="tabChanged" card lazy>
            <b-tab v-for="tabName in tabNames" :key="tabName" :title="tabName | formatTabDate">
                <div v-if="currentOrder && currentOrder.id" class="mb10">
                    <h4 class="alignC">На этот день вы заказали следующее:</h4>
                    <b-list-group class="w800 mAuto">
                        <b-list-group-item v-for="ordItem in currentOrder.orderItems" :key="ordItem.name" class="flex-column align-items-start">
                            <div class="d-flex w-100 justify-content-between">
                                <h6>{{ordItem.name}}</h6>
                                <span><b>{{ordItem.count}}</b> шт. по {{ordItem.price}}₽/шт</span>
                            </div>
                            <div v-if="ordItem.comment"><small>С комментом "{{ordItem.comment}}"</small></div>
                        </b-list-group-item>
                    </b-list-group>
                </div>
                <div v-else class="mb10">
                    <b-card :title="'Выбрано блюд на ' + totalPrice + '₽'" sub-title="" class="mAuto w500">
                        <b-card-text>
                            <b-badge v-show="user.organization.group.limit" variant="success">компенсируется {{user.organization.group.limit}}₽</b-badge>
                            <b-badge v-show="limitExceeded" variant="warning">Превышение на {{totalPrice - user.organization.group.limit}}₽!</b-badge>
                        </b-card-text>
                        <b-card-text>
                            <b-badge v-show="hardLimitExceeded" variant="danger">
                                Ограничение суммы заказа {{user.organization.group.hard_limit}}₽. Такой заказ невозможно утвердить.
                            </b-badge>
                        </b-card-text>
                        <b-card-text v-if="user.organization.group.limit_type === 0">
                            Баланс {{user.balance}}₽
                            <b-badge v-if="user.balance < totalPrice" variant="danger">
                                Сумма заказа превышает ваш баланс. Такой заказ невозможно утвердить.
                            </b-badge>
                        </b-card-text>
                    </b-card>
                </div>
                <div style="text-align: center;">
                    <b-button v-if="!currentOrder.id" :disabled="confirmButtonDisabled" @click="showOrderConfirmDialog" size="sm" variant="primary">Утвердить заказ</b-button>
                    <b-button size="sm" variant="outline-info">В Весточку</b-button>
                    <b-button size="sm" variant="outline-info">В Telegram</b-button>
                    <b-button v-if="currentOrder.id" size="sm" variant="outline-warning">Попросить сбросить заказ</b-button>
                </div>
                <!--                    <span>-->
                <!--                        <b-form-checkbox v-model="menu.anotherEmployee" @input="orderForAnotherEmployee(!!menu.anotherEmployee, menu)">Заказать за другого сотрудника</b-form-checkbox>-->
                <!--                        <b-form-select v-model="menu.employeeInfo" size="sm" class="w200" :disabled="!menu.anotherEmployee" :options="menu.notOrderedEmployees" @input="changeEmployee(menu)"></b-form-select>-->
                <!--                        <b-button size="sm" v-if="!menu.ordered" variant="info" :disabled="menu.totalPrice === 0" -->
                <!--                                  @click="setResultMenu(menu)" v-b-modal.confirmMenu>-->
                <!--                            Утвердить-->
                <!--                        </b-button>-->
                <!--                    </span>-->
                <b-button :aria-expanded="menuShowed ? 'true' : 'false'" aria-controls="menu_table_collapse" @click="menuShowed = !menuShowed" size="sm" variant="light">
                    Свернуть / развернуть меню
                </b-button>
                <b-collapse id="menu_table_collapse" v-model="menuShowed">
                    <b-table striped :items="menu" :fields="currentOrder.id ? basicMenuFields : fullMenuFields" class="mt10">
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

            <b-modal :id="modalId" title="Подтверждение заказа" size="lg">
                <b-table :items="currentOrder.orderItems" :fields="orderFields" stripped small>
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
</div>
`
})
export default class Menu extends UI {

    private modalId = "modalOrderId";

    private tabNames: string[] = [];

    private activeTab = 0;

    private menu: MenuItem[] = [];

    private currentOrder: OrderInfo = {orderItems: []};

    private menuShowed = true;

    private get currentTabName() {
        return this.tabNames[this.activeTab];
    }

    private get user() {
        return this.$store.state.user;
    }

    private get limitExceeded() {
        return this.user.organization.group.limit && this.totalPrice > this.user.organization.group.limit;
    }

    private get hardLimitExceeded() {
        return (this.user.organization.group.hard_limit > 0) && (this.totalPrice > this.user.organization.group.hard_limit);
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
        this.currentOrder.orderItems.forEach(item => {
            total += item.count * item.price;
        });
        return total;
    }

    private async created(): Promise<void> {
        this.$store.state.user = (await this.$http.get("/users/me")).data;
        if (this.$store.state.user.organization.group === null) {
            await Common.messageDialog.showWarning("Ваша организация не входит ни в одну группу организаций.");
            return;
        }
        this.tabNames = await this.rest.loadItems<string>("menu_items/dates");
    }

    private async tabChanged(index: number) {
        await this.loadOrderInfo(this.tabNames[index]);
        await this.loadItemsForTab(this.tabNames[index]);
    }

    private async loadItemsForTab(date: string) {
        const cachedMenu = this.$store.state.tabsMenu[date];
        if (cachedMenu) {
            this.menu = cachedMenu;
            return;
        }
        this.menu = [];
        this.menu = await this.rest.loadItems<MenuItem>(`menu_items/date/${date}`);
        this.$store.state.tabsMenu[date] = this.menu;
    }

    private async loadOrderInfo(orderDate: string): Promise<void> {
        let cachedOrder = this.$store.state.tabsOrders[orderDate];
        if (!cachedOrder) {
            this.$store.state.tabsOrders[orderDate] = (await this.rest.loadItem<OrderInfo>(`orders/date/${orderDate}`)) || {orderItems: []};
        }
         this.currentOrder = this.$store.state.tabsOrders[orderDate];
    }

    private async showOrderConfirmDialog() {
        this.currentOrder.orderItems = this.currentOrder.orderItems.filter(orderItem => {
            return orderItem.count !== 0;
        });
        if (!this.currentOrder.orderItems.length) {
            await this.$bvModal.msgBoxOk("Вы ничего не выбрали.");
            return;
        }
        this.showModal(this.modalId);
    }

    private async confirmOrder() {
        const params = {
            order_date: this.currentTabName,
            items: this.currentOrder
        };
        await this.$http.post("/orders", params);
        this.hideModal(this.modalId);
        await this.loadOrderInfo(this.currentTabName);
    }

    private getOrderItemCount(name: string): number {
        const item = this.currentOrder.orderItems.find(i => i.name === name);
        return item && item.count || 0;
    }

    private async add(item: MenuItem): Promise<void> {
        const currentOrderItem = this.currentOrder.orderItems.find(s => s.name === item.name);
        if (currentOrderItem) {
            currentOrderItem.count++;
        } else {
            this.currentOrder.orderItems.push({name: item.name, count: 1, comment: "", price: item.price});
        }
    }

    private dec(item: MenuItem): void {
        const currentOrderItem = this.currentOrder.orderItems.find(s => s.name === item.name);
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
            class: "w200 text-center"
        },
        name: {
            label: "Наименование"
        },
    }
}