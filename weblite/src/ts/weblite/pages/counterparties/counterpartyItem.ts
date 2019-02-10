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
import {CommonUtils} from "platform/utils/commonUtils";
import {SelectCounterpartyAccountDialog} from "../../components/dialogs/counterparty/selectCounterpartyAccountDialog";
import {RemoveConfirmDialog} from "../../components/dialogs/removeConfirmDialog";
import {IndicatorTooltip} from "../../components/indicatorTooltip";
import {BtnReturn} from "../../model/btnReturn";
import {FormPaymentType} from "../../model/formPaymentType";
import {GlobalEvent} from "../../model/globalEvent";
import {BankService} from "../../service/bankService";
import {CounterpartiesService, Counterparty, CounterpartyAccount, CounterpartyContact} from "../../service/counterpartiesService";
import {DocumentBehaviorService, ExtendedDocumentBehavior} from "../../service/documentBehaviorService";
import {CounterpartyHelper} from "./counterpartyHelper";

/**
 * Компонент отображения строки с информацией по контрагенту.
 */
@Component({
    // language=Vue
    template: `
        <div class="operations-table__row" @click="goToCounterpartyInfo">
            <div class="operations-table__cell">
                <span class="icon icon-star" :class="{ 'marked': counterparty.isMarked }" @click.stop="toggleMarked"></span>
            </div>
            <!-- Компонент для отображения иконки и тултипа индикатора -->
            <div class="operations-table__cell tooltip-visible">
                <indicator-tooltip :counterparty="counterparty"></indicator-tooltip>
            </div>
            <!-- Отправитель/Получатель -->
            <div class="operations-table__cell w100pc">
                <div>
                    <div>
                        <div class="operation-title">{{ counterparty.name }}</div>
                        <span v-if="counterparty.inn" class="operation-description">{{ 'ИНН: ' + counterparty.inn }}</span>
                    </div>
                    <span class="operation-status">{{ counterparty.comment }}</span>
                    <!-- Статус и панель быстрых действий -->
                    <div class="operation-actions">
                        <a v-if="counterparty.accounts.length" title="Создать платеж" class="icon icon-circle-pay" @click.stop="goToPaymentCreate"></a>
                        <a title="Удалить" class="icon icon-circle-delete" @click.stop="onRemove"></a>
                    </div>
                </div>
            </div>
        </div>
    `,
    components: {IndicatorTooltip}
})
export class CounterpartyItem extends UI {

    /** Сервис для работы с контрагентами */
    @Inject
    private counterpartiesService: CounterpartiesService;
    /** Сервис для предзаполнения документа */
    @Inject
    private documentBehaviorService: DocumentBehaviorService;
    /** Сервис для работы со справочниками банков */
    @Inject
    private bankService: BankService;
    /** Отображаемый контрагент */
    @Prop({required: true})
    private counterparty: Counterparty;

    /**
     * Осуществляет переход на страницу создания платежа если у контрагента один счет или был выбран в диалоге
     */
    @CatchErrors
    private async goToPaymentCreate(): Promise<void> {
        const accounts = await CounterpartyHelper.prepareAccounts(this.counterparty.accounts);
        let paymentObject = null;
        if (this.counterparty.accounts.length === 1) {
            paymentObject = this.createCounterpartyPaymentInfo(this.counterparty.accounts[0]);
        } else {
            const account = await new SelectCounterpartyAccountDialog().show({
                counterpartyName: this.counterparty.name,
                accounts
            });
            if (account) {
                paymentObject = this.createCounterpartyPaymentInfo(account);
            }
        }
        if (paymentObject) {
            this.documentBehaviorService.setBehavior(paymentObject);
            this.$router.push({name: "paymentNew", params: {id: "new"}});
        }
    }

    /**
     * Создает объект для передачи в платежное поручение
     * @param account выбранный счет
     */
    private createCounterpartyPaymentInfo(account: CounterpartyAccount): ExtendedDocumentBehavior {
        return {
            formPaymentType: FormPaymentType.getByCode(this.counterparty.paymentForm),
            content: {
                RCPT_INN: CommonUtils.trimToEmpty(this.counterparty.inn),
                RCPT_KPP: CommonUtils.trimToEmpty(this.counterparty.kpp),
                RCPT_NAME: CommonUtils.trimToEmpty(this.counterparty.name),
                RCPT_BANK_BIC: CommonUtils.trimToEmpty(account.bic),
                RCPT_ACCOUNT: CommonUtils.trimToEmpty(account.account)
            },
        };
    }

    /**
     * Осуществляет преход на страницу просмотра контрагента
     */
    private goToCounterpartyInfo(): void {
        this.$router.push({name: "counterpartyView", params: {tab: "info", id: this.counterparty.id}});
    }

    /**
     * Удаляет контрагента
     */
    @CatchErrors
    private async onRemove(): Promise<void> {
        if (await new RemoveConfirmDialog().show("Удалить контрагента без возможности восстановления?") === BtnReturn.YES) {
            await this.counterpartiesService.removeCounterparty(this.counterparty.id);
            UI.emit(GlobalEvent.REFRESH_COUNTERPARTIES_LIST);
        }
    }

    /**
     * Добавляет или снимает отметку “избранного” контрагента
     */
    @CatchErrors
    private async toggleMarked(): Promise<void> {
        await this.counterpartiesService.setCounterpartyMark(this.counterparty.id, !this.counterparty.isMarked);
        this.counterparty.isMarked = !this.counterparty.isMarked;
        this.$emit("mark");
    }
}

/** Данные необходимые для совершения платежа по данному контрагенту */
export type CounterpartyPaymentInfo = {
    /** ИНН контрагента */
    inn?: string;
    /** КПП контрагента */
    kpp?: string;
    /** Наименование контрагента */
    name: string;
    /** Счет контрагента */
    counterpartyAccount: CounterpartyAccount;
    /** Контакты контрагента */
    counterpartyContacts: CounterpartyContact[];
    /** Форма документа, открываемая при создании п/п. */
    paymentForm: number;
};

/**
 * Данные по счету контрагента
 */
export type CounterpartyAccountExtended = CounterpartyAccount & {
    /** Название банка контрагента */
    bankName: string;
    /** Счет банка */
    bankAccount?: string
};
