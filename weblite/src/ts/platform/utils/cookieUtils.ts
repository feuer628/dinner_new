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
 * Утилитный класс для работы с cookies
 */
export class CookieUtils {

    /** Добавляет ли браузер символ "/" в конец параметра path при добавлении cookie без его указания */
    private static defaultCookiePathHaveTrailingSlash: boolean = null;

    /**
     * Получить значение cookie
     * @param name {string} имя cookie
     * @returns {string}
     */
    static getCookie(name: string): string {
        const preparedName = name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1");
        const values = document.cookie.match(new RegExp("(?:^|; )" + preparedName + "=([^;]*)"));
        return values ? decodeURIComponent(values[1]) : undefined;
    }

    /**
     * Устанавливает значение cookie для всех приложений /ibank2
     * @param {string} name имя cookie
     * @param {string} valueArg значение cookie
     */
    static setIBank2Cookie(name: string, valueArg: string): void {
        // На странице логина и в приложении для корпоративных клиентов, которые расположены по адресу /ibank2
        // при установке cookie не указывается параметр path.
        // В этом случае одни браузеры добавляют cookie с параметром path "/ibank2", а другие с параметром "/ibank2/".
        // Если добавлять здесь cookie всегда с одним и тем же параметром path, то неизбежно в каких-то браузерах будет создано
        // две cookie с одним и тем же названием, но с различными параметрами path, что чревато некорректной работой приложения.
        // Поэтому здесь используется различное значение path, зависящее от текущего браузера.
        // TODO: Устанавливать "/" в качестве значения path для ibank2.ru
        const path = "/ibank2" + (this.isDefaultCookiePathHaveTrailingSlash() ? "/" : "");
        CookieUtils.setCookie(name, valueArg, {path});
    }

    /**
     * Возвращает добавляет ли браузер символ "/" в конец параметра path при добавлении cookie без его указания.
     * @return {boolean} добавляет ли браузер символ "/" в конец параметра path при добавлении cookie без его указания.
     */
    private static isDefaultCookiePathHaveTrailingSlash(): boolean {
        if (this.defaultCookiePathHaveTrailingSlash === null) {
            const pathname = location.pathname;
            if (!pathname.endsWith("/")) {
                throw new Error("Невозможно определить добавляет ли браузер символ \"/\" " +
                    "в конец параметра path при добавлении cookie без его указания для пути: " + pathname);
            }
            const name = "TMP_COOKIE_TRAILING_SLASH";
            // Добавляем по очереди две временные cookie: без параметра path и с параметром path, который содержит символ "/" в конце
            document.cookie = name + "=0";
            document.cookie = name + "=1;path=" + pathname;
            // Если cookie без параметра path была перетерта, то браузер добавляет символ "/" в конец параметра path по умолчанию
            this.defaultCookiePathHaveTrailingSlash = !document.cookie.includes(name + "=0") &&
                document.cookie.includes(name + "=1");
            // Удаляем временные куки
            document.cookie = name + "=;expires=Thu, 01-Jan-1970 00:00:01 GMT";
            document.cookie = name + "=;expires=Thu, 01-Jan-1970 00:00:01 GMT;path=" + pathname;
        }
        return this.defaultCookiePathHaveTrailingSlash;
    }

    /**
     * Установить значение cookie
     * @param {string} name имя cookie
     * @param {string} valueArg значение
     * @param {} optionsArg({"expires" : {number}, "path" : {string}, "domain" : {string}, "secure" : {boolean}}) набор опций
     */
    private static setCookie(name: string, valueArg: string, optionsArg?: any): void {
        const options = optionsArg || {};
        let expires = options.expires;
        if (typeof expires === "number" && expires) {
            const d = new Date();
            d.setTime(d.getTime() + expires * 1000);
            expires = options.expires = d;
        }
        if (expires && expires.toUTCString) {
            options.expires = expires.toUTCString();
        }
        const value = encodeURIComponent(valueArg);
        let updatedCookie = name + "=" + value;
        for (const propName in options) {
            if (options.hasOwnProperty(propName)) {
                updatedCookie += "; " + propName;
                const propValue = options[propName];
                if (propValue !== true) {
                    updatedCookie += "=" + propValue;
                }
            }
        }
        document.cookie = updatedCookie;
    }
}