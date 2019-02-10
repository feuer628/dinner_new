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
import {CommonUtils} from "platform/utils/commonUtils";
import {RemoveConfirmDialog} from "../../components/dialogs/removeConfirmDialog";
import {TemplatePage} from "../../components/templatePage";
import {BtnReturn} from "../../model/btnReturn";
import {CounterpartiesService, Counterparty} from "../../service/counterpartiesService";
import {CounterpartyInfoTab} from "./counterpartyInfoTab";
import {CounterpartySettlementTab} from "./counterpartySettlementTab";

@Component({
    // language=Vue
    template: `
        <template-page>
            <template slot="sidebar-top">
                <div class="app-sidebar__links">
                    <router-link :to="{name: 'counterpartyView', params: {tab: 'info', id: $route.params.id}}">
                        <span class="icon icon-counterparty-info"></span>
                        Информация
                    </router-link>
                    <router-link :to="{name: 'counterpartyView', params: {tab: 'settlement', id: $route.params.id}}">
                        <span class="icon icon-counterparty-settlements"></span>
                        Взаиморасчеты
                    </router-link>
                </div>
            </template>

            <template slot="main">
                <div v-if="counterparty" class="counterparty">
                    <div class="counterparty__panel">
                        <button class="btn btn-back" @click="goToList"></button>
                        <div>
                            <div class="counterparty__name">
                                <div>
                                    <a class="icon icon-star" :class="{'marked': counterparty.isMarked}" @click="onToggleMarked"></a>
                                    <inplace-input :value="counterparty.name" :max-length="160" @input="onNameChange"></inplace-input>
                                </div>
                                <div class="btn-group">
                                    <div class="btn icon icon-delete" title="Удалить контрагента" @click="onRemove"></div>
                                </div>
                            </div>
                            <div class="counterparty__info">
                                <div v-if="counterparty.inn">ИНН: {{ counterparty.inn }}</div>
                                <indicator v-if="counterparty.inn" :inn="counterparty.inn"></indicator>
                                <div v-if="counterparty.kpp">КПП: {{ counterparty.kpp }}</div>
                                <inplace-input :value="counterparty.comment" @input="onCommentChange" :max-length="255"
                                               :empty-link-text="counterparty.comment ? '' : 'Добавить комментарий'"></inplace-input>
                            </div>
                        </div>
                    </div>
                    <counterparty-info-tab v-if="$route.params.tab === 'info'" :counterparty="counterparty"></counterparty-info-tab>
                    <keep-alive>
                        <counterparty-settlement-tab v-if="$route.params.tab === 'settlement'" :counterparty="counterparty"></counterparty-settlement-tab>
                    </keep-alive>
                </div>
                <spinner v-else></spinner>
            </template>
        </template-page>
    `,
    components: {TemplatePage, CounterpartyInfoTab, CounterpartySettlementTab}
})
export class CounterpartyView extends UI {

    /** Сервис для работы с контрагентами */
    @Inject
    private counterpartiesService: CounterpartiesService;

    /** Контрагент */
    private counterparty: Counterparty = null;

    /**
     * Инициализирует страницу просмотра контрагента
     * @inheritDoc
     * @return {Promise<void>}
     */
    @CatchErrors
    async created(): Promise<void> {
        this.counterparty = await this.counterpartiesService.getCounterparty(this.$route.params.id);
    }

    /**
     * Добавляет/убирает признак "избранного" контрагента
     */
    @CatchErrors
    async onToggleMarked(): Promise<void> {
        await this.counterpartiesService.setCounterpartyMark(this.counterparty.id, !this.counterparty.isMarked);
        this.counterparty.isMarked = !this.counterparty.isMarked;
    }

    /**
     * Обновляет наименование контрагента
     * @param name
     */
    @CatchErrors
    async onNameChange(name: string): Promise<void> {
        if (CommonUtils.isBlank(name)) {
            return;
        }
        await this.counterpartiesService.setCounterpartyName(this.counterparty.id, name);
        this.counterparty.name = name;
    }

    /**
     * Обновляет комментарий к контрагенту
     * @param comment
     */
    @CatchErrors
    async onCommentChange(comment: string): Promise<void> {
        await this.counterpartiesService.setCounterpartyComment(this.counterparty.id, comment);
        this.counterparty.comment = comment;
    }

    /**
     * Удаляет контрагента
     * @param id идентификатор контрагента
     */
    @CatchErrors
    async onRemove(id: string): Promise<void> {
        if (await new RemoveConfirmDialog().show("Удалить контрагента без возможности восстановления?") === BtnReturn.YES) {
            await this.counterpartiesService.removeCounterparty(this.counterparty.id);
            this.goToList();
        }
    }

    /**
     * Осуществляет переход на страницу списка
     */
    private goToList() {
        this.$router.push({name: "counterparties"});
    }
}