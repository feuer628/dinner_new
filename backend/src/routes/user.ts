import {Router} from "express";
import {User} from "../db/models/User";
import {Role} from "../db/models/Role";
import {OrgGroup} from "../db/models/OrgGroup";
import {Organization} from "../db/models/Organization";
import {Action} from "../db/models/Action";
import {MenuItemReview} from "../db/models/MenuItemReview";
import {hashSync} from "bcryptjs";
import {sign} from "jsonwebtoken";
import {checkAdminRights} from "./middlewares";
import {Status} from "../db/enums";

export const user = Router();

user.post('/', async (req, res, next) => {
    try {
        const requestData = req.body;
        const hashedPassword = hashSync(requestData.password, 8);

        const userAtts = {
            login: requestData.login,
            password: hashedPassword,
            phone: requestData.phone,
            org_id: requestData.org_id,
            role_id: 1
        };

        const user = await User.create(userAtts);

        const token = sign({id: user.id}, process.env.AUTH_SECRET, {
            expiresIn: 86400 // expires in 24 hours
        });
        res.status(200).send({auth: true, token: token});
    } catch (e) {
        next(e);
    }
});

user.get('/me', async (req, res, next) => {
    try {
        const user = await User.findOne({where: {id: (<any> req).userId}, include: [{model: Role, include: [Action]}, {model: Organization, include: [OrgGroup]}]});
        if (!user) {
            return res.status(404).send("Пользователь не найден");
        }
        user.password = null;
        res.status(200).send(user);
    } catch (e) {
        next(e);
    }
});

user.put('/me', async (req, res, next) => {
    try {
        await User.update<User>(req.body, {where: {id: (<any> req).userId}});
        res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});

user.get('', checkAdminRights, async (req, res, next) => {
    try {
        res.json(await User.scope(req.query['scope']).findAll({order: ['id']}));
    } catch (e) {
        next(e);
    }
});

user.get('/new', checkAdminRights, async (req, res, next) => {
    try {
        res.json(await User.scope(req.query['scope']).findAll({where: {status: Status.NEW}, order: ['id']}));
    } catch (e) {
        next(e);
    }
});

/**
 * Получение отзывов текущего пользователя
 */
user.get('/reviews', async (req, res, next) => {
    try {
        const user = await User.findOne({where: {id: (<any> req).userId}, include: [{model: Organization, include: [OrgGroup]}]});
        res.json(await MenuItemReview.scope(req.query['scope']).findAll({where: {provider_id: user.organization.group.provider_id}, order: ["id"]}));
    } catch (e) {
        next(e);
    }
});

user.get('/:id', checkAdminRights, async (req, res, next) => {
    try {
        const org = await User.scope(req.query['scope']).findByPk(req.params['id'], {include: [{model: Role, include: [Action]}, {model: Organization, include: [OrgGroup]}]});
        res.json(org);
    } catch (e) {
        next(e);
    }
});

user.put('/:id', checkAdminRights, async (req, res, next) => {
    try {
        await User.update<User>(req.body, {where: {id: req.params['id']}});
        res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});