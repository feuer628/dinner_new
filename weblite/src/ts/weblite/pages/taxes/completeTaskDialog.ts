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
import {XTextField} from "platform/ui/xTextField";

/**
 * Диалог переноса задачи в "Завершенные"
 */
@Component({
    // language=Vue
    template: `
        <dialog-form title="Завершение задачи" :width="675" :close="close">
            <template slot="content">
                <div class="form-row">
                    Задача будет перенесена в раздел "Завершенные".
                </div>
                <div class="form-row">
                    <!-- Комментарий -->
                    <x-textfield ref="commentInput" v-model="comment" :format="{type: 'text', rule: '255'}"
                                 title="Комментарий" class="full" @keyup.enter="close(comment)"></x-textfield>
                </div>
            </template>

            <template slot="footer">
                <div class="dialog-footer__btns">
                    <button class="btn btn-primary" @click.stop="close(comment)">Завершить</button>
                    <!-- TODO верстка: кнопки по левому краю -->
                    <button class="btn" @click="close">Отмена</button>
                </div>
            </template>
        </dialog-form>
    `
})
export class CompleteTaskDialog extends CustomDialog<undefined, string> {

    /** Ссылки на элементы формы */
    $refs: {
        commentInput: XTextField
    };

    /** Комментарий */
    private comment = "";

    /**
     * @inheritDoc
     */
    mounted(): void {
        this.$nextTick(() => this.$refs.commentInput.setFocus());
    }
}
