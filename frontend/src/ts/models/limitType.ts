import {Enum, Enumeration} from "./enum";

@Enum<LimitType>("id")
export class LimitType extends Enumeration<LimitType>() {
    static readonly PREPAYMENT = new LimitType(0, "Предоплатная система");
    static readonly POSTPAYMENT = new LimitType(1, "Постоплатная система");

    private constructor(public id: number, private text: string) {
        super();
    }
}