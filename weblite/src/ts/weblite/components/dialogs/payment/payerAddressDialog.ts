import {Component} from "platform/ui";
import {CustomDialog} from "platform/ui/dialogs/customDialog";
import {PaymentHelper} from "../../../pages/payments/paymentHelper";

/**
 * Компонент для отображения диалога для ввода адреса плательщика
 */
@Component({
    // language=Vue
    template: `
        <dialog-form title="Адрес плательщика" :width="700" :closable="false">
            <template slot="content">
                В соответствии с п.1.1 ст. 7.2 115-ФЗ, при формировании платежного документа в иностранный банк,
                в поле "Плательщик" после наименования плательщика необходимо указывать его адрес.

                <!-- Максимальная длина в поле ограничена разницей между именем плательщика (data) и 156 символами (4 символа на разделители адреса) -->
                <x-textarea :rows="3" v-model.trim="data.address" title="Адрес места нахождения" :counter="true" :maxlength="maxlength"
                            class="form-margT"></x-textarea>
            </template>

            <template slot="footer">
                <div class="dialog-footer__btns">
                    <button class="btn btn-primary" @click="close(data.address)" :disabled="data.address.length === 0 || data.address.length > maxlength">
                        ОК
                    </button>
                    <button class="btn" @click="close">Отмена</button>
                </div>
            </template>
        </dialog-form>
    `
})
export class PayerAddressDialog extends CustomDialog<PayerAddressDialogData, string> {

    /** Максимальная длина поля */
    private maxlength: number = null;

    /**
     * Выставляет значение максимальной длины поля. Делаем это после инициализации инпута чтобы входная строка не была обрезана
     * @inheritDoc
     */
    mounted(): void {
        // если все же доступное для ввода количество символов меньше нуля отображаем 156, валидатор все равно не даст ввести больше
        const ml = PaymentHelper.PAYER_NAME_MAX_LENGTH - this.data.payerName.length;
        this.maxlength = ml < 0 ? PaymentHelper.PAYER_NAME_MAX_LENGTH : ml;
    }
}

/** Данные для диалога */
export type PayerAddressDialogData = {
    /** Адрес плательщика */
    address: string,
    /** Наименование плательщика */
    payerName: string
};