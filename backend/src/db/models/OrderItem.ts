import {AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import {Order} from "./Order";

@Table({modelName: "order_items"})
export class OrderItem extends Model<OrderItem> {

    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @ForeignKey(() => Order)
    @Column
    order_id: number;

    @Column
    name: string;

    @Column
    comment: string;

    @Column
    count: number;

    @Column
    price: number;

    @Column
    rating: number;

    @Column
    review: string;
}