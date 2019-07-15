import {Router} from 'express';
import {OrgGroup} from "../db/models/OrgGroup";
import {Organization} from "../db/models/Organization";

export const org_group = Router();

org_group.post('/', async (req, res, next) => {
    try {
        const clientOrgs = <Organization[]> req.body.orgs;
        const createdGroup = await OrgGroup.create(req.body);
        const group = await OrgGroup.scope(req.query['scope']).findByPk(createdGroup.id, {include: [Organization]});
        for (const clientOrg of clientOrgs) {
            if (!group.orgs || !group.orgs.find(o => o.id === clientOrg.id)) {
                const dbOrg = await Organization.scope(req.query['scope']).findByPk(clientOrg.id);
                dbOrg.group_id = group.id;
                await dbOrg.save();
            }
        }
        res.status(201).json(group);
    } catch (e) {
        next(e);
    }
});

org_group.get('', async (req, res, next) => {
    try {
        res.json(await OrgGroup.scope(req.query['scope']).findAll({order: ["id"]}));
    } catch (e) {
        next(e);
    }
});

org_group.get('/full', async (req, res, next) => {
    try {
        res.json(await OrgGroup.scope(req.query['scope']).findAll({include: [Organization], order: ["id"]}));
    } catch (e) {
        next(e);
    }
});

org_group.get('/:id', async (req, res, next) => {
    try {
        const group = await OrgGroup.scope(req.query['scope']).findByPk(req.params['id']);
        res.json(group);
    } catch (e) {
        next(e);
    }
});

org_group.get('/:id/full', async (req, res, next) => {
    try {
        const group = await OrgGroup.scope(req.query['scope']).findByPk(req.params['id'], {include: [Organization]});
        res.json(group);
    } catch (e) {
        next(e);
    }
});

org_group.put('/:id', async (req, res, next) => {
    try {
        const groupId = req.params['id'];
        const clientOrgs = <Organization[]> req.body.orgs;
        const group = await OrgGroup.scope(req.query['scope']).findByPk(req.params['id'], {include: [Organization]});
        for (const org of group.orgs) {
            if (!clientOrgs.find(o => o.id === org.id)) {
                org.group_id = null;
                await org.save();
            }
        }
        for (const clientOrg of clientOrgs) {
            if (!group.orgs.find(o => o.id === clientOrg.id)) {
                const dbOrg = await Organization.scope(req.query['scope']).findByPk(clientOrg.id);
                dbOrg.group_id = groupId;
                await dbOrg.save();
            }
        }
        await OrgGroup.update<OrgGroup>(req.body, {where: {id: groupId}});

        res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});

org_group.delete('/:id', async (req, res, next) => {
    try {
        await OrgGroup.destroy({where: {id: req.params['id']}});
        res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});