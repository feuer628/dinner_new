import {Router} from 'express';
import {MenuItem} from "../db/models/MenuItem";
import {Op} from "sequelize";

export const menu_item = Router();

menu_item.post('/', async (req, res, next) => {
    try {
        const provider = await MenuItem.create(req.body);
        res.status(201).json(provider);
    } catch (e) {
        next(e);
    }
});

menu_item.get('/dates', async (req, res, next) => {
    try {
        const menuDates = await MenuItem.findAll({raw: true, where: {menu_date: {[Op.gte]: new Date()}}, attributes: ["menu_date"], group: ["menu_date"], order: ["menu_date"]});
        res.json(menuDates.map(i => i.menu_date));
    } catch (e) {
        next(e);
    }
});

menu_item.get('/date/:menu_date', async (req, res, next) => {
    try {
        const items = await MenuItem.findAll({
            raw: true,
            where: {menu_date: req.params['menu_date']},
            attributes: ["name", "type", "weight", "price", "description"]
        });
        res.json(items);
    } catch (e) {
        next(e);
    }
});

menu_item.get('', async (req, res, next) => {
    try {
        const tabs: any[] = [];
        const menuDates = await MenuItem.findAll({raw: true, where: {menu_date: {[Op.gte]: new Date()}}, attributes: ["menu_date"], group: ["menu_date"], order: ["menu_date"]});
        const dates = menuDates.map(i => i.menu_date);

        const menuItems = await MenuItem.findAll({raw: true, where: {menu_date: {[Op.in]: dates}}, order: ["id"]});
        dates.forEach(async (menu_date: string) => {
            tabs.push({
                name: menu_date,
                items: menuItems.filter(m => m.menu_date === menu_date),
                current: [],
                orderConfirmed: false,
                needShowMenu: true
            });
        });

        res.json(tabs);
    } catch (e) {
        next(e);
    }
});

menu_item.get('/:id', async (req, res, next) => {
    try {
        const menuItem = await MenuItem.scope(req.query['scope']).findByPk(req.params['id']);
        res.json(menuItem);
    } catch (e) {
        next(e);
    }
});

menu_item.put('/:id', async (req, res, next) => {
    try {
        await MenuItem.update<MenuItem>(req.body, {where: {id: req.params['id']}});
        res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});