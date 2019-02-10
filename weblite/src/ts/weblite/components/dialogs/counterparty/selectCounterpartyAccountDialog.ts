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
import {CounterpartyAccountExtended} from "../../../pages/counterparties/counterpartyItem";

/**
 * Компонент для отображения диалога с выбором счета для оплаты
 */
@Component({
    // language=Vue
    template: `
        <dialog-form title="Выберите счет получателя" :width="650" :close="close" class="selectCounterparty">
            <template slot="content">
                <div class="fieldTitle-row">{{ data.counterpartyName }}</div>
                <div class="accountItems">
                    <div v-for="account in data.accounts" :key="account" @click="close(account)" class="medium accountItem">
                        <div>{{ account.account }}</div>
                        <div class="fieldTitle">{{ account.bankName }}</div>
                    </div>
                </div>
            </template>
        </dialog-form>
    `
})
export class SelectCounterpartyAccountDialog extends CustomDialog<CounterpartyDialogInfo, CounterpartyAccountExtended> {
}

/**
 * Данные для диалога выбора счета для оплаты
 */
export type CounterpartyDialogInfo = {
    /** Данные о контрагенте */
    counterpartyName: string,
    /** Список счетов контрагента с заполненным названием банка */
    accounts: CounterpartyAccountExtended[]
};