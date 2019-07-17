import {verify, VerifyErrors} from "jsonwebtoken";
import {NextFunction, Request, Response} from "express-serve-static-core";

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

type DecodedType = {
    id: string;
    iat: number;
    exp: number;
}