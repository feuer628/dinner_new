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
import {Service} from "platform/decorators/service";
import {Inject, Singleton} from "platform/ioc";
import {Http} from "platform/services/http";
import {DateUtils} from "../utils/dateUtils";

/**
 * Сервис, предоставляющий информацию о сотрудниках юр. лица
 */
@Singleton
@Service("EmployeeService")
export class EmployeeService {

    @Inject
    private http: Http;

    /**
     * Возвращает список действующих активных ЭП (кроме серверных), привязанных к текущему сотруднику,
     * отсортированный по убыванию даты окончания срока действия ЭП
     * @returns {Promise<EsInfo[]>} список действующих активных ЭП (кроме серверных), привязанных к текущему сотруднику,
     *                              отсортированный по убыванию даты окончания срока действия ЭП
     */
    async getCurrentEmployeeActiveEsSortedList(): Promise<EsInfo[]> {
        let esList = await this.http.get<EsInfo[]>("/ibank2/protected/services/employees/currentEmployeeActiveEsList");
        // использование MAC-токенов BIFIT недоступно для MacOS
        if (PluginHelper.detectOsType() === PluginHelper.OS_TYPES.MAC) {
            esList = esList.filter(es => es.esType !== EsType.HARDWARE_DEVICE ||
                CryptoUtil.findDeviceType(es.storageType) !== CryptoUtil.DeviceTypes.BIFIT_MACTOKEN);
        }
        // сортируем список ЭП по убыванию даты окончания срока действия
        esList.sort((es1, es2) => DateUtils.compareDate(es2.endDate, es1.endDate));
        return esList;
    }
}

/** Информация об электронной подписи */
export type EsInfo = {
    /** Идентификатор открытого ключа */
    keyId: string,
    /** Серийный номер сертификата */
    certificateSn: string,
    /** Статус */
    status: EsStatus,
    /** Тип хранилища электронной подписи */
    storageType: string,
    /** Тип электронной подписи */
    esType: EsType,
    /** Дата окончания действия ключа */
    endDate: string,
    /** Количество дней до окончания срока действия ключа */
    daysUntilExpiration?: number,
    /** ФИО владельца электронной подписи */
    ownerFullName: string,
    /** Серийный номер токена */
    tokenSerial?: string,
    /** Сторонний x509 сертификат ЭП в Base64 представлении */
    x509cert?: string;
};

/**
 * Статусы электронной подписи
 */
export enum EsStatus {
    /** Требует подтверждения */
    CONFIRMATION = "CONFIRMATION",
    /** Действующая */
    ACTIVE = "ACTIVE",
    /** Скоро истекает */
    NEARLY_EXPIRED = "NEARLY_EXPIRED",
    /** Заблокирована */
    BLOCKED = "BLOCKED",
    /** Просрочена */
    EXPIRED = "EXPIRED",
    /** Сертификат отозван */
    WITHDRAWN = "WITHDRAWN",
    /** Удалена */
    DELETED = "DELETED"
}

/**
 * Типы электронной подписи
 */
export enum EsType {
    /** Файл */
    FILE_STORAGE = "FILE_STORAGE",
    /** Аппаратное устройство */
    HARDWARE_DEVICE = "HARDWARE_DEVICE",
    /** Сертификат */
    CERTIFICATE = "CERTIFICATE",
    /** Ключ серверной подписи */
    SERVER_SIGN = "SERVER_SIGN"
}