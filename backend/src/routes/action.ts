import {Router} from 'express';
import {Action} from "../db/models/Action";

export const action = Router();

action.post('/', async (req, res, next) => {
    try {
        const movie = await Action.create(req.body);
        res.status(201).json(movie);
    } catch (e) {
        next(e);
    }
});

action.get('', async (req, res, next) => {
    try {
        res.json(await Action.scope(req.query['scope']).findAll());
    } catch (e) {
        next(e);
    }
});

action.get('/:id', async (req, res, next) => {
    try {
        const movie = await Action.scope(req.query['scope']).findByPk(req.params['id']);
        res.json(movie);
    } catch (e) {
        next(e);
    }
});

action.put('/:id', async (req, res, next) => {
    try {
        await Action.update<Action>(req.body, {where: {id: req.params['id']}});
        res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});