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

import {Enum, EnumType, IStaticEnum} from "platform/enum";

/**
 * Типы клиентов
 */
@Enum("value")
export class ClientType extends (<IStaticEnum<ClientType>> EnumType) {

    /** Юридическое лицо */
    static readonly CORPORATE = new ClientType("0", "Юридическое лицо");

    /** Индивидуальный предприниматель */
    static readonly INDIVIDUAL = new ClientType("1", "Индивидуальный предприниматель");

    /** Нотариус */
    static readonly NOTARY = new ClientType("2", "Нотариус");

    /** Адвокат */
    static readonly LAWYER = new ClientType("3", "Адвокат");

    /** Крестьянское (фермерское) хозяйство */
    static readonly FARM = new ClientType("4", "Крестьянское (фермерское) хозяйство");

    /** Банк-корреспондент */
    static readonly BANK_CORR = new ClientType("5", "Банк-корреспондент");

    private constructor(public value: string, public description: string) {
        super();
    }
}
