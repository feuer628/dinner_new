import {AutoIncrement, BelongsTo, Column, ForeignKey, HasMany, Model, PrimaryKey, Table} from "sequelize-typescript";
import {Organization} from "./Organization";
import {Provider} from "./Provider";

@Table({modelName: "org_groups"})
export class OrgGroup extends Model<OrgGroup> {

    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    limit_type: number;

    @Column
    compensation_flag: boolean;

    @Column
    limit: number;

    @Column
    hard_limit: number;

    @Column
    name: string;

    @Column
    description: string;

    @ForeignKey(() => Provider)
    @Column
    provider_id: string;

    @BelongsTo(() => Provider)
    provider: Provider;

    @HasMany(() => Organization)
    orgs: Organization[];
}
