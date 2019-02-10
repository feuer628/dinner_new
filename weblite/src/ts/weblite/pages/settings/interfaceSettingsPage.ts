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
import {Component, UI} from "platform/ui";
import {TemplatePage} from "../../components/templatePage";
import {ClientService} from "../../service/clientService";

/**
 * Компонент страницы выбора версии
 */
@Component({
    // language=Vue
    template: `
        <div class="app-content__inner">
            <div class="interface-change-block">
                <div class="interface-preview">
                    <img src="../img/ibank_preview.png"/>
                </div>
                <div class="interface-info">
                    <div class="interface-title">Интернет-Банк</div>
                    <div class="interface-desc">Для корпоративных клиентов</div>
                    <a class="btn btn-primary" @click="onClickWebCorporate">Перейти</a>
                </div>
            </div>
        </div>
    `,
    components: {TemplatePage}
})
export class InterfaceSettingsPage extends UI {

    /** Сервис по работе с клиентом */
    @Inject
    private clientService: ClientService;

    /**
     * Действия при выборе канала (сохранение и переход в другой интерфейс)
     * @return {Promise<void>}
     */
    @CatchErrors
    private async onClickWebCorporate(): Promise<void> {
        try {
            await this.clientService.switchChannelToCorporate();
        } catch {
            // если случится ошибка - игнорируем и переходим в интерфейс корпоративного клиента
        }
        window.location.href = "..";
    }
}