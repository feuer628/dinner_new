/**
 * Декоратор автоматической инициализации перечисления.
 * @param {string} idPropertyName - название свойства в элементах перечисления, которое нужно использовать как идентификатор
 * @return конструктор перечисления
 */
export function Enum<T = any>(idPropertyName?: keyof T) {
    // tslint:disable-next-line
    return function <T extends (Function & EnumClass)>(target: T): T {
        const store: EnumStore = {
            name: target.prototype.constructor.name,
            enumMap: {},
            enumMapByName: {},
            enumValues: [],
            idPropertyName: idPropertyName
        };
        // Lookup static fields
        for (const fieldName of Object.keys(target)) {
            const value: any = (target as any)[fieldName];
            // Check static field: to be instance of enum type
            if (value instanceof target) {
                const enumItem: Enumerable = value;
                let id = fieldName;
                if (idPropertyName) {
                    id = (value as any)[idPropertyName];
                    if (typeof id !== "string" && typeof id !== "number") {
                        const enumName = store.name;
                        throw new Error(`Значение свойства ${idPropertyName} в элементе перечисления ${enumName}.` +
                            `${fieldName} не является строкой или числом: ${id}`);
                    }
                }
                if (store.enumMap[id]) {
                    const enumName = store.name;
                    throw new Error(`элемент с идентификатором ${id}: ${enumName}.${store.enumMap[id].enumName}` +
                        `уже существует d ${enumName}`);
                }
                store.enumMap[id] = enumItem;
                store.enumMapByName[fieldName] = enumItem;
                store.enumValues.push(enumItem);
                enumItem.__enumName__ = fieldName;
                Object.freeze(enumItem);
            }
        }
        target.__store__ = store;
        Object.freeze(target.__store__);
        Object.freeze(target);
        return target;
    };
}

/** Интерфейс конструктора перечисления. Нужен для корректного определения типов элементов перечисления. */
export interface IStaticEnum<T> extends EnumClass {

    new(): {enumName: string};

    values(): ReadonlyArray<T>;

    valueOf(id: string | number): T;

    valueByName(name: string): T;
}

/** Функция корректировки перечисления */
export function Enumeration<T>(): IStaticEnum<T> {
    return (<IStaticEnum<T>> Enumerable);
}

/** Карта значений */
type EnumMap = {[key: string]: Enumerable};

/** Тип методанных */
type EnumClass = {
    __store__: EnumStore
};

/** Служебные данные перечисления */
type EnumStore = {
    name: string,
    enumMap: EnumMap,
    enumMapByName: EnumMap,
    enumValues: Enumerable[],
    idPropertyName?: any
};

/** Тип для хранения имени перечисления */
type EnumItemType = {
    __enumName__: string;
};

/** Тип элемента перечисления */
export class Enumerable implements EnumItemType {
    // tslint:disable:variable-name
    // типизация
    static readonly __store__ = {} as EnumStore;
    // имя перечисления
    __enumName__ = "";
    // tslint:enable:variable-name

    constructor() {
    }

    /**
     * Получение списка значений
     * @return {ReadonlyArray<T>} список перечислений
     */
    static values(): ReadonlyArray<any> {
        return this.__store__.enumValues;
    }

    /**
     * Ищет и возвращает элемент перечисления по id
     * @param {string | number} id - значение для поиска
     * @return элемент перечисления
     */
    static valueOf(id: string | number): any {
        const value = this.__store__.enumMap[id];
        if (!value) {
            throw new Error(`В перечислении ${this.__store__.name} не существует элемента с идентификатором ${id}`);
        }
        return value;
    }

    /**
     * Ищет и возвращает элемент перечисления по имени
     * @param {string} name - имя
     * @return элемент перечисления
     */
    static valueByName(name: string): any {
        const value = this.__store__.enumMapByName[name];
        if (!value) {
            throw new Error(`В перечислении ${this.__store__.name} не существует элемента с наименованием ${name}`);
        }
        return value;
    }

    /** Геттер для имени */
    get enumName(): string {
        return this.__enumName__;
    }

    /** Отображает элемент в строку */
    toString(): string {
        const self = this as any;
        if (self.hasOwnProperty("text")) {
            return self.text;
        }
        const clazz = this.topClass;
        if (clazz.__store__.idPropertyName) {
            return self[clazz.__store__.idPropertyName];
        }
        return this.enumName;
    }

    private get topClass(): EnumClass {
        return this.constructor as any;
    }
}