import {Component, Prop, UI, Watch} from "platform/ui";
import {Icon} from "platform/ui/icon";

/**
 * Компонент отображения сообщений
 */
@Component({
    // language=Vue
    template: `
        <transition name="fade">
            <div v-if="displayed" @click.stop="close" class="overlay">
                <div class="notify" @click.stop="closeMessage">
                    <slot></slot>
                </div>
            </div>
        </transition>
    `
})
export class MessageComponent extends UI {

    /** Признак автозакрытия сообщения */
    @Prop({default: false, type: Boolean})
    private autoClose: boolean;

    /** Интервал через которое будет закрыто сообщение, задается в секундах */
    @Prop({default: 5, type: Number})
    private autoCloseInterval: number;

    /** Признак возможности закрытия сообщения по клику на него */
    @Prop({default: false, type: Boolean})
    private closable: boolean;

    /** Идентификатор таймаута */
    private currentTimeout: number = null;

    /** Признак отображения сообщения */
    private displayed = false;

    /**
     * Показывает временное сообщение с иконкой
     * @param {string} message текст сообщения
     * @param {Icon} icon иконка
     */
    static showToast(message: string, icon = Icon.CHECKED) {
        const messageComponent = new MessageComponent({
            propsData: {
                autoClose: true,
                closable: true
            }
        });
        messageComponent.$slots.default = [messageComponent.$createElement({
            template: `<span class="icon ${icon}">${message}</span>`
        })];
        messageComponent.$mount();
        document.body.appendChild(messageComponent.$el);
        messageComponent.$once("close", () => {
            messageComponent.$destroy();
            document.body.removeChild(messageComponent.$el);
        });
        messageComponent.show();
    }

    /**
     * Отображает сообщение
     */
    show(): void {
        this.displayed = true;
        if (this.autoClose && this.autoCloseInterval > 0) {
            this.currentTimeout = setTimeout(() => {
                this.displayed = false;
            }, this.autoCloseInterval * 1000);
        }
    }

    /**
     * Закрывает сообщение и очищает все таймеры
     */
    close(): void {
        // TODO добавить возможность скрыть сообщение Escape'ом
        this.displayed = false;
        if (this.autoClose && this.autoCloseInterval > 0) {
            clearTimeout(this.currentTimeout);
        }
    }

    /**
     * Обрабатывает изменение признака отображения сообщения
     * @param {boolean} newValue новое значение принзака
     */
    @Watch("displayed")
    private onDisplayedChange(newValue: boolean) {
        if (!newValue) {
            this.$emit("close");
        }
    }

    /**
     * Закрывает сообщение, если поддерживается закрытие по клику
     */
    private closeMessage(): void {
        if (this.closable) {
            this.close();
        }
    }
}