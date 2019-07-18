import {Router} from 'express';
import {Order} from "../db/models/Order";
import {OrderItem} from "../db/models/OrderItem";

export const order = Router();

order.post('/', async (req, res, next) => {
    try {
        const order = await Order.create({
            user_id: (<any> req).userId,
            order_date: req.body.order_date
        });
        for (const orderItem of (<any[]>req.body.items)) {
            await OrderItem.create({
                order_id: order.id,
                name: orderItem.item.name,
                count: orderItem.count,
                price: orderItem.item.price,
                comment: orderItem.comment
            })
        }
        res.status(201).json({id: order.id});
    } catch (e) {
        next(e);
    }
});

order.get('', async (req, res, next) => {
    try {
        res.json(await Order.scope(req.query['scope']).findAll({order: ["id"]}));
    } catch (e) {
        next(e);
    }
});

order.get('/:id', async (req, res, next) => {
    try {
        const provider = await Order.scope(req.query['scope']).findByPk(req.params['id'], {include: [OrderItem]});
        res.json(provider);
    } catch (e) {
        next(e);
    }
});

order.get('/date/:order_date', async (req, res, next) => {
    try {
        const order = await Order.scope(req.query['scope']).findOne({
            where: {order_date: new Date(req.params['order_date']), user_id: (<any> req).userId},
            include: [OrderItem]
        });
        res.json(order);
    } catch (e) {
        next(e);
    }
});


order.put('/:id', async (req, res, next) => {
    try {
        await Order.update<Order>(req.body, {where: {id: req.params['id']}});
        res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});