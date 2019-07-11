import Vue from "vue";
import axios from 'axios'
import MessageDialog from '../components/dialogs/messageDialog';
import Component from "vue-class-component";
import Common from "../utils/common";

@Component({
    // language=Vue
    template: `
    <div id="app">

        <b-navbar toggleable="md" type="dark" variant="info">

            <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

            <b-navbar-brand href="#">NavBar</b-navbar-brand>

            <b-collapse is-nav id="nav_collapse">

                <b-navbar-nav>
                    <b-nav-item to="roles">Роли</b-nav-item>
                    
                    <b-nav-item to="organizations">Организации</b-nav-item>
                    <b-nav-item to="orderGroup">Группы заказов</b-nav-item>
                    <b-nav-item to="report">Отчет</b-nav-item>
                    <b-nav-item to="order">Заказать</b-nav-item>
                    <b-nav-item to="menu">Меню</b-nav-item>
                    <b-nav-item to="users">Пользователи</b-nav-item>
                    <b-nav-item to="newUsers">Новые пользователи</b-nav-item>
                    <b-nav-item to="sysProps">Системные свойства</b-nav-item>
                    <b-nav-item to="registration">Регистрация</b-nav-item>
                    <!--TODO вынести как отдельную страницу после которой будет открываться текущая-->
                    <b-nav-item to="authorization">Авторизация</b-nav-item>
                </b-navbar-nav>

                <!-- Right aligned nav items -->
                <b-navbar-nav class="ml-auto">

                    <b-nav-form>
                        <b-form-input size="sm" class="mr-sm-2" type="text" placeholder="Search"/>
                        <b-button size="sm" @click="getAllPosts()" class="my-2 my-sm-0">Search</b-button>
                    </b-nav-form>


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
                <router-view></router-view>
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
        console.log("asdad");
        axios.get("http://localhost/api/reverser/jsonbasedreverser")
            .then((response: any) => {
                console.log(response);
            })
            .catch(async (error: any) => {
                console.log('-----error-------');
                console.log(error);
                await this.messageDialog.showError("Внутренняя ошибка сервера.");
            })
    }
}