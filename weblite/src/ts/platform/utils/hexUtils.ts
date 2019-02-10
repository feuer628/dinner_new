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
 * Вспомогательные методы для работы с HEX форматом
 */
export class HexUtils {

    /**
     * Не дает создать экземпляр класса
     */
    private constructor() {
    }

    /**
     * Преобразует строку в HEX формат
     * @param {string} str строка
     * @param {boolean} isUtf8 true если строка закодирована в UTF-8 или false если строка закодирована в UTF-16
     * @return {string} строка в HEX формате
     */
    static stringToHex(str: string, isUtf8 = false): string {
        let result = "";
        for (let i = 0; i < str.length; i++) {
            const hex = str.charCodeAt(i).toString(16);
            result += isUtf8 ? ("0" + hex).slice(-2) : ("000" + hex).slice(-4);
        }
        return result;
    }

    /**
     * Преобразует набор байт в HEX формат
     * @param {Blob} blob набор байт
     * @return {Promise<string>} строка в HEX формате
     */
    static blobToHex(blob: Blob): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const uint8Array = new Uint8Array(<ArrayBuffer> reader.result);
                const hex = new Array(uint8Array.length);
                for (let i = 0; i < uint8Array.length; i++) {
                    const byte = uint8Array[i];
                    const byteString = byte.toString(16).toUpperCase();
                    hex[i] = byte < 16 ? "0" + byteString : byteString;
                }
                return resolve(hex.join(""));
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(blob);
        });
    }
}