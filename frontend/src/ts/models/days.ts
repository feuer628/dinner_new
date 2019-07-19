import {Enum, Enumeration} from "./enum";

@Enum<Days>("id")
export class Days extends Enumeration<Days>() {
    static readonly SUNDAY = new Days(0, "воскресенье");
    static readonly MONDAY = new Days(1, "понедельник");
    static readonly TUESDAY = new Days(2, "вторник");
    static readonly WEDNESDAY = new Days(3, "среда");
    static readonly THURSDAY = new Days(4, "четверг");
    static readonly FRIDAY = new Days(5, "пятница");
    static readonly SATURDAY = new Days(6, "суббота");

    private constructor(public id: number, public text: string) {
        super();
    }
}