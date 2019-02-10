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

import {FormatterOptions} from "platform/types";
import {Component, Prop, UI} from "platform/ui";
import {ContractorInfo} from "../../components/indicatorServiceComponent";
import {FieldInfoMap} from "../../model/document";
import {ValidationResult} from "../../model/validationResult";
import {InsuranceOffice} from "../../service/taxSettingsService";
import {ValidationUtils} from "../../utils/validationUtils";

@Component({
    // language=Vue
    // TODO верстка
    template: `
        <div class="form-row form-row-wrap" style="margin-top: 26px">
            <!-- ИНН -->
            <x-textfield v-focus v-model="fssInfo.inn" :format="f.INN" title="ИНН"
                             name="INN" ref="innInput" :validation-result="getValidationResult('INN')"
                             class="small"></x-textfield>

            <!-- Блок Индикатор (Не отображается на странице) -->
            <indicator v-if="fssInfo.inn" v-show="false" :inn="fssInfo.inn" @found="onIndicatorEvent"></indicator>

            <!-- КПП -->
            <x-textfield v-model="fssInfo.kpp" :format="f.KPP" title="КПП"
                             name="KPP" :validation-result="getValidationResult('KPP')"
                             class="small"></x-textfield>

            <div class="wrapRow"></div>

            <!-- Наименование -->
            <x-textfield v-model="fssInfo.name" :format="f.RCPT_NAME" title="Наименование"
                             name="RCPT_NAME" :validation-result="getValidationResult('RCPT_NAME')"
                             class="full"></x-textfield>
        </div>
    `
})
export class FssInfoBlock extends UI {

    @Prop({required: true})
    private fssInfo: InsuranceOffice;

    /** Форматы полей */
    private fieldFormats: { [key: string]: FormatterOptions } = {
        INN: {rule: "12;!0123456789", type: "text"},
        KPP: {rule: "9;!0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", type: "text"},
        NAME: {rule: "160", type: "text"}
    };

    /**
     * Заполняет Наименование и КПП на основании информации о контрагенте из Индикатора
     * @param {ContractorInfo} contractor
     */
    private onIndicatorEvent(contractor: ContractorInfo): void {
        if (contractor) {
            this.fssInfo.name = contractor.paymentName;
            this.fssInfo.kpp = contractor.kpp;
        }
    }

    /**
     * Возвращает информацию о полях документа
     * @returns {FieldInfoMap} информация о полях документа
     */
    get f(): { [key: string]: FormatterOptions } {
        return this.fieldFormats;
    }

    /**
     * Возвращает статус валидации поля
     * @param {string} fieldName
     * @return {ValidationResult}
     */
    private getValidationResult(fieldName: string): ValidationResult {
        return ValidationUtils.getValidationResult(fieldName, this.$errors);
    }
}
