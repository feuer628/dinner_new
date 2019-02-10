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
 * Диалог отображения сообщения об успешной отправке документа
 */
@Component({
    // language=Vue
    template: `
        <simple-dialog-form :close="close">
            <template slot="content">
                <div class="icon icon-checked">
                    {{ data.message }}
                </div>
            </template>
            <template slot="controls">
                <a @click="action">Просмотреть</a>
            </template>
        </simple-dialog-form>
    `
})
export class DocumentSuccessSendDialog extends CustomDialog<SuccessSendDocData, boolean> {

    /**
     * Устанавливает таймаут в 5 секунд для автоматического закрытия сообщения
     * @inheritDoc
     */
    created(): void {
        setTimeout(() => this.close(), 5000);
    }

    /**
     * Осуществляет переход к просмотру отправленного документа
     */
    private action(): void {
        this.close();
        this.data.router.push(this.data.routerData);
    }
}

/** Описание типа успешной отправки документа */
export type SuccessSendDocData = {
    /** Роутер. Необходимо прокидывать из-за того что диалоги создаются динамически */
    router: VueRouter,
    /** Объект для роутера для просмотра документа */
    routerData: any,
    /** Сообщение об успешной отправке */
    message: string
};