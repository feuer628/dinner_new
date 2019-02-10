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
import {SimpleDialogForm} from "platform/ui/dialogs/simpleDialogForm";
import {BtnReturn} from "../../model/btnReturn";

/**
 * Диалог подтверждения чего либо с вариантами выбора: Да, Нет, Отмена
 */
@Component({
    // language=Vue
    template: `
        <simple-dialog-form :close="close">
            <template slot="content">
                <span>{{data}}</span>
            </template>
            <template slot="controls">
                <a @click="close('YES')">Да</a>
                <a @click="close('NO')">Нет</a>
                <a @click="close('CANCEL')">Отмена</a>
            </template>
        </simple-dialog-form>
    `,
    components: {SimpleDialogForm}
})
export class ConfirmDialog extends CustomDialog<string, BtnReturn> {
}
