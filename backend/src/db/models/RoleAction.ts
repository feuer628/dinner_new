import {AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import {Role} from "./Role";
import {Action} from "./Action";

@Table({modelName: "role_actions"})
export class RoleAction extends Model<RoleAction> {

    @AutoIncrement
    @PrimaryKey
    @Column
    id: number;

    @ForeignKey(() => Role)
    @Column
    role_id: number;

    @ForeignKey(() => Action)
    @Column({})
    action_id: number;
}