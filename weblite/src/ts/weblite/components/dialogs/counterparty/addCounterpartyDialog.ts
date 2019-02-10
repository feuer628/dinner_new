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
import {Component} from "platform/ui";
import {CustomDialog} from "platform/ui/dialogs/customDialog";
import {XTextField} from "platform/ui/xTextField";
import {CommonUtils} from "platform/utils/commonUtils";
import {CounterpartiesService} from "../../../service/counterpartiesService";
import {ContractorInfo} from "../../indicatorServiceComponent";
import {SaveCounterpartyConfirmDialog} from "./saveCounterpartyConfirmDialog";

/**
 * Диалог добавления контрагента
 */
@Component({
    // TODO вестка. + Цвет border для диалогов нужно выставить в #c5c5c5, т.к. текущий сливается с тенью и выглядит отвратно;
    // language=Vue
    template: `
        <dialog-form title="Добавление нового контрагента" :width="750" :close="close">
            <template slot="content">
                <div class="form-row">
                    <!-- ИНН контрагента -->
                    <x-textfield ref="innInput" v-model="inn" :format="{type: 'text', rule: '12;!0123456789'}" title="ИНН"
                                 class="small" @keyup.enter="saveCounterparty"></x-textfield>

                    <!-- Наименование контрагента -->
                    <x-textfield v-model="name" :format="{type: 'text', rule: '160'}" title="Наименование"
                                 class="full" @keyup.enter="saveCounterparty"></x-textfield>
                </div>
                <!-- Блок Индикатор -->
                <indicator :inn="inn" @found="onIndicatorEvent"></indicator>

                <div class="form-row">
                    <!-- Комментарий -->
                    <x-textfield v-model="comment" :format="{type: 'text', rule: '255'}" title="Комментарий" class="full"
                                 @keyup.enter="saveCounterparty"></x-textfield>
                </div>
            </template>

            <template slot="footer">
                <div class="dialog-footer__btns">
                    <button class="btn btn-primary" @click.stop="saveCounterparty">Добавить</button>
                    <button class="btn" @click="close">Отмена</button>
                </div>
            </template>
        </dialog-form>
    `
})
export class AddCounterpartyDialog extends CustomDialog<undefined, string> {

    $refs: {
        innInput: XTextField
    };

    /** Сервис для работы с контрагентами */
    @Inject
    private counterpartiesService: CounterpartiesService;
    /** ИНН контрагента */
    private inn = "";
    /** Наименование контрагента */
    private name = "";
    /** Комментарий */
    private comment = "";

    /**
     * @inheritDoc
     */
    mounted(): void {
        this.$refs.innInput.setFocus();
    }

    /**
     * Заполняет наименование контрагента на основании информации из Индикатора
     * @param {ContractorInfo} contractor информация о контрагенте из Индикатора
     */
    private onIndicatorEvent(contractor: ContractorInfo): void {
        if (contractor) {
            this.name = contractor.paymentName;
        }
    }

    /**
     * Сохраняет нового контрагента
     */
    @CatchErrors
    private async saveCounterparty(): Promise<void> {
        const isValid = await this.validate();
        if (!isValid) {
            return;
        }
        const id = await this.counterpartiesService.createCounterparty({
            inn: CommonUtils.isBlank(this.inn) ? null : this.inn,
            name: this.name,
            comment: this.comment
        });
        this.close(id);
    }

    /**
     * Валидирует поля диалога
     */
    private async validate(): Promise<boolean> {
        // проверка длины ИНН если заполнено
        if (this.inn.length && [10, 12].indexOf(this.inn.length) === -1) {
            throw new Error("Неверная длина ИНН");
        }
        if (CommonUtils.isBlank(this.name)) {
            throw new Error("Наименование контрагента обязательно для заполнения");
        }
        // проверка что получатель с указанным ИНН и названием не существует
        const filtered = (await this.counterpartiesService.getCounterparties())
            .filter(counterparty => !CommonUtils.isBlank(this.inn) && counterparty.inn === this.inn && counterparty.name === name);
        if (filtered.length !== 0) {
            throw new Error("Контрагент с указанными реквизитами уже добавлен");
        }
        return true;
    }
}