import {StringMap} from "platform/types";
import {BankInfo} from "./bankInfo";

/**
 * Информация о клиенте
 */
export type ClientInfo = {

    /** Основная информация о клиенте */
    clientInfo: Client;
    /** Контактная информация о клиенте */
    contactInfo: ContactInfo,
    /** Информация о сотруднике */
    employeeInfo: EmployeeInfo;
    /** Информация по банкам клиента */
    banks: BankInfo[];
    /** Значения клиентских свойств */
    clientProperties: StringMap;
    /** Настройки клиента */
    clientSettings: ClientSettings;
    /** Права клиента */
    permissions: StringMap;
    /** Признак того, что клиент авторизован с использованием учетной записи входа по логину */
    authorizedByLoginAuthAccount: boolean;
};

/** Основная информация о клиенте */
export type Client = {
    /** Идентификатор клиента */
    id: string;
    /** Внешний ID */
    extId: string;
    /** Наименование клиента на национальном языке */
    name: string;
    /** Наименование клиента на английском языке */
    nameLatin: string;
    /** ОКПО организации */
    okpo: string;
    /** Тип используемых OTP-генераторов */
    extAuthType: string;
    /* Сумма, свыше которой требуется подтверждение документов одноразовым паролем */
    otpConfirmSum: string;
    /** Номер договора */
    contractNum: string;
    /** Дата договора */
    contractDate: string;
    /** Признак индивидуального запрета группового подтверждения */
    banGroupConfirmation: boolean;
    /** КПП организации */
    kpp: string;
    /** ИНН организации */
    inn: string;
    /** Общероссийский классификатор отраслей народного хозяйства */
    okohx: string;
    /** СОАТО организации */
    coato: string;
    /** ОГРН (Основной Государственный Регистрационный Номер) клиента */
    ogrn: string;
    /** Дата внесения клиента в гос. реестр (дата присвоения ОГРН клиенту) */
    ogrnDate: string;
    /** Дата гос. регистрации клиента */
    gosRegDate: string;
    /** Организационная форма клиента */
    type: string;
    /** Фамилия физ. лица, занимающегося частной практикой */
    lastName: string;
    /** Имя физ. лица, занимающегося частной практикой */
    firstName: string;
    /** Отчество физ. лица, занимающегося частной практикой */
    middleName: string;
    /** Полное наименование организации */
    fullOrganizationName: string;
    /** Идентификатор отделения банка */
    departmentId: string;
    /** Название отделения банка, к которому прикреплен клиент */
    departmentName: string;
    /** Идентификатор отделения банка к которому прикреплен клиент */
    clientBranchId: string;
    /** Дополнительные КПП клиента */
    additionalKpp: string;
};

/**
 * Информация о сотруднике
 */
export type EmployeeInfo = {
    /** Идентификатор сотрудника */
    id: string;
    /** ФИО сотрудника */
    fio: string;
    /** Имя сотрудника */
    firstName: string;
    /** Фамилия сотрудника */
    lastName: string;
    /** Отчество сотрудника */
    patronymic: string;
    /** Роль сотрудника */
    role: string;
    /** Права на подпись */
    signPermissionsDocs: string[];
};

/** Контактная информация о клиенте */
export type ContactInfo = {
    /** Код страны */
    countryCode: string,
    /** Страна клиента на национальном языке */
    country: string,
    /** Страна клиента на английском языке */
    countryLatin: string,
    /** Город клиента на национальном языке */
    city: string,
    /** Почтовый индекс */
    addrPostalIndex: string,
    /** Регион */
    addrRegion: string,
    /** Район */
    addrDistrict: string,
    /** Населенный пункт */
    addrSettlement: string,
    /** Улица */
    addrStreet: string,
    /** Дом */
    addrHouse: string,
    /** Строение */
    addrBuilding: string,
    /** Офис или квартира */
    addrOffice: string,
    /** Город клиента на английском языке */
    cityLatin: string,
    /** Юридический адрес клиента на национальном языке */
    addr: string,
    /** Фактический адрес клиента на национальном языке */
    factAddr: string,
    /** Адрес клиента на английском языке */
    addrLatin: string,
    /** Адрес клиента */
    combinedAddr: string,
    /** Телефон клиента */
    telephone: string,
    /** Телефон для СМС-уведомлений */
    telephoneSms: string,
    /** ФИО ответственного лица клиента */
    fio: string,
    /** Факс клиента */
    fax: string,
    /** Email клиента */
    email: string,
    /** Телекс клиента */
    telex: string
};

/**
 * Настройки клиента
 */
export type ClientSettings = {

    /** Режим подписи платежа доверенному получателю Трастскрином */
    trustedPaymentsTrustscreenSignMode: TrustScreenSignMode;

    /** Режим подписи обычного платежа Трастскрином */
    otherPaymentsTrustscreenSignMode: TrustScreenSignMode;

    /** Режим подписи других документов Трастскрином */
    otherDocsTrustscreenSignMode: TrustScreenSignMode;

    /** Идентификатор счета для оплаты услуг */
    clientServicesAccountId: string;
};

/**
 * Режим подписи документа при помощи Трастскрина
 */
export enum TrustScreenSignMode {

    /** Документ подписывается без визуализации */
    WITHOUT_VISUALIZATION = "WITHOUT_VISUALIZATION",

    /** Документ подписывается с визуализацией только один раз */
    ONE_WITH_VISUALIZATION = "ONE_WITH_VISUALIZATION",

    /** Документ всегда подписывается с визуализацией */
    ALL_WITH_VISUALIZATION = "ALL_WITH_VISUALIZATION"
}