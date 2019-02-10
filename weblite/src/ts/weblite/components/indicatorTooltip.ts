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

import {Component, Prop, UI} from "platform/ui";
import {Icon} from "platform/ui/icon";
import {Counterparty} from "../service/counterpartiesService";

/**
 * Компонент для отображения тултипа c иконками индикатора.
 */
@Component({
    // language=Vue
    template: `
        <div v-if="counterparty.indicatorInfo" class="indicator-tooltip icon" :class="indicatorIcon">
            <div class="tooltip-text" @click.stop>
                <div>
                    <label class="indicator-critical-facts-color indicator-facts">
                        {{ counterparty.indicatorInfo.criticalFacts }}
                    </label>
                    <span>{{ counterparty.indicatorInfo.criticalFacts |
                        decl("Критичный индикатор деятельности", "Критичных индикатора деятельности", "Критичных индикаторов деятельности")}}</span>
                </div>
                <div>
                    <label class="indicator-pay-attention-facts-color indicator-facts">
                        {{ counterparty.indicatorInfo.payAttentionFacts }}
                    </label>
                    <span>{{counterparty.indicatorInfo.payAttentionFacts |
                        decl("Подозрительный индикатор деятельности", "Подозрительных индикатора деятельности", "Подозрительных индикаторов деятельности")}}
                    </span>
                </div>
                <div>
                    <label class="indicator-activity-facts-color indicator-facts">
                        {{ counterparty.indicatorInfo.activityFacts }}
                    </label>
                    <span>{{counterparty.indicatorInfo.activityFacts |
                        decl("Позитивный индикатор деятельности", "Позитивных индикатора деятельности", "Позитивных индикаторов деятельности")}}</span>
                </div>
                <div>
                    <label class="indicator-achievements-color indicator-facts">
                        {{ counterparty.indicatorInfo.achievements }}
                    </label>
                    <span>{{ counterparty.indicatorInfo.achievements |
                        decl("Достижение", "Достижения", "Достижений") }}</span>
                </div>
                <div class="company-status"
                :title="counterparty.indicatorInfo.status">
                    {{ counterparty.indicatorInfo.status }}
                </div>
                <a class="counterparty-info" :href="showCounterpartyInfo" target="_blank">Подробнее</a>
            </div>
        </div>
    `
})
export class IndicatorTooltip extends UI {

    /** Отображаемый контрагент */
    @Prop({required: true})
    private counterparty: Counterparty;

    /**
     * Возвращает класс иконки индикатора
     */
    private get indicatorIcon(): string {
        return this.counterparty.indicatorInfo.criticalFacts > 0 ? Icon.INDICATOR_CRITICAL :
            this.counterparty.indicatorInfo.payAttentionFacts > 0 ? Icon.INDICATOR_WARN : "";
    }

    /**
     * url сервиса Индикатор для получения детального отчета
     */
    private get showCounterpartyInfo(): string {
        return `/ibank2/protected/indicator/GetIndicatorDetails?inn=${this.counterparty.inn}&locale=ru_RU`;
    }
}