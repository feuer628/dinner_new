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
 * Диалог ввода пароля для ключа.
 * Принимает в качестве параметра название ключа для отображения в диалоге.
 * Возвращает true если пользователь ввел правильный пароль от ключа и false если пользователь нажал кнопку "Отмена".
 */
@Component({
    // language=Vue
    template: `
        <dialog-form title="Ключ ЭП" :width="500" :closable="false">
            <div slot="content">
                <div>Введите пароль для ключа <span class="bold">{{data}}</span></div>
                <x-textfield v-model="password" type="password" @keyup.enter="onSetPassword" title="Пароль" v-focus="true"
                             class="w100pc form-margT"></x-textfield>
                <div v-if="!!errorMessage" class="error form-margT">{{errorMessage}}</div>
            </div>
            <template slot="footer">
                <div class="dialog-footer__btns">
                    <button class="btn btn-primary" :disabled="!password" @click="onSetPassword">ОК</button>
                    <button class="btn" @click="close(false)">Отмена</button>
                </div>
            </template>
        </dialog-form>
    `
})
export class KeyPasswordDialog extends CustomDialog<string, boolean> {

    /** Значение поля с паролем */
    private password: string = null;

    /** Сообщение об ошибке */
    private errorMessage: string = null;

    /**
     * Обработчик установки пароля
     */
    private async onSetPassword(): Promise<void> {
        if (!this.password) {
            return;
        }
        try {
            const session = PluginHelper.getSession();
            await session.setKeyPassword(this.password);
            this.password = null;
            this.close(true);
        } catch (e) {
            this.password = null;
            this.errorMessage = e.message;
        }
    }
}