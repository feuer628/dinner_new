import {Column, Model, PrimaryKey, Table} from "sequelize-typescript";

@Table({modelName: "system_properties"})
export class SystemProperty extends Model<SystemProperty> {

    @PrimaryKey
    @Column
    name: string;

    @Column
    value: string;
}
