import {AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import {Order} from "./Order";

/** Позиция заказа */
@Table({modelName: "order_items"})
export class OrderItem extends Model<OrderItem> {

    /** Идентификатор позиции заказа */
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    /** Идентификатор заказа */
    @ForeignKey(() => Order)
    @Column
    order_id: number;

    /** Название блюда */
    @Column
    name: string;

    /** Комментарий к позиции */
    @Column
    comment: string;

    /** Количество */
    @Column
    count: number;

    /** Цена */
    @Column
    price: number;
}