/**
 * Компонент выбора дат.
 * https://github.com/nathanreyes/v-calendar
 */
declare class _VCalendar {

    static install: PluginFunction<never>;
}

declare class VCalendar extends _VCalendar {}

declare module "v-calendar" {
    export default VCalendar;
}