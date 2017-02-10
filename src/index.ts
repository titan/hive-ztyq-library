import * as http from "http";
import { verify, uuidVerifier, stringVerifier, numberVerifier } from "hive-verify";
import * as bunyan from "bunyan";
import { Logger } from "bunyan";
import * as crypto from "crypto";
import * as bulebird from "bluebird";

// 判断智通引擎库在测试服务器运行，还是正式服务器
let ztyqhost: string = process.env["WX_ENV"] === "test" ? "139.198.1.73" : "api.ztwltech.com";
let isTestHost: boolean = process.env["WX_ENV"] === "test" ? true : false;
let hostport: number = process.env["WX_ENV"] === "test" ? 8081 : 80;

// 车辆信息
export interface Vehicle {
  responseNo: string; // 响应码
  engineNo: string; // 发动机号
  licenseNo: string; // 车牌号
  frameNo: string; // 车架号(VIN码)
  registerDate: string; // 初登日期
}

// 车型信息
export interface CarModel {
  vehicleFgwCode: string; // 发改委编码
  vehicleFgwName: string; // 发改委名称
  parentVehName: string; // 年份款型
  modelCode: string; // 品牌型号编码
  brandName: string; // 品牌型号名称
  engineDesc: string; // 排量
  familyName: string; // 车系名称
  gearboxType: string; // 车档型号
  remark: string; // 备注
  newCarPrice: string; // 新车购置价
  purchasePriceTax: string; // 含税价格 
  importFlag: string; // 进口标识
  purchasePrice: string; // 参考价
  seatCount: string; // 座位数
  standardName: string; // 款型名称
}

// 下期投保起期
export interface NextPolicyDate {
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
  insuredName?: string; // 被保人姓名
  insuredID?: string; // 被保人身份证号
  insuredMobile?: string; // 被保人手机号
}
// 险别信息
export interface Coverage {
  coverageCode: string; // 险别代码
  coverageName?: string; // 险别名称
  insuredAmount: string; // 保额
  insuredPremium: string; // 保费
  flag?: string; // 标识
}

// 特约信息
export interface SPAgreement {
  spaCode: string; // 特约条款码
  spaName: string; // 特约条款名称
  spaContent: string; // 特约条款内容
  riskCode: string; // 险种代码
}

// 报价信息
export interface QuotePrice {
  insurerCode: string; // 保险人代码
  channelCode?: string; // 渠道编码
  thpBizID?: string; // 请求方业务号
  bizID?: string; // 智通引擎业务号
  biBeginDate: string; // 商业险起期
  biPremium: string; // 商业险总保费
  coverageList: Coverage[]; // 商业险险别列表
  integral: string; // 积分
  ciBeginDate: string; // 交强险起期
  ciPremium: string; // 交强险保费
  carshipTax: string; // 车船税金额
  spAgreement?: SPAgreement[]; // 特约信息
  cIntegral?: string; // 结算交强险费率
  bIntegral?: string; // 结算商业险费率
  showCiCost?: string; // 显示交强险费率
  showBiCost?: string; // 显示商业险费率
  showSumIntegral?: string; // 显示总积分
}

// 支付链接信息
export interface Paylink {
  biProposalNo: string; // 商业险投保单号
  ciProposalNo: string; // 交强险投保单号
  payLink: string; // 支付链接
  bizID?: string; // 业务号
  synchFlag?: string; // 是否同步返回结果
}

// options
export interface Option {
  log: Logger; // 日志输出
}

// 查询车辆信息(根据车牌号查询)
export async function getVehicleByLicense(
  licenseNo: string, // 车牌号码
  options?: Option // 可选参数
): Promise<any> {
  const sn = crypto.randomBytes(64).toString("base64");
  logInfo(options, `sn: ${sn}, getVehicleByLicense => RequestTime: ${new Date()}, requestData: { licenseNo: ${licenseNo} }`);
  if (!verify([
    stringVerifier("licenseNo", licenseNo)
  ], (errors: string[]) => {
    return Promise.reject({
      code: 403,
      msg: errors.join("\n")
    });
  })) {
    // return;
  }
  return new Promise((resolve, reject) => {
    const getVehicleByLicenseTimeString: string = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
    const requestData = {
      "applicationID": "FENGCHAOHUZHU_SERVICE",
      "licenseNo": licenseNo
    };
    const req = {
      "operType": "BDB",
      "msg": "",
      "sendTime": getVehicleByLicenseTimeString,
      "sign": null,
      "data": requestData
    };
    const getVehicleByLicensePostData: string = JSON.stringify(req);
    logInfo(options, `sn: ${sn}, getVehicleByLicense => getVehicleByLicensePostData: ${getVehicleByLicensePostData}`);
    let hostpath: string = isTestHost ? "/zkyq-web/prerelease/ifmEntry" : "/zkyq-web/pottingApi/information";
    const getVehicleByLicenseOptions = {
      "hostname": ztyqhost,
      "port": hostport,
      "method": "POST",
      "path": hostpath,
      "headers": {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(getVehicleByLicensePostData)
      }
    };
    const getVehicleByLicenseReq = http.request(getVehicleByLicenseOptions, function (res) {
      logInfo(options, `sn: ${sn}, getVehicleByLicense => getVehicleByLicenseReq status: ${res.statusCode}`);
      res.setEncoding("utf8");
      let getVehicleByLicenseResult: string = "";
      res.on("data", (body) => {
        getVehicleByLicenseResult += body;
      });
      res.on("end", () => {
        logInfo(options, `sn: ${sn}, getVehicleByLicense => End of getVehicleByLicenseReq`);
        const repData = JSON.parse(getVehicleByLicenseResult);
        logInfo(options, `sn: ${sn}, getVehicleByLicense => ReplyTime: ${new Date()} , getVehicleByLicenseResult: ${JSON.stringify(getVehicleByLicenseResult)}`);
        if (repData["state"] === "1") {
          let replyData: Vehicle = {
            responseNo: repData["data"]["responseNo"],
            engineNo: repData["data"]["engineNo"],
            licenseNo: repData["data"]["licenseNo"],
            frameNo: repData["data"]["frameNo"],
            registerDate: repData["data"]["firstRegisterDate"]
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
        logError(options, `sn: ${sn}, Error on getVehicleByLicense: ${err}`);
        reject({
          code: 500,
          msg: err
        });
      });
    });
    getVehicleByLicenseReq.end(getVehicleByLicensePostData);
  });
}

// 查询车辆信息(根据车架号据查询)
export async function getVehicleByFrameNo(
  frameNo: string, // 车架号
  options?: Option // 可选参数
): Promise<any> {
  const sn = crypto.randomBytes(64).toString("base64");
  logInfo(options, `sn: ${sn}, getVehicleByFrameNo => RequestTime: ${new Date()}, requestData: { frameNo: ${frameNo} }`);
  if (!verify([
    stringVerifier("frameNo", frameNo)
  ], (errors: string[]) => {
    return Promise.reject({
      code: 403,
      msg: errors.join("\n")
    });
  })) {
    // return;
  }
  return new Promise((resolve, reject) => {
    const getVehicleByFrameNoTimeString: string = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
    const requestData = {
      "applicationID": "FENGCHAOHUZHU_SERVICE",
      "frameNo": frameNo
    };
    const req = {
      "operType": "BDB_VIN",
      "msg": "",
      "sendTime": getVehicleByFrameNoTimeString,
      "sign": null,
      "data": requestData
    };
    const getVehicleByFrameNoPostData: string = JSON.stringify(req);
    logInfo(options, `sn: ${sn}, getVehicleByFrameNo => getVehicleByFrameNoPostData: ${getVehicleByFrameNoPostData}`);
    let hostpath: string = isTestHost ? "/zkyq-web/prerelease/ifmEntry" : "/zkyq-web/pottingApi/queryCarinfoByVin";
    const getVehicleByFrameNoOptions = {
      "hostname": ztyqhost,
      "port": hostport,
      "method": "POST",
      "path": hostpath,
      "headers": {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(getVehicleByFrameNoPostData)
      }
    };
    const getVehicleByFrameNoReq = http.request(getVehicleByFrameNoOptions, function (res) {
      logInfo(options, `sn: ${sn}, getVehicleByFrameNo => getVehicleByFrameNoReq status: ${res.statusCode}`);
      res.setEncoding("utf8");
      let getVehicleByFrameNoResult: string = "";
      res.on("data", (body) => {
        getVehicleByFrameNoResult += body;
      });
      res.on("end", () => {
        logInfo(options, `sn: ${sn}, getVehicleByFrameNo => End of getVehicleByFrameNoReq`);
        const repData = JSON.parse(getVehicleByFrameNoResult);
        logInfo(options, `sn: ${sn}, getVehicleByFrameNo => ReplyTime: ${new Date()} , getVehicleByFrameNoResult: ${JSON.stringify(getVehicleByFrameNoResult)}`);
        if (repData["state"] === "1") {
          let replyData: Vehicle = {
            responseNo: repData["data"]["responseNo"],
            engineNo: repData["data"]["engineNo"],
            licenseNo: repData["data"]["licenseNo"],
            frameNo: repData["data"]["frameNo"],
            registerDate: repData["data"]["firstRegisterDate"]
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
        logError(options, `sn: ${sn}, Error on getVehicleByFrameNo: ${err}`);
        reject({
          code: 500,
          msg: err
        });
      });
    });
    getVehicleByFrameNoReq.end(getVehicleByFrameNoPostData);
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
      code: 403,
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
    let hostpath: string = isTestHost ? "/zkyq-web/prerelease/ifmEntry" : "/zkyq-web/pottingApi/information";
    const getCarModelOptions = {
      "hostname": ztyqhost,
      "port": hostport,
      "method": "POST",
      "path": hostpath,
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
          let replyData: CarModel = {
            vehicleFgwCode: repData["data"][0]["vehicleFgwCode"],
            vehicleFgwName: repData["data"][0]["vehicleFgwName"],
            parentVehName: repData["data"][0]["parentVehName"],
            modelCode: repData["data"][0]["brandCode"],
            brandName: repData["data"][0]["brandName"],
            engineDesc: repData["data"][0]["engineDesc"],
            familyName: repData["data"][0]["familyName"],
            gearboxType: repData["data"][0]["gearboxType"],
            remark: repData["data"][0]["remark"],
            newCarPrice: repData["data"][0]["newCarPrice"],
            purchasePriceTax: repData["data"][0]["purchasePriceTax"],
            importFlag: repData["data"][0]["importFlag"],
            purchasePrice: repData["data"][0]["purchasePrice"],
            seatCount: repData["data"][0]["seat"],
            standardName: repData["data"][0]["standardName"]
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
export async function getFuzzyVehicle(
  brandName: string, // 品牌型号名称
  row: string, // 行数
  page: string, // 当前页
  options?: Option // 可选参数
): Promise<any> {
  const sn = crypto.randomBytes(64).toString("base64");
  logInfo(options, `sn: ${sn}, getFuzzyVehicle => RequestTime: ${new Date()}, requestData: { brandName: ${brandName}, row: ${row}, page: ${page} }`);
  if (!verify([
    stringVerifier("brandName", brandName),
    stringVerifier("row", row),
    stringVerifier("page", page)
  ], (errors: string[]) => {
    return Promise.reject({
      code: 403,
      msg: errors.join("\n")
    });
  })) {
    // return;
  }
  return new Promise((resolve, reject) => {
    const getFuzzyVehicleTimeString: string = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
    const requestData = {
      "applicationID": "FENGCHAOHUZHU_SERVICE",
      "brandName": brandName,
      "row": row,
      "page": page
    };
    const req = {
      "operType": "JYK_LIKE",
      "msg": "模糊匹配车型信息",
      "sendTime": getFuzzyVehicleTimeString,
      "sign": null,
      "data": requestData
    };
    const getFuzzyVehiclePostData: string = JSON.stringify(req);
    logInfo(options, `sn: ${sn}, getFuzzyVehicle => getFuzzyVehiclePostData: ${getFuzzyVehiclePostData}`);
    let hostpath: string = isTestHost ? "/zkyq-web/prerelease/ifmEntry" : "/zkyq-web/pottingApi/information";
    const getFuzzyVehicleOptions = {
      "hostname": ztyqhost,
      "port": hostport,
      "method": "POST",
      "path": hostpath,
      "headers": {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(getFuzzyVehiclePostData)
      }
    };
    const getFuzzyVehicleReq = http.request(getFuzzyVehicleOptions, function (res) {
      logInfo(options, `sn: ${sn}, getFuzzyVehicle => getFuzzyVehicleReq status: ${res.statusCode}`);
      res.setEncoding("utf8");
      let getFuzzyVehicleResult: string = "";
      res.on("data", (body) => {
        getFuzzyVehicleResult += body;
      });
      res.on("end", () => {
        logInfo(options, `sn: ${sn}, getFuzzyVehicle => End of getFuzzyVehicleReq`);
        const repData = JSON.parse(getFuzzyVehicleResult);
        logInfo(options, `sn: ${sn}, getFuzzyVehicle => ReplyTime: ${new Date()} , getFuzzyVehicleResult: ${JSON.stringify(getFuzzyVehicleResult)}`);
        if (repData["state"] === "1") {
          let replyData: CarModel[] = [];
          if (repData["data"] && repData["data"].length > 0) {
            const dataSet: Object[] = repData["data"];
            for (let data of dataSet) {
              let vehicle: CarModel = {
                vehicleFgwCode: data["vehicleFgwCode"],
                vehicleFgwName: data["vehicleFgwName"],
                parentVehName: data["parentVehName"],
                modelCode: data["brandCode"],
                brandName: data["brandName"],
                engineDesc: data["engineDesc"],
                familyName: data["familyName"],
                gearboxType: data["gearboxType"],
                remark: data["remark"],
                newCarPrice: data["newCarPrice"],
                purchasePriceTax: data["purchasePriceTax"],
                importFlag: data["importFlag"],
                purchasePrice: data["price"],
                seatCount: data["seat"],
                standardName: data["standardName"]
              };
              replyData.push(vehicle);
            }
          }
          resolve({
            code: 200,
            data: replyData
          });
        } else {
          reject({ code: 400, msg: repData["msg"] + ": " + repData["msgCode"] });
        }
      });
      res.on("error", (err) => {
        logError(options, `sn: ${sn}, Error on getFuzzyVehicle: ${err}`);
        reject({
          code: 500,
          msg: err
        });
      });
    });
    getFuzzyVehicleReq.end(getFuzzyVehiclePostData);
  });
}

// 获取下期投保起期
export async function getNextPolicyDate(
  responseNo: string, // 响应码
  licenseNo: string, // 车牌号码
  frameNo: string, // 车架号(VIN)
  modelCode: string, // 品牌型号代码
  engineNo: string, // 发动机号
  isTrans: string, // 是否过户
  transDate: string, // 过户日期
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
  logInfo(options, `sn: ${sn}, getNextPolicyDate => RequestTime: ${new Date()}, requestData: { responseNo: ${responseNo}, licenseNo: ${licenseNo}, frameNo: ${frameNo}, modelCode: ${modelCode}, engineNo: ${engineNo}, isTrans: ${isTrans}, transDate: ${transDate}, seatCount: ${seatCount}, isLoanCar: ${isLoanCar}, cityCode: ${cityCode}, ownerName: ${ownerName}, ownerMobile: ${ownerMobile}, ownerIdNo: ${ownerIdNo}, registerDate: ${registerDate} }`);
  if (!verify([
    stringVerifier("responseNo", responseNo),
    stringVerifier("licenseNo", licenseNo),
    stringVerifier("frameNo", frameNo),
    stringVerifier("modelCode", modelCode),
    stringVerifier("engineNo", engineNo),
    stringVerifier("isTrans", isTrans),
    stringVerifier("transDate", transDate),
    stringVerifier("seatCount", seatCount),
    stringVerifier("isLoanCar", isLoanCar),
    stringVerifier("cityCode", cityCode),
    stringVerifier("ownerName", ownerName),
    stringVerifier("ownerMobile", ownerMobile),
    stringVerifier("ownerIdNo", ownerIdNo),
    stringVerifier("registerDate", registerDate)
  ], (errors: string[]) => {
    return Promise.reject({
      code: 403,
      msg: errors.join("\n")
    });
  })) {
    // return;
  }
  return new Promise((resolve, reject) => {
    const getNextPolicyDateTimeString: string = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
    const requestData = {
      "channelCode": "FENGCHAOHUZHU_SERVICE", // 保单信息的这个字段比较特殊,别的接口不能推广
      "responseNo": responseNo,
      "licenseNo": licenseNo,
      "vehicleFrameNo": frameNo,
      "vehicleModelCode": modelCode,
      "engineNo": engineNo,
      "specialCarFlag": isTrans,
      "specialCarDate": transDate,
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
    let hostpath: string = isTestHost ? "/zkyq-web/preRelcalculate/fuzzy" : "/zkyq-web/calculate/fuzzy";
    const getNextPolicyDateOptions = {
      "hostname": ztyqhost,
      "port": hostport,
      "method": "POST",
      "path": hostpath,
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
          let replyData: NextPolicyDate = {
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
  car: Car, // 车辆信息
  person: Person, // 人员信息
  insurerCode: string, // 保险人代码
  coverageList: Coverage[], // 险别列表
  options?: Option // 可选参数
): Promise<any> {
  const sn = crypto.randomBytes(64).toString("base64");
  logInfo(options, `sn: ${sn}, getReferrencePrice => RequestTime: ${new Date()}, requestData: { cityCode: ${cityCode}, responseNo: ${responseNo}, car: ${JSON.stringify(car)}, person: ${JSON.stringify(person)}, insurerCode: ${insurerCode}, coverageList: ${JSON.stringify(coverageList)} }`);
  if (!verify([
    stringVerifier("cityCode", cityCode),
    stringVerifier("responseNo", responseNo),
    stringVerifier("insurerCode", insurerCode)
  ], (errors: string[]) => {
    return Promise.reject({
      code: 403,
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
      "carInfo": car,
      "personInfo": person,
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
    console.log(`sn: ${sn}, getReferrencePrice => getReferrencePricePostData: ${getReferrencePricePostData}`);
    let hostpath: string = isTestHost ? "/zkyq-web/calculate/entrance" : "/zkyq-web/calculate/entrance";
    const getReferrencePriceOptions = {
      "hostname": ztyqhost,
      "port": hostport,
      "method": "POST",
      "path": hostpath,
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
          let replyData: QuotePrice = {
            insurerCode: repData["data"][0]["insurerCode"],
            biBeginDate: repData["data"][0]["biBeginDate"],
            biPremium: repData["data"][0]["biPremium"],
            coverageList: repData["data"][0]["coverageList"],
            integral: repData["data"][0]["integral"],
            ciBeginDate: repData["data"][0]["ciBeginDate"],
            ciPremium: repData["data"][0]["ciPremium"],
            carshipTax: repData["data"][0]["carshipTax"]
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
  thpBizID: string, // 请求方业务号
  cityCode: string, // 行驶城市代码
  responseNo: string, // 响应码
  biBeginDate: string, // 商业险起期
  ciBeginDate: string, // 交强险去起期
  car: Car, // 车辆信息
  person: Person, // 人员信息
  insurerCode: string, // 保险人代码
  coverageList: Coverage[], // 险别列表
  options?: Option // 可选参数
): Promise<any> {
  const sn = crypto.randomBytes(64).toString("base64");
  logInfo(options, `sn: ${sn}, getAccuratePrice => RequestTime: ${new Date()}, requestData: { thpBizID: ${thpBizID}, cityCode: ${cityCode}, responseNo: ${responseNo}, biBeginDate: ${biBeginDate}, ciBeginDate: ${ciBeginDate}, car: ${JSON.stringify(car)}, person: ${JSON.stringify(person)}, insurerCode: ${insurerCode}, coverageList: ${JSON.stringify(coverageList)} }`);
  if (!verify([
    stringVerifier("thpBizID", thpBizID),
    stringVerifier("cityCode", cityCode),
    stringVerifier("responseNo", responseNo),
    stringVerifier("biBeginDate", biBeginDate),
    stringVerifier("ciBeginDate", ciBeginDate),
    stringVerifier("insurerCode", insurerCode)
  ], (errors: string[]) => {
    return Promise.reject({
      code: 403,
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
      "cityCode": cityCode,
      "responseNo": responseNo,
      "biBeginDate": biBeginDate,
      "ciBeginDate": ciBeginDate,
      "carInfo": car,
      "personInfo": person,
      "channelCode": null, // 根据智通文档,暂时为 null
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
    let hostpath: string = isTestHost ? "/zkyq-web/preRelcalculate/CalculateApi" : "/zkyq-web/pottingApi/CalculateApi";
    const getAccuratePriceOptions = {
      "hostname": ztyqhost,
      "port": hostport,
      "method": "POST",
      "path": hostpath,
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
          let replyData: QuotePrice = {
            insurerCode: repData["data"][0]["insurerCode"],
            channelCode: repData["data"][0]["channelCode"],
            thpBizID: repData["data"][0]["thpBizID"],
            bizID: repData["data"][0]["bizID"],
            biBeginDate: repData["data"][0]["biBeginDate"],
            biPremium: repData["data"][0]["biPremium"],
            coverageList: repData["data"][0]["coverageList"],
            integral: repData["data"][0]["integral"],
            ciBeginDate: repData["data"][0]["ciBeginDate"],
            ciPremium: repData["data"][0]["ciPremium"],
            carshipTax: repData["data"][0]["carshipTax"],
            spAgreement: repData["data"][0]["spAgreement"],
            cIntegral: repData["data"][0]["cIntegral"],
            bIntegral: repData["data"][0]["bIntegral"],
            showCiCost: repData["data"][0]["showCiCost"],
            showBiCost: repData["data"][0]["showBiCost"],
            showSumIntegral: repData["data"][0]["showSumIntegral"]
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
  insurerCode: string, // 保险人代码
  bizID: string, // 业务号
  channelCode: string, // 渠道编码, 从精准报价接口的出参获取
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
  logInfo(options, `sn: ${sn}, applyPolicyCheck => RequestTime: ${new Date()}, requestData: { insurerCode: ${insurerCode}, bizID: ${bizID}，　channelCode: ${channelCode}, applicantName: ${applicantName}, applicantIdNo: ${applicantIdNo}, applicantMobile: ${applicantMobile}, addresseeDetails: ${addresseeDetails}, addresseeCounty: ${addresseeCounty}, addresseeCity: ${addresseeCity}, addresseeProvince: ${addresseeProvince}, policyEmail: ${policyEmail} }`);
  if (!verify([
    stringVerifier("insurerCode", insurerCode),
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
      code: 403,
      msg: errors.join("\n")
    });
  })) {
    // return;
  }
  return new Promise((resolve, reject) => {
    const applyPolicyCheckTimeString: string = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
    const requestData = {
      "insureCode": insurerCode,
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
    let hostpath: string = isTestHost ? "/zkyq-web/preRelesePay/reqRes" : "/zkyq-web/apiPay/reqRes";
    const applyPolicyCheckOptions = {
      "hostname": ztyqhost,
      "port": hostport,
      "method": "POST",
      "path": hostpath,
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
          let replyData: Paylink = {
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
      code: 403,
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
    let hostpath: string = isTestHost ? "/zkyq-web/preRelesePay/reGetPayLink" : "/zkyq-web/pottingApi/reGetPayLink";
    const paylinkOptions = {
      "hostname": ztyqhost,
      "port": hostport,
      "method": "POST",
      "path": hostpath,
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
          let replyData: Paylink = {
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
export async function getUnd(
  bizID: string, // 业务号
  verificationCode: string, // 手机号验证码
  options?: Option // 可选参数
): Promise<any> {
  const sn = crypto.randomBytes(64).toString("base64");
  logInfo(options, `sn: ${sn}, getUnd => RequestTime: ${new Date()}, requestData: { bizID: ${bizID}, verificationCode: ${verificationCode} }`);
  if (!verify([
    stringVerifier("bizID", bizID),
    stringVerifier("verificationCode", verificationCode)
  ], (errors: string[]) => {
    return Promise.reject({
      code: 403,
      msg: errors.join("\n")
    });
  })) {
    // return;
  }
  return new Promise((resolve, reject) => {
    const getUndSendTimeString: string = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
    const requestData = {
      "applicationID": "FENGCHAOHUZHU_SERVICE",
      "bizID": bizID,
      "verificationCode": verificationCode
    };
    const req = {
      "msg": "手机号验证码",
      "sendTime": getUndSendTimeString,
      "data": requestData
    };
    const getUndPostData: string = JSON.stringify(req);
    logInfo(options, `sn: ${sn}, getUnd => ReplyTime: ${new Date()} , getUndPostData: ${getUndPostData}`);
    let hostpath: string = isTestHost ? "/zkyq-web/preRelesePay/getUndInfo" : "/zkyq-web/pottingApi/getUndInfo";
    const getUndOptions = {
      "hostname": ztyqhost,
      "port": hostport,
      "method": "POST",
      "path": hostpath,
      "headers": {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(getUndPostData)
      }
    };
    const getUndReq = http.request(getUndOptions, function (res) {
      logInfo(options, `sn: ${sn}, getUnd => getUndReq status: ${res.statusCode}`);
      res.setEncoding("utf8");
      let getUndResult: string = "";
      res.on("data", (body) => {
        getUndResult += body;
      });
      res.on("end", () => {
        logInfo(options, `sn: ${sn}, getUnd => End of getUndReq`);
        const repData = JSON.parse(getUndResult);
        logInfo(options, `sn: ${sn}, getUnd => getUndResult: ${getUndResult}`);
        if (repData["state"] === "1") {
          let replyData: Paylink = {
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
        logError(options, `sn: ${sn}, Error on getUnd: ${err}`);
        reject({
          code: 500,
          msg: err
        });
      });
    });
    getUndReq.end(getUndPostData);
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