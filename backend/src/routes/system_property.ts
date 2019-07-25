import {Router} from 'express';
import {SystemProperty} from "../db/models/SystemProperty";

export const system_property = Router();

system_property.post('/', async (req, res, next) => {
    try {
        const prop = await SystemProperty.create(req.body);
        res.status(201).json(prop);
    } catch (e) {
        next(e);
    }
});

system_property.get('', async (req, res, next) => {
    try {
        res.json(await SystemProperty.scope(req.query['scope']).findAll());
    } catch (e) {
        next(e);
    }
});

system_property.get('/:name', async (req, res, next) => {
    try {
        const role = await SystemProperty.scope(req.query['scope']).findByPk(req.params['name']);
        res.json(role);
    } catch (e) {
        next(e);
    }
});

system_property.delete('/:name', async (req, res, next) => {
    try {
        await SystemProperty.destroy({where: {name: req.params['name']}});
        res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});