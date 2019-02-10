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
import {Container} from "platform/ioc";
import {FormPaymentType} from "../../model/formPaymentType";
import {BankData, BankService} from "../../service/bankService";
import {CounterpartyAccount} from "../../service/counterpartiesService";
import {CounterpartyAccountExtended} from "./counterpartyItem";

/**
 * Утилитный класс для работы с Контрагентами
 */
export class CounterpartyHelper {

    /** Конструктор */
    private constructor() {
    }

    /**
     * Подготавливает список счетов, заполняет поле Название банка
     */
    static async prepareAccounts(accounts: CounterpartyAccount[]): Promise<CounterpartyAccountExtended[]> {
        const bics = accounts.map(account => account.bic)
            .filter((value, index, self) => self.indexOf(value) === index);
        const banks = await Container.get(BankService).getBanksByBics(bics);
        const banksByBic: { [key: string]: BankData } = {};
        for (const bank of banks) {
            banksByBic[bank.bik] = bank;
        }
        return accounts.map(account => {
            return {
                ...account,
                bankName: banksByBic[account.bic] ? banksByBic[account.bic].bank_name : "",
                bankAccount: banksByBic[account.bic] ? banksByBic[account.bic].bill_corr : ""
            };
        });
    }
}
