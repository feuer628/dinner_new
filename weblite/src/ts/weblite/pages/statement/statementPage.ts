import {CatchErrors} from "platform/decorators";
import {Inject} from "platform/ioc";
import {Cache, CacheKey} from "platform/services/cache";
import {ExportType, PrintService} from "platform/services/printService";
import {Component, UI} from "platform/ui";
import {ButtonGroupData} from "platform/ui/xButtonGroup";
import {CommonUtils} from "platform/utils/commonUtils";
import {FilterEvent} from "../../components/datePeriodSelectorComponent";
import {PrintStatementParam, StatementPrintHelper} from "../../components/print/statementPrintHelper";
import {TemplatePage} from "../../components/templatePage";
import {Account} from "../../model/account";
import {ClientService} from "../../service/clientService";
import {ExportService, StatementFormat} from "../../service/exportService";
import {FilesService} from "../../service/filesService";
import {MachineExportOpersRequest, MachineExportService} from "../../service/machineExportService";
import {AccountUtils} from "../../utils/accountUtils";

/** Формат даты для фильтра */
const PERIOD_FORMAT = "DD.MM.YYYY";

/**
 * Компонент страницы выписки
 */
@Component({
    // language=Vue
    template: `
        <template-page>
            <template slot="main">
                <div class="app-content__inner">
                    <span class="title page-header">Получить выписку</span>
                    <div class="margB32 form-row">
                        <account-select title="По счету" v-model="selectedAccount" class="w506" :accounts="accounts"></account-select>
                        <date-period-selector title="Период" @change="onPeriodChange" class="margL16"></date-period-selector>
                    </div>
                    <div class="margB64">
                        <div class="fieldTitle-row">В формате</div>
                        <x-button-group v-model="selectedExportFormat" :buttons="exportFormats"></x-button-group>
                    </div>
                    <div class="app-content-inner__footer">
                        <div>
                            <progress-button class="btn btn-primary" :handler="onExport">Получить</progress-button>
                            <progress-button class="btn" :handler="onPrint">Печать</progress-button>
                        </div>
                        <router-link to="/events" class="btn">Назад</router-link>
                    </div>
                </div>
            </template>
        </template-page>
    `,
    components: {TemplatePage}
})
export class StatementPage extends UI {

    /** Сервис для работы с кэшем */
    @Inject
    private cacheService: Cache;

    /** Сервис по работе с информацией о клиенте */
    @Inject
    private clientService: ClientService;

    /** Сервис экспорта */
    @Inject
    private exportService: ExportService;

    /** Сервис экспорта в машинном формате */
    @Inject
    private machineExportService: MachineExportService;

    /** Сервис работы с файлами */
    @Inject
    private fileService: FilesService;

    /** Сервис печати */
    @Inject
    private printService: PrintService;

    /** Список счетов */
    private accounts: Account[] = [];

    /** Дата начала выписки */
    private beginDate: string = null;

    /** Дата окончания выписки */
    private endDate = moment().format(PERIOD_FORMAT);

    /** Выбранный счёт */
    private selectedAccount: Account = null;

    /** Форматы экспорта */
    private exportFormats: ButtonGroupData[] = [
        {id: 0, text: "1C"},
        {id: 1, text: "Excel"},
        {id: 2, text: "CSV"},
        {id: 3, text: "PDF"}
    ];

    /** Значения форматов для передачи в запрос */
    private exportFormatValues = ["_1C", "XLSX", "CSV"];

    /** Выбранный формат экспорта */
    private selectedExportFormat: ButtonGroupData = this.exportFormats[0];

    /**
     * Загружает список счетов клиента
     * @inheritDoc
     * @return {Promise<void>}
     */
    async created(): Promise<void> {
        this.accounts = await this.clientService.getAllAccounts();
        this.selectedAccount  = AccountUtils.getAccountFromCacheOrDefault(this.accounts);
    }

    /**
     * Обработчик выбора периода
     * @param {FilterEvent} event
     */
    private onPeriodChange(event: FilterEvent): void {
        this.beginDate = event.startDate;
        this.endDate = event.endDate;
    }

    /**
     * Обработчик нажатия кнопки экспорта
     * @return {Promise<void>}
     */
    @CatchErrors
    private async onExport(): Promise<void> {
        if (this.selectedExportFormat.text === "PDF") {
            const fileId = await this.exportService.createStatementFile({
                exportType: ExportType.PDF,
                format: StatementFormat.STANDARD,
                accountId: this.selectedAccount.ibankAccountId,
                beginDate: this.beginDate,
                endDate: this.endDate
            });
            await this.fileService.downloadExportedFile(fileId);
        } else {
            const request: MachineExportOpersRequest = {
                beginDate: this.beginDate,
                endDate: this.endDate,
                exportFormat: this.exportFormatValues[this.selectedExportFormat.id],
                accountsList: [{
                    accountId: this.selectedAccount.ibankAccountId
                }],
                useOnline: true
            };
            await this.fileService.downloadExportedFile((await this.machineExportService.export(request)).fileId);
        }
    }

    /**
     * Обработчик нажатия кнопки печати
     * @return {Promise<void>}
     */
    @CatchErrors
    private async onPrint(): Promise<void> {
        await this.printService.print(new StatementPrintHelper(this.getPrintParam()));
    }

    /**
     * Формирует набор параметров печати выписки
     * @return {PrintStatementParam}
     */
    private getPrintParam(): PrintStatementParam {
        return {
            accountId: this.selectedAccount.ibankAccountId,
            beginDate: CommonUtils.isBlank(this.beginDate) ? this.selectedAccount.createDate : this.beginDate,
            endDate: this.endDate,
            format: "standard"
        };
    }
}
