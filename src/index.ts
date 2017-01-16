import * as http from "http";
import { verify, uuidVerifier, stringVerifier, numberVerifier } from "hive-verify";
import * as bunyan from "bunyan";
import { Logger } from "bunyan";
import * as crypto from "crypto";
import * as bulebird from "bluebird";

// 查询车辆信息(根据车牌号查询)
export interface GetVehicleInfoByLicenseNoReply {
  responseNo: string; // 响应码
  engineNo: string; // 发动机号
  licenseNo: string; // 车牌号
  frameNo: string; // 车架号(VIN码)
  firstRegisterDate: string; // 初登日期
}

// 查询车辆信息(根据车架号查询)
export interface GetVehicleInfoByFrameNoReply {
  responseNo: string; // 响应码
  engineNo: string; // 发动机号
  licenseNo: string; // 车牌号
  frameNo: string; // 车架号(VIN码)
  firstRegisterDate: string; // 初登日期
}

// 车型信息
export interface GetCarModelReply {
  vehicleFgwCode: string; // 发改委编码
  vehicleFgwName: string; // 发改委名称
  parentVehName: string; // 年份款型
  brandCode: string; // 品牌型号编码
  brandName: string; // 品牌型号名称
  engineDesc: string; // 排量
  familyName: string; // 车系名称
  gearboxType: string; // 车档型号
  remark: string; // 备注
  newCarPrice: string; // 新车购置价
  purchasePriceTax: string; // 参考价
  importFlag: string; // 进口标识
  purchasePrice: string; // 参考价
  seat: string; // 座位数
  standardName: string; // 款型名称
}

// 模糊匹配车型
export interface GetFuzzyVehicleInfoReply {
  vehicleFgwCode: string; // 发改委编码
  vehicleFgwName: string; // 发改委名称
  parentVehName: string; // 年份款型
  brandCode: string; // 车型编码
  brandName: string; // 品牌型号名称
  engineDesc: string; // 排量
  familyName: string; // 车系名称
  gearboxType: string; // 车档类型
  remark: string; // 备注
  newCarPric: string; // 新车购置价
  purchasePriceTax: string; // 含税价格
  importFlag: string; // 进口标识
  price: string; // 参考价
  seat: string; // 座位数
  standardName: string; // 款型说明
}

// 下期投保起期
export interface GetNextPolicyDateReply {
  ciLastEffectiveDate: string; // 下期交强险起期
  biLastEffectiveDate: string; // 下期商业险起期
}

// 车辆信息
export interface Car {
  licenseNo: string; // 车牌号码
  frameNo?: string; // 车架号(VIN码)
  modelCode: string; // 品牌型号代码
  engineNo: string; // 发动机号码
  isTrans?: string; // 是否过户
  transDate?: string; // 过户日期
  registerDate: string; // 初登日期
}

// 人员信息
export interface Person {
  ownerName?: string; // 车主姓名
  ownerID?: string; // 车主身份证号
  ownerMobile?: string; // 车主手机号
}
// 险别信息
export interface Coverage {
  coverageCode: string; // 险别代码
  coverageName?: string; // 险别名称
  insuredAmount: string; // 保额
  insuredPremium: string; // 保费
  flag?: string; // 标识
}

// 参考报价
export interface GetReferrencePriceReply {
  insurerCode: string; // 保险人代码
  biBeginDate: string; // 商业险起期
  biPremium: string; // 商业险总费用
  coverageList: Coverage[]; // 险别列表
  integral: string; // 积分
  ciBeginDate: string; // 交强险起期
  ciPremium: string; // 交强险保费
  carshipTax: string; // 车船税金额
}

// 特约信息
export interface SPAgreement {
  spaCode: string; // 特约条款码
  spaName: string; // 特约条款名称
  spaContent: string; // 特约条款内容
  riskCode: string; // 险种代码
}

// 精准报价
export interface GetAccuratePriceReply {
  insurerCode: string; // 保险人代码
  channelCode: string; // 渠道编码
  thpBizID: string; // 请求方业务号
  bizID: string; // 智通引擎业务号
  biBeginDate: string; // 商业险起期
  biPremium: string; // 商业险总保费
  coverageList: Coverage[]; // 商业险险别列表
  integral: string; // 积分
  ciBeginDate: string; // 交强险起期
  ciPremium: string; // 交强险保费
  carshipTax: string; // 车船税金额
  spAgreement: SPAgreement[]; // 特约信息
  cIntegral: string; // 结算交强险费率
  bIntegral: string; // 结算商业险费率
  showCiCost: string; // 显示交强险费率
  showBiCost: string; // 显示商业险费率
  showSumIntegral: string; // 显示总积分
}

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

// options
export interface Option {
  log: Logger; // 日志输出
}

// 查询车辆信息(根据车牌号查询)
export async function getVehicleInfoByLicense(
  licenseNo: string, // 车牌号码
  options?: Option // 可选参数
): Promise<any> {
  const sn = crypto.randomBytes(64).toString("base64");
  logInfo(options, `sn: ${sn}, getVehicleInfoByLicense => RequestTime: ${new Date()}, requestData: { licenseNo: ${licenseNo} }`);
  if (!verify([
    stringVerifier("licenseNo", licenseNo)
  ], (errors: string[]) => {
    return Promise.reject({
      code: 400,
      msg: errors.join("\n")
    });
  })) {
    // return;
  }
  return new Promise((resolve, reject) => {
    const getVehicleInfoByLicenseTimeString: string = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
    const requestData = {
      "applicationID": "FENGCHAOHUZHU_SERVICE",
      "licenseNo": licenseNo
    };
    const req = {
      "operType": "BDB",
      "msg": "",
      "sendTime": getVehicleInfoByLicenseTimeString,
      "sign": null,
      "data": requestData
    };
    const getVehicleInfoByLicensePostData: string = JSON.stringify(req);
    logInfo(options, `sn: ${sn}, getVehicleInfoByLicense => getVehicleInfoByLicensePostData: ${getVehicleInfoByLicensePostData}`);
    const getVehicleInfoByLicenseOptions = {
      "hostname": "api.ztwltech.com",
      "method": "POST",
      "path": "/zkyq-web/pottingApi/information",
      "headers": {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(getVehicleInfoByLicensePostData)
      }
    };
    const getVehicleInfoByLicenseReq = http.request(getVehicleInfoByLicenseOptions, function (res) {
      logInfo(options, `sn: ${sn}, getVehicleInfoByLicense => getVehicleInfoByLicenseReq status: ${res.statusCode}`);
      res.setEncoding("utf8");
      let getVehicleInfoByLicenseResult: string = "";
      res.on("data", (body) => {
        getVehicleInfoByLicenseResult += body;
      });
      res.on("end", () => {
        logInfo(options, `sn: ${sn}, getVehicleInfoByLicense => End of getVehicleInfoByLicenseReq`);
        const repData = JSON.parse(getVehicleInfoByLicenseResult);
        logInfo(options, `sn: ${sn}, getVehicleInfoByLicense => ReplyTime: ${new Date()} , getVehicleInfoByLicenseResult: ${JSON.stringify(getVehicleInfoByLicenseResult)}`);
        if (repData["state"] === "1") {
          let replyData: GetVehicleInfoByLicenseNoReply = {
            responseNo: repData["data"]["responseNo"],
            engineNo: repData["data"]["engineNo"],
            licenseNo: repData["data"]["licenseNo"],
            frameNo: repData["data"]["frameNo"],
            firstRegisterDate: repData["data"]["firstRegisterDate"]
          };
          resolve({
            code: 200,
            data: replyData
          });
        } else {
          reject({ code: 400, msg: repData["msg"] + ": " + repData["msgCode"] });
        }
      });
      res.on("error", (err) => {
        logError(options, `sn: ${sn}, Error on getVehicleInfoByLicense: ${err}`);
        reject({
          code: 500,
          msg: err
        });
      });
    });
    getVehicleInfoByLicenseReq.end(getVehicleInfoByLicensePostData);
  });
}

// 查询车辆信息(根据车架号据查询)
export async function getVehicleInfoByFrameNo(
  frameNo: string, // 车架号
  options?: Option // 可选参数
): Promise<any> {
  const sn = crypto.randomBytes(64).toString("base64");
  logInfo(options, `sn: ${sn}, getVehicleInfoByFrameNo => RequestTime: ${new Date()}, requestData: { frameNo: ${frameNo} }`);
  if (!verify([
    stringVerifier("frameNo", frameNo)
  ], (errors: string[]) => {
    return Promise.reject({
      code: 400,
      msg: errors.join("\n")
    });
  })) {
    // return;
  }
  return new Promise((resolve, reject) => {
    const getVehicleInfoByFrameNoTimeString: string = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
    const requestData = {
      "applicationID": "FENGCHAOHUZHU_SERVICE",
      "frameNo": frameNo
    };
    const req = {
      "operType": "BDB_VIN",
      "msg": "",
      "sendTime": getVehicleInfoByFrameNoTimeString,
      "sign": null,
      "data": requestData
    };
    const getVehicleInfoByFrameNoPostData: string = JSON.stringify(req);
    logInfo(options, `sn: ${sn}, getVehicleInfoByFrameNo => getVehicleInfoByFrameNoPostData: ${getVehicleInfoByFrameNoPostData}`);
    const getVehicleInfoByFrameNoOptions = {
      "hostname": "api.ztwltech.com",
      "method": "POST",
      "path": "/zkyq-web/pottingApi/queryCarinfoByVin",
      "headers": {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(getVehicleInfoByFrameNoPostData)
      }
    };
    const getVehicleInfoByFrameNoReq = http.request(getVehicleInfoByFrameNoOptions, function (res) {
      logInfo(options, `sn: ${sn}, getVehicleInfoByFrameNo => getVehicleInfoByFrameNoReq status: ${res.statusCode}`);
      res.setEncoding("utf8");
      let getVehicleInfoByFrameNoResult: string = "";
      res.on("data", (body) => {
        getVehicleInfoByFrameNoResult += body;
      });
      res.on("end", () => {
        logInfo(options, `sn: ${sn}, getVehicleInfoByFrameNo => End of getVehicleInfoByFrameNoReq`);
        const repData = JSON.parse(getVehicleInfoByFrameNoResult);
        logInfo(options, `sn: ${sn}, getVehicleInfoByFrameNo => ReplyTime: ${new Date()} , getVehicleInfoByFrameNoResult: ${JSON.stringify(getVehicleInfoByFrameNoResult)}`);
        if (repData["state"] === "1") {
          let replyData: GetVehicleInfoByFrameNoReply = {
            responseNo: repData["data"]["responseNo"],
            engineNo: repData["data"]["engineNo"],
            licenseNo: repData["data"]["licenseNo"],
            frameNo: repData["data"]["frameNo"],
            firstRegisterDate: repData["data"]["firstRegisterDate"]
          };
          resolve({
            code: 200,
            data: replyData
          });
        } else {
          reject({ code: 400, msg: repData["msg"] + ": " + repData["msgCode"] });
        }
      });
      res.on("error", (err) => {
        logError(options, `sn: ${sn}, Error on getVehicleInfoByFrameNo: ${err}`);
        reject({
          code: 500,
          msg: err
        });
      });
    });
    getVehicleInfoByFrameNoReq.end(getVehicleInfoByFrameNoPostData);
  });
}

// 查询车型信息
export async function getCarModel(
  frameNo: string, // 车架号
  licenseNo: string, // 车牌信息
  responseNo: string, // 响应码
  options?: Option // 可选参数
): Promise<any> {
  const sn = crypto.randomBytes(64).toString("base64");
  logInfo(options, `sn: ${sn}, getCarModel => RequestTime: ${new Date()}, requestData: { frameNo: ${frameNo}, licenseNo: ${licenseNo}, responseNo: ${responseNo} }`);
  if (!verify([
    stringVerifier("frameNo", frameNo),
    stringVerifier("licenseNo", licenseNo),
    stringVerifier("responseNo", responseNo)
  ], (errors: string[]) => {
    return Promise.reject({
      code: 400,
      msg: errors.join("\n")
    });
  })) {
    // return;
  }
  return new Promise((resolve, reject) => {
    const getCarModelTimeString: string = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
    const requestData = {
      "applicationID": "FENGCHAOHUZHU_SERVICE",
      "frameNo": frameNo,
      "licenseNo": licenseNo,
      "responseNo": responseNo
    };
    const req = {
      "operType": "JYK",
      "msg": "",
      "sendTime": getCarModelTimeString,
      "sign": null,
      "data": requestData
    };
    const getCarModelPostData: string = JSON.stringify(req);
    logInfo(options, `sn: ${sn}, getCarModel => getCarModelPostData: ${getCarModelPostData}`);
    const getCarModelOptions = {
      "hostname": "api.ztwltech.com",
      "method": "POST",
      "path": "/zkyq-web/pottingApi/information",
      "headers": {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(getCarModelPostData)
      }
    };
    const getCarModelReq = http.request(getCarModelOptions, function (res) {
      logInfo(options, `sn: ${sn}, getCarModel => getCarModelReq status: ${res.statusCode}`);
      res.setEncoding("utf8");
      let getCarModelResult: string = "";
      res.on("data", (body) => {
        getCarModelResult += body;
      });
      res.on("end", () => {
        logInfo(options, `sn: ${sn}, getCarModel => End of getCarModelReq`);
        const repData = JSON.parse(getCarModelResult);
        logInfo(options, `sn: ${sn}, getCarModel => ReplyTime: ${new Date()} , getCarModelResult: ${JSON.stringify(getCarModelResult)}`);
        if (repData["state"] === "1") {
          let replyData: GetCarModelReply = {
            vehicleFgwCode: repData["data"]["vehicleFgwCode"],
            vehicleFgwName: repData["data"]["vehicleFgwName"],
            parentVehName: repData["data"]["parentVehName"],
            brandCode: repData["data"]["brandCode"],
            brandName: repData["data"]["brandName"],
            engineDesc: repData["data"]["engineDesc"],
            familyName: repData["data"]["familyName"],
            gearboxType: repData["data"]["gearboxType"],
            remark: repData["data"]["remark"],
            newCarPrice: repData["data"]["newCarPrice"],
            purchasePriceTax: repData["data"]["purchasePriceTax"],
            importFlag: repData["data"]["importFlag"],
            purchasePrice: repData["data"]["purchasePrice"],
            seat: repData["data"]["seat"],
            standardName: repData["data"]["standardName"]
          };
          resolve({
            code: 200,
            data: replyData
          });
        } else {
          reject({ code: 400, msg: repData["msg"] + ": " + repData["msgCode"] });
        }
      });
      res.on("error", (err) => {
        logError(options, `sn: ${sn}, Error on getCarModel: ${err}`);
        reject({
          code: 500,
          msg: err
        });
      });
    });
    getCarModelReq.end(getCarModelPostData);
  });
}

// 模糊匹配车型
export async function getFuzzyVehicleInfo(
  brandName: string, // 品牌型号名称
  row: string, // 行数
  page: string, // 当前页
  options?: Option // 可选参数
): Promise<any> {
  const sn = crypto.randomBytes(64).toString("base64");
  logInfo(options, `sn: ${sn}, getFuzzyVehicleInfo => RequestTime: ${new Date()}, requestData: { brandName: ${brandName}, row: ${row}, page: ${page} }`);
  if (!verify([
    stringVerifier("brandName", brandName),
    stringVerifier("row", row),
    stringVerifier("page", page)
  ], (errors: string[]) => {
    return Promise.reject({
      code: 400,
      msg: errors.join("\n")
    });
  })) {
    // return;
  }
  return new Promise((resolve, reject) => {
    const getFuzzyVehicleInfoTimeString: string = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
    const requestData = {
      "applicationID": "FENGCHAOHUZHU_SERVICE",
      "brandName": brandName,
      "row": row,
      "page": page
    };
    const req = {
      "operType": "JYK_LIKE",
      "msg": "模糊匹配车型信息",
      "sendTime": getFuzzyVehicleInfoTimeString,
      "sign": null,
      "data": requestData
    };
    const getFuzzyVehicleInfoPostData: string = JSON.stringify(req);
    logInfo(options, `sn: ${sn}, getFuzzyVehicleInfo => getFuzzyVehicleInfoPostData: ${getFuzzyVehicleInfoPostData}`);
    const getFuzzyVehicleInfoOptions = {
      "hostname": "api.ztwltech.com",
      "method": "POST",
      "path": "/zkyq-web/pottingApi/information",
      "headers": {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(getFuzzyVehicleInfoPostData)
      }
    };
    const getFuzzyVehicleInfoReq = http.request(getFuzzyVehicleInfoOptions, function (res) {
      logInfo(options, `sn: ${sn}, getFuzzyVehicleInfo => getFuzzyVehicleInfoReq status: ${res.statusCode}`);
      res.setEncoding("utf8");
      let getFuzzyVehicleInfoResult: string = "";
      res.on("data", (body) => {
        getFuzzyVehicleInfoResult += body;
      });
      res.on("end", () => {
        logInfo(options, `sn: ${sn}, getFuzzyVehicleInfo => End of getFuzzyVehicleInfoReq`);
        const repData = JSON.parse(getFuzzyVehicleInfoResult);
        logInfo(options, `sn: ${sn}, getFuzzyVehicleInfo => ReplyTime: ${new Date()} , getFuzzyVehicleInfoResult: ${JSON.stringify(getFuzzyVehicleInfoResult)}`);
        if (repData["state"] === "1") {
          let replyData: GetFuzzyVehicleInfoReply = {
            vehicleFgwCode: repData["data"]["vehicleFgwCode"],
            vehicleFgwName: repData["data"]["vehicleFgwName"],
            parentVehName: repData["data"]["parentVehName"],
            brandCode: repData["data"]["brandCode"],
            brandName: repData["data"]["brandName"],
            engineDesc: repData["data"]["engineDesc"],
            familyName: repData["data"]["familyName"],
            gearboxType: repData["data"]["gearboxType"],
            remark: repData["data"]["remark"],
            newCarPric: repData["data"]["newCarPric"],
            purchasePriceTax: repData["data"]["purchasePriceTax"],
            importFlag: repData["data"]["importFlag"],
            price: repData["data"]["price"],
            seat: repData["data"]["seat"],
            standardName: repData["data"]["standardName"]
          };
          resolve({
            code: 200,
            data: replyData
          });
        } else {
          reject({ code: 400, msg: repData["msg"] + ": " + repData["msgCode"] });
        }
      });
      res.on("error", (err) => {
        logError(options, `sn: ${sn}, Error on getFuzzyVehicleInfo: ${err}`);
        reject({
          code: 500,
          msg: err
        });
      });
    });
    getFuzzyVehicleInfoReq.end(getFuzzyVehicleInfoPostData);
  });
}

// 获取下期投保起期
export async function getNextPolicyDate(
  channelCode: string, // 请求方标识
  responseNo: string, // 响应码
  licenseNo: string, // 车牌号码
  vehicleFrameNo: string, // 车架号(VIN)
  vehicleModelCode: string, // 品牌型号代码
  engineNo: string, // 发动机号
  specialCarFlag: string, // 是否过户
  specialCarDate: string, // 过户日期
  seatCount: string, // 座位数
  isLoanCar: string, // 是否贷款车
  cityCode: string, // 机构代码
  ownerName: string, // 车主姓名
  ownerMobile: string, // 车主手机号
  ownerIdNo: string, // 车主身份证号
  registerDate: string, // 初登日期
  options?: Option // 可选参数
): Promise<any> {
  const sn = crypto.randomBytes(64).toString("base64");
  logInfo(options, `sn: ${sn}, getNextPolicyDate => RequestTime: ${new Date()}, requestData: { channelCode: ${channelCode}, responseNo: ${responseNo}, licenseNo: ${licenseNo}, vehicleFrameNo: ${vehicleFrameNo}, vehicleModelCode: ${vehicleModelCode}, engineNo: ${engineNo}, specialCarFlag: ${specialCarFlag}, specialCarDate: ${specialCarDate}, seatCount: ${seatCount}, isLoanCar: ${isLoanCar}, cityCode: ${cityCode}, ownerName: ${ownerName}, ownerMobile: ${ownerMobile}, ownerIdNo: ${ownerIdNo}, registerDate: ${registerDate} }`);
  if (!verify([
    stringVerifier("channelCode", channelCode),
    stringVerifier("responseNo", responseNo),
    stringVerifier("licenseNo", licenseNo),
    stringVerifier("vehicleFrameNo", vehicleFrameNo),
    stringVerifier("vehicleModelCode", vehicleModelCode),
    stringVerifier("engineNo", engineNo),
    stringVerifier("specialCarFlag", specialCarFlag),
    stringVerifier("specialCarDate", specialCarDate),
    stringVerifier("seatCount", seatCount),
    stringVerifier("isLoanCar", isLoanCar),
    stringVerifier("cityCode", cityCode),
    stringVerifier("ownerName", ownerName),
    stringVerifier("ownerMobile", ownerMobile),
    stringVerifier("ownerIdNo", ownerIdNo),
    stringVerifier("registerDate", registerDate)
  ], (errors: string[]) => {
    return Promise.reject({
      code: 400,
      msg: errors.join("\n")
    });
  })) {
    // return;
  }
  return new Promise((resolve, reject) => {
    const getNextPolicyDateTimeString: string = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
    const requestData = {
      "applicationID": "FENGCHAOHUZHU_SERVICE",
      "channelCode": channelCode,
      "responseNo": responseNo,
      "licenseNo": licenseNo,
      "vehicleFrameNo": vehicleFrameNo,
      "vehicleModelCode": vehicleModelCode,
      "engineNo": engineNo,
      "specialCarFlag": specialCarFlag,
      "specialCarDate": specialCarDate,
      "seatCount": seatCount,
      "isLoanCar": isLoanCar,
      "cityCode": cityCode,
      "ownerName": ownerName,
      "ownerMobile": ownerMobile,
      "ownerIdNo": ownerIdNo,
      "registerDate": registerDate
    };
    const req = {
      "operType": "RDM",
      "msg": "",
      "sendTime": getNextPolicyDateTimeString,
      "sign": null,
      "data": requestData
    };
    const getNextPolicyDatePostData: string = JSON.stringify(req);
    logInfo(options, `sn: ${sn}, getNextPolicyDate => getNextPolicyDatePostData: ${getNextPolicyDatePostData}`);
    const getNextPolicyDateOptions = {
      "hostname": "api.ztwltech.com",
      "method": "POST",
      "path": "/zkyq-web/calculate/fuzzy",
      "headers": {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(getNextPolicyDatePostData)
      }
    };
    const getNextPolicyDateReq = http.request(getNextPolicyDateOptions, function (res) {
      logInfo(options, `sn: ${sn}, getNextPolicyDate => getNextPolicyDateReq status: ${res.statusCode}`);
      res.setEncoding("utf8");
      let getNextPolicyDateResult: string = "";
      res.on("data", (body) => {
        getNextPolicyDateResult += body;
      });
      res.on("end", () => {
        logInfo(options, `sn: ${sn}, getNextPolicyDate => End of getNextPolicyDateReq`);
        const repData = JSON.parse(getNextPolicyDateResult);
        logInfo(options, `sn: ${sn}, getNextPolicyDate => ReplyTime: ${new Date()} , getNextPolicyDateResult: ${JSON.stringify(getNextPolicyDateResult)}`);
        if (repData["state"] === "1") {
          let replyData: GetNextPolicyDateReply = {
            ciLastEffectiveDate: repData["data"]["ciLastEffectiveDate"],
            biLastEffectiveDate: repData["data"]["biLastEffectiveDate"]
          };
          resolve({
            code: 200,
            data: replyData
          });
        } else {
          reject({ code: 400, msg: repData["msg"] + ": " + repData["msgCode"] });
        }
      });
      res.on("error", (err) => {
        logError(options, `sn: ${sn}, Error on getNextPolicyDate: ${err}`);
        reject({
          code: 500,
          msg: err
        });
      });
    });
    getNextPolicyDateReq.end(getNextPolicyDatePostData);
  });
}

// 参考报价
export async function getReferrencePrice(
  cityCode: string, // 行驶城市代码
  responseNo: string, // 响应码
  carInfo: Car, // 车辆信息
  personInfo: Person, // 人员信息
  insurerCode: string, // 保险人代码
  coverageList: Coverage[], // 险别列表
  options?: Option // 可选参数
): Promise<any> {
  const sn = crypto.randomBytes(64).toString("base64");
  logInfo(options, `sn: ${sn}, getReferrencePrice => RequestTime: ${new Date()}, requestData: { cityCode: ${cityCode}, responseNo: ${responseNo}, carInfo: ${JSON.stringify(carInfo)}, personInfo: ${JSON.stringify(personInfo)}, insurerCode: ${insurerCode}, coverageList: ${JSON.stringify(coverageList)} }`);
  if (!verify([
    stringVerifier("cityCode", cityCode),
    stringVerifier("responseNo", responseNo),
    stringVerifier("insurerCode", insurerCode)
  ], (errors: string[]) => {
    return Promise.reject({
      code: 400,
      msg: errors.join("\n")
    });
  })) {
    // return;
  }
  return new Promise((resolve, reject) => {
    const getReferrencePriceTimeString: string = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
    const requestData = {
      "applicationID": "FENGCHAOHUZHU_SERVICE",
      "cityCode": cityCode,
      "responseNo": responseNo,
      "carInfo": carInfo,
      "personInfo": personInfo,
      "insurerCode": insurerCode,
      "coverageList": coverageList
    };
    const req = {
      "operType": "REF",
      "msg": "",
      "sendTime": getReferrencePriceTimeString,
      "sign": null,
      "data": requestData
    };
    const getReferrencePricePostData: string = JSON.stringify(req);
    logInfo(options, `sn: ${sn}, getReferrencePrice => getReferrencePricePostData: ${getReferrencePricePostData}`);
    const getReferrencePriceOptions = {
      "hostname": "api.ztwltech.com",
      "method": "POST",
      "path": "/zkyq-web/calculate/entrance",
      "headers": {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(getReferrencePricePostData)
      }
    };
    const getReferrencePriceReq = http.request(getReferrencePriceOptions, function (res) {
      logInfo(options, `sn: ${sn}, getReferrencePrice => getReferrencePriceReq status: ${res.statusCode}`);
      res.setEncoding("utf8");
      let getReferrencePriceResult: string = "";
      res.on("data", (body) => {
        getReferrencePriceResult += body;
      });
      res.on("end", () => {
        logInfo(options, `sn: ${sn}, getReferrencePrice => End of getReferrencePriceReq`);
        const repData = JSON.parse(getReferrencePriceResult);
        logInfo(options, `sn: ${sn}, getReferrencePrice => ReplyTime: ${new Date()} , getReferrencePriceResult: ${JSON.stringify(getReferrencePriceResult)}`);
        if (repData["state"] === "1") {
          let replyData: GetReferrencePriceReply = {
            insurerCode: repData["data"]["insurerCode"],
            biBeginDate: repData["data"]["biBeginDate"],
            biPremium: repData["data"]["biPremium"],
            coverageList: repData["data"]["coverageList"],
            integral: repData["data"]["integral"],
            ciBeginDate: repData["data"]["ciBeginDate"],
            ciPremium: repData["data"]["ciPremium"],
            carshipTax: repData["data"]["carshipTax"]
          };
          resolve({
            code: 200,
            data: replyData
          });
        } else {
          reject({ code: 400, msg: repData["msg"] + ": " + repData["msgCode"] });
        }
      });
      res.on("error", (err) => {
        logError(options, `sn: ${sn}, Error on getReferrencePrice: ${err}`);
        reject({
          code: 500,
          msg: err
        });
      });
    });
    getReferrencePriceReq.end(getReferrencePricePostData);
  });
}


// 精准报价
export async function getAccuratePrice(
  thpBizID: string, // 车架号
  licenseNo: string, // 车牌信息
  cityCode: string, // 行驶城市代码
  responseNo: string, // 响应码
  biBeginDate: string, // 商业险起期
  ciBeginDate: string, // 交强险去起期
  carInfo: Car, // 车辆信息
  personInfo: Person, // 人员信息
  channelCode: string, // 渠道编码
  insurerCode: string, // 保险人代码
  coverageList: Coverage[], // 险别列表
  options?: Option // 可选参数
): Promise<any> {
  const sn = crypto.randomBytes(64).toString("base64");
  logInfo(options, `sn: ${sn}, getAccuratePrice => RequestTime: ${new Date()}, requestData: { thpBizID: ${thpBizID}, licenseNo: ${licenseNo}, cityCode: ${cityCode}, responseNo: ${responseNo}, biBeginDate: ${biBeginDate}, ciBeginDate: ${ciBeginDate}, carInfo: ${JSON.stringify(carInfo)}, personInfo: ${JSON.stringify(personInfo)}, channelCode: ${channelCode}, insurerCode: ${insurerCode}, coverageList: ${JSON.stringify(coverageList)} }`);
  if (!verify([
    stringVerifier("thpBizID", thpBizID),
    stringVerifier("licenseNo", licenseNo),
    stringVerifier("cityCode", cityCode),
    stringVerifier("responseNo", responseNo),
    stringVerifier("biBeginDate", biBeginDate),
    stringVerifier("ciBeginDate", ciBeginDate),
    stringVerifier("channelCode", channelCode),
    stringVerifier("insurerCode", insurerCode)
  ], (errors: string[]) => {
    return Promise.reject({
      code: 400,
      msg: errors.join("\n")
    });
  })) {
    // return;
  }
  return new Promise((resolve, reject) => {
    const getAccuratePriceTimeString: string = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
    const requestData = {
      "applicationID": "FENGCHAOHUZHU_SERVICE",
      "thpBizID": thpBizID,
      "licenseNo": licenseNo,
      "cityCode": cityCode,
      "responseNo": responseNo,
      "biBeginDate": biBeginDate,
      "ciBeginDate": ciBeginDate,
      "carInfo": carInfo,
      "personInfo": personInfo,
      "channelCode": channelCode,
      "insurerCode": insurerCode,
      "coverageList": coverageList
    };
    const req = {
      "operType": "ACCPRICE",
      "msg": "精准报价",
      "sendTime": getAccuratePriceTimeString,
      "sign": null,
      "data": requestData
    };
    const getAccuratePricePostData: string = JSON.stringify(req);
    logInfo(options, `sn: ${sn}, getAccuratePrice => getAccuratePricePostData: ${getAccuratePricePostData}`);
    const getAccuratePriceOptions = {
      "hostname": "api.ztwltech.com",
      "method": "POST",
      "path": "/zkyq-web/pottingApi/CalculateApi",
      "headers": {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(getAccuratePricePostData)
      }
    };
    const getAccuratePriceReq = http.request(getAccuratePriceOptions, function (res) {
      logInfo(options, `sn: ${sn}, getAccuratePrice => getAccuratePriceReq status: ${res.statusCode}`);
      res.setEncoding("utf8");
      let getAccuratePriceResult: string = "";
      res.on("data", (body) => {
        getAccuratePriceResult += body;
      });
      res.on("end", () => {
        logInfo(options, `sn: ${sn}, getAccuratePrice => End of getAccuratePriceReq`);
        const repData = JSON.parse(getAccuratePriceResult);
        logInfo(options, `sn: ${sn}, getAccuratePrice => ReplyTime: ${new Date()} , getAccuratePriceResult: ${JSON.stringify(getAccuratePriceResult)}`);
        if (repData["state"] === "1") {
          let replyData: GetAccuratePriceReply = {
            insurerCode: repData["data"]["insurerCode"],
            channelCode: repData["data"]["channelCode"],
            thpBizID: repData["data"]["thpBizID"],
            bizID: repData["data"]["bizID"],
            biBeginDate: repData["data"]["biBeginDate"],
            biPremium: repData["data"]["biPremium"],
            coverageList: repData["data"]["coverageList"],
            integral: repData["data"]["integral"],
            ciBeginDate: repData["data"]["ciBeginDate"],
            ciPremium: repData["data"]["ciPremium"],
            carshipTax: repData["data"]["carshipTax"],
            spAgreement: repData["data"][""],
            cIntegral: repData["data"]["cIntegral"],
            bIntegral: repData["data"]["bIntegral"],
            showCiCost: repData["data"]["showCiCost"],
            showBiCost: repData["data"]["showBiCost"],
            showSumIntegral: repData["data"]["showSumIntegral"]
          };
          resolve({
            code: 200,
            data: replyData
          });
        } else {
          reject({ code: 400, msg: repData["msg"] + ": " + repData["msgCode"] });
        }
      });
      res.on("error", (err) => {
        logError(options, `sn: ${sn}, Error on getAccuratePrice: ${err}`);
        reject({
          code: 500,
          msg: err
        });
      });
    });
    getAccuratePriceReq.end(getAccuratePricePostData);
  });
}

// 申请核保
export async function applyPolicyCheck(
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
  policyEmail: string, // 保单邮箱
  applicantUrl: string, // 支付成功后跳转地址, 后端和前段协定
  options?: Option // 可选参数
): Promise<any> {
  const sn = crypto.randomBytes(64).toString("base64");
  logInfo(options, `sn: ${sn}, applyPolicyCheck => RequestTime: ${new Date()}, requestData: { insureCode: ${insureCode}, bizID: ${bizID}, channelCode: ${channelCode}, applicantName: ${applicantName}, applicantIdNo: ${applicantIdNo}, applicantMobile: ${applicantMobile}, addresseeDetails: ${addresseeDetails}, addresseeCounty: ${addresseeCounty}, addresseeCity: ${addresseeCity}, addresseeProvince: ${addresseeProvince}, policyEmail: ${policyEmail} }`);
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
    return Promise.reject({
      code: 400,
      msg: errors.join("\n")
    });
  })) {
    // return;
  }
  return new Promise((resolve, reject) => {
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
      "applicantUrl": applicantUrl
    };
    const req = {
      "operType": "PMT",
      "msg": "核保接口",
      "sign": null,
      "sendTime": applyPolicyCheckTimeString,
      "data": requestData
    };
    const applyPolicyCheckPostData: string = JSON.stringify(req);
    logInfo(options, `sn: ${sn}, applyPolicyCheck => applyPolicyCheckPostData: ${applyPolicyCheckPostData}`);
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
      logInfo(options, `sn: ${sn}, applyPolicyCheck => applyPolicyCheckReq status: ${res.statusCode}`);
      res.setEncoding("utf8");
      let applyPolicyCheckResult: string = "";
      res.on("data", (body) => {
        applyPolicyCheckResult += body;
      });
      res.on("end", () => {
        logInfo(options, `sn: ${sn}, getPayLink => End of paylinkReq`);
        const repData = JSON.parse(applyPolicyCheckResult);
        logInfo(options, `sn: ${sn}, applyPolicyCheck => ReplyTime: ${new Date()} , applyPolicyCheckResult: ${JSON.stringify(applyPolicyCheckResult)}`);
        if (repData["state"] === "1") {
          let replyData: ApplyPolicyCheckReply = {
            biProposalNo: repData["data"]["biProposalNo"],
            ciProposalNo: repData["data"]["ciProposalNo"],
            payLink: repData["data"]["payLink"],
            synchFlag: repData["data"]["synchFlag"]
          };
          resolve({
            code: 200,
            data: replyData
          });
        } else {
          reject({ code: 400, msg: repData["msg"] + ": " + repData["msgCode"] });
        }
      });
      res.on("error", (err) => {
        logError(options, `sn: ${sn}, Error on applyPolicyCheck: ${err}`);
        reject({
          code: 500,
          msg: err
        });
      });
    });
    applyPolicyCheckReq.end(applyPolicyCheckPostData);
  });
}

// 获取支付链接
export async function getPaylink(
  bizID: string, // 业务号
  options?: Option // 可选参数
): Promise<any> {
  const sn = crypto.randomBytes(64).toString("base64");
  logInfo(options, `sn: ${sn}, getPayLink => RequestTime: ${new Date()}, requestData: { bizID: ${bizID} }`);
  if (!verify([
    stringVerifier("bizID", bizID)
  ], (errors: string[]) => {
    return Promise.reject({
      code: 400,
      msg: errors.join("\n")
    });
  })) {
    // return;
  }
  return new Promise((resolve, reject) => {
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
    logInfo(options, `sn: ${sn}, getPayLink => paylinkPostData: ${paylinkPostData}`);
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
      logInfo(options, `sn: ${sn}, getPayLink => paylinkReq status: ${res.statusCode}`);
      res.setEncoding("utf8");
      let paylinkResult: string = "";
      res.on("data", (body) => {
        paylinkResult += body;
      });
      res.on("end", () => {
        logInfo(options, `sn: ${sn}, getPayLink => End of paylinkReq`);
        const repData = JSON.parse(paylinkResult);
        logInfo(options, `sn: ${sn}, getPayLink => ReplyTime: ${new Date()}, paylinkResult: ${JSON.stringify(paylinkResult)}`);
        if (repData["state"] === "1") {
          let replyData: GetPaylinkReply = {
            biProposalNo: repData["data"]["biProposalNo"],
            ciProposalNo: repData["data"]["ciProposalNo"],
            payLink: repData["data"]["payLink"],
            bizID: repData["data"]["bizID"]
          };
          resolve({
            code: 200,
            data: replyData
          });
        } else {
          reject({
            code: 400,
            msg: repData["msg"] + ": " + repData["msgCode"]
          });
        }
      });
      res.on("error", (err) => {
        logError(options, `sn: ${sn}, Error on getPayLink: ${err}`);
        reject({
          code: 500,
          msg: err
        });
      });
    });
    paylinkReq.end(paylinkPostData);
  });
}

// 手机号验证码接口
export async function getUndInfo(
  bizID: string, // 业务号
  verificationCode: string, // 手机号验证码
  options?: Option // 可选参数
): Promise<any> {
  const sn = crypto.randomBytes(64).toString("base64");
  logInfo(options, `sn: ${sn}, getUndInfo => RequestTime: ${new Date()}, requestData: { bizID: ${bizID}, verificationCode: ${verificationCode} }`);
  if (!verify([
    stringVerifier("bizID", bizID),
    stringVerifier("verificationCode", verificationCode)
  ], (errors: string[]) => {
    return Promise.reject({
      code: 400,
      msg: errors.join("\n")
    });
  })) {
    // return;
  }
  return new Promise((resolve, reject) => {
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
    logInfo(options, `sn: ${sn}, getUndInfo => ReplyTime: ${new Date()} , getUndInfoPostData: ${getUndInfoPostData}`);
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
      logInfo(options, `sn: ${sn}, getUndInfo => getUndInfoReq status: ${res.statusCode}`);
      res.setEncoding("utf8");
      let getUndInfoResult: string = "";
      res.on("data", (body) => {
        getUndInfoResult += body;
      });
      res.on("end", () => {
        logInfo(options, `sn: ${sn}, getUndInfo => End of getUndInfoReq`);
        const repData = JSON.parse(getUndInfoResult);
        logInfo(options, `sn: ${sn}, getUndInfo => getUndInfoResult: ${getUndInfoResult}`);
        if (repData["state"] === "1") {
          let replyData: GetUndInfoReply = {
            biProposalNo: repData["data"]["biProposalNo"],
            ciProposalNo: repData["data"]["ciProposalNo"],
            synchFlag: repData["data"]["synchFlag"],
            payLink: repData["data"]["payLink"],
          };
          resolve({
            code: 200,
            data: replyData
          });
        } else {
          reject({
            code: 400,
            msg: repData["msg"] + ": " + repData["msgCode"]
          });
        }
      });
      res.on("error", (err) => {
        logError(options, `sn: ${sn}, Error on getUndInfo: ${err}`);
        reject({
          code: 500,
          msg: err
        });
      });
    });
    getUndInfoReq.end(getUndInfoPostData);
  });
}

// 输出日志
function logInfo(options: Option, msg: string): void {
  if (options && options.log) {
    let log: Logger = options.log;
    log.info(msg);
  }
}

// 输出错误日志
function logError(options: Option, msg: string): void {
  if (options && options.log) {
    let log: Logger = options.log;
    log.error(msg);
  }
}