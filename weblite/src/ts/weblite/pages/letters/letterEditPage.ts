import {CatchErrors} from "platform/decorators";
import {Inject} from "platform/ioc";
import {FormatterOptions, StringMap} from "platform/types";
import {Component, UI, Watch} from "platform/ui";
import {FormatterFactory} from "platform/ui/formatters/formatterFactory";
import {ModalContainer} from "platform/ui/modalContainer";
import {XTextField} from "platform/ui/xTextField";
import {AttachmentValidator} from "platform/utils/attachmentValidator";
import {CommonUtils} from "platform/utils/commonUtils";
import {DocumentAction} from "../../common/documentAction";
import {DocumentUtils} from "../../common/documentUtils";
import {AttachmentEditor} from "../../components/attach/attachmentEditor";
import {AttachWrapper} from "../../components/attach/attachmentItem";
import {ConfirmDialog} from "../../components/dialogs/confirmDialog";
import {DocumentSuccessSendDialog} from "../../components/dialogs/documentSuccessSendDialog";
import {TemplatePage} from "../../components/templatePage";
import {BankInfo} from "../../model/bankInfo";
import {BtnReturn} from "../../model/btnReturn";
import {ClientInfo} from "../../model/clientInfo";
import {Attachment, Document, DocumentContent, DocumentMeta, DocumentType, FieldInfoMap} from "../../model/document";
import {LetterType} from "../../model/letter";
import {MailBox, MailBoxStatus} from "../../model/mailBox";
import {ValidationResult} from "../../model/validationResult";
import {ClientService} from "../../service/clientService";
import {DateTimeService} from "../../service/dateTimeService";
import {DocumentService} from "../../service/documentService";
import {References, ReferenceService} from "../../service/referenceService";
import {SignatureService} from "../../service/signatureService";
import {ValidationUtils} from "../../utils/validationUtils";

/**
 * Компонент создания нового письма.
 */
@Component({
    // language=Vue
    template: `
        <template-page>
            <template slot="main">
                <spinner v-if="showSpinner"/>
                <!-- TODO: Верстка -->
                <div v-if="errorMessage" style="display: flex; flex-direction: column; align-items: center;">
                    <span class="error" style="margin-bottom: 30px; font-size: 24px;">{{errorMessage}}</span>
                    <button class="btn" @click="update">Повторить</button>
                </div>
                <div v-else-if="isInitialized">
                    <div class="app-content__inner">
                        <div v-if="action==='NEW'" class="page-header form-row">
                            <span class="title">Новое письмо</span>
                        </div>
                        <div class="form-row">
                            <v-select v-model="selectedBankWithMailBox" :options="bankWithMailBoxes" title="Получатель"
                                      :filterable="false" :searchable="false" label="name"
                                      :disabled="bankWithMailBoxes.length === 1" class="full"/>
                        </div>
                        <div class="form-row">
                            <x-textfield ref="letterSubject" name="SUBJ_LETTER" v-validate="'required'" v-model="c.SUBJ_LETTER" title="Тема"
                                         :format="f.SUBJ_LETTER"
                                         :validation-result="getValidationResult('SUBJ_LETTER')" class="full"></x-textfield>
                        </div>
                        <div class="form-row">
                            <x-textarea name="LETTER_BODY" v-validate="'required'" v-model="c.LETTER_BODY"
                                        :validation-result="getValidationResult('LETTER_BODY')" :counter="true" :maxlength="maxLetterBodyLength"
                                        class="full letter-textarea"></x-textarea>
                        </div>
                        <div class="app-content-inner__footer">
                            <div>
                                <a class="btn btn-primary" @click="onSend">Отправить</a>
                                <a class="btn" @click="onSaveDraft">Сохранить черновик</a>
                            </div>
                            <a class="btn" @click="goToBack">Отмена</a>
                        </div>
                    </div>
                </div>
            </template>
            <template slot="sidebar-top">
                <attachment-editor v-if="isInitialized" name="attachments" :attachments="attachments" @addFile="onAddFile"
                                   @removeAttach="onRemoveAttach" :maxFileSize="maxAttachFileSize"/>
            </template>
        </template-page>
    `,
    components: {TemplatePage, AttachmentEditor}
})
export class LetterEditPage extends UI {

    /** Ссылки на дочерние компоненты */
    $refs: {
        /** Поле с темой письма */
        letterSubject: XTextField
    };
    /** Сервис по работе с документами */
    @Inject
    private documentService: DocumentService;
    /** Сервис по работе с клиентом */
    @Inject
    private clientService: ClientService;
    /** Сервис по работе с справочниками */
    @Inject
    private referenceService: ReferenceService;
    /** Сервис для получения текущего времени */
    @Inject
    private dateTimeService: DateTimeService;
    /** Сервис по работе с подписями */
    @Inject
    private signatureService: SignatureService;
    /** Документ письма */
    private document: Document = null;
    /** Тип действия над документом */
    private action: DocumentAction = null;
    /** Идентификатор письма */
    private docId: string;
    /** Вложения */
    private attachments: AttachWrapper[] = [];
    /** Вложения для удаления на сервере */
    private attachmentsToRemoveIds: string[] = [];
    /** Свойство инициализация редактора */
    private isInitialized = false;
    /** Свойство отображения диалога с подтверждением о сохранения письма */
    private needToConfirmLeave = true;
    /** Максимальный размер вложений */
    private maxAttachFileSize: number = null;
    /** Выбранный банк */
    private selectedBankWithMailBox: BankWithMailBox = null;
    /** Банки с почтовыми ящиками */
    private bankWithMailBoxes: BankWithMailBox[] = [];
    /** Валидатор вложений */
    private attachmentValidator: AttachmentValidator = null;
    /** Признак отображения спинера */
    private showSpinner = true;
    /** Сообщение об ошибке */
    private errorMessage: string = null;

    /**
     * Определяет подходит ли маршрут для открытия компонента редактирования письма.
     * Если подходит, то выполняет переход и обновляет компонент с использованием параметров маршрута.
     * @param {VueRouter.Route} route маршрут
     * @param {VueRouter.Resolver} next функция разрешения перехода
     * @param {LetterEditPage} component компонент редактирования письма
     */
    private static async resolveRoute(route: VueRouter.Route, next: VueRouter.Resolver, component?: LetterEditPage): Promise<void> {
        let action: DocumentAction;
        const docId: string = route.params.id;
        if (docId) {
            action = route.params.action.toUpperCase() as DocumentAction;
            if (![DocumentAction.NEW, DocumentAction.COPY, DocumentAction.REPLY, DocumentAction.EDIT].includes(action)) {
                next(false);
                return;
            }
        } else {
            action = DocumentAction.NEW;
        }
        const updateComponent = async (letterEditPage: LetterEditPage) => {
            letterEditPage.action = action;
            letterEditPage.docId = docId;
            await letterEditPage.update();
        };
        if (component) {
            next();
            await updateComponent(component);
        } else {
            next(updateComponent);
        }
    }

    /**
     * @inheritDoc
     */
    async beforeRouteEnter(to: VueRouter.Route, from: VueRouter.Route, next: VueRouter.Resolver): Promise<void> {
        await LetterEditPage.resolveRoute(to, next);
    }

    /**
     * @inheritDoc
     */
    async beforeRouteUpdate(to: VueRouter.Route, from: VueRouter.Route, next: VueRouter.Resolver): Promise<void> {
        await LetterEditPage.resolveRoute(to, next, this);
    }

    /**
     * Обрабатывает хук ухода со страницы, выводит предупреждение и в случае согласия, сохраняет черновик
     * @param {VueRouter.Route} to      целевой объект Route, к которому осуществляется переход.
     * @param {VueRouter.Route} from    текущий путь, с которого осуществляется переход к новому.
     * @param {VueRouter.Resolver} next функция, вызов которой разрешает хук.
     * @inheritDoc
     * @returns {Promise<void>}
     */
    @CatchErrors
    async beforeRouteLeave(to: VueRouter.Route, from: VueRouter.Route, next: VueRouter.Resolver): Promise<void> {
        if (ModalContainer.isUiBlocked()) {
            next(false);
            return;
        }
        if (!this.needToConfirmLeave || this.errorMessage) {
            next();
            return;
        }
        const dialog = new ConfirmDialog();
        const btnReturn = await dialog.show(`Письмо не отправлено. Сохранить черновик?`);
        if (BtnReturn.YES === btnReturn) {
            const docId = await this.saveLetter(false);
            const currentRouter = this.$router;
            next();
            await new DocumentSuccessSendDialog().show({
                router: currentRouter,
                routerData: {name: "letterEdit", params: {id: docId, action: "edit"}},
                message: "Черновик успешно сохранен"
            });
        } else if (BtnReturn.NO === btnReturn) {
            next();
        }
    }

    /**
     * Обновляет компонент
     */
    private async update(): Promise<void> {
        try {
            this.isInitialized = false;
            this.errorMessage = null;
            this.showSpinner = true;
            this.bankWithMailBoxes = await this.getBanksWithMailBox(this.clientInfo.banks);
            await this.prepareDocument();
            await this.prepareAttachments(this.document.attachments, this.clientInfo.clientProperties);
            this.isInitialized = true;
            await this.$nextTick();
            this.$refs.letterSubject.$el.focus();
        } catch (error) {
            this.errorMessage = error.message;
        } finally {
            this.showSpinner = false;
        }
    }

    /**
     * Подготавливает вложения
     * @param {Attachment[]} attachments   массив вложений
     * @param {StringMap} clientProperties свойства клиента
     * @returns {Promise<void>}
     */
    private async prepareAttachments(attachments: Attachment[], clientProperties: StringMap): Promise<void> {
        if (attachments && attachments.length) {
            this.attachments = attachments.map(attach => new AttachWrapper(attach.id, null, attach.name, attach.size));
        }
        this.maxAttachFileSize = Number(clientProperties["DOCUMENTS.ATTACHMENTS.CLIENT.MAX_SIZE"]);
        this.attachmentValidator = new AttachmentValidator(clientProperties["FILE_EXTENSIONS.WHITE_LIST"], clientProperties["FILE_EXTENSIONS.BLACK_LIST"]);
    }

    /**
     * Подготавливает данные на основе документа
     */
    private async prepareDocument(): Promise<void> {
        if (this.action === DocumentAction.NEW) {
            // Создание нового письма
            this.document = await this.documentService.createEmpty(DocumentType.LETTER);
            this.selectedBankWithMailBox = this.bankWithMailBoxes[0];
        } else if (this.action === DocumentAction.COPY) {
            // Копирование существующего письма
            this.document = await this.documentService.createEmpty(DocumentType.LETTER);

            const originalDocument = await this.documentService.load(DocumentType.LETTER, this.docId);
            this.document.content.SUBJ_LETTER = originalDocument.content.SUBJ_LETTER;
            this.document.content.LETTER_BODY = originalDocument.content.LETTER_BODY;

            const mailboxId = originalDocument.content.MAILBOX_ID as string;
            this.selectedBankWithMailBox = this.findBankRecipientWithMailbox(mailboxId) ||
                await this.findDocumentBankRecipient(this.docId) ||
                this.bankWithMailBoxes[0];
        } else if (this.action === DocumentAction.REPLY) {
            // Создание ответа на письмо банка
            this.document = await this.documentService.createEmpty(DocumentType.LETTER);

            const originalDocument = await this.documentService.load(DocumentType.LETTER, this.docId);
            this.document.content.SUBJ_LETTER = `Re: ${originalDocument.content.SUBJ_LETTER}`;
            this.document.content.LETTER_BODY = `\n----- Исходное сообщение -----\n${originalDocument.content.LETTER_BODY}`;

            const mailboxId = originalDocument.content.MAILBOX_ID as string;
            this.selectedBankWithMailBox = this.findBankRecipientWithMailbox(mailboxId) ||
                await this.findBankRecipientByBic(originalDocument.bankBic) ||
                this.bankWithMailBoxes[0];
        } else if (this.action === DocumentAction.EDIT) {
            // Редактирование существующего письма
            this.document = await this.documentService.load(DocumentType.LETTER, this.docId);
            if (!DocumentUtils.isEditableStatus(this.document.status)) {
                throw new Error("Редактирование документа невозможно");
            }
            const mailboxId = this.document.content.MAILBOX_ID as string;
            this.selectedBankWithMailBox = this.findBankRecipientWithMailbox(mailboxId) ||
                await this.findDocumentBankRecipient(this.docId) ||
                this.bankWithMailBoxes[0];
        } else {
            throw new Error("Неизвестное действие: " + this.action);
        }
        this.document.content.SENDER = this.clientInfo.clientInfo.name;
    }

    /**
     * Ищет информацию о банке-получателе письма по идентификатору почтового ящика.
     * Если идентификатор почтового ящика не указан, то возвращает null.
     * @param {string} mailboxId идентификатор почтового ящика
     * @return {BankWithMailBox} информация о банке-получателе письма
     */
    private findBankRecipientWithMailbox(mailboxId: string): BankWithMailBox {
        if (!mailboxId) {
            return null;
        }
        return this.bankWithMailBoxes.find(recipient => recipient.mailBox && recipient.mailBox.id === mailboxId) || null;
    }

    /**
     * Ищет информацию о банке-получателе письма по идентификатору письма, уже отправленного банку
     * @param {string} docId идентификатор письма
     * @return {Promise<BankWithMailBox>} информация о банке-получателе письма
     */
    private async findDocumentBankRecipient(docId: string): Promise<BankWithMailBox> {
        // У писем, отправленных банку может быть только один получатель - сам банк
        const recipientId = (await this.documentService.getRecipients(DocumentType.LETTER, docId))[0];
        return this.bankWithMailBoxes.find(recipient => recipient.bank.ibankCode === recipientId) || null;
    }

    /**
     * Ищет информацию о банке-получателе письма по БИКу банка
     * @param {string} bankBic БИК банка-получателя письма
     * @return {Promise<BankWithMailBox>} информация о банке-получателе письма
     */
    private findBankRecipientByBic(bankBic: string): BankWithMailBox {
        return this.bankWithMailBoxes.find(recipient => recipient.bank.bic === bankBic) || null;
    }

    /**
     * Обрабатывает нажатие на кнопку "Отправить"
     */
    @CatchErrors
    private async onSend(): Promise<void> {
        if (await this.isValid()) {
            const docId = await this.saveLetter(true);
            this.needToConfirmLeave = false;
            const currentRouter = this.$router;
            this.$router.push({name: "letterList", params: {folder: LetterType.OUTBOX}}, async () => {
                await new DocumentSuccessSendDialog().show({
                    router: currentRouter,
                    routerData: {name: "letterView", params: {folder: LetterType.OUTBOX, id: docId}},
                    message: "Письмо успешно отправлено"
                });
            });
        }
    }

    /**
     * Сохраняет письмо
     * @param {boolean} sign нужно ли подписать письмо при сохранении
     * @return {Promise<string>} идентификатор сохраненного письма
     */
    private async saveLetter(sign?: boolean): Promise<string> {
        try {
            this.showSpinner = true;

            const documentTemplate = await this.documentService.create(DocumentType.LETTER);
            this.document.content.NUM_DOC = documentTemplate.content.NUM_DOC;
            this.document.content.DATE_DOC = documentTemplate.content.DATE_DOC;

            let timestamp = null;
            let signature = null;
            if (sign) {
                const attachments: Blob[] = [];
                for (const attachment of this.attachments) {
                    if (attachment.file) {
                        attachments.push(attachment.file);
                    } else if (this.document.id && attachment.id) {
                        attachments.push(await this.documentService.getAttachment(DocumentType.LETTER, this.document.id, attachment.id));
                    }
                }
                timestamp = await this.dateTimeService.getDateTime();
                signature = await this.signatureService.generateSignature(this.document, timestamp, attachments);
            }

            const docId = await this.documentService.save(this.document);
            try {
                await this.documentService.saveRecipients(DocumentType.LETTER, docId, [this.selectedBankWithMailBox.bank.ibankCode]);
                await this.updateAttachments(docId);
                if (timestamp && signature) {
                    // TODO: сохранение и подпись документа в одной транзакции
                    await this.documentService.sign(DocumentType.LETTER, docId, timestamp, signature);
                }
            } catch (e) {
                // если произошли ошибки переоткрываем документ в режиме редактирования
                this.needToConfirmLeave = false;
                this.$router.replace({name: "letterEdit", params: {id: docId, action: "edit"}});
                throw e;
            }
            return docId;
        } finally {
            this.showSpinner = false;
        }
    }

    /**
     * Обновляет вложения письма на сервере
     * @param {string} docId идентификатор документа
     * @returns {Promise<void>}
     */
    private async updateAttachments(docId: string) {
        if (this.attachmentsToRemoveIds.length) {
            await this.documentService.deleteAttachments(DocumentType.LETTER, docId, this.attachmentsToRemoveIds);
        }
        const files = this.attachments.filter((attach) => attach.id === null).map((attach) => attach.file);
        if (files && files.length) {
            const data = new FormData();
            files.forEach(file => data.append("files", file, file.name));
            await this.documentService.uploadAttachments(DocumentType.LETTER, docId, data);
        }
    }

    /**
     * Обрабатывает нажатие на кнопку "Сохранить черновик"
     */
    @CatchErrors
    private async onSaveDraft(): Promise<void> {
        const savedDocId = await this.saveLetter(false);
        this.needToConfirmLeave = false;
        const currentRouter = this.$router;
        this.$router.push({name: "letterList", params: {folder: LetterType.DRAFT}}, async () => {
            await new DocumentSuccessSendDialog().show({
                router: currentRouter,
                routerData: {name: "letterEdit", params: {id: savedDocId, action: "edit"}},
                message: "Черновик успешно сохранен"
            });
        });
    }

    /**
     * Добавляет файлы к вложениям
     * @param {FileList} files список файлов
     */
    @CatchErrors
    private onAddFile(files: File[]): void {
        this.checkAttachmentsValid(files);
        files.forEach(file => {
            this.attachments.push(new AttachWrapper(null, this.attachments.length, file.name, file.size, file));
        });
    }

    /**
     * Проверяет корректность заполнения контента письма
     * @returns {Promise<boolean>}
     */
    private async isValid(): Promise<boolean> {
        this.$errors.clear();
        return this.$validator.validateAll();
    }

    /**
     * Проверяет вложения на валидность
     * @param {FileList} files добавляемые файлы
     * @returns {boolean} code {@true} если вложения валидны
     */
    private checkAttachmentsValid(files: File[]): void {
        let attachmentsSize = this.attachments.map((attach) => attach.size).reduce((a, b) => a + b, 0);

        files.forEach(file => {
            if (this.attachments.find(attach => attach.name === file.name && attach.size === file.size)) {
                throw new Error("Прикрепляемый файл уже добавлен");
            }
            if (file.size === 0) {
                throw new Error("Размер вложения должен быть больше нуля");
            }
            if (!this.attachmentValidator.isExtensionValid(file.name)) {
                throw new Error(`Некорректное расширение файла: ${this.attachmentValidator.getFileExtension(file.name)}`);
            }
            attachmentsSize += file.size;
        });

        if (attachmentsSize > this.maxAttachFileSize) {
            throw new Error("Превышен максимальный размер вложений");
        }
    }

    /**
     * Удаляет вложение
     * @param {AttachWrapper} attach вложение
     */
    private onRemoveAttach(attach: AttachWrapper) {
        this.attachments.splice(this.attachments.indexOf(attach), 1);
        if (attach.id) {
            this.attachmentsToRemoveIds.push(attach.id);
        }
    }

    /**
     * Получает банки с почтовыми ящиками
     * @param {BankInfo[]} banks банки
     * @returns {Promise<BankWithMailBox[]>} банки с почтовыми ящиками
     */
    private async getBanksWithMailBox(banks: BankInfo[]): Promise<BankWithMailBox[]> {
        const allMailBoxes = await this.referenceService.getReference<MailBox>(References.MAILBOX);
        const banksWithMailBox: BankWithMailBox[] = [];
        banks.forEach(bank => {
            if (bank.accounts && bank.accounts.find(account => account.status !== "CLOSED")) {
                // отделения (department_id заполнен) не имеют почтовых ящиков
                const bankMailBoxes = allMailBoxes.filter(mailbox => mailbox.branch_id === bank.ibankCode &&
                    mailbox.status === MailBoxStatus.ACTIVE && CommonUtils.isBlank(mailbox.department_id));
                if (bankMailBoxes.length) {
                    banksWithMailBox.push(...bankMailBoxes.map(mail => new BankWithMailBox(bank, mail)));
                } else {
                    banksWithMailBox.push(new BankWithMailBox(bank));
                }
            }
        });

        return banksWithMailBox;
    }

    @Watch("selectedBankWithMailBox")
    private onSelectedBankWithMailBoxChange(value: BankWithMailBox): void {
        this.document.content.RECIPIENT = value.bank.name;
        this.document.content.MAILBOX_ID = value.mailBox ? value.mailBox.id : null;
        this.document.content.CLN_ACCOUNT = this.getClientAccount(value.bank.bic);
    }

    /**
     * Возвращает счет по умолчанию для клиента.
     * @param bic БИК банка получателя
     * @returns первый счет из списка счетов, принадлежащим указанному банку(БИКу) или {@code null} если список счетов пуст.
     */
    private getClientAccount(bic: string): string {
        const defaultAccounts = this.clientService.getAccountsByBic(bic);
        return defaultAccounts.length ? defaultAccounts[0].accountNumber : null;
    }

    /**
     * Осуществляет переход на предыдущую страницу
     */
    private goToBack() {
        this.needToConfirmLeave = false;
        this.$router.go(-1);
    }

    /**
     * Возвращает контент документа
     * @returns {DocumentContent} контент документа
     */
    private get c(): DocumentContent {
        return this.document.content;
    }

    /**
     * Возвращает meta документа
     * @returns {DocumentMeta} meta документа
     */
    private get m(): DocumentMeta {
        return this.document.meta;
    }

    /**
     * Возвращает информацию о полях документа
     * @returns {FieldInfoMap} информация о полях документа
     */
    get f(): FieldInfoMap {
        return this.document.meta.fieldsMap;
    }

    /**
     * Возвращает статус валидации поля
     * @param {string} fieldName
     * @return {ValidationResult}
     */
    private getValidationResult(fieldName: string): ValidationResult {
        return ValidationUtils.getValidationResult(fieldName, this.$errors);
    }

    /**
     * Возвращает максимальное количество символов, доступных для ввода в теле письма
     * @returns {number} доступное количество символов в теле письма
     */
    private get maxLetterBodyLength(): number {
        const maxPropLength = this.clientInfo.clientProperties["DOCUMENTS.LETTER.MAX_LENGTH"];
        if (CommonUtils.exists(maxPropLength)) {
            try {
                const maxLength = parseInt(maxPropLength, 10);
                if (maxLength > 0) {
                    return maxLength;
                }
            } catch (mute) {
            }
        }
        return FormatterFactory.getFormatter(this.f.LETTER_BODY as FormatterOptions).length;
    }

    /**
     * Возвращает информацию о клиенте
     * @return {ClientInfo} информация о клиенте
     */
    private get clientInfo(): ClientInfo {
        return this.clientService.getClientInfo();
    }
}

/**
 * Класс содержащий информация о банке и почтовом ящике
 */
class BankWithMailBox {
    name = "";

    constructor(public bank: BankInfo, public mailBox: MailBox = null) {
        this.name = this.bank.name + (this.mailBox ? `; ${this.mailBox.name}` : "");
    }
}
