import Component from "vue-class-component";
import {UI} from "../../components/ui";

@Component({
// language=Vue
template: `
<div>
    <router-view></router-view>
</div>
`
})
export class Admin extends UI {
}