import {Router} from 'express';
import {User} from "../db/models/User";
import {Role} from "../db/models/Role";
import {OrgGroup} from "../db/models/OrgGroup";
import {Organization} from "../db/models/Organization";
import {Action} from "../db/models/Action";

export const user = Router();

user.post('/', async (req, res, next) => {
    try {
        const org = await User.create(req.body);
        res.status(201).json(org);
    } catch (e) {
        next(e);
    }
});

user.get('', async (req, res, next) => {
    try {
        res.json(await User.scope(req.query['scope']).findAll({order: ['id']}));
    } catch (e) {
        next(e);
    }
});

user.get('/:id', async (req, res, next) => {
    try {
        const org = await User.scope(req.query['scope']).findByPk(req.params['id'], {include: [{model: Role, include: [Action]}, {model: Organization, include: [OrgGroup]}]});
        res.json(org);
    } catch (e) {
        next(e);
    }
});

user.put('/:id', async (req, res, next) => {
    try {
        await User.update<User>(req.body, {where: {id: req.params['id']}});
        res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});