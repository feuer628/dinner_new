/**
 * Типы платежей в ГИС ЖКХ
 */
export class HcsTypes {

    static readonly IPD = {
        id: "1",
        name: "ИПД",
        value: "Идентификатор платежного документа в ГИС ЖКХ",
        placeholder: "Пример заполнения: 75АВ543315-01-5111",
        dateEnabled: false,
        pattern: "^\\d{2}[а-яА-ЯёЁ]{2}\\d{6}-\\d{2}-\\d{4}$",
        errorMessage: "Неверное значение идентификатора платежного документа в ГИС ЖКХ"
    };

    static readonly ZHKU = {
        id: "2",
        name: "ЖКУ",
        value: "Идентификатор жилищно-коммунальных услуг в ГИС ЖКХ",
        placeholder: "Пример заполнения: 75АВ543315-01",
        dateEnabled: true,
        pattern: "^\\d{2}[а-яА-ЯёЁ]{2}\\d{6}-\\d{2}$",
        errorMessage: "Неверное значение идентификатора жилищно-коммунальных услуг в ГИС ЖКХ"
    };

    static readonly ELS = {
        id: "3",
        name: "ЕЛС",
        value: "Единый лицевой счет в ГИС ЖКХ",
        placeholder: "Пример заполнения: 75АВ543315",
        dateEnabled: true,
        pattern: "^\\d{2}[а-яА-ЯёЁ]{2}\\d{6}$",
        errorMessage: "Неверное значение единого лицевого счета в ГИС ЖКХ"
    };

    static VALUES = [HcsTypes.IPD, HcsTypes.ZHKU, HcsTypes.ELS];

    static findByName(name: string): HcsType {
        return HcsTypes.VALUES.find(value => value.name === name) || null;
    }

    static findById(id: string): HcsType {
        return HcsTypes.VALUES.find(value => value.id === id) || null;
    }
}

/** Тип платежа ГИС ЖКХ */
export type HcsType = {
    /** Идентификатор типа */
    id: string,
    /** Код типа */
    name: string,
    /** Название типа */
    value: string,
    /** Плэйсхолдер для поля ввода */
    placeholder: string,
    /** Признак доступности для выбора полей с датами */
    dateEnabled: boolean,
    /** Шаблон заполнения */
    pattern: string,
    /** Сообщение об ошибке */
    errorMessage: string
};