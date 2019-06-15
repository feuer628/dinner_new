import Vue from "vue";
import Component from "vue-class-component";

@Component({
    // language=Vue
    template: `
        <div>
            <b-card
                    title="Авторизация"
                    style="max-width: 300px; margin: 50px auto"
                    class="mb-2"
            >
                <b-form>
                    <label for="email" style="margin: 5px 0 0 0">Email</label>
                    <b-form-input id="email" placeholder="Введите email" 
                                  required type="email"></b-form-input>

                    <label for="password" style="margin: 5px 0 0 0">Пароль</label>
                    <b-form-input id="password" placeholder="Введите пароль" 
                                  required type="password"></b-form-input>
                    
                    <b-button type="submit" variant="primary" style="margin-top: 10px" >Войти</b-button>
                    <b-link to="/registration" style="float: right; margin-top: 10px">Регистрация</b-link>
                </b-form>
            </b-card>
           

        </div>`
})
export default class Registration extends Vue {


}
