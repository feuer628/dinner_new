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
import {DocumentContent, DocumentMeta, DocumentType} from "model/document";
import {GlobalEvent} from "model/globalEvent";
import {Status} from "model/status";
import {CatchErrors} from "platform/decorators";
import {Inject} from "platform/ioc";
import {FormatterOptions} from "platform/types";
import {Component, Prop, UI} from "platform/ui";
import {CustomDialog} from "platform/ui/dialogs/customDialog";
import {FormatterFactory} from "platform/ui/formatters/formatterFactory";
import {ClientService, ClientTokenInfo} from "service/clientService";
import {DocumentService} from "service/documentService";
import {ValidationResult} from "../../../model/validationResult";

/**
 * Компонент для подсветки части текста
 */
@Component({
    // language=Vue
    template: `
        <span>
            <template v-if="!!leftPart">{{leftPart}}</template><!--
            --><span style="color: #16AB07; font-weight: bold;">{{highlightedPart}}</span><!--
            --><template v-if="!!rightPart">{{rightPart}}</template>
        </span>
    `
})
class Highlight extends UI {

    /** Текст в компоненте */
    @Prop({required: true})
    private value: string;

    /** Функция, возвращающая диапазон подсвечиваемого текста. Если не указана, то текст подсвечивается целиком. */
    @Prop({type: Function})
    private getRange: (value: string) => [number, number];

    /**
     * Возвращает неподсвеченную левую часть текста
     * @return {string} неподсвеченная левая часть текста
     */
    private get leftPart(): string {
        if (!this.value || !this.getRange) {
            return null;
        }
        const [begin, end] = this.getRange(this.value);
        return this.value.slice(0, begin);
    }

    /**
     * Возвращает подсвеченную часть текста
     * @return {string} подсвеченная часть текста
     */
    private get highlightedPart(): string {
        if (!this.value || !this.getRange) {
            return this.value;
        }
        const [begin, end] = this.getRange(this.value);
        return this.value.slice(begin, end);
    }

    /**
     * Возвращает неподсвеченную правую часть текста
     * @return {string} неподсвеченная правая часть текста
     */
    private get rightPart(): string {
        if (!this.value || !this.getRange) {
            return null;
        }
        const [begin, end] = this.getRange(this.value);
        return this.value.slice(end);
    }
}

/**
 * Диалог подтверждения платежа при помощи MAC-токена
 */
@Component({
    // TODO: верстка
    // TODO: текст по ссылке "Подробная инструкция" не виден на темном фоне
    // language=Vue
    template: `
        <dialog-form title="Подтверждение платежа" :width="750" :closable="false">
            <div slot="content">
                <template v-if="loaded">
                    <div class="form-row">
                        <p class="full"><b>Внимание!</b> Вводимые в MAC-токен реквизиты должны совпадать с реальными реквизитами получателя.</p>
                    </div>
                    <div class="form-row">
                        <p class="full">
                            Включите MAC-токен S/N <b>{{data.token.serial}}</b>. Введите PIN-код.
                            Нажмите кнопку
                            <highlight :value="confirmationMode"></highlight>
                            .
                        </p>
                    </div>
                    <div class="form-row">
                        <p class="full">Подтверждайте каждый шаг кнопкой <img :src="POWER_BUTTON_ICON"/>:</p>
                    </div>
                    <template v-if="enhancedConfirmationMode">
                        <div class="form-row">
                            <p class="full">Шаг 1. Введите БИК банка получателя <highlight :value="bic"></highlight></p>
                        </div>
                        <div class="form-row">
                            <p class="full">
                                Шаг 2. Введите первые 10 цифр номера счета получателя
                                <highlight :value="account" :getRange="getFirst10DigitsRange"></highlight>
                            </p>
                        </div>
                        <div class="form-row">
                            <p class="full">
                                Шаг 3. Введите последние 10 цифр номера счета получателя
                                <highlight :value="account" :getRange="getLast10DigitsRange"></highlight>
                            </p>
                        </div>
                        <div class="form-row">
                            <p class="full">
                                Шаг 4. Введите сумму платежного поручения без копеек
                                <highlight :value="amount" :getRange="getIntegerPartRange"></highlight>
                            </p>
                        </div>
                    </template>
                    <template v-else>
                        <div class="form-row">
                            <p class="full">Шаг 1. Введите ID сессии <highlight :value="sessionId"></highlight></p>
                        </div>
                        <div class="form-row">
                            <p class="full">
                                Шаг 2. Введите сумму платежного поручения без копеек
                                <highlight :value="amount" :getRange="getIntegerPartRange"></highlight>
                            </p>
                        </div>
                        <div class="form-row">
                            <p class="full">
                                Шаг 3. Введите параметр 1 - последние 6 цифр счета получателя
                                <highlight :value="account" :getRange="getLast6DigitsRange"></highlight>
                            </p>
                        </div>
                        <div class="form-row">
                            <p class="full">Шаг 4. Параметр 2 не используется, нажмите <img :src="POWER_BUTTON_ICON"/></p>
                        </div>
                    </template>
                    <div class="form-row">
                        Введите код подтверждения с экрана MAC-токена:
                    </div>
                    <div class="form-row">
                        <x-textfield title="Код подтверждения" v-model="password" :format="passwordFormat" name="PASSWORD"
                                     v-focus="true" :validation-result="validationResult" class="small" @keyup.enter="confirm"></x-textfield>
                    </div>
                    <div class="form-row">
                        <a :href="helpLink" target="_blank" class="link">Подробная инструкция</a>
                    </div>
                </template>
                <spinner v-else></spinner>
            </div>
            <template slot="footer">
                <button class="btn btn-primary" :disabled="!password" @click="confirm">Подтвердить</button>
                <button class="btn" @click="close">Отмена</button>
            </template>
        </dialog-form>
    `,
    components: {Highlight}
})
export class MacConfirmationDialog extends CustomDialog<MacConfirmationDialogParams, Status | null> {

    /** Сервис по работе с пользователем */
    @Inject
    private clientService: ClientService;

    /** Сервис по работе с документами */
    @Inject
    private documentService: DocumentService;

    /** Адрес иконки с изображением кнопки включения MAC-токена */
    private readonly POWER_BUTTON_ICON = "img/icons/mac_token_power_button.png";

    /** Флаг загружена ли информация, необходимая для работы диалога */
    private loaded = false;

    /** Режим подтверждения документа */
    private confirmationMode: ConfirmationMode = null;

    /** Метаинформация документа */
    private meta: DocumentMeta = null;

    /** Идентификатор сессии */
    private sessionId: number = null;

    /** Значение поля с одноразовым паролем */
    private password: string = null;

    /** Формат поля с одноразовым паролем  */
    private passwordFormat: FormatterOptions = {type: "text", rule: "10;!0123456789"};

    /** Сообщение об ошибке, отображаемое в поле с одноразовым паролем */
    private passwordErrorMessage: string = null;

    /**
     * Монтирует диалог
     * @inheritDoc
     * @return {Promise<void>}
     */
    async mounted(): Promise<void> {
        try {
            if (this.data.token.confirmType !== ConfirmType.MAC) {
                throw Error("Для работы диалога требуется MAC-токен");
            }
            this.meta = await this.documentService.getMeta(DocumentType.PAYMENT);
            const clientInfo = this.clientService.getClientInfo();
            this.confirmationMode = clientInfo.clientProperties["SECURITY.TOKENS.MAC.CONFIRMATION_MODE"] === ConfirmationMode.STANDARD ?
                ConfirmationMode.STANDARD :
                ConfirmationMode.ENHANCED;
            if (this.confirmationMode === ConfirmationMode.STANDARD) {
                this.sessionId = await this.documentService.getConfirmSessionId();
            }
            this.loaded = true;
        } catch (error) {
            // Закрываем диалог при возникновении ошибки
            this.$nextTick(() => {
                this.close();
            });
            UI.emit(GlobalEvent.HANDLE_ERROR, error);
        }
    }

    /**
     * Подтверждает платежа после ввода одноразового пароля
     */
    @CatchErrors
    private async confirm(): Promise<void> {
        if (!this.password) {
            return;
        }
        try {
            const confirmResponse = await this.documentService.confirm(DocumentType.PAYMENT, this.data.docId, {
                confirmType: ConfirmType.MAC,
                sessionId: this.sessionId,
                tokenHash: this.data.token.hash,
                otp: this.password
            });
            this.close(confirmResponse.status);
        } catch (e) {
            if (e.code === "INCORRECT_OTP") {
                this.passwordErrorMessage = "Неверный код подтверждения";
                throw new Error(this.passwordErrorMessage);
            } else {
                this.passwordErrorMessage = null;
                throw e;
            }
        }
    }

    /**
     * Возвращает диапазон, в который входят первые 10 цифр строки
     * @param {string} value строка
     * @return {[number , number]} диапазон, в который входят первые 10 цифр строки
     */
    private getFirst10DigitsRange(value: string): [number, number] {
        let digitCount = 0;
        for (let i = 0; i < value.length; i++) {
            if ("1234567890".includes(value.charAt(i))) {
                digitCount++;
            }
            if (digitCount === 10) {
                return [0, i + 1];
            }
        }
        return [0, value.length];
    }

    /**
     * Возвращает диапазон, в который входят последние 10 цифр строки
     * @param {string} value строка
     * @return {[number , number]} диапазон, в который входят последние 10 цифр строки
     */
    private getLast10DigitsRange(value: string): [number, number] {
        return this.getLastNDigitsRange(value, 10);
    }

    /**
     * Возвращает диапазон, в который входят последние 6 цифр строки
     * @param {string} value строка
     * @return {[number , number]} диапазон, в который входят последние 6 цифр строки
     */
    private getLast6DigitsRange(value: string): [number, number] {
        return this.getLastNDigitsRange(value, 6);
    }

    /**
     * Возвращает диапазон, в который входят последние N цифр строки
     * @param {string} value строка
     * @param {number} n количество цифр, которое должно входить в диапазон
     * @return {[number , number]} диапазон, в который входят последние N цифр строки
     */
    private getLastNDigitsRange(value: string, n: number): [number, number] {
        let digitCount = 0;
        for (let i = value.length - 1; i >= 0; i--) {
            if ("1234567890".includes(value.charAt(i))) {
                digitCount++;
            }
            if (digitCount === n) {
                return [i, value.length];
            }
        }
        return [0, value.length];
    }

    /**
     * Возвращает диапазон, в который входит целая часть числа, представленного в виде строки
     * @param {string} value число, представленное в виде строки
     * @return {[number , number]} диапазон, в который входит целая часть числа
     */
    private getIntegerPartRange(value: string): [number, number] {
        return [0, value.indexOf(".")];
    }

    /**
     * Возвращает является ли текущий режим подтверждения усиленным
     * @return {boolean} является ли текущий режим подтверждения усиленным
     */
    private get enhancedConfirmationMode(): boolean {
        return this.confirmationMode === ConfirmationMode.ENHANCED;
    }

    /**
     * Возвращает подсвеченный БИК банка получателя
     * @return {string} подсвеченный БИК банка получателя
     */
    private get bic(): string {
        return this.data.content.RCPT_BANK_BIC as string;
    }

    /**
     * Возвращает отформатированный счет получателя
     * @return {string} отформатированный счет получателя
     */
    private get account(): string {
        let account = this.data.content.RCPT_ACCOUNT as string || "00000000000000000000";
        // Форматируем счет, добавляя в него неразрывные пробелы
        const positions = [5, 8, 10, 14, 17];
        for (let i = positions.length - 1; i >= 0; i--) {
            const position = positions[i];
            account = account.slice(0, position) + "\xa0" + account.slice(position);
        }
        return account;
    }

    /**
     * Возвращает отформатированную сумму платежа, в которой подсвечена целая часть
     * @return {string} отформатированная сумму платежа, в которой подсвечена целая часть
     */
    private get amount(): string {
        const fieldInfo = this.meta.fieldsMap.AMOUNT;
        const formatter = FormatterFactory.getNumberFormat(fieldInfo.rule);
        return formatter.formatAmount(this.data.content.AMOUNT as string);
    }

    /**
     * Возвращает результат валидации для поля с одноразовым паролем
     * @return {ValidationResult} результат валидации для поля с одноразовым паролем
     */
    private get validationResult(): ValidationResult {
        this.$errors.add({field: "PASSWORD", msg: this.passwordErrorMessage});
        return new ValidationResult("PASSWORD", this.$errors);
    }

    /**
     * Возвращает ссылку с подробной инструкцией
     * @return {string} ссылка с подробной инструкцией
     */
    private get helpLink(): string {
        switch (this.confirmationMode) {
            case ConfirmationMode.ENHANCED:
                return "img/help/help_print_mac_token_mode_2_ru_RU.png";
            case ConfirmationMode.STANDARD:
                return "img/help/help_print_mac_token_mode_3_ru_RU.png";
        }
    }
}

/**
 * Параметры для диалога подтверждения документа при помощи MAC-токена
 */
export type MacConfirmationDialogParams = {

    /** Идентификатор подтверждаемого документа */
    docId: string;

    /** Информация об MAC-токене */
    token: ClientTokenInfo;

    /** Контент подтверждаемого документа */
    content: DocumentContent;
};

/**
 * Режим подтверждения платежа
 */
enum ConfirmationMode {

    /** Усиленный режим подтверждения */
    ENHANCED = "2",

    /** Стандартный режим подтверждения */
    STANDARD = "3"
}