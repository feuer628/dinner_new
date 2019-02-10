import {Service} from "platform/decorators/service";
import {Inject, Singleton} from "platform/ioc";
import {Http} from "platform/services/http";
import {IndicatorLicense} from "platform/types";
import {Account, BalanceInfo, BalanceItem} from "../model/account";
import {BankInfo} from "../model/bankInfo";
import {ClientInfo} from "../model/clientInfo";
import {ConfirmType} from "../model/confirmationType";
import {BrowserInfo} from "./clientService";

/** Значение, сохраняемое в настройку канала по умолчанию при переходе в полную версию */
const INTERNET_WEB_CHANNEL_VALUE = "INTERNET_WEB";

/** Основная часть URL к сервисам по работе с информацией о клиенте */
const ROOT_CLIENT_SERVICE_URL = "/ibank2/protected/services/client";

/** Список возможных типов счетов. Порядок важен! Используется для сортировки списка счетов. */
const ALLOWED_ACCOUNT_TYPES = ["SETTLEMENT", "SETTLEMENT_DU", "SPECIAL"];

/**
 * Сервис по работе с пользователем
 */
@Service("ClientService")
@Singleton
export class ClientService {

    /** Информация о браузере пользователя */
    browserInfo = ClientService.detectBrowser();

    @Inject
    private http: Http;

    /** Информация о клиенте */
    private clientInfo: ClientInfo;

    /**
     * Список счетов клиента.
     * Типы: Расчетный, Специальный, Расчетный ДУ.
     * Статусы: Только просмотр, Все операции, Только пополнение, Только списание (Кроме Закрыт)
     */
    private accounts: Account[];

    /**
     * Определяет тип и версию браузера.
     * @returns {@link BrowserInfo}
     */
    private static detectBrowser(): BrowserInfo {
        const userAgent = navigator.userAgent;
        let version;
        let browserInfo = userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(browserInfo[1])) {
            version = /\brv[ :]+(\d+)/g.exec(userAgent) || [];
            return {name: "MSIE", version: (version[1] || "")};
        }
        if (browserInfo[1] === "Chrome") {
            version = userAgent.match(/\bOPR\/(\d+)/);
            if (version != null) {
                return {name: "Opera", version: version[1]};
            }
            version = userAgent.match(/\bEdge\/(\d+)/);
            if (version != null) {
                return {name: "Edge", version: version[1]};
            }
        }
        browserInfo = browserInfo[2] ? [browserInfo[1], browserInfo[2]] :
            [navigator.appName, navigator.appVersion, "-?"];

        version = userAgent.match(/version\/(\d+)/i);
        if (version != null) {
            browserInfo.splice(1, 1, version[1]);
        }
        return {name: browserInfo[0], version: browserInfo[1]};
    }

    /**
     * Инициализация сервиса
     * @return {Promise<void>}
     */
    async init(): Promise<void> {
        this.clientInfo = await this.http.get<ClientInfo>(`${ROOT_CLIENT_SERVICE_URL}/info`);
    }

    /** Возвращает информацию о клиенте */
    getClientInfo(): ClientInfo {
        return this.clientInfo;
    }

    /**
     * Возвращает список рублевых счетов клиента. Определенных типов и в статусах Закрыт, Только просмотр и Все операции
     * @param updateBalances признак принудительного обновления остатков по счетам
     * @return {Promise<Account[]>} список счетов
     */
    async getAllAccounts(updateBalances = false): Promise<Account[]> {
        if (!this.accounts) {
            this.fillAccounts();
            await this.updateBalances();
        } else if (updateBalances) {
            await this.updateBalances();
        }
        return this.accounts;
    }

    /**
     * Возвращает список рублевых счетов клиента доступных для списания. В статусе Все операции
     * @param updateBalances признак принудительного обновления остатков по счетам
     * @return {Promise<Account[]>} список счетов
     */
    async getActiveAccounts(updateBalances = false): Promise<Account[]> {
        return (await this.getAllAccounts(updateBalances)).filter(account => account.status === "ACTIVE");
    }

    /**
     * Возвращает список рублевых счетов клиента в банке с выбранным БИКом, в статусе отличном от "Закрыт"
     * @param bic БИК банка для получения счетов
     * @return {Promise<Account[]>} список счетов
     */
    getAccountsByBic(bic: string): Account[] {
        const bank = this.clientInfo.banks.find(bankInfo => bankInfo.bic === bic && bankInfo.accounts !== null);
        return bank && bank.accounts.filter((account: Account): boolean => {
            return ALLOWED_ACCOUNT_TYPES.indexOf(account.type) !== -1 && account.currency === "RUR" && account.status !== "CLOSED";
        }) || [];
    }

    /**
     * Обновляет алиас счета (поле CLIENT_COMMENTS)
     * @param {string} accountId идентификатор счета в системе
     * @param {string} alias алиас счета, может быть пустой
     * @return {Promise<void>}
     */
    async updateAccountAlias(accountId: string, alias: string): Promise<void> {
        await this.http.post<void>(`${ROOT_CLIENT_SERVICE_URL}/accounts/${accountId}/alias`, alias);
    }

    /**
     * Возвращает информацию о токенах подтверждения клиента
     * @return {Promise<ClientTokensResponse>} информация о токенах подтверждения клиента
     */
    async getClientTokens(): Promise<ClientTokensResponse> {
        return this.http.get<ClientTokensResponse>(`${ROOT_CLIENT_SERVICE_URL}/confirmSettings`);
    }

    /**
     * Переключает используемый по умолчанию канал на "Интернет-Банк для корпоративных клиентов"
     * @return {Promise<void>}
     */
    async switchChannelToCorporate(): Promise<void> {
        await this.http.post<void>(`${ROOT_CLIENT_SERVICE_URL}/channel/update`, {channel: INTERNET_WEB_CHANNEL_VALUE});
    }

    /**
     * Проверяет лицензию на модуль Индикатор
     * @return true если услуга Индикатор доступна клиенту
     */
    async hasIndicatorLicense(): Promise<boolean> {
        const clientInfo = this.getClientInfo();
        if (clientInfo.clientProperties["ONLINE.INDICATOR.SERVICE_ENABLE"] !== "true") {
            return false;
        }
        if (clientInfo.clientProperties["ONLINE.INDICATOR.HIDE_RATING"] === "true") {
            const res = await this.http.get<IndicatorLicense>("/ibank2/protected/services/indicator/license");
            return res.hasLicense;
        }
        return true;
    }

    /**
     * Проверяет права на модуль/канал
     * @param {string} name наименование модуля/канала
     * @param {string} accessType тип доступа. Возможные значения: "r","w","x","a"
     * @return {boolean} результат проверки
     */
    hasPermissions(name: string, accessType: string): boolean {
        const perm = this.clientInfo.permissions[name];
        return !!perm && perm.indexOf(accessType) !== -1;
    }

    /**
     * Возвращает информацию о ключе ЭП клиента
     * @param {string} keyId идентификатор ключа
     * @return {Promise<KeyInfoResp>} информацию о ключе ЭП клиента
     */
    async getKey(keyId: string): Promise<KeyInfoResp> {
        return this.http.get<KeyInfoResp>(`${ROOT_CLIENT_SERVICE_URL}/keys/${keyId}`);
    }

    /**
     * Фильтрует счета
     * @return {Promise<void>}
     */
    private fillAccounts() {
        const accounts: Account[] = [];
        this.clientInfo.banks.forEach((bankInfo: BankInfo) => {
            // в банке может не быть открытых счетов
            if (bankInfo.accounts !== null) {
                bankInfo.accounts.filter((account: Account): boolean => {
                    return ALLOWED_ACCOUNT_TYPES.indexOf(account.type) !== -1 && account.currency === "RUR";
                }).forEach((account: Account): void => {
                    accounts.push(account);
                });
            }
        });
        this.accounts = accounts.sort((a1: Account, a2: Account): number => {
            return ALLOWED_ACCOUNT_TYPES.indexOf(a1.type) - ALLOWED_ACCOUNT_TYPES.indexOf(a2.type);
        });
    }

    /**
     * Обновляет балансы по счетам клиента
     * @return {Promise<void>}
     */
    private async updateBalances(): Promise<void> {
        const balances = await this.http.get<BalanceInfo>(`${ROOT_CLIENT_SERVICE_URL}/accounts/balance`);
        const balancesMap: any = {};
        balances.result.forEach((item: BalanceItem) => {
            balancesMap[item.accountId] = item.balance;
        });
        this.accounts.forEach((account: Account): void => {
            account.freeBalance = balancesMap[account.ibankAccountId];
        });
    }
}

/**
 * Информация о браузере
 */
export type BrowserInfo = {

    /** Имя браузера */
    name: string,

    /** Версия браузера */
    version: string;
};

/**
 * Информация о токенах подтверждения клиента
 */
export type ClientTokensResponse = {

    /** Информация о токенах для подтверждения платежных поручений */
    paymentTokenInfoList?: ClientTokenInfo[];

    /** Информация о токенах для группового подтверждения документов */
    groupTokenInfoList?: ClientTokenInfo[];

    /** Информация о токенах для подтверждения доверенных получателей */
    trustTokenInfoList?: ClientTokenInfo[];
};

/**
 * Информация о токене клиента
 */
export type ClientTokenInfo = {

    /** Тип токена */
    confirmType: ConfirmType;

    /** Хеш-код токена */
    hash: string;

    /** Серийный номер токена */
    serial: string;

    /** Признак того, что серийный номер замаскирован */
    serialIsMasked: boolean;

    /** Нужно ли использовать этот токен по умолчанию */
    defaultToken: boolean;
};

/**
 * Структура возвращаемая из сервиса информации о ключе ЭП
 */
export type KeyInfoResp = {
    /** ФИО владельца ключа */
    ownerFullName: string,
    /** Время последнего использования */
    lastLoginTime: string,
    /** Идентификатор открытого ключа */
    keyId: string,
    /** Дата окончания действия ключа */
    endDate: string,
    /** Тип хранилища ключа */
    storageType: string,
    /** Тип ключа */
    keyType?: string,
    /** Статуса ключа */
    status: string,
    /** SN сертификата */
    certificateSn?: string,
    /** Идентификатор сотрудника, владеющего ключом */
    employeeId: string,
    /** Тип криптографии ключа */
    cryptoType: string;
};
