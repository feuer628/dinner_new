import {StringFormat} from "stringFormat";

import {FormatterOptions} from "../../types";

export class FormatterFactory {

    /** Формат даты по умолчанию */
    static readonly DATE_FORMAT = "DD.MM.YYYY";

    /**
     * FormatterFactory
     *
     * Фабрика форматеров, на основании
     * названия форматера и  указанного правила,
     * формирует необходимый форматер.
     * Поддерживает следущие форматеры :
     *
     * Название       Правило
     * ===========   =====================
     *  number       в соответсвии с DecimalFormat
     *  date         [.][/]
     *  text         [length][;]
     */

    static getFormatter = function(options: FormatterOptions) {
        switch (options.type) {
            case "text":
                return this.getTextFormat(options.rule, false);
            case "fixed-text":
                return this.getTextFormat(options.rule, true);
            case "date":
                return this.getDateFormat(options.rule);
            case "number":
            case "amount":
            case "decimal-number":
                return this.getNumberFormat(options.rule);
            default:
                throw new Error("Formatter with name " + name + " not found.");
        }
    };

    static getTextFormat = (rule: string, isFixed?: boolean) => {
        const index = rule.indexOf(";");
        const found = index !== -1;
        const length = found ? rule.substring(0, index) : rule;
        let pattern = found ? rule.substring(index + 1) : "";
        const isInverse = pattern.startsWith("!");
        if (isInverse) {
            pattern = pattern.substr(1);
        }
        return new StringFormat(pattern, +length, isInverse, isFixed);
    }

    static getDateFormat = (rule: string) => {
        if (rule.length !== 1) {
            throw new Error("Для форматтера типа date не поддерживается правило : " + rule);
        }
        return new StringFormat("0123456789" + rule, 10, true);
    }

    static getNumberFormat = (rule: string) => {
        const rules = rule.split(";");
        const length = rules[1] ? +rules[1] : 0;
        const isDecimal = rules[0].charAt(rules[0].length - 1) === "d";

        const fractionalSize = isDecimal ? getFractionalSize(rules[0]) : 0;
        const formatter = new StringFormat(isDecimal ? "0123456789." : "0123456789", length, true, false, true);
        if (isDecimal) {
            formatter.fractionalSize = fractionalSize;
        }
        return formatter;

        function getFractionalSize(ruleFractionalSize: string) {
            return parseInt(ruleFractionalSize.substring(rule.indexOf(".") + 1, ruleFractionalSize.length - 1), 10);
        }
    }
}