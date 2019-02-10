import {Component, UI} from "platform/ui";
import {ModalContainer} from "platform/ui/modalContainer";
import {ErrorHandler} from "./errorHandler";
import {Navbar} from "./navbar/navbar";

@Component({
    // language=Vue
    template: `
        <div id="app-main">
            <navbar></navbar>
            <error-handler></error-handler>
            <keep-alive :include="cachedPages">
                <router-view></router-view>
            </keep-alive>
            <modal-container></modal-container>
        </div>
    `,
    components: {Navbar, ErrorHandler, ModalContainer}
})
export class AppFrame extends UI {

    /**
     * Названия кэшируемых компонентов (страниц). В качестве названия необходимо указывать либо имя файла компонента (это его name)
     * или название компонента если он зарегистрирован в uiRegistry через UI.component.
     * Необходимые действия выполняются в хуках activated и deactivated кешируемого компонента.
     * @type {string[]}
     */
    private cachedPages = ["EventsPage", "CounterpartiesPage"];
}