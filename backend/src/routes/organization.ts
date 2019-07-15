import {Router} from 'express';
import {Organization} from "../db/models/Organization";
import {OrgGroup} from "../db/models/OrgGroup";

export const organization = Router();

organization.post('/', async (req, res, next) => {
    try {
        const org = await Organization.create(req.body);
        res.status(201).json(org);
    } catch (e) {
        next(e);
    }
});

organization.get('', async (req, res, next) => {
    try {
        res.json(await Organization.scope(req.query['scope']).findAll({order: ['id']}));
    } catch (e) {
        next(e);
    }
});

organization.get('/full', async (req, res, next) => {
    try {
        res.json(await Organization.scope(req.query['scope']).findAll({include: [OrgGroup], order: ['id']}));
    } catch (e) {
        next(e);
    }
});


organization.get('/:id', async (req, res, next) => {
    try {
        const org = await Organization.scope(req.query['scope']).findByPk(req.params['id']);
        res.json(org);
    } catch (e) {
        next(e);
    }
});

organization.get('/:id/full', async (req, res, next) => {
    try {
        const org = await Organization.scope(req.query['scope']).findByPk(req.params['id'], {include: [OrgGroup]});
        res.json(org);
    } catch (e) {
        next(e);
    }
});

organization.put('/:id', async (req, res, next) => {
    try {
        await Organization.update<Organization>(req.body, {where: {id: req.params['id']}});
        res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});

organization.delete('/:id', async (req, res, next) => {
    try {
        await Organization.destroy({where: {id: req.params['id']}});
        res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});