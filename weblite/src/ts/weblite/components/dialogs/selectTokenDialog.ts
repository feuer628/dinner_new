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

import {ConfirmType} from "model/confirmationType";
import {Component} from "platform/ui";
import {CustomDialog} from "platform/ui/dialogs/customDialog";
import {ClientTokenInfo} from "service/clientService";

/**
 * Диалог выбора токена для подтверждения
 */
@Component({
    // language=Vue
    template: `
        <dialog-form title="Подтверждение" :closable="false">
            <div slot="content" data-uitype="panel">
                <div class="form-row">
                    <v-select title="Способ подтверждения" :value="confirmTypeInfo" @input="setConfirmType"
                              :options="availableConfirmTypeList" label="name" class="full"></v-select>
                </div>
                <div class="form-row">
                    <v-select title="Серийный номер" v-model="token" :disabled="tokenSelectDisabled"
                              :options="tokens" label="serial" class="full"></v-select>
                </div>
            </div>
            <template slot="footer">
                <button class="btn btn-primary" @click="onContinueClick">Продолжить</button>
                <button class="btn" @click="close">Отмена</button>
            </template>
        </dialog-form>
    `
})
export class SelectTokenDialog extends CustomDialog<ClientTokenInfo[], ClientTokenInfo | null> {

    /** Перечисление возможных способов подтверждения документа */
    private readonly confirmTypeList: ConfirmTypeInfo[] = [
        {type: ConfirmType.BIFIT_MAC, name: "MAC-токен BIFIT"},
        {type: ConfirmType.MAC, name: "MAC-токен"},
        {type: ConfirmType.SMS, name: "SMS"},
        {type: ConfirmType.OTP, name: "OTP-токен"}
    ];

    /** Выбранный способ подтверждения документа */
    private confirmTypeInfo: ConfirmTypeInfo = null;

    /** Выбранный токен */
    private token: ClientTokenInfo = null;

    /**
     * Монтирует диалог
     * @inheritDoc
     * @return {Promise<void>}
     */
    mounted(): void {
        const defaultToken = this.data.find(value => value.defaultToken);
        const defaultConfirmType = defaultToken && this.availableConfirmTypeList.find(value => value.type === defaultToken.confirmType);
        this.setConfirmType(defaultConfirmType || this.availableConfirmTypeList[0]);
    }

    /**
     * Устанавливает способ подтверждения документа
     * @param {ConfirmTypeInfo} confirmTypeInfo новый способ подтверждения документа
     */
    private setConfirmType(confirmTypeInfo: ConfirmTypeInfo) {
        this.confirmTypeInfo = confirmTypeInfo;
        if (this.tokenSelectDisabled) {
            this.token = null;
        } else {
            this.token = this.tokens.find(value => value.defaultToken) || this.tokens[0];
        }
    }

    /**
     * Обрабатывает нажатие на кнопку "Продолжить"
     */
    private onContinueClick() {
        if (this.tokenSelectDisabled) {
            this.close(this.data.find(value => value.confirmType === this.confirmTypeInfo.type));
        } else {
            this.close(this.token);
        }
    }

    /**
     * Возвращает список способов подтверждения, доступных пользователю
     * @return {ConfirmTypeInfo[]} список способов подтверждения, доступных пользователю
     */
    private get availableConfirmTypeList(): ConfirmTypeInfo[] {
        return this.confirmTypeList.filter(typeInfo => !!this.data.find(token => token.confirmType === typeInfo.type));
    }

    /**
     * Возвращает токены, тип которых соответствует выбранному пользователем способу подтверждения
     * @return {string[]} токены, тип которых соответствует выбранному пользователем способу подтверждения
     */
    private get tokens(): ClientTokenInfo[] {
        if (this.tokenSelectDisabled) {
            return [];
        }
        return this.data.filter(token => token.confirmType === this.confirmTypeInfo.type);
    }

    /**
     * Возвращает выключен ли компонент выбора токена.
     * Пользователь не может выбрать токен если он хочет подтвердить платеж при помощи MAC-токена BIFIT или по SMS.
     * @return {boolean} включен ли компонент выбора токена
     */
    private get tokenSelectDisabled(): boolean {
        return !this.confirmTypeInfo || [ConfirmType.SMS, ConfirmType.BIFIT_MAC].includes(this.confirmTypeInfo.type);
    }
}

/**
 * Информация о способе подтверждения документа
 */
type ConfirmTypeInfo = {

    /** Тип подтверждения документа */
    type: ConfirmType;

    /** Название способа подтверждения документа */
    name: string;
};