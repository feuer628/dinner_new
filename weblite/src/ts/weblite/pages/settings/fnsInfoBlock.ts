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
import {FormatterOptions} from "platform/types";
import {Component, Prop, UI} from "platform/ui";
import {CommonUtils} from "platform/utils/commonUtils";
import {ContractorInfo} from "../../components/indicatorServiceComponent";
import {FieldInfoMap} from "../../model/document";
import {ValidationResult} from "../../model/validationResult";
import {BankData, BankService} from "../../service/bankService";
import {IndicatorTaxOfficeModel, TaxOffice, TaxSettingsService} from "../../service/taxSettingsService";
import {AccountUtils} from "../../utils/accountUtils";
import {ValidationUtils} from "../../utils/validationUtils";

@Component({
    // language=Vue
    // TODO верстка
    template: `
        <div>
            <div v-if="hasIndicatorLicense" class="form-row" style="padding-top: 15px">
                <x-checkbox v-model="taxOffice.fillFromIndicator" @input="onIndicatorToggle"></x-checkbox>
                <div><span>Использовать реквизиты ИФНС из сервиса </span>
                    <a v-if="taxOffice" :href="reportUrl" target="_blank">Индикатор</a>
                    <span v-else>Индикатор</span>
                </div>
            </div>
            <div class="form-row form-row-wrap" style="margin-top: 26px">
                <!-- ИНН -->
                <x-textfield :readonly="readonlyMode" v-focus v-model="taxOffice.inn" :format="f.INN" title="ИНН" @input="innFoundInIndicator = false"
                             name="INN" ref="innInput" :validation-result="getValidationResult('INN')"
                             class="small"></x-textfield>

                <!-- Блок Индикатор (Не отображается на странице) -->
                <indicator v-if="taxOffice.inn" v-show="false" :inn="taxOffice.inn" :immediate-check="false" @found="onIndicatorEvent"></indicator>

                <!-- КПП -->
                <x-textfield :readonly="readonlyMode" v-model="taxOffice.kpp" :format="f.KPP" title="КПП"
                             name="KPP" :validation-result="getValidationResult('KPP')"
                             class="small"></x-textfield>

                <div class="wrapRow"></div>

                <!-- Наименование -->
                <x-textfield :readonly="readonlyMode" v-model="taxOffice.name" :format="f.RCPT_NAME" title="Наименование"
                             name="RCPT_NAME" :validation-result="getValidationResult('RCPT_NAME')"
                             class="full"></x-textfield>
            </div>

            <div class="form-row">
                <!-- БИК банка -->
                <x-textfield :readonly="readonlyMode" :value="taxOffice.bic" @input="onRcptBankBicFilled"
                             :format="f.BANK_BIC" title="БИК банка"
                             name="BANK_BIC" :validation-result="getValidationResult('BANK_BIC')"
                             class="small"></x-textfield>

                <!-- Счет -->
                <x-textfield :readonly="readonlyMode" v-model="taxOffice.account" :format="f.ACCOUNT" title="Счет"
                             name="ACCOUNT" :validation-result="getValidationResult('ACCOUNT')"
                             class="full"></x-textfield>
            </div>

            <div class="form-row">
                <!-- Наименование банка -->
                <v-select v-if="!readonlyMode" v-model="taxOffice.bankName"
                          title="Наименование банка"
                          :searchable="true"
                          :clearable="false"
                          :no-drop-if-selected="true"
                          :clear-search-on-blur="false"
                          :emit-on-created="false"
                          label="bank_name"
                          @afterselect="onBankSelect"
                          @search="searchRcptBank"
                          :options="banks"
                          name="BANK_NAME"
                          :validation-result="getValidationResult('BANK_NAME')"
                          class="full">
                </v-select>

                <x-textfield v-else :readonly="true" :value="taxOffice.bankName" :format="f.BANK_NAME" title="Наименование банка" class="full"></x-textfield>
            </div>

            <div class="form-row">
                <!-- ОКТМО -->
                <x-textfield :readonly="readonlyMode" v-model="taxOffice.oktmo" :format="f.OKTMO" title="ОКТМО"
                             name="OKTMO" :validation-result="getValidationResult('OKTMO')" class="medium"></x-textfield>
            </div>
        </div>
    `
})
export class FnsInfoBlock extends UI {

    /** Сервис по работе с банками */
    @Inject private bankService: BankService;
    /** Сервис по работе с налоговыми настройками */
    @Inject private taxSettingsService: TaxSettingsService;

    @Prop({required: true})
    private taxOffice: TaxOffice;
    /** Признак наличия лицензии сервиса Индикатор */
    @Prop({required: true, type: Boolean})
    private hasIndicatorLicense: boolean;

    /** Кор. счет банка */
    private bankAccount: string;
    /** Признак успешного поиска по ИНН ФНС в индикаторе */
    private innFoundInIndicator = false;

    /** Форматы полей */
    private fieldFormats: { [key: string]: FormatterOptions } = {
        INN: {rule: "12;!0123456789", type: "text"},
        KPP: {rule: "9;!0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", type: "text"},
        NAME: {rule: "160", type: "text"},
        BANK_BIC: {rule: "9;!0123456789", type: "text"},
        ACCOUNT: {rule: "20;!0123456789", type: "fixed-text"},
        BANK_NAME: {rule: "80", type: "text"},
        OKTMO: {rule: "8;!0123456789", type: "text"}
    };
    /** Информация о найденных банках */
    private banks: BankData[] = [];
    /** Текущий объект таймера */
    private currentTimer: number = null;

    /**
     * Сравнивает текущие и полученные из "Индикатора" реквизиты ФНС и инициирует событие в случае их отличия
     * @inheritDoc
     */
    async created(): Promise<void> {
        if (this.taxOffice.fillFromIndicator) {
            try {
                const indicatorResponse = await this.taxSettingsService.getIndicatorTaxOffice();
                this.innFoundInIndicator = true;
                if (!CommonUtils.comparePlainObjects({...this.taxOffice, ...indicatorResponse}, this.taxOffice)) {
                    this.fillTaxOffice(indicatorResponse);
                    this.$emit("update");
                }
            } catch (mute) {
            }
        }
    }

    /**
     * Осуществляет поиск банка по БИК. Если банк найден, заполняется поле
     * Наименование банка получателя, список банков очищается.
     * @param newValue новое значение
     * @return {Promise<void>}
     */
    @CatchErrors
    private async onRcptBankBicFilled(newValue: string): Promise<void> {
        await this.fillRcptBankInfo(newValue);
    }

    /**
     * Осуществляет поиск банка по БИК. Если банк найден, заполняется поле
     * Наименование банка получателя, список банков очищается.
     * @param rcptBankBic новое значение
     * @return {Promise<void>}
     */
    private async fillRcptBankInfo(rcptBankBic: string): Promise<void> {
        this.taxOffice.bic = rcptBankBic;
        if (this.taxOffice.bic.length === 9) {
            this.onBankSelect(await this.bankService.getBank(rcptBankBic));
            this.banks = [];
            AccountUtils.checkCbit(this.taxOffice.account, this.bankAccount, rcptBankBic);
        }
    }

    /**
     * Заполняет поля ИФНС клиента при наличии информации из сервиса Индикатор, иначе оставляет поля доступными для редактирования
     */
    @CatchErrors
    private async onIndicatorToggle(): Promise<void> {
        if (this.taxOffice.fillFromIndicator) {
            try {
                this.innFoundInIndicator = false;
                const indicatorResponse = await this.taxSettingsService.getIndicatorTaxOffice();
                this.fillTaxOffice(indicatorResponse);
                this.innFoundInIndicator = true;
            } catch (e) {
                this.taxOffice.fillFromIndicator = false;
                throw new Error(`Данные из сервиса "Индикатор" недоступны`);
            }
        }
    }

    /**
     * Обработчик выбора банка
     * @return {void}
     */
    private onBankSelect(bank: BankData): void {
        this.bankAccount = bank.bill_corr;
        this.taxOffice.bic = bank.bik;
        this.taxOffice.bankName = bank.bank_name;
    }

    /**
     * Осуществляет поиск банка получателя с задержкой ввода
     * @param {string} query
     * @param {(...args: any[]) => void} loading
     * @return {Promise<void>}
     */
    @CatchErrors
    private async searchRcptBank(query: string, loading: (...args: any[]) => void): Promise<void> {
        loading(true);
        clearTimeout(this.currentTimer);
        const delay = new Promise((resolve, reject) => {
            this.currentTimer = setTimeout(async () => {
                try {
                    this.banks = (await this.bankService.getBanks({bank_name: query, pageSize: 5, pageNumber: 0})).content;
                    loading(false);
                } catch (error) {
                    reject(error);
                }
            }, 1000);
        });

        try {
            delay.then(() => {
                clearTimeout(this.currentTimer);
                loading(false);
            });
        } catch (error) {
            clearTimeout(this.currentTimer);
            loading(false);
            throw error;
        }
    }

    /**
     * Заполняет Наименование и КПП на основании информации о контрагенте из Индикатора
     * @param {ContractorInfo} contractor
     */
    private onIndicatorEvent(contractor: ContractorInfo): void {
        if (contractor) {
            this.taxOffice.name = contractor.paymentName;
            this.taxOffice.kpp = contractor.kpp;
        }
        this.innFoundInIndicator = !!contractor;
    }

    /**
     * Заполняет поля taxOffice на основе переданного параметра из сервиса Индикатор
     */
    private fillTaxOffice(indicatorResponse: IndicatorTaxOfficeModel): void {
        this.taxOffice.inn = indicatorResponse.inn;
        this.taxOffice.kpp = indicatorResponse.kpp;
        this.taxOffice.bic = indicatorResponse.bic;
        this.taxOffice.name = indicatorResponse.name;
        this.taxOffice.oktmo = indicatorResponse.oktmo;
        this.taxOffice.account = indicatorResponse.account;
        this.taxOffice.bankName = indicatorResponse.bankName;
    }

    /**
     * Возвращает информацию о полях документа
     * @returns {FieldInfoMap} информация о полях документа
     */
    get f(): { [key: string]: FormatterOptions } {
        return this.fieldFormats;
    }

    /**
     * Возвращает признак редактирования (true, если не включено заполнение из индикатора)
     */
    get readonlyMode(): boolean {
        return this.taxOffice.fillFromIndicator;
    }

    /**
     * Возвращает статус валидации поля
     * @param {string} fieldName
     * @return {ValidationResult}
     */
    private getValidationResult(fieldName: string): ValidationResult {
        return ValidationUtils.getValidationResult(fieldName, this.$errors);
    }

    /**
     * url сервиса Индикатор для получения детального отчета
     */
    private get reportUrl(): string {
        // если введенный ИНН отсутствует в индикаторе - отображаем ссылку на страницу поиска по инн в "Индикаторе"
        if (this.innFoundInIndicator) {
            return `/ibank2/protected/indicator/GetIndicatorDetails?inn=${this.taxOffice.inn}&locale=ru_RU`;
        }
        return `/ibank2/protected/indicator/GetIndicatorContractors?query=${this.taxOffice.inn}`;
    }
}
