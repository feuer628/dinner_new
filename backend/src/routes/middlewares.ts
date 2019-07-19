import {verify, VerifyErrors} from "jsonwebtoken";
import {NextFunction, Request, Response} from "express-serve-static-core";
import {User} from "../db/models/User";
import {Role} from "../db/models/Role";
import {Action} from "../db/models/Action";
import {RoleActions} from "../db/enums";

/**
 * Проверка аутентификации клиента
 * @param req  запрос
 * @param res  ответ сервера
 * @param next обработчик перехода
 */
export function verifyToken(req: Request, res: Response, next: NextFunction) {
    // Получаем токен из заголовка
    const token = <string> req.headers['x-access-token'];
    if (!token) {
        return res.status(403).send({ auth: false, message: 'Не было предоставлено токена.' });
    }
    // Проверяем токен на актуальность
    verify(token, process.env.AUTH_SECRET, (err: VerifyErrors, decoded: DecodedType) => {
        if (err) {
            return res.status(500).send({ auth: false, message: 'Ошибка при аутентификации токена.' });
        }
        // Кладем в запрос userId, используем дальше по своему усмотрению
        (<any> req).userId = decoded.id;
        // Переходим дальше
        next();
    });
}

/**
 * Проверка прав админа
 * @param req  запрос
 * @param res  ответ сервера
 * @param next обработчик перехода
 */
export function checkAdminRights(req: Request, res: Response, next: NextFunction) {
    const userId = (<any>req).userId;
    User.findByPk(userId, {attributes: ["id", "role_id"], include: [{model: Role, include: [Action]}]}).then(user => {
        const action = user.role.actions.find(a => a.id === RoleActions.SYSTEM_ADMIN);
        if (!action) {
            return res.status(403).send({ auth: false, message: 'Нет прав на доступ.' });
        }
        next();
    });
}

type DecodedType = {
    id: string;
    iat: number;
    exp: number;
}