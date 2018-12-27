/**
 * Сервис для получения информации о сотруднике
 */
export default class EmployeeServices {

    public static employeeInfo: EmployeeInfo;

    public static loadEmployeeInfo() {
        console.log("запрос информации о текущем пользователе ");
        this.employeeInfo = {
            id: "1",
            fio: "F I O",
            mail: "test@mail.ru",
            balance: 500
        };
    }

    public static getNotLoadedEmployees(date: string): EmployeeInfo[] {
        console.log("запрос товарищей который не заказали обеды на " + date);
        return [
            {
                id: "1",
                fio: "FIO",
                mail: "test@mail.ru",
                balance: 400
            },
            {
                id: "2",
                fio: "FIO2",
                mail: "test2@mail.ru",
                balance: 300
            }
        ];
    }
}

export interface EmployeeInfo {
    id: string,
    fio: string;
    mail: string;
    balance: number;
}