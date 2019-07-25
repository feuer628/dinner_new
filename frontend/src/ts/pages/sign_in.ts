import Component from "vue-class-component";
import Common from "../utils/common";
import {UI} from "../components/ui";

@Component({
// language=Vue
template: `
<div>
    <b-card title="Вход" style="max-width: 300px; margin: 50px auto" v-on:keyup.enter="login">
        <b-form>
            <b-form-group label="Введите логин" label-for="login">
                <b-form-input id="login" v-model="credentials.login" trim></b-form-input>
            </b-form-group>
            <b-form-group label="Введите пароль" label-for="password">
                <b-form-input id="password" v-model="credentials.password"></b-form-input>
            </b-form-group>
        </b-form>
        <div slot="footer" class="alignR">
            <b-link to="/sign_up">Регистрация</b-link>
            <b-button @click="login" type="submit" variant="primary">Войти</b-button>
        </div>
    </b-card>
</div>
`
})
export class SignIn extends UI {

    private credentials: Credentials = {login: "", password: ""};

    private async created(): Promise<void> {
        if (this.$store.state.auth) {
            this.$router.push("/");
        }
    }

    private async login(): Promise<void> {
        try {
            const response = await this.$http.post("/sign_in", this.credentials);
            this.$store.state.auth = true;
            this.$cookies.set("token", response.data.token, <any>{expires: "1d"});
            this.$forceUpdate();
            this.$router.push("/");
        } catch (e) {
            if (e.status === 404) {
                await Common.messageDialog.showWarning(e.body);
                return;
            }
            await Common.messageDialog.showWarning("Неправильный логин или пароль.");
        }
    }
}

type Credentials = {
    login: string;
    password: string;
}