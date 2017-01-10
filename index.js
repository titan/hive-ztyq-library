"use strict";
const http = require("http");
const hive_verify_1 = require("hive-verify");
function doApplyPolicyCheck(log, // 日志输出
    insureCode, // 保险人代码
    bizID, // 业务号
    channelCode, // 渠道编码
    applicantName, // 投保人姓名
    applicantIdNo, // 投保人身份证号
    applicantMobile, // 投保人手机号码
    addresseeName, // 收件人姓名
    addresseeMobile, // 收件人电话
    addresseeDetails, // 收件人详细地址
    addresseeCounty, // 收件人地区国标码
    addresseeCity, // 收件人城市国标码
    addresseeProvince, // 收件人省国标码
    policyEmail // 保单邮箱
    ) {
    log.info(`applyPolicyCheck => RequestTime: ${new Date()}, requestData: { insureCode: ${insureCode}, bizID: ${bizID}, channelCode: ${channelCode}, applicantName: ${applicantName}, applicantIdNo: ${applicantIdNo}, applicantMobile: ${applicantMobile}, addresseeDetails: ${addresseeDetails}, addresseeCounty: ${addresseeCounty}, addresseeCity: ${addresseeCity}, addresseeProvince: ${addresseeProvince}, policyEmail: ${policyEmail} }`);
    const applyPolicyCheckTimeString = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
    const requestData = {
        "insureCode": insureCode,
        "bizID": bizID,
        "channelCode": channelCode,
        "applicantName": applicantName,
        "applicantIdNo": applicantIdNo,
        "applicantMobile": applicantMobile,
        "addresseeName": addresseeName,
        "addresseeDetails": addresseeDetails,
        "addresseeCounty": addresseeCounty,
        "addresseeCity": addresseeCity,
        "addresseeProvince": addresseeProvince,
        "addresseeMobile": addresseeMobile,
        "policyEmail": policyEmail,
        "applicantUrl": "" // 和前端约定
    };
    const req = {
        "operType": "PMT",
        "msg": "核保接口",
        "sign": null,
        "sendTime": applyPolicyCheckTimeString,
        "data": requestData
    };
    const applyPolicyCheckPostData = JSON.stringify(req);
    log.info(`applyPolicyCheck => applyPolicyCheckPostData: ${applyPolicyCheckPostData}`);
    if (!hive_verify_1.verify([
        hive_verify_1.stringVerifier("insureCode", insureCode),
        hive_verify_1.stringVerifier("bizID", bizID),
        hive_verify_1.stringVerifier("channelCode", channelCode),
        hive_verify_1.stringVerifier("applicantName", applicantName),
        hive_verify_1.stringVerifier("applicantIdNo", applicantIdNo),
        hive_verify_1.stringVerifier("applicantMobile", applicantMobile),
        hive_verify_1.stringVerifier("addresseeName", addresseeName),
        hive_verify_1.stringVerifier("addresseeDetails", addresseeDetails),
        hive_verify_1.stringVerifier("addresseeCounty", addresseeCounty),
        hive_verify_1.stringVerifier("addresseeCity", addresseeCity),
        hive_verify_1.stringVerifier("policyEmail", policyEmail)
    ], (errors) => {
        return {
            code: 400,
            msg: errors.join("\n")
        };
    })) {
        return;
    }
    const applyPolicyCheckOptions = {
        "hostname": "api.ztwltech.com",
        "method": "POST",
        "path": "/zkyq-web/apiPay/reqRes",
        "headers": {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(applyPolicyCheckPostData)
        }
    };
    const applyPolicyCheckReq = http.request(applyPolicyCheckOptions, function (res) {
        log.info(`applyPolicyCheck => applyPolicyCheckReq status: ${res.statusCode}`);
        res.setEncoding("utf8");
        let applyPolicyCheckResult = "";
        res.on("data", (body) => {
            applyPolicyCheckResult += body;
        });
        res.on("end", () => {
            log.info(`getPayLink => End of paylinkReq`);
            const repData = JSON.parse(applyPolicyCheckResult);
            log.info(`applyPolicyCheck => ReplyTime: ${new Date()} , applyPolicyCheckResult: ${JSON.stringify(applyPolicyCheckResult)}`);
            if (repData["state"] === "1") {
                let replyData = {
                    biProposalNo: repData["data"]["biProposalNo"],
                    ciProposalNo: repData["data"]["ciProposalNo"],
                    payLink: repData["data"]["payLink"],
                    synchFlag: repData["data"]["synchFlag"]
                };
                return {
                    code: 200,
                    data: replyData
                };
            }
            else {
                return {
                    code: 400,
                    msg: repData["msg"] + ": " + repData["msgCode"]
                };
            }
        });
        res.on("error", (err) => {
            log.info(`Error on applyPolicyCheck: ${err}`);
            return {
                code: 500,
                msg: err
            };
        });
    });
    applyPolicyCheckReq.end(applyPolicyCheckPostData);
}
exports.doApplyPolicyCheck = doApplyPolicyCheck;
function doGetPaylink(log, // 日志输出
    bizID // 业务号
    ) {
    log.info(`getPayLink => RequestTime: ${new Date()}, requestData: { bizID: ${bizID} }`);
    if (!hive_verify_1.verify([
        hive_verify_1.stringVerifier("bizID", bizID)
    ], (errors) => {
        return {
            code: 400,
            msg: errors.join("\n")
        };
    })) {
        return;
    }
    const paylinkSendTimeString = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
    const requestData = {
        "applicationID": "FENGCHAOHUZHU_SERVICE",
        "bizID": bizID
    };
    const req = {
        "msg": "获取支付链接",
        "sendTime": paylinkSendTimeString,
        "data": requestData
    };
    const paylinkPostData = JSON.stringify(req);
    log.info(`getPayLink => paylinkPostData: ${paylinkPostData}`);
    const paylinkOptions = {
        "hostname": "api.ztwltech.com",
        "method": "POST",
        "path": "/zkyq-web/preRelesePay/reGetPayLink",
        "headers": {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(paylinkPostData)
        }
    };
    const paylinkReq = http.request(paylinkOptions, function (res) {
        log.info(`getPayLink => paylinkReq status: ${res.statusCode}`);
        res.setEncoding("utf8");
        let paylinkResult = "";
        res.on("data", (body) => {
            paylinkResult += body;
        });
        res.on("end", () => {
            log.info(`getPayLink => End of paylinkReq`);
            const repData = JSON.parse(paylinkResult);
            log.info(`getPayLink => ReplyTime: ${new Date()}, paylinkResult: ${JSON.stringify(paylinkResult)}`);
            if (repData["state"] === "1") {
                let replyData = {
                    biProposalNo: repData["data"]["biProposalNo"],
                    ciProposalNo: repData["data"]["ciProposalNo"],
                    payLink: repData["data"]["payLink"],
                    bizID: repData["data"]["bizID"]
                };
                return {
                    code: 200,
                    data: replyData
                };
            }
            else {
                return {
                    code: 400,
                    msg: repData["msg"] + ": " + repData["msgCode"]
                };
            }
        });
        res.on("error", (err) => {
            log.info(`Error on getPayLink: ${err}`);
            return {
                code: 500,
                msg: err
            };
        });
    });
    paylinkReq.end(paylinkPostData);
}
exports.doGetPaylink = doGetPaylink;
function doGetUndInfo(log, // 日志输出
    bizID, // 业务号
    verificationCode) {
    log.info(`getUndInfo => RequestTime: ${new Date()}, requestData: { bizID: ${bizID}, verificationCode: ${verificationCode} }`);
    if (!hive_verify_1.verify([
        hive_verify_1.stringVerifier("bizID", bizID),
        hive_verify_1.stringVerifier("verificationCode", verificationCode)
    ], (errors) => {
        return {
            code: 400,
            msg: errors.join("\n")
        };
    })) {
        return;
    }
    const getUndInfoSendTimeString = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
    const requestData = {
        "applicationID": "FENGCHAOHUZHU_SERVICE",
        "bizID": bizID,
        "verificationCode": verificationCode
    };
    const req = {
        "msg": "手机号验证码",
        "sendTime": getUndInfoSendTimeString,
        "data": requestData
    };
    const getUndInfoPostData = JSON.stringify(req);
    log.info(`getUndInfo => ReplyTime: ${new Date()} , getUndInfoPostData: ${getUndInfoPostData}`);
    const getUndInfoOptions = {
        "hostname": "api.ztwltech.com",
        "method": "POST",
        "path": "/zkyq-web/preRelesePay/getUndInfo",
        "headers": {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(getUndInfoPostData)
        }
    };
    const getUndInfoReq = http.request(getUndInfoOptions, function (res) {
        log.info(`getUndInfo => getUndInfoReq status: ${res.statusCode}`);
        res.setEncoding("utf8");
        let getUndInfoResult = "";
        res.on("data", (body) => {
            getUndInfoResult += body;
        });
        res.on("end", () => {
            log.info(`getUndInfo => End of getUndInfoReq`);
            const repData = JSON.parse(getUndInfoResult);
            log.info(`getUndInfo => getUndInfoResult: ${getUndInfoResult}`);
            if (repData["state"] === "1") {
                let replyData = {
                    biProposalNo: repData["data"]["biProposalNo"],
                    ciProposalNo: repData["data"]["ciProposalNo"],
                    synchFlag: repData["data"]["synchFlag"],
                    payLink: repData["data"]["payLink"],
                };
                return {
                    code: 200,
                    data: replyData
                };
            }
            else {
                return {
                    code: 400,
                    msg: repData["msg"] + ": " + repData["msgCode"]
                };
            }
        });
        res.on("error", (err) => {
            log.info(`Error on getUndInfo: ${err}`);
            return {
                code: 500,
                msg: err
            };
        });
    });
    getUndInfoReq.end(getUndInfoPostData);
}
exports.doGetUndInfo = doGetUndInfo;
