import {Component, Prop, UI} from "platform/ui";

const PERIOD_FORMAT = "DD.MM.YYYY";

/**
 * Типы периодов
 */
enum FilterPeriod {
    ALL_TIME = "ALL_TIME",
    WEEK = "WEEK",
    MONTH = "MONTH",
    QUARTER = "QUARTER",
    CUSTOM = "CUSTOM"
}

/**
 * Компонент выбора периода дат. Либо из предустановленного списка периодов, либо выбор периода вручную.
 */
@Component({
    // language=Vue
    template: `
        <div class="filter-component calendar-period w275" :class="{ active: showFilterPeriodSelector }">
            <div @click="onFilterClick" class="filter-input" :class="{ 'withTitle-box': !!title }">
                <span v-if="!!title" class="fieldTitle">{{ title }}</span>
                    {{ period }}
            </div>

            <transition name="fade">
                <div class="filter-dropdown" v-if="showFilterPeriodSelector" v-click-outside="onClickOutside">
                    <!-- Блок выбора периода -->
                    <template v-if="!isCustomPeriodSelected" v-for="p in periods">
                        <div @click="onPeriodChange(p)"
                             :class="[ 'filter-item', {'selected' : p.text === period}]">{{ p.text }}
                        </div>
                    </template>

                    <!-- Блок выбора дат при помощи календаря -->
                    <template v-if="isCustomPeriodSelected">
                        <div class="filter-item backLink">
                            <span @click="isCustomPeriodSelected = false">Назад</span>
                        </div>
                        <v-date-picker mode="range"
                                       v-model="selectedDate"
                                       @input="onDateSelected"
                                       :show-popover="false"
                                       :show-day-popover="false"
                                       :is-inline="true"
                                       :input-props="{ placeholder: 'Выберите период' }"
                                       show-caps is-double-paned></v-date-picker>
                    </template>
                </div>
            </transition>
        </div>
    `
})
export class DatePeriodSelectorComponent extends UI {

    /** Заголовок поля */
    @Prop({default: null})
    title: string;

    /** Признак отображения предустановленных периодов дат */
    @Prop({default: true})
    private showPeriodPresets: boolean;

    /** Дата начала выборки. Может быть пустая. */
    private startDate = moment().subtract(1, "months");

    /** Дата окончания выборки. Может быть пустая. */
    private endDate = moment();

    /** Список доступных периодов */
    private periods: FilterPeriodOption[] = [];

    /** Период отображаемый по умолчанию */
    private period: string = null;

    /** Признак отображения панели с выбором дат */
    private isCustomPeriodSelected = false;

    /** Признак отображения панели с выбором периодов */
    private showFilterPeriodSelector = false;

    /** Объект с датами для компонента выбора дат */
    private selectedDate: any = null;

    /** Предыдущий выбранный период */
    private previousPeriod: string = null;

    /** @inheritDoc */
    created() {
        this.periods = [
            {value: FilterPeriod.CUSTOM, text: "Выбрать период"},
            {value: FilterPeriod.ALL_TIME, text: "За все время"}
        ];
        if (this.showPeriodPresets) {
            this.periods = this.periods.concat([
                {value: FilterPeriod.WEEK, text: "За неделю"},
                {value: FilterPeriod.MONTH, text: "За месяц"},
                {value: FilterPeriod.QUARTER, text: "За квартал"}
            ]);
        }
        this.period = this.periods[1].text;
    }

    /**
     * Сброс фильтра датапикера
     */
    resetDate(): void {
        this.setDates(FilterPeriod.ALL_TIME);
        this.isCustomPeriodSelected = false;
        this.showFilterPeriodSelector = false;
        this.period = this.periods[1].text;
    }

    /**
     * Действия выполняемые при клике на элемент фильтра. Отображаем панель выбора фильтра
     */
    private onFilterClick(): void {
        this.showFilterPeriodSelector = true;
        this.previousPeriod = this.period;
    }

    /**
     * Скрывает панель выбора дат
     */
    private onClickOutside(): void {
        this.period = this.previousPeriod;
        this.isCustomPeriodSelected = false;
        this.showFilterPeriodSelector = false;
    }

    /**
     * Устанавливает значения дат, скрывает панель фильтрации и посылает событие выбора дат
     */
    private onDateSelected(): void {
        // так как скрывается всегда только блок с выбором диапазона, в событии передаем значения из компонента
        this.startDate = moment(this.selectedDate.start);
        this.endDate = moment(this.selectedDate.end);
        this.period = `с ${this.startDate.format(PERIOD_FORMAT)} по ${this.endDate.format(PERIOD_FORMAT)}`;
        this.previousPeriod = this.period;
        this.emitEvent();
        this.showFilterPeriodSelector = false;
    }

    /**
     * Обработчик смены периода. Отображает либо панель с выбором предустановленных периодов, либо календарь для выбора дат
     * @param period выбранный период
     */
    private onPeriodChange(period: any): void {
        this.setDates(period.value);
        if (period.value === FilterPeriod.CUSTOM) {
            this.isCustomPeriodSelected = true;
        } else {
            this.previousPeriod = this.period;
            this.emitEvent();
            this.showFilterPeriodSelector = false;
        }
        this.period = period.text;
    }

    /**
     * Устанавливает даты начала и окончания выборки
     * @param {FilterPeriod} period объект периода
     */
    private setDates(period: FilterPeriod): void {
        this.startDate = this.defineStartDate(period);
        this.endDate = this.defineEndDate(period);
        this.selectedDate = {
            start: this.startDate == null ? null : moment(this.startDate).toDate(),
            end: moment(this.endDate).toDate()
        };
    }

    /**
     * Отправляет событие выбора дат
     */
    private emitEvent(): void {
        this.$emit("change", {
            startDate: this.startDate == null ? "" : this.startDate.format(PERIOD_FORMAT),
            endDate: this.endDate.format(PERIOD_FORMAT)
        });
    }

    private defineStartDate(period: FilterPeriod): moment.Moment {
        switch (period) {
            case FilterPeriod.WEEK:
                return moment().subtract(6, "days");
            case FilterPeriod.MONTH:
                return moment().subtract(1, "months");
            case FilterPeriod.QUARTER:
                return moment().subtract(3, "months");
            case FilterPeriod.ALL_TIME:
                // передаем null, на сервере этот момент уже учтен
                return null;
            case FilterPeriod.CUSTOM:
                return this.startDate;
        }
        return null;
    }

    private defineEndDate(period: FilterPeriod): moment.Moment {
        if (period === FilterPeriod.CUSTOM) {
            return this.endDate;
        } else {
            return moment();
        }
    }
}

/**
 * Объект события при выборе диапазона дат
 */
export type FilterEvent = {

    startDate: string;

    endDate: string;
};

/** Тип опции для селектора периодов дат */
type FilterPeriodOption = {
    value: FilterPeriod, text: string
};
