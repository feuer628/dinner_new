import {Router} from 'express';
import {Provider} from "../db/models/Provider";
import {ProviderReview} from "../db/models/ProviderReview";
import {checkAdminRights, checkConfirmUser} from "./middlewares";

export const provider = Router();

provider.post('/', checkAdminRights, async (req, res, next) => {
    try {
        const provider = await Provider.create(req.body);
        res.status(201).json(provider);
    } catch (e) {
        next(e);
    }
});

provider.get('', checkAdminRights, async (req, res, next) => {
    try {
        res.json(await Provider.scope(req.query['scope']).findAll({order: ["id"]}));
    } catch (e) {
        next(e);
    }
});

provider.get('/:id', checkConfirmUser, async (req, res, next) => {
    try {
        const provider = await Provider.scope(req.query['scope']).findByPk(req.params['id']);
        res.json(provider);
    } catch (e) {
        next(e);
    }
});

provider.get('/:id/reviews', checkConfirmUser, async (req, res, next) => {
    try {
        res.json(await ProviderReview.scope(req.query['scope']).findAll({where: {provider_id: req.params['id']} ,order: ["id"]}));
    } catch (e) {
        next(e);
    }
});

provider.put('/:id', checkAdminRights, async (req, res, next) => {
    try {
        await Provider.update<Provider>(req.body, {where: {id: req.params['id']}});
        res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});