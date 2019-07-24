import {AutoIncrement, BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import {Provider} from "./Provider";
import {User} from "./User";

/** Отзыв о блюде */
@Table({modelName: "menu_item_reviews"})
export class MenuItemReview extends Model<MenuItemReview> {

    /** Идентификатор отзыва */
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    /** Название блюда */
    @Column
    menu_item_name: string;

    /** Отзыв */
    @Column
    review: string;

    /** Рейтинг */
    @Column
    rating: number;

    /** Идентификатор поставщиека */
    @ForeignKey(() => Provider)
    @Column
    provider_id: number;

    /** Идентификатор пользователя */
    @ForeignKey(() => User)
    @Column
    user_id: number;

    /** Пользователь */
    @BelongsTo(() => User)
    user: User;
}
