import {Component, Emit, Prop, UI} from "platform/ui";
import {FileDropArea} from "../fileDropArea";
import {FileLink} from "../fileLink";
import {AttachmentItem, AttachWrapper} from "./attachmentItem";

@Component({
    // language=Vue
    template: `
        <div class="attachments">
            <file-drop-area @drop="onFileAdd" class="attachments-file-drop">
                <div class="attachments-file-drop__content">
                    Перетащите<br>
                    или <file-link @select="onFileAdd" multiple>загрузите</file-link> файл
                </div>
            </file-drop-area>
            <div class="attachments-hint">Максимальный размер вложений {{maxFileSize | formatBytes}}.</div>
            <div v-if="attachments.length">
                <div class="attachments__title">Прикрепленные документы</div>
                <template v-for="attachment in attachments">
                    <div class="attach">
                        <attachment-item :attachment="attachment"></attachment-item>
                        <a class="icon icon-close" @click="removeAttach(attachment)" title="Удалить"></a>
                    </div>
                </template>
            </div>
        </div>
    `,
    components: {AttachmentItem, FileDropArea, FileLink}
})
export class AttachmentEditor extends UI {

    /** Прикрепленные файлы */
    @Prop({required: true})
    private attachments: AttachWrapper[];

    /** Максимальный размер вложений */
    @Prop({required: true})
    private maxFileSize: number;

    /**
     * Событие при добавлении вложений
     * @param {FileList} fileList список файлов
     */
    @Emit("addFile")
    private onFileAdd(fileList: File[]): void {
    }

    /**
     * Событие при удалении вложения
     * @param {AttachWrapper} attach вложение
     */
    @Emit("removeAttach")
    private removeAttach(attach: AttachWrapper) {
    }
}