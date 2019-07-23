import {AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import {Provider} from "./Provider";

@Table({modelName: "menu_items"})
export class MenuItem extends Model<MenuItem> {

    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @ForeignKey(() => Provider)
    @Column
    provider_id: number;

    @Column
    menu_date: Date;

    @Column
    type: string;

    @Column
    name: string;

    @Column
    weight: string;

    @Column
    price: number;

    @Column
    description: string;
}
