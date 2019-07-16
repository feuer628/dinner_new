import {AutoIncrement, Column, HasMany, Model, PrimaryKey, Table} from "sequelize-typescript";
import {ProviderReview} from "./ProviderReview";

@Table({modelName: "providers"})
export class Provider extends Model<Provider> {

    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    name: string;

    @Column
    emails: string;

    @Column
    description: string;

    @Column
    url: string;

    @Column
    logo: string;

    @HasMany(() => ProviderReview)
    reviews: ProviderReview[];
}
