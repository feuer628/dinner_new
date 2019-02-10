import VCalendar from "v-calendar";
import {Validator} from "vee-validate";
import * as VeeValidate from "vee-validate";
import {AccordionPanelComponent} from "../weblite/components/accordionPanelComponent";
import {AccountSelectComponent} from "../weblite/components/accountSelectComponent";
import {AmountComponent} from "../weblite/components/amountComponent";
import {BannerComponent} from "../weblite/components/bannerComponent";
import {DatePeriodSelectorComponent} from "../weblite/components/datePeriodSelectorComponent";
import {DocStatusComponent} from "../weblite/components/docStatusComponent";
import {ErrorBulb} from "../weblite/components/errorBulb";
import {IndicatorServiceComponent} from "../weblite/components/indicatorServiceComponent";
import {InplaceInput} from "../weblite/components/inplaceInput";
import {InputButton} from "../weblite/components/inputButton";
import {MessageComponent} from "../weblite/components/message/messageComponent";
import {ProgressButton} from "../weblite/components/progressButton";
import {QrCode} from "../weblite/components/qrCode";
import {SearchComponent} from "../weblite/components/searchComponent";
import {Select} from "../weblite/components/vue_select/select";
import {HcsData} from "../weblite/pages/payments/hcsPaymentBlock";
import {UI} from "./ui";
import {AttachDirective} from "./ui/directives/attachDirective";
import {ClickOutsideDirective} from "./ui/directives/clickOutsideDirective";
import {FocusDirective} from "./ui/directives/focusDirective";
import {SafeHtmlDirective} from "./ui/directives/safeHtmlDirective";
import {Filters} from "./ui/filters";
import {Spinner} from "./ui/spinner";
import {XButtonGroup} from "./ui/xButtonGroup";
import {XCheckBox} from "./ui/xCheckBox";
import {XMaskedInput} from "./ui/xMaskedInput";
import {XSwitch} from "./ui/xSwitch";
import {XTextArea} from "./ui/xTextArea";
import {XTextField} from "./ui/xTextField";
import {ruLocale} from "./veeValidateMessages";

/**
 * Реестр стандартных UI-компонтентов, фильтров и директив
 */
export class UIRegistry {

    /**
     * Инициализация реестра компонентов, фильтров и директив
     */
    static init() {
        // плагины
        UI.use(VCalendar, {locale: "ru-RU"});
        UI.use(VeeValidate, {
            errorBagName: "$errors",
            fieldsBagName: "$fields",
            // оставляем только событие input для текстовых полей и afterselect для v-select чтобы валидация не проставляла ошибки при blur на пустых полях
            events: "input|afterselect",
        });

        // компоненты
        UI.component("accordeon-panel", AccordionPanelComponent);
        UI.component("banner", BannerComponent);
        UI.component("x-button-group", XButtonGroup);
        UI.component("x-textarea", XTextArea);
        UI.component("x-textfield", XTextField);
        UI.component("x-checkbox", XCheckBox);
        UI.component("spinner", Spinner);
        UI.component("message", MessageComponent);
        UI.component("date-period-selector", DatePeriodSelectorComponent);
        UI.component("search", SearchComponent);
        UI.component("v-select", Select);
        UI.component("qr-code", QrCode);
        UI.component("inplace-input", InplaceInput);
        UI.component("indicator", IndicatorServiceComponent);
        UI.component("doc-status", DocStatusComponent);
        UI.component("account-select", AccountSelectComponent);
        UI.component("error-bulb", ErrorBulb);
        UI.component("amount", AmountComponent);
        UI.component("progress-button", ProgressButton);
        UI.component("input-button", InputButton);
        UI.component("x-switch", XSwitch);
        UI.component("x-masked-input", XMaskedInput);

        // фильтры
        UI.filter("displayDateWithYear", Filters.formatDisplayDateWithYear);
        UI.filter("displayDate", Filters.formatDisplayDate);
        UI.filter("date", Filters.formatDate);
        UI.filter("amount", Filters.formatAmount);
        UI.filter("formatBytes", Filters.formatBytes);
        UI.filter("capitalize", Filters.capitalize);
        UI.filter("phone", Filters.formatPhone);
        UI.filter("decl", Filters.decl);

        // директивы
        UI.directive(AttachDirective.NAME, new AttachDirective());
        UI.directive(ClickOutsideDirective.NAME, new ClickOutsideDirective());
        UI.directive(FocusDirective.NAME, new FocusDirective());
        UI.directive(SafeHtmlDirective.NAME, new SafeHtmlDirective());

        // инициализация валидатора и кастомных проверок
        UIRegistry.initValidator();
    }

    /**
     * Добавляет кастомные проверки для валидатора
     */
    private static initValidator(): void {
        Validator.extend("amount", {
            getMessage(field: string): string {
                return `Значение должно быть больше нуля`;
            },
            validate(value: string): boolean {
                return value && new BigDecimal(value).compareTo(BigDecimal.ZERO) > 0;
            }
        });
        // Валидация телефонов (см. com.bifit.ibank.util.PhoneUtils)
        Validator.extend("phone", {
            getMessage(field: string, params: string[], data: string): string {
                return data;
            },
            validate(value: string): object {
                if (!value.startsWith("+")) {
                    return {valid: false, data: "Номер телефона должен начинаться со знака \"+\""};
                } else if (value.length === 1) {
                    return {valid: false, data: "Номер телефона не указан"};
                } else if (!value.substring(1).matches("\\d+")) {
                    return {valid: false, data: "Номер телефона должен содержать только цифры после знака \"+\""};
                } else if (value.startsWith("+79")) {
                    if (value.length !== 12) {
                        return {valid: false, data: "Российский номер телефона должен состоять из 11 цифр"};
                    }
                } else if (value.length < 11 || value.length > 16) {
                    return {valid: false, data: "Номер телефона должен содержать от 10 до 15 цифр"};
                }
                return {valid: true};
            }
        });
        Validator.extend("hcs_id_regex", {
            getMessage(field: string, params: string[], data: string): string {
                return data;
            },
            validate(value: string, data: HcsData[]): object {
                if (!data || data.length === 0) {
                    return {valid: true};
                }
                const isValid = new RegExp(data[0].hcsType.pattern).test(value);
                return {valid: isValid, data: isValid ? "" : data[0].hcsType.errorMessage};
            }
        });
        // устанавливаем формат даты по умолчанию
        Validator.dictionary.setDateFormat("ru", "DD.MM.YYYY");
        // устанавливаем локализованные сообщения
        Validator.localize("ru", ruLocale);
    }
}
