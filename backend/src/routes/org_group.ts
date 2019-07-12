import {Router} from 'express';
import {OrgGroup} from "../db/models/OrgGroup";
import {Organization} from "../db/models/Organization";

export const org_group = Router();

org_group.post('/', async (req, res, next) => {
    try {
        const org = await OrgGroup.create(req.body);
        res.status(201).json(org);
    } catch (e) {
        next(e);
    }
});

org_group.get('', async (req, res, next) => {
    try {
        res.json(await OrgGroup.scope(req.query['scope']).findAll());
    } catch (e) {
        next(e);
    }
});

org_group.get('/full', async (req, res, next) => {
    try {
        res.json(await OrgGroup.scope(req.query['scope']).findAll({include: [Organization]}));
    } catch (e) {
        next(e);
    }
});

org_group.get('/:id', async (req, res, next) => {
    try {
        const org = await OrgGroup.scope(req.query['scope']).findByPk(req.params['id']);
        res.json(org);
    } catch (e) {
        next(e);
    }
});

org_group.get('/:id/full', async (req, res, next) => {
    try {
        const org = await OrgGroup.scope(req.query['scope']).findByPk(req.params['id'], {include: [Organization]});
        res.json(org);
    } catch (e) {
        next(e);
    }
});

org_group.put('/:id', async (req, res, next) => {
    try {
        await OrgGroup.update<OrgGroup>(req.body, {where: {id: req.params['id']}});
        res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});