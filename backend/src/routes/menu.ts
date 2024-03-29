import {Router} from 'express';
import xlsx from 'node-xlsx';
import {MenuItem} from "../db/models/MenuItem";
import {User} from "../db/models/User";
import {Organization} from "../db/models/Organization";
import {Role} from "../db/models/Role";
import {Action} from "../db/models/Action";
import {OrgGroup} from "../db/models/OrgGroup";
import {UserController} from "../controllers/UserController";

export const menu = Router();

const DAYS = ["понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье"];
const EXCLUSIONS = ["бренд-шеф", "меню"];

menu.post('/upload', async (req, res, next) => {
    try {
        const menuFile = (<any> req).files.menu;

        await menuFile.mv(`${__dirname}/menu.xlsx`);

        // const workSheetsFromBuffer = xlsx.parse(menuFile);
        const workSheetsFromFile = xlsx.parse(`${__dirname}/menu.xlsx`);
        // будем считать, что меню только на одном, первом, листе
        const firstSheet = workSheetsFromFile[0];

        // текущий день недели при парсинге меню
        let currentWeekday: number;
        // текущий тип блюда при парсинге меню
        let currentType: string;
        // признак начала непосредственно блока меню
        let startBlockOfMenu = false;
        // меню по дням недели, 1 - понедельник
        const menuByDates: {[key: string]: MenuItem[]} = {
            1: [],
            2: [],
            3: [],
            4: [],
            5: [],
            6: [],
            7: [],
        };
        firstSheet.data.forEach((item: any[]) => {
            if (item.length === 1) {
                const trash = EXCLUSIONS.find(s => String(item[0]).toLowerCase().trim().includes(s));
                if (trash) {
                    // console.log("НАЙДЕН МУСОР!: " + trash);
                    return false;
                }
                const weekDay = DAYS.find(s => s === String(item[0]).toLowerCase().trim());
                if (!!weekDay) {
                    // console.log("НАЙДЕН ДЕНЬ НЕДЕЛИ!: " + (<string> item[0]).toLowerCase().trim());
                    if (weekDay === "понедельник") {
                        startBlockOfMenu = true;
                    }
                    currentWeekday = getDayIndex(weekDay);
                    return false;
                }
                if (startBlockOfMenu) {
                    currentType = String(item[0]).toLowerCase().trim().replace(/(,\s*|\s+)/g, ' ');
                    // console.log("НАЙДЕН НОВЫЙ ТИП БЛЮД!: " + currentType);
                    return false;
                }
            }
            if (item.length === 3) {
                if (String(item[1]).toLowerCase().trim() === "вес" && String(item[2]).toLowerCase().trim() === "цена") {
                    // console.log("НАЙДЕН ТИП БЛЮДА!: " + (<string> item[0]).toLowerCase().trim());
                    currentType = String(item[0]).toLowerCase().trim().replace(/(,\s*|\s+)/g, ' ');
                    return false;
                }
                if ((<string> item[0]).toLowerCase().trim() === "хлеб") {
                    // console.log("НАЙДЕН ХЛЕБ! ПРОПУСКАЕМ ХЛЕБ");
                    return false;
                }
                if (item.filter(i => i === null).length === 0) {
                    // console.log("НАШЛИ БЛЮДО! ТИП: " + currentType + ", ДЕНЬ НЕДЕЛИ: " + currentWeekday + ", НАЗВАНИЕ: " + (<string> item[0]).toLowerCase().trim());
                    menuByDates[currentWeekday].push(new MenuItem({
                        name: String(item[0]).toLowerCase().trim().split(" ").filter(i => i.length > 0).join(" "),
                        type: currentType,
                        weight: String(item[1]).toLowerCase().trim(),
                        price: Number(item[2].replace("-",".").toLowerCase().trim())
                    }));
                    return true;
                }
            }
            return false;
        });

        // удаляем дни без позиций по меню
        for (let key in menuByDates) {
            if (menuByDates[key].length === 0) {
                delete menuByDates[key];
            }
        }

        res.status(201).json(menuByDates);
    } catch (e) {
        next(e);
    }
});

menu.post('/confirm', async (req, res, next) => {
    try {
        const user = await User.findByPk((<any> req).userId, {include: [{model: Role, include: [Action]}, {model: Organization, include: [OrgGroup]}]});
        if (!user.organization) {
            return res.status(500).send("Пользователь не принадлежит организации");
        }
        if (!user.organization.group) {
            return res.status(500).send("Организация не связана ни с какой группой");
        }
        if (!user.organization.group.provider_id) {
            return res.status(500).send("Группа организаций не связани ни с каким поставщиком");
        }
        const provider_id = user.organization.group.provider_id;

        const everydayItems = <any[]> req.body.everydayItems;
        const menuByDates = <{[key: string]: any[]}> req.body.menuByDates;

        for (const key of Object.keys(menuByDates)) {
            const menu_date = menuByDates[key][0].menu_date;
            for (const menuByDateElement of menuByDates[key]) {
                await MenuItem.create({provider_id, ...menuByDateElement})
            }
            for (const everydayItem of everydayItems) {
                await MenuItem.create({
                    menu_date,
                    provider_id,
                    name: everydayItem.name,
                    type: everydayItem.type,
                    weight: everydayItem.weight,
                    price: everydayItem.price,
                })
            }
        }


        res.sendStatus(201);
    } catch (e) {
        next(e);
    }
});

menu.post('/templates', async (req, res, next) => {
    try {
        const controller = new UserController(req, res);
        const orgGroup = await controller.getAuthUserGroup();
        if (!orgGroup.provider_id) {
            return res.status(422).send("Группа организаций не привязана к поставщику");
        }
        const attrs = {provider_id: orgGroup.provider_id, ...req.body};
        for (const field of ["name", "type", "price", "weight"]) {
            if (attrs[field] === null || attrs[field] === undefined) {
                return res.status(500).send(`Не заполнены обязательное поле (${field})`);
            }
        }
        const item = await MenuItem.create(attrs);
        res.status(201).json(item);
    } catch (e) {
        next(e);
    }
});

menu.get('/templates', async (req, res, next) => {
    try {
        const controller = new UserController(req, res);
        const orgGroup = await controller.getAuthUserGroup();
        if (!orgGroup.provider_id) {
            return res.status(422).send("Группа организаций не привязана к поставщику");
        }
        res.json(await MenuItem.scope(req.query['scope']).findAll({where: {provider_id: orgGroup.provider_id, menu_date: null}, order: ["id"]}));
    } catch (e) {
        next(e);
    }
});

menu.put('/templates/:id', async (req, res, next) => {
    try {
        const templateId = req.params['id'];
        const item = await MenuItem.findByPk(templateId);
        if (!item) {
            return res.status(404).send("Не найдена позиция стаким ID");
        }
        item.name = req.body.name;
        item.price = req.body.price;
        item.type = req.body.type;
        item.description = req.body.description;
        item.weight = req.body.weight;
        await item.save();
        res.sendStatus(201);
    } catch (e) {
        next(e);
    }
});

menu.delete('/templates/:id', async (req, res, next) => {
    try {
        await MenuItem.destroy({where: {id: req.params['id']}});
        res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});

function getDayIndex(weekday: string) {
    switch (weekday) {
        case "понедельник":
            return 1;
        case "вторник":
            return 2;
        case "среда":
            return 3;
        case "четверг":
            return 4;
        case "пятница":
            return 5;
        case "суббота":
            return 6;
        case "воскресенье":
            return 7;
        default:
            return 0;
    }
}