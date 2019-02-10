import {CatchErrors} from "platform/decorators";
import {Inject} from "platform/ioc";
import {Component, Prop, UI} from "platform/ui";
import {Filters} from "platform/ui/filters";
import {CommonUtils} from "platform/utils/commonUtils";
import {AccountInfoDialog} from "../../components/dialogs/accountInfoDialog";
import {Account} from "../../model/account";
import {BankInfo} from "../../model/bankInfo";
import {Client} from "../../model/clientInfo";
import {ClientService} from "../../service/clientService";

/**
 * Компонент отображения блока с информацией по счету или карте
 */
@Component({
    // language=Vue
    template: `
        <div :class="['account-item', selected ? 'selected' : '']" @click="selectAccount">
            <div class="account-header">
                <inplace-input :value="alias" @input="onAliasChange" style="cursor: text" v-if="!main && editable && selected"></inplace-input>
                <span v-else>{{ alias }}</span>
            </div>

            <div class="account-amount">
                <span class="integer-amount">{{ formattedAmount.integerPart }}</span>
                <span class="fractional-amount">,{{ formattedAmount.fractionPart }} &#8381;</span>
            </div>

            <div class="account-links" v-if="!main && selected">
                <a @click.stop="showAccountInfoDialog">Реквизиты</a>
            </div>
        </div>
    `
})
export class AccountItem extends UI {

    /** Сервис по работе с информацией о клиенте */
    @Inject
    private clientService: ClientService;

    /**
     * Выбранный счет
     */
    @Prop({required: true})
    private item: Account;

    /**
     * Банк, к которому относится счет
     */
    @Prop()
    private bank: BankInfo;

    /**
     * Информация о клиенте
     */
    @Prop()
    private client: Client;

    /**
     * Признак что можно редактировать алиас счета
     */
    @Prop({default: false, type: Boolean})
    private editable: boolean;

    /**
     * Признак выбранного счета
     */
    @Prop({default: false, type: Boolean})
    private selected: boolean;

    /**
     * Признак того, что блок является агрегирующим и отрисовывать элементы (Пополнить, Реквизиты) не требуется
     */
    @Prop({default: false, type: Boolean})
    private main: boolean;

    /** Алиас счета */
    private alias = this.item.clientComments || this.item.accountNumber;

    /**
     * Возвращает объект с целой и дробной частью суммы
     * @return {string}
     */
    private get formattedAmount(): { integerPart: string, fractionPart: string } {
        const formattedAmount = Filters.formatAmount(this.item.freeBalance || this.item.remainder);
        const dotIndex = formattedAmount.indexOf(".");
        return {
            integerPart: formattedAmount.substring(0, dotIndex),
            fractionPart: formattedAmount.substring(dotIndex + 1, formattedAmount.length)
        };
    }

    private async showAccountInfoDialog(): Promise<void> {
        await new AccountInfoDialog().show({
            account: this.item,
            bankName: this.bank.name,
            bankBic: this.bank.bic,
            branchId: this.bank.ibankCode,
            corrAccount: this.bank.corrAcc,
            fullOrganizationName: this.client.fullOrganizationName,
            ogrn: this.client.ogrn,
            ogrnDate: this.client.ogrnDate,
            inn: this.client.inn
        });
    }

    @CatchErrors
    private async onAliasChange(alias: string): Promise<void> {
        await this.clientService.updateAccountAlias(this.item.ibankAccountId, alias);
        this.item.clientComments = alias;
        this.alias = CommonUtils.isBlank(alias) ? this.item.accountNumber : alias;
    }

    private selectAccount(): void {
        this.$emit("selectAccount", this.item);
    }
}
