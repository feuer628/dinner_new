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

import * as CryptoUtil from "default/CryptoUtil";
import {PluginSession} from "default/PluginHelper";
import {CatchErrors} from "platform/decorators";
import {Component, UI} from "platform/ui";
import {CustomDialog} from "platform/ui/dialogs/customDialog";
import {ConfirmType} from "../../../model/confirmationType";
import {GlobalEvent} from "../../../model/globalEvent";
import {ClientTokenInfo} from "../../../service/clientService";
import {BifitMacTokenHelper} from "../../../utils/bifitMacTokenHelper";

/**
 * Диалог подтверждения действия при помощи MAC-токена BIFIT
 * Возвращает подтвержденные данные либо null если пользователь отменил подтверждение
 */
@Component({
    // language=Vue
    template: `
        <dialog-form title="Подтверждение MAC-токеном BIFIT" :closable="false">
            <div slot="content">
                <spinner v-if="showSpinner"></spinner>
                <template v-else>
                    <div v-if="state === 'CONNECT'">Подключите устройство к компьютеру и нажмите «Обновить»</div>
                    <template v-else-if="state === 'SET_PIN'">
                        <div>Введите PIN-код устройства</div>
                        <x-textfield title="PIN-код" v-model="pinCode" type="password" v-focus="true" class="w100pc form-margT"
                                     @keyup.enter="onSetPin"></x-textfield>
                    </template>
                    <div v-else-if="state === 'CONFIRM'">Подтвердите действие с помощью устройства</div>
                </template>
            </div>
            <template slot="footer">
                <button v-if="!showSpinner && state === 'CONNECT'" class="btn btn-primary" @click="connectToToken()">Обновить</button>
                <button v-if="!showSpinner && state !== 'CONFIRM'" class="btn" @click="close">Отмена</button>
            </template>
        </dialog-form>
    `
})
export class BifitMacConfirmationDialog extends CustomDialog<BifitMacConfirmationDialogParams, string | null> {

    /** Сессия плагина по работе с MAC-токеном BIFIT */
    private bifitMacTokenSession: PluginSession = null;

    /** Значение поля с PIN-кодом от токена */
    private pinCode: string = null;

    /** Отображается ли индикатор загрузки */
    private showSpinner = true;

    /** Текущее состояние диалога */
    private state = BifitMacConfirmationDialogState.CONNECT;

    /**
     * @inheritDoc
     */
    async mounted(): Promise<void> {
        try {
            this.bifitMacTokenSession = await BifitMacTokenHelper.getMacTokenSession();
            await this.connectToToken();
        } catch (error) {
            // Закрываем диалог при возникновении ошибки
            this.$nextTick(() => {
                this.close();
            });
            UI.emit(GlobalEvent.HANDLE_ERROR, error);
        }
    }

    /**
     * @inheritDoc
     */
    destroyed(): void {
        this.bifitMacTokenSession = null;
    }

    /**
     * Выполняет подключение к токену
     */
    @CatchErrors
    private async connectToToken(): Promise<void> {
        this.state = BifitMacConfirmationDialogState.CONNECT;

        this.showSpinner = true;
        try {
            const connectedTokenSerials = await this.bifitMacTokenSession.listKeystores(CryptoUtil.KeystoreTypes.BIFIT_MACTOKEN);
            const connectedToken = this.data.tokens.find(token => {
                return token.confirmType === ConfirmType.BIFIT_MAC && !token.serialIsMasked && connectedTokenSerials.includes(token.serial);
            });
            if (connectedToken) {
                await this.bifitMacTokenSession.setKeystore(connectedToken.serial, CryptoUtil.KeystoreTypes.BIFIT_MACTOKEN, false);
                if (await this.bifitMacTokenSession.isPinSet()) {
                    this.state = BifitMacConfirmationDialogState.CONFIRM;
                } else {
                    this.state = BifitMacConfirmationDialogState.SET_PIN;
                }
            }
        } finally {
            this.showSpinner = false;
        }

        if (this.state === BifitMacConfirmationDialogState.CONFIRM) {
            await this.confirm();
        }
    }

    /**
     * Подтверждает действие при помощи токена
     */
    private async confirm(): Promise<void> {
        try {
            this.close(await this.bifitMacTokenSession.confirmByBifitMactoken(this.data.digest, this.data.displayData));
        } catch (error) {
            if (error.manuallyRejected) {
                this.close();
            } else {
                throw error;
            }
        }
    }

    /**
     * Обрабатывает установку PIN-кода от токена
     */
    @CatchErrors
    private async onSetPin(): Promise<void> {
        if (!this.pinCode) {
            return;
        }
        this.showSpinner = true;
        try {
            await this.bifitMacTokenSession.setPin(this.pinCode);
            this.state = BifitMacConfirmationDialogState.CONFIRM;
            await this.confirm();
        } finally {
            this.showSpinner = false;
        }
    }
}

/**
 * Параметры диалога подтверждения действия при помощи MAC-токена BIFIT
 */
export type BifitMacConfirmationDialogParams = {

    /** Список с информацией о MAC-токенах BIFIT */
    tokens: ClientTokenInfo[];

    /** Данные для подтверждения */
    digest: string;

    /** Данные для отображения на экране токена */
    displayData: string;
};

/**
 * Перечисление состояний диалога подтверждения действия при помощи MAC-токена BIFIT
 */
enum BifitMacConfirmationDialogState {
    /** Подключение к токену */
    CONNECT = "CONNECT",
    /** Ввод PIN-кода от токена */
    SET_PIN = "SET_PIN",
    /** Подтверждение действия */
    CONFIRM = "CONFIRM"
}