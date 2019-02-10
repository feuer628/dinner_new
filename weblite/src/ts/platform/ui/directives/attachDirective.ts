import {CatchErrors} from "decorators";
import {Container} from "platform/ioc";
import {ClientService} from "../../../weblite/service/clientService";

/**
 * Директива для загрузки вложений
 */
export class AttachDirective implements DirectiveOptions {

    /** Имя директивы */
    static readonly NAME = "attach";

    /**
     * Выполняет загрузку вложения для браузера Internet Explorer
     * @param {string} url адресс вложения
     * @param {string} method метод запроса
     * @param {string} name название вложения
     */
    @CatchErrors
    static async saveFileForIe(url: string, method: string, name: string): Promise<void> {
        const response = await fetch(url, {
            method: method,
            credentials: "same-origin",
        });
        window.navigator.msSaveOrOpenBlob(await response.blob(), name);
    }

    /**
     * Определить браузер пользователя и обработать загрузку вложения
     * @param {HTMLElement} el          html элемент
     * @param {VNodeDirective} binding  контекст связывания
     */
    bind(el: HTMLElement, binding: VNodeDirective): void {
        if (Container.get(ClientService).browserInfo.name === "MSIE") {
            el.addEventListener("click", async () => {
                await AttachDirective.saveFileForIe(binding.value.url, binding.value.method, binding.value.name);
            });
        } else {
            el.setAttribute("href", binding.value.url);
            el.setAttribute("download", binding.value.name);
        }
    }
}