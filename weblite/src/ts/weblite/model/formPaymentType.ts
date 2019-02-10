import {Enum, EnumType, IStaticEnum} from "platform/enum";

/**
 * Типы платежной формы
 */
@Enum("value")
export class FormPaymentType extends (<IStaticEnum<FormPaymentType>> EnumType) {

    static readonly COUNTERPARTY = new FormPaymentType(0, "Контрагенту");
    static readonly TAX = new FormPaymentType(1, "В налоговую");
    static readonly CUSTOMS = new FormPaymentType(2, "В таможню");
    static readonly BUDGET = new FormPaymentType(3, "Прочие бюджетные");
    // TODO раскомменитровать при реализации переводов между счетами
    // static readonly  SELF = new FormPaymentType("Себе");

    private constructor(public code: number, public value: string) {
        super();
    }

    /**
     * Возвращает элемент перечисления по коду
     * @param code код
     * @return элемент перечисления
     */
    static getByCode(code: number): FormPaymentType {
        return this.values().find(item => code === item.code) || this.COUNTERPARTY;
    }
}