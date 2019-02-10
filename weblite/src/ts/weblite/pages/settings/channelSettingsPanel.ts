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

import {MaskOptions} from "imask";
import {CatchErrors} from "platform/decorators";
import {Inject} from "platform/ioc";
import {EmailMaskOptions, PhoneMaskOptions} from "platform/masks";
import {Component, Prop, UI, Watch} from "platform/ui";
import {Filters} from "platform/ui/filters";
import {MessageComponent} from "../../components/message/messageComponent";
import {Document, DocumentType} from "../../model/document";
import {Status} from "../../model/status";
import {DateTimeService} from "../../service/dateTimeService";
import {DocumentService} from "../../service/documentService";
import {PermissionsService} from "../../service/permissionsService";
import {SignatureService} from "../../service/signatureService";
import {CommandRequest, TransactionService} from "../../service/transactionService";

/** Все типы документов, связанные с документом "Настройка каналов рассылки уведомлений" */
const CHANNEL_DOC_TYPES = [
    DocumentType.DELIVERY_BALANCE,
    DocumentType.DELIVERY_FUNDS,
    DocumentType.DELIVERY_INCOMING,
    DocumentType.DELIVERY_LOGGED_ON,
    DocumentType.DELIVERY_OPERS,
    DocumentType.DELIVERY_REJECT,
    DocumentType.DELIVERY_STATUS
];

/**
 * Панель настроек уведомлений для канала
 */
@Component({
    // language=Vue
    template: `
        <div class="notification-page">
            <template v-if="channelList !== null">
                <transition-group name="fade-group">
                    <div v-for="channel in channelList" :key="channel.docId" class="notification-channel fade-group-item"
                        :class="{'spinner-throbber': channel.progress}">
                        <div class="notification-header">
                            <x-switch class="notification-switch"
                                      :disabled="channel.progress"
                                      :value="channel.enabled"
                                      @input="onChannelChange(channel, $event)"></x-switch>
                            <span class="notification-title">{{formatAddress(channel.address)}}</span>
                            <a @click="onDeleteChannel(channel)">Удалить {{channelTypeInfo.name}}</a>
                        </div>
                        <div class="notification-checkbox-group">
                            <x-checkbox :value="channel.deliveryLoggedOn.enabled"
                                        @input="onNotificationChange(channel, channel.deliveryLoggedOn, $event)"
                                        :disabled="!channel.enabled || channel.progress">
                                <span class="checkbox-text">Вход в систему</span>
                            </x-checkbox>
                            <x-checkbox :value="channel.deliveryFundsDebet.enabled"
                                        @input="onNotificationChange(channel, channel.deliveryFundsDebet, $event)"
                                        :disabled="!channel.enabled || channel.progress">
                                <span class="checkbox-text">Списание средств</span>
                            </x-checkbox>
                            <x-checkbox :value="channel.deliveryFundsCredit.enabled"
                                        @input="onNotificationChange(channel, channel.deliveryFundsCredit, $event)"
                                        :disabled="!channel.enabled || channel.progress">
                                <span class="checkbox-text">Поступление средств</span>
                            </x-checkbox>
                            <x-checkbox :value="channel.deliveryIncomingLetter.enabled"
                                        @input="onNotificationChange(channel, channel.deliveryIncomingLetter, $event)"
                                        :disabled="!channel.enabled || channel.progress">
                                <span class="checkbox-text">Новое письмо</span>
                            </x-checkbox>
                        </div>
                        <div class="separate-line"></div>
                    </div>
                </transition-group>
                <div v-if="channelList.length === 0">
                    <div class="no-channels-message">{{channelTypeInfo.noChannelsMessage}}</div>
                    <div class="separate-line"></div>
                </div>
                <input-button v-if="addPermission"
                              :name="newChannelInputButtonName"
                              :text="'Добавить ' + channelTypeInfo.name"
                              :placeholder="'Введите ' + channelTypeInfo.name"
                              :progress="newChannelProgress"
                              :inputMode.sync="newChannelInputMode"
                              :mask="channelTypeInfo.mask"
                              iconClass="icon-add"
                              v-model="newChannelAddress"
                              v-validate.initial="channelTypeInfo.validate"
                              @submit="onNewChannel"></input-button>
                <transition name="fade">
                    <p v-if="!!newChannelErrorMessage" class="error">
                        {{newChannelErrorMessage}}
                    </p>
                </transition>
            </template>
            <div v-else-if="!!errorMessage" class="notification-error">
                <span class="error">{{errorMessage}}</span>
                <button class="btn" @click="loadSettings">Повторить</button>
            </div>
            <spinner v-else></spinner>

            <message v-if="deleteChannel" ref="confirmDeleteMessage">
                <span>Удалить {{channelTypeInfo.name}} <b>{{formatAddress(deleteChannel.address)}}</b> из рассылки уведомлений?</span>
                <div class="notify__links">
                    <a @click="onDeleteChannelConfirmed">Удалить</a>
                    <a @click="$refs.confirmDeleteMessage.close()">Отмена</a>
                </div>
            </message>
        </div>
    `
})
export class ChannelSettingsPanel extends UI {

    /** Ссылки на дочерние компоненты */
    $refs: {
        confirmDeleteMessage: MessageComponent
    };

    /** Тип канала настроек уведомлений */
    @Prop({required: true, type: String})
    private type: ChannelType;

    /** Сервис для получения текущего времени */
    @Inject
    private readonly dateTimeService: DateTimeService;

    /** Сервис по работе с документами */
    @Inject
    private readonly documentService: DocumentService;

    /** Сервис для получения прав клиента */
    @Inject
    private readonly permissionsService: PermissionsService;

    /** Сервис по работе с подписями */
    @Inject
    private readonly signatureService: SignatureService;

    /** Сервис для работы с транзакциями */
    @Inject
    private readonly transactionService: TransactionService;

    /** Название компонента добавления нового канала. Используется для валидации значения компонента. */
    private readonly newChannelInputButtonName = "NEW_CHANNEL_INPUT_BUTTON";

    /** Сообщение об ошибке, возникшей при загрузке настроек уведомлений */
    private errorMessage: string = null;

    /** Список каналов для отображения в компоненте, отсортированный по адресу */
    private channelList: Channel[] = null;

    /** Нужно ли отображать компонент добавления нового канала в режиме ввода текста */
    private newChannelInputMode = false;

    /** Нужно ли отображать компонент добавления нового канала в режиме выполнения операции */
    private newChannelProgress = false;

    /** Значение компонента добавления нового канала */
    private newChannelAddress = "";

    /** Сообщение об ошибке в компоненте добавления нового канала */
    private newChannelErrorMessage = "";

    /** Свойство для хранения информации об удаляемом канале во время отображения диалога подтверждения удаления */
    private deleteChannel: Channel = null;

    /**
     * Загружает настройки
     * @inheritDoc
     */
    async created(): Promise<void> {
        await this.loadSettings();
    }

    /**
     * Обработчик изменения компонента добавления нового канала
     */
    @Watch("newChannelInputMode")
    @Watch("newChannelAddress")
    private onNewChannelChange(): void {
        this.newChannelErrorMessage = null;
    }

    /**
     * Загружает настройки уведомлений для отображения в компоненте
     */
    private async loadSettings(): Promise<void> {
        try {
            this.errorMessage = null;

            const channelContentList = await this.documentService.getList(DocumentType.CHANNELS_SETTINGS, {
                fields: [{name: "TYPE"}, {name: "STATE"}, {name: "PHONE_ADDRESS"}],
                statuses: [Status.EXECUTED.code],
                query: `[0]=='${this.type}' && ([2]=='${State.ON}' || [2]=='${State.OFF}')`
            });
            if (channelContentList.length === 0) {
                this.channelList = [];
                return;
            }

            const channelIds = channelContentList.map(channelContent => "'" + channelContent.DOC_ID + "'").join(",");
            const deliveryLoggedOnContentList = await this.documentService.getList(DocumentType.DELIVERY_LOGGED_ON, {
                fields: [{name: "CHANNEL_ID"}, {name: "STATE"}],
                statuses: [Status.EXECUTED.code],
                query: `([0]=='${State.ON}' || [0]=='${State.OFF}') && [1] in (${channelIds})`,
            });
            const deliveryFundsContentList = await this.documentService.getList(DocumentType.DELIVERY_FUNDS, {
                fields: [{name: "CHANNEL_ID"}, {name: "STATE"}, {name: "OPER_TYPE"}],
                statuses: [Status.EXECUTED.code],
                query: `([0]=='${State.ON}' || [0]=='${State.OFF}') && [1] in (${channelIds}) && [2]==NULL && ` +
                `[3] in ('${OperationType.DEBET}', '${OperationType.CREDIT}') && [4]==0.00 && [5]==NULL`
            });
            const deliveryIncomingLetterContentList = await this.documentService.getList(DocumentType.DELIVERY_INCOMING, {
                fields: [{name: "CHANNEL_ID"}, {name: "STATE"}],
                statuses: [Status.EXECUTED.code],
                query: `([0]=='${State.ON}' || [0]=='${State.OFF}') && [1] in (${channelIds}) && [2]=='${DocumentType.LETTER}'`
            });

            const channelList = channelContentList.map(channelContent => {
                const channelDocId = channelContent.DOC_ID;
                const deliveryLoggedOnContent = deliveryLoggedOnContentList.find(item => item.CHANNEL_ID === channelDocId);
                const deliveryLoggedOnNotification: Notification = {
                    docType: DocumentType.DELIVERY_LOGGED_ON,
                    docId: deliveryLoggedOnContent ? deliveryLoggedOnContent.DOC_ID : null,
                    enabled: deliveryLoggedOnContent ? deliveryLoggedOnContent.STATE === State.ON : false
                };
                const deliveryFundsDebetContent = deliveryFundsContentList.find(item => item.CHANNEL_ID === channelDocId &&
                    item.OPER_TYPE === OperationType.DEBET);
                const deliveryFundsDebetNotification: Notification = {
                    docType: DocumentType.DELIVERY_FUNDS,
                    docId: deliveryFundsDebetContent ? deliveryFundsDebetContent.DOC_ID : null,
                    enabled: deliveryFundsDebetContent ? deliveryFundsDebetContent.STATE === State.ON : false
                };
                const deliveryFundsCreditContent = deliveryFundsContentList.find(item => item.CHANNEL_ID === channelDocId &&
                    item.OPER_TYPE === OperationType.CREDIT);
                const deliveryFundsCreditNotification: Notification = {
                    docType: DocumentType.DELIVERY_FUNDS,
                    docId: deliveryFundsCreditContent ? deliveryFundsCreditContent.DOC_ID : null,
                    enabled: deliveryFundsCreditContent ? deliveryFundsCreditContent.STATE === State.ON : false
                };
                const deliveryIncomingLetterContent = deliveryIncomingLetterContentList.find(item => item.CHANNEL_ID === channelDocId);
                const deliveryIncomingLetterNotification: Notification = {
                    docType: DocumentType.DELIVERY_INCOMING,
                    docId: deliveryIncomingLetterContent ? deliveryIncomingLetterContent.DOC_ID : null,
                    enabled: deliveryIncomingLetterContent ? deliveryIncomingLetterContent.STATE === State.ON : false
                };
                return {
                    docId: channelDocId,
                    type: channelContent.TYPE as ChannelType,
                    enabled: channelContent.STATE === State.ON,
                    progress: false,
                    address: channelContent.PHONE_ADDRESS,
                    deliveryLoggedOn: deliveryLoggedOnNotification,
                    deliveryFundsDebet: deliveryFundsDebetNotification,
                    deliveryFundsCredit: deliveryFundsCreditNotification,
                    deliveryIncomingLetter: deliveryIncomingLetterNotification
                };
            });

            this.channelList = channelList.sort(((a, b) => a.address.compareTo(b.address)));
        } catch (error) {
            this.errorMessage = error.message;
        }
    }

    /**
     * Обрабатывает изменение состояния канала рассылки уведомлений
     * @param {Channel} channel информация о канале рассылки уведомлений
     * @param {boolean} enabled новое состояние канала
     */
    @CatchErrors
    private async onChannelChange(channel: Channel, enabled: boolean): Promise<void> {
        // Сохраняем состояние канала
        const channelWasEnabled = channel.enabled;
        channel.progress = true;
        channel.enabled = enabled;
        try {
            const document = await this.documentService.load(DocumentType.CHANNELS_SETTINGS, channel.docId);
            document.content.STATE = enabled ? State.ON : State.OFF;

            // Сохраняем и подписываем документ в транзакции
            const timestamp = await this.dateTimeService.getDateTime();
            const signature = await this.signatureService.generateSignature(document, timestamp);
            const commandList: CommandRequest[] = [
                {
                    commandName: "SAVE_DOCUMENT",
                    params: {
                        docType: document.type,
                        id: document.id,
                        content: document.content
                    }
                },
                {
                    commandName: "SIGN_DOCUMENT",
                    params: {
                        docType: document.type,
                        id: document.id,
                        signature: signature,
                        timestamp: timestamp
                    }
                }
            ];
            await this.transactionService.execute(commandList);
        } catch (error) {
            // Откатываем состояние канала
            channel.enabled = channelWasEnabled;
            throw error;
        } finally {
            channel.progress = false;
        }
    }

    /**
     * Обрабатывает нажатие на кнопку удаления канала
     * @param {Channel} channel информация об удаляемом канале
     */
    private async onDeleteChannel(channel: Channel): Promise<void> {
        this.deleteChannel = channel;
        this.$nextTick(() => {
            this.$refs.confirmDeleteMessage.show();
        });
    }

    /**
     * Обрабатывает подтверждение удаления канала
     */
    @CatchErrors
    private async onDeleteChannelConfirmed(): Promise<void> {
        this.$refs.confirmDeleteMessage.close();
        this.deleteChannel.progress = true;
        try {
            // TODO: Не давать пользователю менять канал во время удаления, даже после пересоздания компонента
            const deleteDocumentList: Document[] = [];

            // Загружаем информацию о документах, связанных с каналом
            // TODO: Загружать список через FDOC_LIST как в common_sms.ts#getLinkedDocs или найти другое решение
            for (const docType of CHANNEL_DOC_TYPES) {
                const linkedDocumentList = await this.documentService.getList(docType, {
                    fields: [{name: "CHANNEL_ID"}],
                    statuses: [Status.EXECUTED.code],
                    query: `([0]=='${State.ON}' || [0]=='${State.OFF}') && [1]=='${this.deleteChannel.docId}'`,
                });
                if (linkedDocumentList.length > 0) {
                    const docIdList = linkedDocumentList.map(content => content.DOC_ID);
                    deleteDocumentList.push(...await this.documentService.loadList(docType, docIdList));
                }
            }

            // Загружаем документ канала
            deleteDocumentList.push(await this.documentService.load(DocumentType.CHANNELS_SETTINGS, this.deleteChannel.docId));

            // Удаляем канал и связанные с ним документы в транзакции
            const commandList: CommandRequest[] = [];
            const timestamp = await this.dateTimeService.getDateTime();
            for (const document of deleteDocumentList) {
                document.content.STATE = State.REMOVED;
                const signature = await this.signatureService.generateSignature(document, timestamp);

                commandList.push({
                    commandName: "SAVE_DOCUMENT",
                    params: {
                        docType: document.type,
                        id: document.id,
                        content: document.content
                    }
                }, {
                    commandName: "SIGN_DOCUMENT",
                    params: {
                        docType: document.type,
                        id: document.id,
                        signature: signature,
                        timestamp: timestamp
                    }
                }, {
                    commandName: "DELETE_DOCUMENT",
                    params: {
                        docType: document.type,
                        id: document.id
                    }
                });
            }
            await this.transactionService.execute(commandList);
            // Удаляем канал из списка
            this.channelList.splice(this.channelList.indexOf(this.deleteChannel), 1);
        } finally {
            this.deleteChannel.progress = false;
        }
    }

    /**
     * Обрабатывает изменение состояния настройки уведомления
     * @param {Channel} channel канал отправки уведомления
     * @param {Notification} notification настройка уведомления
     * @param {boolean} enabled новое состояние настроек
     */
    @CatchErrors
    private async onNotificationChange(channel: Channel, notification: Notification, enabled: boolean): Promise<void> {
        // TODO: не блокировать весь канал при изменении одного уведомления
        // Запоминаем состояние настройки уведомления
        const notificationWasEnabled = notification.enabled;
        channel.progress = true;
        notification.enabled = enabled;
        try {
            let document;
            if (notification.docId) {
                // Документ настройки уже существует
                document = await this.documentService.load(notification.docType, notification.docId);
                document.content.STATE = enabled ? State.ON : State.OFF;
            } else {
                // Документ настройки не существует
                document = await this.documentService.createEmpty(notification.docType);
                document.content.STATE = enabled ? State.ON : State.OFF;
                document.content.CHANNEL_ID = channel.docId;
                document.content.FORMAT = channel.type === ChannelType.EMAIL ? NotificationFormat.HTML : NotificationFormat.TXT;
                if (notification.docType === DocumentType.DELIVERY_LOGGED_ON) {
                    document.content.TITLE = document.meta.description;
                } else if (notification.docType === DocumentType.DELIVERY_FUNDS) {
                    document.content.TITLE = "О движении средств";
                    document.content.DELIVERY_AMOUNT = "0.00";
                    document.content.OPER_TYPE = notification === channel.deliveryFundsDebet ? OperationType.DEBET : OperationType.CREDIT;
                } else if (notification.docType === DocumentType.DELIVERY_INCOMING) {
                    document.content.IN_DOCS_TYPE = DocumentType.LETTER;
                    document.content.TITLE = document.meta.description + " (Банковское письмо)";
                }
            }

            // Сохраняем и подписываем документ в транзакции
            const timestamp = await this.dateTimeService.getDateTime();
            const signature = await this.signatureService.generateSignature(document, timestamp);
            const commandList: CommandRequest[] = [
                {
                    id: "save",
                    commandName: "SAVE_DOCUMENT",
                    params: {
                        docType: document.type,
                        id: document.id,
                        content: document.content
                    }
                },
                {
                    commandName: "SIGN_DOCUMENT",
                    params: {
                        "docType": document.type,
                        "id:resultRef": "save.id",
                        "signature": signature,
                        "timestamp": timestamp
                    }
                }
            ];
            const responses = await this.transactionService.execute(commandList);

            // Обновляем информацию о настройке уведомления
            notification.docId = responses[0].results.id;
        } catch (error) {
            // Откатываем состояние настройки
            notification.enabled = notificationWasEnabled;
            throw error;
        } finally {
            channel.progress = false;
        }
    }

    /**
     * Обрабатывает событие создания нового канала
     * @param {string} address адрес нового канала
     */
    @CatchErrors
    private async onNewChannel(address: string): Promise<void> {
        this.newChannelErrorMessage = this.$errors.first(this.newChannelInputButtonName);
        if (this.newChannelErrorMessage) {
            // Ошибка валидации адреса
            return;
        }

        try {
            this.newChannelErrorMessage = null;
            this.newChannelProgress = true;

            const document = await this.documentService.createEmpty(DocumentType.CHANNELS_SETTINGS);
            document.content.TYPE = this.type;
            document.content.PHONE_ADDRESS = address;
            document.content.STATE = State.ON;
            document.content.LANG = "russian";
            document.content.TRANSLIT = "0";

            // Сохраняем и подписываем документ в транзакции
            const timestamp = await this.dateTimeService.getDateTime();
            const signature = await this.signatureService.generateSignature(document, timestamp);
            const commandList: CommandRequest[] = [
                {
                    id: "save",
                    commandName: "SAVE_DOCUMENT",
                    params: {
                        docType: document.type,
                        id: document.id,
                        content: document.content
                    }
                },
                {
                    commandName: "SIGN_DOCUMENT",
                    params: {
                        "docType": document.type,
                        "id:resultRef": "save.id",
                        "signature": signature,
                        "timestamp": timestamp
                    }
                }
            ];
            const responses = await this.transactionService.execute(commandList);

            const newChannel: Channel = {
                docId: responses[0].results.id,
                type: this.type,
                enabled: true,
                progress: false,
                address: address,
                deliveryLoggedOn: {
                    docType: DocumentType.DELIVERY_LOGGED_ON,
                    docId: null,
                    enabled: false
                },
                deliveryFundsDebet: {
                    docType: DocumentType.DELIVERY_FUNDS,
                    docId: null,
                    enabled: false
                },
                deliveryFundsCredit: {
                    docType: DocumentType.DELIVERY_FUNDS,
                    docId: null,
                    enabled: false
                },
                deliveryIncomingLetter: {
                    docType: DocumentType.DELIVERY_INCOMING,
                    docId: null,
                    enabled: false
                }
            };

            // Добавляем новый канал в список с сохранением сортировки по адресу
            const insertIndex = this.channelList.findIndex(value => address.compareTo(value.address) < 0);
            if (insertIndex !== -1) {
                this.channelList.splice(insertIndex, 0, newChannel);
            } else {
                this.channelList.push(newChannel);
            }

            this.newChannelAddress = "";
            this.newChannelInputMode = false;
        } catch (error) {
            this.newChannelErrorMessage = error.message;
        }
        this.newChannelProgress = false;
    }

    /**
     * Форматирует адрес канала в зависимости от его типа
     * @param {string} address адрес
     * @return {string} форматированный адрес
     */
    private formatAddress(address: string) {
        return this.type === ChannelType.SMS ? Filters.formatPhone(address) : address;
    }

    /**
     * Возвращает информацию о типе канала панели
     * @return {ChannelTypeInfo} информация о типе канала панели
     */
    private get channelTypeInfo(): ChannelTypeInfo {
        switch (this.type) {
            case ChannelType.SMS:
                return {
                    name: "телефон",
                    noChannelsMessage: "Телефоны отсутствуют",
                    validate: {
                        phone: true
                    },
                    mask: PhoneMaskOptions
                };
            case ChannelType.EMAIL:
                return {
                    name: "e-mail",
                    noChannelsMessage: "E-mail отсутствуют",
                    validate: {
                        email: true
                    },
                    mask: EmailMaskOptions
                };
            default:
                throw new Error("Неверный тип канала: " + this.type);
        }
    }

    /**
     * Возвращает может ли пользователь добавить новый канал
     * @return {boolean} может ли пользователь добавить новый канал
     */
    private get addPermission(): boolean {
        return this.permissionsService.getPegasusChannels().includes(this.type);
    }
}

/**
 * Перечисление типов каналов
 */
export enum ChannelType {
    SMS = "sms",
    EMAIL = "email"
}

/**
 * Перечисление состояний каналов/настроек уведомлений
 */
enum State {
    ON = "on",
    OFF = "off",
    REMOVED = "removed"
}

/**
 * Канал получения уведомлений
 */
type Channel = {
    /** Идентификатор документа канала */
    docId: string;
    /** Тип канала */
    type: ChannelType;
    /** Включен ли канал */
    enabled: boolean;
    /** Нужно ли показывать индикатор прогресса поверх информации о канале */
    progress: boolean;
    /** Адрес для отправки сообщений */
    address: string;
    /** Настройка уведомления о входе в систему */
    deliveryLoggedOn: Notification;
    /** Настройка уведомления о списании средств со счета */
    deliveryFundsDebet: Notification;
    /** Настройка уведомления о поступлении средств на счет */
    deliveryFundsCredit: Notification;
    /** Настройка уведомления о входящем банковском письме */
    deliveryIncomingLetter: Notification;
};

/**
 * Настройка уведомления
 */
type Notification = {
    /** Тип документа настройки уведомления */
    docType: DocumentType;
    /** Идентификатор документа настройки уведомления */
    docId: string;
    /** Включена ли настройка */
    enabled: boolean;
};

/**
 * Формат уведомления
 */
enum NotificationFormat {
    TXT = "txt",
    HTML = "html"
}

/**
 * Информация о типе канале
 */
type ChannelTypeInfo = {
    /** Название типа канала со строчной буквы */
    name: string;
    /** Текст сообщения об отсутствии каналов */
    noChannelsMessage: string;
    /** Настройки валидации поля ввода адреса нового канала */
    validate: {[key: string]: any};
    /** Настройки маски для поля ввода адреса нового канала */
    mask: MaskOptions;
};

/**
 * Типы операций в документе настройки уведомления о движении средств по счету
 */
enum OperationType {
    /** Списание */
    DEBET = "debet",
    /** Поступление */
    CREDIT = "credit"
}
