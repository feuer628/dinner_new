import {AutoIncrement, BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import {Organization} from "./Organization";
import {Role} from "./Role";

@Table({modelName: "users"})
export class User extends Model<User> {

    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    login: string;

    @Column
    password: string;

    @Column
    balance: number;

    @Column
    description: string;

    @Column
    birthday: Date;

    @Column
    phone: string;

    @ForeignKey(() => Organization)
    @Column
    org_id: string;

    @ForeignKey(() => Role)
    @Column
    role_id: string;

    @BelongsTo(() => Role)
    role: Role;

    @Column
    status: number;

    @Column
    key: string;

    @Column
    ip: string;

    @Column
    comp_key: string;

    @Column
    ip_phone: string;

    @Column
    from_text: string;

    @Column
    telegram_id: number;

    @Column
    created_at: number;

    @Column
    updated_at: number;
}