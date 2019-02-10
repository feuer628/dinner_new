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
import {Component, Prop, UI} from "platform/ui";
import {AccountDialog} from "../../components/dialogs/counterparty/accountDialog";
import {ContactDialog} from "../../components/dialogs/counterparty/contactDialog";
import {GlobalEvent} from "../../model/globalEvent";
import {CounterpartiesService, Counterparty, CounterpartyAccount, CounterpartyContact} from "../../service/counterpartiesService";
import {CounterpartyAccountItem} from "./counterpartyAccountItem";
import {CounterpartyHelper} from "./counterpartyHelper";
import {CounterpartyAccountExtended} from "./counterpartyItem";
import {CreateAccountOrContactPanel} from "./createAccountOrContactPanel";
import {CounterpartyContactItem} from "./сounterpartyContactItem";

@Component({
    // language=Vue
    template: `
        <div>
            <div class="page-header">
                <div class="title">Реквизиты</div>
            </div>

            <div class="info-block__wrapper counterparty__client">
                <counterparty-account-item v-for="account in accounts" :key="account.id"
                                           :account="account" :counterparty="counterparty"></counterparty-account-item>
                <create-account-or-contact-panel class="account" label="Добавить реквизит" @click="onCreateAccount"></create-account-or-contact-panel>
            </div>

            <div class="page-header">
                <div class="title">Контакты</div>
            </div>

            <div class="info-block__wrapper contacts__client">
                <counterparty-contact-item v-for="contact in counterparty.contacts" :key="contact.id"
                                           :contact="contact" :counterparty="counterparty"></counterparty-contact-item>
                <create-account-or-contact-panel class="contact" label="Добавить контакт" @click="onCreateContact"></create-account-or-contact-panel>
            </div>
        </div>
    `,
    components: {CounterpartyAccountItem, CounterpartyContactItem, CreateAccountOrContactPanel}
})
export class CounterpartyInfoTab extends UI {

    /** Сервис для работы с контрагентами */
    @Inject
    private counterpartiesService: CounterpartiesService;
    /** Отображаемый контрагент */
    @Prop({required: true})
    private counterparty: Counterparty;
    /** Список счетов контрагента */
    private accounts: CounterpartyAccountExtended[] = [];

    /**
     * @inheritDoc
     */
    @CatchErrors
    async created(): Promise<void> {
        this.accounts = await CounterpartyHelper.prepareAccounts(this.counterparty.accounts);
        UI.on(GlobalEvent.REMOVE_COUNTERPARTY_ACCOUNT, async (account: CounterpartyAccountExtended) => {
            this.counterparty.accounts = this.counterparty.accounts.filter(acc => acc.id !== account.id);
            this.accounts = await CounterpartyHelper.prepareAccounts(this.counterparty.accounts);
        });
        UI.on(GlobalEvent.REMOVE_COUNTERPARTY_CONTACT, (contact: CounterpartyContact) => {
            this.counterparty.contacts.splice(this.counterparty.contacts.indexOf(contact), 1);
        });
    }

    /**
     * Открывает диалог создания нового реквизита
     */
    private async onCreateAccount(): Promise<void> {
        const newAccount: CounterpartyAccountExtended = {bic: "", account: "", bankName: ""};
        const newId = await new AccountDialog().show({counterparty: this.counterparty, account: newAccount});
        if (newId) {
            newAccount.id = newId;
            this.counterparty.accounts.push(newAccount);
            this.accounts = await CounterpartyHelper.prepareAccounts(this.counterparty.accounts);
        }
    }

    /**
     * Открывает диалог создания нового контакта
     */
    private async onCreateContact(): Promise<void> {
        const newContact: CounterpartyContact = {fio: "", position: "", phone: "", email: ""};
        const newId = await new ContactDialog().show({counterparty: this.counterparty, contact: newContact});
        if (newId) {
            newContact.id = newId;
            this.counterparty.contacts.push(newContact);
        }
    }
}
