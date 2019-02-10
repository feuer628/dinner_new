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
import {Inject, Singleton} from "platform/ioc";
import {DocumentType} from "../model/document";
import {ChannelType} from "../pages/settings/channelSettingsPanel";
import {ClientService} from "./clientService";
import {TaxCalendarService} from "./taxCalendarService";

/**
 * Сервис для получения прав клиента
 */
@Service("PermissionsService")
@Singleton
export class PermissionsService {

    /** Сервис по работе с информацией о клиенте */
    @Inject
    private clientService: ClientService;

    /** Сервис для проверки доступности налогового календаря */
    @Inject
    private taxCalendarService: TaxCalendarService;

    /**
     * Возвращает признак возможности работы с выпиской
     * @return {boolean} признак возможности работы с выпиской
     */
    hasStatementPermission(): boolean {
        const opersPermissions = this.clientService.getClientInfo().permissions.opers as any;
        return opersPermissions && opersPermissions.useRUR === "true";
    }

    /**
     * Возвращает признак возможности работы с платежными поручениями
     * @return {boolean} признак возможности работы с платежными поручениями
     */
    hasPaymentPermission(): boolean {
        return this.clientService.hasPermissions(DocumentType.PAYMENT, "r");
    }

    /**
     * Возвращает признак возможности работы с письмами
     * @return {boolean} признак возможности работы с письмами
     */
    hasLetterPermission(): boolean {
        return this.clientService.hasPermissions(DocumentType.LETTER, "r");
    }

    /**
     * Возвращает признак возможности работы с отзывами
     * @return {boolean} признак возможности работы с отзывами
     */
    hasRecallPermission(): boolean {
        return this.clientService.hasPermissions(DocumentType.RECALL, "r");
    }

    /**
     * Возвращает признак наличия прав на канал "Интернет Банк для корпоративных клиентов"
     * @return {boolean} признак наличия прав на канал "Интернет Банк для корпоративных клиентов"
     */
    hasWebChannelPermission(): boolean {
        return this.clientService.hasPermissions("internet_web", "r");
    }

    /**
     * Проверяет, разрешено ли клиенту отправлять email
     * @return {boolean}
     */
    isEmailSendingAvailable(): boolean {
        // Проверка поклиентского (при его отсутствии - системного) свойства
        return "true" === this.clientService.getClientInfo().clientProperties["PEGASUS.SEND_DOC.EMAIL.ENABLE"] &&
            // Проверка лицензии
            "true" === this.clientService.getClientInfo().clientProperties["LICENSE.SERVICE.COMPANY.SMS"] &&
            // Проверка прав на канал
            // Права на документ "doc/channels_settings" устанавливаются при включении канала (см. OrganizationTranslator.setAdditionalDocumentRights)
            // TODO возможно, правильней будет проверять права непосредственно на канал
            this.clientService.hasPermissions(DocumentType.CHANNELS_SETTINGS, "r");
    }

    /**
     * Возвращает признак возможности работы с налоговым календарем
     * @return признак возможности работы с налоговым календарем
     */
    isTaxCalendarAvailable(): boolean {
        return this.taxCalendarService.isTaxCalendarAvailable();
    }

    /**
     * Возвращает есть ли у пользователя есть доступ к хотя бы одному пункту настроек
     * @return {boolean} есть ли у пользователя есть доступ к хотя бы одному пункту настроек
     */
    hasSettingsPermissions(): boolean {
        return this.isTaxCalendarAvailable() || this.hasNotificationsPermissions() || this.hasWebChannelPermission();
    }

    /**
     * Возвращает может ли пользователь менять настройки уведомлений
     * @return {boolean} может ли пользователь менять настройки уведомлений
     */
    hasNotificationsPermissions(): boolean {
        return this.clientService.getClientInfo().clientProperties["LICENSE.SERVICE.COMPANY.SMS"] === "true" &&
            this.clientService.hasPermissions(DocumentType.CHANNELS_SETTINGS, "r");
    }

    /**
     * Возвращает список каналов доставки сообщений, доступных пользователю
     * @return {ChannelType[]} список каналов доставки сообщений, доступных пользователю
     */
    getPegasusChannels(): ChannelType[] {
        const channels = this.clientService.getClientInfo().clientProperties["PEGASUS.CHANNELS.LIST"];
        return channels ? channels.split(",").map(value => value.trim() as ChannelType) : [];
    }
}