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

import {Container} from "platform/ioc";
import {BifitMacConfirmationDialog} from "../components/dialogs/authentication/bifitMacConfirmationDialog";
import {MacConfirmationDialog} from "../components/dialogs/authentication/macConfirmationDialog";
import {OtpConfirmationDialog} from "../components/dialogs/authentication/otpConfirmationDialog";
import {SmsConfirmationDialog} from "../components/dialogs/authentication/smsConfirmationDialog";
import {SelectTokenDialog} from "../components/dialogs/selectTokenDialog";
import {ConfirmType} from "../model/confirmationType";
import {ClientTokenInfo} from "../service/clientService";
import {LoginAuthAccountService} from "../service/loginAuthAccountService";

/**
 * Вспомогательный класс для работы с расширенной аутентификацией
 */
export class TokenUtils {

    /**
     * Не дает создать экземпляр класса
     */
    private constructor() {
    }

    /**
     * Показывает диалоги расширенной аутентификации
     * @param data данные для аутентификации
     * @return параметры расширенной аутентификации либо null если пользователь отменил аутентификацию
     */
    static async showExtAuthDialog(data: {[key: string]: string}): Promise<{[key: string]: string}> {
        const tokenList = this.parseAuthenticationTypesInfo(data.OTPT);
        const selectedToken = await TokenUtils.select(tokenList);
        if (!selectedToken) {
            return null;
        }
        if (selectedToken.confirmType === ConfirmType.SMS) {
            const sessionId = await Container.get(LoginAuthAccountService).sendExtAuthSms();
            const password = await new SmsConfirmationDialog().show(sessionId);
            if (!password) {
                return null;
            }
            return {
                OTPT: TokenTypeCode.S,
                ESID: sessionId,
                OTP: password
            };
        }
        if (selectedToken.confirmType === ConfirmType.OTP) {
            const password = await new OtpConfirmationDialog().show();
            if (!password) {
                return null;
            }
            return {
                OTPT: TokenTypeCode.V,
                OTPS: selectedToken.hash,
                OTP: password
            };
        }
        if (selectedToken.confirmType === ConfirmType.MAC) {
            const password = await new MacConfirmationDialog().show();
            if (!password) {
                return null;
            }
            return {
                OTPT: TokenTypeCode.MAC,
                OTPS: selectedToken.hash,
                OTP: password
            };
        }
        if (selectedToken.confirmType === ConfirmType.BIFIT_MAC) {
            const signature = await new BifitMacConfirmationDialog().show({
                tokens: tokenList.filter(token => token.confirmType === ConfirmType.BIFIT_MAC),
                digest: data.DIGEST,
                displayData: data.TS_DATA
            });
            if (!signature) {
                return null;
            }
            return {
                OTPT: TokenTypeCode.BIFIT_MAC,
                OTPS: selectedToken.serial,
                AUTH_SIGN: signature
            };
        }
        throw new Error("Токен не поддерживается: " + selectedToken.confirmType);
    }

    /**
     * Выбирает токен из списка для использования при подтверждении.
     * При необходимости показывает пользователю диалог выбора токена.
     * Не дает пользователю выбрать какой конкретно токен типа SMS или MAC-токен BIFIT нужно использовать.
     * @param tokenList список токенов пользователя
     * @return выбранный токен или null если пользователь отменил выбор
     */
    static async select(tokenList: ClientTokenInfo[]): Promise<ClientTokenInfo> {
        // По умолчанию выбираем первый токен в списке
        let selectedToken = tokenList[0];

        const confirmTypes: ConfirmType[] = [];
        let tokenCount = 0;
        tokenList.forEach(value => {
            if (!confirmTypes.includes(value.confirmType)) {
                confirmTypes.push(value.confirmType);
            }
            // При подтверждении при помощи MAC-токена BIFIT или при помощи SMS пользователь не может выбрать какой конкретно токен использовать
            if (![ConfirmType.SMS, ConfirmType.BIFIT_MAC].includes(value.confirmType)) {
                tokenCount++;
            }
        });

        if (confirmTypes.length > 1 || tokenCount > 1) {
            // Показываем диалог выбора токена
            selectedToken = await new SelectTokenDialog().show(tokenList);
            if (!selectedToken) {
                // Пользователь нажал кнопку "Отмена" в диалоге выбора токена
                return null;
            }
        }
        return selectedToken;
    }

    /**
     * Парсит строку с типами аутентификации, переданную с сервера, в массив authenticationTypesInfo
     * @param tokenTypesString - способы аутентификации, которые доступны данному клиенту. Например:
     *          "[MAC(70450EB8851BE576EA219B44E8321F1DB2A71D11B494BCC9150DB9F8525D1133=********74;
     *          B25956544E711BE1D0CA1A22FD1D61479107D6ABF95E7149D11A5AF627BC6525=********42),
     *          S, V(CDDA3348819DE3A2FD39C2C981933E799F209EE1ACD761B347F29936D18B9BF2=********85)]" - пример формата
     *          "[MAC, S, SMS, V, OTP]" или "[S, SMS]" или "[MAC, V, OTP]" - старый формат после внедрения MAC токенов
     *          "S" или "V" или "VS" - старый формат до внедрения MAC токенов
     */
    private static parseAuthenticationTypesInfo(tokenTypesString: string): ClientTokenInfo[] {
        const tokens: ClientTokenInfo[] = [];
        // отсекаем квадратные скобки
        const tokenTypesClearString = tokenTypesString.substring(1, tokenTypesString.length - 1);
        const pattern = /^(.+)\((.*)\)$/; // регулярка для разбора строки вида "TYPE(A=B;C=D)"
        const tokenTypesStringList = tokenTypesClearString.split(", ");
        for (const tokenTypeString of tokenTypesStringList) {
            const tokenType = tokenTypeString.match(pattern);
            if (tokenType) {
                const authTypeString = tokenType[1];
                const serialStrings = tokenType[2].split(";");
                for (const serialString of serialStrings) {
                    const serial = serialString.split("=");
                    const confirmType = this.getConfirmType(authTypeString);
                    tokens.push({
                        confirmType: confirmType,
                        hash: serial[0],
                        serial: serial[1],
                        serialIsMasked: confirmType !== ConfirmType.BIFIT_MAC,
                        defaultToken: false
                    });
                }
            } else {
                // если разбор строки не удался, значит он содержит только "TYPE" без серийных номеров
                const confirmType = this.getConfirmType(tokenTypeString);
                tokens.push({
                    confirmType: confirmType,
                    hash: null,
                    serial: null,
                    serialIsMasked: false,
                    defaultToken: false
                });
            }
        }
        return tokens;
    }

    /**
     * Возвращает тип подтверждения по коду типа токена
     * @param tokenTypeCode код типа токена
     */
    private static getConfirmType(tokenTypeCode: string): ConfirmType {
        switch (tokenTypeCode) {
            case TokenTypeCode.S:
                return ConfirmType.SMS;
            case TokenTypeCode.V:
                return ConfirmType.OTP;
            case TokenTypeCode.MAC:
                return ConfirmType.MAC;
            case TokenTypeCode.BIFIT_MAC:
                return ConfirmType.BIFIT_MAC;
        }
        throw new Error("Токен не поддерживается: " + tokenTypeCode);
    }
}

/**
 * Код типа токена
 */
enum TokenTypeCode {

    /** SMS-токен */
    S = "S",

    /** OTP-токен */
    V = "V",

    /** MAC-токен */
    MAC = "MAC",

    /** MAC-токен BIFIT */
    BIFIT_MAC = "BIFIT_MAC"
}