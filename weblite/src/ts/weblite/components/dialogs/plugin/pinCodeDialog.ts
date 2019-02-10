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

import * as PluginHelper from "default/PluginHelper";
import {Component} from "platform/ui";
import {CustomDialog} from "platform/ui/dialogs/customDialog";

/**
 * Диалог ввода PIN-кода от хранилища ключей.
 * Возвращает true если пользователь ввел PIN-код от хранилища ключей и false если пользователь нажал кнопку "Отмена".
 * TODO: менять текст в зависимости от типа хранилища ("Серийный номер MAC-токена BIFIT:" и т.д.)
 */
@Component({
    // language=Vue
    template: `
        <dialog-form title="Ввод PIN-кода" :width="450" :closable="false">
            <div slot="content" data-uitype="panel">
                <div>Идентификатор хранилища ключей: <span class="bold">{{data.tokenId}}</span></div>
                <x-textfield v-model="pinCode" type="password" @keyup.enter="onSetPinCode" title="PIN-код" v-focus="true"
                             class="form-margT w100pc"></x-textfield>
                <div v-if="!!errorMessage" class="error form-margT">{{errorMessage}}</div>
            </div>
            <template slot="footer">
                <div class="dialog-footer__btns">
                    <button class="btn btn-primary" :disabled="!pinCode" @click="onSetPinCode">ОК</button>
                    <button class="btn" @click="close(false)">Отмена</button>
                </div>
            </template>
        </dialog-form>
    `
})
export class PinCodeDialog extends CustomDialog<PinCodeDialogParams, boolean> {

    /** Значение поля с PIN-кодом */
    private pinCode: string = null;

    /** Сообщение об ошибке */
    private errorMessage: string = null;

    /**
     * Обработчик установки PIN-кода
     */
    private async onSetPinCode(): Promise<void> {
        if (!this.pinCode) {
            return;
        }
        try {
            const session = PluginHelper.getSession(this.data.sessionName);
            await session.setPin(this.pinCode);
            this.pinCode = null;
            this.close(true);
        } catch (e) {
            this.pinCode = null;
            this.errorMessage = e.message;
        }
    }
}

/**
 * Параметры диалога ввода PIN-кода от хранилища ключей
 */
export type PinCodeDialogParams = {

    /** Идентификатор токена для отображения в диалоге */
    tokenId: string;

    /** Название сессии, в рамках которой производится работа с хранилищем ключей */
    sessionName?: string;
};
