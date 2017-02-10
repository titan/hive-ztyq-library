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
// 判断智通引擎库在测试服务器运行，还是正式服务器
let ztyqhost = process.env["WX_ENV"] === "test" ? "139.198.1.73" : "api.ztwltech.com";
let isTestHost = process.env["WX_ENV"] === "test" ? true : false;
let hostport = process.env["WX_ENV"] === "test" ? 8081 : 80;
// 查询车辆信息(根据车牌号查询)
function getVehicleByLicense(licenseNo, // 车牌号码
    options // 可选参数
    ) {
    return __awaiter(this, void 0, void 0, function* () {
        const sn = crypto.randomBytes(64).toString("base64");
        logInfo(options, `sn: ${sn}, getVehicleByLicense => RequestTime: ${new Date()}, requestData: { licenseNo: ${licenseNo} }`);
        if (!hive_verify_1.verify([
            hive_verify_1.stringVerifier("licenseNo", licenseNo)
        ], (errors) => {
            return Promise.reject({
                code: 403,
                msg: errors.join("\n")
            });
        })) {
        }
        return new Promise((resolve, reject) => {
            const getVehicleByLicenseTimeString = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
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
            const getVehicleByLicensePostData = JSON.stringify(req);
            logInfo(options, `sn: ${sn}, getVehicleByLicense => getVehicleByLicensePostData: ${getVehicleByLicensePostData}`);
            let hostpath = isTestHost ? "/zkyq-web/prerelease/ifmEntry" : "/zkyq-web/pottingApi/information";
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
                let getVehicleByLicenseResult = "";
                res.on("data", (body) => {
                    getVehicleByLicenseResult += body;
                });
                res.on("end", () => {
                    logInfo(options, `sn: ${sn}, getVehicleByLicense => End of getVehicleByLicenseReq`);
                    const repData = JSON.parse(getVehicleByLicenseResult);
                    logInfo(options, `sn: ${sn}, getVehicleByLicense => ReplyTime: ${new Date()} , getVehicleByLicenseResult: ${JSON.stringify(getVehicleByLicenseResult)}`);
                    if (repData["state"] === "1") {
                        let replyData = {
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
                    }
                    else {
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
    });
}
exports.getVehicleByLicense = getVehicleByLicense;
// 查询车辆信息(根据车架号据查询)
function getVehicleByFrameNo(frameNo, // 车架号
    options // 可选参数
    ) {
    return __awaiter(this, void 0, void 0, function* () {
        const sn = crypto.randomBytes(64).toString("base64");
        logInfo(options, `sn: ${sn}, getVehicleByFrameNo => RequestTime: ${new Date()}, requestData: { frameNo: ${frameNo} }`);
        if (!hive_verify_1.verify([
            hive_verify_1.stringVerifier("frameNo", frameNo)
        ], (errors) => {
            return Promise.reject({
                code: 403,
                msg: errors.join("\n")
            });
        })) {
        }
        return new Promise((resolve, reject) => {
            const getVehicleByFrameNoTimeString = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
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
            const getVehicleByFrameNoPostData = JSON.stringify(req);
            logInfo(options, `sn: ${sn}, getVehicleByFrameNo => getVehicleByFrameNoPostData: ${getVehicleByFrameNoPostData}`);
            let hostpath = isTestHost ? "/zkyq-web/prerelease/ifmEntry" : "/zkyq-web/pottingApi/queryCarinfoByVin";
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
                let getVehicleByFrameNoResult = "";
                res.on("data", (body) => {
                    getVehicleByFrameNoResult += body;
                });
                res.on("end", () => {
                    logInfo(options, `sn: ${sn}, getVehicleByFrameNo => End of getVehicleByFrameNoReq`);
                    const repData = JSON.parse(getVehicleByFrameNoResult);
                    logInfo(options, `sn: ${sn}, getVehicleByFrameNo => ReplyTime: ${new Date()} , getVehicleByFrameNoResult: ${JSON.stringify(getVehicleByFrameNoResult)}`);
                    if (repData["state"] === "1") {
                        let replyData = {
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
                    }
                    else {
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
    });
}
exports.getVehicleByFrameNo = getVehicleByFrameNo;
// 查询车型信息
function getCarModel(frameNo, // 车架号
    licenseNo, // 车牌信息
    responseNo, // 响应码
    options // 可选参数
    ) {
    return __awaiter(this, void 0, void 0, function* () {
        const sn = crypto.randomBytes(64).toString("base64");
        logInfo(options, `sn: ${sn}, getCarModel => RequestTime: ${new Date()}, requestData: { frameNo: ${frameNo}, licenseNo: ${licenseNo}, responseNo: ${responseNo} }`);
        if (!hive_verify_1.verify([
            hive_verify_1.stringVerifier("frameNo", frameNo),
            hive_verify_1.stringVerifier("licenseNo", licenseNo),
            hive_verify_1.stringVerifier("responseNo", responseNo)
        ], (errors) => {
            return Promise.reject({
                code: 403,
                msg: errors.join("\n")
            });
        })) {
        }
        return new Promise((resolve, reject) => {
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
            let hostpath = isTestHost ? "/zkyq-web/prerelease/ifmEntry" : "/zkyq-web/pottingApi/information";
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
function getFuzzyVehicle(brandName, // 品牌型号名称
    row, // 行数
    page, // 当前页
    options // 可选参数
    ) {
    return __awaiter(this, void 0, void 0, function* () {
        const sn = crypto.randomBytes(64).toString("base64");
        logInfo(options, `sn: ${sn}, getFuzzyVehicle => RequestTime: ${new Date()}, requestData: { brandName: ${brandName}, row: ${row}, page: ${page} }`);
        if (!hive_verify_1.verify([
            hive_verify_1.stringVerifier("brandName", brandName),
            hive_verify_1.stringVerifier("row", row),
            hive_verify_1.stringVerifier("page", page)
        ], (errors) => {
            return Promise.reject({
                code: 403,
                msg: errors.join("\n")
            });
        })) {
        }
        return new Promise((resolve, reject) => {
            const getFuzzyVehicleTimeString = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
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
            const getFuzzyVehiclePostData = JSON.stringify(req);
            logInfo(options, `sn: ${sn}, getFuzzyVehicle => getFuzzyVehiclePostData: ${getFuzzyVehiclePostData}`);
            let hostpath = isTestHost ? "/zkyq-web/prerelease/ifmEntry" : "/zkyq-web/pottingApi/information";
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
                let getFuzzyVehicleResult = "";
                res.on("data", (body) => {
                    getFuzzyVehicleResult += body;
                });
                res.on("end", () => {
                    logInfo(options, `sn: ${sn}, getFuzzyVehicle => End of getFuzzyVehicleReq`);
                    const repData = JSON.parse(getFuzzyVehicleResult);
                    logInfo(options, `sn: ${sn}, getFuzzyVehicle => ReplyTime: ${new Date()} , getFuzzyVehicleResult: ${JSON.stringify(getFuzzyVehicleResult)}`);
                    if (repData["state"] === "1") {
                        let replyData = [];
                        if (repData["data"] && repData["data"].length > 0) {
                            const dataSet = repData["data"];
                            for (let data of dataSet) {
                                let vehicle = {
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
                    }
                    else {
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
    });
}
exports.getFuzzyVehicle = getFuzzyVehicle;
// 获取下期投保起期
function getNextPolicyDate(responseNo, // 响应码
    licenseNo, // 车牌号码
    frameNo, // 车架号(VIN)
    modelCode, // 品牌型号代码
    engineNo, // 发动机号
    isTrans, // 是否过户
    transDate, // 过户日期
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
        logInfo(options, `sn: ${sn}, getNextPolicyDate => RequestTime: ${new Date()}, requestData: { responseNo: ${responseNo}, licenseNo: ${licenseNo}, frameNo: ${frameNo}, modelCode: ${modelCode}, engineNo: ${engineNo}, isTrans: ${isTrans}, transDate: ${transDate}, seatCount: ${seatCount}, isLoanCar: ${isLoanCar}, cityCode: ${cityCode}, ownerName: ${ownerName}, ownerMobile: ${ownerMobile}, ownerIdNo: ${ownerIdNo}, registerDate: ${registerDate} }`);
        if (!hive_verify_1.verify([
            hive_verify_1.stringVerifier("responseNo", responseNo),
            hive_verify_1.stringVerifier("licenseNo", licenseNo),
            hive_verify_1.stringVerifier("frameNo", frameNo),
            hive_verify_1.stringVerifier("modelCode", modelCode),
            hive_verify_1.stringVerifier("engineNo", engineNo),
            hive_verify_1.stringVerifier("isTrans", isTrans),
            hive_verify_1.stringVerifier("transDate", transDate),
            hive_verify_1.stringVerifier("seatCount", seatCount),
            hive_verify_1.stringVerifier("isLoanCar", isLoanCar),
            hive_verify_1.stringVerifier("cityCode", cityCode),
            hive_verify_1.stringVerifier("ownerName", ownerName),
            hive_verify_1.stringVerifier("ownerMobile", ownerMobile),
            hive_verify_1.stringVerifier("ownerIdNo", ownerIdNo),
            hive_verify_1.stringVerifier("registerDate", registerDate)
        ], (errors) => {
            return Promise.reject({
                code: 403,
                msg: errors.join("\n")
            });
        })) {
        }
        return new Promise((resolve, reject) => {
            const getNextPolicyDateTimeString = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
            const requestData = {
                "channelCode": "FENGCHAOHUZHU_SERVICE",
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
            const getNextPolicyDatePostData = JSON.stringify(req);
            logInfo(options, `sn: ${sn}, getNextPolicyDate => getNextPolicyDatePostData: ${getNextPolicyDatePostData}`);
            let hostpath = isTestHost ? "/zkyq-web/preRelcalculate/fuzzy" : "/zkyq-web/calculate/fuzzy";
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
    car, // 车辆信息
    person, // 人员信息
    insurerCode, // 保险人代码
    coverageList, // 险别列表
    options // 可选参数
    ) {
    return __awaiter(this, void 0, void 0, function* () {
        const sn = crypto.randomBytes(64).toString("base64");
        logInfo(options, `sn: ${sn}, getReferrencePrice => RequestTime: ${new Date()}, requestData: { cityCode: ${cityCode}, responseNo: ${responseNo}, car: ${JSON.stringify(car)}, person: ${JSON.stringify(person)}, insurerCode: ${insurerCode}, coverageList: ${JSON.stringify(coverageList)} }`);
        if (!hive_verify_1.verify([
            hive_verify_1.stringVerifier("cityCode", cityCode),
            hive_verify_1.stringVerifier("responseNo", responseNo),
            hive_verify_1.stringVerifier("insurerCode", insurerCode)
        ], (errors) => {
            return Promise.reject({
                code: 403,
                msg: errors.join("\n")
            });
        })) {
        }
        return new Promise((resolve, reject) => {
            const getReferrencePriceTimeString = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
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
            const getReferrencePricePostData = JSON.stringify(req);
            logInfo(options, `sn: ${sn}, getReferrencePrice => getReferrencePricePostData: ${getReferrencePricePostData}`);
            console.log(`sn: ${sn}, getReferrencePrice => getReferrencePricePostData: ${getReferrencePricePostData}`);
            let hostpath = isTestHost ? "/zkyq-web/calculate/entrance" : "/zkyq-web/calculate/entrance";
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
function getAccuratePrice(thpBizID, // 请求方业务号
    cityCode, // 行驶城市代码
    responseNo, // 响应码
    biBeginDate, // 商业险起期
    ciBeginDate, // 交强险去起期
    car, // 车辆信息
    person, // 人员信息
    insurerCode, // 保险人代码
    coverageList, // 险别列表
    options // 可选参数
    ) {
    return __awaiter(this, void 0, void 0, function* () {
        const sn = crypto.randomBytes(64).toString("base64");
        logInfo(options, `sn: ${sn}, getAccuratePrice => RequestTime: ${new Date()}, requestData: { thpBizID: ${thpBizID}, cityCode: ${cityCode}, responseNo: ${responseNo}, biBeginDate: ${biBeginDate}, ciBeginDate: ${ciBeginDate}, car: ${JSON.stringify(car)}, person: ${JSON.stringify(person)}, insurerCode: ${insurerCode}, coverageList: ${JSON.stringify(coverageList)} }`);
        if (!hive_verify_1.verify([
            hive_verify_1.stringVerifier("thpBizID", thpBizID),
            hive_verify_1.stringVerifier("cityCode", cityCode),
            hive_verify_1.stringVerifier("responseNo", responseNo),
            hive_verify_1.stringVerifier("biBeginDate", biBeginDate),
            hive_verify_1.stringVerifier("ciBeginDate", ciBeginDate),
            hive_verify_1.stringVerifier("insurerCode", insurerCode)
        ], (errors) => {
            return Promise.reject({
                code: 403,
                msg: errors.join("\n")
            });
        })) {
        }
        return new Promise((resolve, reject) => {
            const getAccuratePriceTimeString = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
            const requestData = {
                "applicationID": "FENGCHAOHUZHU_SERVICE",
                "thpBizID": thpBizID,
                "cityCode": cityCode,
                "responseNo": responseNo,
                "biBeginDate": biBeginDate,
                "ciBeginDate": ciBeginDate,
                "carInfo": car,
                "personInfo": person,
                "channelCode": null,
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
            let hostpath = isTestHost ? "/zkyq-web/preRelcalculate/CalculateApi" : "/zkyq-web/pottingApi/CalculateApi";
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
function applyPolicyCheck(insurerCode, // 保险人代码
    bizID, // 业务号
    channelCode, // 渠道编码, 从精准报价接口的出参获取
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
        logInfo(options, `sn: ${sn}, applyPolicyCheck => RequestTime: ${new Date()}, requestData: { insurerCode: ${insurerCode}, bizID: ${bizID}，　channelCode: ${channelCode}, applicantName: ${applicantName}, applicantIdNo: ${applicantIdNo}, applicantMobile: ${applicantMobile}, addresseeDetails: ${addresseeDetails}, addresseeCounty: ${addresseeCounty}, addresseeCity: ${addresseeCity}, addresseeProvince: ${addresseeProvince}, policyEmail: ${policyEmail} }`);
        if (!hive_verify_1.verify([
            hive_verify_1.stringVerifier("insurerCode", insurerCode),
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
            return Promise.reject({
                code: 403,
                msg: errors.join("\n")
            });
        })) {
        }
        return new Promise((resolve, reject) => {
            const applyPolicyCheckTimeString = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
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
            const applyPolicyCheckPostData = JSON.stringify(req);
            logInfo(options, `sn: ${sn}, applyPolicyCheck => applyPolicyCheckPostData: ${applyPolicyCheckPostData}`);
            let hostpath = isTestHost ? "/zkyq-web/preRelesePay/reqRes" : "/zkyq-web/apiPay/reqRes";
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
        logInfo(options, `sn: ${sn}, getPayLink => RequestTime: ${new Date()}, requestData: { bizID: ${bizID} }`);
        if (!hive_verify_1.verify([
            hive_verify_1.stringVerifier("bizID", bizID)
        ], (errors) => {
            return Promise.reject({
                code: 403,
                msg: errors.join("\n")
            });
        })) {
        }
        return new Promise((resolve, reject) => {
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
            let hostpath = isTestHost ? "/zkyq-web/preRelesePay/reGetPayLink" : "/zkyq-web/pottingApi/reGetPayLink";
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
function getUnd(bizID, // 业务号
    verificationCode, // 手机号验证码
    options // 可选参数
    ) {
    return __awaiter(this, void 0, void 0, function* () {
        const sn = crypto.randomBytes(64).toString("base64");
        logInfo(options, `sn: ${sn}, getUnd => RequestTime: ${new Date()}, requestData: { bizID: ${bizID}, verificationCode: ${verificationCode} }`);
        if (!hive_verify_1.verify([
            hive_verify_1.stringVerifier("bizID", bizID),
            hive_verify_1.stringVerifier("verificationCode", verificationCode)
        ], (errors) => {
            return Promise.reject({
                code: 403,
                msg: errors.join("\n")
            });
        })) {
        }
        return new Promise((resolve, reject) => {
            const getUndSendTimeString = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
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
            const getUndPostData = JSON.stringify(req);
            logInfo(options, `sn: ${sn}, getUnd => ReplyTime: ${new Date()} , getUndPostData: ${getUndPostData}`);
            let hostpath = isTestHost ? "/zkyq-web/preRelesePay/getUndInfo" : "/zkyq-web/pottingApi/getUndInfo";
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
                let getUndResult = "";
                res.on("data", (body) => {
                    getUndResult += body;
                });
                res.on("end", () => {
                    logInfo(options, `sn: ${sn}, getUnd => End of getUndReq`);
                    const repData = JSON.parse(getUndResult);
                    logInfo(options, `sn: ${sn}, getUnd => getUndResult: ${getUndResult}`);
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
                    logError(options, `sn: ${sn}, Error on getUnd: ${err}`);
                    reject({
                        code: 500,
                        msg: err
                    });
                });
            });
            getUndReq.end(getUndPostData);
        });
    });
}
exports.getUnd = getUnd;
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
