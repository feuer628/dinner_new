import Component from "vue-class-component";
import {UI} from "../components/ui";

@Component({
    // language=Vue
    template: `
    <div id="app">

        <b-navbar toggleable="md" type="dark" variant="success">

            <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

            <b-navbar-brand to="menu">BIFIT_dinner</b-navbar-brand>

            <b-collapse is-nav id="nav_collapse">

                <b-navbar-nav>
                    <b-nav-item v-show="authenticated" to="menu"><font-awesome-icon icon="th-list"></font-awesome-icon> Меню</b-nav-item>
                    
                    <b-nav-item-dropdown v-show="authenticated" text="Обеды">
                        <b-dropdown-item to="uploadMenu">Загрузка меню</b-dropdown-item>
                        <b-dropdown-item to="orderGroup">Группы заказов</b-dropdown-item>
                        <b-dropdown-item to="report">Отчет</b-dropdown-item>
                    </b-nav-item-dropdown>

                    <b-nav-item-dropdown v-show="authenticated" text="Администрирование">
                        <b-dropdown-item to="roles">Роли</b-dropdown-item>
                        <b-dropdown-item to="org_groups">Группы организаций</b-dropdown-item>
                        <b-dropdown-item to="organizations">Список организаций</b-dropdown-item>
                        <b-dropdown-item to="providers">Поставщики</b-dropdown-item>
                        <b-dropdown-item to="users">Пользователи</b-dropdown-item>
                        <b-dropdown-item to="new_users">Новые пользователи</b-dropdown-item>
                        <b-dropdown-item to="system_properties">Системные свойства</b-dropdown-item>
                    </b-nav-item-dropdown>

                    <b-nav-item v-show="authenticated" to="menu_reviews"><font-awesome-icon icon="meh-rolling-eyes"></font-awesome-icon> Отзывы о блюдах</b-nav-item>
                    <b-nav-item v-show="authenticated" to="provider_reviews"><font-awesome-icon icon="star-half-alt"></font-awesome-icon> Отзывы о поставщике</b-nav-item>
                    
                </b-navbar-nav>

                <b-navbar-nav class="ml-auto">
                    <b-nav-item v-show="!authenticated" to="sign_up"><font-awesome-icon icon="user-plus"></font-awesome-icon> Регистрация</b-nav-item>
                    <b-nav-item v-show="!authenticated" to="sign_in"><font-awesome-icon icon="sign-in-alt"></font-awesome-icon> Вход</b-nav-item>
                    <b-nav-item v-show="authenticated" to="settings"><font-awesome-icon icon="user-cog"></font-awesome-icon> Настройки</b-nav-item>
                    <b-nav-item v-show="authenticated" to="logout"><font-awesome-icon icon="sign-out-alt"></font-awesome-icon> Выход</b-nav-item>
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

    private get authenticated() {
        return this.$store.state.auth;
    }

    private async created(): Promise<void> {
        this.$store.state.user = (await this.$http.get("/users/me")).data;
        this.$store.state.auth = true;
    }

}