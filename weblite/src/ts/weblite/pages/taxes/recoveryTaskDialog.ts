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
import {BtnReturn} from "../../model/btnReturn";

/**
 * Диалог подтверждения возобновления задачи
 */
@Component({
    // language=Vue
    template: `
        <dialog-form title="Возобновление задачи" :width="675" :close="close">
            <template slot="content">
                <div class="form-row">
                    {{confirmText}}
                </div>
            </template>
            <template slot="footer">
                <div class="dialog-footer__btns">
                    <button class="btn btn-primary" @click.stop="close('YES')">Перенести</button>
                    <!-- TODO верстка: кнопки по левому краю -->
                    <button class="btn" @click="close">Отмена</button>
                </div>
            </template>
        </dialog-form>
    `
})
export class RecoveryTaskDialog extends CustomDialog<boolean, BtnReturn> {

    /**
     * Возвращает текст подтверждения возобновления
     */
    private get confirmText(): string {
        return this.data ? `Задача будет перенесена в раздел "Просроченные", так как истек срок оплаты.` :
            `Задача будет перенесена в раздел "Актуальные".`;
    }
}
