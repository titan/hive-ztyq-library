"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const http = require("http");
const hive_verify_1 = require("hive-verify");
const crypto = require("crypto");
// 查询车辆信息(根据车牌号查询)
function getVehicleInfoByLicense(licenseNo, // 车牌号码
    options // 可选参数
    ) {
    return __awaiter(this, void 0, void 0, function* () {
        const sn = crypto.randomBytes(64).toString("base64");
        return new Promise((resolve, reject) => {
            logInfo(options, `sn: ${sn}, getVehicleInfoByLicense => RequestTime: ${new Date()}, requestData: { licenseNo: ${licenseNo} }`);
            const getVehicleInfoByLicenseTimeString = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
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
            const getVehicleInfoByLicensePostData = JSON.stringify(req);
            logInfo(options, `sn: ${sn}, getVehicleInfoByLicense => getVehicleInfoByLicensePostData: ${getVehicleInfoByLicensePostData}`);
            if (!hive_verify_1.verify([
                hive_verify_1.stringVerifier("licenseNo", licenseNo)
            ], (errors) => {
                reject({
                    code: 400,
                    msg: errors.join("\n")
                });
            })) {
                return;
            }
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
                let getVehicleInfoByLicenseResult = "";
                res.on("data", (body) => {
                    getVehicleInfoByLicenseResult += body;
                });
                res.on("end", () => {
                    logInfo(options, `sn: ${sn}, getVehicleInfoByLicense => End of getVehicleInfoByLicenseReq`);
                    const repData = JSON.parse(getVehicleInfoByLicenseResult);
                    logInfo(options, `sn: ${sn}, getVehicleInfoByLicense => ReplyTime: ${new Date()} , getVehicleInfoByLicenseResult: ${JSON.stringify(getVehicleInfoByLicenseResult)}`);
                    if (repData["state"] === "1") {
                        let replyData = {
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
                    }
                    else {
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
    });
}
exports.getVehicleInfoByLicense = getVehicleInfoByLicense;
// 查询车辆信息(根据车架号据查询)
function getVehicleInfoByFrameNo(frameNo, // 车架号
    options // 可选参数
    ) {
    return __awaiter(this, void 0, void 0, function* () {
        const sn = crypto.randomBytes(64).toString("base64");
        return new Promise((resolve, reject) => {
            logInfo(options, `sn: ${sn}, getVehicleInfoByFrameNo => RequestTime: ${new Date()}, requestData: { frameNo: ${frameNo} }`);
            const getVehicleInfoByFrameNoTimeString = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
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
            const getVehicleInfoByFrameNoPostData = JSON.stringify(req);
            logInfo(options, `sn: ${sn}, getVehicleInfoByFrameNo => getVehicleInfoByFrameNoPostData: ${getVehicleInfoByFrameNoPostData}`);
            if (!hive_verify_1.verify([
                hive_verify_1.stringVerifier("frameNo", frameNo)
            ], (errors) => {
                reject({
                    code: 400,
                    msg: errors.join("\n")
                });
            })) {
                return;
            }
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
                let getVehicleInfoByFrameNoResult = "";
                res.on("data", (body) => {
                    getVehicleInfoByFrameNoResult += body;
                });
                res.on("end", () => {
                    logInfo(options, `sn: ${sn}, getVehicleInfoByFrameNo => End of getVehicleInfoByFrameNoReq`);
                    const repData = JSON.parse(getVehicleInfoByFrameNoResult);
                    logInfo(options, `sn: ${sn}, getVehicleInfoByFrameNo => ReplyTime: ${new Date()} , getVehicleInfoByFrameNoResult: ${JSON.stringify(getVehicleInfoByFrameNoResult)}`);
                    if (repData["state"] === "1") {
                        let replyData = {
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
                    }
                    else {
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
    });
}
exports.getVehicleInfoByFrameNo = getVehicleInfoByFrameNo;
// 查询车型信息
function getCarModel(frameNo, // 车架号
    licenseNo, // 车牌信息
    responseNo, // 响应码
    options // 可选参数
    ) {
    return __awaiter(this, void 0, void 0, function* () {
        const sn = crypto.randomBytes(64).toString("base64");
        return new Promise((resolve, reject) => {
            logInfo(options, `sn: ${sn}, getCarModel => RequestTime: ${new Date()}, requestData: { frameNo: ${frameNo}, licenseNo: ${licenseNo}, responseNo: ${responseNo} }`);
            const getCarModelTimeString = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
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
            const getCarModelPostData = JSON.stringify(req);
            logInfo(options, `sn: ${sn}, getCarModel => getCarModelPostData: ${getCarModelPostData}`);
            if (!hive_verify_1.verify([
                hive_verify_1.stringVerifier("frameNo", frameNo),
                hive_verify_1.stringVerifier("licenseNo", licenseNo),
                hive_verify_1.stringVerifier("responseNo", responseNo)
            ], (errors) => {
                reject({
                    code: 400,
                    msg: errors.join("\n")
                });
            })) {
                return;
            }
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
                let getCarModelResult = "";
                res.on("data", (body) => {
                    getCarModelResult += body;
                });
                res.on("end", () => {
                    logInfo(options, `sn: ${sn}, getCarModel => End of getCarModelReq`);
                    const repData = JSON.parse(getCarModelResult);
                    logInfo(options, `sn: ${sn}, getCarModel => ReplyTime: ${new Date()} , getCarModelResult: ${JSON.stringify(getCarModelResult)}`);
                    if (repData["state"] === "1") {
                        let replyData = {
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
                    }
                    else {
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
    });
}
exports.getCarModel = getCarModel;
// 模糊匹配车型
function getFuzzyVehicleInfo(brandName, // 品牌型号名称
    row, // 行数
    page, // 当前页
    options // 可选参数
    ) {
    return __awaiter(this, void 0, void 0, function* () {
        const sn = crypto.randomBytes(64).toString("base64");
        return new Promise((resolve, reject) => {
            logInfo(options, `sn: ${sn}, getFuzzyVehicleInfo => RequestTime: ${new Date()}, requestData: { brandName: ${brandName}, row: ${row}, page: ${page} }`);
            const getFuzzyVehicleInfoTimeString = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
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
            const getFuzzyVehicleInfoPostData = JSON.stringify(req);
            logInfo(options, `sn: ${sn}, getFuzzyVehicleInfo => getFuzzyVehicleInfoPostData: ${getFuzzyVehicleInfoPostData}`);
            if (!hive_verify_1.verify([
                hive_verify_1.stringVerifier("brandName", brandName),
                hive_verify_1.stringVerifier("row", row),
                hive_verify_1.stringVerifier("page", page)
            ], (errors) => {
                reject({
                    code: 400,
                    msg: errors.join("\n")
                });
            })) {
                return;
            }
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
                let getFuzzyVehicleInfoResult = "";
                res.on("data", (body) => {
                    getFuzzyVehicleInfoResult += body;
                });
                res.on("end", () => {
                    logInfo(options, `sn: ${sn}, getFuzzyVehicleInfo => End of getFuzzyVehicleInfoReq`);
                    const repData = JSON.parse(getFuzzyVehicleInfoResult);
                    logInfo(options, `sn: ${sn}, getFuzzyVehicleInfo => ReplyTime: ${new Date()} , getFuzzyVehicleInfoResult: ${JSON.stringify(getFuzzyVehicleInfoResult)}`);
                    if (repData["state"] === "1") {
                        let replyData = {
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
                    }
                    else {
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
    });
}
exports.getFuzzyVehicleInfo = getFuzzyVehicleInfo;
// 获取下期投保起期
function getNextPolicyDate(channelCode, // 请求方标识
    responseNo, // 响应码
    licenseNo, // 车牌号码
    vehicleFrameNo, // 车架号(VIN)
    vehicleModelCode, // 品牌型号代码
    engineNo, // 发动机号
    specialCarFlag, // 是否过户
    specialCarDate, // 过户日期
    seatCount, // 座位数
    isLoanCar, // 是否贷款车
    cityCode, // 机构代码
    ownerName, // 车主姓名
    ownerMobile, // 车主手机号
    ownerIdNo, // 车主身份证号
    registerDate, // 初登日期
    options // 可选参数
    ) {
    return __awaiter(this, void 0, void 0, function* () {
        const sn = crypto.randomBytes(64).toString("base64");
        return new Promise((resolve, reject) => {
            logInfo(options, `sn: ${sn}, getNextPolicyDate => RequestTime: ${new Date()}, requestData: { channelCode: ${channelCode}, responseNo: ${responseNo}, licenseNo: ${licenseNo}, vehicleFrameNo: ${vehicleFrameNo}, vehicleModelCode: ${vehicleModelCode}, engineNo: ${engineNo}, specialCarFlag: ${specialCarFlag}, specialCarDate: ${specialCarDate}, seatCount: ${seatCount}, isLoanCar: ${isLoanCar}, cityCode: ${cityCode}, ownerName: ${ownerName}, ownerMobile: ${ownerMobile}, ownerIdNo: ${ownerIdNo}, registerDate: ${registerDate} }`);
            const getNextPolicyDateTimeString = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
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
            const getNextPolicyDatePostData = JSON.stringify(req);
            logInfo(options, `sn: ${sn}, getNextPolicyDate => getNextPolicyDatePostData: ${getNextPolicyDatePostData}`);
            if (!hive_verify_1.verify([
                hive_verify_1.stringVerifier("channelCode", channelCode),
                hive_verify_1.stringVerifier("responseNo", responseNo),
                hive_verify_1.stringVerifier("licenseNo", licenseNo),
                hive_verify_1.stringVerifier("vehicleFrameNo", vehicleFrameNo),
                hive_verify_1.stringVerifier("vehicleModelCode", vehicleModelCode),
                hive_verify_1.stringVerifier("engineNo", engineNo),
                hive_verify_1.stringVerifier("specialCarFlag", specialCarFlag),
                hive_verify_1.stringVerifier("specialCarDate", specialCarDate),
                hive_verify_1.stringVerifier("seatCount", seatCount),
                hive_verify_1.stringVerifier("isLoanCar", isLoanCar),
                hive_verify_1.stringVerifier("cityCode", cityCode),
                hive_verify_1.stringVerifier("ownerName", ownerName),
                hive_verify_1.stringVerifier("ownerMobile", ownerMobile),
                hive_verify_1.stringVerifier("ownerIdNo", ownerIdNo),
                hive_verify_1.stringVerifier("registerDate", registerDate)
            ], (errors) => {
                reject({
                    code: 400,
                    msg: errors.join("\n")
                });
            })) {
                return;
            }
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
                let getNextPolicyDateResult = "";
                res.on("data", (body) => {
                    getNextPolicyDateResult += body;
                });
                res.on("end", () => {
                    logInfo(options, `sn: ${sn}, getNextPolicyDate => End of getNextPolicyDateReq`);
                    const repData = JSON.parse(getNextPolicyDateResult);
                    logInfo(options, `sn: ${sn}, getNextPolicyDate => ReplyTime: ${new Date()} , getNextPolicyDateResult: ${JSON.stringify(getNextPolicyDateResult)}`);
                    if (repData["state"] === "1") {
                        let replyData = {
                            ciLastEffectiveDate: repData["data"]["ciLastEffectiveDate"],
                            biLastEffectiveDate: repData["data"]["biLastEffectiveDate"]
                        };
                        resolve({
                            code: 200,
                            data: replyData
                        });
                    }
                    else {
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
    });
}
exports.getNextPolicyDate = getNextPolicyDate;
// 参考报价
function getReferrencePrice(cityCode, // 行驶城市代码
    responseNo, // 响应码
    carInfo, // 车辆信息
    personInfo, // 人员信息
    insurerCode, // 保险人代码
    coverageList, // 险别列表
    options // 可选参数
    ) {
    return __awaiter(this, void 0, void 0, function* () {
        const sn = crypto.randomBytes(64).toString("base64");
        return new Promise((resolve, reject) => {
            logInfo(options, `sn: ${sn}, getReferrencePrice => RequestTime: ${new Date()}, requestData: { cityCode: ${cityCode}, responseNo: ${responseNo}, carInfo: ${JSON.stringify(carInfo)}, personInfo: ${JSON.stringify(personInfo)}, insurerCode: ${insurerCode}, coverageList: ${JSON.stringify(coverageList)} }`);
            const getReferrencePriceTimeString = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
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
            const getReferrencePricePostData = JSON.stringify(req);
            logInfo(options, `sn: ${sn}, getReferrencePrice => getReferrencePricePostData: ${getReferrencePricePostData}`);
            if (!hive_verify_1.verify([
                hive_verify_1.stringVerifier("cityCode", cityCode),
                hive_verify_1.stringVerifier("responseNo", responseNo),
                hive_verify_1.stringVerifier("insurerCode", insurerCode)
            ], (errors) => {
                reject({
                    code: 400,
                    msg: errors.join("\n")
                });
            })) {
                return;
            }
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
                let getReferrencePriceResult = "";
                res.on("data", (body) => {
                    getReferrencePriceResult += body;
                });
                res.on("end", () => {
                    logInfo(options, `sn: ${sn}, getReferrencePrice => End of getReferrencePriceReq`);
                    const repData = JSON.parse(getReferrencePriceResult);
                    logInfo(options, `sn: ${sn}, getReferrencePrice => ReplyTime: ${new Date()} , getReferrencePriceResult: ${JSON.stringify(getReferrencePriceResult)}`);
                    if (repData["state"] === "1") {
                        let replyData = {
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
                    }
                    else {
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
    });
}
exports.getReferrencePrice = getReferrencePrice;
// 精准报价
function getAccuratePrice(thpBizID, // 车架号
    licenseNo, // 车牌信息
    cityCode, // 行驶城市代码
    responseNo, // 响应码
    biBeginDate, // 商业险起期
    ciBeginDate, // 交强险去起期
    carInfo, // 车辆信息
    personInfo, // 人员信息
    channelCode, // 渠道编码
    insurerCode, // 保险人代码
    coverageList, // 险别列表
    options // 可选参数
    ) {
    return __awaiter(this, void 0, void 0, function* () {
        const sn = crypto.randomBytes(64).toString("base64");
        return new Promise((resolve, reject) => {
            logInfo(options, `sn: ${sn}, getAccuratePrice => RequestTime: ${new Date()}, requestData: { thpBizID: ${thpBizID}, licenseNo: ${licenseNo}, cityCode: ${cityCode}, responseNo: ${responseNo}, biBeginDate: ${biBeginDate}, ciBeginDate: ${ciBeginDate}, carInfo: ${JSON.stringify(carInfo)}, personInfo: ${JSON.stringify(personInfo)}, channelCode: ${channelCode}, insurerCode: ${insurerCode}, coverageList: ${JSON.stringify(coverageList)} }`);
            const getAccuratePriceTimeString = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
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
            const getAccuratePricePostData = JSON.stringify(req);
            logInfo(options, `sn: ${sn}, getAccuratePrice => getAccuratePricePostData: ${getAccuratePricePostData}`);
            if (!hive_verify_1.verify([
                hive_verify_1.stringVerifier("thpBizID", thpBizID),
                hive_verify_1.stringVerifier("licenseNo", licenseNo),
                hive_verify_1.stringVerifier("cityCode", cityCode),
                hive_verify_1.stringVerifier("responseNo", responseNo),
                hive_verify_1.stringVerifier("biBeginDate", biBeginDate),
                hive_verify_1.stringVerifier("ciBeginDate", ciBeginDate),
                hive_verify_1.stringVerifier("channelCode", channelCode),
                hive_verify_1.stringVerifier("insurerCode", insurerCode)
            ], (errors) => {
                reject({
                    code: 400,
                    msg: errors.join("\n")
                });
            })) {
                return;
            }
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
                let getAccuratePriceResult = "";
                res.on("data", (body) => {
                    getAccuratePriceResult += body;
                });
                res.on("end", () => {
                    logInfo(options, `sn: ${sn}, getAccuratePrice => End of getAccuratePriceReq`);
                    const repData = JSON.parse(getAccuratePriceResult);
                    logInfo(options, `sn: ${sn}, getAccuratePrice => ReplyTime: ${new Date()} , getAccuratePriceResult: ${JSON.stringify(getAccuratePriceResult)}`);
                    if (repData["state"] === "1") {
                        let replyData = {
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
                    }
                    else {
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
    });
}
exports.getAccuratePrice = getAccuratePrice;
// 申请核保
function applyPolicyCheck(insureCode, // 保险人代码
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
    policyEmail, // 保单邮箱
    applicantUrl, // 支付成功后跳转地址, 后端和前段协定
    options // 可选参数
    ) {
    return __awaiter(this, void 0, void 0, function* () {
        const sn = crypto.randomBytes(64).toString("base64");
        return new Promise((resolve, reject) => {
            logInfo(options, `sn: ${sn}, applyPolicyCheck => RequestTime: ${new Date()}, requestData: { insureCode: ${insureCode}, bizID: ${bizID}, channelCode: ${channelCode}, applicantName: ${applicantName}, applicantIdNo: ${applicantIdNo}, applicantMobile: ${applicantMobile}, addresseeDetails: ${addresseeDetails}, addresseeCounty: ${addresseeCounty}, addresseeCity: ${addresseeCity}, addresseeProvince: ${addresseeProvince}, policyEmail: ${policyEmail} }`);
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
                "applicantUrl": applicantUrl
            };
            const req = {
                "operType": "PMT",
                "msg": "核保接口",
                "sign": null,
                "sendTime": applyPolicyCheckTimeString,
                "data": requestData
            };
            const applyPolicyCheckPostData = JSON.stringify(req);
            logInfo(options, `sn: ${sn}, applyPolicyCheck => applyPolicyCheckPostData: ${applyPolicyCheckPostData}`);
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
                reject({
                    code: 400,
                    msg: errors.join("\n")
                });
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
                logInfo(options, `sn: ${sn}, applyPolicyCheck => applyPolicyCheckReq status: ${res.statusCode}`);
                res.setEncoding("utf8");
                let applyPolicyCheckResult = "";
                res.on("data", (body) => {
                    applyPolicyCheckResult += body;
                });
                res.on("end", () => {
                    logInfo(options, `sn: ${sn}, getPayLink => End of paylinkReq`);
                    const repData = JSON.parse(applyPolicyCheckResult);
                    logInfo(options, `sn: ${sn}, applyPolicyCheck => ReplyTime: ${new Date()} , applyPolicyCheckResult: ${JSON.stringify(applyPolicyCheckResult)}`);
                    if (repData["state"] === "1") {
                        let replyData = {
                            biProposalNo: repData["data"]["biProposalNo"],
                            ciProposalNo: repData["data"]["ciProposalNo"],
                            payLink: repData["data"]["payLink"],
                            synchFlag: repData["data"]["synchFlag"]
                        };
                        resolve({
                            code: 200,
                            data: replyData
                        });
                    }
                    else {
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
    });
}
exports.applyPolicyCheck = applyPolicyCheck;
// 获取支付链接
function getPaylink(bizID, // 业务号
    options // 可选参数
    ) {
    return __awaiter(this, void 0, void 0, function* () {
        const sn = crypto.randomBytes(64).toString("base64");
        return new Promise((resolve, reject) => {
            logInfo(options, `sn: ${sn}, getPayLink => RequestTime: ${new Date()}, requestData: { bizID: ${bizID} }`);
            if (!hive_verify_1.verify([
                hive_verify_1.stringVerifier("bizID", bizID)
            ], (errors) => {
                reject({
                    code: 400,
                    msg: errors.join("\n")
                });
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
                let paylinkResult = "";
                res.on("data", (body) => {
                    paylinkResult += body;
                });
                res.on("end", () => {
                    logInfo(options, `sn: ${sn}, getPayLink => End of paylinkReq`);
                    const repData = JSON.parse(paylinkResult);
                    logInfo(options, `sn: ${sn}, getPayLink => ReplyTime: ${new Date()}, paylinkResult: ${JSON.stringify(paylinkResult)}`);
                    if (repData["state"] === "1") {
                        let replyData = {
                            biProposalNo: repData["data"]["biProposalNo"],
                            ciProposalNo: repData["data"]["ciProposalNo"],
                            payLink: repData["data"]["payLink"],
                            bizID: repData["data"]["bizID"]
                        };
                        resolve({
                            code: 200,
                            data: replyData
                        });
                    }
                    else {
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
    });
}
exports.getPaylink = getPaylink;
// 手机号验证码接口
function getUndInfo(bizID, // 业务号
    verificationCode, // 手机号验证码
    options // 可选参数
    ) {
    return __awaiter(this, void 0, void 0, function* () {
        const sn = crypto.randomBytes(64).toString("base64");
        return new Promise((resolve, reject) => {
            logInfo(options, `sn: ${sn}, getUndInfo => RequestTime: ${new Date()}, requestData: { bizID: ${bizID}, verificationCode: ${verificationCode} }`);
            if (!hive_verify_1.verify([
                hive_verify_1.stringVerifier("bizID", bizID),
                hive_verify_1.stringVerifier("verificationCode", verificationCode)
            ], (errors) => {
                reject({
                    code: 400,
                    msg: errors.join("\n")
                });
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
                let getUndInfoResult = "";
                res.on("data", (body) => {
                    getUndInfoResult += body;
                });
                res.on("end", () => {
                    logInfo(options, `sn: ${sn}, getUndInfo => End of getUndInfoReq`);
                    const repData = JSON.parse(getUndInfoResult);
                    logInfo(options, `sn: ${sn}, getUndInfo => getUndInfoResult: ${getUndInfoResult}`);
                    if (repData["state"] === "1") {
                        let replyData = {
                            biProposalNo: repData["data"]["biProposalNo"],
                            ciProposalNo: repData["data"]["ciProposalNo"],
                            synchFlag: repData["data"]["synchFlag"],
                            payLink: repData["data"]["payLink"],
                        };
                        resolve({
                            code: 200,
                            data: replyData
                        });
                    }
                    else {
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
    });
}
exports.getUndInfo = getUndInfo;
// 输出日志
function logInfo(options, msg) {
    if (options && options.log) {
        let log = options.log;
        log.info(msg);
    }
}
// 输出错误日志
function logError(options, msg) {
    if (options && options.log) {
        let log = options.log;
        log.error(msg);
    }
}
