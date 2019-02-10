/**
 * Компонент отображения qr-кодов
 * https://github.com/theomessin/vue-qriously/blob/master/dist/vue-qriously.js
 */
declare class QRCode  {
    static CorrectLevel: any[number];
    constructor(el: HTMLElement, options: any);
}

declare module "qr-code" {
    export default QRCode;
}