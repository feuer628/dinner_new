import Component from "vue-class-component";
import {User} from "../../models/models";
import {UI} from "../../components/ui";

@Component({
    // language=Vue
    template:
`
<div class="text-center">
    <h4>Пользователи</h4>
    <b-table striped :items="users" :fields="orderFields">
        <template slot="action" slot-scope="row">
            <b-button pill size="sm" variant="outline-primary"><font-awesome-icon icon="user-check"></font-awesome-icon> Подтвердить</b-button>
        </template>
    </b-table>
</div>
`
})
export class NewUsers extends UI {

    private users: User[] = [];

    private orderFields = {
        id: {
            label: "ID"
        },
        login: {
            label: "Логин"
        },
        status: {
            label: "Статус"
        },
        action: {
            label: ""
        }
    };

    /**
     * хук. загрузка необходимой информации
     */
    private async mounted(): Promise<void> {
        this.users = await this.rest.loadItems<User>("users/new");
    }
}