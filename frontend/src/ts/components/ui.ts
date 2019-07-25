import Vue from "vue";
import {RestService} from "../service/restService";
import Common from "../utils/common";

/**
 * Базовый класс-расширение для компонентов Vue
 * Включает в себя RestService для взаимодейтсвия с сервером
 */
export class UI extends Vue {

    /** Идентификатор основного модального окна страницы <Classname> + Modal */
    protected modalId = this.constructor.name + "Modal";

    /** Message-диалог для показа сообщений */
    protected messageDialog = Common.getMessageDialog();

    /** Сервис для взаимодейтсвия с сервером */
    protected rest: RestService = new RestService(this);

    /** Состояние загрузки данных с сервера */
    protected get dataLoading() {
        return this.$store.state.dataLoading;
    }

    /** Установка состояния загрузки данных с сервера */
    protected set dataLoading(newValue: boolean) {
        this.$store.state.dataLoading = newValue;
    }

    /** Выводит тост по центру экрана сверху */
    protected toastCenter(text: string, title = "Информация", variant = "info") {
        this.$bvToast.toast(text, {toaster: "b-toaster-top-center", title, autoHideDelay: 3000, variant});
    }

    /** Показывает основное модальное окно страницы */
    protected showModal(id = this.modalId): void {
        this.$bvModal.show(id);
    }

    /** Скрывает основное модальное окно страницы */
    protected hideModal(id = this.modalId): void {
        this.$bvModal.hide(id);
    }
}