import Vue from 'vue'
import Component from 'vue-class-component'

import {MenuInfo, MenuService} from "./services/menuService";
import SettingsService, {OrderType} from "./services/settingsService";
import EmployeeServices, {EmployeeInfo} from "./services/employeeServices";
import Common from "./common";
import App from "./App";

@Component({
    // language=Vue
    template: `
            <div>
                <b-card no-body>
                    <b-tabs card>
                        <b-tab :title="getTabName(menu.date)" v-for="menu in showMenu" :key="showMenu.date"
                               :active="isActiveTab(menu.date)">
                            <b-table hover :items="menu.items" :fields="menu.fields" caption-top>
                                // хедер
                                <template slot="table-caption">
                                    <span>
                                        <label>Стоимость заказа на текущий день: {{menu.totalPrice}}</label>
                                    </span>
                                    <span>
                                        Ваш баланс: {{menu.employeeInfo.balance}}
                                    </span>
                                    <span>
                                        <b-form-checkbox v-model="menu.anotherEmployee" @input="orderForAnotherEmployee(!!menu.anotherEmployee, menu)">Заказать за другого сотрудника</b-form-checkbox>
                                        <b-form-select v-model="menu.employeeInfo" size="sm" class="w200" :disabled="!menu.anotherEmployee" :options="menu.notOrderedEmployees" @input="changeEmployee(menu)"></b-form-select>
                                        <b-button size="sm" v-if="!menu.ordered" variant="info" :disabled="menu.totalPrice === 0" 
                                                  @click="setResultMenu(menu)" v-b-modal.confirmMenu>
                                            Утвердить
                                        </b-button>
                                    </span>
                                </template>
                                // кнопки для заказа
                                <template v-if="!menu.ordered" slot="buttons" slot-scope="row">
                                    <b-button size="sm" @click="add(menu, row.item)">+</b-button>
                                    <b-button size="sm" @click="dec(menu, row.item)">-</b-button>
                                </template>
                                // для разворачивания комментария
                                <template v-if="!menu.ordered || row.item.comment" slot="comment" slot-scope="row">
                                    <!-- we use @click.stop here to prevent emitting of a 'row-clicked' event  -->
                                    <b-button size="sm" @click.stop="row.toggleDetails" class="mr-2" variant="outline-info" :pressed.sync="row.detailsShowing">
                                        {{ row.detailsShowing ? '↑' : '↓'}}
                                    </b-button>
                                </template>
                                // для написания комментария
                                <template slot="row-details" slot-scope="row">
                                    <b-form-input :disabled="menu.ordered" v-model="row.item.comment" type="text" label-size="sm"
                                                  placeholder="Ваш комментарий к заказу"></b-form-input>
                                </template>
                            </b-table>
                        </b-tab>
                        
                        <!-- диалог для подтверждения заказа -->
                        <b-modal id="confirmMenu" :title="'Утвердите заказ ' + (resultMenu.anotherEmployee ? ('за ' + resultMenu.employeeInfo.fio) : '')" @ok="confirmMenu">
                            <b-table :items="resultMenu.items" :fields="resultMenu.fields" caption>
                                <template slot="table-caption">
                                    <div>
                                        <label>Общая стоимость: {{resultMenu.totalPrice}}</label>
                                    </div>
                                    <div>
                                        <label>Баланс: {{getBalance(resultMenu)}}</label>
                                    </div>
                                </template>
                            </b-table>
                        </b-modal>
                    </b-tabs>
                </b-card>
            </div>`
})

export default class Menu extends Vue {

    /** меню по дням */
    private menus: MenuInfo[] = [];
    /** зделанные заказы за неделю */
    private weeklyOrder: MenuInfo[] = [];
    /** отображаемое меню */
    private showMenu: MenuInfo[] = [];
    /** Сегодняшняя дата */
    private today = new Date();
    /** информация о пользователе */
    private employeeInfo: EmployeeInfo = EmployeeServices.employeeInfo;
    /** Итоговый заказ */
    private resultMenu: any = {};

    /**
     * хук. загрузка необходимой информации
     */
    private mounted(): void {
        this.menus = MenuService.getMenu();
        this.weeklyOrder = MenuService.getWeeklyOrder();
        this.makeShowMenu();
    }

    /**
     * Сформировать меню, которое будет отображаться
     */
    private makeShowMenu() {
        this.showMenu = JSON.parse(JSON.stringify(this.weeklyOrder));

        // склеим менюхи: для заказанных дней подставим сам заказ
        let dates:any = [];
        this.showMenu.forEach((item) => {
            dates.push(item.date);
        });
        this.menus.forEach(item => {
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
        });
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

    private async add(dayMenu: MenuInfo, item: any): Promise<void> {
        // для предоплатной системы не даем заказывать на сумму превышающую баланс
        if (SettingsService.settings.orderType === OrderType.PREPAYMENT &&
            (dayMenu.employeeInfo.balance - +dayMenu.totalPrice - +item.price < 0)) {
            Common.showError("Позиция не может быть заказана: стоимость заказа превышает Ваш баланс");
            return;
        }
        dayMenu.totalPrice = +dayMenu.totalPrice + +item.price;
        item._rowVariant = "success";
        item.count++;
    }

    private dec(dayMenu: any, item: any): void {
        if (item.count > 0) {
            dayMenu.totalPrice = +dayMenu.totalPrice - +item.price;
            item.count--;
        }
        if (item.count === 0) {
            item._rowVariant = "default";
        }
    }

    /**
     * Инициализация процесса заказа меню за другого сотрудника
     * @param forAnother флаг заказа за другого сотрудника
     * @param menu день меню на который делается заказ
     */
    private orderForAnotherEmployee(forAnother: boolean, menu: MenuInfo) {
        if (forAnother) {
            if (!menu.notOrderedEmployees) {
                // запрос делаем только в первый раз
                menu.notOrderedEmployees = this.loadNotOrderedEmployees(menu.date);
            }
            const isSelectAnotherEmployee = menu.employeeInfo.id !== this.employeeInfo.id;
            // если другой пользователь определен, а текущий уже сделал заказ -
            // установим полное меню на этот день, если оно есть
            if (isSelectAnotherEmployee && menu.ordered) {
                this.setMenuItemsFromArray(this.menus, menu, false);
            }
        } else {
            if (!this.setMenuItemsFromArray(this.weeklyOrder, menu, true)) {
                this.setMenuItemsFromArray(this.menus, menu, false);
            }
        }
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

    private changeEmployee(menu: MenuInfo) {
        if (menu.ordered) {
            this.setMenuItemsFromArray(this.menus, menu, false);
        }
        // при смене пользователя очистим заказ на текущий день
        menu.totalPrice = 0;
        menu.items.forEach((item: any) => {
            item._rowVariant = "default";
            item.count = 0;
            item.comment = "";
        });
    }

    /**
     * Получаем элементы меню из набора по дате
     * @param menuList набор меню
     * @param dayMenu текущий день меню
     * @param isOrdered флаг заказа на текущий день
     * @return флаг того что елемент из набора был найден
     */
    private setMenuItemsFromArray(menuList: MenuInfo[], dayMenu: MenuInfo, isOrdered: boolean): boolean {
        let menu = this.findMenu(menuList, dayMenu.date);
        if (menu) {
            dayMenu.items = menu.items;
            dayMenu.totalPrice = menu.totalPrice;
            dayMenu.ordered = isOrdered;
            return true;
        }
        return false;
    }

    /**
     * Поиск элемента меню в наборе данных по дате
     * @param menuList набор меню
     * @param date дата
     * @param copy нужно ли вернуть копию меню или же сам объект, по умолчанию делает копию
     */
    private findMenu(menuList: MenuInfo[], date: string, copy: boolean = true): MenuInfo {
        let menu: any = null;
        menuList.forEach(item => {
            if (item.date === date) {
                menu = copy ? JSON.parse(JSON.stringify(item)) : item;
            }
        });
        return menu;
    }

    /**
     * Преобразование меню для показа в диалоге подтверждения
     * @param menu меню
     */
    private setResultMenu(menu: MenuInfo) {
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
        try {
            // отправляем заказ, если успешно то пометим меню в текущем наборе как заказанное
            MenuService.sendOrder(this.resultMenu);
            let menu: MenuInfo = this.findMenu(this.showMenu, this.resultMenu.date, false);
            menu.ordered = true;
            menu.items = this.resultMenu.items;
            // TODO для оператора перезагрузить список тех кто не заказал
            menu.notOrderedEmployees = this.loadNotOrderedEmployees(menu.date);
        } catch (e) {

        }
    }

    /**
     * Описание колонок таблицы меню
     */
    private columns = {
        comment: {
            label: "",
            class: "w25"
        },
        buttons: {
            label: '',
            class: "w80"
        },
        count: {
            label: 'Количество',
            class: "w80"
        },
        price: {
            label: 'Цена',
            class: "w80"
        },
        name: {
            label: 'Наименование'

        },
        weight: {
            label: 'Вес'
        }
    };
}