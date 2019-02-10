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

import {Component, Prop, UI} from "platform/ui";
import {EsInfo} from "../../../service/employeeService";
import {EsIcon} from "./esIcon";
import {EsSvg} from "./esSvg";

/**
 * Компонент для плашки ЭП
 */
@Component({
    // language=Vue
    template: `
        <div @click="onClickHandler" class="es-panel">
            <es-icon :es-type="esInfo.esType" :storage-type="esInfo.storageType" class="es-panel__icon"/>
            <div class="es-panel__info">
                <div v-if="esInfo.ownerFullName" :title="esInfo.ownerFullName" class="es-panel__owner-name">
                    {{esInfo.ownerFullName}}
                </div>
                <div class="es-panel__status">
                    <es-svg img-name="ACTIVE"></es-svg>
                    <span class="es-panel__status-text">
                        Действует до {{ esInfo.endDate }}
                    </span>
                </div>
            </div>
        </div>
    `,
    components: {EsIcon, EsSvg}
})
export class EsPanel extends UI {

    /**
     * Информация об ЭП
     */
    @Prop({required: true})
    private esInfo: EsInfo;

    private onClickHandler() {
        this.$emit("chooseEs", this.esInfo);
    }
}
