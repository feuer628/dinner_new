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

import {Service} from "platform/decorators/service";
import {Enum, EnumType, IStaticEnum} from "platform/enum";
import {Inject, Singleton} from "platform/ioc";
import {Http} from "platform/services/http";

/** URL к настройкам страницы "Налоги" */
const TAX_SETTINGS_URL = "/ibank2/protected/services/settings/tax";
/** URL к данным ИФНС из сервиса индикатор */
const INDICATOR_TAX_OFFICE_URL = "/ibank2/protected/services/indicator/tax_office";

/**
 * Сервис по работе с настройками налогов
 */
@Service("TaxSettingsService")
@Singleton
export class TaxSettingsService {

    /** HTTP-транспорт */
    @Inject
    private http: Http;

    /** Кэшированные настройки налогов */
    private taxSettings: TaxSettings;

    /**
     * Сохраняет переданные настройки
     * @param selectedOptions объект настроек
     */
    async saveTaxSettings(selectedOptions: TaxSettings): Promise<void> {
        const request: TaxSettingsModel = {
            taxPolicySettings: {
                taxSystem: selectedOptions.taxPolicySettings.taxSystem.value,
                taxPeriodType: selectedOptions.taxPolicySettings.taxPeriodType ? selectedOptions.taxPolicySettings.taxPeriodType.value : null,
                taxObject: selectedOptions.taxPolicySettings.taxObject ? selectedOptions.taxPolicySettings.taxObject.value : null,
                hasEmployees: selectedOptions.taxPolicySettings.hasEmployees.value,
                notificationPeriod: Number(selectedOptions.taxPolicySettings.notificationPeriod)
            },
            taxOffice: selectedOptions.taxOffice,
            insuranceOffice: selectedOptions.insuranceOffice
        };
        await this.http.post<void>(TAX_SETTINGS_URL, request);
        this.taxSettings = null;
    }

    /**
     * Возвращает объект для работы с настройками
     */
    async getTaxSettings(): Promise<TaxSettings> {
        if (!this.taxSettings) {
            await this.loadTaxSettings();
        }
        return this.taxSettings;
    }

    /**
     * Возвращает признак того, что клиент выбрал систему налогообложения
     * @return признак того, что клиент выбрал систему налогообложения
     */
    async hasTaxSystemInSettings(): Promise<boolean> {
        return !!(await this.getTaxSettings()).taxPolicySettings.taxSystem;
    }

    /**
     * Возвращает реквизиты ИФНС клиента из сервиса Индикатор
     */
    async getIndicatorTaxOffice(): Promise<IndicatorTaxOfficeModel> {
        return this.http.get<IndicatorTaxOfficeModel>(INDICATOR_TAX_OFFICE_URL);
    }

    /**
     * Загружает список налоговых событий
     */
    private async loadTaxSettings(): Promise<void> {
        const response = await this.http.get<TaxSettingsModel>(TAX_SETTINGS_URL);
        this.taxSettings = {
            taxPolicySettings: {
                taxSystem: response.taxPolicySettings.taxSystem ? TaxSystem.valueByName(response.taxPolicySettings.taxSystem) : null,
                taxPeriodType: response.taxPolicySettings.taxPeriodType ? TaxPeriodType.valueByName(response.taxPolicySettings.taxPeriodType) : null,
                taxObject: response.taxPolicySettings.taxObject ? TaxObject.valueByName(response.taxPolicySettings.taxObject) : null,
                hasEmployees: response.taxPolicySettings.hasEmployees ? HasEmployees.TRUE : HasEmployees.FALSE,
                notificationPeriod: response.taxPolicySettings.notificationPeriod ? response.taxPolicySettings.notificationPeriod.toString() : ""
            },
            insuranceOffice: response.insuranceOffice,
            taxOffice: response.taxOffice
        };
    }
}

/** Перечисление опций выпадающего списка "Система налогообложения" */
@Enum("value")
export class TaxSystem extends (<IStaticEnum<TaxSystem>> EnumType) {
    static readonly OSN = new TaxSystem("OSN", "Основная (ОСН)");
    static readonly USN = new TaxSystem("USN", "Упрощенная (УСН)");
    static readonly ENVD = new TaxSystem("ENVD", "Единый налог на вменённый доход (ЕНВД)");
    static readonly PSN = new TaxSystem("PSN", "Патентная (ПС)");

    constructor(public value: string, public label: string) {
        super();
    }
}

/** Перечисление опций выпадающего списка "Периодичности выплат налога на прибыль" */
@Enum("value")
export class TaxPeriodType extends (<IStaticEnum<TaxPeriodType>> EnumType) {
    static readonly MONTHLY = new TaxPeriodType("MONTHLY", "Ежемесячно");
    static readonly QUARTERLY = new TaxPeriodType("QUARTERLY", "Ежеквартально");

    constructor(public value: string, public label: string) {
        super();
    }
}

/** Перечисление опций выпадающего списка "Объекта налогообложения" */
@Enum("value")
export class TaxObject extends (<IStaticEnum<TaxObject>> EnumType) {
    static readonly INCOME = new TaxObject("INCOME", "Доходы");
    static readonly INCOME_LESS_EXPENSE = new TaxObject("INCOME_LESS_EXPENSE", "Доходы минус расходы");

    constructor(public value: string, public label: string) {
        super();
    }
}

/** Перечисление опций выпадающего списка "Наличие сотрудников" */
@Enum()
export class HasEmployees extends (<IStaticEnum<HasEmployees>> EnumType) {
    static readonly TRUE = new HasEmployees(true, "Есть");
    static readonly FALSE = new HasEmployees(false, "Нет");

    constructor(public value: boolean, public label: string) {
        super();
    }
}

/** Модель, содержащая настройки учетной политики клиента на клиентской части */
export type TaxSettings = {
    /** Настройки учетной политики клиента */
    taxPolicySettings?: TaxPolicySettings;
    /** Реквизиты ФСС */
    insuranceOffice?: InsuranceOffice;
    /** Реквизиты ИФНС */
    taxOffice?: TaxOffice;
};

/** Модель настроек учетной политики клиента на клиентской части */
export type TaxPolicySettings = {
    /** Система налогообложения */
    taxSystem?: TaxSystem;
    /** Периодичность выплат налога на прибыль */
    taxPeriodType?: TaxPeriodType;
    /** Объект налогообложения */
    taxObject?: TaxObject;
    /** Наличие работников */
    hasEmployees?: HasEmployees;
    /** Количество дней, за которые необходимо уведомлять клиента о наступлении события */
    notificationPeriod?: string;
};

/** Модель, содержащая настройки учетной политики клиента на серверной части */
export type TaxSettingsModel = {
    /** Настройки учетной политики клиента */
    taxPolicySettings?: TaxPolicySettingsModel;
    /** Реквизиты ФСС */
    insuranceOffice?: InsuranceOffice;
    /** Реквизиты ИФНС */
    taxOffice?: TaxOffice;
};

/** Модель настроек учетной политики клиента на серверной части */
export type TaxPolicySettingsModel = {
    /** Система налогообложения */
    taxSystem?: string;
    /** Периодичность выплат налога на прибыль */
    taxPeriodType?: string;
    /** Объект налогообложения */
    taxObject?: string;
    /** Наличие работников */
    hasEmployees?: boolean;
    /** Количество дней, за которые необходимо уведомлять клиента о наступлении события */
    notificationPeriod?: number;
};

/** Модель реквизитов ИФНС */
export type IndicatorTaxOfficeModel = {
    /** ИНН */
    inn?: string;
    /** КПП */
    kpp?: string;
    /** Наименование */
    name?: string;
    /** Наименование банка */
    bankName?: string;
    /** БИК */
    bic?: string;
    /** Номер счета */
    account?: string;
    /** ОКТМО */
    oktmo?: string;
};

/** Реквизиты ФСС клиента */
export type InsuranceOffice = {
    /** ИНН */
    inn?: string;
    /** КПП */
    kpp?: string;
    /** Наименование */
    name?: string;
};

/** Реквизиты ИФНС клиента */
export type TaxOffice = {
    /** ИНН */
    inn?: string;
    /** КПП */
    kpp?: string;
    /** Наименование */
    name?: string;
    /** Наименование банка */
    bankName?: string;
    /** БИК */
    bic?: string;
    /** Номер счета */
    account?: string;
    /** ОКТМО */
    oktmo?: string;
    /** Признак заполнения данных из сервиса Индикатор */
    fillFromIndicator: boolean
};
