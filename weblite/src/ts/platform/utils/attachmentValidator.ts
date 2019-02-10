/**
 * Валидатор для расширений файлов
 */
export class AttachmentValidator {

    /** Белый список расширений */
    private whiteList: string[] = null;

    /** Черный список расширений */
    private blackList: string[] = null;

    /**
     * Конструктор
     * @param {string} whitePattern паттерн для белого списка
     * Расширения файлов, которые запрещается использовать в качестве вложений под документами
     * (прикреплять к документам и сохранять из документов). Разделитель: запятая. Например: exe,com,dll
     * @param {string} blackPatter  паттерн для черного списка
     * Расширения файлов, которые разрешается использовать в качестве вложений под документами
     * (прикреплять к документам и сохранять из документов).
     * Разрешается использовать знак '?' в качестве спец.символа, означающего один любой символ.
     * Разделитель: запятая. Например: doc,png,pdf,r0?,0??
     */
    constructor(whitePattern?: string, blackPatter?: string) {
        this.whiteList = this.getListExtensions(whitePattern);
        this.blackList = this.getListExtensions(blackPatter);
    }

    /**
     * Проверяет имя файла по паттерну расширения
     * @param fileName имя файла
     * @return {boolean} true - если имя файла удовлетворяет паттерну для расширений
     */
    isExtensionValid(fileName: string): boolean {
        let isValid = true;
        if (this.whiteList) {
            isValid = this.isFileNameMatchExtension(fileName, this.whiteList, true);
        }
        if (this.blackList) {
            isValid = isValid && !this.isFileNameMatchExtension(fileName, this.blackList, false);
        }
        return isValid;
    }

    /**
     * Возвращает расширение файла или пустую строку
     * @param fileName название файла
     * @return {string}
     */
    getFileExtension(fileName: string): string {
        const dotIndex = fileName.lastIndexOf(".");
        return dotIndex === -1 ? "" : fileName.substring(dotIndex + 1);
    }

    /**
     * Получает расширения в виде списка
     * @returns {String} список расширений, null - если свойство не задано
     */
    private getListExtensions(pattern: string): string[] {
        return pattern ? pattern.trim().split(/[\s,]+/) : null;
    }

    /**
     * Проверяет имя файла по списку расширений
     * @param fileName имя файла
     * @param extensionList список расширений для сравнения
     * @param allowWildcard флаг, указывающий на возможность использования в списке расширений символа "?", который означает любой символ
     * @return {boolean} true - если расширение содержится в переданном списке
     */
    private isFileNameMatchExtension(fileName: string, extensionList: string[], allowWildcard: boolean): boolean {
        return extensionList.some((item) => this.isExtensionMatchPattern(this.getFileExtension(fileName), item, allowWildcard));
    }

    /**
     * Удовлетворяет ли расширение шаблону. Проверка является регистронезависимой.
     * @param {string} extension расширение
     * @param {string} pattern шаблон, который может содержать символы '?', которые обозначают любой символ (например "txt", "p?f")
     * @param allowWildcard флаг, указывающий на возможность использования в списке расширений символа "?"
     * @return {boolean} {@code true}, если расширение удовлетворяет шаблону, иначе {@code false}
     */
    private isExtensionMatchPattern(extension: string, pattern: string, allowWildcard: boolean): boolean {
        if (extension.length !== pattern.length) {
            return false;
        }
        extension = extension.toLowerCase();
        pattern = pattern.toLowerCase();
        if (!allowWildcard || pattern.indexOf("?") === -1) {
            return extension === pattern;
        }

        for (let index = 0; index < extension.length; index++) {
            const patternChar = pattern.charAt(index);
            if (patternChar !== "?" && patternChar !== extension.charAt(index)) {
                return false;
            }
        }
        return true;
    }
}