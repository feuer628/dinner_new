import {ChargeCreatorStatus, ChargeCreatorStatuses} from "./chargeCreatorStatuses";
import {DocumentContent} from "./document";

/**
 * Класс для заполнения бюджетных полей контента
 */
export class PaymentChargeFields {

    /**
     * Конструктор
     * @param chargeCreatorField - наименование поля: статус составителя документа
     * @param chargeBasisField   - наименование поля: основание бюджетного платежа
     * @param chargePeriodField  - наименование поля: налоговый период/код таможенного органа
     * @param chargeOkatoField   - наименование поля: код ОКТМО
     * @param chargeKbkField     - наименование поля: код КБК
     * @param chargeNumDocField  - наименование поля: номер документа
     * @param chargeDateDocField - наименование поля: дата документа
     */
    constructor(private chargeCreatorField: string, private chargeBasisField: string, private chargePeriodField: string, private chargeOkatoField: string,
                private chargeKbkField: string, private chargeNumDocField: string, private chargeDateDocField: string) {
    }

    /**
     * Метод заполнения бюджетных полей значениями по-умолчанию
     * @param status  статус составителя
     * @param content контент
     * @returns {Promise<void>}
     */
    apply(status: ChargeCreatorStatus, content: DocumentContent): void {
        content[this.chargeCreatorField] = status.id;
        content[this.chargeNumDocField] = [ChargeCreatorStatuses.getDefaultGisGmsStatus().id, "16"].includes(status.id) ? "0" : "";
        content[this.chargeBasisField] = "0";
        content[this.chargePeriodField] = "0";
        content[this.chargeDateDocField] = "0";
    }

    clear(content: DocumentContent): void {
        content[this.chargeCreatorField] = "";
        content[this.chargeKbkField] = "";
        content[this.chargeOkatoField] = "";
        content[this.chargeBasisField] = "";
        content[this.chargePeriodField] = "";
        content[this.chargeNumDocField] = "";
        content[this.chargeDateDocField] = "";
    }
}