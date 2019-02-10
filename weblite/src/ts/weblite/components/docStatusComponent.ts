import {Component, Prop, UI} from "platform/ui";
import {CommonUtils} from "platform/utils/commonUtils";
import {Document} from "../model/document";
import {Status} from "../model/status";

/**
 * Компонент для отображения статуса документа
 */
@Component({
    // language=Vue
    template: `
        <span class="docStatus" :style="{ color: '#' + document.status.color }">{{ statusText }}</span>
    `
})
export class DocStatusComponent extends UI {

    /** Документ */
    @Prop({required: true, type: Object})
    private document: Document;

    /**
     * Возвращает статус документа
     * @return статус документа
     */
    get statusText(): string {
        let statusText = this.document.status.name;
        if (Status.ON_SIGN === this.document.status && this.document.signsCount > 0 && !CommonUtils.isBlank(this.document.requiredSignsCount)) {
            statusText += " (" + this.document.signsCount + " из " + this.document.requiredSignsCount + ")";
            // проверяем был ли подтвержден документ
            if (this.document.confirmed) {
                // добавляем строчку с подтверждением
                statusText += ", подтверждение выполнено";
            }
        }
        return statusText;
    }
}