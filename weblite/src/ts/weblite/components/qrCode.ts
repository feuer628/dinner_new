import {Component, Prop, UI} from "platform/ui";
import QRCode from "qr-code";
import {Watch} from "vue-property-decorator";

/**
 * Компонент отображения qr-кодов
 */
@Component({
    // language=Vue
    template: `
        <div></div>
    `
})
export class QrCode extends UI {

    /** Текст */
    @Prop({type: String, required: true})
    private text: string;

    /** Размер */
    @Prop({type: Number, default: 256})
    private size: number;

    /** Цвет кода */
    @Prop({type: String, default: "#000"})
    private color: string;

    /** Цвет подложки */
    @Prop({type: String, default: "#FFF"})
    private bgColor: string;

    /** Уровень коррекции ошибок */
    @Prop({
        type: String,
        validator: (value: string) => {
            return value === "L" || value === "M" || value === "Q" || value === "H";
        },
        required: false,
        default: "L"
    })
    private errorLevel: string;

    /** Объект QRCode */
    private qrCode: any = {};

    /**
     * Инициализирует объект с кодом
     * @inheritDoc
     */
    mounted(): void {
        this.qrCode = new QRCode(this.$el, {
            text: this.text,
            width: this.size,
            height: this.size,
            colorDark: this.color,
            colorLight: this.bgColor,
            correctLevel: QRCode.CorrectLevel[this.errorLevel]
        });
    }

    @Watch("text")
    private onTextChange(): void {
        this.clear();
        this.makeCode(this.text);
    }

    private clear(): void {
        this.qrCode.clear();
    }

    private makeCode(text: string): void {
        this.qrCode.makeCode(text);
    }
}
