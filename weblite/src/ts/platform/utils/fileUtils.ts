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
 * Утилиты по работе с файлами
 */
export class FileUtils {

    /**
     * Не дает создать экземпляр класса
     */
    private constructor() {
    }

    /**
     * Преобразует объект FileList в список файлов
     * @param fileList объект FileList
     * @return список файлов
     */
    static fileListToFileArray(fileList: FileList): File[] {
        return Array.prototype.map.call(fileList, (item: File) => item);
    }
}