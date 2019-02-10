import {Component, Prop, UI} from "platform/ui";
import {StringMap} from "../../../platform/types";

@Component({
    // language=Vue
    template: `
        <div :class="['', getFileIcon(attachment.name)]" :title="attachment.name">
            <span class="attach__name">{{getShortName(attachment.name)}}</span>
            <span>.{{getFileExtension(attachment.name)}}</span>
        </div>
    `
})
export class AttachmentItem extends UI {

    /** Карта расширений файла с иконками */
    private static ICON_MAP: StringMap = {
        pdf: "icon-pdf"
    };

    /** Вложение */
    @Prop({required: true})
    private attachment: AttachWrapper;

    /**
     * Получить класс иконки
     * @param {string} fileName название файла
     * @returns {string} класс иконки
     */
    private getFileIcon(fileName: string): string {
        return AttachmentItem.ICON_MAP[this.getFileExtension(fileName)] || "icon-file";
    }

    /**
     * Получить название файла без расширения
     * @param {string} fileName название файла
     * @returns {string} название файла без расширения
     */
    private getShortName(fileName: string) {
        const dotIndex = fileName.lastIndexOf(".");
        return dotIndex !== -1 ? fileName.substr(0, fileName.lastIndexOf(".")) : fileName;
    }

    /**
     * Получить расширение файла
     * @param {string} fileName
     * @returns {string}
     */
    private getFileExtension(fileName: string) {
        const dotIndex = fileName.lastIndexOf(".");
        return dotIndex !== -1 ? fileName.substr(fileName.lastIndexOf(".") + 1) : null;
    }
}

/**
 * Класс вложения
 */
export class AttachWrapper {
    constructor(public id: string = null,
                public outId: number = null,
                public name: string = null,
                public size: number = null,
                public file: File = null) {
    }
}