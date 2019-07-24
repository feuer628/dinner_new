import {Sequelize} from 'sequelize-typescript';
import {LOG} from "../app";
import {Role} from "./models/Role";
import {RoleAction} from "./models/RoleAction";
import {Action} from "./models/Action";
import {Organization} from "./models/Organization";
import {OrgGroup} from "./models/OrgGroup";
import {Provider} from "./models/Provider";
import {ProviderReview} from "./models/ProviderReview";
import {SystemProperty} from "./models/SystemProperty";
import {User} from "./models/User";
import {MenuItem} from "./models/MenuItem";
import {OrderItem} from "./models/OrderItem";
import {Order} from "./models/Order";
import {BalanceHistory} from "./models/BalanceHistory";
import {MenuItemReview} from "./models/MenuItemReview";

export function init() {
    LOG.info("Инициализация моделей. Начало.");
    LOG.info("Подключение к БД");
    const sequelize = new Sequelize({
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT),
        dialect: 'postgres',
        storage: ':memory:'
    });
    LOG.info("Инициализация моделей");
    sequelize.addModels([
        Role, Action, RoleAction, Organization, OrgGroup, Provider, ProviderReview,
        SystemProperty, User, MenuItem, Order, OrderItem, BalanceHistory, MenuItemReview
    ]);
    LOG.info("Инициализация моделей. Конец.")
}


