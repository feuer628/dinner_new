import {Inject} from "platform/ioc";
import {Component, Prop, UI} from "platform/ui";
import {DocumentType} from "../../model/document";
import {DocumentService} from "../../service/documentService";

/**
 * Компонент со счетчиком непрочитанных писем
 */
@Component({
    // language=Vue
    template: `
        <div>
            <router-link :to="routeTo" title="Письма" class="icon icon-message" active-class="icon-message-active active">
                <span class="message-badge" v-if="letterCount > 0">{{letterCountText}}</span>
            </router-link>
        </div>
    `
})
export class LetterNotifier extends UI {
    /** Событие обновления количества непрочитанных писем */
    static UPDATE_LETTER_COUNT_EVENT = "UPDATE_LETTER_COUNT";

    /** Интервал с которым обновлятся количесво непрочитанных писем */
    private static UPDATE_INTERVAL = 60000;

    /** Сервис работы с документами */
    @Inject
    private documentService: DocumentService;

    /** Свойсво для перехода по ссылке */
    @Prop({required: true})
    private routeTo: string;

    /** Количество непрочитанных писем */
    private letterCount = 0;

    /**
     * Подписывается на событие обновления счетчика непрочитанных писем
     * @inheritDoc
     */
    created(): void {
        UI.on(LetterNotifier.UPDATE_LETTER_COUNT_EVENT, () => this.updateLettersCount());
        this.letterCountTask();
    }

    /** Получить количество непрочитанных писем */
    private get letterCountText(): string {
        return this.letterCount > 99 ? "99+" : String(this.letterCount);
    }

    /** Задача обновляющая количество непрочитанных писем */
    private letterCountTask(): void {
        this.updateLettersCount();
        setTimeout(() => this.letterCountTask(), LetterNotifier.UPDATE_INTERVAL);
    }

    /** Обновить количество непрочитанных писем */
    private async updateLettersCount(): Promise<void> {
        this.letterCount = await this.documentService.getUnprocessedCount(DocumentType.LETTER);
    }
}