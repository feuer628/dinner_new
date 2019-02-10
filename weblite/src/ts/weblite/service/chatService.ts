import {Service} from "platform/decorators/service";
import {Inject, Singleton} from "platform/ioc";
import {ClientService} from "./clientService";

/**
 * Сервис для работы с Чатом
 */
@Service("ChatService")
@Singleton
export class ChatService {
    /** Id IFrame с виджетом чата */
    private static readonly CHAT_WIDGET_ID = "chat-widget";

    /** Id скрипта загрузки чата */
    private static readonly CHAT_BOOTSTRAP_ID = "chat-bootstrap";

    /** Id элемента приложения */
    private static readonly APP_MAIN_ID = "app-main";

    /** Url до скрипта загрузки чата */
    private static readonly CHAT_BOOTSTRAP_URL = "/chat/chat-bootstrap.js";

    // TODO поменять 'ibank2'
    /** Url до ibank */
    private static readonly IBANK_URL = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/ibank2`;

    /** Сервис для работы с клиентом */
    @Inject
    private clientService: ClientService;

    /** IFrame чата */
    private chatIFrame: HTMLIFrameElement = null;

    /** Приложение */
    private main: HTMLElement = null;

    /** Элемент заголовка приложения */
    private header: HTMLElement = null;

    /**
     * Доступен ли сервис Чат
     * Проверяет на наличие лицензии, влючен ли сам сервис и заполнен ли url чата
     * @returns {Promise<boolean>} true, если сервис доступен
     */
    isChatAvailable(): boolean {
        const clientInfo = this.clientService.getClientInfo();
        return clientInfo.clientProperties["LICENSE.SERVICE.CHAT"] === "true" &&
            clientInfo.clientProperties["CHAT.SERVICE_ENABLE"] === "true" &&
            clientInfo.clientProperties["CHAT.URL"] !== null;
    }

    /**
     * Встроить скрипт на страницу ibank, загружающий widget чата
     * @param {(data: any) => void} handleMessageCb коллбек обработки входящих сообщений от виджета
     * @returns {Promise<boolean>} true, если скрипт успешно загружен, и виджет проинициализировался
     */
    async injectChat(handleMessageCb?: (data: any) => void): Promise<boolean> {
        let chatBootstrapScript = <HTMLScriptElement> document.getElementById(ChatService.CHAT_BOOTSTRAP_ID);
        if (chatBootstrapScript != null) {
            chatBootstrapScript.parentNode.removeChild(chatBootstrapScript);
        }

        const clientInfo = this.clientService.getClientInfo();
        const chatUrl = clientInfo.clientProperties["CHAT.URL"];

        chatBootstrapScript = <HTMLScriptElement> document.createElement("script");
        chatBootstrapScript.id = ChatService.CHAT_BOOTSTRAP_ID;
        chatBootstrapScript.type = "text/javascript";
        chatBootstrapScript.setAttribute("data-chat-url", chatUrl);
        chatBootstrapScript.setAttribute("data-ibank-url", ChatService.IBANK_URL);
        chatBootstrapScript.src = ChatService.IBANK_URL + ChatService.CHAT_BOOTSTRAP_URL;

        const scripts: any = document.getElementsByTagName("script")[0];
        scripts.parentNode.insertBefore(chatBootstrapScript, scripts);

        return new Promise<boolean>((resolve, reject) => {
            chatBootstrapScript.onload = () => {
                this.chatIFrame = <HTMLIFrameElement> document.getElementById(ChatService.CHAT_WIDGET_ID);
                this.main = document.getElementById(ChatService.APP_MAIN_ID);
                this.header = document.getElementsByTagName("header")[0];
                this.addListeners(handleMessageCb);
                resolve();
            };
            chatBootstrapScript.onerror = () => {
                reject();
            };
        });
    }

    /**
     * Отправить сообщение на виджет
     * Если происходит событии OPEN,
     * то высчитывается новое положение виджета чата относительно главного окна
     * @param {string} type тип события
     * @param payload полезная нагрузка
     */
    postMessage(type: string, payload?: any): void {
        if (type === "open") {
            this.horizontalAdjustment();
            this.chatIFrame.style.top = this.header.offsetHeight + "px";
            this.chatIFrame.style.height = `calc(100% - ${this.header.offsetHeight}px)`;
        }

        this.chatIFrame.contentWindow.postMessage({
            from: "ibank",
            type: type,
            payload: JSON.stringify(payload),
        }, ChatService.IBANK_URL);
    }

    /**
     * Добавление слушателей
     * 1. на изменение размера окна, для корректировки положения виджета
     * 2. на входящие сообщения от виджета
     * @param {(data: any) => void} handleMessageCb коллбек обработки входящих сообщений от виджета
     */
    private addListeners(handleMessageCb?: (data: any) => void): void {
        window.addEventListener("resize", () => {
            this.horizontalAdjustment();
        });

        window.addEventListener("message", (event) => {
            const data = event.data;
            if (data.from === "chat-widget") {
                handleMessageCb(data);
            }
        });
    }

    /**
     * Выравнивание положения IFrame чата по горизонтали относительно самого приложения
     */
    private horizontalAdjustment(): void {
        const rect = this.main.getBoundingClientRect();
        this.chatIFrame.style.right = (rect.left - 10) + "px";
    }
}
