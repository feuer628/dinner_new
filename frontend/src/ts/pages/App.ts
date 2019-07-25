import Component from "vue-class-component";
import {UI} from "../components/ui";
import {State} from "vuex-class";
import {User} from "../models/models";

@Component({
    // language=Vue
    template: `
    <div id="app">

        <b-navbar toggleable="md" type="dark" variant="success">

            <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

            <b-navbar-brand to="/menu">
                BIFIT_dinner 
                <div class="w60 inline-block">
                    <b-spinner v-show="dataLoading" variant="light" style="width: 1rem; height: 1rem;" label="Загрузка данных"></b-spinner>
                </div>
            </b-navbar-brand>

            <b-collapse is-nav id="nav_collapse">

                <b-navbar-nav>
                    <b-nav-item v-show="authenticated" to="/menu"><font-awesome-icon icon="th-list"></font-awesome-icon> Меню</b-nav-item>
                    
                    <b-nav-item-dropdown v-show="authenticated" text="Обеды">
                        <b-dropdown-item to="/templateOrders">Шаблонные позиции блюд</b-dropdown-item>
                        <b-dropdown-item to="/uploadMenu">Загрузка меню</b-dropdown-item>
                        <b-dropdown-item to="/orderGroup">Группы заказов</b-dropdown-item>
                        <b-dropdown-item to="/report">Отчет</b-dropdown-item>
                    </b-nav-item-dropdown>

                    <b-nav-item-dropdown v-show="authenticated" text="Администрирование">
                        <b-dropdown-item to="/admin/roles">Роли</b-dropdown-item>
                        <b-dropdown-item to="/admin/org_groups">Группы организаций</b-dropdown-item>
                        <b-dropdown-item to="/admin/organizations">Список организаций</b-dropdown-item>
                        <b-dropdown-item to="/admin/providers">Поставщики</b-dropdown-item>
                        <b-dropdown-item to="/admin/users">Пользователи</b-dropdown-item>
                        <b-dropdown-item to="/admin/new_users">Новые пользователи</b-dropdown-item>
                        <b-dropdown-item to="/admin/system_properties">Системные свойства</b-dropdown-item>
                    </b-nav-item-dropdown>

                    <b-nav-item v-show="authenticated" to="/menu_reviews"><font-awesome-icon icon="meh-rolling-eyes"></font-awesome-icon> Отзывы о блюдах</b-nav-item>
                    <b-nav-item v-show="authenticated" to="/provider_reviews"><font-awesome-icon icon="star-half-alt"></font-awesome-icon> Отзывы о поставщике</b-nav-item>
                    
                </b-navbar-nav>

                <b-navbar-nav class="ml-auto">
                    <b-nav-item v-show="!authenticated" to="/sign_up"><font-awesome-icon icon="user-plus"></font-awesome-icon> Регистрация</b-nav-item>
                    <b-nav-item v-show="!authenticated" to="/sign_in"><font-awesome-icon icon="sign-in-alt"></font-awesome-icon> Вход</b-nav-item>
                    <b-nav-item v-show="authenticated" to="/settings"><font-awesome-icon icon="user-cog"></font-awesome-icon> Настройки</b-nav-item>
                    <b-nav-item v-show="authenticated" to="/logout"><font-awesome-icon icon="sign-out-alt"></font-awesome-icon> Выход</b-nav-item>
                </b-navbar-nav>
            </b-collapse>
        </b-navbar>
        <main>
            <div class="content" style="">
                <b-alert dismissible > sadfafsdf </b-alert>
                <router-view class="m10"></router-view>
            </div>
            <!-- Диалоговое окно -->
            <b-modal :cancel-title="messageDialog.cancelTitle" 
                     :ok-title="messageDialog.okTitle" 
                     :ok-only="messageDialog.okOnly" 
                     :title="messageDialog.title" 
                     v-model="messageDialog.isShowDialog"
                     @hide="messageDialog.hide">
                {{messageDialog.message}}
            </b-modal>
        </main>
    </div>`
})

export class App extends UI {

    @State('auth') authenticated: boolean;

    @State user: User;

    private async created(): Promise<void> {
        if (this.$cookies.get("token")) {
            this.$store.state.auth = true;
            this.$store.state.user = await this.rest.loadItem<User>("users/me");
        }
        if (!this.authenticated) {
            this.$router.push("/sign_in");
        }
    }

}