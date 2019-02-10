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

import {KeyPasswordDialog} from "components/dialogs/plugin/keyPasswordDialog";
import {PinCodeDialog} from "components/dialogs/plugin/pinCodeDialog";
import * as PluginHelper from "default/PluginHelper";
import {PluginSession} from "default/PluginHelper";
import {Document, DocumentContent, DocumentMeta, PlainContent} from "model/document";
import {Service} from "platform/decorators/service";
import {Container, Singleton} from "platform/ioc";
import {HexUtils} from "platform/utils/hexUtils";
import {EsDialog} from "../components/dialogs/esDialog/esDialog";
import {ClientService} from "./clientService";

/**
 * Сервис по работе с подписями
 */
@Service("SignatureService")
@Singleton
export class SignatureService {

    /**
     * Генерирует подпись для документа при помощи плагина
     * @param {Document} document информация о подписываемом документе
     * @param {string} timestamp временная метка подписи в формате dd.MM.yyyy HH:mm GMTXXX
     * @param {Array<Blob | Document>} attachments вложения документа (вложение может быть файлом или другим документом)
     * @return {Promise<string>} подпись для документа
     */
    async generateSignature(document: Document, timestamp: string, attachments?: Array<Blob | Document>): Promise<string> {
        const session = PluginHelper.getSession();
        await this.preparePlugin(session);
        return await session.cmsSign(await this.prepareDocument(document, timestamp, attachments));
    }

    /**
     * Подготавливает плагин к подписи
     * @param {PluginSession} session информация о сессии плагина
     */
    private async preparePlugin(session: PluginSession): Promise<void> {
        const clientInfo = Container.get(ClientService).getClientInfo();
        if (clientInfo.authorizedByLoginAuthAccount && !session.currentId && !await EsDialog.chooseEs(false)) {
            throw new Error("Для выполнения операции необходима электронная подпись");
        }
        if (await session.isTrustSignSupported()) {
            throw new Error("Подпись с помощью Трастскрина не поддерживается");
        }
        if (!await session.isPinSet() && !await new PinCodeDialog().show({tokenId: session.getCurrentTokenId()})) {
            throw new Error("Для продолжения работы необходимо ввести PIN-код.");
        }
        await session.setKey(session.currentKeyAlias);
        if (!await session.isKeyPasswordSet() && !await new KeyPasswordDialog().show(session.getCurrentKeyAlias())) {
            throw new Error("Для продолжения работы необходимо ввести пароль.");
        }
    }

    /**
     * Формирует на основе информации о документе данные для подписи при помощи плагина
     * @param {Document} document информация о подписываемом документе
     * @param {string} timestamp временная метка подписи в формате dd.MM.yyyy HH:mm GMTXXX
     * @param {Array<Blob | Document>} attachments вложения документа (вложение может быть файлом или другим документом)
     * @return {Promise<string>} данные для подписи
     */
    private async prepareDocument(document: Document, timestamp: string, attachments?: Array<Blob | Document>): Promise<string> {
        let signData = HexUtils.stringToHex(this.prepareContent(document.meta, document.content));
        if (document.meta.metaFields.hasOwnProperty("hasAttachments") && attachments && attachments.length > 0) {
            for (const attachment of attachments) {
                if (attachment instanceof Blob) {
                    signData += await HexUtils.blobToHex(attachment as Blob);
                } else {
                    const attachedDocument = attachment as Document;
                    signData += HexUtils.stringToHex(this.prepareContent(attachedDocument.meta, attachedDocument.content, true));
                }
            }
        }
        signData += HexUtils.stringToHex(timestamp, true);
        return signData;
    }

    /**
     * Формирует на основе контента документа данные для подписи при плагина
     * @param {DocumentMeta} meta метаинформация о документе
     * @param {DocumentContent} content контент документа
     * @param {boolean} withExcluded нужно ли добавлять в данные для подписи поля, которые помечены как исключенные из подписи
     * @return {string} данные для подписи
     */
    private prepareContent(meta: DocumentMeta, content: DocumentContent, withExcluded?: boolean): string {
        let signData = "";
        for (const fieldInfo of meta.fields) {
            const key = fieldInfo.name;
            const value = content[key];
            if (fieldInfo.excluded && !withExcluded) {
                continue;
            }
            if (fieldInfo.fields) {
                if (!value) {
                    continue;
                }
                const list = value as PlainContent[];
                for (let i = 0; i < list.length; i++) {
                    const listField = list[i];
                    for (const listFieldInfo of fieldInfo.fields) {
                        const listKey = listFieldInfo.name;
                        if (listFieldInfo.excluded && !withExcluded) {
                            continue;
                        }
                        const listValue = listField[listKey];
                        signData += key + "." + i + "." + listKey + "=" + (listValue ? listValue : "") + "\n";
                    }
                }
            } else {
                signData += key + "=" + (value ? (value as string).trim() : "") + "\n";
            }
        }
        return signData;
    }
}