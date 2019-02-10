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

import Moment = moment.Moment;

/**
 * Утилитный клас для работы с датами
 */
export class DateUtils {

    /**
     * Проверяет что переданная дата указывает на текущий день
     * @param {moment.Moment} date проверяемая дата
     * @return {boolean} {@code true} если переданная дата - текущий день, иначе {@code false}
     */
    static isCurrentDate(date: Moment): boolean {
        return moment().startOf("day").isSame(date.clone().startOf("day"));
    }

    /**
     * Проверяет что переданная дата находится в рамках текущего года
     * @param {moment.Moment} date проверяемая дата
     * @return {boolean} {@code true} если переданная дата находится в рамках текущего года, иначе {@code false}
     */
    static isCurrentYear(date: Moment): boolean {
        return moment().startOf("year").isSame(date.clone().startOf("year"));
    }

    /**
     * Возвращает объект типа {@link Moment} из строки в указанном формате (по умолчанию - {@link DateFormat.DATE}
     * @param {string} stringValue строковое значение даты
     * @param {string | DateFormat} format формат в виде строки (см. {@link https://momentjs.com/docs/#/parsing/string-format/})
     * @return {moment.Moment}
     */
    static parseDate(stringValue: string, format: string | DateFormat = DateFormat.DATE): Moment {
        return moment(stringValue, format);
    }

    /**
     * Форматирование даты для отображения
     * @param {moment.Moment} date дата
     * @param {boolean} showYear признак необходимости отображения года, если год в дате не соответствует текущему
     * @return {string} отформатированная дата
     */
    static formatDisplayDate(date: Moment, showYear = true): string {
        return DateUtils.isCurrentDate(date) ? "Сегодня" :
            date.format(!showYear || DateUtils.isCurrentYear(date) ? DateFormat.CURRENT_YEAR_FORMAT : DateFormat.ANOTHER_YEAR_FORMAT);
    }

    /**
     * Сравнивает даты
     * @param checkDate1 дата для сравнения
     * @param checkDate2 дата для сравнения
     * @return {@code 0} - даты равны
     *         {@code 1} - checkDate1 > checkDate2
     *         {@code -1} - checkDate1 < checkDate2
     */
    static compareDate(checkDate1: moment.MomentInput, checkDate2: moment.MomentInput): number {
        const date1 = moment(checkDate1, DateFormat.DATE, true);
        const date2 = moment(checkDate2, DateFormat.DATE, true);
        if (date1.isSame(date2)) {
            return 0;
        }
        return date1.isAfter(date2) ? 1 : -1;
    }
}

/**
 * Перечисление используемых форматов даты (см. {@link https://momentjs.com/docs/#/parsing/string-format/})
 */
export enum DateFormat {
    DATE = "L",  // DD.MM.YYYY
    CURRENT_YEAR_FORMAT = "DD MMMM",
    ANOTHER_YEAR_FORMAT = "DD MMMM YYYY"
}