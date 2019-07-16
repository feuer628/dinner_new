import {AutoIncrement, BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import {Provider} from "./Provider";
import {User} from "./User";

@Table({modelName: "provider_reviews"})
export class ProviderReview extends Model<ProviderReview> {

    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    review: string;

    @Column
    rating: number;

    @ForeignKey(() => Provider)
    @Column
    provider_id: number;

    @ForeignKey(() => User)
    @Column
    user_id: number;

    @BelongsTo(() => User)
    user: User;
}
