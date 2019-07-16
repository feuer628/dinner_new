import {AutoIncrement, Column, ForeignKey, HasMany, Model, PrimaryKey, Table} from "sequelize-typescript";
import {User} from "./User";
import {OrderItem} from "./OrderItem";

@Table({modelName: "orders"})
export class Order extends Model<Order> {

    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @ForeignKey(() => User)
    @Column
    user_id: number;

    @Column
    status: number;

    @Column
    order_date: Date;

    @Column
    created_at: number;

    @Column
    updated_at: number;

    @HasMany(() => OrderItem)
    orderItems: OrderItem[];
}