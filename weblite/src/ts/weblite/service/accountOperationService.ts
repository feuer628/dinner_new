/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "BIFIT" JSC, TIN 7719617469
 *       105203, Russia, Moscow, Nizhnyaya Pervomayskaya, 46
 * (c) "BIFIT" JSC, 2018
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       АО "БИФИТ", ИНН 7719617469
 *       105203, Россия, Москва, ул. Нижняя Первомайская, д. 46
 * (c) АО "БИФИТ", 2018
 */

import {Service} from "platform/decorators/service";
import {Inject, Singleton} from "platform/ioc";
import {Http} from "platform/services/http";
import {StringMap} from "platform/types";

const ROOT_SERVICE_URL = "/ibank2/protected/services/operation";

@Service("AccountOperationService")
@Singleton
export class AccountOperationService {

    @Inject
    private http: Http;

    /**
     * Получить информацию об операции
     * @param accountId идентификатор счета
     * @param operationUid уникальный идентификатор операции
     * @return {AccountOperation} информация об операции
     */
    async getOperation(accountId: string, operationUid: string): Promise<AccountOperation> {
        const operationResponse: { [key: string]: StringMap & string } =
            await this.http.get<{ [key: string]: StringMap & string }>(`${ROOT_SERVICE_URL}/${accountId}/${operationUid}`);
        return {
            account: operationResponse.AC,
            currency: operationResponse.CUR,
            operAmount: operationResponse.OPER_AMOUNT,
            operDate: operationResponse.OD,
            operType: operationResponse.OPER_TYPE,
            valueDate: operationResponse.VD,
            incomeBankDate: operationResponse.IBD,
            creditDate: operationResponse.CD,
            operCode: operationResponse.OC,
            numDoc: operationResponse.ND,
            dateDoc: operationResponse.DD,
            corrInn: operationResponse.CI,
            corrKpp: operationResponse.CKPP,
            corrName: operationResponse.CN,
            corrAcc: operationResponse.CA,
            corrBankBic: operationResponse.CBB,
            corrBankAcc: operationResponse.CBA,
            corrBankName: operationResponse.CBN,
            operDebet: operationResponse.D,
            operCredit: operationResponse.C,
            operRurAmount: operationResponse.RP,
            paymentNote: operationResponse.NP,
            operId: operationResponse.OPERID,
            reserveField: operationResponse.RF,
            clientInn: operationResponse.UI,
            clientKpp: operationResponse.UKPP,
            clientName: operationResponse.UN,
            clientAccount: operationResponse.UA,
            clientBankBic: operationResponse.UBB,
            clientBankAccount: operationResponse.UBA,
            clientBankName: operationResponse.UBN,
            operHash: operationResponse.HASH,
            budgetCode: operationResponse.BC,
            queue: operationResponse.QUEUE,
            conditionPayType: operationResponse.CONDITION_PAY_TYPE,
            conditionPay: operationResponse.CONDITION_PAY,
            paymentType: operationResponse.PT,
            enclosureDocId: operationResponse.ADI,
            partialPayNumber: operationResponse.NPP,
            payDocCipher: operationResponse.PDC,
            payDocNumber: operationResponse.PDN,
            payDocDate: operationResponse.PDD,
            remainderAmount: operationResponse.RS,
            paymentDetails: operationResponse.REASON_PAYMENT,
            rate: operationResponse.RATE,
            docAmount: operationResponse.DS,
            docCurrency: operationResponse.DC,
            reference: operationResponse.REF,
            creditDebt: operationResponse.CDA,
            code: operationResponse.CODE,
            rest: operationResponse.REST,
            operationUid: operationResponse.OPERATION_UID,
            paymentDate: operationResponse.PD,
            docId: operationResponse.IDD,
            chargeFields: !operationResponse.chargeFields ? null : {
                chargeCreator: operationResponse.chargeFields.CC,
                chargeKbk: operationResponse.chargeFields.CK,
                chargeOkato: operationResponse.chargeFields.CO,
                chargeBasis: operationResponse.chargeFields.CB,
                chargePeriod: operationResponse.chargeFields.CP,
                chargeNumDoc: operationResponse.chargeFields.CND,
                chargeDateDoc: operationResponse.chargeFields.CDD,
                chargeType: operationResponse.chargeFields.CT
            },
            statementSignInfo: !operationResponse.statementSignInfo ? null : {
                keyId: operationResponse.statementSignInfo.KEY_ID,
                signTime: operationResponse.statementSignInfo.SIGN_TS,
                sign: operationResponse.statementSignInfo.SIGN,
                ownerKeyInfo: operationResponse.statementSignInfo.OWNER_KEY_INF,
                operatorId: operationResponse.statementSignInfo.OPERATOR_ID
            }
        };
    }
}

/**
 * Информация об операции
 */
export type AccountOperation = {
    chargeFields?: ChargeFields,
    statementSignInfo?: StatementSignInfo,
    account: string,
    currency: string,
    operAmount: string,
    operDate: string,
    operType: string,
    valueDate: string,
    incomeBankDate: string,
    creditDate: string,
    operCode: string,
    numDoc: string,
    dateDoc: string,
    corrInn: string,
    corrKpp: string,
    corrName: string,
    corrAcc: string,
    corrBankBic: string,
    corrBankAcc: string,
    corrBankName: string,
    operDebet: string,
    operCredit: string,
    operRurAmount: string,
    paymentNote: string,
    operId: string,
    reserveField: string,
    clientInn: string,
    clientKpp: string,
    clientName: string,
    clientAccount: string,
    clientBankBic: string,
    clientBankAccount: string,
    clientBankName: string,
    operHash: string,
    budgetCode: string,
    queue: string,
    conditionPayType: string,
    conditionPay: string,
    paymentType: string,
    enclosureDocId: string,
    partialPayNumber: string,
    payDocCipher: string,
    payDocNumber: string,
    payDocDate: string,
    remainderAmount: string,
    paymentDetails: string,
    rate: string,
    docAmount: string,
    docCurrency: string,
    reference: string,
    creditDebt: string,
    code: string,
    rest: string,
    operationUid: string,
    paymentDate: string,
    docId: string
};

/**
 * Информация о подписи
 */
export type StatementSignInfo = {
    keyId: string,
    signTime: string,
    sign: string,
    ownerKeyInfo: string,
    operatorId: string
};

/**
 * Информация о бюджетных полях
 */
export type ChargeFields = {
    chargeCreator: string,
    chargeKbk: string,
    chargeOkato: string,
    chargeBasis: string,
    chargePeriod: string,
    chargeNumDoc: string,
    chargeDateDoc: string,
    chargeType: string
};