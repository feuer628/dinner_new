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

import {Component} from "platform/ui";
import {CustomDialog} from "platform/ui/dialogs/customDialog";

/**
 * Диалог подтверждения отправки документа.
 * Принимает в качестве аргумента сообщение об ошибке, возникшей при проверки возможности подтверждения документа.
 */
@Component({
    // TODO: верстка
    // language=Vue
    template: `
        <dialog-form title="Подтверждение платежа" :width="500" :close="close">
            <template slot="content">
                <div>При проверке возможности подтверждения произошла ошибка:</div>
                <div class="margT24">{{data}}</div>
                <div class="margT24">Продолжить?</div>
            </template>

            <template slot="footer">
                <div class="controls">
                    <button class="btn btn-primary" @click="close(true)">Да</button>
                    <button class="btn" @click="close">Нет</button>
                </div>
            </template>
        </dialog-form>
    `
})
export class ContinueConfirmDialog extends CustomDialog<string, boolean> {
}