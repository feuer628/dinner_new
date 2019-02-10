import {CatchErrors} from "platform/decorators";
import {Inject} from "platform/ioc";
import {Component, UI} from "platform/ui";
import {ChatService} from "../service/chatService";

/**
 * Компонент для отображения и работы чата
 */
@Component({
    // language=Vue
    template: `
        <a v-if="showChatButton" @click="onChat" title="Чат" class="icon" :class="isChatOpen ? 'icon-chat-active active' : 'icon-chat'">
            <span class="message-badge" v-if="msgCount > 0">{{msgCountText}}</span>
        </a>
    `
})
export class Chat extends UI {

    /** Сервис по работе с чатом */
    @Inject
    private chatService: ChatService;

    /** Открыт ли виджет чата */
    private isChatOpen = false;

    /** Отображать ли кнопку чата */
    private showChatButton = false;

    /** Количество непрочитанных сообщений в чате */
    private msgCount = 0;

    /**
     * Инициализирует компонент чата
     * @inheritDoc
     * @return {Promise<void>}
     */
    @CatchErrors
    async created(): Promise<void> {
        const isChatAvailable = await this.chatService.isChatAvailable();
        if (isChatAvailable) {
            try {
                await this.chatService.injectChat(this.handleMessage);
                this.showChatButton = true;
            } catch (mute) {
            }
        }
    }

    /**
     * Обработчик события click на иконку чата
     * @returns {Promise<void>}
     */
    private async onChat(): Promise<void> {
        this.chatService.postMessage(this.isChatOpen ? "close" : "open");
    }

    /**
     * Обработчик входящих сообщений от виджета чата
     * @param event
     */
    private handleMessage(event: any): void {
        switch (event.type) {
            case "open":
                this.isChatOpen = true;
                break;
            case "close":
                this.isChatOpen = false;
                break;
            case "updateMsgCount":
                this.msgCount = event.msgCount;
                break;
        }
    }

    /** Получить количество непрочитанных сообщений */
    private get msgCountText(): string {
        return this.msgCount > 99 ? "99+" : String(this.msgCount);
    }
}