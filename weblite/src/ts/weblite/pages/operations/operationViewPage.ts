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
import {PrintService} from "platform/services/printService";
import {Component, UI} from "platform/ui";
import {EmailInput} from "../../components/emailInput";
import {MessageComponent} from "../../components/message/messageComponent";
import {OperationPrintHelper} from "../../components/print/operationPrintHelper";
import {TemplatePage} from "../../components/templatePage";
import {AccountOperation, AccountOperationService} from "../../service/accountOperationService";
import {EmailService} from "../../service/emailService";

/**
 * Страница просмотра информации об операции
 */
@Component({
    // language=Vue
    template: `
        <template-page>
            <template slot="main">
                <div class="app-content__inner" v-if="operation">
                    <div class="form-row page-header">
                        <div class="title">
                            <span>Информация об операции по счету</span>
                            <span class="docStatus" :class="!!operation.operCredit ? 'credit' : 'debit'">
                                {{ !!operation.operCredit ? 'Кредит' : 'Дебет' }}
                            </span>
                        </div>
                        <div class="btn-group">
                            <div class="btn icon icon-print" title="Распечатать" @click="onPrint"></div>
                        </div>
                    </div>

                    <div class="form-row">
                        <x-textfield :readonly="true" :value="operation.operDate" title="Дата операции" class="small"></x-textfield>
                        <x-textfield :readonly="true" :value="operation.account" title="Счет клиента" class="full"></x-textfield>
                    </div>

                    <div class="form-row">
                        <x-textfield :readonly="true" :value="operation.numDoc" title="Номер документа" class="small"></x-textfield>
                        <x-textfield :readonly="true" :value="operation.dateDoc" title="Дата документа" class="small"></x-textfield>
                        <x-textfield :readonly="true" :value="operation.paymentType" title="Вид платежа" class="small"></x-textfield>
                    </div>
                    <div class="form-row">
                        <x-textfield :readonly="true" :value="operation.reference" title="Референс операции" class="full"></x-textfield>
                    </div>
                    <div class="separate-line"></div>

                    <!-- Информация о корреспонденте -->
                    <div class="form-row">
                        <x-textfield :readonly="true" :value="operation.corrInn" title="ИНН корреспондента" class="small"></x-textfield>
                        <x-textfield :readonly="true" :value="operation.corrKpp" title="КПП корреспондента" class="small"></x-textfield>
                    </div>
                    <div class="form-row">
                        <x-textfield :readonly="true" :value="operation.corrAcc" title="Номер счета корреспондента" class="medium"></x-textfield>
                        <x-textfield :readonly="true" :value="operation.operCredit || operation.operDebet | amount" title="Сумма, ₽" class="full"></x-textfield>
                    </div>
                    <div class="form-row">
                        <x-textfield :readonly="true" :value="operation.corrName" title="Наименование корреспондента" class="full"></x-textfield>
                    </div>
                    <div class="form-row">
                        <x-textfield :readonly="true" :value="operation.corrBankBic" title="БИК банка получателя" class="small"></x-textfield>
                        <x-textfield :readonly="true" :value="operation.corrBankAcc" title="Счет банка корреспондента" class="full"></x-textfield>
                    </div>
                    <div class="form-row">
                        <x-textfield :readonly="true" :value="operation.corrBankName" title="Наименование банка корреспондента" class="full"></x-textfield>
                    </div>
                    <div class="separate-line"></div>


                    <div class="form-row">
                        <x-textfield :readonly="true" :value="operation.code" title="Код" class="w470"></x-textfield>
                    </div>
                    <div class="form-row">
                        <x-textfield :readonly="true" :value="operation.reserveField" title="Рез. поле" class="w470"></x-textfield>
                    </div>
                    <div class="form-row">
                        <x-textfield :readonly="true" :value="operation.queue" title="Очер.пл." class="w140"></x-textfield>
                        <x-textfield :readonly="true" :value="operation.chargeFields.chargeType" title="Код выплат" class="w140"></x-textfield>
                    </div>
                    <div class="form-row">
                        <x-textarea :readonly="true" :rows="3" :value="operation.paymentNote" title="Основание" class="full"></x-textarea>
                    </div>
                    <div class="separate-line"></div>
                    <div class="form-row">
                        <x-textarea :readonly="true" :rows="3" :value="operation.conditionPay" title="Условие оплаты" class="full"></x-textarea>
                    </div>

                    <!-- Блок частичной оплаты -->
                    <template v-if="isPartialPayment()">
                        <div class="form-row">
                            <x-textfield :readonly="true" :value="operation.partialPayNumber" title="Номер частичн. платежа" class="small"></x-textfield>
                            <x-textfield :readonly="true" :value="operation.remainderAmount | amount"
                                         title="Неоплаченный остаток, ₽" class="small"></x-textfield>
                        </div>
                        <div class="form-row">
                            <x-textfield :readonly="true" :value="operation.payDocCipher" title="Шифр плат. док." class="small"></x-textfield>
                            <x-textfield :readonly="true" :value="operation.payDocNumber" title="N плат. док." class="small"></x-textfield>
                            <x-textfield :readonly="true" :value="operation.payDocDate" title="Дата плат. док." class="small"></x-textfield>
                        </div>
                        <div class="separate-line"></div>
                    </template>

                    <!-- Блок бюджетных полей -->
                    <div class="form-row">
                        <x-textfield :readonly="true" :value="operation.chargeFields.chargeCreator" title="Статус составителя" class="small"></x-textfield>
                    </div>
                    <div class="form-row">
                        <x-textfield :readonly="true" :value="operation.chargeFields.chargeKbk" title="КБК" class="medium"></x-textfield>
                        <x-textfield :readonly="true" :value="operation.chargeFields.chargeOkato" title="ОКТМО" class="full"></x-textfield>
                    </div>
                    <div class="form-row">
                        <x-textfield :readonly="true" :value="operation.chargeFields.chargeBasis" title="Основание платежа" class="full"></x-textfield>
                        <x-textfield :readonly="true" :value="operation.chargeFields.chargePeriod" title="Налоговый период" class="full"></x-textfield>
                        <x-textfield :readonly="true" :value="operation.chargeFields.chargeNumDoc" title="N док." class="full"></x-textfield>
                        <x-textfield :readonly="true" :value="operation.chargeFields.chargeDateDoc" title="Дата док." class="full"></x-textfield>
                    </div>
                    <div class="app-content-inner__footer payment-footer">
                        <div>
                            <email-input :handler="onSendMail"></email-input>
                        </div>
                        <a class="btn " @click="goToEvents">Назад</a>
                    </div>
                </div>

                <spinner v-else></spinner>
            </template>
            <template slot="sidebar-top">

            </template>
        </template-page>
    `,
    components: {TemplatePage, EmailInput}
})
export class OperationViewPage extends UI {

    /** Сервис по работе с email */
    @Inject
    private emailService: EmailService;

    /** Сервис по работе с печатью */
    @Inject
    private printService: PrintService;

    /** Сервис загрузки операций */
    @Inject
    private accountOperationService: AccountOperationService;

    /** Модель данных операции */
    private operation: AccountOperation = null;

    /**
     * Загружает операцию на просмотр
     * @inheritDoc
     * @return {Promise<void>}
     */
    @CatchErrors
    async created(): Promise<void> {
        this.operation = await this.accountOperationService.getOperation(this.$route.params.accountId, this.$route.params.operationUid);
    }

    /**
     * Печать операции
     * @return {Promise<void>}
     */
    @CatchErrors
    private async onPrint(): Promise<void> {
        await this.printService.print(new OperationPrintHelper({
            operations: [{
                hash: this.operation.operHash,
                code: this.operation.operCode
            }],
            accountId: this.$route.params.accountId,
            external: false
        }));
    }

    /**
     * Обрабатывает запрос на отправку документа операции по email
     * @param {string} email адрес получателя email
     */
    private async onSendMail(email: string): Promise<void> {
        await this.emailService.sendOperationDocumentToEmail({
            accountId: this.$route.params.accountId,
            externalAccount: false,
            operationsHashes: [this.operation.operHash],
            emails: [email]
        });
        MessageComponent.showToast("Письмо с документом успешно отправлено");
    }

    /**
     * Осуществляет переход к списку событий
     */
    private goToEvents(): void {
        this.$router.push({name: "events"});
    }

    private isPartialPayment(): boolean {
        return this.operation.operCode && this.operation.operCode === "16";
    }
}