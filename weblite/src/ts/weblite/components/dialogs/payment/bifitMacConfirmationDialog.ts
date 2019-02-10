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
import {Inject} from "platform/ioc";
import {Component, UI} from "platform/ui";
import {CustomDialog} from "platform/ui/dialogs/customDialog";
import {ClientTokenInfo} from "service/clientService";
import {DocumentService} from "service/documentService";
import {BifitMacTokenHelper} from "utils/bifitMacTokenHelper";

/**
 * Диалог подтверждения платежа при помощи MAC-токена BIFIT
 */
@Component({
    // TODO: верстка
    // language=Vue
    template: `
        <dialog-form title="Подтверждение платежа" :width="750" :closable="false">
            <div slot="content">
                <template v-if="loaded">
                    <div class="form-row">
                        <x-textfield title="N" :readonly="true"
                                     :value="c.NUM_DOC" :format="f.NUM_DOC" class="w140"></x-textfield>
                        <x-textfield title="Дата" :readonly="true"
                                     :value="c.DATE_DOC" :format="f.DATE_DOC" class="w140"></x-textfield>
                        <x-textfield title="Сумма, ₽" :readonly="true"
                                     :value="c.AMOUNT" :format="f.AMOUNT" class="w140"></x-textfield>
                    </div>
                    <div class="form-row">
                        <x-textfield title="Счет получателя" :readonly="true"
                                     :value="c.RCPT_ACCOUNT" :format="f.RCPT_ACCOUNT" class="full"></x-textfield>
                        <x-textfield title="БИК банка получателя" :readonly="true"
                                     :value="c.RCPT_BANK_BIC" :format="f.RCPT_BANK_BIC" class="small"></x-textfield>
                    </div>
                    <div class="form-row">
                        <x-textfield title="Наименование получателя" :readonly="true"
                                     :value="c.RCPT_NAME" :format="f.RCPT_NAME" class="full"></x-textfield>
                    </div>
                    <div class="form-row">
                        <p class="full">Подтвердите платежное поручение с помощью MAC-токена BIFIT с серийным номером <b>{{data.token.serial}}.</b></p>
                    </div>
                    <div class="form-row">
                        <p class="full">
                            <b>Внимание!</b>
                            Убедитесь, что реквизиты, отображаемые на экране MAC-токена BIFIT, соответствуют реальным реквизитам получателя.
                        </p>
                    </div>
                </template>
                <spinner v-else></spinner>
            </div>
        </dialog-form>
    `
})
export class BifitMacConfirmationDialog extends CustomDialog<BifitMacConfirmationDialogParams, Status | null> {

    /** Сервис по работе с документами */
    @Inject
    private documentService: DocumentService;

    /** Флаг загружена ли информация, необходимая для работы диалога */
    private loaded = false;

    /** Метаинформация документа */
    private meta: DocumentMeta = null;

    /**
     * Монтирует диалог
     * @inheritDoc
     * @return {Promise<void>}
     */
    async mounted(): Promise<void> {
        try {
            if (this.data.token.confirmType !== ConfirmType.BIFIT_MAC) {
                throw Error("Для работы диалога требуется MAC-токен BIFIT");
            }
            this.meta = await this.documentService.getMeta(DocumentType.PAYMENT);
            const confirmData = await this.documentService.getDataToConfirm(DocumentType.PAYMENT, this.data.docId);

            this.loaded = true;

            const session = await BifitMacTokenHelper.getMacTokenSession();
            const signature = await session.confirmByBifitMactoken(confirmData.digest, confirmData.displayData);
            const confirmResponse = await this.documentService.confirm(DocumentType.PAYMENT, this.data.docId, {
                confirmType: ConfirmType.BIFIT_MAC,
                tokenHash: this.data.token.hash,
                otp: signature
            });
            this.close(confirmResponse.status);
        } catch (error) {
            // Закрываем диалог при возникновении ошибки
            this.$nextTick(() => {
                this.close();
            });
            UI.emit(GlobalEvent.HANDLE_ERROR, error);
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
}

/**
 * Параметры для диалога подтверждения документа при помощи MAC-токена BIFIT
 */
export type BifitMacConfirmationDialogParams = {

    /** Идентификатор подтверждаемого документа */
    docId: string;

    /** Информация об MAC-токене BIFIT */
    token: ClientTokenInfo;

    /** Контент подтверждаемого документа */
    content: DocumentContent;
};
