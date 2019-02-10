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

import {CatchErrors} from "platform/decorators";
import {Inject} from "platform/ioc";
import {Component, UI} from "platform/ui";
import {ModalContainer} from "platform/ui/modalContainer";
import {CommonUtils} from "platform/utils/commonUtils";
import {ConfirmDialog} from "../../components/dialogs/confirmDialog";
import {MessageComponent} from "../../components/message/messageComponent";
import {BtnReturn} from "../../model/btnReturn";
import {ClientInfo} from "../../model/clientInfo";
import {ClientType} from "../../model/clientType";
import {GlobalEvent} from "../../model/globalEvent";
import {ClientService} from "../../service/clientService";
import {HasEmployees, TaxObject, TaxPeriodType, TaxSettings, TaxSettingsService, TaxSystem} from "../../service/taxSettingsService";
import {FnsInfoBlock} from "./fnsInfoBlock";
import {FssInfoBlock} from "./fssInfoBlock";

/**
 * Страница настроек налоговой политики клиента
 */
@Component({
    // language=Vue
    template: `
        <div class="app-content__inner">
            <div class="page-header form-row">
                <span class="title">Налоги</span>
            </div>

            <div class="form-row">
                <v-select v-model="taxSettings.taxPolicySettings.taxSystem"
                          :options="taxSystemTypes"
                          @afterselect="onTaxSystemChange"
                          title="Система налогообложения"
                          class="full">
                </v-select>
                <v-select v-if="isClientTypeNotCorporate"
                          v-model="taxSettings.taxPolicySettings.hasEmployees"
                          :options="employeeHasOrNoOptions"
                          title="Наличие сотрудников"
                          class="full">
                </v-select>
            </div>

            <div v-if="isTaxPeriodOptionShowed" class="form-row">
                <v-select v-model="taxSettings.taxPolicySettings.taxPeriodType"
                          :options="taxPeriods"
                          title="Периодичность выплат налога на прибыль"
                          class="full">
                </v-select>
                <div class="full"></div>
            </div>

            <div v-if="isTaxObjectOptionShowed" class="form-row">
                <v-select v-model="taxSettings.taxPolicySettings.taxObject"
                          :options="taxObjects"
                          title="Объект налогообложения"
                          class="medium">
                </v-select>
                <div class="full"></div>
            </div>

            <div class="form-row margT24">
                Напоминать об уплате за
                <x-masked-input class="margL12 w60 alignC"
                                v-model="taxSettings.taxPolicySettings.notificationPeriod"
                                :mask="{mask: '000'}"/>
                <span class="margL8">дней</span>
            </div>

            <accordeon-panel>
                <span slot="header">Реквизиты Федеральной Налоговой Службы (ФНС)</span>
                <fns-info-block slot="content" :tax-office="taxSettings.taxOffice" @update="updateIndicatorTaxOffice"
                                :edit-mode="!taxSettings.taxOffice.fillFromIndicator"
                                :hasIndicatorLicense="hasIndicatorLicense"></fns-info-block>
            </accordeon-panel>

            <accordeon-panel v-if="!isClientTypeNotCorporate || taxSettings.taxPolicySettings.hasEmployees">
                <span slot="header">Реквизиты Фонда Социального Страхования (ФСС)</span>
                <fss-info-block slot="content" :fss-info="taxSettings.insuranceOffice"></fss-info-block>
            </accordeon-panel>

            <div class="app-content-inner__footer">
                <button class="btn btn-primary" @click="saveTaxSettings">Сохранить</button>
            </div>
        </div>
    `,
    components: {FnsInfoBlock, FssInfoBlock}
})
export class TaxSettingsPage extends UI {

    /** Сервис по работе с клиентом */
    @Inject private clientService: ClientService;
    /** Сервис по работе с налоговыми настройками */
    @Inject private taxSettingsService: TaxSettingsService;
    /** Информация о клиенте */
    private clientInfo: ClientInfo = null;
    /** Типы опций систем налогообложения */
    private taxSystemTypes: TaxSystem[] = [];
    /** Типы опций периодичности выплат */
    private taxPeriods = TaxPeriodType.values();
    /** Типы опций объектов налогообложения */
    private taxObjects = TaxObject.values();
    /** Типы опций наличия/отсутствия сотрудников */
    private employeeHasOrNoOptions = HasEmployees.values();
    /** Исходные настройки учетной политики клиента */
    private initialTaxSettings: TaxSettings = null;
    /** Признак наличия лицензии сервиса Индикатор */
    private hasIndicatorLicense = false;
    /** Модель данных для полей страницы "Налоги" */
    private taxSettings: TaxSettings = {
        taxPolicySettings: {
            taxSystem: TaxSystem.OSN,
            taxPeriodType: TaxPeriodType.MONTHLY,
            hasEmployees: HasEmployees.TRUE,
            notificationPeriod: "14"
        },
        taxOffice: {
            fillFromIndicator: false
        },
        insuranceOffice: {}
    };

    /**
     * Инициализация данных компонента
     * @inheritDoc
     */
    @CatchErrors
    async created(): Promise<void> {
        this.clientInfo = this.clientService.getClientInfo();
        this.hasIndicatorLicense = await this.clientService.hasIndicatorLicense();
        this.createOptionsDependsOnClientType();
        await this.getAndInitTaxSettings();
    }

    /**
     * Обрабатывает хук ухода со страницы
     * проверяет производились ли изменения в настройках, выводит диалог, и в случае согласия, сохраняет настройки
     * @inheritDoc
     */
    @CatchErrors
    async beforeRouteLeave(to: VueRouter.Route, from: VueRouter.Route, next: VueRouter.Resolver): Promise<void> {
        if (ModalContainer.isUiBlocked()) {
            next(false);
            return;
        }
        if (this.settingsHasNoChanges()) {
            next();
            return;
        }
        const dialog = new ConfirmDialog();
        const btnReturn = await dialog.show("Настройки изменены. Сохранить?");
        if (BtnReturn.YES === btnReturn) {
            if (this.isValid()) {
                await this.taxSettingsService.saveTaxSettings(this.taxSettings);
                next();
                MessageComponent.showToast("Настройки успешно сохранены");
            }
        } else if (BtnReturn.NO === btnReturn) {
            next();
        }
    }

    /**
     * Получает данные для полей шаблона из сервиса
     */
    private async getAndInitTaxSettings() {
        this.initialTaxSettings = await this.taxSettingsService.getTaxSettings();
        if (this.initialTaxSettings.taxPolicySettings.taxSystem) {
            this.taxSettings.taxPolicySettings = {...this.initialTaxSettings.taxPolicySettings};
            this.taxSettings.taxOffice = {...this.initialTaxSettings.taxOffice};
            this.taxSettings.insuranceOffice = {...this.initialTaxSettings.insuranceOffice};
        }
        if (this.initialTaxSettings.taxOffice.fillFromIndicator === null) {
            // если настройка заполнения из индикатора не была ранее сохранена, включаем ее в зависимости от наличия лицензии
            this.taxSettings.taxOffice.fillFromIndicator = this.hasIndicatorLicense;
        }
    }

    /**
     * Сохраняет текущие настройки страницы "Налоги"
     */
    @CatchErrors
    private async saveTaxSettings(): Promise<void> {
        if (!this.isValid()) {
            return;
        }
        await this.taxSettingsService.saveTaxSettings(this.taxSettings);
        this.initialTaxSettings = {
            taxPolicySettings: {...this.taxSettings.taxPolicySettings},
            taxOffice: {...this.taxSettings.taxOffice},
            insuranceOffice: {...this.taxSettings.insuranceOffice}
        };
        MessageComponent.showToast("Настройки успешно сохранены");
    }

    /**
     * Возвращает признак отображения выпадайки "Периодичность выплат налога на прибыль".
     * true если в Системе налогообложения выбрана опция "Основная(ОСН)"
     */
    private get isTaxPeriodOptionShowed(): boolean {
        return this.taxSettings.taxPolicySettings.taxSystem === TaxSystem.OSN;
    }

    /**
     * Возвращает признак отображения выпадайки "Объект налогообложения".
     * true если в Системе налогообложения выбрана опция "Упрощенная(УСН)"
     */
    private get isTaxObjectOptionShowed(): boolean {
        return this.taxSettings.taxPolicySettings.taxSystem === TaxSystem.USN;
    }

    /**
     * Очищает выпадайки "Объект налогообложения" и "Периодичность выплат налога на прибыль"
     * Если выбрана "Основная (ОСН) - выпадайке "Периодичность выплат.." присваивается значение по умолчанию
     * Если выбрана "Упрощенная (УСН) - выпадайке "Объект налогообложения" присваивается значение по умолчанию
     * @param taxSystem событие
     */
    private onTaxSystemChange(taxSystem: TaxSystem): void {
        this.taxSettings.taxPolicySettings.taxObject = null;
        this.taxSettings.taxPolicySettings.taxPeriodType = null;
        if (taxSystem === TaxSystem.OSN) {
            this.taxSettings.taxPolicySettings.taxPeriodType = TaxPeriodType.MONTHLY;
        }
        if (taxSystem === TaxSystem.USN) {
            this.taxSettings.taxPolicySettings.taxObject = TaxObject.INCOME;
        }
    }

    /**
     * Возвращает признак отображения выпадайки "Наличие сотрудников" только для не юридических лиц
     */
    private get isClientTypeNotCorporate(): boolean {
        return ClientType.valueOf(this.clientInfo.clientInfo.type) !== ClientType.CORPORATE;
    }

    /**
     * Обновляет настройки если данные из "Индикатора" отличаются от текущих
     */
    private async updateIndicatorTaxOffice(): Promise<void> {
        // Проверка на то, что настройки уже были сохранены в БД. Не обновляем, если клиент еще ни разу не сохранял настройки
        if (this.initialTaxSettings.taxPolicySettings.taxSystem) {
            try {
                await this.taxSettingsService.saveTaxSettings(this.taxSettings);
                this.initialTaxSettings.taxOffice = {...this.taxSettings.taxOffice};
            } catch (mute) {
            }
        }
    }

    /**
     * Возвращает массив элементов для выпадайки "Система налогообложения" в зависимости от типа клиента
     */
    private createOptionsDependsOnClientType(): void {
        const type = ClientType.valueOf(this.clientInfo.clientInfo.type);
        // ОСН доступна всем типам
        this.taxSystemTypes = [TaxSystem.OSN];
        // УСН и ЕНВД доступны всем кроме Адвоката и Нотариуса
        if (![ClientType.LAWYER, ClientType.NOTARY].includes(type)) {
            this.taxSystemTypes.push(...[TaxSystem.USN, TaxSystem.ENVD]);
        }
        // ПС доступна только для ИП
        if (ClientType.INDIVIDUAL === type) {
            this.taxSystemTypes.push(TaxSystem.PSN);
        }
    }

    /**
     * Валидирует поля ввода ФНС и ФСС
     */
    private isValid(): boolean {
        const taxOffice = this.taxSettings.taxOffice;
        const insuranceOffice = this.taxSettings.insuranceOffice;
        let isValid = true;
        if (CommonUtils.isBlank(taxOffice.inn)) {
            UI.emit(GlobalEvent.HANDLE_ERROR, new Error(`Поле "ИНН ФНС" обязательно для заполнения`));
            isValid = false;
        }
        if (CommonUtils.isBlank(taxOffice.kpp)) {
            UI.emit(GlobalEvent.HANDLE_ERROR, new Error(`Поле "КПП ФНС" обязательно для заполнения`));
            isValid = false;
        }
        if (CommonUtils.isBlank(taxOffice.name)) {
            UI.emit(GlobalEvent.HANDLE_ERROR, new Error(`Поле "Наименование ФНС" обязательно для заполнения`));
            isValid = false;
        }
        if (CommonUtils.isBlank(taxOffice.bic)) {
            UI.emit(GlobalEvent.HANDLE_ERROR, new Error(`Поле "БИК банка ФНС" обязательно для заполнения`));
            isValid = false;
        }
        if (CommonUtils.isBlank(taxOffice.account)) {
            UI.emit(GlobalEvent.HANDLE_ERROR, new Error(`Поле "Счет ФНС" обязательно для заполнения`));
            isValid = false;
        }
        if (CommonUtils.isBlank(taxOffice.oktmo)) {
            UI.emit(GlobalEvent.HANDLE_ERROR, new Error(`Поле "ОКТМО ФНС" обязательно для заполнения`));
            isValid = false;
        }
        if (CommonUtils.isBlank(insuranceOffice.inn)) {
            UI.emit(GlobalEvent.HANDLE_ERROR, new Error(`Поле "ИНН ФСС" обязательно для заполнения`));
            isValid = false;
        }
        if (CommonUtils.isBlank(insuranceOffice.kpp)) {
            UI.emit(GlobalEvent.HANDLE_ERROR, new Error(`Поле "КПП ФСС" обязательно для заполнения`));
            isValid = false;
        }
        if (CommonUtils.isBlank(insuranceOffice.name)) {
            UI.emit(GlobalEvent.HANDLE_ERROR, new Error(`Поле "Наименование ФCС" обязательно для заполнения`));
            isValid = false;
        }
        if (CommonUtils.isBlank(this.taxSettings.taxPolicySettings.notificationPeriod)) {
            UI.emit(GlobalEvent.HANDLE_ERROR, new Error(`Поле "Напоминать об уплате за" обязательно для заполнения`));
            isValid = false;
        }
        return isValid;
    }

    /**
     * Возвращает признак того, что настройки не изменились
     * @return true, если настройки остались без изменений, иначе - false
     */
    private settingsHasNoChanges(): boolean {
        return CommonUtils.comparePlainObjects(this.initialTaxSettings.taxPolicySettings, this.taxSettings.taxPolicySettings) &&
            CommonUtils.comparePlainObjects(this.initialTaxSettings.taxOffice, this.taxSettings.taxOffice) &&
            CommonUtils.comparePlainObjects(this.initialTaxSettings.insuranceOffice, this.taxSettings.insuranceOffice);
    }
}
