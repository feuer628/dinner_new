import * as CryptoUtil from "default/CryptoUtil";
import * as PluginHelper from "default/PluginHelper";
import {Container} from "platform/ioc";
import {Storage} from "platform/services/storage";
import {UIRegistry} from "platform/uiRegistry";
import {CookieUtils} from "platform/utils/cookieUtils";
import {AppFrame} from "./components/appFrame";
import {StorageKey} from "./model/storageKey";
import {RouterConfiguration} from "./router/routerConfiguration";
import {ClientService} from "./service/clientService";
import {InactivityMonitor} from "./service/inactivityMonitor";
import {LogoutService} from "./service/logoutService";
import {TaxCalendarService} from "./service/taxCalendarService";

/**
 * Точка входа в приложение
 */
export async function start() {
    // Инициализируем стандартный набор UI-компонентов
    UIRegistry.init();

    // Инициализируем информацию о клиенте
    const clientService = Container.get(ClientService);
    await clientService.init();

    // Подключаемся к плагину
    connectToPlugin(clientService.getClientInfo().authorizedByLoginAuthAccount);

    await Container.get(TaxCalendarService).init();

    // Инициализируем монитор простоя приложения
    InactivityMonitor.getInstance().start();

    Container.get(LogoutService).init();

    const router = RouterConfiguration.getRouter();

    const appFrame = new AppFrame({router});

    appFrame.$mount("#workspace");
}

/**
 * Выполняет подключение к плагину BIFIT Signer
 * @param loginAuth выполнен ли вход при помощи логина
 */
async function connectToPlugin(loginAuth: boolean): Promise<void> {
    // Подключаемся к существующей сессии в плагине подписи
    const pluginSession = await PluginHelper.restoreSession(CookieUtils.getCookie("PSESSIONID"));
    if (!loginAuth && (pluginSession.currentId === null || !pluginSession.currentKeyAlias)) {
        // Восстановление сессии, которую не удалось восстановить через restoreSession.
        // Ситуация актуальна прежде всего для IE. т.к в разных вкладках могут быть разные сессии,
        // при этом в куке PSESSIONID может находиться только одна сессия.
        // Поэтому, для "реанимации" сессии, которую невозможно восстановить средствами плагина,
        // необходимо вручную восстановить её состояние.
        const storage = Container.get(Storage);
        const lastKey: { keystoreTypeId: number, keystoreId: string, alias: string } = storage.get(StorageKey.LAST_ACTIVE_KEY, null);
        if (!lastKey || !lastKey.keystoreId || !lastKey.alias) {
            throw new Error("Не удалось восстановить сессию");
        }
        await pluginSession.setKeystore(lastKey.keystoreId, CryptoUtil.getKeystoreType(lastKey.keystoreTypeId));
        pluginSession.currentKeyAlias = lastKey.alias;
    }
    CookieUtils.setIBank2Cookie("PSESSIONID", pluginSession.sessionId);
}