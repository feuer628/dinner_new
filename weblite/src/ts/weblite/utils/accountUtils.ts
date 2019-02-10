import {Container} from "platform/ioc";
import {Cache, CacheKey} from "platform/services/cache";
import {Account} from "../model/account";

/**
 * Утильный класс для работы со счетами
 */
export class AccountUtils {

    /** Символы для замены */
    private static readonly ADMISSIBLE_SYMBOLS = "ABCEHKMPTX";

    /** Массив с весами */
    private static readonly WEIGHTS = [7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1];

    /**
     * Конструктор
     */
    private constructor() {
    }

    /**
     * Проверяет ключевание счета
     * @param account      Счет, проверяемый на ключевание (строка)
     * @param bankAccount  Счет банка
     * @param bic          БИК банка
     * @return Результат проверки (true - контр. разр. верен: счет ключуется, false - нет)
     */
    static checkCbit(account: string, bankAccount: string, bic: string): boolean {
        if (!account || account.length !== 20 || !bic) {
            return false;
        }
        // 0001787  Online. Клиент
        if (account === "00000000000000000000") {
            return true;
        }
        if (bankAccount) {
            bankAccount = bankAccount.trim();
        }
        let un: string = null;
        if (!bankAccount || bankAccount === account) {
            // РКЦ
            if (bic.length >= 6) {
                un = "0" + bic.substring(4, 6);
            }
        } else {
            // Это кредитная организация
            if (bic.length >= 9) {
                un = bic.substring(6, 9);
            }
        }
        if (un === null) {
            return false;
        }
        // заменим контрольный разряд на 0
        let acc = account.substring(0, 8) + "0" + account.substring(9);
        // заменим символ(если такой имеется) в 6-м разряде счета на соответсвующую цифру
        const idx = AccountUtils.ADMISSIBLE_SYMBOLS.indexOf(acc.toUpperCase().substring(5, 6));
        if (idx !== -1) {
            acc = acc.substring(0, 5) + (idx % 10) + acc.substring(6);
        }
        // склеим УН с номером счета
        acc = un + acc;
        let sum = 0;
        // поразрядно перемножим получившуюся последовательность и weights
        for (let i = 0; i < acc.length; i = i + 1) {
            // в результирующий разряд заносится младшая цифра произведения
            sum += (Number(acc.charAt(i)) * AccountUtils.WEIGHTS[i]) % 10;
        }
        // Младший разряд суммы умножается на 3.
        // Значение контр. разряда - младший разряд произведения
        const controlBit = ((sum % 10) * 3) % 10;
        const cBit = Number(account.substring(8, 9));
        return controlBit === cBit;
    }

    /**
     * Возвращает найденный счет по идентификатору из кэша, либо первый из списка
     * @param accounts
     * @return счет клиента
     */
    static getAccountFromCacheOrDefault(accounts: Account[]): Account {
        let selectedAccount;
        if (accounts.length) {
            const cachedAccountId = Container.get(Cache).get<string>(CacheKey.SELECTED_ACCOUNT_ID_KEY);
            if (cachedAccountId) {
                selectedAccount = accounts.find(account => account.ibankAccountId === cachedAccountId);
            }
            if (!selectedAccount) {
                selectedAccount = accounts[0];
            }
        }
        return selectedAccount;
    }
}