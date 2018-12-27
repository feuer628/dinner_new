/**
 * Настройки для заказа.
 * Структура данных:
 * {
 *     orderType: prepayment|postpay,
 *     limit:<сумма лимита>
 * }
 */
export default class SettingsService {

    public static settings: SettingsInfo;

    public static loadSettings() {
        this.settings = {
            orderType: OrderType.POSTPAY,
            limit: 200
        };
    }
}

export interface SettingsInfo {
    orderType: OrderType;
    limit?: number;
}

export enum OrderType {
    POSTPAY,
    PREPAYMENT
}