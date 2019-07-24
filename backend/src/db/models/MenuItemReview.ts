import {AutoIncrement, BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import {Provider} from "./Provider";
import {User} from "./User";

/** ����� � ����� */
@Table({modelName: "menu_item_reviews"})
export class MenuItemReview extends Model<MenuItemReview> {

    /** ������������� ������ */
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    /** �������� ����� */
    @Column
    menu_item_name: string;

    /** ����� */
    @Column
    review: string;

    /** ������� */
    @Column
    rating: number;

    /** ������������� ����������� */
    @ForeignKey(() => Provider)
    @Column
    provider_id: number;

    /** ������������� ������������ */
    @ForeignKey(() => User)
    @Column
    user_id: number;

    /** ������������ */
    @BelongsTo(() => User)
    user: User;
}
