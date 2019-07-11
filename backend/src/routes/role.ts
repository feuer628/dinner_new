import {Router} from 'express';
import {Role} from "../db/models/Role";

export const role = Router();

role.post('/', async (req, res, next) => {
    try {
        const movie = await Role.create(req.body);
        res.status(201).json(movie);
    } catch (e) {
        next(e);
    }
});

role.get('', async (req, res, next) => {
    try {
        res.json(await Role.scope(req.query['scope']).findAll());
    } catch (e) {
        next(e);
    }
});

role.get('/:id', async (req, res, next) => {
    try {
        const movie = await Role.scope(req.query['scope']).findByPk(req.params['id']);
        res.json(movie);
    } catch (e) {
        next(e);
    }
});

role.put('/:id', async (req, res, next) => {
    try {
        await Role.update<Role>(req.body, {where: {id: req.params['id']}});
        res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});