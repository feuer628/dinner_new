import {AutoIncrement, BelongsToMany, Column, Model, PrimaryKey, Table} from "sequelize-typescript";
import {Role} from "./Role";
import {RoleAction} from "./RoleAction";

@Table({modelName: "actions"})
export class Action extends Model<Action> {

    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    desc: string;

    @BelongsToMany(() => Role, () => RoleAction)
    roles: Role[];
}
