import {Table, Column, Model, BelongsToMany, PrimaryKey, AutoIncrement} from 'sequelize-typescript';
import {RoleAction} from "./RoleAction";
import {Action} from "./Action";

@Table({modelName: "roles"})
export class Role extends Model<Role> {

    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    name: string;

    @BelongsToMany(() => Action, () => RoleAction)
    actions: Action[];

}


