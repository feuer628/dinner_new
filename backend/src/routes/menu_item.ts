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

menu_item.get('', async (req, res, next) => {
    try {
        res.json(await MenuItem.scope(req.query['scope']).findAll({where: {menu_date: {[Op.ne]: null}}, order: ["id"]}));
    } catch (e) {
        next(e);
    }
});

menu_item.get('/:id', async (req, res, next) => {
    try {
        const provider = await MenuItem.scope(req.query['scope']).findByPk(req.params['id']);
        res.json(provider);
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