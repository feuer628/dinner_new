import {CatchErrors} from "platform/decorators";
import {Inject} from "platform/ioc";
import {Cache, CacheKey} from "platform/services/cache";
import {Http} from "platform/services/http";
import {Component, Prop, UI, Watch} from "platform/ui";
import {ClientService} from "../service/clientService";

/** Базовый url сервиса Индикатор */
const INDICATOR_SERVICE_URL = "/ibank2/protected/services/indicator";

/** Ошибка недоступности сервиса "Индикатор" */
const UNAVAILABLE_INDICATOR_ERROR = "Сервис \"Индикатор\" временно недоступен";

/**
 * Компонент для работы с сервисом Индикатор.
 * При корректно введенном ИНН, осуществляет поиск и в случае нахождения контрагента,
 * инициирует событие "found" с найденным контрагентом
 */
@Component({
    // language=Vue
    template: `
        <div v-if="hasLicense && showed" class="form-row indicator">
            <template v-if="contractor">
                <div class="indicator-panel">
                    <label class="indicator-facts indicator-critical-facts-color">{{ contractor.criticalFacts }}</label>
                    <label class="indicator-facts indicator-pay-attention-facts-color">{{ contractor.payAttentionFacts }}</label>
                    <label class="indicator-facts indicator-activity-facts-color">{{ contractor.activityFacts }}</label>
                    <label class="indicator-facts indicator-achievements-color">{{ contractor.achievements }}</label>
                </div>
                <div class="full">
                    <label class="indicator-label">{{ contractor.status }}</label>
                    <a :href="reportUrl" target="_blank">Подробнее</a>
                </div>
            </template>

            <template v-else>
                <label v-if="errorMessage">{{ errorMessage }}</label>
                <label v-else>Идет проверка контрагента...</label>
            </template>
        </div>
    `
})
export class IndicatorServiceComponent extends UI {

    @Inject
    private http: Http;

    @Inject
    private cache: Cache;

    @Inject
    private clientService: ClientService;

    /** ИНН получателя */
    @Prop({required: true, type: String})
    private inn: string;

    /** Признак необходимости отправки запроса при инициализации компонента */
    @Prop({required: false, default: true, type: Boolean})
    private immediateCheck: boolean;

    /** Признак отображения формы */
    private showed = false;

    /** Признак наличия лицензии */
    private hasLicense = false;

    /** Информация о контрагенте */
    private contractor: ContractorInfo = null;

    /** Текст ошибки от сервера */
    private errorMessage: string = null;

    /**
     * Проверяет лицензию, обновляет состояние компонента и при правильной длине ИНН (10 или 12 символов) выполняет запрос на проверку контрагента
     * @return {Promise<void>}
     */
    async check(): Promise<void> {
        if (!this.hasLicense) {
            return;
        }
        if (this.inn && [10, 12].indexOf(this.inn.length) !== -1) {
            this.clear();
            this.showed = true;
            try {
                await this.checkContractor();
            } catch (error) {
                this.showed = false;
            }
        } else {
            this.showed = false;
        }
    }

    /**
     * Проверяет лицензию на услугу Индикатор при создании компонента и
     * осуществляет проверку ИНН (применимо при копировании документа)
     * @inheritDoc
     */
    @CatchErrors
    async created(): Promise<void> {
        this.hasLicense = await this.clientService.hasIndicatorLicense();
        if (this.immediateCheck) {
            await this.onInnChange();
        }
    }

    /**
     * url сервиса Индикатор для получения детального отчета
     * TODO доработать API и страницу Индикатора для использования API
     * @return {string}
     */
    private get reportUrl(): string {
        return `/ibank2/protected/indicator/GetIndicatorDetails?inn=${this.inn}&locale=ru_RU`;
    }

    /**
     * Следит за изменением ИНН получателя и при правильной длине (10 или 12 символов)
     * отправляет запрос в Индикатор
     */
    @Watch("inn")
    private async onInnChange(): Promise<void> {
        return this.check();
    }

    /**
     * Отправляет запрос на проверку контрагента по ИНН
     * @return {Promise<void>}
     */
    private async checkContractor(): Promise<void> {
        const contractorFromCache = this.getContractorFromCache(this.inn);
        if (contractorFromCache) {
            this.contractor = contractorFromCache;
            this.doAfterContractorFound();
            return;
        }
        const response = await this.http.get<ContractorInfoResponse>(`${INDICATOR_SERVICE_URL}/${this.inn}/check`);
        const result: ContractorInfo = {
            ...response,
            activityFacts: +response.activityFacts || 0,
            payAttentionFacts: +response.payAttentionFacts || 0,
            achievements: +response.achievements || 0,
            criticalFacts: +response.criticalFacts || 0
        };
        // при неработающем сервисе Индикатор вернется пустой объект с errorCode = "globalError"
        if (result.errorCode === "globalError") {
            this.errorMessage = UNAVAILABLE_INDICATOR_ERROR;
            this.showed = true;
            this.$emit("found", null);
            return;
        }
        if (result.errorMessage) {
            this.errorMessage = result.errorMessage;
            this.showed = !!this.errorMessage;
            this.$emit("found", null);
        } else {
            this.contractor = result;
            this.doAfterContractorFound();
        }
    }

    /**
     * Очищает текущий результат поиска
     */
    private clear(): void {
        this.contractor = null;
        this.errorMessage = null;
    }

    /**
     * Выполняет действия после успешного нахождения контрагента.
     */
    private doAfterContractorFound(): void {
        this.errorMessage = null;
        this.addContractorsToCache(this.contractor);
        this.$emit("found", this.contractor);
    }

    /**
     * Возвращает данные по контрагенту из кеша
     * @param inn ИНН контрагента
     * @return данные по контрагенту
     */
    private getContractorFromCache(inn: string): ContractorInfo {
        const contractorsCache: { [key: string]: ContractorInfo } = this.cache.get(CacheKey.INDICATOR_CONTRACTORS_CACHE_KEY);
        return contractorsCache ? contractorsCache[inn] : null;
    }

    /**
     * TODO сделать LRU-кэш
     * Добавляет данные по контрагенту в кеш
     * @param contractor данные по контрагенту
     */
    private addContractorsToCache(contractor: ContractorInfo): void {
        const contractorsCache: { [key: string]: ContractorInfo } = this.cache.get(CacheKey.INDICATOR_CONTRACTORS_CACHE_KEY) || {};
        contractorsCache[contractor.inn] = contractor;
        this.cache.put(CacheKey.INDICATOR_CONTRACTORS_CACHE_KEY, contractorsCache);
    }
}

/**
 * Информация о контрагенте
 */
export type ContractorInfo = ContractorInfoBase & {
    /** Число фактов, относящихся к "зеленой категории" */
    activityFacts: number,
    /** Число фактов, относящихся к "желтой категории" */
    payAttentionFacts: number,
    /** Число фактов, относящихся к "супер позитивной категории" */
    achievements: number,
    /** Число фактов, относящихся к "красной категории" */
    criticalFacts: number
};

/**
 * Информация о контрагенте, общие поля
 */
export type ContractorInfoBase = {
    /** Код ошибки */
    errorCode: string,
    /** Сообщение об ошибке */
    errorMessage: string,
    /** Название контрагента */
    name: string,
    /** Краткое наименование контрагента */
    shortName: string,
    /** Наименование контрагента для платежных документов */
    paymentName?: string,
    /** ИНН контрагента */
    inn: string,
    /** Статус контрагента */
    status: string,
    /** КПП контрагента */
    kpp: string,
    /** ОГРН */
    ogrn?: string,
    /** Адрес */
    address?: string,
    /** Управляющий */
    leader?: string,
    /** Учредители */
    founders?: string[],
    /** Названия полей, в которых было найдено вхождение поисковой строки при поиске */
    matchedFields?: string[],
    /** У контрагента есть филиалы? */
    hasFilials?: boolean,
    /** Контрагент помечен? */
    marked?: boolean,
    /** Контрагент является банком? */
    isBank?: boolean;
};

/**
 * Информация о контрагенте. Транспортный объект
 */
export type ContractorInfoResponse = ContractorInfoBase & {
    /** Число фактов, относящихся к "зеленой категории" */
    activityFacts: string,
    /** Число фактов, относящихся к "желтой категории" */
    payAttentionFacts: string,
    /** Число фактов, относящихся к "супер позитивной категории" */
    achievements: string,
    /** Число фактов, относящихся к "красной категории" */
    criticalFacts: string
};