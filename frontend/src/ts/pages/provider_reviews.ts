import Component from "vue-class-component";
import {User} from "../models/models";
import {UI} from "../components/ui";

@Component({
    // language=Vue
    template:
`
<div class="text-center">
    <h4>Еще не готово. Ждите</h4>
</div>
`
})
export class ProviderReviews extends UI {

    private async mounted(): Promise<void> {
    }
}