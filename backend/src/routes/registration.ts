import {Router} from 'express';
import {User} from "../db/models/User";
import {hashSync} from "bcryptjs";
import {sign} from "jsonwebtoken";

export const registration = Router();

registration.post('/', async (req, res, next) => {
    try {
        const requestData = req.body;
        const hashedPassword = hashSync(requestData.password, 8);

        const userAttributes = {
            login: requestData.login,
            password: hashedPassword,
            phone: requestData.phone,
            org_id: requestData.org_id,
            role_id: 1
        };

        const user = await User.create(userAttributes);

        // Генерируем токен на 24 часа
        const token = sign({id: user.id}, process.env.AUTH_SECRET, {expiresIn: 86400});
        res.status(200).send({auth: true, token: token});
    } catch (e) {
        next(e);
    }
});