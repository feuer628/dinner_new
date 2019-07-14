import {AutoIncrement, BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import {OrgGroup} from "./OrgGroup";

@Table({modelName: "organizations"})
export class Organization extends Model<Organization> {

    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;

    @Column
    public name: string;

    @Column
    public to_name: string |null;

    @ForeignKey(() => OrgGroup)
    @Column
    group_id: number;

    @BelongsTo(() => OrgGroup)
    group: OrgGroup;
}
