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

/**
 * Типы подтверждения документа
 */
export enum ConfirmType {
    OTP = "OTP",
    MAC = "MAC",
    SMS = "SMS",
    TAN = "TAN",
    SIGN = "SIGN",
    SMS_AND_SIGN = "SMS_AND_SIGN",
    AGSES = "AGSES",
    BIFIT_MAC = "BIFIT_MAC",
    NONE = "NONE"
}