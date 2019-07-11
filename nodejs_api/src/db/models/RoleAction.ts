import {Column, ForeignKey, Model, Table} from "sequelize-typescript";
import {Role} from "./Role";
import {Action} from "./Action";

@Table({modelName: "role_actions"})
export class RoleAction extends Model<RoleAction> {

    @ForeignKey(() => Role)
    @Column
    roleId: number;

    @ForeignKey(() => Action)
    @Column
    actionId: number;
}