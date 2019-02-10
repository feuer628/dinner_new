/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "BIFIT" JSC, TIN 7719617469
 *       105203, Russia, Moscow, Nizhnyaya Pervomayskaya, 46
 * (c) "BIFIT" JSC, 2018
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       АО "БИФИТ", ИНН 7719617469
 *       105203, Россия, Москва, ул. Нижняя Первомайская, д. 46
 * (c) АО "БИФИТ", 2018
 */

import {Component, UI} from "platform/ui";
import {EventUtils} from "platform/utils/eventUtils";
import {FileUtils} from "platform/utils/fileUtils";

/**
 * Компонент загрузки файлов перетаскиванием
 */
@Component({
    // language=Vue
    template: `
        <div class="file-drop-area" :class="[{'drag-over': isDragOver}]">
            <slot></slot>
        </div>
    `
})
export class FileDropArea extends UI {

    /** Событие перетаскивания файлов в компонент */
    private static readonly DROP = "drop";

    /** Свойство dragover */
    private isDragOver = false;

    /**
     * Устанавливает обработчики на поле загрузки файла
     * @inheritDoc
     */
    mounted(): void {
        EventUtils.addEventListener(this.$el, "drag dragstart dragend dragover dragenter dragleave drop", (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
        });

        EventUtils.addEventListener(this.$el, "dragover dragenter", () => {
            this.isDragOver = true;
        });

        EventUtils.addEventListener(this.$el, "dragleave dragend drop", () => {
            this.isDragOver = false;
        });

        // обработка события drop. См. https://gitlab.com/meno/dropzone/blob/master/src/dropzone.js
        EventUtils.addEventListener(this.$el, "drop", (e: DragEvent) => {
            if (!e.dataTransfer) {
                return;
            }
            const filteredFiles: File[] = [];
            // Конвертируем FileList в File[] это необходимо для IE11
            const files: File[] = FileUtils.fileListToFileArray(e.dataTransfer.files);

            if (files.length) {
                const {items} = e.dataTransfer;
                if (items && items.length && (items[0].webkitGetAsEntry != null)) {
                    // для браузеров chrome и firefox и остальных
                    filteredFiles.push(...this.addFilesFromItems(items));
                } else {
                    // для IE
                    filteredFiles.push(...files);
                }
            }
            if (filteredFiles.length) {
                this.$emit(FileDropArea.DROP, filteredFiles);
            }
        });
    }

    /**
     * Обрабатывает и возвращает массив файлов
     * @param {DataTransferItemList} items
     * @return {File[]}
     */
    private addFilesFromItems(items: DataTransferItemList): File[] {
        const result: File[] = [];
        for (let i = 0; i < items.length; i++) { // tslint:disable-line
            const item = items[i];
            if (item.webkitGetAsEntry != null) {
                if (item.webkitGetAsEntry().isFile) {
                    result.push(item.getAsFile());
                }
            } else if (item.getAsFile != null) {
                if (((item as any).kind == null) || ((item as any).kind === "file")) {
                    result.push(item.getAsFile());
                }
            }
        }
        return result;
    }
}