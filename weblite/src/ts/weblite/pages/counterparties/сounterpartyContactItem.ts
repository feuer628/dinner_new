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
import {Inject} from "platform/ioc";
import {Component, Prop, UI} from "platform/ui";
import {ContactDialog} from "../../components/dialogs/counterparty/contactDialog";
import {RemoveConfirmDialog} from "../../components/dialogs/removeConfirmDialog";
import {BtnReturn} from "../../model/btnReturn";
import {GlobalEvent} from "../../model/globalEvent";
import {CounterpartiesService, Counterparty, CounterpartyContact} from "../../service/counterpartiesService";
import {CounterpartyAccountOrContactItemMenu} from "./counterpartyAccountOrContactItemMenu";

/**
 * Компонент отображения блока с данными контакта
 */
@Component({
    // language=Vue
    template: `
        <div @mouseleave="hideMenu" @click="hideMenu">
            <div @click.stop="visible=!visible" class="info-block__menu-button">
                <div class="info-block-menu-button__circle"></div>
                <div class="info-block-menu-button__circle"></div>
                <div class="info-block-menu-button__circle"></div>
                <counterparty-account-or-contact-item-menu v-if="visible" @edit="onEditContact" @delete="onDeleteContact">
                </counterparty-account-or-contact-item-menu>
            </div>
            <div>{{contact.fio}}</div>
            <div class="info-block__hint">{{ contact.position }}</div>
            <div class="info-block__label">Email</div>
            <a :href="'mailto:' + contact.email" class="info-block__mail">{{contact.email}}</a>
            <div class="info-block__label">Телефон</div>
            <div>{{contact.phone | phone }}</div>
        </div>
    `,
    components: {CounterpartyAccountOrContactItemMenu}
})
export class CounterpartyContactItem extends UI {

    /** Сервис для работы с контрагентами */
    @Inject
    private counterpartiesService: CounterpartiesService;
    /** Отображаемый контакт */
    @Prop({required: true})
    private contact: CounterpartyContact;
    /** Отображаемый контрагент */
    @Prop({required: true})
    private counterparty: Counterparty;
    /** переменная для отображения плашки меню */
    private visible = false;

    /**
     * Открывает диалог редактирования выбранного контакта
     */
    private async onEditContact(): Promise<void> {
        const selectedContact = {...this.contact};
        if (await new ContactDialog().show({counterparty: this.counterparty, contact: selectedContact})) {
            this.contact.id = selectedContact.id;
            this.contact.fio = selectedContact.fio;
            this.contact.position = selectedContact.position;
            this.contact.phone = selectedContact.phone;
            this.contact.email = selectedContact.email;
        }
    }

    /**
     * Открывает диалог удаления выбранного контакта
     */
    private async onDeleteContact(): Promise<void> {
        if (await new RemoveConfirmDialog().show("Удалить контакт контрагента без возможности восстановления?") === BtnReturn.YES) {
            await this.counterpartiesService.removeCounterpartyContact(this.counterparty.id, this.contact.id);
            UI.emit(GlobalEvent.REMOVE_COUNTERPARTY_CONTACT, this.contact);
        }
    }

    /**
     * Скрывает плашку меню
     */
    private hideMenu() {
        this.visible = false;
    }
}
