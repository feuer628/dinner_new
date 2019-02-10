import {CommonUtils} from "../../platform/utils/commonUtils";
import {SortParam, ThesaurusRequest} from "../service/referenceService";

export class RefUtils {

    /** Шаблон поиска вхождений в строке символа обратного слэша */
    private static readonly BACKSLASH_REGEXP = /\\/g;

    /** Шаблон поиска вхождений в строке символа одинарной кавычки */
    private static readonly SINGLE_QUOTE_REGEXP = /'/g;

    /** Конструктор */
    private constructor() {
    }

    /**
     * Формирует постраничный запрос к справочнику
     * @param filter фильтр. Состоит из {@code PageParam}, все остальные поля используется как фильтр
     * @returns запрос к справочнику
     */
    static buildPageRequest(filter: PageParam): ThesaurusRequest {
        if (filter.pageSize < 1) {
            throw new Error("Неверное значение в поле \"Кол-во записей на странице\"");
        }
        const params: ThesaurusRequest = {
            pageNumber: filter.pageNumber,
            pageSize: filter.pageSize
        };
        const query = RefUtils.buildThesaurusQuery(filter);
        if (!CommonUtils.isBlank(query)) {
            params.query = query;
        }
        if (filter.sortingParams && !CommonUtils.isBlank(filter.sortingParams)) {
            params.sortingParams = filter.sortingParams;
        }
        return params;
    }

    /**
     * Заменяет спец.символы(' - одинарную кавычку и \ - обратный слеш) эскейп последовательностями
     * @example \ ==> \\
     * @example ' ==> \'
     * @param value исходная строка
     * @return результат замены
     */
    static escapeFieldValue(value: string): string {
        return value.replace(RefUtils.BACKSLASH_REGEXP, "\\\\").replace(RefUtils.SINGLE_QUOTE_REGEXP, "\\'");
    }

    /**
     * Формирует фильтрующий запрос в Thesaurus с использованием оператора hasIgnoreCase
     * @param filter фильтр
     * @returns фильтрующий запрос
     */
    private static buildThesaurusQuery(filter: any): string {
        const pageFields = ["pageNumber", "pageSize", "sortingParams"];
        return Object.keys(filter).filter(fieldName => pageFields.indexOf(fieldName) === -1 && !!filter[fieldName]).map(fieldName => {
            return `[${fieldName}] hasIgnoreCase '${this.escapeFieldValue(filter[fieldName])}'`;
        }).join(" && ");
    }
}

/** Параметры постраничного запроса */
export type PageParam = {
    /** Номер страницы, которую нужно получить */
    pageNumber: number,
    /** Количество записей в странице */
    pageSize: number,
    /** Список парамертов сортировки */
    sortingParams?: SortParam[]
};
