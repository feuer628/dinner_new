declare module "default/PluginHelper" {

    import * as CryptoUtil from "default/CryptoUtil";

    /** Определить ОС пользователя используя UserAgent */
    export function detectOsType(): Promise<any>;

    export function getSession(name?: any): PluginSession;

    /** Проверка состояния и версии плагина */
    export function checkPlugin(urlArray: any[]): Promise<any>;

    /** Автообновление плагина */
    export function autoUpdate(updateInfo: any, progressBar: any, customHandler: any): Promise<any>;

    export function restoreSession(existSessionId?: any, name?: any): Promise<any>;

    export function createSession(name?: any, sessionId?: any): Promise<any>;

    export function closeSession(name?: any): Promise<any>;

    /** Типы операционных систем, поддерживаемые плагином */
    export let OS_TYPES: any;
    export class PluginSession {
        name: string;
        sessionId: string;
        keysInfo: any;
        keystoreType: any;
        // Идентификатор хранилища: зашифрованный путь к файлу или идентификатор аппаратного устройства
        currentId: string;
        currentKeyAlias: string;
        notifier: Notifier;

        // Async API
        /**
         * Получить шестнадцатиричный сессионный пароль на основе случайно сгенерированных 16 байт
         * @return {Promise<String>}, например, "796ECAAB120AC70BC1082D0BED8944C0"
         */
        getSessionPassword(): Promise<string>;

        /**
         * Получить случайно сгенерированные countBytes байт в HEX виде
         * @param {number} countBytes количество байт
         * @param {Array<numeric>} commandIds список команд
         * @return {Promise<String>}, например, для countBytes = 16 -> "796ECAAB120AC70BC1082D0BED8944C0"
         */
        getRandomBytes(countBytes: any, commandIds: any): Promise<string>;

        /**
         * Возвращает список доступных для работы криптосредств
         * @param {string[]} filter если передан не пустой список криптосредств, то возвращает доступные из этого списка иначе все доступные криптосредства
         * @return {Promise<string[]>} список доступных для работы криптосредств (пример: [rutoken_2, ccom33])
         */
        getAvailableCrypto(filter?: string[]): Promise<string[]>;

        /**
         * Создать контейнер crypto pro под ключ
         * @return {Promise<{}>}
         */
        createCryptoProContainer(): Promise<object>;

        /**
         * Получить список доступных хранилищ ключей
         * @param {"default/CryptoUtil".KeystoreType} keystoreType тип хранилища ключей
         * @return {Promise<string[]>} например ["0F0AFD21", "00-00-00-15"]
         */
        listKeystores(keystoreType: CryptoUtil.KeystoreType): Promise<string[]>;

        /**
         * Устанавливает хранилище в качестве текущего
         * @param id идентификатор хранилища
         *           для совместимости с версиями плагина < 2.1.3.0 так же принимается параметр deviceId
         * @param keystoreType тип хранилища ключей
         * @param createNewStore создать новое хранилище (по умолчанию false)
         *                       аппаратное криптосредство, MAC-токены BIFIT, каталог файловых хранилищ - не используется
         *                       файловое хранилище - если true, то будет создан новый файл
         *                       контейнер КриптоПро, SignalCom - если true, то будет создан новый временный ключевой контейнер,
         *                           следующей командой должно быть CREATE_NEW_KEY
         * @return {Promise<string>}
         */
        setKeystore(id: any, keystoreType: any, createNewStore?: any): Promise<string>;

        /**
         * Получить список идентификаторов токенов
         * @return {Promise<String[]>}, например, ["0650D1002274"]
         * @deprecated используйте {@link listKeystores}
         */
        listTokens(): Promise<string[]>;

        /**
         * Проверить, что PIN-код хранилища введен
         * @return {boolean} true, если PIN-код уже введен и false в других случаях
         */
        isPinSet(): Promise<boolean>;

        /**
         * Установить PIN-код на текущем хранилище
         * @param pinCode PIN-код на текущем хранилище
         */
        setPin(pinCode: any): Promise<any>;

        /**
         * Установить токен с переданным идентификатором в качестве текущего хранилища
         * @param {String} deviceId идентификатор токена
         * @return {Promise<{}>}
         * @deprecated используйте {@link setKeystore}
         */
        setToken(deviceId: any): Promise<object>;

        /**
         * Загрузить ключи на установленном в плагине хранилище
         * @param keys {Object} <optional> спискок ключей из кэша
         * @return {Promise<KeyStruct[keyAlias]>}
         * KeyStruct: Структура информации о ключе {
         *         keyAlias: {String} имя ключа
         *         systemId: {Number} идентификатор системы
         *         externalKeyId: {String} внешний идентификатор
         *         oid: {String} параметр алгоритма
         *     }
         */
        loadKeys(keys?: any): Promise<any>;

        /**
         * Открыть диалог выбора файла
         * @param {Boolean} fileMustExist
         * @param {String} title заголовок диалога
         * @param {[]} filters фильтры для отбора файлов. По умолчанию устанавливается первое значение
         *                Формат [{"text":"Keystore (*.dat)","pattern":"*.dat"},{"text":"All files","pattern":"*.*"}]
         * @param propertyKey: {string} <optional> ключ для сохранения пути в клиентских свойствах
         * @return {Promise<EncPathStruct>}
         * EncPathStruct: Структура пути {
         *      path: {String} путь к файлу для отображения пользователю (управляющие символы эскейпятся в соответствии со спецификацией JSON),
         *      encrypted: {String} зашифрованный путь к файлу.
         *  }
         */
        openFileDialog(fileMustExist: any, title: any, filters: any, propertyKey?: any): Promise<any>;

        /**
         * Создать новый ключ.
         * Новый ключ автоматически становится текущим.
         *
         * Для файловых ключей необходимо инициализировать программный датчик случайных чисел.
         * Программный датчик случайных чисел (ПДСЧ) строится на основе гаммирования по алгоритму ГОСТ 28147-89
         * и инициализируется от программно-клавиатурной компоненты (биологический ДСЧ).
         * Для инициализации ПДСЧ перед выполнением createNewKey необходимо посылать оповещения о нажатии клавиши командой sendKeyPressEvent.
         *
         * @param {String} alias           имя ключа
         * @param {String} systemId        идентификатор системы
         * @param {String} algorithmParams параметры алгоритма
         * @param {String} cryptoType тип криптографии (игнорируется для USB-токенов)
         * @return {Promise<String>} - открытый ключ в формате HEX
         */
        createNewKey(alias: any, systemId: any, algorithmParams: any, cryptoType: any): Promise<string>;

        /**
         * Передать в плагин код нажатой клавиши.
         * @param {Number} code код нажатой клавиши
         * @return {Promise<KeyPressResultStruct>}
         * KeyPressResultStruct - {
         *     requestedChar: {Number}, следующий запрашиваемый код символа
         *     currentCharNum: {Number} номер шага
         * }
         * Если требуется нажатие клавиши, то возвращается запрашиваемый код символа и номер шага. Пример:
         * {"requestedChar":54,"currentCharNum":1}
         * Иначе, если нажатие клавиши больше не требуется, возвращается код -1 и нулевой номер шага:
         * {"requestedChar":-1,"currentCharNum":0}.
         */
        sendKeyPressEvent(code: any): Promise<any>;
        /**
         * Изменить пароль текущего ключа
         * @param {String} newKeyPassword новый пароль ключа
         * @return {Promise<{}>}
         */
        changeKeyPassword(newKeyPassword: any): Promise<object>;
        /**
         * Выбрать файловое хранилище
         * @param {String} encryptedPath  зашифрованный путь к файлу
         * @param {Boolean} createNewStore создавать новое хранилище, если не найдено
         * @return {Promise<{String}>} - путь к файлу для отображения пользователю, пример: "C:\\keystore.dat"
         * @deprecated используйте {@link setKeystore}
         */
        setFile(encryptedPath: any, createNewStore?: any): Promise<string>;
        /**
         * Установить ключ в плагине.
         * Предварительно необходимо установить хранилище, в котором находится ключ - см. seToken и setFile
         * @param {Object | String} key устанавливаемый ключ, либо идентификатор (alias) ключа
         * @return {Promise<{}>}
         */
        setKey(key: any): Promise<object>;

        /**
         * Проверить установлен ли пароль для текущего ключа
         * @return {Promise<Boolean>} - true, если пароль уже введен и false в других случаях
         */
        isKeyPasswordSet(): any;

        /**
         * Установить пароль для ключа
         * @param {String} password пароль
         * @return {Promise<{}>}
         */
        setKeyPassword(password: any): Promise<object>;

        /**
         * Получить открытый ключ ЭП
         * @return {Promise<String>} открытый ключ в формате HEX
         */
        getPublicKey(): Promise<string>;

        /**
         * @deprecated. Использовать функцию cmsSign
         * Подписать контент
         * @param {String} dataForSign контент для подписи
         * @return {Promise<String>} подпись в формате HEX
         */
        sign(dataForSign: any): Promise<string>;

        /**
         * Получить тип чипа токена
         * @return {Promise<String>} тип чипа токена, например, "MSKEY_K-201"
         */
        getChipType(): Promise<string>;

        /**
         * Установить идентификатор текущего ключа
         * Идентификатор можно установить только один раз.
         * @param {String} externalKeyId идентификатор ключа
         * @return {Promise<{}>}
         */
        setExternalKeyId(externalKeyId: any): Promise<object>;

        /**
         * Удалить текущий ключ в хранилище
         * @return {Promise<{}>}
         */
        deleteKey(): Promise<object>;
        /**
         * Изменить имя текущего ключа
         * @param {String} newKeyAlias новое имя ключа
         * @return {Promise<{}>}
         */
        changeKeyAlias(newKeyAlias: any): Promise<object>;
        /**
         * Изменить PIN-код на текущем хранилище
         * @param {String} newPin новый PIN-код на текущем хранилище
         * @return {Promise<{}>}
         */
        changePin(newPin: any): Promise<object>;

        /**
         * Поддерживается ли на устройстве подпись с визуализацией
         * @return {Promise<Boolean>} - true, если поддерживается доверенная подпись и false в других случаях
         */
        isTrustSignSupported(): Promise<boolean>;
        /**
         * Установить размер шрифта для подписи с визуализацией
         * @param {Number} fontSize размер шрифта
         * @return {Promise<Boolean>} true, если размер шрифта успешно установлен и false в других случаях
         */
        setTrustSignFontSize(fontSize: any): Promise<boolean>;
        /**
         * Подпись данных в формате CMS
         * @param {String} dataForSign данные для подписи
         * @param {String} trustedData информация для отображения в устройстве, null если режим подписи без визуализации
         * @return {Promise<String>} - CMS-контейнер из стандарта PKCS 7 (HEX строка), подробнее: https://tools.ietf.org/html/rfc2315
         */
        cmsSign(dataForSign: string, trustedData?: string): Promise<string>;

        /**
         * Груповая подпись данных в формате CMS
         * @param dataForSigns массив данных для подписи
         * @return {Promise<String[]>} массив CMS-контейнеров из стандарта PKCS 7 (HEX строка), подробнее: https://tools.ietf.org/html/rfc2315
         */
        groupCmsSign(dataForSigns: string[]): Promise<string[]>;

        /**
         * Подтвердить MAC-токеном BIFIT
         * @param {string} digest        GOST R 34.11-2012-512 хэш данных для подтверждения в формате hex
         * @param {String} dataToConfirm информация для отображения в устройстве
         * @return {Promise<String>}    CMS-контейнер из стандарта PKCS 7 (HEX строка), подробнее: https://tools.ietf.org/html/rfc2315
         */
        confirmByBifitMactoken(digest: any, dataToConfirm: any): Promise<string>;

        /**
         * Открыть диалог выбора папки
         * @param {String} propertyKey ключ для сохранения пути в клиентских свойствах
         * @param {String} title заголовок диалога
         * @param {String} rootFolder <optional> предустановленный путь к папке для отображения пользователю.
         *                                       Если rootFolder не задан, то путь берется из клиентских свойств
         * @return {Promise<String>} - путь к папке для отображения пользователю, например, "C:\\folder"
         *                              Управляющие символы экранируются в соответствии со спецификацией JSON
         */
        selectFolder(propertyKey: any, title?: any, rootFolder?: string): Promise<string>;

        /**
         * Получить клиентское свойство
         * @param {String} propertyKey ключ
         * @return {Promise<String>} значение свойства.
         */
        getClientProperty(propertyKey: any): Promise<string>;
        /**
         * Сохранить файлы на диск
         *
         * @param {String} zipArchive  zip-архив с файлами (в формате Base64 URL Safe)
         * @param {String} propertyKey ключ клиентского свойства пути для сохранения файлов
         * @return {Promise<{}>}
         */
        saveFiles(zipArchive: any, propertyKey: any): Promise<object>;

        /**
         * Прочитать файлы с диска
         * @param {String[]} entries относительные имена файлов для чтения с диска (1 уровень вложенности)
         * @param {String} propertyKey ключ клиентского свойства пути для чтения файлов
         * @param {String} maxTotalSize максимальный общий размер файлов в байтах (необязательный, если не указан, то 100 мб)
         * @return {Promise<String>} zip-архив с файлами (в формате Base 64 Encoding with URL and Filename Safe Alphabet)
         */
        readFiles(entries: any, propertyKey: any, maxTotalSize?: any): Promise<string>;

        /**
         * Поиск файлов в каталоге
         * @param {String} propertyKey ключ клиентского свойства пути для поиска файлов
         * @param {Boolean} withFolders включать файлы из вложенных папок каталога (1 уровень вложенности, необязательный параметр)
         * @return {Promise<FileStruct[]>}
         * FileStruct: информация о содержащихся в папке вхождениях вида {
         *     name: {String} имя файла или папки,
         *     isFolder: {Boolean} признак является ли папкой,
         *     size: {String} размер в байтах
         * }
         */
        findFiles(propertyKey: any, withFolders: any): Promise<any>;

        /**
         * Удаление файлов в каталоге
         * @param {String[]} entries относительные имена файлов для удаления с диска (1 уровень вложенности)
         * @param {String} propertyKey ключ клиентского свойства пути для удаления файлов
         * @return {Promise<{}>}
         */
        deleteFiles(entries: any, propertyKey: any): Promise<object>;

        /**
         * Получение общей информации
         * @param {string[]} ids требуемый список информации
         * @return {Promise<AddedInfoStruct>} общая информация
         */
        generalInfo(ids: any): Promise<any>;

        /**
         * Завершить работу выбранным хранилищем ключей
         * @return {Promise}
         */
        forgetKeystore(): Promise<any>;

        /**
         * Завершить работу выбранным ключом
         * @return {Promise}
         */
        forgetKey(): Promise<any>;

        /**
         * Возвращает значение свойства из внутреннего хранилища
         * @param {string} key ключ
         * @return {Promise<any>} значение свойства, null при отсутствии
         */
        getProperty(key: string): Promise<any>;

        /**
         * Устанавливает свойство во внутреннем хранилище
         * @param {string} key ключ
         * @param {any} value устанавливаемое значение
         * @return {Promise<void>}
         */
        setProperty(key: string, value: any): Promise<void>;

        /**
         * Получить список сертификатов в хранилище
         * @return {Promise<CertificateStruct[]>
         * CertificateStruct: Структрура информации о сертификате {
         *          subjectName: {String} имя владельца сертификата
         *          certId: {String} идентификатор сертификата
         *          x509: {String} Base64 представление x509 сертификата
         *      }
         */
        getCertificateList(): Promise<any>;

        /**
         * Получить информацию о текущем ключе ЭП
         * @return {Promise<KeyStruct>}
         * KeyStruct: Структура информации о ключе {
         *         keyAlias: {String} имя ключа
         *         systemId: {Number} идентификатор системы
         *         externalKeyId: {String} внешний идентификатор
         *         oid: {String} параметр алгоритма
         *         signAlgorithmOid: {String} параметр алгоритма подписи
         *         cryptoType: {String} тип используемой криптографии
         *         internalKeyId: {String} внутренний идентификатор
         *     }
         */
        getKeyInfo(): Promise<any>;

        /**
         * Получить информацию о текущем хранилище ключей ЭП
         * @return {Promise<KeystoreStruct>}
         * KeystoreStruct: Структура информации о ключе {
         *         type: {Number} тип хранилища
         *         id: {String} идентификатор хранилища
         *         loginRequired: {Boolean} флаг: требуется ли ввести ПИН-код
         *     }
         */
        getKeystoreInfo(): Promise<any>;

        /**
         * Открыть окно просмотра информации о сертификате
         * @param {string} x509cert DER-закодированные данные X509 сертификата в формате, указанном в параметре format
         * @param {string} format формат данных, один из списка ["hex","base64","base64UrlSafe"]
         *                 (необязательный, если не указан, то hex)
         */
        showCertificateInfo(x509cert: string, format?: string): Promise<void>;

        // Sync API
        /**
         * Получить массив алиасов ключей
         * @return {Array} алиасов
         */
        getKeyAliases(): any;
        /**
         * Возвращает текущий идентификатор системы
         * @return {*}
         */
        getCurrentSystemId(): any;
        /**
         * Возвращает текущий идентификатор токена
         * @return string
         */
        getCurrentTokenId(): any;
        /**
         * Возвращает идентификатор текущего установленного ключа
         * @return string
         */
        getCurrentKeyId(): any;
        /**
         * Получить тип криптопровайдера текущего установленного ключа
         * @return string
         */
        getCurrentCryptoType(): any;
        /**
         * Получить алиас текущего ключа
         * @return {*}
         */
        getCurrentKeyAlias(): any;

        /**
         * Получить текущий протокол
         */
        getCurrentProtocol(): any;

        /**
         * Получить список c информацией об устройствах вида {"tokenSerial": "0A781236C881", "keystoreTypeId": 0, "deviceType": DeviceTypes.RUTOKEN_ECP2}
         * @param keystoreType тип хранилища ключа (см. CryptoUtils.KeystoreType)
         * @return список c информацией об устройствах
         */
        loadDevices(keystoreType: any): any;

        /**
         * Установить объект для оповещения начала и конца запроса к плагину
         * @param notifier объект для оповещения начала и конца запроса к плагину
         */
        setNotifier(notifier: Notifier): any;
    }

    /**
     * Объект для оповещения начала и конца запроса к плагину
     */
    export type Notifier = {
        beginRequest: (taskId: any) => void;
        endRequest: () => void;
    };
}

declare module "default/CryptoUtil" {
    export const AlgorithmParamNames: any;
    export const KeystoreProtocols: any;
    export const CryptoTypes: any;
    export const DeviceTypes: any;

    /**
     * Типы хранилища ключей
     */
    export class KeystoreTypes {
        // не установлено
        static NONE: KeystoreType;
        // аппаратное криптосредство
        static HW_DEVICE: KeystoreType;
        // файловое хранилище
        static FILE: KeystoreType;
        // контейнер КриптоПро
        static CRYPTOPRO_CONTAINER: KeystoreType;
        // MAC-токены BIFIT
        static BIFIT_MACTOKEN: KeystoreType;
        // контейнер SignalCom
        static SIGNALCOM_CONTAINER: KeystoreType;
        // каталог файловых хранилищ
        static FILE_DIRECTORY: KeystoreType;
    }

    /**
     * Тип хранилища ключей
     */
    export class KeystoreType {

        /**
         * id код типа
         */
        id: number;

        /**
         * Является ли хранилище ключей устройством
         * @return {boolean}
         */
        isDevice(): boolean;

        /**
         * Является ли хранилище ключевым контейнером сторонних сертификатов
         * @return {boolean}
         */
        isCertificate(): boolean;
    }

    /**
     * Определить тип хранилища ключа
     * @param ksType код типа хранилища ключа
     * @return {*|KeystoreType}
     */
    export function getKeystoreType(ksType: any): any;
    /**
     * Найти тип устройства по типу чипа
     * @param chipType тип чипа
     * @return {DeviceType|null}
     */
    export function findDeviceType(chipType: any): any;
    /**
     * Найти параметр алгоритма по имени
     * @value имя параметра алгоритма
     * @defaultValue значение по-умолчанию
     */
    export function findAlgorithmParam(value: any, defaultValue?: any): any;
    /**
     * Найти параметр алгоритма по signAlgorithmOid и OID
     * @param signAlgorithmOid signAlgorithmOid параметра алгоритма
     * @param oid              OID параметра алгоритма
     */
    export function findAlgorithmParamByOids(signAlgorithmOid: string, oid: string): any;
    export function findProtocol(value: any): any;
    export function findCryptoType(cryptoValue: any): any;
    export function findAllowedProtocol(cryptoTypeSettings?: any, defaultProtocol?: any): any;
    /**
     * Получить список все доступных криптографий
     */
    export function getCryptoTypeIds(): any;
    /**
     * Получить список доступных крипто протоколов, с учетом определенных, текущих ограничений.
     * 1. ccom/ccom33 дает возможность использовать аппаратные устройства (MAC-токен BIFIT).
     * Для пользователей Mac поддержка ccom/ccom33 отсутствует.
     * 2. Поддержки файловых ключей для Mac пока нет.
     * @param cryptoTypeSettings    настройки криптографии
     * @param extCryptoTypeSettings настройки криптографии для сторонних сертификатов или
     *                              undefined, если поддержка сторонних сертификатов в месте вызова не предусмотрена
     * @return объект с информацией о доступных крипто протоколах
     */
    export function getAllowedProtocols(cryptoTypeSettings?: string, extCryptoTypeSettings?: string): any;

    /**
     * Получить разрешенные идентификаторы криптографий
     * @param cryptoTypeSettings    настройки криптографии
     * @param extCryptoTypeSettings настройки криптографии для сторонних сертификатов или
     *                              undefined, если поддержка сторонних сертификатов в месте вызова не предусмотрена
     * @return {String[]} список разрешенных идентификаторов криптографий
     */
    export function getAllowedCryptoTypeIds(cryptoTypeSettings?: string, extCryptoTypeSettings?: string): string[];
    export function getOrderedProtocols(cryptoTypeSettings?: any): any;
    export function getDefaultFileCryptoType(): any;
}