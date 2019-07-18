import Vue from "vue";
import Component from "vue-class-component";

@Component({
// language=Vue
template: `<div><h3>Выход вышли из учетной записи</h3></div>`
})
export class Logout extends Vue {

    private async created(): Promise<void> {
        if (this.$store.state.auth) {
            Vue.cookies.remove("token");
            this.$store.state.auth = false;
        }
        this.$router.push("/sign_in");
    }
}