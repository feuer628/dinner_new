import {CatchErrors} from "platform/decorators";
import {Inject} from "platform/ioc";
import {PrintService} from "platform/services/printService";
import {Component, UI} from "platform/ui";
import {AttachmentViewer} from "../../components/attach/attachmentViewer";
import {MessageComponent} from "../../components/message/messageComponent";
import {LetterNotifier} from "../../components/navbar/letterNotifier";
import {DocumentPrintHelper} from "../../components/print/documentPrintHelper";
import {TemplatePage} from "../../components/templatePage";
import {Document, DocumentType} from "../../model/document";
import {Letter, LetterType} from "../../model/letter";
import {MailBox} from "../../model/mailBox";
import {Status} from "../../model/status";
import {ClientService} from "../../service/clientService";
import {DocumentService} from "../../service/documentService";
import {References, ReferenceService} from "../../service/referenceService";

@Component({
    // language=Vue
    template: `
        <template-page>
            <template slot="main">
                <template v-if="initialized">
                    <div class="app-content__inner">
                        <div class="form-row page-header">
                            <span class="title">{{letterTypeText[letterType]}}</span>
                            <div class="form-row">
                                <span>{{ c.DATE_DOC | displayDateWithYear }}</span>
                                <div class="btn-group">
                                    <div class="btn icon icon-print" title="Распечатать" @click="print"></div>
                                    <div class="btn icon icon-delete" title="Удалить" v-if="'inbox' === letterType && !isImportant"
                                       @click="$refs.confirmMessage.show()"></div>
                                </div>
                            </div>
                        </div>
                        <div class="margL16">
                            <template v-if="'inbox' === letterType">
                                <div class="letter-label">Отправитель</div>
                                <div class="margB35">{{getLabelFor(c.SENDER)}}</div>
                            </template>
                            <template v-else-if="'outbox' === letterType">
                                <div class="letter-label">Получатель</div>
                                <div class="margB35">{{getLabelFor(c.RECIPIENT)}}</div>
                            </template>
                            <div class="letter-label">Тема</div>
                            <div :class="[{'important-message': isImportant}, 'breakWord']">{{c.SUBJ_LETTER}}</div>
                        </div>
                        <div class="letter-body">{{c.LETTER_BODY}}</div>
                        <div class="app-content-inner__footer">
                            <template v-if="'inbox' === letterType">
                                <a class="btn btn-primary" @click="goToAction('reply')">Ответить</a>
                                <a class="btn" @click="goToLetterList()">Назад</a>
                            </template>
                            <template v-else-if="'outbox' === letterType">
                                <a class="btn btn-primary" @click="goToAction('copy')">Копировать</a>
                                <a class="btn" @click="goToLetterList()">Назад</a>
                            </template>
                        </div>
                    </div>
                    <message ref="confirmMessage">
                        <span>Удалить письмо без возможности восстановления?</span>
                        <div class="notify__links">
                            <a @click="remove">Удалить</a>
                            <a @click="$refs.confirmMessage.close()">Отмена</a>
                        </div>
                    </message>
                </template>
                <spinner v-else></spinner>
            </template>
            <template slot="sidebar-top">
                <attachment-viewer v-if="initialized" :document="document"></attachment-viewer>
            </template>
        </template-page>
    `,
    components: {TemplatePage, AttachmentViewer}
})
export class LetterViewPage extends UI {

    $refs: {
        /** Диалог подтверждения удаления письма */
        confirmMessage: MessageComponent
    };

    /** Текст по типу письма */
    private letterTypeText = {
        [LetterType.INBOX]: "Входящее письмо", [LetterType.OUTBOX]: "Исходящее письмо"
    };

    /** Сервис по работе с информацией о клиенте */
    @Inject
    private clientService: ClientService;

    /** Сервис по работе с документами */
    @Inject
    private documentService: DocumentService;

    /** Сервис по работе с печатью */
    @Inject
    private printService: PrintService;

    /** Сервис по работе со справочниками */
    @Inject
    private referenceServise: ReferenceService;

    /** Документ письма */
    private document: Document = null;

    /** Тип письма */
    private letterType: LetterType = null;

    /** Почтовые ящики */
    private mailBoxes: MailBox[] = [];

    /** Признак инициализации компонента */
    private initialized = false;

    /**
     * Загрузить письмо в зависимости от его типа
     * @inheritDoc
     * @returns {Promise<void>}
     */
    @CatchErrors
    async created(): Promise<void> {
        this.letterType = <LetterType> this.$route.params.folder;
        const letter = await this.documentService.load(DocumentType.LETTER, this.$route.params.id);
        if (!this.checkRoute(letter)) {
            throw new Error("Просмотр письма невозможен");
        }
        this.document = letter;
        this.mailBoxes = await this.referenceServise.getReference<MailBox>(References.MAILBOX);
        if (LetterType.INBOX === this.letterType) {
            await this.setRead();
        }
        this.initialized = true;
    }

    /**
     * Отметить письмо как прочитанное
     */
    @CatchErrors
    private async setRead(): Promise<void> {
        await this.documentService.setRead(DocumentType.LETTER, this.document.id, true);
        UI.emit(LetterNotifier.UPDATE_LETTER_COUNT_EVENT);
    }

    /**
     * Удалить письмо
     */
    @CatchErrors
    private async remove(): Promise<void> {
        await this.documentService.remove(DocumentType.LETTER, this.document.id);
        this.goToLetterList();
    }

    /**
     * Распечатать письмо
     */
    @CatchErrors
    private async print(): Promise<void> {
        await this.printService.print(new DocumentPrintHelper([{
            id: this.document.id,
            docType: "doc/letter"
        }], this.letterType));
    }

    /**
     * Перейти к действию над документом
     * @param {string} action действие
     */
    private goToAction(action: string) {
        this.$router.push({name: "letterEdit", params: {id: this.document.id, action: action}});
    }

    /**
     * Перейти на список писем
     */
    private goToLetterList(): void {
        this.$router.push({name: "letterList", params: {folder: this.$route.params.folder}});
    }

    /**
     * Получает наименование отправителя/получателя вместе с почтовым ящиком (если он есть)
     * @param {string} name наименование отправителя/получателя
     * @returns {string} наименование отправителя/получателя вместе с почтовым ящиком
     */
    private getLabelFor(name: string) {
        const mailBox = this.mailBoxes.find(item => item.id === this.c.MAILBOX_ID);
        return name + (mailBox ? `; ${mailBox.name}` : "");
    }

    /**
     * Проверка корректности URL
     */
    private checkRoute(letter: Document): boolean {
        const clientId = this.clientService.getClientInfo().clientInfo.id;
        // Проверка входящего письма
        if (LetterType.INBOX === this.letterType && letter.ownerId !== clientId) {
            return true;
        }
        // Проверка исходящего письма
        if (LetterType.OUTBOX === this.letterType && letter.ownerId === clientId) {
            return true;
        }
        return false;
    }

    /**
     * Признак важного документа
     */
    private get isImportant(): boolean {
        return this.c.IMPORTANCE === "2";
    }

    /**
     * Возвратить контент документа
     * @returns {DocumentContent} контент документа
     */
    private get c() {
        return this.document.content;
    }
}