import {AutoIncrement, Column, ForeignKey, HasMany, Model, PrimaryKey, Table} from "sequelize-typescript";
import {Organization} from "./Organization";

@Table({modelName: "org_groups"})
export class OrgGroup extends Model<OrgGroup> {

    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    limit_type: number;

    @Column
    limit: number;

    @Column
    name: string;

    @Column
    description: string;

    // TODO ForeignKey!
    @Column
    provider_id: string;

    @HasMany(() => Organization)
    orgs: Organization[];
}
