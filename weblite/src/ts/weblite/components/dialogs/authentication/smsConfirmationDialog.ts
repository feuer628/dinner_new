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

import {CatchErrors} from "platform/decorators";
import {FormatterOptions} from "platform/types";
import {Component} from "platform/ui";
import {CustomDialog} from "platform/ui/dialogs/customDialog";

/**
 * Диалог подтверждения действия SMS-кодом
 * Принимает в качестве аргумента номер SMS-кода, отправленного пользователю
 * Возвращает SMS-код, введенный пользователем или null если пользователь отменил подтверждение
 */
@Component({
    // language=Vue
    template: `
        <dialog-form title="Подтверждение SMS-кодом" :closable="false">
            <div slot="content">
                <div>Запрос № <span class="bold">{{data}}</span></div>
                <x-textfield title="SMS-код" v-model="password" :format="passwordFormat" v-focus="true" class="w100pc form-margT"
                             @keyup.enter="onConfirm"></x-textfield>
            </div>
            <template slot="footer">
                <button class="btn btn-primary" :disabled="!password" @click="onConfirm">Подтвердить</button>
                <button class="btn" @click="close">Отмена</button>
            </template>
        </dialog-form>
    `
})
export class SmsConfirmationDialog extends CustomDialog<string, string | null> {

    /** Формат поля с одноразовым паролем  */
    private readonly passwordFormat: FormatterOptions = {type: "text", rule: "10;!0123456789"};

    /** Значение поля с одноразовым паролем */
    private password: string = null;

    /**
     * Обрабатывает ввод одноразового пароля
     */
    @CatchErrors
    private async onConfirm(): Promise<void> {
        if (this.password) {
            this.close(this.password);
        }
    }
}