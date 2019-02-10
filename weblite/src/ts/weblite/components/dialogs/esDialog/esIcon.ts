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
import {Component, Prop, UI} from "platform/ui";
import {EsSvg} from "./esSvg";

/**
 * Пиктограмма ЭП
 */
@Component({
    // language=Vue
    template: `
        <div class="es-icon">
            <template v-if="esType === 'CERTIFICATE' || esType === 'SERVER_SIGN'">
                <!-- Пиктограмма внешнего сертификата -->
                <es-svg :img-name="imageNameForStorageType"/>
            </template>
            <template v-else>
                <!-- Пиктограмма внутренней ЭП -->
                <es-svg img-name="EPKEY"/>
                <!-- Пиктограмма типа хранилища -->
                <es-svg :img-name="imageNameForStorageType" class="es-icon__token"/>
            </template>
        </div>
    `,
    components: {EsSvg}
})
export class EsIcon extends UI {

    /** Тип ЭП */
    @Prop({required: true})
    private esType: string;

    /** Тип хранилища ЭП */
    @Prop({required: true})
    private storageType: string;

    /** Возвращает название изображения для соответствующего типа хранилища электронной подписи */
    private get imageNameForStorageType(): string {
        const esType = this.esType;
        if (esType === "FILE_STORAGE") {
            return "FILE";
        }
        const storageType = this.storageType;
        if (esType === "CERTIFICATE") {
            switch (storageType) {
                case "cryptopro":
                    return "CERTIFICATE_CRYPTO_PRO";
                case "signalcom":
                    return "CERTIFICATE_SIGNAL_COM";
                default:
                    return "CERTIFICATE";
            }
        }
        if (esType === "SERVER_SIGN") {
            return esType + (storageType === "server" ? "_SERVER" : "_CLIENT");
        }
        if (storageType && (storageType.startsWith("MAC") || storageType === "ST19-005")) {
            return "MACTOKEN";
        }
        const result = CryptoUtil.findCryptoType(storageType);
        return result ? result.id.toUpperCase() : "IBANK2KEY";
    }
}