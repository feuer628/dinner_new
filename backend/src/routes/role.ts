import {Router} from 'express';
import {Role} from "../db/models/Role";
import {Action} from "../db/models/Action";
import {RoleAction} from "../db/models/RoleAction";

export const role = Router();

role.post('/', async (req, res, next) => {
    try {
        const role = await Role.create(req.body);
        res.status(201).json(role);
    } catch (e) {
        next(e);
    }
});

role.patch('/:id/assoc/:actionId', async (req, res, next) => {
    try {
        const roleActions = await RoleAction.scope(req.query['scope']).findAll({where: {role_id: req.params['id'], action_id: req.params['actionId']}});
        console.log(roleActions);
        if (roleActions.length) {
            roleActions.every(async roleAction => {
                await roleAction.destroy();
            });
        } else {
            await RoleAction.create({role_id: req.params['id'], action_id: req.params['actionId']});
        }
        res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});

role.get('', async (req, res, next) => {
    try {
        res.json(await Role.scope(req.query['scope']).findAll({include: [Action], order: ['id']}));
    } catch (e) {
        next(e);
    }
});

role.get('/:id', async (req, res, next) => {
    try {
        const role = await Role.scope(req.query['scope']).findByPk(req.params['id']);
        res.json(role);
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

role.delete('/:id', async (req, res, next) => {
    try {
        const roleActions = await RoleAction.scope(req.query['scope']).findAll({where: {role_id: req.params['id']}});
        roleActions.every(async roleAction => {
            await roleAction.destroy();
        });
        const role = await Role.scope(req.query['scope']).findByPk(req.params['id']);
        await role.destroy();
        res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});