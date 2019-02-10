import {Letter, LetterType} from "model/letter";
import {CatchErrors} from "platform/decorators";
import {Inject} from "platform/ioc";
import {Http} from "platform/services/http";
import {Component, Prop, UI} from "platform/ui";

/**
 * Компонент отображения строки с информацией по письму.
 */
@Component({
    // language=Vue
    template: `
        <!-- Жирным шрифтом выделяются только новые письма в папке Входящие -->
        <div class="letters-table__row" :class="{ 'bold' : !letter.read && !clientLetter }" @click="goToLetterView">
            <div class="letters-table__cell" @click.stop>
                <x-checkbox @input="onLetterSelected"></x-checkbox>
            </div>
            <!-- Признак избранного письма -->
            <div class="letters-table__cell" v-if="!clientLetter" @click.stop>
                <span class="icon icon-star" :class="{ 'marked': letter.marked }" @click="toggleMarked"></span>
            </div>
            <!-- Отправитель/Получатель -->
            <div class="letters-table__cell recipient-cell" :title="clientLetter ? letter.recipient : letter.sender">
                {{ clientLetter ? letter.recipient : letter.sender }}
            </div>
            <!-- Признак важного письма -->
            <div class="letters-table__cell">
                <span v-if="letter.important" class="icon icon-important"></span>
            </div>
            <!-- Тема -->
            <div class="letters-table__cell w100pc maxW0" :title="letter.subject">
                {{ letter.subject }}
            </div>
            <!-- Иконка вложения -->
            <div class="letters-table__cell">
                <span v-if="letter.hasAttachments" class="icon icon-paperclip"></span>
            </div>
            <!-- Дата -->
            <div class="letters-table__cell">
                {{ letter.date | displayDateWithYear }}
            </div>
        </div>
    `
})
export class LetterListItem extends UI {

    @Inject
    private http: Http;

    /** Отображаемое письмо */
    @Prop({required: true})
    private letter: Letter;

    /** Признак клиентского письма. Отображается колонка Получатель, вместо Отправитель */
    @Prop({default: false})
    private clientLetter: boolean;

    /**
     * Проставляет пометку письма
     * @return {Promise<void>}
     */
    @CatchErrors
    private async toggleMarked(): Promise<void> {
        await this.http.post<any>(`/ibank2/protected/services/docs/letter/${this.letter.id}/mark`, (!this.letter.marked).toString());
        this.letter.marked = !this.letter.marked;
    }

    /**
     * Обрабатывает выделение письма в списке
     * @param {boolean} checked
     */
    private onLetterSelected(checked: boolean): void {
        this.$emit("select", {selectedLetter: this.letter, checked: checked});
    }

    /**
     * Перейти на страницу просмотра письма если это Входящее или Исходящее письмо или на страницу создания письма из черновика
     */
    private goToLetterView(): void {
        if (this.letter.type === LetterType.DRAFT) {
            this.$router.push({name: "letterEdit", params: {id: this.letter.id, action: "edit"}});
        } else {
            this.$router.push({name: "letterView", params: {id: this.letter.id, folder: this.letter.type}});
        }
    }
}
