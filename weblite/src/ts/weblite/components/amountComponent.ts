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
import {Component, Prop, UI, Watch} from "platform/ui";
import {Filters} from "platform/ui/filters";

/**
 * Компонент форматирует сумму для стилизованного отображения
 */
@Component({
    // language=Vue
    template: `
        <div :class="type" v-if="value">
            <span v-if="type">{{ 'income' === type ? '+' : '-' }}</span>
            <span class="integer-amount">{{ integerAmount }}</span><span class="fractional-amount">,{{ fractionAmount }} &#8381;</span>
        </div>
        <div v-else></div>
    `
})
export class AmountComponent extends UI {

    /** Сумма */
    @Prop({required: true})
    private value: string;

    /**
     * Тип отображения суммы: income - зачисление, expense - списание, rejected_expense - операция отвергнута, in_progress_expense - операция на обработке
     */
    @Prop({
        type: String,
        validator: (value: string) => {
            return !value || [AmountType.INCOME, AmountType.EXPENSE, AmountType.REJECTED_EXPENSE, AmountType.UNPROCESSED_EXPENSE].includes(value as AmountType);
        }
    })
    private type: string;

    /** Целая часть суммы */
    private integerAmount: string;

    /** Дробная часть суммы */
    private fractionAmount: string;

    /**
     * Подготавливает отображаемое значение суммы
     * @inheritDoc
     */
    created(): void {
        this.updateAmount(this.value);
    }

    @Watch("value")
    private updateAmount(val: string) {
        if (!val) {
            return;
        }
        const formattedAmount = Filters.formatAmount(val);
        const dotIndex = formattedAmount.indexOf(".");
        this.integerAmount = formattedAmount.substring(0, dotIndex);
        this.fractionAmount = formattedAmount.substring(dotIndex + 1, formattedAmount.length);
    }
}

/** Перечисление типов отображения суммы */
export enum AmountType {

    /** Операция поступления */
    INCOME = "income",
    /** Операция списания */
    EXPENSE = "expense",
    /** Отвергнутая операция списания */
    REJECTED_EXPENSE = "rejected_expense",
    /** Операция списания в обработке */
    UNPROCESSED_EXPENSE = "unprocessed_expense"
}