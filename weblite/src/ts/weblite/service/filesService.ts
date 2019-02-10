import {Service} from "platform/decorators/service";
import {Singleton} from "platform/ioc";

/** Основная часть URL к сервисам работы с файлами */
const ROOT_URL = "/ibank2/protected/services/files";

/**
 * Сервис для загрузки и выгрузки файлов
 */
@Service("FilesService")
@Singleton
export class FilesService {

    /**
     * Загрузка файла экспорта GET-запросом
     * @param {string} fileId идентификатор файла
     * @return {Promise<void>}
     */
    async downloadExportedFile(fileId: string): Promise<any> {
        window.open(`${ROOT_URL}/exported/${fileId}`, "_self");
    }
}