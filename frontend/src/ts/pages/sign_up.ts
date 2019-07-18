import Vue from "vue";
import Component from "vue-class-component";
import {Organization, User} from "../models/models";
import {RestService} from "../service/restService";
import Common from "../utils/common";

@Component({
// language=Vue
template: `
<div>
    <b-card title="Введите данные для регистрации" style="max-width: 500px; margin: 50px auto" class="mb-2" v-on:keyup.enter="reristerUser">
        <b-form>
            <b-form-group label="Введите логин" label-for="login">
                <b-form-input id="login" v-model="current.login" trim></b-form-input>
            </b-form-group>
            <b-form-group label="Выберите вашу организацию" label-for="org_id">
                <b-form-select v-model="current.org_id" :options="organizations" value-field="id" text-field="name"></b-form-select>
            </b-form-group>
            <b-form-group label="Введите номер телефона (10 цифр)" label-for="phone">
                <b-form-input id="phone" v-model="current.phone" type="number"></b-form-input>
            </b-form-group>
            <b-form-group label="Введите пароль" label-for="password">
                <b-form-input id="password" v-model="current.password"></b-form-input>
            </b-form-group>
        </b-form>
        <div slot="footer" class="alignR">
            <b-button @click="reristerUser" variant="success">Зарегистрироваться</b-button>
        </div>
    </b-card>
</div>
`
})
export class SignUp extends Vue {

    private current: User = this.initUser();

    private rest: RestService = new RestService(this);

    private organizations: Organization[] = [];

    private async created(): Promise<void> {
        if (this.$store.state.auth) {
            this.$router.push("/");
        }
    }

    private async mounted() {
        this.organizations = await this.rest.loadItems<Organization>("organizations");
    }

    private initUser(): User {
        return {
            login: "",
            org_id: "",
            phone: "",
            password: ""
        };
    }

    private async reristerUser() {
        const result = await this.$http.post("/sign_up", this.current);
        const data = <AuthData> result.data;
        if (data.auth) {
            await Common.messageDialog.showInfo("Регистрация прошла успешно!");
            this.$store.state.auth = true;
            this.$cookies.set("token", data.token, <any> {expires: "1d"});
            this.$router.push("/");
        } else {
            await Common.messageDialog.showWarning("Не удалось зарегистрироваться.");
        }
    }
}

type AuthData = {
    auth: boolean;
    token: string;
}
