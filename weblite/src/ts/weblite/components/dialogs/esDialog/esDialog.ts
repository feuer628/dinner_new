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

import * as CryptoUtil from "default/CryptoUtil";
import * as PluginHelper from "default/PluginHelper";
import {CatchErrors} from "platform/decorators";
import {Container, Inject} from "platform/ioc";
import {Storage} from "platform/services/storage";
import {Component} from "platform/ui";
import {CustomDialog} from "platform/ui/dialogs/customDialog";
import {HexUtils} from "platform/utils/hexUtils";
import {KeyUtils} from "platform/utils/keyUtils";
import {StorageKey} from "../../../model/storageKey";
import {ClientService} from "../../../service/clientService";
import {EmployeeService, EsInfo} from "../../../service/employeeService";
import {ExtAuthResponse, LoginAuthAccountService} from "../../../service/loginAuthAccountService";
import {TokenUtils} from "../../../utils/tokenUtils";
import {KeyPasswordDialog} from "../plugin/keyPasswordDialog";
import {PinCodeDialog} from "../plugin/pinCodeDialog";
import {EsPanel} from "./esPanel";

/**
 * Диалог выбора ЭП
 */
@Component({
    // language=Vue
    template: `
        <dialog-form :title="title" :width="500" :closable="false">
            <template slot="content">
                <template v-for="es in data.esList">
                    <es-panel :es-info="es" @chooseEs="onChooseEs"/>
                </template>
            </template>
            <template slot="footer">
                <button class="btn floatR" @click="onCancel">Отмена</button>
            </template>
        </dialog-form>
    `,
    components: {EsPanel}
})
export class EsDialog extends CustomDialog<EsDialogData, boolean> {

    /** Признак отображения диалога выбора ЭП */
    private static esRequiredDialogShowed = false;

    /** Префикс ключа, по которому хранится информация об использованных ключах */
    private static readonly USED_KEYS_STORAGE_KEY_PREFIX = "USED_KEYS_STORAGE_";

    /** Ключ, по которому содержится закодированная информация о расположении файловых хранилищ */
    private static readonly USED_ENCRYPTED_PATHS_STORAGE_KEY = "USED_ENCRYPTED_PATHS_STORAGE";

    /** Ключ, по которому содержится идентификаторы контейнеров сторонних сертификатов */
    private static readonly USED_EXT_CERT_CONTAINER_IDS_STORAGE_KEY = "USED_EXT_CERT_CONTAINER_IDS_STORAGE";

    /** Код ответа: Успешно */
    private static readonly SUCCESS_CODE = 0;

    /** Код ответа: Требуется расширенная аутентификация */
    private static readonly EXT_AUTHENTICATION_REQUIRED_CODE = 9;

    /** Код ответа: Требуется расширенная аутентификация трастскрином */
    private static readonly EXT_AUTHENTICATION_BY_TRUSTSCREEN_REQUIRED_CODE = 11;

    /** Сервис по работе с информацией о клиенте */
    @Inject
    private clientService: ClientService;

    /** Сервис по работе с учетными записями входа по логину */
    @Inject
    private loginAuthAccountService: LoginAuthAccountService;

    /** Сервис по работе с хранилищем браузера */
    @Inject
    private storage: Storage;

    /** Заголовок */
    private title = "Выберите электронную подпись";

    /** Признак того, что пользователь отказался выбирать хранилище или вводить PIN */
    private refusedStorageSetting = false;

    /** Признак блокировки выбора ЭП */
    private esSelectionBlocked = false;

    /**
     * Выбирает и устанавливает ЭП
     * @param explicitSign признак того, что ЭП выбирается в рамках процесса явной подписи
     * @returns {Promise<boolean>} true, если ЭП была выбрана и успешно установлена, false иначе
     */
    static async chooseEs(explicitSign: boolean): Promise<boolean> {
        if (this.esRequiredDialogShowed) {
            return false;
        }
        try {
            this.esRequiredDialogShowed = true;
            // получаем активные ЭП, привязанные к текущему сотруднику
            const esList = await Container.get(EmployeeService).getCurrentEmployeeActiveEsSortedList();
            if (esList.length === 0) {
                throw new Error(explicitSign ?
                    "Невозможно подписать документ: отсутствуют электронные подписи" :
                    "Для выполнения операции необходима электронная подпись");
            }
            return await new EsDialog().show({explicitSign: explicitSign, esList: esList});
        } finally {
            this.esRequiredDialogShowed = false;
        }
    }

    /** @inheritDoc */
    mounted(): void {
        if (this.data && !this.data.explicitSign) {
            this.title = "Для продолжения предъявите свою электронную подпись";
        }
    }

    /**
     * Действие при выборе ЭП
     * @param selectedEs выбранная ЭП
     * @return {Promise<void>}
     */
    @CatchErrors
    private async onChooseEs(selectedEs: EsInfo): Promise<void> {
        // TODO 87909 убрать, когда будет реализован механизм блокировки экрана при обращении к плагину
        if (this.esSelectionBlocked) {
            return;
        }
        try {
            this.esSelectionBlocked = true;
            // если ЭП выбирается повторно, то следует забыть ранее установленное хранилище во избежание ошибок плагина
            await this.forgetStorageIfPresent();
            const storageType = await this.getExactStorageType(selectedEs);
            let extCert = false;

            // устанавливаем хранилище и ключ
            switch (storageType) {
                case CryptoUtil.KeystoreTypes.FILE:
                    await this.setEsFromFileStorage(selectedEs.keyId);
                    if (this.refusedStorageSetting) {
                        return;
                    }
                    break;
                case CryptoUtil.KeystoreTypes.HW_DEVICE:
                case CryptoUtil.KeystoreTypes.BIFIT_MACTOKEN:
                    await this.setEsFromDeviceStorage(selectedEs, storageType);
                    if (this.refusedStorageSetting) {
                        return;
                    }
                    break;
                case CryptoUtil.KeystoreTypes.CRYPTOPRO_CONTAINER:
                case CryptoUtil.KeystoreTypes.SIGNALCOM_CONTAINER:
                    await this.setEsFromExtCertificate(selectedEs.keyId, selectedEs.x509cert, storageType);
                    extCert = true;
                    break;
                default:
                    throw new Error("Неподдерживаемый тип ЭП: " + storageType.id);
            }
            const session = PluginHelper.getSession();
            // проверяем возможность использования установленной ЭП с точки зрения разрешенных типов криптографии, если не сторонний сертификат
            // (для них уже криптография была проверена)
            if (!extCert) {
                const cryptoIds = CryptoUtil.getAllowedCryptoTypeIds(this.clientService.getClientInfo().clientProperties["CLIENT.CRYPTO.TYPE"]);
                let esCryptoType = session.getCurrentCryptoType();
                // Для версий до 2.0.24.250 включительно при генерации ключа с типом ccom33 в заголовок файла ключа записывался ccom,
                // а в провайдере сертификата указывался ccom33, поэтому при необходимости заменяем тип криптографии
                if (esCryptoType === "ccom" && (await this.clientService.getKey(selectedEs.keyId)).cryptoType === "ccom33") {
                    esCryptoType = "ccom33";
                }
                if (cryptoIds.indexOf(esCryptoType) === -1) {
                    const cryptoType = CryptoUtil.findCryptoType(esCryptoType);
                    const cryptoTypeName = cryptoType.name ? " " + cryptoType.name : "";
                    throw new Error(`Использование ЭП запрещено. Нет прав на криптосредство${cryptoTypeName}`);
                }
                if (!await new KeyPasswordDialog().show(session.getCurrentKeyAlias())) {
                    return;
                }
            }
            await this.handleExtAuthResponse(await this.installEs(selectedEs.keyId));
            if (this.refusedStorageSetting) {
                return;
            }

            const currentKeyInfo = {
                authorizedByLoginAuthAccount: true,
                keystoreTypeId: storageType.id,
                keystoreId: session.currentId,
                alias: session.getCurrentKeyAlias()
            };
            this.storage.set(StorageKey.LAST_ACTIVE_KEY, currentKeyInfo);
            this.close(true);
        } finally {
            this.esSelectionBlocked = false;
        }
    }

    /**
     * Обработчик кнопки "Отмена"
     * @return {Promise<void>}
     */
    private async onCancel(): Promise<void> {
        await this.forgetStorageIfPresent();
        this.close(false);
    }

    /**
     * Завершить работу с текущим хранилищем ЭП, если оно было установлено
     * @return {Promise<void>}
     */
    private async forgetStorageIfPresent(): Promise<void> {
        const session = PluginHelper.getSession();
        if (session.currentId) {
            await session.forgetKeystore();
        }
        this.refusedStorageSetting = false;
    }

    /**
     * Получить точный тип хранилища ЭП
     * @param selectedEs выбранная ЭП
     * @return {Promise<CryptoUtil.KeystoreType>} точный тип хранилища ЭП
     */
    private async getExactStorageType(selectedEs: EsInfo): Promise<CryptoUtil.KeystoreType> {
        switch (selectedEs.esType) {
            case "FILE_STORAGE":
                return CryptoUtil.KeystoreTypes.FILE;
            case "HARDWARE_DEVICE":
                return CryptoUtil.findDeviceType(selectedEs.storageType) === CryptoUtil.DeviceTypes.BIFIT_MACTOKEN ?
                    CryptoUtil.KeystoreTypes.BIFIT_MACTOKEN : CryptoUtil.KeystoreTypes.HW_DEVICE;
            case "CERTIFICATE":
                return await this.getExtCertKeystoreType(selectedEs.storageType);
            default:
                throw new Error("Неподдерживаемый тип ЭП: " + selectedEs.esType);
        }
    }

    /**
     * Установить файловую ЭП с указанным идентификатором, используя содержащуюся в кэше информацию о ней
     * @param esId идентификатор ЭП
     * @return {Promise<boolean>} true, если ЭП была установлена, false иначе
     */
    private async setFileEsUsingItsCachedInfo(esId: string): Promise<boolean> {
        const encryptedPath = await this.getEncryptedPathFromCache(esId);
        if (encryptedPath) {
            try {
                await PluginHelper.getSession().setKeystore(encryptedPath, CryptoUtil.KeystoreTypes.FILE);
                // ищем по идентификатору ЭП, т.к. текущий alias в хранилище может отличаться от соответствующего в кэше (сменился)
                const result = await this.setEsIfCurrentStorageContainsIt(esId);
                if (result) {
                    // на случай, если получили путь из кэша ЭП, которыми осуществлялся вход, кладём путь в кэш текущего диалога
                    await this.putEncryptedPathToCache(esId, encryptedPath);
                }
                return result;
            } catch (error) {
                // если не удалось установить файловое хранилище, указанное в закешированной информации об ЭП, ничего не делаем
            }
        }
        return false;
    }

    /**
     * Установить ЭП с указанным идентификатором из файлового хранилища
     * @param esId идентификатор ЭП
     */
    private async setEsFromFileStorage(esId: string): Promise<void> {
        if (await this.setFileEsUsingItsCachedInfo(esId)) {
            return;
        }
        const session = PluginHelper.getSession();
        const fileStruct = await session.openFileDialog(true, "Выбор хранилища ЭП", [{text: "Хранилище ЭП (*.dat)", pattern: "*.dat"}]);
        // если пользователь нажал кнопку отмены, encrypted path будет пустым
        if (!fileStruct.encrypted) {
            this.refusedStorageSetting = true;
            return;
        }
        await session.setKeystore(fileStruct.encrypted, CryptoUtil.KeystoreTypes.FILE);
        if (!await this.setEsIfCurrentStorageContainsIt(esId)) {
            throw new Error(`Электронная подпись не найдена ${fileStruct.path}`);
        }
        await this.putEncryptedPathToCache(esId, fileStruct.encrypted);
    }

    /**
     * Установить ЭП с указанным идентификатором из хранилищ на устройстве (токене) указанного типа
     * @param es          электронная подпись
     * @param storageType тип хранилища
     */
    private async setEsFromDeviceStorage(es: EsInfo, storageType: CryptoUtil.KeystoreType): Promise<void> {
        const session = PluginHelper.getSession();
        try {
            await session.setKeystore(es.tokenSerial, storageType);
        } catch (e) {
            throw new Error(`Подключите устройство ${this.getDeviceTypeName(es.storageType)} (ID: ${es.tokenSerial})`);
        }
        this.refusedStorageSetting = !await session.isPinSet() && !await new PinCodeDialog().show({tokenId: session.getCurrentTokenId()});
        if (this.refusedStorageSetting) {
            return;
        }
        if (!await this.setEsIfCurrentStorageContainsIt(es.keyId)) {
            throw new Error(`Электронная подпись не найдена ${this.getDeviceTypeName(es.storageType)} (ID: ${es.tokenSerial})`);
        }
    }

    /**
     * Возвращает наименование типа устройства, на котором хранится ЭП
     * @param storageType тип хранилища ЭП
     * @return наименование типа устройства, на котором хранится ЭП
     */
    private getDeviceTypeName(storageType: string) {
        const deviceType = CryptoUtil.findDeviceType(storageType);
        return deviceType ? deviceType.shortName : "";
    }

    /**
     * Установить ЭП с указанным идентификатором, если она находится в текущем хранилище
     * @param esId идентификатор искомой ЭП
     * @return {Promise<string>} true, если ЭП находится в текущем хранилище и была успешно установлена, false иначе
     */
    private async setEsIfCurrentStorageContainsIt(esId: string): Promise<boolean> {
        const session = PluginHelper.getSession();
        const loadedKeys = await session.loadKeys();
        for (const alias of Object.keys(loadedKeys)) {
            if (loadedKeys[alias].externalKeyId === esId) {
                await session.setKey(alias);
                await KeyUtils.saveKeysForStorage(session, session.currentId, loadedKeys);
                return true;
            }
        }
        return false;
    }

    /**
     * Установить стороннюю ЭП с указанным x509 сертификатом из хранилищ указанного типа
     * @param esId        идентификатор искомой ЭП
     * @param x509cert    сторонний x509 сертификат ЭП в Base64 представлении
     * @param storageType тип хранилища
     */
    private async setEsFromExtCertificate(esId: string, x509cert: string, storageType: CryptoUtil.KeystoreType): Promise<void> {
        const session = PluginHelper.getSession();
        const containers = await session.listKeystores(storageType);
        if (!containers.length) {
            throw new Error("Электронная подпись не найдена");
        }
        if (await this.setExtEsUsingItsCachedInfo(containers, esId, x509cert, storageType)) {
            return;
        }

        for (const containerId of containers) {
            await session.setKeystore(containerId, storageType);
            const certificateList = await session.getCertificateList();
            if (certificateList && certificateList.length && certificateList[0].x509 === x509cert) {
                // У сертификатов всегда один ключ
                await session.setKey(Object.keys(await session.loadKeys())[0]);
                await this.putExtCertContainerIdToCache(esId, containerId);
                return;
            }
        }
        throw new Error("Электронная подпись не найдена");
    }

    /**
     * Установить стороннюю ЭП с указанным x509 сертификатом, используя содержащуюся в кэше информацию о ней
     * @param containers  массив идентификаторов доступных контейнеров сторонних сертификатов
     * @param esId        идентификатор искомой ЭП
     * @param x509cert    сторонний x509 сертификат ЭП в Base64 представлении
     * @param storageType тип хранилища
     * @return {Promise<boolean>} true, если ЭП была установлена, false иначе
     */
    private async setExtEsUsingItsCachedInfo(containers: string[], esId: string, x509cert: string, storageType: CryptoUtil.KeystoreType): Promise<boolean> {
        const session = PluginHelper.getSession();
        const cachedContainerId = await this.getExtCertContainerIdFromCache(containers, esId, x509cert, storageType);
        if (cachedContainerId) {
            await session.setKeystore(cachedContainerId, storageType);
            // У сертификатов всегда один ключ
            await session.setKey(Object.keys(await session.loadKeys())[0]);
            await this.putExtCertContainerIdToCache(esId, cachedContainerId);
            return true;
        }
        return false;
    }

    /**
     * Установить текущую ЭП в сессию.
     * Работоспособность устанавливаемой ЭП проверяется путем проверки подписи сессионного пароля с ее использованием.
     * @param esId идентификатор устанавливаемой ЭП
     * @return {Promise<ExtAuthResponse>} ответ сервера с информацией для расширенной аутентификации
     */
    private async installEs(esId: string): Promise<ExtAuthResponse> {
        const serverHalfPass = await this.loginAuthAccountService.generateSessionPassword();
        const session = PluginHelper.getSession();
        // получаем сессионный пароль
        const localHalfPass = await session.getSessionPassword();
        // подписываем серверный и клиентский сессионный пароль
        const cmsSign = await session.cmsSign(serverHalfPass + localHalfPass);
        return await this.loginAuthAccountService.installEs({
            esId: esId,
            tokenSerial: session.getCurrentTokenId(),
            clientHalfPass: localHalfPass,
            sign: cmsSign
        });
    }

    /**
     * Определяет тип хранилища сертификатов, работа с которым поддерживается на машине клиента, и проверяет, совпадает ли он с типом хранилища выбранного ключа
     * @param extCertCryptoType тип хранилища стороннего сертификата
     * @return {Promise<CryptoUtil.KeystoreType>} тип хранилища стороннего сертификата
     */
    private async getExtCertKeystoreType(extCertCryptoType: string): Promise<CryptoUtil.KeystoreType> {
        const extCryptoTypeSettings = this.clientService.getClientInfo().clientProperties["CLIENT.EXT_CRYPTO.TYPE"];
        const allowedCryptoTypeIds = CryptoUtil.getAllowedCryptoTypeIds(null, extCryptoTypeSettings);
        if (allowedCryptoTypeIds.indexOf(extCertCryptoType) === -1) {
            throw new Error("Необходимая для выбранной ЭП криптография запрещена к использованию в iBank2");
        }

        const availableCrypto = await PluginHelper.getSession().getAvailableCrypto();
        if (availableCrypto.indexOf(extCertCryptoType) === -1) {
            throw new Error("Необходимая для выбранной ЭП криптография не установлена");
        }

        return CryptoUtil.findCryptoType(extCertCryptoType) === CryptoUtil.CryptoTypes.SIGNALCOM ?
            CryptoUtil.KeystoreTypes.SIGNALCOM_CONTAINER : CryptoUtil.KeystoreTypes.CRYPTOPRO_CONTAINER;
    }

    /**
     * Получает из кэша ЭП, использовшиеся при входе, с указанным типом хранилища
     * @param storageType тип хранилища
     * @return ЭП из кэша, использовшиеся при входе
     */
    private async getCachedLoginKeys(storageType: CryptoUtil.KeystoreType): Promise<CachedLoginKey[]> {
        const session = PluginHelper.getSession();
        const clientsCachedLoginKeys = await session.getProperty(
            EsDialog.USED_KEYS_STORAGE_KEY_PREFIX + this.clientService.getClientInfo().clientProperties["IBANK.SYSTEM.ID"]);
        const clientId = this.clientService.getClientInfo().clientInfo.id;
        if (!clientsCachedLoginKeys || !clientsCachedLoginKeys[clientId]) {
            return [];
        }
        return (<CachedLoginKey[]> clientsCachedLoginKeys[clientId].keys).filter(
                (key: CachedLoginKey): boolean => key.storage.keystoreTypeId === storageType.id);
    }

    /**
     * Получает из кэша закодированную информацию о расположении файлового хранилища
     * @param esId идентификатор ЭП
     * @return закодированная информация о расположении файлового хранилища
     */
    private async getEncryptedPathFromCache(esId: string): Promise<string> {
        // сначала пробуем получить из кэша текущего диалога
        const encryptedPaths = await PluginHelper.getSession().getProperty(EsDialog.USED_ENCRYPTED_PATHS_STORAGE_KEY);
        if (encryptedPaths && encryptedPaths[esId]) {
            return encryptedPaths[esId];
        }
        // если не нашли, то ищем в кэше ЭП, которыми совершался вход
        const cachedLoginKey = (await this.getCachedLoginKeys(CryptoUtil.KeystoreTypes.FILE)).find((key: CachedLoginKey): boolean => key.id === esId);
        return cachedLoginKey ? cachedLoginKey.storage.encryptedPath : null;
    }

    /**
     * Помещает в кэш закодированную информацию о расположении файлового хранилища
     * @param esId          идентификатор ЭП
     * @param encryptedPath закодированная информация о расположении файлового хранилища
     */
    private async putEncryptedPathToCache(esId: string, encryptedPath: string) {
        const session = PluginHelper.getSession();
        const encryptedPaths = await session.getProperty(EsDialog.USED_ENCRYPTED_PATHS_STORAGE_KEY) || {};
        encryptedPaths[esId] = encryptedPath;
        await session.setProperty(EsDialog.USED_ENCRYPTED_PATHS_STORAGE_KEY, encryptedPaths);
    }

    /**
     * Получить идентификатор контейнера стороннего сертификата из кэша
     * @param containers  массив идентификаторов доступных контейнеров сторонних сертификатов
     * @param esId        идентификатор искомой ЭП
     * @param x509cert    сторонний x509 сертификат ЭП в Base64 представлении
     * @param storageType тип хранилища
     * @return идентификатор контейнера
     */
    private async getExtCertContainerIdFromCache(containers: string[], esId: string, x509cert: string, storageType: CryptoUtil.KeystoreType): Promise<string> {
        let cachedContainerIds: string[] = [];
        // сначала идентификатор контейнера пробуем получить из кэша текущего диалога
        const dialogContainerIdsStorage = await PluginHelper.getSession().getProperty(EsDialog.USED_EXT_CERT_CONTAINER_IDS_STORAGE_KEY);
        if (dialogContainerIdsStorage && dialogContainerIdsStorage[esId]) {
            cachedContainerIds = dialogContainerIdsStorage[esId];
        } else {
            // если не нашли, то ищем в кэше ЭП, которыми совершался вход
            for (const cachedLoginKey of await this.getCachedLoginKeys(storageType)) {
                if (cachedLoginKey.id !== esId) {
                    continue;
                }
                if (cachedLoginKey.storage.x509cert !== x509cert) {
                    continue;
                }
                cachedContainerIds = cachedContainerIds.concat(cachedLoginKey.storage.containerIds);
            }
        }
        if (cachedContainerIds.length) {
            const connectedContainerFromCache = containers.find(containerId => cachedContainerIds.includes(containerId));
            if (connectedContainerFromCache) {
                return connectedContainerFromCache;
            }
        }
        return null;
    }

    /**
     * Помещает в кэш идентификатор контейнера стороннего сертификата
     * @param esId        идентификатор ЭП
     * @param containerId идентификатор контейнера стороннего сертификата
     */
    private async putExtCertContainerIdToCache(esId: string, containerId: string) {
        const session = PluginHelper.getSession();
        const containerIdsStorage = await session.getProperty(EsDialog.USED_EXT_CERT_CONTAINER_IDS_STORAGE_KEY) || {};
        const containerIds = containerIdsStorage[esId] || [];
        if (!containerIds.includes(containerId)) {
            containerIds.push(containerId);
        }
        containerIdsStorage[esId] = containerIds;
        await session.setProperty(EsDialog.USED_EXT_CERT_CONTAINER_IDS_STORAGE_KEY, containerIdsStorage);
    }

    /**
     * Обработка ответа сервера с информацией для расширенной аутентификации
     * @param response ответ сервера с информацией для расширенной аутентификации
     * @return {Promise<void>}
     */
    private async handleExtAuthResponse(response: ExtAuthResponse): Promise<void> {
        let params: {[key: string]: string};
        switch (response.code) {
            case EsDialog.SUCCESS_CODE:
                return;
            case EsDialog.EXT_AUTHENTICATION_REQUIRED_CODE:
                params = await TokenUtils.showExtAuthDialog(response.extAuthInfo);
                break;
            case EsDialog.EXT_AUTHENTICATION_BY_TRUSTSCREEN_REQUIRED_CODE:
                params = await this.fillTrustScreenExtAuthRequest(response.extAuthInfo);
                break;
            default:
                throw new Error(response.errorMessage);
        }
        if (!params) {
            this.refusedStorageSetting = true;
            return;
        }
        await this.handleExtAuthResponse(await this.loginAuthAccountService.extAuth(params));
    }

    /**
     * Запуск процесса расширенной аутентификации трастскрином
     * @param data данные для аутентификации
     * @return параметры расширенной аутентификации
     */
    private async fillTrustScreenExtAuthRequest(data: {[key: string]: string}): Promise<{[key: string]: string}> {
        const signData = data.ESID + data.EIP + data.CNAME;
        const sign = await PluginHelper.getSession().cmsSign(HexUtils.stringToHex(signData, false), data.TS_DATA);
        return {
            AUTH_SIGN: sign,
            ESID: data.ESID
        };
    }
}

/** Модель закешированной информации об ЭП, которой осуществлялся вход */
type CachedLoginKey = {
    /** Идентификатор ЭП */
    id: string,
    /** Информация о хранилище, содержащим ЭП */
    storage: CachedLoginKeyStorage
};

/** Модель закешированной информации о хранилище ЭП, которой осуществлялся вход */
type CachedLoginKeyStorage = {
    /** Идентификатор типа хранилища */
    keystoreTypeId: number,
    /** Зашифрованный путь к файлу хранилища */
    encryptedPath?: string,
    /** Массив идентификаторов контейнеров, на которых хранится сертификат */
    containerIds?: string[],
    /** Сертификат стороннего ключа в x509 представлении */
    x509cert?: string
};

/** Структура модели информации для диалога выбора ЭП */
export type EsDialogData = {
    /** Признак того, что ЭП требуется выбрать в рамках процесса явной подписи */
    explicitSign: boolean,
    /** Список ЭП */
    esList: EsInfo[]
};
