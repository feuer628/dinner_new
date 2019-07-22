import {Router} from 'express';
import xlsx from 'node-xlsx';
import {MenuItem} from "../db/models/MenuItem";

export const menu = Router();

menu.post('/upload', async (req, res, next) => {
    try {
        const menuFile = (<any> req).files.menu;

        await menuFile.mv(`${__dirname}/menu.xlsx`);

        // const workSheetsFromBuffer = xlsx.parse(menuFile);
        const workSheetsFromFile = xlsx.parse(`${__dirname}/menu.xlsx`);

        res.status(201).json(workSheetsFromFile[0]);
    } catch (e) {
        next(e);
    }
});

menu.get('/templates', async (req, res, next) => {
    try {
        res.json(await MenuItem.scope(req.query['scope']).findAll({where: {menu_date: null}, order: ["id"]}));
    } catch (e) {
        next(e);
    }
});