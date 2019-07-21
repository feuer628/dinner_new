import {Router} from 'express';
import {User} from "../db/models/User";
import {compareSync} from "bcryptjs";
import {sign} from "jsonwebtoken";

export const sign_in = Router();

sign_in.post('/', async (req, res, next) => {
    try {
        console.log(req.body);
        const login = req.body.login;
        const user = await User.findOne({where: {login}});
        if (!user) {
            return res.status(404).send('Пользователя с таким логином не найдено.');
        }
        const password = req.body.password;
        const passwordIsValid = compareSync(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).send({ auth: false, token: null });
        }
        // Генерируем токен на 24 часа
        const token = sign({ id: user.id }, process.env.AUTH_SECRET, {expiresIn: 86400});
        res.status(200).send({auth: true, token: token});
    } catch (e) {
        next(e);
    }
});