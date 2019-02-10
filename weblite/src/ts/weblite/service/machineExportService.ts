import {Service} from "platform/decorators/service";
import {Inject, Singleton} from "platform/ioc";
import {Http} from "platform/services/http";
import {StringMap} from "platform/types";

/** Основная часть URL к сервисам экспорта в машинные форматы */
const ROOT_MACHINE_EXPORT_URL = "/ibank2/protected/services/machineExport";

/**
 * Сервис работы с экспортом в машинных форматах
 */
@Service("MachineExportService")
@Singleton
export class MachineExportService {

    @Inject
    private http: Http;

    /**
     * Запрос экспорта выписки в машинном формате
     * @param {MachineExportOpersRequest} request запрос экспорта выписки в машинный формат
     * @return {Promise<MachineExportOpersResponse>}
     */
    async export(request: MachineExportOpersRequest): Promise<MachineExportOpersResponse> {
        const result = await this.http.post<MachineExportOpersResponse>(`${ROOT_MACHINE_EXPORT_URL}/statement`, request);
        if (result.fileId == null) {
            const msg = result.accountResults[request.accountsList[0].accountId];
            throw new Error(msg);
        }
        return result;
    }
}

/**
 * Запрос экспорта выписки в машинный формат
 */
export type MachineExportOpersRequest = {

    /** Дата начала выписки */
    beginDate?: string;

    /** Дата окончания выписки */
    endDate?: string;

    /** Формат выписки */
    exportFormat: string;

    /** Список счетов */
    accountsList: Array<{
        accountId: string;
    }>;

    /** Признак приоритета онлайн-выписки */
    useOnline?: boolean
};

/**
 * Ответ на запрос экспорта выписки в машинный формат
 */
export type MachineExportOpersResponse = {

    fileId: string;

    accountResults: StringMap
};