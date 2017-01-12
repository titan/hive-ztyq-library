import { Logger } from "bunyan";
export interface ApplyPolicyCheckReq {
    insureCode: string;
    bizID: string;
    channelCode: string;
    applicantName: string;
    applicantIdNo: string;
    applicantMobile: string;
    addresseeName: string;
    addresseeMobile: string;
    addresseeDetails: string;
    addresseeCounty: string;
    addresseeCity: string;
    addresseeProvince: string;
    policyEmail: string;
}
export interface ApplyPolicyCheckReply {
    biProposalNo: string;
    ciProposalNo: string;
    payLink: string;
    synchFlag: string;
}
export interface GetPaylinkReq {
    bizID: string;
}
export interface GetPaylinkReply {
    biProposalNo: string;
    ciProposalNo: string;
    payLink: string;
    bizID: string;
}
export interface GetUndInfoReq {
    bizID: string;
    verificationCode: string;
}
export interface GetUndInfoReply {
    biProposalNo: string;
    ciProposalNo: string;
    synchFlag: string;
    payLink: string;
}
export interface Option {
    log: Logger;
}
export declare function applyPolicyCheck(insureCode: string, bizID: string, channelCode: string, applicantName: string, applicantIdNo: string, applicantMobile: string, addresseeName: string, addresseeMobile: string, addresseeDetails: string, addresseeCounty: string, addresseeCity: string, addresseeProvince: string, policyEmail: string, options?: Option): Promise<{}>;
export declare function getPaylink(bizID: string, options?: Option): Promise<{}>;
export declare function getUndInfo(bizID: string, verificationCode: string, options?: Option): Promise<{}>;
