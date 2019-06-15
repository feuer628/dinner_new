export class MenuService {

    public static getMenu(): MenuInfo[] {

        return [
            {
                date: "2018-11-29",
                totalPrice: 0,
                ordered: false,
                items: [
                    {
                        name: "ricasd ricasd ricasd ricasd ricasd ",
                        weight: "111",
                        price: "15.5",
                        count: 0
                    },
                    {
                        name: "plov",
                        weight: "500",
                        price: "1135.5",
                        count: 0
                    }
                ]
            },
            {
                date: "2018-11-30",
                totalPrice: 0,
                ordered: false,
                items: [
                    {
                        name: "plov",
                        weight: "333",
                        price: "1115.5",
                        count: 0
                    },
                    {
                        name: "ric",
                        weight: "222",
                        price: "125.5",
                        count: 0
                    }
                ]
            },
            {
                date: "2018-12-01",
                totalPrice: 0,
                ordered: false,
                items: [
                    {
                        name: "ric",
                        weight: "300",
                        price: "15.5",
                        count: 0
                    },
                    {
                        name: "plov",
                        weight: "500",
                        price: "115.5",
                        count: 0
                    }
                ]
            }
            ,
            {
                date: "2018-12-29",
                totalPrice: 0,
                ordered: false,
                items: [
                    {
                        name: "ric",
                        weight: "300",
                        price: "15.5",
                        count: 0
                    },
                    {
                        name: "plov",
                        weight: "500",
                        price: "115.5",
                        count: 0
                    }
                ]
            },
            {
                date: "2018-12-09",
                totalPrice: 0,
                ordered: false,
                items: [
                    {
                        name: "ric",
                        weight: "300",
                        price: "15.5",
                        count: 0
                    },
                    {
                        name: "plov",
                        weight: "500",
                        price: "115.5",
                        count: 0
                    }
                ]
            }
        ]
    }

    public static getWeeklyOrder(): MenuInfo[] {
        return [
            {
                date: "2018-12-29",
                totalPrice: 1166.5,
                ordered: true,
                items: [
                    {
                        name: "ric",
                        weight: "111",
                        price: "15.5",
                        count: 2,
                        comment: "comment1"
                    },
                    {
                        name: "plov",
                        weight: "500",
                        price: "1135.5",
                        count: 1
                    }
                ]
            },
            {
                date: "2018-12-09",
                totalPrice: 1166.5,
                ordered: true,
                items: [
                    {
                        name: "ric",
                        weight: "111",
                        price: "15.5",
                        count: 2
                    },
                    {
                        name: "plov",
                        weight: "500",
                        price: "1135.5",
                        count: 1,
                        comment: "comment2"
                    }
                ]
            }
        ]
    }

    public static sendOrder(menu: MenuInfo) {
        console.log(menu);
    }
}

export interface MenuInfo {
    notOrderedEmployees?: any;
    employeeInfo?: any;
    date: any;
    totalPrice: number;
    items: any;
    ordered: boolean;
}