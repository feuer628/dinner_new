import {CatchErrors} from "platform/decorators";
import {Inject} from "platform/ioc";
import {Component, UI} from "platform/ui";
import {BannerService, RegionResponse} from "../service/bannerService";

/**
 * Компонент для работы с баннерами
 */
@Component({
    // language=Vue
    template: `
        <div class="banner" v-if="regionResponse && regionResponse.exist">
            <template v-if="regionResponse.regions.length > 0">
                <img :src="bannerUrl" usemap="#bannerMap"/>
                <map name="bannerMap">
                    <area v-for="region in regionResponse.regions" shape="rect" :coords="region.coordinates"
                          :title="region.title" :href="region.href" target="_blank">
                </map>
            </template>
            <template v-else>
                <img :src="bannerUrl"/>
            </template>
        </div>
    `
})
export class BannerComponent extends UI {

    /** Сервис по работе с баннерами */
    @Inject
    private bannerService: BannerService;

    /** Информация по баннеру */
    private regionResponse: RegionResponse = null;

    /**
     * Загружает и устанавливает регионы на баннер
     * @inheritDoc
     * @return {Promise<void>}
     */
    @CatchErrors
    async created(): Promise<void> {
        this.regionResponse = await this.bannerService.getInfo();
    }

    /**
     * Получает адрес страницы с картинкой баннера
     * @returns {string}
     */
    private get bannerUrl(): string {
        return BannerService.BANNER_URL;
    }
}
