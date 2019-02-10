/**
 * Статус документа
 */
import {Enum, EnumType, IStaticEnum} from "platform/enum";

@Enum("code")
export class Status extends (<IStaticEnum<Status>> EnumType) {
    /** 0 - "Новый" */
    static readonly NEW = new Status(0, "Новый", "000000");
    /** 1 - "Подписан" */
    static readonly ON_SIGN = new Status(1, "Подписан", "0000FF");
    /** 2 - "Доставлен" */
    static readonly READY = new Status(2, "Доставлен", "000080");
    /** 3 - "На обработке" */
    static readonly ON_EXECUTE = new Status(3, "На обработке", "1F83C8");
    /** 4 - "На исполнении" */
    static readonly ACCEPTED = new Status(4, "На исполнении", "008080");
    /** 5 - "Исполнен" */
    static readonly EXECUTED = new Status(5, "Исполнен", "008000");
    /** 6 - "Отвергнут" */
    static readonly REJECTED = new Status(6, "Отвергнут", "CF4D4D");
    /** 7 - "Удален" */
    static readonly DELETED = new Status(7, "Удален", "FF9966");
    /** 8 - "На согласовании" */
    static readonly ON_SUBMIT = new Status(8, "На согласовании", "777777");
    /** 9 - "На подготовке" */
    static readonly ON_PREPARATION = new Status(9, "На подготовке", "FF0000");
    /** 10 - "Подготовлен банком" */
    static readonly PREPARED = new Status(10, "Подготовлен банком", "FF00FF");
    /** 11 - "Доставлен" */
    static readonly DELIVERED_TO_CLIENT = new Status(11, "Доставлен", "000080");
    /** 12 - "Доставлен" */
    static readonly READY_ = new Status(12, "Доставлен", "000080");
    /** 19 - "На акцепт" */
    static readonly FOR_ACCEPTANCE = new Status(19, "На акцепт", "FF00FF");
    /** 20 - "Не акцептован" */
    static readonly NOT_ACCEPTED = new Status(20, "Не акцептован", "FF6633");
    /** 27 - "Шаблон" */
    static readonly PATTERN = new Status(27, "Шаблон", "000000");
    /** 28 - "Удален после отвержения" */
    static readonly DELETED_AFTER_REJECT = new Status(28, "Удален", "FF9966");
    /** 30 - "Требует подтверждения" */
    static readonly REQUIRES_CONFIRMATION = new Status(30, "Требует подтверждения", "FFA500");
    /** 31 - "Одобрен" */
    static readonly APPROVED = new Status(31, "Одобрен", "879339");
    /** 32 - "В картотеке" */
    static readonly IN_CATALOG = new Status(32, "В картотеке", "800080");
    /** 33 - "В архиве" */
    static readonly ARCHIVED = new Status(33, "В архиве", "777777");
    /** 34 - "Черновик" */
    static readonly DRAFT = new Status(34, "Черновик", "000000");
    /** 9000 - "Новый локальный" */
    static readonly NEW_LOCAL = new Status(9000, "Новый", "000000");
    /** 9001 - "Подписан локально" */
    static readonly ON_SIGN_LOCAL = new Status(9001, "Подписан", "0000FF");
    /** 9002 - "Удален локально" */
    static readonly DELETED_LOCAL = new Status(9002, "Удален", "804000");
    /** 9003 - "Шаблон локальный" */
    static readonly PATTERN_LOCAL = new Status(9003, "Шаблон", "000000");
    /** 9004 - "Удаленный шаблон локальный" */
    static readonly DELETED_PATTERN_LOCAL = new Status(9004, "Удаленный шаблон", "000000");
    /** 9005 - "Исполнен локально" */
    static readonly EXECUTED_LOCAL = new Status(9005, "Исполнен", "008000");
    /** 9006 - "Отвергнут локально" */
    static readonly REJECTED_LOCAL = new Status(9006, "Отвергнут", "FF0000");
    /** 9008 - "На согласовании локально" */
    static readonly ON_SUBMIT_LOCAL = new Status(9008, "На согласовании", "777777");

    private constructor(public code: number, public name: string, public color: string) {
        super();
    }
}