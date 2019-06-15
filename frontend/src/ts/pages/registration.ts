import Vue from "vue";
import Component from "vue-class-component";

@Component({
    // language=Vue
    template: `
        <div>
            <b-card
                    title="Введите данные для регистрации"
                    style="max-width: 20rem; margin: 50px"
                    class="mb-2"
            >
                <b-form>
                    <label for="email">Email</label>
                    <b-input type="password" id="email"></b-input>

                    <label for="password">Пароль</label>
                    <b-input type="password" id="password"></b-input>

                    <label for="password2">Подтвердите пароль</label>
                    <b-input type="password" id="password2"></b-input>
                </b-form>

                <b-button href="#" variant="primary">Go somewhere</b-button>
            </b-card>
           

        </div>`
})
export default class Registration extends Vue {


}
