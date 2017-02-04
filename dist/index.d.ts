import { Logger } from "bunyan";
export interface VehicleInfo {
    responseNo: string;
    engineNo: string;
    licenseNo: string;
    frameNo: string;
    registerDate: string;
}
export interface CarModelInfo {
    vehicleFgwCode: string;
    vehicleFgwName: string;
    parentVehName: string;
    modelCode: string;
    brandName: string;
    engineDesc: string;
    familyName: string;
    gearboxType: string;
    remark: string;
    newCarPrice: string;
    purchasePriceTax: string;
    importFlag: string;
    purchasePrice: string;
    seatCount: string;
    standardName: string;
}
export interface NextPolicyDate {
    ciLastEffectiveDate: string;
    biLastEffectiveDate: string;
}
export interface Car {
    licenseNo: string;
    frameNo?: string;
    modelCode: string;
    engineNo: string;
    isTrans?: string;
    transDate?: string;
    registerDate: string;
}
export interface Person {
    ownerName?: string;
    ownerID?: string;
    ownerMobile?: string;
    insuredName?: string;
    insuredID?: string;
    insuredMobile?: string;
}
export interface Coverage {
    coverageCode: string;
    coverageName?: string;
    insuredAmount: string;
    insuredPremium: string;
    flag?: string;
}
export interface SPAgreement {
    spaCode: string;
    spaName: string;
    spaContent: string;
    riskCode: string;
}
export interface QuotePriceInfo {
    insurerCode: string;
    channelCode?: string;
    thpBizID?: string;
    bizID?: string;
    biBeginDate: string;
    biPremium: string;
    coverageList: Coverage[];
    integral: string;
    ciBeginDate: string;
    ciPremium: string;
    carshipTax: string;
    spAgreement?: SPAgreement[];
    cIntegral?: string;
    bIntegral?: string;
    showCiCost?: string;
    showBiCost?: string;
    showSumIntegral?: string;
}
export interface PaylinkInfo {
    biProposalNo: string;
    ciProposalNo: string;
    payLink: string;
    bizID?: string;
    synchFlag?: string;
}
export interface Option {
    log: Logger;
}
export declare function getVehicleInfoByLicense(licenseNo: string, options?: Option): Promise<any>;
export declare function getVehicleInfoByFrameNo(frameNo: string, options?: Option): Promise<any>;
export declare function getCarModel(frameNo: string, licenseNo: string, responseNo: string, options?: Option): Promise<any>;
export declare function getFuzzyVehicleInfo(brandName: string, row: string, page: string, options?: Option): Promise<any>;
export declare function getNextPolicyDate(responseNo: string, licenseNo: string, frameNo: string, modelCode: string, engineNo: string, isTrans: string, transDate: string, seatCount: string, isLoanCar: string, cityCode: string, ownerName: string, ownerMobile: string, ownerIdNo: string, registerDate: string, options?: Option): Promise<any>;
export declare function getReferrencePrice(cityCode: string, responseNo: string, carInfo: Car, personInfo: Person, insurerCode: string, coverageList: Coverage[], options?: Option): Promise<any>;
export declare function getAccuratePrice(thpBizID: string, cityCode: string, responseNo: string, biBeginDate: string, ciBeginDate: string, carInfo: Car, personInfo: Person, insurerCode: string, coverageList: Coverage[], options?: Option): Promise<any>;
export declare function applyPolicyCheck(insurerCode: string, bizID: string, channelCode: string, applicantName: string, applicantIdNo: string, applicantMobile: string, addresseeName: string, addresseeMobile: string, addresseeDetails: string, addresseeCounty: string, addresseeCity: string, addresseeProvince: string, policyEmail: string, applicantUrl: string, options?: Option): Promise<any>;
export declare function getPaylink(bizID: string, options?: Option): Promise<any>;
export declare function getUndInfo(bizID: string, verificationCode: string, options?: Option): Promise<any>;
