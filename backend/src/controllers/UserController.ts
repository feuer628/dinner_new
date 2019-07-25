import {Request, Response} from "express-serve-static-core";
import {User} from "../db/models/User";
import {Organization} from "../db/models/Organization";
import {OrgGroup} from "../db/models/OrgGroup";

/**
 * Контроллер для пользователя
 */
export class UserController {

    /**
     * Конструктор
     * @param req запрос
     * @param res ответ сервера
     */
    constructor(private req: Request, private res: Response) {
    }

    /**
     * Получает полную информацию об аутентифицированном пользователе
     */
    async getFullAuthUserInfo(): Promise<User> {
        return this.getUserInfo((<any> this.req).userId);
    }

    /**
     * Получает группу организации, к которой привязан пользователь, или null
     */
    async getAuthUserGroup(): Promise<OrgGroup> {
        const user = await this.getUserInfo((<any> this.req).userId);
        if (user.organization && user.organization.group) {
            return user.organization.group;
        }
        return null;
    }

    private async getUserInfo(userId: string) {
        return await User.findByPk(userId, {include: [{model: Organization, include: [OrgGroup]}]});
    }
}