import Component from "vue-class-component";
import {MenuItemReview} from "../models/models";
import {UI} from "../components/ui";

/**
 * Компонент с отзывами о блюдах
 */
@Component({
    // language=Vue
    template:
`
<div id="reviews">
    <h4 class="alignC">Отзывы о блюдах</h4>
    <b-card-group columns>
        <b-card v-for="item in reviews" :key="item.id" :header-bg-variant="headerVariant(item)" :header="item.menu_item_name" class="reviewCard">
            <b-card-text>{{item.review}}</b-card-text>
            <div slot="footer"><b-form-input v-model="item.rating" :class="headerVariant(item)" type="range" min="1" max="10" step="0.25"></b-form-input></div>
        </b-card>
    </b-card-group>
</div>
`
})
export class MenuReviews extends UI {

    /** Отзывы о блюдах */
    private reviews: MenuItemReview[] = [];

    private async mounted(): Promise<void> {
        this.reviews = await this.rest.loadItems<MenuItemReview>("users/reviews");
    }

    /**
     * Цветовая схема отзывов
     */
    private headerVariant(item: MenuItemReview): string {
        if (item.rating >= 9) {
            return "best-dish";
        }
        if (item.rating >= 7) {
            return "good-dish";
        }
        if (item.rating >= 5) {
            return "normal-dish";
        }
        if (item.rating >= 3) {
            return "bad-dish";
        }
        return "awful-dish";
    }
}