import {Inject} from "platform/ioc";
import {Component, Prop, UI} from "platform/ui";
import {Attachment, Document, DocumentType} from "../../model/document";
import {DocumentService} from "../../service/documentService";
import {AttachmentItem, AttachWrapper} from "./attachmentItem";

@Component({
    // language=Vue
    template: `
        <div class="attachments" v-if="attachments.length">
            <div class="attachments__title">Прикрепленные документы</div>
            <template v-for="attachment in attachments">
                <a class="link attach" v-attach="{url: getUrl(attachment), method: 'GET', name: attachment.name}">
                    <attachment-item :attachment="attachment"></attachment-item>
                </a>
            </template>
        </div>
    `,
    components: {AttachmentItem}
})
export class AttachmentViewer extends UI {

    /** Сервис по работе с документами */
    @Inject
    private documentService: DocumentService;

    /** Вложения */
    private attachments: AttachWrapper[] = [];

    /** Документ письма */
    @Prop({required: true})
    private document: Document;

    /**
     * Подготавливает список вложений для отображения
     * @inheritDoc
     */
    created(): void {
        if (this.document.attachments) {
            this.attachments = this.document.attachments.map((attach: Attachment) => {
                return new AttachWrapper(attach.id, null, attach.name);
            });
        }
    }

    /**
     * Получить url вложения
     * @param {Attachment} attachment вложение
     * @returns {string}              адрес вложения
     */
    private getUrl(attachment: Attachment): string {
        return this.documentService.getAttachmentUrl(DocumentType.LETTER, this.document.id, attachment.id);
    }
}