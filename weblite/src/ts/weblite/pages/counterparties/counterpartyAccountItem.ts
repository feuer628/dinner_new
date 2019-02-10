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
import {RemoveConfirmDialog} from "../../components/dialogs/removeConfirmDialog";
import {BtnReturn} from "../../model/btnReturn";
import {FormPaymentType} from "../../model/formPaymentType";
import {GlobalEvent} from "../../model/globalEvent";
import {CounterpartiesService, Counterparty} from "../../service/counterpartiesService";
import {DocumentBehaviorService} from "../../service/documentBehaviorService";
import {CounterpartyAccountOrContactItemMenu} from "./counterpartyAccountOrContactItemMenu";
import {CounterpartyAccountExtended} from "./counterpartyItem";

/**
 * Компонент отображения блока с реквизитом счета
 */
@Component({
    // language=Vue
    template: `
        <div @mouseleave="hideMenu" @click="hideMenu">
            <div @click.stop="visible=!visible" class="info-block__menu-button">
                <div class="info-block-menu-button__circle"></div>
                <div class="info-block-menu-button__circle"></div>
                <div class="info-block-menu-button__circle"></div>
                <counterparty-account-or-contact-item-menu v-if="visible" @edit="onEditAccount" @delete="onDeleteAccount">
                </counterparty-account-or-contact-item-menu>
            </div>
            <div class="info-block__label">Наименование Банка</div>
            <div>{{account.bankName}}</div>
            <div class="info-block__label">БИК</div>
            <div>{{account.bic}}</div>
            <div class="info-block__label">Расчетный счет</div>
            <div>{{account.account}}</div>
            <button class="btn" @click="goToPaymentCreate">Заплатить</button>
        </div>
    `,
    components: {CounterpartyAccountOrContactItemMenu}
})
export class CounterpartyAccountItem extends UI {

    /** Сервис для предзаполнения документа */
    @Inject
    private documentBehaviorService: DocumentBehaviorService;
    /** Сервис для работы с контрагентами */
    @Inject
    private counterpartiesService: CounterpartiesService;
    /** Отображаемый контрагент */
    @Prop({required: true})
    private counterparty: Counterparty;
    /** Отображаемый счет */
    @Prop({required: true})
    private account: CounterpartyAccountExtended;
    /** переменная для отображения плашки меню */
    private visible = false;

    /**
     * Осуществляет переход на страницу создания платежа если у контрагента один счет или был выбран в диалоге
     */
    @CatchErrors
    private async goToPaymentCreate(): Promise<void> {
        this.documentBehaviorService.setBehavior({
            formPaymentType: FormPaymentType.getByCode(this.counterparty.paymentForm),
            content: {
                RCPT_INN: this.counterparty.inn,
                RCPT_KPP: this.counterparty.kpp,
                RCPT_NAME: this.counterparty.name,
                RCPT_BANK_BIC: this.account.bic,
                RCPT_ACCOUNT: this.account.account
            }
        });
        this.$router.push({name: "paymentNew", params: {id: "new"}});
    }

    /**
     * Открывает диалог редактирования выбранного реквизита
     */
    private async onEditAccount(): Promise<void> {
        const selectedAccount = {...this.account};
        if (await new AccountDialog().show({counterparty: this.counterparty, account: selectedAccount})) {
            this.account.id = selectedAccount.id;
            this.account.bic = selectedAccount.bic;
            this.account.account = selectedAccount.account;
            this.account.bankName = selectedAccount.bankName;
        }
    }

    /**
     * Открывает диалог удаления выбранного реквизита
     */
    private async onDeleteAccount(): Promise<void> {
        if (await new RemoveConfirmDialog().show("Удалить реквизит контрагента без возможности восстановления?") === BtnReturn.YES) {
            await this.counterpartiesService.removeCounterpartyAccount(this.counterparty.id, this.account.id);
            UI.emit(GlobalEvent.REMOVE_COUNTERPARTY_ACCOUNT, this.account);
        }
    }

    /**
     * Скрывает плашку меню
     */
    private hideMenu() {
        this.visible = false;
    }
}
