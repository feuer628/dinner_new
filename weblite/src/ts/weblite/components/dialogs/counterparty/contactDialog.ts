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
import {EmailMaskOptions, PhoneMaskOptions} from "platform/masks";
import {Component} from "platform/ui";
import {CustomDialog} from "platform/ui/dialogs/customDialog";
import {XTextField} from "platform/ui/xTextField";
import {CounterpartiesService, Counterparty, CounterpartyContact} from "../../../service/counterpartiesService";

/**
 * Диалог добавления/редактирования контакта контрагента
 */
@Component({
    // language=Vue
    template: `
        <dialog-form v-if="contact && counterparty" :title="(contact.id ? 'Редактирование' : 'Добавление нового') + ' контакта'" :width="650" :close="close">
            <template slot="content">
                <div class="form-row">
                    <!-- ФИО -->
                    <x-textfield ref="fioInput" v-model="contact.fio" :format="{type: 'text', rule: '190'}" title="ФИО" class="full"
                                 @keyup.enter="saveContact"></x-textfield>
                    <!-- Должность -->
                    <x-textfield v-model="contact.position" :format="{type: 'text', rule: '100'}" title="Должность" class="full"
                                 @keyup.enter="saveContact"></x-textfield>
                </div>
                <div class="form-row">
                    <!-- Телефон -->
                    <x-masked-input :maxLength="20" title="Телефон" v-model="contact.phone" :mask="phoneMask"
                                    name="PHONE"
                                    v-validate.initial="{phone: true}"
                                    class="full" @keyup.enter="saveContact"/>

                    <!-- Email -->
                    <x-masked-input :maxLength="50" title="Email" v-model="contact.email" :mask="emailMask"
                                    name="EMAIL"
                                    v-validate.initial="{email: true}"
                                    class="full" @keyup.enter="saveContact"/>
                </div>
            </template>

            <template slot="footer">
                <div class="dialog-footer__btns">
                    <button class="btn btn-primary" @click.stop="saveContact">{{ contact.id ? 'Сохранить' : 'Добавить' }}</button>
                    <button class="btn" @click="close">Отмена</button>
                </div>
            </template>
        </dialog-form>
    `
})
export class ContactDialog extends CustomDialog<ContactDialogData, string> {

    /** Ссылки на элементы формы */
    $refs: {
        fioInput: XTextField
    };

    /** Сервис для работы с контрагентами */
    @Inject
    private counterpartiesService: CounterpartiesService;
    /** Маска для номера телефона */
    private phoneMask = PhoneMaskOptions;
    /** Маска для ввода email */
    private emailMask = EmailMaskOptions;
    /** Контрагент */
    private counterparty: Counterparty = null;
    /** Контакт */
    private contact: CounterpartyContact = null;

    /**
     * @inheritDoc
     */
    mounted(): void {
        this.counterparty = this.data.counterparty;
        this.contact = this.data.contact;
        this.$nextTick(() => this.$refs.fioInput.setFocus());
    }

    /**
     * Сохраняет новый контакт или обновляет существующий
     */
    @CatchErrors
    private async saveContact(): Promise<void> {
        if (!(await this.validate())) {
            return;
        }
        const id = await this.counterpartiesService.saveCounterpartyContact(this.counterparty.id, this.contact);
        this.close(id);
    }

    /**
     * Валидирует поля диалога
     */
    private async validate(): Promise<boolean> {
        // проверка заполнения хотя бы одного поля
        const result = [this.contact.email, this.contact.fio, this.contact.phone, this.contact.position].join("").trim().length > 0;
        if (!result) {
            throw new Error("В контактной информации должно быть заполнено хотя бы одно поле");
        }
        ["PHONE", "EMAIL"].forEach(fieldName => {
            const errorMessage = this.$errors.first(fieldName);
            if (errorMessage) {
                throw new Error(errorMessage);
            }
        });
        return true;
    }
}

/** Данные для диалога */
export type ContactDialogData = {
    /** Контрагент */
    counterparty: Counterparty,
    /** Контакт */
    contact: CounterpartyContact
};