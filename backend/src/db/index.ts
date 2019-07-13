import {Sequelize} from 'sequelize-typescript';
import {LOG} from "../app";
import {Role} from "./models/Role";
import {RoleAction} from "./models/RoleAction";
import {Action} from "./models/Action";
import {Organization} from "./models/Organization";
import {OrgGroup} from "./models/OrgGroup";

export function init() {
    LOG.info("Инициализация моделей. Начало.");
    LOG.info("Подключение к БД");
    const sequelize = new Sequelize({
        database: process.env.DB_DATABASE,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT),
        dialect: 'postgres',
        storage: ':memory:'
    });
    LOG.info("Инициализация моделей");
    sequelize.addModels([Role, Action, RoleAction, Organization, OrgGroup]);
    LOG.info("Инициализация моделей. Конец.")
}


