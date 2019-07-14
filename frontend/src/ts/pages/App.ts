import Vue from "vue";
import MessageDialog from '../components/dialogs/messageDialog';
import Component from "vue-class-component";
import Common from "../utils/common";

@Component({
    // language=Vue
    template: `
    <div id="app">

        <b-navbar toggleable="md" type="dark" variant="success">

            <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

            <b-navbar-brand href="/">BIFIT_dinner</b-navbar-brand>

            <b-collapse is-nav id="nav_collapse">

                <b-navbar-nav>
                    <b-nav-item to="menu">Меню</b-nav-item>
                    
                    <b-nav-item-dropdown text="Обеды">
                        <b-nav-item to="orderGroup">Группы заказов</b-nav-item>
                        <b-nav-item to="report">Отчет</b-nav-item>
                    </b-nav-item-dropdown>
                    
                    <b-nav-item-dropdown text="Администрирование">
                        <b-dropdown-item href="#/roles">Роли</b-dropdown-item>
                        <b-dropdown-item href="#/organizations">Организации</b-dropdown-item>
                        <b-dropdown-item href="#/users">Пользователи</b-dropdown-item>
                        <b-dropdown-item href="#/newUsers">Новые пользователи</b-dropdown-item>
                        <b-dropdown-item href="#/sysProps">Системные свойства</b-dropdown-item>
                    </b-nav-item-dropdown>

                    <b-nav-item to="registration">Регистрация</b-nav-item>
                    <!-- TODO вынести как отдельную страницу после которой будет открываться текущая -->
                    <b-nav-item to="authorization">Авторизация</b-nav-item>
                </b-navbar-nav>

                <!-- Right aligned nav items -->
                <b-navbar-nav class="ml-auto">
                    <b-nav-item-dropdown right>
                        <!-- Using button-content slot -->
                        <template slot="button-content">
                            <em>Пользователь</em>
                        </template>
                        <b-dropdown-item href="settings">Настройки</b-dropdown-item>
                        <b-dropdown-item href="#">Выход</b-dropdown-item>
                    </b-nav-item-dropdown>
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
                     @hide="messageDialog.hide"
            >
                {{messageDialog.message}}
            </b-modal>
        </main>
    </div>`
})

export class App extends Vue {
    endpoint: string = 'https://jsonplaceholder.typicode.com/posts/';
    posts: any[] = [];
    messageDialog: MessageDialog = Common.getMessageDialog();

    getAllPosts() {
        try {
            const response = this.$http.get("/api/reverser/jsonbasedreverser");
            console.log(response);
        } catch (error) {
            console.log('-----error-------');
            console.log(error);
            this.messageDialog.showError("Внутренняя ошибка сервера.");
        }
    }
}