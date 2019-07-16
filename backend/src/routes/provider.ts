import {Router} from 'express';
import {Provider} from "../db/models/Provider";
import {ProviderReview} from "../db/models/ProviderReview";
import {OrgGroup} from "../db/models/OrgGroup";

export const provider = Router();

provider.post('/', async (req, res, next) => {
    try {
        const provider = await Provider.create(req.body);
        res.status(201).json(provider);
    } catch (e) {
        next(e);
    }
});

provider.get('', async (req, res, next) => {
    try {
        res.json(await Provider.scope(req.query['scope']).findAll({order: ["id"]}));
    } catch (e) {
        next(e);
    }
});

provider.get('/:id', async (req, res, next) => {
    try {
        const provider = await Provider.scope(req.query['scope']).findByPk(req.params['id']);
        res.json(provider);
    } catch (e) {
        next(e);
    }
});

provider.get('/:id/reviews', async (req, res, next) => {
    try {
        res.json(await ProviderReview.scope(req.query['scope']).findAll({where: {provider_id: req.params['id']} ,order: ["id"]}));
    } catch (e) {
        next(e);
    }
});

provider.put('/:id', async (req, res, next) => {
    try {
        await Provider.update<Provider>(req.body, {where: {id: req.params['id']}});
        res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});