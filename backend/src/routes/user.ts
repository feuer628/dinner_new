import {Router} from 'express';
import {User} from "../db/models/User";
import {Role} from "../db/models/Role";
import {OrgGroup} from "../db/models/OrgGroup";
import {Organization} from "../db/models/Organization";
import {Action} from "../db/models/Action";
import {hashSync} from "bcryptjs";
import {sign, verify, VerifyErrors} from "jsonwebtoken";

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
        let token = <string> req.headers['x-access-token'];
        if (!token) {
            return res.status(401).send({ auth: false, message: 'No token provided.' });
        }
        verify(token, process.env.AUTH_SECRET, function(err: VerifyErrors, decoded: string | object) {
            if (err) {
                return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
            }
            res.status(200).send(decoded);
        });
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