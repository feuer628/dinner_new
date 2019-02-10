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
import {ClientTokenInfo} from "service/clientService";
import {DocumentService} from "service/documentService";
import {ValidationResult} from "../../../model/validationResult";

/**
 * Диалог подтверждения платежа при помощи OTP-токена
 */
@Component({
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
                        <div class="full">Введите одноразовый пароль, сформированный ОТР-токеном.</div>
                    </div>
                    <div class="form-row">
                        <x-textfield title="Серийный номер токена" :readonly="true" :value="data.token.serial" class="small"></x-textfield>
                        <x-textfield title="Одноразовый пароль" v-model="password" :format="passwordFormat" name="PASSWORD"
                                     v-focus="true" :validation-result="validationResult" class="small" @keyup.enter="confirm"></x-textfield>
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
export class OtpConfirmationDialog extends CustomDialog<OtpConfirmDialogParams, Status | null> {

    /** Сервис по работе с документами */
    @Inject
    private documentService: DocumentService;

    /** Флаг загружена ли информация, необходимая для работы диалога */
    private loaded = false;

    /** Метаинформация документа */
    private meta: DocumentMeta = null;

    /** Значение поля с одноразовым паролем */
    private password: string = null;

    /** Формат поля с одноразовым паролем  */
    private passwordFormat: FormatterOptions = {type: "text", rule: "10;!0123456789"};

    /** Сообщение об ошибке, отображаемое в поле с одноразовым паролем */
    private passwordErrorMessage: string = null;

    /**
     * Монтирует диалог
     * @inheritDoc
     * @return {Promise<void>}
     */
    async mounted(): Promise<void> {
        try {
            if (this.data.token.confirmType !== ConfirmType.OTP) {
                throw Error("Для работы диалога требуется OTP-токен");
            }
            this.meta = await this.documentService.getMeta(DocumentType.PAYMENT);
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
     * Подтверждает документа после ввода одноразового пароля
     */
    @CatchErrors
    private async confirm(): Promise<void> {
        if (!this.password) {
            return;
        }
        try {
            const confirmResponse = await this.documentService.confirm(DocumentType.PAYMENT, this.data.docId, {
                confirmType: ConfirmType.OTP,
                tokenHash: this.data.token.hash,
                otp: this.password
            });
            this.close(confirmResponse.status);
        } catch (e) {
            if (e.code === "INCORRECT_OTP") {
                this.passwordErrorMessage = "Неверный одноразовый пароль";
                throw new Error(this.passwordErrorMessage);
            }
            this.passwordErrorMessage = null;
            throw e;
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
export type OtpConfirmDialogParams = {

    /** Идентификатор подтверждаемого документа */
    docId: string;

    /** Информация об OTP-токене */
    token: ClientTokenInfo;

    /** Контент подтверждаемого документа */
    content: DocumentContent;
};