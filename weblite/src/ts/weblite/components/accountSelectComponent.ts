import {Component, Prop, UI} from "platform/ui";
import {Filters} from "platform/ui/filters";
import {Account} from "../model/account";

/**
 * Компонент выпадающего списка счетов
 */
@Component({
    template: `
        <v-select class="accountsList" :title="title" :options="wrappedAccounts"
            :value="selectedWrappedAccount" @input="onSelect">
            <template slot="selected-option" slot-scope="option">
                <div class="account">
                    <span>{{ option.account.accountNumber }}</span>
                    <div>
                        <span>{{ option.integerAmount }}</span><span class="fractional-amount">,{{ option.fractionAmount }} &#8381;</span>
                    </div>
                </div>
            </template>
            <template slot="option" slot-scope="option">
                <div class="account">
                    <span>{{ option.account.accountNumber }}</span>
                    <div>
                        <span>{{ option.integerAmount }}</span><span class="fractional-amount">,{{ option.fractionAmount }} &#8381;</span>
                    </div>
                </div>
            </template>
        </v-select>
    `
})
export class AccountSelectComponent extends UI {

    /** Заголовок поля */
    @Prop({default: null})
    title: string;

    /** Выбранный счет */
    @Prop({default: null})
    value: Account;

    /** Список счетов */
    @Prop({default: () => [] as Account[], type: Array})
    private accounts: Account[];

    /**
     * Отправляет событие выбора счета
     * @param {AccountWrapper} selected
     */
    private onSelect(selected: AccountWrapper): void {
        this.$emit("input", selected.account);
    }

    private get wrappedAccounts(): AccountWrapper[] {
        return this.accounts.map(account => new AccountWrapper(account));
    }

    private get selectedWrappedAccount(): AccountWrapper {
        return this.wrappedAccounts.find(wrappedAccount => wrappedAccount.account === this.value);
    }
}

/**
 * Вспомогательный класс для отображения счета в выпадайке
 */
class AccountWrapper {

    /** Метка для использования в v-select */
    label: string;

    /** Целая часть суммы */
    integerAmount: string;

    /** Дробная часть суммы */
    fractionAmount: string;

    /**
     * Конструктор
     * @param {Account} account счёт
     */
    constructor(public account: Account) {
        this.label = account.accountNumber;
        const formattedAmount = Filters.formatAmount(account.freeBalance || account.remainder);
        const dotIndex = formattedAmount.indexOf(".");
        this.integerAmount = formattedAmount.substring(0, dotIndex);
        this.fractionAmount = formattedAmount.substring(dotIndex + 1, formattedAmount.length);
    }
}