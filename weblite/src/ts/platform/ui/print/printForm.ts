import {Component, UI} from "platform/ui";
import {PrintJob} from "../../services/printService";

/**
 * Форма для печати
 */
@Component({
    // language=Vue
    template: `
        <form ref="form" v-if="printJob"
              id="printForm"
              :action="printJob.formAction"
              method="POST"
              target="printFrame"
              style="{'display': 'none'}">
            <input v-for="(value, key) in printJob.params"
                   :name="key"
                   :value="value"
                   type="hidden"/>
        </form>
    `
})
export class PrintForm extends UI {

    $refs: {
        form: HTMLFormElement
    };

    /** Задание печати */
    private printJob: PrintJob;

    /**
     * Отправляет данные из формы
     * @param {PrintJob} printJob задание печати
     */
    submit(printJob: PrintJob): void {
        this.printJob = printJob;
        const workspace = document.body;
        const form = this.$mount().$el;
        workspace.appendChild(form);
        this.$refs.form.submit();
        this.$destroy();
        workspace.removeChild(form);
    }
}