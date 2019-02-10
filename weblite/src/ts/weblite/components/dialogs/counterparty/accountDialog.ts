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
import {Inject} from "platform/ioc";
import {Component} from "platform/ui";
import {CustomDialog} from "platform/ui/dialogs/customDialog";
import {XTextField} from "platform/ui/xTextField";
import {CommonUtils} from "platform/utils/commonUtils";
import {CounterpartyAccountExtended} from "../../../pages/counterparties/counterpartyItem";
import {BankData, BankService} from "../../../service/bankService";
import {CounterpartiesService, Counterparty, CounterpartyAccount} from "../../../service/counterpartiesService";
import {AccountUtils} from "../../../utils/accountUtils";

/**
 * Диалог добавления/редактирования счета контрагента
 */
@Component({
    // language=Vue
    template: `
        <dialog-form v-if="account && counterparty" :title="(account.id ? 'Редактирование' : 'Добавление нового') + ' реквизита'"
        :width="650" :close="close" class="overflow-visible__dialog">
            <template slot="content">
                <div class="form-row">
                    <!-- БИК -->
                    <x-textfield ref="bicInput" v-model="account.bic" @input="onRcptBankBicFilled" :format="{'type': 'text', 'rule': '9;!0123456789'}"
                                 @keyup.enter="saveAccount" title="БИК банка" class="small"></x-textfield>

                    <!-- Счет -->
                    <x-textfield v-model="account.account" :format="{'type': 'fixed-text', 'rule': '20;!0123456789'}" title="Расчетный счет"
                                 @keyup.enter="saveAccount" class="full"></x-textfield>
                </div>

                <div class="form-row">
                    <!-- Наименование банка -->
                    <v-select v-model="account.bankName"
                              title="Наименование банка"
                              :searchable="true"
                              :no-drop-if-selected="true"
                              :clear-search-on-blur="false"
                              :emit-on-created="false"
                              label="bank_name"
                              @afterselect="onBankSelect"
                              @search="searchRcptBank"
                              @keyup.enter="saveAccount"
                              :options="banks"
                              class="full">
                    </v-select>
                </div>
            </template>

            <template slot="footer">
                <div class="dialog-footer__btns">
                    <button class="btn btn-primary" @click.stop="saveAccount">{{ account.id ? 'Сохранить' : 'Добавить' }}</button>
                    <button class="btn" @click="close">Отмена</button>
                </div>
            </template>
        </dialog-form>
    `
})
export class AccountDialog extends CustomDialog<AccountDialogData, string> {

    /** Ссылки на элементы формы */
    $refs: {
        bicInput: XTextField
    };

    /** Сервис для работы с контрагентами */
    @Inject
    private counterpartiesService: CounterpartiesService;
    /** Сервис по работе с банками */
    @Inject
    private bankService: BankService;
    /** Информация о найденных банках */
    private banks: BankData[] = [];
    /** Текущий объект таймера */
    private currentTimer: number = null;
    /** Контрагент */
    private counterparty: Counterparty = null;
    /** Реквизит */
    private account: CounterpartyAccountExtended = null;

    /**
     * @inheritDoc
     */
    mounted(): void {
        this.counterparty = this.data.counterparty;
        this.account = this.data.account;
        this.$nextTick(() => this.$refs.bicInput.setFocus());
    }

    /**
     * Осуществляет поиск банка по БИК. Если банк найден,
     * заполняются поля Наименование банка получателя, Корр.счет банка,
     * список банков очищается.
     * @param newValue новое значение
     * @return {Promise<void>}
     */
    @CatchErrors
    private async onRcptBankBicFilled(newValue: string): Promise<void> {
        this.account.bic = newValue;
        if (this.account.bic.length === 9) {
            try {
                const bank = await this.bankService.getBank(<string> this.account.bic);
                this.account.bankName = bank.bank_name;
                this.account.bankAccount = bank.bill_corr;
                this.banks = [];
            } catch (e) {
                this.account.bankName = "";
                this.account.account = "";
                this.banks = [];
                throw new Error(`Банк с БИК ${this.account.bic} в справочнике банков не обнаружен.`);
            }
        }
    }

    /**
     * Проверяет ключевание счета получателя
     */
    private checkRcptAccountKey(): void {
        if (this.account.bic.length === 9 && this.account.account.length === 20) {
            const result = AccountUtils.checkCbit(this.account.account, this.account.bankAccount, this.account.bic);
            if (!result) {
                throw new Error("Ошибка ключевания счета");
            }
        }
    }

    /**
     * Осуществляет поиск банка получателя с задержкой ввода
     * @param {string} query
     * @param {(...args: any[]) => void} loading
     * @return {Promise<void>}
     */
    @CatchErrors
    private async searchRcptBank(query: string, loading: (...args: any[]) => void): Promise<void> {
        loading(true);
        clearTimeout(this.currentTimer);
        const delay = new Promise((resolve, reject) => {
            this.currentTimer = setTimeout(async () => {
                try {
                    this.banks = (await this.bankService.getBanks({bank_name: query, pageSize: 5, pageNumber: 0})).content;
                    loading(false);
                } catch (error) {
                    reject(error);
                }
            }, 1000);
        });

        try {
            delay.then(() => {
                clearTimeout(this.currentTimer);
                loading(false);
            });
        } catch (error) {
            clearTimeout(this.currentTimer);
            loading(false);
            throw error;
        }
    }

    /**
     * Обработчик выбора банка получателя.
     * Проставляет в контент документа поля: корреспондентский счет, название и БИК банка
     * Проверяет номер счета плательщика и его ключевание после заполнения, так как БИК изменился
     * @return {void}
     */
    @CatchErrors
    private async onBankSelect(bank: BankData): Promise<void> {
        this.account.bic = bank.bik;
        this.account.bankName = bank.bank_name;
        this.account.bankAccount = bank.bill_corr;
    }

    /**
     * TODO валидация
     * Сохраняет новый реквизит или обновляет существующий
     */
    @CatchErrors
    private async saveAccount(): Promise<void> {
        if (!(await this.validate())) {
            return;
        }
        const id = await this.counterpartiesService.saveCounterpartyAccount(this.counterparty.id, this.account);
        this.close(id);
    }

    /**
     * Валидирует поля диалога
     */
    private async validate(): Promise<boolean> {
        // проверка длины ИНН если заполнено
        if (CommonUtils.isBlank(this.account.bic) || CommonUtils.isBlank(this.account.account)) {
            throw new Error("БИК банка и расчетный счет обязательны для заполнения");
        }
        this.checkRcptAccountKey();
        return true;
    }
}

/** Данные для диалога */
export type AccountDialogData = {
    /** Контрагент */
    counterparty: Counterparty,
    /** Реквизит */
    account: CounterpartyAccountExtended
};