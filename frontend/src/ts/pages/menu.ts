import Vue from "vue"
import Component from "vue-class-component"

import EmployeeServices, {EmployeeInfo} from "../service/employeeServices";
import {MenuItem} from "../models/models";
import {RestService} from "../service/restService";

/** Название REST-пути работы с пунктами меню */
const MENU_ITEMS = "menu_items";

@Component({
    // language=Vue
    template: `
<div>
    <b-tabs card>
        <b-tab v-for="tab in tabs" :key="tab.name" :title="tab.name" :active="activeTab">
            <b-table striped  hover :items="tab.items" :fields="columns" caption-top>
                <template slot="table-caption">
                    <span>Выбрано блюд на {{totalPrice}} ₽</span>
                    <div style="text-align: center;">
                        <b-button size="sm" variant="outline-primary">Утвердить заказ</b-button>
                    </div>
<!--                    <span>-->
<!--                        Ваш баланс: {{menu.employeeInfo.balance}}-->
<!--                    </span>-->
<!--                    <span>-->
<!--                        <b-form-checkbox v-model="menu.anotherEmployee" @input="orderForAnotherEmployee(!!menu.anotherEmployee, menu)">Заказать за другого сотрудника</b-form-checkbox>-->
<!--                        <b-form-select v-model="menu.employeeInfo" size="sm" class="w200" :disabled="!menu.anotherEmployee" :options="menu.notOrderedEmployees" @input="changeEmployee(menu)"></b-form-select>-->
<!--                        <b-button size="sm" v-if="!menu.ordered" variant="info" :disabled="menu.totalPrice === 0" -->
<!--                                  @click="setResultMenu(menu)" v-b-modal.confirmMenu>-->
<!--                            Утвердить-->
<!--                        </b-button>-->
<!--                    </span>-->
                </template>
                <template slot="buttons" slot-scope="row">
                    <b-button-group>
                        <b-button size="sm" @click="add(row.item)" variant="info"><font-awesome-icon icon="plus"></font-awesome-icon></b-button>
                        <b-button disabled variant="outline-info">{{getOrderItemCount(row.item.id)}}</b-button>
                        <b-button :disabled="!getOrderItemCount(row.item.id)" size="sm" @click="dec(row.item)" variant="info"><font-awesome-icon icon="minus"></font-awesome-icon></b-button>
                    </b-button-group>
                </template>
            </b-table>
        </b-tab>
        
        <!-- диалог для подтверждения заказа -->
        <b-modal id="confirmMenu" title="Утвеждрение заказа" @ok="confirmMenu">
            <b-table :items="resultMenu.items" :fields="resultMenu.fields" caption>
                <template slot="table-caption">
                    <div>
                        <label>Общая стоимость: {{resultMenu.totalPrice}} ₽</label>
                    </div>
                    <div>
                        <label>Баланс: {{getBalance(resultMenu)}} ₽</label>
                    </div>
                </template>
            </b-table>
        </b-modal>
    </b-tabs>
</div>
`
})
export default class Menu extends Vue {

    private menu: MenuItem[] = [];

    private tabs: MenuTabs[] = [];

    private activeTab: string = "";

    private currentOrder: OrderItem[] = [];

    /** зделанные заказы за неделю */
    private weeklyOrder: MenuItem[] = [];
    /** отображаемое меню */
    private showMenu: MenuItem[] = [];
    /** Сегодняшняя дата */
    private today = new Date();
    /** информация о пользователе */
    private employeeInfo: EmployeeInfo = EmployeeServices.employeeInfo;
    /** Итоговый заказ */
    private resultMenu: any = {};

    private rest: RestService = new RestService(this);

    /**
     * хук. загрузка необходимой информации
     */
    private async mounted(): Promise<void> {
        this.menu = await this.rest.loadItems<MenuItem>(MENU_ITEMS);
        new Set(this.menu.map(m => m.menu_date)).forEach(menuDate => {
            this.tabs.push({name: menuDate, items: this.menu.filter(m => m.menu_date === menuDate)});
        });
        // this.weeklyOrder = MenuService.getWeeklyOrder();
        // this.makeShowMenu();
    }

    private get totalPrice() {
        let total = 0;
        this.currentOrder.forEach(item => {
            total += item.count * item.item.price;
        });
        return total;
    }

    /**
     * Сформировать меню, которое будет отображаться
     */
    private makeShowMenu() {
/*        this.showMenu = JSON.parse(JSON.stringify(this.weeklyOrder));

        // склеим менюхи: для заказанных дней подставим сам заказ
        let dates:any = [];
        this.showMenu.forEach((item) => {
            dates.push(item.date);
        });
        this.menu.forEach(item => {
            if (dates.indexOf(item.date) === -1) {
                this.showMenu.push(JSON.parse(JSON.stringify(item)))
            }
        });
        // отсортируем меню для показа
        this.showMenu.sort((a, b) => (new Date(a.date) > new Date(b.date)) ? 1 : -1);

        // проставляем информацию по столбцам;
        // по умолчанию меню расчитано на залогиневшегося пользователя
        this.showMenu.forEach((item: any) => {
            item.fields = JSON.parse(JSON.stringify(this.columns));
            // if (item.ordered) {
            //     // удалим колонку с кнопками для заказанных дней
            //     delete item.fields.buttons;
            // }
            item.employeeInfo = this.employeeInfo;
        });*/
    }

    /**
     * Получение наименования таба
     * @param date дата для которой отображается таб
     */
    private getTabName(date: any) {
        return new Date(date).toLocaleDateString();
    };

    /**
     * Определение является ли данный таб активный(сегодняшний)
     * @param date дата для таба
     */
    private isActiveTab(date: any) {
        return new Date(date).toLocaleDateString() === this.today.toLocaleDateString();
    }

    private getOrderItemCount(id: number): number {
        const item = this.currentOrder.find(i => i.itemId === id);
        return item && item.count || 0;
    }

    private async add(item: MenuItem): Promise<void> {
        const currentOrderItem = this.currentOrder.find(s => s.itemId === item.id);
        if (currentOrderItem) {
            currentOrderItem.count++;
        } else {
            this.currentOrder.push({itemId: item.id, count: 1, item});
        }
    }

    private dec(item: MenuItem): void {
        const currentOrderItem = this.currentOrder.find(s => s.itemId === item.id);
        if (currentOrderItem && currentOrderItem.count) {
            currentOrderItem.count--;
        }
    }

    /**
     * Инициализация процесса заказа меню за другого сотрудника
     * @param forAnother флаг заказа за другого сотрудника
     * @param menu день меню на который делается заказ
     */
    private orderForAnotherEmployee(forAnother: boolean, menu: MenuItem) {
/*        if (forAnother) {
            if (!menu.notOrderedEmployees) {
                // запрос делаем только в первый раз
                menu.notOrderedEmployees = this.loadNotOrderedEmployees(menu.date);
            }
            const isSelectAnotherEmployee = menu.employeeInfo.id !== this.employeeInfo.id;
            // если другой пользователь определен, а текущий уже сделал заказ -
            // установим полное меню на этот день, если оно есть
            if (isSelectAnotherEmployee && menu.ordered) {
                this.setMenuItemsFromArray(this.menu, menu, false);
            }
        } else {
            if (!this.setMenuItemsFromArray(this.weeklyOrder, menu, true)) {
                this.setMenuItemsFromArray(this.menu, menu, false);
            }
        }*/
    }

    /**
     * Загружает список тех кто не заказал обед на заданную дату
     * @param date дата для загрузки
     */
    private loadNotOrderedEmployees(date: string) {
        let a = EmployeeServices.getNotLoadedEmployees(date);
        return a.map(item => {
            return {value: item, text: item.fio};
        });
    }

    private changeEmployee(menu: MenuItem) {
/*        if (menu.ordered) {
            this.setMenuItemsFromArray(this.menu, menu, false);
        }
        // при смене пользователя очистим заказ на текущий день
        menu.totalPrice = 0;
        menu.items.forEach((item: any) => {
            item._rowVariant = "default";
            item.count = 0;
            item.comment = "";
        });*/
    }

    /**
     * Получаем элементы меню из набора по дате
     * @param menuList набор меню
     * @param dayMenu текущий день меню
     * @param isOrdered флаг заказа на текущий день
     * @return флаг того что елемент из набора был найден
     */
    private setMenuItemsFromArray(menuList: MenuItem[], dayMenu: MenuItem, isOrdered: boolean): boolean {
/*        let menu = this.findMenu(menuList, dayMenu.date);
        if (menu) {
            dayMenu.items = menu.items;
            dayMenu.totalPrice = menu.totalPrice;
            dayMenu.ordered = isOrdered;
            return true;
        }*/
        return false;
    }

    /**
     * Поиск элемента меню в наборе данных по дате
     * @param menuList набор меню
     * @param date дата
     * @param copy нужно ли вернуть копию меню или же сам объект, по умолчанию делает копию
     */
/*    private findMenu(menuList: MenuItem[], date: string, copy: boolean = true): MenuItem {
        let menu: any = null;
        menuList.forEach(item => {
            if (item.date === date) {
                menu = copy ? JSON.parse(JSON.stringify(item)) : item;
            }
        });
        return menu;
    }*/

    /**
     * Преобразование меню для показа в диалоге подтверждения
     * @param menu меню
     */
    private setResultMenu(menu: MenuItem) {
        this.resultMenu = JSON.parse(JSON.stringify(menu));
        // отфильтруем не заказанные позиции
        this.resultMenu.items = this.resultMenu.items.filter((item: any) => !!item.count);
        this.resultMenu.items.forEach((item: any) => {
            item._rowVariant = "default";
        });
        delete this.resultMenu.fields.weight;
        delete this.resultMenu.fields.buttons;
        delete this.resultMenu.fields.comment;
    }

    /**
     * Получить исходящий остаток баланса после утверждения очередного заказа
     */
    private getBalance(): any {
        if (this.resultMenu.employeeInfo) {
            return this.resultMenu.employeeInfo.balance - this.resultMenu.totalPrice;
        }
    }

    /**
     * Подтверждение заказа
     */
    private confirmMenu() {
/*        try {
            // отправляем заказ, если успешно то пометим меню в текущем наборе как заказанное
            MenuService.sendOrder(this.resultMenu);
            let menu: MenuItem = this.findMenu(this.showMenu, this.resultMenu.date, false);
            menu.ordered = true;
            menu.items = this.resultMenu.items;
            // TODO для оператора перезагрузить список тех кто не заказал
            menu.notOrderedEmployees = this.loadNotOrderedEmployees(menu.date);
        } catch (e) {

        }*/
    }

    /**
     * Описание колонок таблицы меню
     */
    private columns = {
        buttons: {
            label: "Количество",
            class: "w80"
        },
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
}

type MenuTabs = {
    name: string;
    items: MenuItem[];
}

type OrderItem = {
    itemId: number;
    count: number;
    item: MenuItem;
}