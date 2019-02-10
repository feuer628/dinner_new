import {CatchErrors} from "platform/decorators";
import {Inject} from "platform/ioc";
import {PrintService} from "platform/services/printService";
import {Component} from "platform/ui";
import {CustomDialog} from "platform/ui/dialogs/customDialog";
import {Account} from "../../model/account";
import {ClientService} from "../../service/clientService";
import {EmailService} from "../../service/emailService";
import {EmailInput} from "../emailInput";
import {MessageComponent} from "../message/messageComponent";
import {AccountInfoPrintHelper, AccountInfoPrintParams} from "../print/accountInfoPrintHelper";

/**
 * Компонент для отображения диалога с реквизитами счета
 */
@Component({
    // language=Vue
    template: `
        <dialog-form :title="'Реквизиты счета ' + data.account.accountNumber" :width="825" :close="close">
            <template slot="content">
                <div class="account-dialog__content">
                    <div class="account-dialog__account-info">
                        <div class="account-info__title">{{ data.fullOrganizationName }}</div>

                        <div class="account-info__label">ИНН</div>{{data.inn}}
                        <div class="account-info__label">ОГРН ИП</div>{{data.ogrn}} от {{ data.ogrnDate }}
                        <div class="account-info__label">Расчетный счет</div>{{data.account.accountNumber}}
                        <div class="account-info__label">Наименование Банка</div>{{data.bankName}}
                        <div class="account-info__label">БИК</div>{{data.bankBic}}
                        <div class="account-info__label">Корреспондентский счет</div>{{data.corrAccount}}
                    </div>

                    <div class="qrcode-block">
                        <div class="qrcode">
                            <qr-code :text="valueForQr" :size="214"></qr-code>
                        </div>
                        QR-код для реквизитов
                    </div>
                </div>
            </template>

            <template slot="footer">
                <div class="account-dialog__footer">
                    <div>
                        <button type="button" @click="exportInfo" class="btn btn-primary">Скачать</button>
                        <button type="button" @click="printSelected" class="btn margR16">Распечатать</button>
                        <email-input :handler="sendToEmail" :close-input-on-blur="true"></email-input>
                    </div>
                    <button type="button" @click="close" class="btn">Отмена</button>
                </div>
            </template>
        </dialog-form>
    `,
    components: {EmailInput}
})
export class AccountInfoDialog extends CustomDialog<AccountInfo, void> {

    /** Сервис по работе с email */
    @Inject
    private emailService: EmailService;

    /** Сервис по работе с информацией о клиенте */
    @Inject
    private clientService: ClientService;

    /** Сервис по работе с печатью */
    @Inject
    private printService: PrintService;

    /**
     * Осуществляет экспорт в PDF реквизитов счета
     * @return {Promise<void>}
     */
    @CatchErrors
    private exportInfo(): void {
        this.printService.saveAsPdf(new AccountInfoPrintHelper(this.exportParams));
    }

    /**
     * Печатает реквизиты счета
     * @return {Promise<void>}
     */
    @CatchErrors
    private async printSelected(): Promise<void> {
        await this.printService.print(new AccountInfoPrintHelper(this.exportParams));
    }

    /**
     * Возвращает объект с данными для экспорта реквизитов
     * @return {AccountInfoPrintParams}
     */
    private get exportParams(): AccountInfoPrintParams {
        return {branchId: this.data.branchId, accountNumber: this.data.account.accountNumber};
    }

    /**
     * Осуществляет отправку реквизитов счета на email
     * @param email адрес для отправки
     * @return {Promise<void>}
     */
    private async sendToEmail(email: string): Promise<void> {
        const clientInfo = this.clientService.getClientInfo();
        await this.emailService.sendAccountInfoToEmail({
            employeeId: clientInfo.employeeInfo.id,
            recipients: [email],
            contentType: "doc/account_info",
            content: {branchId: this.data.branchId, accountNumber: this.data.account.accountNumber}
        });
        MessageComponent.showToast("Письмо с реквизитами успешно отправлено");
    }

    private get valueForQr(): string {
        return `CLIENTS.INN_CLN ${this.data.inn};CLIENTS.NAME_CLN ${this.data.fullOrganizationName}` +
            `;BANKS.BIK ${this.data.bankBic};ACCOUNTS.ACCOUNT ${this.data.account.accountNumber}` +
            `;BANKS.BANK_NAME ${this.data.bankName};BANKS.BILL_CORR ${this.data.corrAccount}`;
    }
}

/**
 * Информация о счете и банке, необходимая для диалога
 */
export type AccountInfo = {
    /** Счет */
    account: Account;
    /** Наименование банка */
    bankName: string,
    /** БИК банка */
    bankBic: string,
    /** Идентификатор отделения */
    branchId: string,
    /** Корреспондентский счет */
    corrAccount: string,
    /** Наименование ИП */
    fullOrganizationName: string,
    /** ОГРН */
    ogrn: string,
    /** Дата ОГРН */
    ogrnDate: string,
    /** ИНН */
    inn: string
};
