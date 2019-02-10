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

import {MaskOptions} from "imask";

/**
 * Настройки маски телефона. Не позволяет ввести в поле некорректный номер телефона.
 * Добавляет автоформатирование при вводе номера телефона.
 */
export const PhoneMaskOptions: MaskOptions = {
    mask: [
        {startsWith: "+79", mask: "{+}0 (000) 000-00-00", lazy: false},
        {startsWith: "", mask: "{+}0000000000[00000]"}
    ],
    dispatch: (appended, masked) => {
        const phone = masked.unmaskedValue + appended.replace(/\D/g, "");
        return masked.compiledMasks.find(mask => phone.startsWith(mask.startsWith));
    }
};

/**
 * Настройки маски e-mail. Не позволяет ввести в поле некорректный e-mail.
 */
export const EmailMaskOptions: MaskOptions = {
    mask: (value, masked) => {
        let atFound = false;
        for (let i = 0; i < value.length; i++) {
            const character = value.charAt(i);
            if (/\s/.test(character)) {
                return false;
            }
            if (character === "@") {
                if (atFound) {
                    return false;
                }
                atFound = true;
            }
        }
        return true;
    }
};