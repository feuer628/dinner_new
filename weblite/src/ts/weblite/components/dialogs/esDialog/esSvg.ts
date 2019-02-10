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

/**
 * Компонент, позволяющий использовать захардкоженные svg
 */
@Component({
    // language=Vue
    template: `
        <div v-safe-html="img" class="es-svg"></div>`
})
export class EsSvg extends UI {

    /** Наименование картинки */
    @Prop({required: true})
    private imgName: "ANGARA" | "CERTIFICATE" | "CERTIFICATE_CRYPTO_PRO" | "CERTIFICATE_SIGNAL_COM" | "CRYPTOKENEP" | "EPKEY" | "FILE" | "IBANK2KEY" |
        "JACARTA" | "JACARTA_2" | "MACTOKEN" | "MSKEY5" | "RUTOKEN" | "RUTOKEN_2" | "SERVER_SIGN_CLIENT" | "SERVER_SIGN_SERVER" |
        "ACTIVE" | "BLOCKED" | "CONFIRMATION" | "EXPIRED" | "NEARLY_EXPIRED" | "WITHDRAWN";

    /**
     * Возвращает SVG-код картинки
     */
    private get img(): string {
        const image = ALL_IMAGES[this.imgName];
        if (!image) {
            throw new Error("Некорректное значение поля imgName");
        }
        return image;
    }
}

// tslint:disable
const CERTIFICATE = `
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <defs>
        <clipPath id="clip-path">
            <rect fill="none" height="48" width="48"/>
        </clipPath>
    </defs>
    <g clip-path="url(#clip-path)">
        <rect fill="#cccccc" height="1" width="10" x="10" y="26"/>
        <rect fill="#cccccc" height="1" width="22" x="13" y="10"/>
        <rect fill="#cccccc" height="1" width="30" x="9" y="15"/>
        <path d="M 37 27 a 7 7 0 1 0 -12 4.89 V 44 l 5 -2.5 L 35 44 V 31.89 A 6.93 6.93 0 0 0 37 27 Z m -7 -6 a 6 6 0 1 1 -6 6 A 6 6 0 0 1 30 21 Z m 0 19.5 l -4 2 V 32.74 a 7 7 0 0 0 8 0 V 42.5 Z" fill="#cccccc"/>
        <polygon fill="#cccccc" points="48 41 37 41 37 40 47 40 47 1 1 1 1 40 23 40 23 41 0 41 0 0 48 0 48 41"/>
        <path d="M 39.32 37 H 37 V 36 h 1.33 c .19 -3.08 2.07 -5.32 4.67 -5.58 V 9.89 A 4.87 4.87 0 0 1 38.34 5 H 9.66 A 4.74 4.74 0 0 1 5 9.78 V 30.42 c 2.6 .26 4.48 2.5 4.67 5.58 H 23 v 1 H 8.68 v -.5 c 0 -2.53 -1.44 -5.1 -4.18 -5.1 H 4 V 8.8 h .5 c 2.62 0 4.18 -1.61 4.18 -4.3 V 4 H 39.32 v .5 c 0 2.72 1.6 4.4 4.18 4.4 H 44 V 31.4 h -.5 c -2.74 0 -4.18 2.57 -4.18 5.1 Z" fill="#cccccc"/>
    </g>
</svg>
`;

const CERTIFICATE_CRYPTO_PRO = `
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <rect x="10" y="26" width="10" height="1" fill="#a1adb3"/>
    <rect x="10" y="26" width="10" height="1" fill="#a1adb3"/>
    <rect x="13" y="10" width="22" height="1" fill="#a1adb3"/>
    <rect x="9" y="15" width="30" height="1" fill="#a1adb3"/>
    <path d="M30,20a7,7,0,0,0-5,11.89V44l5-2.5L35,44V31.89A7,7,0,0,0,30,20Zm4,22.5-4-2-4,2V32.74a7,7,0,0,0,8,0ZM30,33a6,6,0,1,1,6-6A6,6,0,0,1,30,33Z" fill="#1976d2"/>
    <polygon points="48 41 37 41 37 40 47 40 47 1 1 1 1 40 23 40 23 41 0 41 0 0 48 0 48 41" fill="#a1adb3"/>
    <path d="M39.32,37H37V36h1.33c.19-3.08,2.07-5.32,4.67-5.58V9.89A4.87,4.87,0,0,1,38.34,5H9.66A4.74,4.74,0,0,1,5,9.78V30.42c2.6.26,4.48,2.5,4.67,5.58H23v1H8.68v-.5c0-2.53-1.44-5.1-4.18-5.1H4V8.8h.5c2.62,0,4.18-1.61,4.18-4.3V4H39.32v.5c0,2.72,1.6,4.4,4.18,4.4H44V31.4h-.5c-2.74,0-4.18,2.57-4.18,5.1Z" fill="#a1adb3"/>
</svg>
`;

const CERTIFICATE_SIGNAL_COM = `
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <rect x="10" y="26" width="10" height="1" fill="#a1adb3"/>
    <rect x="13" y="10" width="22" height="1" fill="#a1adb3"/>
    <rect x="9" y="15" width="30" height="1" fill="#a1adb3"/>
    <path d="M30,20a7,7,0,0,0-5,11.89V44l5-2.5L35,44V31.89A7,7,0,0,0,30,20Zm4,22.5-4-2-4,2V32.74a7,7,0,0,0,8,0ZM30,33a6,6,0,1,1,6-6A6,6,0,0,1,30,33Z" fill="#e6bd00"/>
    <polygon points="48 41 37 41 37 40 47 40 47 1 1 1 1 40 23 40 23 41 0 41 0 0 48 0 48 41" fill="#a1adb3"/>
    <path d="M39.32,37H37V36h1.33c.19-3.08,2.07-5.32,4.67-5.58V9.89A4.87,4.87,0,0,1,38.34,5H9.66A4.74,4.74,0,0,1,5,9.78V30.42c2.6.26,4.48,2.5,4.67,5.58H23v1H8.68v-.5c0-2.53-1.44-5.1-4.18-5.1H4V8.8h.5c2.62,0,4.18-1.61,4.18-4.3V4H39.32v.5c0,2.72,1.6,4.4,4.18,4.4H44V31.4h-.5c-2.74,0-4.18,2.57-4.18,5.1Z" fill="#a1adb3"/>
</svg>
`;

const EPKEY = `
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <path d="M33.8,6a7.2,7.2,0,0,1,5.75,11.54L29.46,7.45A7.17,7.17,0,0,1,33.8,6m0-1A8.18,8.18,0,0,0,28,7.4L39.6,19A8.2,8.2,0,0,0,33.8,5Z" fill="#a1adb3"/>
    <path d="M43.31,4.69A16,16,0,0,0,16.88,21.2L0,38.09v7.63L2.34,48H9l4-4V42h2l3-3V37h2l2-2V33h2l2-2.17A16,16,0,0,0,43.31,4.69ZM23.56,32H21v2.59L19.59,36H17v2.59L14.59,41H12v2.59L8.59,47H2.75L1.46,45.75,18.34,28.87l-.71-.71L1,44.79V38.5L17.27,22.23a15.75,15.75,0,0,0,3.42,5.08A15.93,15.93,0,0,0,25,30.39Zm19.05-5.39a15,15,0,1,1,0-21.22A14.93,14.93,0,0,1,42.61,26.61Z" fill="#a1adb3"/>
</svg>
`;

const SERVER_SIGN_CLIENT = `
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <path d="M33.8,6a7.2,7.2,0,0,1,5.75,11.54L29.46,7.45A7.17,7.17,0,0,1,33.8,6m0-1A8.18,8.18,0,0,0,28,7.4L39.6,19A8.2,8.2,0,0,0,33.8,5Z" fill="#a1adb3"/>
    <path d="M43.31,4.69A16,16,0,0,0,16.88,21.2L0,38.09v7.63L2.34,48H9l4-4V42h2l3-3V37h2l2-2V33h2l2-2.17A16,16,0,0,0,43.31,4.69ZM23.56,32H21v2.59L19.59,36H17v2.59L14.59,41H12v2.59L8.59,47H2.75L1.46,45.75,18.34,28.87l-.71-.71L1,44.79V38.5L17.27,22.23a15.75,15.75,0,0,0,3.42,5.08A15.93,15.93,0,0,0,25,30.39Zm19.05-5.39a15,15,0,1,1,0-21.22A14.93,14.93,0,0,1,42.61,26.61Z" fill="#a1adb3"/>
    <path d="M33.21,22h9.58A2.19,2.19,0,0,1,45,24.17V45.83A2.19,2.19,0,0,1,42.79,48H33.21A2.19,2.19,0,0,1,31,45.83V24.17A2.19,2.19,0,0,1,33.21,22Z" fill="#0077d5" fill-rule="evenodd"/>
    <path d="M43,23H40a1,1,0,0,1-1,1H37a1,1,0,0,1-1-1H33a1,1,0,0,0-1,1V46a1,1,0,0,0,1,1H43a1,1,0,0,0,1-1V24A1,1,0,0,0,43,23Z" fill="#fff" fill-rule="evenodd"/>
</svg>
`;

const SERVER_SIGN_SERVER = `
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <path d="M33.8,6a7.2,7.2,0,0,1,5.75,11.54L29.46,7.45A7.17,7.17,0,0,1,33.8,6m0-1A8.18,8.18,0,0,0,28,7.4L39.6,19A8.2,8.2,0,0,0,33.8,5Z" fill="#a1adb3"/>
    <path d="M43.31,4.69A16,16,0,0,0,16.88,21.2L0,38.09v7.63L2.34,48H9l4-4V42h2l3-3V37h2l2-2V33h2l2-2.17A16,16,0,0,0,43.31,4.69ZM23.56,32H21v2.59L19.59,36H17v2.59L14.59,41H12v2.59L8.59,47H2.75L1.46,45.75,18.34,28.87l-.71-.71L1,44.79V38.5L17.27,22.23a15.75,15.75,0,0,0,3.42,5.08A15.93,15.93,0,0,0,25,30.39Zm19.05-5.39a15,15,0,1,1,0-21.22A14.93,14.93,0,0,1,42.61,26.61Z" fill="#a1adb3"/>
    <path d="M36.1,29a7.35,7.35,0,0,0-6,3,4.68,4.68,0,0,0-.91-.09,5.42,5.42,0,0,0-3.58,1.34,5.71,5.71,0,0,0-1.75,2.92c-1.78.94-2.9,3.53-2.9,5.6,0,3,2.41,6.22,5.37,6.22H42.58c3,0,5.42-3.44,5.42-6.47a5.71,5.71,0,0,0-4.5-5.67,8,8,0,0,0-2.19-4.64A7.41,7.41,0,0,0,36.1,29Z" fill="#fff"/>
    <path d="M43.5,35.86a8,8,0,0,0-2.19-4.64A7.37,7.37,0,0,0,36.1,29H36a7.36,7.36,0,0,0-5.88,3h-.08a4.67,4.67,0,0,0-.83-.08h0a5.42,5.42,0,0,0-3.56,1.34,5.71,5.71,0,0,0-1.75,2.92c-1.78.94-2.9,3.53-2.9,5.6,0,3,2.41,6.22,5.37,6.22H42.58c3,0,5.42-3.44,5.42-6.47A5.71,5.71,0,0,0,43.5,35.86ZM42.58,47H26.37C23.91,47,22,44.19,22,41.78c0-1.67.9-3.94,2.37-4.72l.39-.21.11-.43A4.6,4.6,0,0,1,26.31,34a4.42,4.42,0,0,1,2.9-1.1,4.91,4.91,0,0,1,.66.06,4.47,4.47,0,0,1,3.21,2.61l.92-.4a5.74,5.74,0,0,0-.64-1.1,5.41,5.41,0,0,0-2.21-1.73A6.28,6.28,0,0,1,36,30h.07v0a6.37,6.37,0,0,1,4.51,1.92,7.05,7.05,0,0,1,1.88,3.91A5.42,5.42,0,0,0,38.6,38l.8.6A4.48,4.48,0,0,1,43,36.8h0l.34.06A4.69,4.69,0,0,1,47,41.53C47,44,45,47,42.58,47Z" fill="#ff2922"/>
</svg>
`;

const ANGARA = `
<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" width="24" height="24" viewBox="0 0 24 24" xml:space="preserve">
    <defs>
        <clipPath id="SVGID_2_">
            <rect height="24" overflow="visible" width="24"/>
        </clipPath>
    </defs>
    <g clip-path="url(#SVGID_2_)">
        <polygon fill="#e6e6e6" points="19.3 9.3 14.7 4.6 19.3 0 24 4.7"/>
        <rect fill="#b3b3b3" height="1.4" transform="matrix(.7074 .7068 -.7068 .7074 7.7248 -11.9939)" width="1.4" x="17.6" y="2.6"/>
        <rect fill="#b3b3b3" height="1.4" transform="matrix(.7074 .7068 -.7068 .7074 10.0573 -12.9618)" width="1.4" x="20" y="5"/>
        <path d="M 20.2 9.5 l -5.7 -5.6 c -.1 -.1 -.2 -.1 -.3 0 L 1.3 17.3 l -1 .3 L 0 18 l 6 6 l .3 -.3 l .3 -1 L 20.2 9.8 C 20.3 9.7 20.3 9.6 20.2 9.5 z M 3.7 19 c -.4 .4 -1 .4 -1.3 0 s -.4 -1 0 -1.3 s 1 -.4 1.3 0 S 4 18.6 3.7 19 z" fill="#1460cc"/>
        <path d="M 6.6 22.8 l 0 -.1 l 1.1 -1.1 L 7.2 21 c -.9 -.9 -2.2 -1.1 -3.3 -.5 L 3 21 l 3 3 l .3 -.3 L 6.6 22.8 L 6.6 22.8 z" fill="#104ea6"/>
        <path d="M 9.4 15 l -.3 .3 l .5 .5 l .3 -.3 c 0 0 .1 -.1 -.1 -.3 C 9.6 14.8 9.4 15 9.4 15 z" fill="#104ea6"/>
        <path d="M 8.6 14.2 l -.3 .3 l .4 .4 L 9 14.6 c 0 0 .2 -.1 0 -.3 C 8.7 14.1 8.6 14.2 8.6 14.2 z" fill="#104ea6"/>
        <path d="M 14 6.7 L 5.7 15 L 9 18.3 l 8.3 -8.3 L 14 6.7 z M 11.8 10.3 l 0 .8 l -.4 -.4 L 11.8 10.3 z M 9.5 12.5 l 0 .8 l -.4 -.4 L 9.5 12.5 z M 10.5 15.6 l -1.1 1.1 l -2 -2 l 1 -1 c 0 0 .5 -.4 1 .1 c 0 0 .3 .3 .1 .7 v 0 c 0 0 .4 -.3 .9 .1 C 10.4 14.6 10.9 15.1 10.5 15.6 z M 11.1 14.9 l -1.4 -1.4 l -.1 -1.1 l 2 2 L 11.1 14.9 z M 11.9 14.1 l -2 -2 l 1.2 -1.2 l .3 .3 L 10.8 12 l .5 .5 l .7 -.7 l .4 .4 l -.7 .7 l .8 .8 L 11.9 14.1 z M 13.4 12.7 L 12 11.2 l -.1 -1.1 l 2 2 L 13.4 12.7 z M 13 9.8 l -.5 .5 l -.4 -.4 l 1.5 -1.5 L 14 8.8 l -.5 .5 l 1.6 1.6 l -.5 .5 L 13 9.8 z" fill="#104ea6"/>
    </g>
</svg>
`;

const CRYPTOKENEP = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <defs>
        <clipPath id="clip-path">
            <rect fill="none" height="24" width="24"/>
        </clipPath>
    </defs>
    <g clip-path="url(#clip-path)">
        <path d="M 12.92 18.58 a 5.69 5.69 0 0 0 -7.5 -7.5 l -.28 -.28 L 3.67 12.26 a 5.71 5.71 0 0 0 8.07 8.07 l 1.46 -1.47 Z M 5.5 18.5 a 2.6 2.6 0 0 1 0 -3.67 L 9.17 18.5 A 2.6 2.6 0 0 1 5.5 18.5 Z" fill="#2eb976"/>
        <rect fill="#666666" height="8.3" transform="matrix(.70710678 -.70710678 .70710678 .70710678 -.47 13.86)" width="7.26" x="12.87" y="3.35"/>
        <rect fill="#808080" height="1.55" transform="matrix(.70784687 -.70636591 .70636591 .70784687 .24 12.64)" width="1.55" x="14.62" y="5.26"/>
        <rect fill="#808080" height="1.55" transform="matrix(.70784687 -.70636591 .70636591 .70784687 -.82 15.2)" width="1.55" x="17.19" y="7.82"/>
        <rect fill="#4d4d4d" height="11.41" transform="matrix(.70710678 -.70710678 .70710678 .70710678 -4.87 12.04)" width="9.33" x="7.44" y="6.2"/>
    </g>
</svg>
`;

const FILE = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <defs>
        <clipPath id="clip-path">
            <rect fill="none" height="24" width="24"/>
        </clipPath>
    </defs>
    <g clip-path="url(#clip-path)">
        <path d="M 24 6 H 8 V 3 H 0 V 9.45 l 24 0 Z" fill="#e6c22f"/>
        <path d="M 0 24 V 8.25 H 24 V 24 Z" fill="#f9d333"/>
    </g>
</svg>
`;

const JACARTA = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <defs>
        <clipPath id="clip-path">
            <rect fill="none" height="24" width="24"/>
        </clipPath>
    </defs>
    <g clip-path="url(#clip-path)">
        <path d="M 12.92 18.58 a 5.69 5.69 0 0 0 -7.5 -7.5 l -.28 -.28 L 3.67 12.26 a 5.71 5.71 0 0 0 8.07 8.07 l 1.46 -1.47 Z M 5.5 18.5 a 2.6 2.6 0 0 1 0 -3.67 L 9.17 18.5 A 2.6 2.6 0 0 1 5.5 18.5 Z" fill="#2eb976"/>
        <rect fill="#666666" height="8.3" transform="matrix(.70710678 -.70710678 .70710678 .70710678 -.47 13.86)" width="7.26" x="12.87" y="3.35"/>
        <rect fill="#808080" height="1.55" transform="matrix(.70784687 -.70636591 .70636591 .70784687 .24 12.64)" width="1.55" x="14.62" y="5.26"/>
        <rect fill="#808080" height="1.55" transform="matrix(.70784687 -.70636591 .70636591 .70784687 -.82 15.2)" width="1.55" x="17.19" y="7.82"/>
        <rect fill="#4d4d4d" height="11.41" transform="matrix(.70710678 -.70710678 .70710678 .70710678 -4.87 12.04)" width="9.33" x="7.44" y="6.2"/>
    </g>
</svg>
`;

const JACARTA_2 = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <defs>
        <clipPath id="clip-path">
            <rect fill="none" height="24" width="24"/>
        </clipPath>
    </defs>
    <g clip-path="url(#clip-path)">
        <path d="M 12.92 18.58 a 5.69 5.69 0 0 0 -7.5 -7.5 l -.28 -.28 L 3.67 12.26 a 5.71 5.71 0 0 0 8.07 8.07 l 1.46 -1.47 Z M 5.5 18.5 a 2.6 2.6 0 0 1 0 -3.67 L 9.17 18.5 A 2.6 2.6 0 0 1 5.5 18.5 Z" fill="#ff8d18"/>
        <rect fill="#666666" height="8.3" transform="matrix(.70710678 -.70710678 .70710678 .70710678 -.47 13.86)" width="7.26" x="12.87" y="3.35"/>
        <rect fill="#808080" height="1.55" transform="matrix(.70636591 .70784687 -.70784687 .70636591 8.79 -9.13)" width="1.55" x="14.62" y="5.26"/>
        <rect fill="#808080" height="1.55" transform="matrix(.70636591 .70784687 -.70784687 .70636591 11.36 -10.19)" width="1.55" x="17.19" y="7.82"/>
        <rect fill="#4d4d4d" height="9.33" transform="matrix(.70710678 .70710678 -.70710678 .70710678 11.96 -5.07)" width="11.41" x="6.4" y="7.23"/>
    </g>
</svg>
`;

const MACTOKEN = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <defs>
        <style>
            .cls-1{fill:none;}.cls-2{clip-path:url(#clip-path);}.cls-3{fill:#ccc;}.cls-4{fill:#ececec;}.cls-5{fill:#fafafa;}.cls-6,.cls-7{fill:#3c3c3b;}.cls-11,.cls-7{fill-rule:evenodd;}.cls-8{fill:#bec8ce;}.cls-9{fill:#43aa34;}.cls-10{fill:#e52d27;}.cls-11{fill:#8a9399;}
        </style>
        <clipPath id="clip-path">
            <rect class="cls-1" width="24" height="24"/>
        </clipPath>
    </defs>
    <g class="cls-2">
        <rect class="cls-3" y="8" width="24" height="16" rx="1" ry="1"/>
        <rect class="cls-4" y="3" width="24" height="20" rx="1" ry="1"/>
        <circle class="cls-5" cx="12" cy="20" r="2"/>
        <rect class="cls-5" x="4" y="19" width="2" height="2" rx="0.27" ry="0.27"/>
        <rect class="cls-5" x="16" y="19" width="2" height="2" rx="0.2" ry="0.2"/>
        <path class="cls-6" d="M17.5,20.24h-1a0,0,0,0,1,0,0l.47-.45s0,0,0,0,0,0,0,0l.47.45A0,0,0,0,1,17.5,20.24Z"/>
        <rect class="cls-5" x="19" y="19" width="2" height="2" rx="0.2" ry="0.2"/>
        <path class="cls-6" d="M20.5,20.24h-1a0,0,0,0,1,0,0l.47-.45s0,0,0,0,0,0,0,0l.47.45A0,0,0,0,1,20.5,20.24Z"/>
        <path class="cls-7" d="M10.74,4.65a.29.29,0,0,0,.2-.28A.32.32,0,0,0,10.66,4H10V5.3h.68A.35.35,0,0,0,11,5a.29.29,0,0,0-.24-.31Zm-.41-.41h.19s.08,0,.08.15-.09.12-.09.12h-.18V4.24Zm.2.82h-.2V4.77h.21s.08,0,.08.16-.09.13-.09.13Zm1.07.24V4h.8v.23h-.48v.31h.44v.24h-.44V5.3Zm1.42-1V4h1v.24h-.34v1h-.33v-1ZM11.11,4v.27L11.35,4Zm.33,0-.33.37V5.3h.33V4Zm1.11,0v.27L12.79,4Zm.33,0-.33.37V5.3h.33V4Z"/>
        <rect class="cls-8" x="2" y="6" width="20" height="11" rx="1" ry="1"/>
        <path class="cls-9" d="M13.06,19.39l-.18-.18a.09.09,0,0,0-.13,0l-1,1-.47-.46a.09.09,0,0,0-.13,0l-.18.18a.1.1,0,0,0,0,.13l.53.53h0l.18.18a.1.1,0,0,0,.14,0l.18-.18h0l1.09-1.09A.1.1,0,0,0,13.06,19.39Z"/>
        <path class="cls-10" d="M5.18,20l.3-.31a0,0,0,0,0,0-.08l-.09-.09a0,0,0,0,0-.08,0l-.31.3-.31-.3a0,0,0,0,0-.08,0l-.09.09a0,0,0,0,0,0,.08l.3.31-.3.31a0,0,0,0,0,0,.08l.09.09a0,0,0,0,0,.08,0l.31-.3.31.3a0,0,0,0,0,.08,0l.09-.09a0,0,0,0,0,0-.08Z"/>
        <path class="cls-11" d="M7,11.51a1.12,1.12,0,0,0,.8-1.09A1.27,1.27,0,0,0,6.65,9H4v5H6.73a1.33,1.33,0,0,0,1.18-1.29,1.13,1.13,0,0,0-1-1.2ZM5.31,9.91h.76s.31,0,.31.6S6,11,6,11H5.31V9.91Zm.8,3.18h-.8V12h.85s.33,0,.3.62-.35.51-.35.51Zm4.3.91V9h3.18v.87H11.67v1.22h1.77V12H11.67v2Zm5.68-4V9H20V10H18.62v4H17.31V10ZM8.45,9v1.05L9.42,9ZM9.76,9,8.45,10.42V14H9.76V9Zm4.45,0v1.05l1-1.05Zm1.3,0-1.3,1.42V14h1.3V9Z"/>
    </g>
</svg>
`;

const MSKEY5 = `
<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" width="24" height="24" viewBox="0 0 24 24" xml:space="preserve">
    <defs>
        <clipPath id="SVGID_2_">
            <rect height="24" overflow="visible" width="24"/>
        </clipPath>
    </defs>
    <g clip-path="url(#SVGID_2_)">
        <polygon fill="#e6e6e6" points="18.2 11.2 12.9 5.8 18.7 0 24 5.3"/>
        <rect fill="#b3b3b3" height="1.4" transform="matrix(.7069 -.7073 .7073 .7069 2.7075 13.8306)" width="1.4" x="17.3" y="2.9"/>
        <rect fill="#b3b3b3" height="1.4" transform="matrix(.7069 -.7073 .7073 .7069 1.7461 16.1546)" width="1.4" x="19.7" y="5.3"/>
        <path d="M 4.3 23.4 l -3.6 -3.6 c -.8 -.8 -.8 -2.2 0 -3 L 14.1 3.3 l 6.6 6.6 L 7.3 23.4 C 6.4 24.2 5.1 24.2 4.3 23.4 z" fill="#c72026"/>
        <path d="M 4 22.4 l -2.7 -2.7 C 1 19.4 1 19 1.2 18.8 l .1 -.1 c .3 -.3 .7 -.3 .9 0 L 5 21.4 c .3 .3 .3 .7 0 .9 l -.1 .1 C 4.6 22.7 4.2 22.7 4 22.4 z" fill="#801518"/>
        <rect fill="#801518" height="5.6" transform="matrix(.7073 -.7069 .7069 .7073 -6.4015 11.4055)" width="12.7" x="4.2" y="10.6"/>
    </g>
</svg>
`;

const RUTOKEN = `
<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" width="24" height="24" viewBox="0 0 24 24" xml:space="preserve">
    <defs>
        <clipPath id="SVGID_2_">
            <rect height="24" overflow="visible" width="24"/>
        </clipPath>
    </defs>
    <g clip-path="url(#SVGID_2_)">
        <polygon fill="#e6e6e6" points="17.7 12 12.1 6.3 18.3 0 24 5.7"/>
        <polygon fill="#b3b3b3" points="17.6 5 16.5 3.9 17.6 2.8 18.7 3.9"/>
        <polygon fill="#b3b3b3" points="20.1 7.5 19 6.4 20.1 5.3 21.2 6.4"/>
        <path d="M 13.3 3.6 l -9.6 9.6 c -2.5 2.5 -5.1 7.7 -2.8 10 s 7.4 -.3 10 -2.8 l 9.6 -9.6 L 13.3 3.6 z M 7.6 20.7 c -1.6 1.4 -3.6 2 -4.9 1.8 c -.1 0 -.2 0 -.2 -.1 c -.1 0 -.1 0 -.2 -.1 c -.2 -.1 -.3 -.2 -.4 -.2 c -.1 -.1 -.2 -.2 -.2 -.4 c 0 -.1 0 -.1 -.1 -.2 c 0 -.1 0 -.1 -.1 -.2 c -.2 -1.2 .4 -3.2 1.8 -4.9 c .2 -.2 .5 -.2 .7 0 l 3.5 3.5 C 7.8 20.1 7.8 20.5 7.6 20.7 z" fill="#f55a4f"/>
        <path d="M 4.1 16.4 c -.2 -.2 -.5 -.2 -.7 0 c -1.4 1.6 -2 3.6 -1.8 4.9 c 0 -.1 0 -.2 0 -.3 c 0 -.3 .1 -.7 .3 -1.2 l 1.9 .5 l .5 1.9 c -.4 .2 -.8 .3 -1.2 .3 c -.1 0 -.2 0 -.3 0 C 4 22.7 6 22.1 7.6 20.7 c .2 -.2 .2 -.5 0 -.7 L 4.1 16.4 z" fill="#cc4a42"/>
        <path d="M 8.8 18.9 l -3.7 -3.7 c -.2 -.2 -.2 -.4 0 -.6 l 8 -8 c .2 -.2 .4 -.2 .6 0 l 3.7 3.7 c .2 .2 .2 .4 0 .6 l -8 8 C 9.2 19.1 8.9 19.1 8.8 18.9 z" fill="#cc4a42"/>
    </g>
</svg>
`;

const RUTOKEN_2 = `
<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" width="24" height="24" viewBox="0 0 24 24" xml:space="preserve">
    <defs>
        <clipPath id="SVGID_2_">
            <rect height="24" overflow="visible" width="24"/>
        </clipPath>
    </defs>
    <g clip-path="url(#SVGID_2_)">
        <polygon fill="#e6e6e6" points="17.7 12 12.1 6.3 18.3 0 24 5.7"/>
        <polygon fill="#b3b3b3" points="17.6 5 16.5 3.9 17.6 2.8 18.7 3.9"/>
        <polygon fill="#b3b3b3" points="20.1 7.5 19 6.4 20.1 5.3 21.2 6.4"/>
        <path d="M 13.3 3.6 l -9.6 9.6 c -2.5 2.5 -5.1 7.7 -2.8 10 s 7.4 -.3 10 -2.8 l 9.6 -9.6 L 13.3 3.6 z M 7.6 20.7 c -1.6 1.4 -3.6 2 -4.9 1.8 c -.1 0 -.2 0 -.2 -.1 c -.1 0 -.1 0 -.2 -.1 c -.2 -.1 -.3 -.2 -.4 -.2 c -.1 -.1 -.2 -.2 -.2 -.4 c 0 -.1 0 -.1 -.1 -.2 c 0 -.1 0 -.1 -.1 -.2 c -.2 -1.2 .4 -3.2 1.8 -4.9 c .2 -.2 .5 -.2 .7 0 l 3.5 3.5 C 7.8 20.1 7.8 20.5 7.6 20.7 z" fill="#00a1f2"/>
        <path d="M 4.1 16.4 c -.2 -.2 -.5 -.2 -.7 0 c -1.4 1.6 -2 3.6 -1.8 4.9 c 0 -.1 0 -.2 0 -.3 c 0 -.3 .1 -.7 .3 -1.2 l 1.9 .5 l .5 1.9 c -.4 .2 -.8 .3 -1.2 .3 c -.1 0 -.2 0 -.3 0 C 4 22.7 6 22.1 7.6 20.7 c .2 -.2 .2 -.5 0 -.7 L 4.1 16.4 z" fill="#0090d9"/>
        <path d="M 8.8 18.9 l -3.7 -3.7 c -.2 -.2 -.2 -.4 0 -.6 l 8 -8 c .2 -.2 .4 -.2 .6 0 l 3.7 3.7 c .2 .2 .2 .4 0 .6 l -8 8 C 9.2 19.1 8.9 19.1 8.8 18.9 z" fill="#0090d9"/>
    </g>
</svg>
`;

const IBANK2KEY = `
<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" width="24" height="24" viewBox="0 0 24 24" xml:space="preserve">
    <defs>
        <clipPath id="SVGID_2_">
            <rect height="24" overflow="visible" width="24"/>
        </clipPath>
    </defs>
    <g clip-path="url(#SVGID_2_)">
        <polygon fill="#e6e6e6" points="19.3 9.3 14.7 4.6 19.3 0 24 4.7"/>
        <rect fill="#b3b3b3" height="1.4" transform="matrix(.7074 .7068 -.7068 .7074 7.7248 -11.9939)" width="1.4" x="17.6" y="2.6"/>
        <rect fill="#b3b3b3" height="1.4" transform="matrix(.7074 .7068 -.7068 .7074 10.0573 -12.9618)" width="1.4" x="20" y="5"/>
        <path d="M 20.2 9.5 l -5.7 -5.6 c -.1 -.1 -.2 -.1 -.3 0 L 1.3 17.3 l -1 .3 L 0 18 l 6 6 l .3 -.3 l .3 -1 L 20.2 9.8 C 20.3 9.7 20.3 9.6 20.2 9.5 z M 3.7 19 c -.4 .4 -1 .4 -1.3 0 s -.4 -1 0 -1.3 s 1 -.4 1.3 0 S 4 18.6 3.7 19 z" fill="#1460cc"/>
        <path d="M 6.6 22.8 l 0 -.1 l 1.1 -1.1 L 7.2 21 c -.9 -.9 -2.2 -1.1 -3.3 -.5 L 3 21 l 3 3 l .3 -.3 L 6.6 22.8 L 6.6 22.8 z" fill="#104ea6"/>
        <path d="M 9.4 15 l -.3 .3 l .5 .5 l .3 -.3 c 0 0 .1 -.1 -.1 -.3 C 9.6 14.8 9.4 15 9.4 15 z" fill="#104ea6"/>
        <path d="M 8.6 14.2 l -.3 .3 l .4 .4 L 9 14.6 c 0 0 .2 -.1 0 -.3 C 8.7 14.1 8.6 14.2 8.6 14.2 z" fill="#104ea6"/>
        <path d="M 14 6.7 L 5.7 15 L 9 18.3 l 8.3 -8.3 L 14 6.7 z M 11.8 10.3 l 0 .8 l -.4 -.4 L 11.8 10.3 z M 9.5 12.5 l 0 .8 l -.4 -.4 L 9.5 12.5 z M 10.5 15.6 l -1.1 1.1 l -2 -2 l 1 -1 c 0 0 .5 -.4 1 .1 c 0 0 .3 .3 .1 .7 v 0 c 0 0 .4 -.3 .9 .1 C 10.4 14.6 10.9 15.1 10.5 15.6 z M 11.1 14.9 l -1.4 -1.4 l -.1 -1.1 l 2 2 L 11.1 14.9 z M 11.9 14.1 l -2 -2 l 1.2 -1.2 l .3 .3 L 10.8 12 l .5 .5 l .7 -.7 l .4 .4 l -.7 .7 l .8 .8 L 11.9 14.1 z M 13.4 12.7 L 12 11.2 l -.1 -1.1 l 2 2 L 13.4 12.7 z M 13 9.8 l -.5 .5 l -.4 -.4 l 1.5 -1.5 L 14 8.8 l -.5 .5 l 1.6 1.6 l -.5 .5 L 13 9.8 z" fill="#104ea6"/>
    </g>
</svg>
`;

const ACTIVE = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20">
    <defs>
        <clipPath id="clip-path">
            <rect fill="none" height="20" width="20"/>
        </clipPath>
    </defs>
    <g clip-path="url(#clip-path)">
        <circle cx="10" cy="10" fill="#66cc00" r="10"/>
        <polygon fill="#ffffff" points="8.56 14 5 10.25 6.47 8.86 8.59 11.08 14.55 5 16 6.42 8.56 14"/>
    </g>
</svg>
`;

const BLOCKED = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20">
    <defs>
        <clipPath id="clip-path">
            <rect fill="none" height="20" width="20"/>
        </clipPath>
    </defs>
    <g clip-path="url(#clip-path)">
        <circle cx="10" cy="10" fill="#ff3333" r="10"/>
        <path d="M 14 9 V 8.44 A 4.24 4.24 0 0 0 10 4 A 4.24 4.24 0 0 0 6 8.44 V 9 H 5 v 6 H 15 V 9 Z M 8 8.44 A 2.26 2.26 0 0 1 10 6 a 2.26 2.26 0 0 1 2 2.44 V 9 H 8 Z"
              fill="#ffffff"/>
        <rect fill="none" height="20" width="20"/>
    </g>
</svg>
`;

const CONFIRMATION = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20">
    <defs>
        <clipPath id="clip-path">
            <rect fill="none" height="20" width="20"/>
        </clipPath>
    </defs>
    <g clip-path="url(#clip-path)">
        <circle cx="10" cy="10" fill="#cccccc" r="10"/>
        <rect fill="none" height="20" width="20"/>
        <rect fill="#ffffff" height="2" width="2" x="9" y="14"/>
        <path d="M 9 13 a 5.35 5.35 0 0 1 .23 -1.73 A 3.39 3.39 0 0 1 10.07 10 a 4.81 4.81 0 0 0 .8 -1 a 1.88 1.88 0 0 0 .2 -.83 c 0 -.88 -.35 -1.32 -1 -1.32 a 1 1 0 0 0 -.79 .36 a 1.5 1.5 0 0 0 -.31 1 H 7 a 3.25 3.25 0 0 1 .82 -2.32 A 2.93 2.93 0 0 1 10 5 a 2.93 2.93 0 0 1 2.19 .8 A 3.08 3.08 0 0 1 13 8.05 a 3.14 3.14 0 0 1 -.25 1.25 a 5.3 5.3 0 0 1 -.89 1.3 l -.54 .6 a 2.24 2.24 0 0 0 -.58 1.33 l 0 .47 Z"
              fill="#ffffff"/>
    </g>
</svg>
`;

const EXPIRED = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20">
    <defs>
        <clipPath id="clip-path">
            <rect fill="none" height="20" width="20"/>
        </clipPath>
    </defs>
    <g clip-path="url(#clip-path)">
        <circle cx="10" cy="10" fill="#ff3333" r="10"/>
        <polygon fill="#ffffff" points="15 6.3 13.7 5 10 8.7 6.3 5 5 6.3 8.7 10 5 13.7 6.3 15 10 11.3 13.7 15 15 13.7 11.3 10 15 6.3"/>
    </g>
</svg>
`;

const NEARLY_EXPIRED = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20">
    <defs>
        <clipPath id="clip-path">
            <rect fill="none" height="20" width="20"/>
        </clipPath>
    </defs>
    <g clip-path="url(#clip-path)">
        <circle cx="10" cy="10" fill="#ff8a2c" r="10"/>
        <rect fill="#ffffff" height="8" width="2" x="9" y="4"/>
        <rect fill="#ffffff" height="2" width="2" x="9" y="14"/>
    </g>
</svg>
`;

const WITHDRAWN = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20">
    <path d="M 10 0 A 10 10 0 1 0 20 10 A 10 10 0 0 0 10 0 Z M 2 10 A 7.94 7.94 0 0 1 3.71 5.07 L 14.93 16.29 A 8 8 0 0 1 2 10 Z m 14.29 4.93 L 5.07 3.71 A 8 8 0 0 1 16.29 14.93 Z"
          fill="#ff3333"/>
</svg>
`;

const ALL_IMAGES = {
    // Основная картинка типа хранилища
    CERTIFICATE, CERTIFICATE_CRYPTO_PRO, CERTIFICATE_SIGNAL_COM, EPKEY, SERVER_SIGN_CLIENT, SERVER_SIGN_SERVER,
    // Дополнительная картинка типа хранилища
    ANGARA, CRYPTOKENEP, FILE, IBANK2KEY, JACARTA, JACARTA_2, MACTOKEN,
    MSKEY5, RUTOKEN, RUTOKEN_2,
    // статусы ЭП
    ACTIVE, BLOCKED, CONFIRMATION, EXPIRED, NEARLY_EXPIRED, WITHDRAWN
};