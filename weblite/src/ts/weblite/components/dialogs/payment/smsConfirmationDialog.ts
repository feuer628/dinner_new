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

import {ConfirmType} from "model/confirmationType";
import {DocumentContent, DocumentMeta, DocumentType, FieldInfoMap} from "model/document";
import {GlobalEvent} from "model/globalEvent";
import {Status} from "model/status";
import {CatchErrors} from "platform/decorators";
import {Inject} from "platform/ioc";
import {FormatterOptions} from "platform/types";
import {Component, UI} from "platform/ui";
import {CustomDialog} from "platform/ui/dialogs/customDialog";
import {DocumentService} from "service/documentService";
import {DocumentSmsService} from "service/documentSmsService";
import {ValidationResult} from "../../../model/validationResult";

/**
 * Диалог подтверждения платежа по SMS
 */
@Component({
    // TODO: верстка
    // language=Vue
    template: `
        <dialog-form title="Подтверждение платежа" :width="750" :closable="false">
            <div slot="content">
                <template v-if="loaded">
                    <div class="form-row">
                        <x-textfield title="Наименование получателя" :readonly="true"
                                     :value="c.RCPT_NAME" :format="f.RCPT_NAME" class="full"></x-textfield>
                    </div>
                    <div class="form-row">
                        <x-textfield title="БИК банка получателя" :readonly="true"
                                     :value="c.RCPT_BANK_BIC" :format="f.RCPT_BANK_BIC" class="small"></x-textfield>
                        <x-textfield title="Счет получателя" :readonly="true"
                                     :value="c.RCPT_ACCOUNT" :format="f.RCPT_ACCOUNT" class="full"></x-textfield>
                    </div>
                    <div class="form-row">
                        <x-textfield title="П/п N" :readonly="true"
                                     :value="c.NUM_DOC" :format="f.NUM_DOC" class="small"></x-textfield>
                        <x-textfield title="Сумма, ₽" :readonly="true"
                                     :value="c.AMOUNT" :format="f.AMOUNT" class="full"></x-textfield>
                    </div>

                    <div class="form-row">
                        <p class="full">Введите код подтверждения, полученный по SMS.</p>
                    </div>
                    <div class="form-row">
                        <x-textfield title="№ запроса" :readonly="true" :value="sessionId" class="small"></x-textfield>
                        <x-textfield title="Код подтверждения" v-model="password" :format="passwordFormat" name="PASSWORD"
                                     v-focus="true" :validation-result="validationResult" class="small" @keyup.enter="confirm"></x-textfield>
                        <a v-if="canSendSms" class="link-dotted" @click="onSendSms">Отправить код еще раз</a>
                    </div>

                    <div class="form-row">
                        <p class="full"><b>Внимание!</b> Убедитесь, что БИК и счет, указанные в SMS-сообщении, соответствуют реальным реквизитам получателя.</p>
                    </div>
                </template>
                <spinner v-else></spinner>
            </div>
            <template slot="footer">
                <button class="btn btn-primary" :disabled="!password" @click="confirm">Подтвердить</button>
                <button class="btn" @click="close">Отмена</button>
            </template>
        </dialog-form>
    `
})
export class SmsConfirmationDialog extends CustomDialog<SmsConfirmDialogParams, Status | null> {

    /** Сервис по работе с документами */
    @Inject
    private documentService: DocumentService;

    /** Сервис работы с отправкой SMS с одноразовым паролем для подтверждения документов */
    @Inject
    private documentSmsService: DocumentSmsService;

    /** Флаг загружена ли информация, необходимая для работы диалога */
    private loaded = false;

    /** Метаинформация документа */
    private meta: DocumentMeta = null;

    /** Уникальный идентификатор сессии, в рамках которой выполняется подтверждение документа */
    private sessionId: number = null;

    /** Значение поля с одноразовым паролем */
    private password: string = null;

    /** Формат поля с одноразовым паролем  */
    private passwordFormat: FormatterOptions = {type: "text", rule: "10;!0123456789"};

    /** Сообщение об ошибке, отображаемое в поле с одноразовым паролем */
    private passwordErrorMessage: string = null;

    // TODO: сделать таймер повторной отправки
    /** Флаг отображается ли кнопка повторной отправки СМС-сообщения с одноразовым паролем */
    private canSendSms = true;

    /**
     * Монтирует диалог
     * @inheritDoc
     * @return {Promise<void>}
     */
    async mounted(): Promise<void> {
        try {
            this.meta = await this.documentService.getMeta(DocumentType.PAYMENT);
            this.sessionId = await this.documentService.getConfirmSessionId();
            await this.sendSms();
            this.loaded = true;
        } catch (error) {
            // Закрываем диалог при возникновении ошибки
            this.$nextTick(() => {
                this.close();
            });
            UI.emit(GlobalEvent.HANDLE_ERROR, error);
        }
    }

    /**
     * Отправляет запрос на SMS-сообщение с одноразовым паролем
     */
    private async sendSms(): Promise<void> {
        await this.documentSmsService.sendOtpBySms(DocumentType.PAYMENT, this.data.docId, this.sessionId);
    }

    /**
     * Обрабатывает нажатие на кнопку повторной отправки СМС-сообщения с одноразовым паролем
     */
    @CatchErrors
    private async onSendSms(): Promise<void> {
        await this.sendSms();
        this.password = null;
        this.canSendSms = false;
    }

    /**
     * Подтверждает документа после ввода одноразового пароля
     */
    @CatchErrors
    private async confirm(): Promise<void> {
        if (!this.password) {
            return;
        }
        try {
            const confirmResponse = await this.documentService.confirm(DocumentType.PAYMENT, this.data.docId, {
                confirmType: ConfirmType.SMS,
                otp: this.password,
                sessionId: this.sessionId
            });
            this.close(confirmResponse.status);
        } catch (e) {
            if (e.code === "INCORRECT_OTP") {
                this.passwordErrorMessage = "Неверный код подтверждения";
                this.canSendSms = true;
                throw new Error(this.passwordErrorMessage);
            } else {
                this.passwordErrorMessage = null;
                throw e;
            }
        }
    }

    /**
     * Возвращает контент подтверждаемого документа
     * @return {DocumentContent} контент подтверждаемого документа
     */
    private get c(): DocumentContent {
        return this.data.content;
    }

    /**
     * Возвращает метаинформацию о полях подтверждаемого документа
     * @return {FieldInfoMap} метаинформация о полях подтверждаемого документа
     */
    private get f(): FieldInfoMap {
        return this.meta.fieldsMap;
    }

    /**
     * Возвращает результат валидации для поля с одноразовым паролем
     * @return {ValidationResult} результат валидации для поля с одноразовым паролем
     */
    private get validationResult(): ValidationResult {
        this.$errors.add({field: "PASSWORD", msg: this.passwordErrorMessage});
        return new ValidationResult("PASSWORD", this.$errors);
    }
}

/**
 * Параметры для диалога подтверждения документа по SMS
 */
export type SmsConfirmDialogParams = {

    /** Идентификатор подтверждаемого документа */
    docId: string

    /** Контент подтверждаемого документа */
    content: DocumentContent;
};