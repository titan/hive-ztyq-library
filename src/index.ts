import * as http from "http";
import { verify, uuidVerifier, stringVerifier, numberVerifier } from "hive-verify";
import * as bunyan from "bunyan";
import { Logger } from "bunyan";

// 申请核保入参
export interface ApplyPolicyCheckReq {
  insureCode: string; // 保险人代码
  bizID: string; // 业务号
  channelCode: string; // 渠道编码
  applicantName: string; // 投保人姓名
  applicantIdNo: string; // 投保人身份证号
  applicantMobile: string; // 投保人手机号码
  addresseeName: string; // 收件人姓名
  addresseeMobile: string; // 收件人电话
  addresseeDetails: string; // 收件人详细地址
  addresseeCounty: string; // 收件人地区国标码
  addresseeCity: string; // 收件人城市国标码
  addresseeProvince: string; // 收件人省国标码
  policyEmail: string; // 保单邮箱
}

// 申请核保出参
export interface ApplyPolicyCheckReply {
  biProposalNo: string; // 商业险投保单号
  ciProposalNo: string; // 交强险投保单号
  payLink: string; // 支付链接
  synchFlag: string; // 是否同步返回结果
}

// 获取支付链接入参
export interface GetPaylinkReq {
  bizID: string; // 业务号
}

// 获取支付链接出参
export interface GetPaylinkReply {
  biProposalNo: string; // 商业险投保单号
  ciProposalNo: string; // 交强险投保单号
  payLink: string; // 支付链接
  bizID: string; // 业务号
}

// 手机号验证码接口入参
export interface GetUndInfoReq {
  bizID: string; // 业务号
  verificationCode: string; // 手机号验证码
}

// 手机号验证码接口出参
export interface GetUndInfoReply {
  biProposalNo: string; // 商业险投保单号
  ciProposalNo: string; // 交强险投保单号
  synchFlag: string; // 是否同步返回结果
  payLink: string; // 支付链接
}

export function doApplyPolicyCheck(
  log: Logger, // 日志输出
  insureCode: string, // 保险人代码
  bizID: string, // 业务号
  channelCode: string, // 渠道编码
  applicantName: string, // 投保人姓名
  applicantIdNo: string, // 投保人身份证号
  applicantMobile: string, // 投保人手机号码
  addresseeName: string, // 收件人姓名
  addresseeMobile: string, // 收件人电话
  addresseeDetails: string, // 收件人详细地址
  addresseeCounty: string, // 收件人地区国标码
  addresseeCity: string, // 收件人城市国标码
  addresseeProvince: string, // 收件人省国标码
  policyEmail: string // 保单邮箱
) {
  log.info(`applyPolicyCheck => RequestTime: ${new Date()}, requestData: { insureCode: ${insureCode}, bizID: ${bizID}, channelCode: ${channelCode}, applicantName: ${applicantName}, applicantIdNo: ${applicantIdNo}, applicantMobile: ${applicantMobile}, addresseeDetails: ${addresseeDetails}, addresseeCounty: ${addresseeCounty}, addresseeCity: ${addresseeCity}, addresseeProvince: ${addresseeProvince}, policyEmail: ${policyEmail} }`);
  const applyPolicyCheckTimeString: string = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
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
  const applyPolicyCheckPostData: string = JSON.stringify(req);
  log.info(`applyPolicyCheck => applyPolicyCheckPostData: ${applyPolicyCheckPostData}`);
  if (!verify([
    stringVerifier("insureCode", insureCode),
    stringVerifier("bizID", bizID),
    stringVerifier("channelCode", channelCode),
    stringVerifier("applicantName", applicantName),
    stringVerifier("applicantIdNo", applicantIdNo),
    stringVerifier("applicantMobile", applicantMobile),
    stringVerifier("addresseeName", addresseeName),
    stringVerifier("addresseeDetails", addresseeDetails),
    stringVerifier("addresseeCounty", addresseeCounty),
    stringVerifier("addresseeCity", addresseeCity),
    stringVerifier("policyEmail", policyEmail)
  ], (errors: string[]) => {
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
    let applyPolicyCheckResult: string = "";
    res.on("data", (body) => {
      applyPolicyCheckResult += body;
    });
    res.on("end", () => {
      log.info(`getPayLink => End of paylinkReq`);
      const repData = JSON.parse(applyPolicyCheckResult);
      log.info(`applyPolicyCheck => ReplyTime: ${new Date()} , applyPolicyCheckResult: ${JSON.stringify(applyPolicyCheckResult)}`);
      if (repData["state"] === "1") {
        let replyData: ApplyPolicyCheckReply = {
          biProposalNo: repData["data"]["biProposalNo"],
          ciProposalNo: repData["data"]["ciProposalNo"],
          payLink: repData["data"]["payLink"],
          synchFlag: repData["data"]["synchFlag"]
        };
        return {
          code: 200,
          data: replyData
        };
      } else {
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

export function doGetPaylink(
  log: Logger, // 日志输出
  bizID: string // 业务号
) {
  log.info(`getPayLink => RequestTime: ${new Date()}, requestData: { bizID: ${bizID} }`);
  if (!verify([
    stringVerifier("bizID", bizID)
  ], (errors: string[]) => {
    return {
      code: 400,
      msg: errors.join("\n")
    };
  })) {
    return;
  }
  const paylinkSendTimeString: string = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
  const requestData = {
    "applicationID": "FENGCHAOHUZHU_SERVICE",
    "bizID": bizID
  };
  const req = {
    "msg": "获取支付链接",
    "sendTime": paylinkSendTimeString,
    "data": requestData
  };
  const paylinkPostData: string = JSON.stringify(req);
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

    let paylinkResult: string = "";
    res.on("data", (body) => {
      paylinkResult += body;
    });
    res.on("end", () => {
      log.info(`getPayLink => End of paylinkReq`);
      const repData = JSON.parse(paylinkResult);
      log.info(`getPayLink => ReplyTime: ${new Date()}, paylinkResult: ${JSON.stringify(paylinkResult)}`);
      if (repData["state"] === "1") {
        let replyData: GetPaylinkReply = {
          biProposalNo: repData["data"]["biProposalNo"],
          ciProposalNo: repData["data"]["ciProposalNo"],
          payLink: repData["data"]["payLink"],
          bizID: repData["data"]["bizID"]
        };
        return {
          code: 200,
          data: replyData
        };
      } else {
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

export function doGetUndInfo(
  log: Logger, // 日志输出
  bizID: string, // 业务号
  verificationCode: string, // 手机号验证码
) {
  log.info(`getUndInfo => RequestTime: ${new Date()}, requestData: { bizID: ${bizID}, verificationCode: ${verificationCode} }`);
  if (!verify([
    stringVerifier("bizID", bizID),
    stringVerifier("verificationCode", verificationCode)
  ], (errors: string[]) => {
    return {
      code: 400,
      msg: errors.join("\n")
    };
  })) {
    return;
  }
  const getUndInfoSendTimeString: string = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
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
  const getUndInfoPostData: string = JSON.stringify(req);
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

    let getUndInfoResult: string = "";
    res.on("data", (body) => {
      getUndInfoResult += body;
    });
    res.on("end", () => {
      log.info(`getUndInfo => End of getUndInfoReq`);
      const repData = JSON.parse(getUndInfoResult);
      log.info(`getUndInfo => getUndInfoResult: ${getUndInfoResult}`);
      if (repData["state"] === "1") {
        let replyData: GetUndInfoReply = {
          biProposalNo: repData["data"]["biProposalNo"],
          ciProposalNo: repData["data"]["ciProposalNo"],
          synchFlag: repData["data"]["synchFlag"],
          payLink: repData["data"]["payLink"],
        };
        return {
          code: 200,
          data: replyData
        };
      } else {
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