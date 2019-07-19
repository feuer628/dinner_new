import Component from "vue-class-component";
import {UI} from "./ui";

@Component({
// language=Vue
template: `
<div v-if="user">
    <div class="w800" style="display: inline-block; vertical-align: top;">
        <h4>Личные данные</h4>
        <b-form-group label-cols="4" label-cols-lg="3" label="Логин" label-for="login">
            <b-form-input id="login" v-model="user.login" disabled class="inline w400"></b-form-input>
        </b-form-group>
        <b-form-group label-cols="4" label-cols-lg="3" label="Пароль" label-for="login">
            <b-form-input id="password" v-model="user.password" type="password" :disabled="!editing.password" class="inline w400"></b-form-input>
            <b-button v-if="!editing.password" pill size="sm" variant="outline-warning" @click="editing.password = true">
                <font-awesome-icon icon="pen"></font-awesome-icon>
            </b-button>
            <b-button v-if="editing.password" pill size="sm" variant="outline-success" @click="edit('password')">
                <font-awesome-icon icon="check"></font-awesome-icon>
            </b-button>
        </b-form-group>
        <b-form-group label-cols="4" label-cols-lg="3" label="Номер телефона (10 цифр)" label-for="phone">
            <b-form-input id="phone" v-model="user.phone" type="number" :disabled="!editing.phone" class="inline w400"></b-form-input>
            <b-button v-if="!editing.phone" pill size="sm" variant="outline-warning" @click="editing.phone = true">
                <font-awesome-icon icon="pen"></font-awesome-icon>
            </b-button>
            <b-button v-if="editing.phone" pill size="sm" variant="outline-success" @click="edit('phone')">
                <font-awesome-icon icon="check"></font-awesome-icon>
            </b-button>
        </b-form-group>
        <b-form-group label-cols="4" label-cols-lg="3" label="Telegram ID" label-for="telegram_id">
            <b-form-input id="telegram_id" v-model="user.telegram_id" type="number" :disabled="!editing.telegram_id" class="inline w400"></b-form-input>
            <b-button v-if="!editing.telegram_id" pill size="sm" variant="outline-warning" @click="editing.telegram_id = true">
                <font-awesome-icon icon="pen"></font-awesome-icon>
            </b-button>
            <b-button v-if="editing.telegram_id" pill size="sm" variant="outline-success" @click="edit('telegram_id')">
                <font-awesome-icon icon="check"></font-awesome-icon>
            </b-button>
        </b-form-group>
        <b-form-group label-cols="4" label-cols-lg="3" label="Текст 'От кого'" label-for="from_text">
            <b-form-input id="from_text" v-model="user.from_text" :disabled="!editing.from_text" class="inline w400"></b-form-input>
            <b-button v-if="!editing.from_text" pill size="sm" variant="outline-warning" @click="editing.from_text = true">
                <font-awesome-icon icon="pen"></font-awesome-icon>
            </b-button>
            <b-button v-if="editing.from_text" pill size="sm" variant="outline-success" @click="edit('from_text')">
                <font-awesome-icon icon="check"></font-awesome-icon>
            </b-button>
        </b-form-group>
        <b-form-group label-cols="4" label-cols-lg="3" label="Статус учетной записи" label-for="status">
            <b-form-input id="status" v-model="user.status" disabled class="inline w400"></b-form-input>
        </b-form-group>
        <b-form-group label-cols="4" label-cols-lg="3" label="Ключ" label-for="key">
            <b-form-input id="key" v-model="user.key" disabled class="inline w400"></b-form-input>
        </b-form-group>
        <b-form-group label-cols="4" label-cols-lg="3" label="IP" label-for="ip">
            <b-form-input id="ip" v-model="user.ip" disabled class="inline w400"></b-form-input>
        </b-form-group>
        <b-form-group label-cols="4" label-cols-lg="3" label="Идентификатор компьютера" label-for="comp_key">
            <b-form-input id="comp_key" v-model="user.comp_key" disabled class="inline w400"></b-form-input>
        </b-form-group>
    </div>
    <div class="w800" style="display: inline-block; vertical-align: top;">
        <h4>Роль</h4>
        <b-form-group label-cols="4" label-cols-lg="3" label="Ваша роль" label-for="role">
            <b-form-input id="role" v-model="user.role.name" disabled class="inline w300"></b-form-input>
        </b-form-group>
        <template v-if="user.role.actions.length">
            <h5>Права доступа</h5>
            <b-list-group flush>
                <b-list-group-item v-for="action in user.role.actions" :key="action.id"><font-awesome-icon icon="check"></font-awesome-icon> {{action.desc}}</b-list-group-item>
            </b-list-group>
        </template>
    </div>
</div>
`
})
export class Settings extends UI {

    private editing = {
        password: false,
        phone: false,
        telegram_id: false,
        from_text: false
    };

    private get user() {
        return this.$store.state.user;
    }

    private async edit(type: "password" | "phone" | "telegram_id" | "from_text") {
        const param: EditableFields = {};
        param[type] = this.user[type];
        await this.$http.put(`/users/me`, param);
        this.editing[type] = false;
    }
}

type EditableFields = {
    password?: string;
    phone?: string;
    telegram_id?: string;
    from_text?: string;
}