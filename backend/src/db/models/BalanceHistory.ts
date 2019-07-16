import {AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import {Order} from "./Order";
import {User} from "./User";

@Table({modelName: "balance_history"})
export class BalanceHistory extends Model<BalanceHistory> {

    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @ForeignKey(() => User)
    @Column
    user_id: number;

    @Column
    amount: number;

    @ForeignKey(() => Order)
    @Column
    order_id: number;

    @Column
    created_at: number;
}