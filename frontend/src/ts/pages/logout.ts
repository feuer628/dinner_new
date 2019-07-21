import Component from "vue-class-component";
import {UI} from "../components/ui";

@Component({
// language=Vue
template: `<div><h3>Выход вышли из учетной записи</h3></div>`
})
export class Logout extends UI {

    private async created(): Promise<void> {
        if (this.$store.state.auth) {
            UI.cookies.remove("token");
            this.$store.state.auth = false;
        }
        this.$router.push("/sign_in");
    }
}