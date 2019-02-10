import {Inject} from "platform/ioc";
import {Component, UI} from "platform/ui";
import {StringMap} from "types";
import {ClientService} from "weblite/service/clientService";
import {CatchErrors} from "../../decorators";
import {PrintJob} from "../../services/printService";
import {PrintForm} from "./printForm";

/**
 * Фрейм для печати
 */
export class PrintFrame {

    /**
     * Показывает диалог
     * todo: Promise этого метода никогда не выполняется если тип экспорта не HTML. Использовать этот метод только для HTML.
     * @param {PrintJob} printJob задание печати
     * @return {Promise<void>}
     */
    static async print(printJob: PrintJob): Promise<void> {
        await new XPrintFrame().print(printJob);
    }
}

/**
 * Фрейм для печати
 */
@Component({
    template: `
<iframe ref="frame" id="printFrame" name="printFrame" :style="getStyles()"></iframe>
`
})
class XPrintFrame extends UI {

    @Inject
    clientService: ClientService;

    $refs: {
        frame: HTMLIFrameElement;
    };

    /**
     * Показывает диалог
     * @param {PrintJob} printJob задание печати
     * @return {Promise<void>}
     */
    async print(printJob: PrintJob): Promise<void> {
        const printFrame = document.getElementById("printFrame");
        // удаление элемента после печати приводит к ошибке печати под FF. Удаляем фрейм перед вызовом печати.
        // в IE (метод remove не поддерживается) поэтому удаляем нативным способом
        if (printFrame && printFrame.parentNode) {
            printFrame.parentNode.removeChild(printFrame);
        }
        const workspace = document.body;
        const frame = this.$mount().$el;
        let onFrameLoad: EventListener = null;

        workspace.insertBefore(frame, workspace.firstChild);
        await new Promise<void>((resolve, reject) => {
            onFrameLoad = () => this.onFrameLoad(resolve, reject);
            frame.addEventListener("load", onFrameLoad);
            // отправляет данные на сервер
            new PrintForm().submit(printJob);
        });
        if (onFrameLoad) {
            // отписываемся от события загрузки ПФ в фрейме
            frame.removeEventListener("load", onFrameLoad);
        }
        this.$destroy();
    }

    /**
     * Событие вызываемое при загрузки фрейма
     * @param {() => void} resolve
     * @param {(error?: Error) => void} reject
     * @return {Promise<void>}
     */
    private async onFrameLoad(resolve: () => void, reject: (error?: Error) => void): Promise<void> {
        if (!this.$refs.frame.contentWindow.document.title || !this.$refs.frame.contentDocument.querySelectorAll("a[name*=JR_PAGE_ANCHOR]").length) {
            const errorWrapper = this.$refs.frame.contentWindow.document.getElementById("msg");
            reject(new Error(errorWrapper ? errorWrapper.innerText : "Внутренняя ошибка сервера"));
            return;
        }
        resolve();
    }

    /**
     * Возвращает объект со стилями фрейма
     * @return {StringMap} объект со стилями фрейма
     */
    private getStyles(): StringMap {
        /**
         * TODO В хроме 59 версии и браузерах на основе этой версии есть ошибка печати разметки таблиц, в результате возникает баг 106540
         * TODO см. https://bugs.chromium.org/p/chromium/issues/detail?id=735059
         * @return {boolean} {@code true} необходим хак, иначе {@code false}
         */
        if (this.clientService.browserInfo.name === "Chrome" && Number(this.clientService.browserInfo.version) >= 59) {
            return {
                width: "0",
                height: "0",
                visibility: "hidden",
                position: "absolute"
            };
        }
        return {
            display: "none"
        };
    }
}