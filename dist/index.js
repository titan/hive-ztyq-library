"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const hive_verify_1 = require("hive-verify");
const crypto = require("crypto");
const msgpack = require("msgpack-lite");
// 查询城市
async function getCity(provinceCode, // 省国标码
    options // 可选参数
) {
    const sn = options.sn;
    const unity = crypto.randomBytes(64).toString("base64");
    logInfo(options, `sn: ${sn}, getCity => RequestTime: ${new Date()}, requestData: { provinceCode: ${provinceCode} }`);
    try {
        await hive_verify_1.verify([
            hive_verify_1.stringVerifier("provinceCode", provinceCode)
        ]);
    }
    catch (err) {
        return {
            code: 410,
            message: err.message
        };
    }
    return new Promise((resolve, reject) => {
        const getCityTimeString = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
        const requestData = {
            "applicationID": "FENGCHAOHUZHU_SERVICE",
            "provinceCode": provinceCode
        };
        const req = {
            "operType": "QCC",
            "msg": "",
            "sendTime": getCityTimeString,
            "sign": null,
            "data": requestData
        };
        const getCityPostData = JSON.stringify(req);
        const disque = options.disque;
        sendMessage(options, getCityPostData, "request", unity, provinceCode);
        logInfo(options, `sn: ${sn}, getCity => getCityPostData: ${getCityPostData}`);
        let hostpath = "/zkyq-web/city/queryCity";
        const getCityOptions = {
            "hostname": "api.ztwltech.com",
            "port": 80,
            "method": "POST",
            "path": "/zkyq-web/city/queryCity",
            "headers": {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(getCityPostData)
            }
        };
        const getCityReq = http.request(getCityOptions, function (res) {
            res.setEncoding("utf8");
            let getCityResult = "";
            res.on("data", (body) => {
                getCityResult += body;
            });
            res.on("end", () => {
                const repData = JSON.parse(getCityResult);
                sendMessage(options, getCityResult, "response", unity, provinceCode);
                logInfo(options, `sn: ${sn}, getCity => ReplyTime: ${new Date()} , getCityResult: ${getCityResult}`);
                if (repData["state"] === "1") {
                    if (repData["data"] && repData["data"].length > 0) {
                        let replyData = [];
                        let cityList = repData["data"];
                        for (let ct of cityList) {
                            const city = {
                                cityCode: ct["cityCode"],
                                cityName: ct["cityName"],
                                cityPlate: ct["cityPlate"]
                            };
                            replyData.push(city);
                        }
                        resolve({
                            code: 200,
                            data: replyData
                        });
                    }
                    else {
                        // 从响应报文看,此情况从未出现
                        reject({
                            code: 404,
                            message: getCityResult
                        });
                    }
                }
                else {
                    reject({
                        code: 400,
                        message: getCityResult
                    });
                }
            });
            res.setTimeout(6000, () => {
                reject({
                    code: 408,
                    message: "智通接口超时"
                });
            });
            res.on("error", (err) => {
                logError(options, `sn: ${sn}, Error on getCity: ${err}`);
                reject({
                    code: 500,
                    message: err
                });
            });
        });
        getCityReq.end(getCityPostData);
    });
}
exports.getCity = getCity;
// 查询车辆信息(根据车牌号查询)
async function getVehicleByLicense(licenseNo, // 车牌号码
    options // 可选参数
) {
    const sn = options.sn;
    const unity = crypto.randomBytes(64).toString("base64");
    logInfo(options, `sn: ${sn}, getVehicleByLicense => RequestTime: ${new Date()}, requestData: { licenseNo: ${licenseNo} }`);
    try {
        await hive_verify_1.verify([
            hive_verify_1.stringVerifier("licenseNo", licenseNo)
        ]);
    }
    catch (err) {
        return {
            code: 410,
            message: err.message
        };
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
        sendMessage(options, getVehicleByLicensePostData, "request", unity, licenseNo);
        logInfo(options, `sn: ${sn}, getVehicleByLicense => getVehicleByLicensePostData: ${getVehicleByLicensePostData}`);
        const getVehicleByLicenseOptions = {
            "hostname": "api.ztwltech.com",
            "port": 80,
            "method": "POST",
            "path": "/zkyq-web/pottingApi/information",
            "headers": {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(getVehicleByLicensePostData)
            }
        };
        const getVehicleByLicenseReq = http.request(getVehicleByLicenseOptions, function (res) {
            res.setEncoding("utf8");
            let getVehicleByLicenseResult = "";
            res.on("data", (body) => {
                getVehicleByLicenseResult += body;
            });
            res.on("end", () => {
                const repData = JSON.parse(getVehicleByLicenseResult);
                sendMessage(options, getVehicleByLicenseResult, "response", unity, licenseNo);
                logInfo(options, `sn: ${sn}, getVehicleByLicense => ReplyTime: ${new Date()} , getVehicleByLicenseResult: ${getVehicleByLicenseResult}`);
                if (repData["state"] === "1") {
                    if (repData["data"]) {
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
                        // 从响应报文看,此情况从未出现
                        reject({
                            code: 404,
                            message: getVehicleByLicenseResult
                        });
                    }
                }
                else {
                    reject({
                        code: 400,
                        message: getVehicleByLicenseResult
                    });
                }
            });
            res.setTimeout(6000, () => {
                reject({
                    code: 408,
                    message: "智通接口超时"
                });
            });
            res.on("error", (err) => {
                logError(options, `sn: ${sn}, Error on getVehicleByLicense: ${err}`);
                reject({
                    code: 500,
                    message: err
                });
            });
        });
        getVehicleByLicenseReq.end(getVehicleByLicensePostData);
    });
}
exports.getVehicleByLicense = getVehicleByLicense;
// 查询车辆信息(根据车架号据查询)
async function getVehicleByFrameNo(frameNo, // 车架号
    options // 可选参数
) {
    const sn = options.sn;
    const unity = crypto.randomBytes(64).toString("base64");
    logInfo(options, `sn: ${sn}, getVehicleByFrameNo => RequestTime: ${new Date()}, requestData: { frameNo: ${frameNo} }`);
    try {
        await hive_verify_1.verify([
            hive_verify_1.stringVerifier("frameNo", frameNo)
        ]);
    }
    catch (err) {
        return {
            code: 410,
            message: err.message
        };
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
        sendMessage(options, getVehicleByFrameNoPostData, "request", unity, frameNo);
        logInfo(options, `sn: ${sn}, getVehicleByFrameNo => getVehicleByFrameNoPostData: ${getVehicleByFrameNoPostData}`);
        const getVehicleByFrameNoOptions = {
            "hostname": "api.ztwltech.com",
            "port": 80,
            "method": "POST",
            "path": "/zkyq-web/pottingApi/queryCarinfoByVin",
            "headers": {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(getVehicleByFrameNoPostData)
            }
        };
        const getVehicleByFrameNoReq = http.request(getVehicleByFrameNoOptions, function (res) {
            res.setEncoding("utf8");
            let getVehicleByFrameNoResult = "";
            res.on("data", (body) => {
                getVehicleByFrameNoResult += body;
            });
            res.on("end", () => {
                const repData = JSON.parse(getVehicleByFrameNoResult);
                sendMessage(options, getVehicleByFrameNoResult, "response", unity, frameNo);
                logInfo(options, `sn: ${sn}, getVehicleByFrameNo => ReplyTime: ${new Date()} , getVehicleByFrameNoResult: ${getVehicleByFrameNoResult}`);
                if (repData["state"] === "1") {
                    if (repData["data"]) {
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
                        // 从响应报文看,此情况从未出现
                        reject({
                            code: 404,
                            message: getVehicleByFrameNoResult
                        });
                    }
                }
                else {
                    reject({ code: 400, message: getVehicleByFrameNoResult });
                }
            });
            res.setTimeout(6000, () => {
                reject({
                    code: 408,
                    message: "智通接口超时"
                });
            });
            res.on("error", (err) => {
                logError(options, `sn: ${sn}, Error on getVehicleByFrameNo: ${err}`);
                reject({
                    code: 500,
                    message: err
                });
            });
        });
        getVehicleByFrameNoReq.end(getVehicleByFrameNoPostData);
    });
}
exports.getVehicleByFrameNo = getVehicleByFrameNo;
// 查询车型信息
async function getCarModel(frameNo, // 车架号
    licenseNo, // 车牌信息
    responseNo, // 响应码
    options // 可选参数
) {
    const sn = options.sn;
    const unity = crypto.randomBytes(64).toString("base64");
    logInfo(options, `sn: ${sn}, getCarModel => RequestTime: ${new Date()}, requestData: { frameNo: ${frameNo}, licenseNo: ${licenseNo}, responseNo: ${responseNo} }`);
    try {
        await hive_verify_1.verify([
            hive_verify_1.stringVerifier("frameNo", frameNo),
            hive_verify_1.stringVerifier("licenseNo", licenseNo),
            hive_verify_1.stringVerifier("responseNo", responseNo)
        ]);
    }
    catch (err) {
        return {
            code: 410,
            message: err.message
        };
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
        sendMessage(options, getCarModelPostData, "request", unity, licenseNo);
        logInfo(options, `sn: ${sn}, getCarModel => getCarModelPostData: ${getCarModelPostData}`);
        const getCarModelOptions = {
            "hostname": "api.ztwltech.com",
            "port": 80,
            "method": "POST",
            "path": "/zkyq-web/pottingApi/information",
            "headers": {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(getCarModelPostData)
            }
        };
        const getCarModelReq = http.request(getCarModelOptions, function (res) {
            res.setEncoding("utf8");
            let getCarModelResult = "";
            res.on("data", (body) => {
                getCarModelResult += body;
            });
            res.on("end", () => {
                const repData = JSON.parse(getCarModelResult);
                sendMessage(options, getCarModelResult, "response", unity, licenseNo);
                logInfo(options, `sn: ${sn}, getCarModel => ReplyTime: ${new Date()} , getCarModelResult: ${getCarModelResult}`);
                if (repData["state"] === "1") {
                    if (repData["data"] && repData["data"].length > 0) {
                        let replyData = [];
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
                                purchasePrice: data["purchasePrice"],
                                seatCount: data["seat"],
                                standardName: data["standardName"]
                            };
                            replyData.push(vehicle);
                        }
                        resolve({
                            code: 200,
                            data: replyData
                        });
                    }
                    else {
                        // 从响应报文看,此情况从未出现
                        reject({
                            code: 404,
                            message: getCarModelResult
                        });
                    }
                }
                else {
                    reject({ code: 400, message: getCarModelResult });
                }
            });
            res.setTimeout(6000, () => {
                reject({
                    code: 408,
                    message: "智通接口超时"
                });
            });
            res.on("error", (err) => {
                logError(options, `sn: ${sn}, Error on getCarModel: ${err}`);
                reject({
                    code: 500,
                    message: err
                });
            });
        });
        getCarModelReq.end(getCarModelPostData);
    });
}
exports.getCarModel = getCarModel;
// 模糊匹配车型
async function getFuzzyVehicle(brandName, // 品牌型号名称
    row, // 行数
    page, // 当前页
    options // 可选参数
) {
    const sn = options.sn;
    const unity = crypto.randomBytes(64).toString("base64");
    logInfo(options, `sn: ${sn}, getFuzzyVehicle => RequestTime: ${new Date()}, requestData: { brandName: ${brandName}, row: ${row}, page: ${page} }`);
    try {
        await hive_verify_1.verify([
            hive_verify_1.stringVerifier("brandName", brandName),
            hive_verify_1.stringVerifier("row", row),
            hive_verify_1.stringVerifier("page", page)
        ]);
    }
    catch (err) {
        return {
            code: 410,
            message: err.message
        };
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
        sendMessage(options, getFuzzyVehiclePostData, "request", unity, brandName);
        logInfo(options, `sn: ${sn}, getFuzzyVehicle => getFuzzyVehiclePostData: ${getFuzzyVehiclePostData}`);
        const getFuzzyVehicleOptions = {
            "hostname": "api.ztwltech.com",
            "port": 80,
            "method": "POST",
            "path": "/zkyq-web/pottingApi/information",
            "headers": {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(getFuzzyVehiclePostData)
            }
        };
        const getFuzzyVehicleReq = http.request(getFuzzyVehicleOptions, function (res) {
            res.setEncoding("utf8");
            let getFuzzyVehicleResult = "";
            res.on("data", (body) => {
                getFuzzyVehicleResult += body;
            });
            res.on("end", () => {
                const repData = JSON.parse(getFuzzyVehicleResult);
                sendMessage(options, getFuzzyVehicleResult, "response", unity, brandName);
                logInfo(options, `sn: ${sn}, getFuzzyVehicle => ReplyTime: ${new Date()} , getFuzzyVehicleResult: ${getFuzzyVehicleResult}`);
                if (repData["state"] === "1") {
                    if (repData["data"] && repData["data"].length > 0) {
                        let replyData = [];
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
                        resolve({
                            code: 200,
                            data: replyData
                        });
                    }
                    else {
                        // 从响应报文看,此情况从未出现
                        reject({
                            code: 404,
                            message: getFuzzyVehicleResult
                        });
                    }
                }
                else {
                    reject({ code: 400, message: getFuzzyVehicleResult });
                }
            });
            res.setTimeout(6000, () => {
                reject({
                    code: 408,
                    message: "智通接口超时"
                });
            });
            res.on("error", (err) => {
                logError(options, `sn: ${sn}, Error on getFuzzyVehicle: ${err}`);
                reject({
                    code: 500,
                    message: err
                });
            });
        });
        getFuzzyVehicleReq.end(getFuzzyVehiclePostData);
    });
}
exports.getFuzzyVehicle = getFuzzyVehicle;
// 获取下期投保起期
async function getNextPolicyDate(responseNo, // 响应码
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
    const sn = options.sn;
    const unity = crypto.randomBytes(64).toString("base64");
    logInfo(options, `sn: ${sn}, getNextPolicyDate => RequestTime: ${new Date()}, requestData: { responseNo: ${responseNo}, licenseNo: ${licenseNo}, frameNo: ${frameNo}, modelCode: ${modelCode}, engineNo: ${engineNo}, isTrans: ${isTrans}, transDate: ${transDate}, seatCount: ${seatCount}, isLoanCar: ${isLoanCar}, cityCode: ${cityCode}, ownerName: ${ownerName}, ownerMobile: ${ownerMobile}, ownerIdNo: ${ownerIdNo}, registerDate: ${registerDate} }`);
    try {
        await hive_verify_1.verify([
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
        ]);
    }
    catch (err) {
        return {
            code: 410,
            message: err.message
        };
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
        sendMessage(options, getNextPolicyDatePostData, "request", unity, licenseNo);
        logInfo(options, `sn: ${sn}, getNextPolicyDate => getNextPolicyDatePostData: ${getNextPolicyDatePostData}`);
        const getNextPolicyDateOptions = {
            "hostname": "api.ztwltech.com",
            "port": 80,
            "method": "POST",
            "path": "/zkyq-web/calculate/fuzzy",
            "headers": {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(getNextPolicyDatePostData)
            }
        };
        const getNextPolicyDateReq = http.request(getNextPolicyDateOptions, function (res) {
            res.setEncoding("utf8");
            let getNextPolicyDateResult = "";
            res.on("data", (body) => {
                getNextPolicyDateResult += body;
            });
            res.on("end", () => {
                const repData = JSON.parse(getNextPolicyDateResult);
                sendMessage(options, getNextPolicyDateResult, "response", unity, licenseNo);
                logInfo(options, `sn: ${sn}, getNextPolicyDate => ReplyTime: ${new Date()} , getNextPolicyDateResult: ${getNextPolicyDateResult}`);
                if (repData["state"] === "1") {
                    if (repData["data"]) {
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
                        // 从响应报文看,此情况从未出现
                        reject({
                            code: 404,
                            message: getNextPolicyDateResult
                        });
                    }
                }
                else {
                    reject({ code: 400, message: getNextPolicyDateResult });
                }
            });
            res.setTimeout(6000, () => {
                reject({
                    code: 408,
                    message: "智通接口超时"
                });
            });
            res.on("error", (err) => {
                logError(options, `sn: ${sn}, Error on getNextPolicyDate: ${err}`);
                reject({
                    code: 500,
                    message: err
                });
            });
        });
        getNextPolicyDateReq.end(getNextPolicyDatePostData);
    });
}
exports.getNextPolicyDate = getNextPolicyDate;
// 参考报价
async function getReferencePrice(cityCode, // 行驶城市代码
    responseNo, // 响应码
    licenseNo, // 车牌号码
    frameNo, // 车架号(VIN码)
    modelCode, // 品牌型号代码
    engineNo, // 发动机号
    isTrans, // 是否过户车
    transDate, // 过户日期
    registerDate, // 初登日期
    ownerName, // 车主姓名
    ownerID, // 车主身份证号
    ownerMobile, // 车主手机号
    insurerCode, // 保险人代码
    coverageList, // 险别列表
    options // 可选参数
) {
    const sn = options.sn;
    const unity = crypto.randomBytes(64).toString("base64");
    logInfo(options, `sn: ${sn}, getReferencePrice => RequestTime: ${new Date()}, requestData: { cityCode: ${cityCode}, responseNo: ${responseNo}, licenseNo: ${licenseNo}, frameNo: ${frameNo}, modelCode: ${modelCode}, engineNo: ${engineNo}, isTrans: ${isTrans}, transDate: ${transDate}, registerDate: ${registerDate}, ownerName: ${ownerName}, ownerID: ${ownerID}, ownerMobile: ${ownerMobile}, insurerCode: ${insurerCode}, coverageList: ${JSON.stringify(coverageList)} }`);
    try {
        await hive_verify_1.verify([
            hive_verify_1.stringVerifier("cityCode", cityCode),
            hive_verify_1.stringVerifier("responseNo", responseNo),
            hive_verify_1.stringVerifier("insurerCode", insurerCode)
        ]);
    }
    catch (err) {
        return {
            code: 410,
            message: err.message
        };
    }
    return new Promise((resolve, reject) => {
        const getReferencePriceTimeString = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
        const carInfo = {
            "licenseNo": licenseNo,
            "frameNo": frameNo,
            "modelCode": modelCode,
            "engineNo": engineNo,
            "isTrans": isTrans,
            "transDate": transDate,
            "registerDate": registerDate
        };
        const personInfo = {
            "ownerName": ownerName,
            "ownerID": ownerID,
            "ownerMobile": ownerMobile
        };
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
            "sendTime": getReferencePriceTimeString,
            "sign": null,
            "data": requestData
        };
        const getReferencePricePostData = JSON.stringify(req);
        sendMessage(options, getReferencePricePostData, "request", unity, licenseNo);
        logInfo(options, `sn: ${sn}, getReferencePrice => getReferencePricePostData: ${getReferencePricePostData}`);
        const getReferencePriceOptions = {
            "hostname": "api.ztwltech.com",
            "port": 80,
            "method": "POST",
            "path": "/zkyq-web/calculate/entrance",
            "headers": {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(getReferencePricePostData)
            }
        };
        const getReferencePriceReq = http.request(getReferencePriceOptions, function (res) {
            res.setEncoding("utf8");
            let getReferencePriceResult = "";
            res.on("data", (body) => {
                getReferencePriceResult += body;
            });
            res.on("end", () => {
                const repData = JSON.parse(getReferencePriceResult);
                sendMessage(options, getReferencePriceResult, "response", unity, licenseNo);
                logInfo(options, `sn: ${sn}, getReferencePrice => ReplyTime: ${new Date()} , getReferencePriceResult: ${getReferencePriceResult}`);
                if (repData["state"] === "1") {
                    if (repData["data"] && repData["data"].length > 0) {
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
                        // 从响应报文看,此情况从未出现
                        reject({
                            code: 404,
                            message: getReferencePriceResult
                        });
                    }
                }
                else {
                    reject({ code: 400, message: getReferencePriceResult });
                }
            });
            res.setTimeout(6000, () => {
                reject({
                    code: 408,
                    message: "智通接口超时"
                });
            });
            res.on("error", (err) => {
                logError(options, `sn: ${sn}, Error on getReferencePrice: ${err}`);
                reject({
                    code: 500,
                    message: err
                });
            });
        });
        getReferencePriceReq.end(getReferencePricePostData);
    });
}
exports.getReferencePrice = getReferencePrice;
// 精准报价
async function getAccuratePrice(thpBizID, // 请求方业务号
    cityCode, // 行驶城市代码
    responseNo, // 响应码
    biBeginDate, // 商业险起期
    ciBeginDate, // 交强险去起期
    licenseNo, // 车牌号码
    frameNo, // 车架号(VIN码)
    modelCode, // 品牌型号代码
    engineNo, // 发动机号
    isTrans, // 是否过户车
    transDate, // 过户日期
    registerDate, // 初登日期
    ownerName, // 车主姓名
    ownerID, // 车主身份证号
    ownerMobile, // 车主手机号
    insuredName, // 被保人姓名
    insuredID, // 被保人身份证号
    insuredMobile, // 被保人手机号
    insurerCode, // 保险人代码
    coverageList, // 险别列表
    options // 可选参数
) {
    const sn = options.sn;
    const unity = crypto.randomBytes(64).toString("base64");
    logInfo(options, `sn: ${sn}, getAccuratePrice => RequestTime: ${new Date()}, requestData: { thpBizID: ${thpBizID}, cityCode: ${cityCode}, responseNo: ${responseNo}, biBeginDate: ${biBeginDate}, ciBeginDate: ${ciBeginDate}, licenseNo: ${licenseNo}, frameNo: ${frameNo}, modelCode: ${modelCode}, engineNo: ${engineNo}, isTrans: ${isTrans}, transDate: ${transDate}, registerDate: ${registerDate}, ownerName: ${ownerName}, ownerID: ${ownerID}, ownerMobile: ${ownerMobile}, insuredName: ${insuredName}, insuredID: ${insuredID}, insuredMobile: ${insuredMobile}, insurerCode: ${insurerCode}, coverageList: ${JSON.stringify(coverageList)} }`);
    try {
        await hive_verify_1.verify([
            hive_verify_1.stringVerifier("thpBizID", thpBizID),
            hive_verify_1.stringVerifier("cityCode", cityCode),
            hive_verify_1.stringVerifier("responseNo", responseNo),
            hive_verify_1.stringVerifier("biBeginDate", biBeginDate),
            hive_verify_1.stringVerifier("ciBeginDate", ciBeginDate),
            hive_verify_1.stringVerifier("insurerCode", insurerCode)
        ]);
    }
    catch (err) {
        return {
            code: 410,
            message: err.message
        };
    }
    return new Promise((resolve, reject) => {
        const getAccuratePriceTimeString = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
        const carInfo = {
            "licenseNo": licenseNo,
            "frameNo": frameNo,
            "modelCode": modelCode,
            "engineNo": engineNo,
            "isTrans": isTrans,
            "transDate": transDate,
            "registerDate": registerDate
        };
        const personInfo = {
            "ownerName": ownerName,
            "ownerID": ownerID,
            "ownerMobile": ownerMobile,
            "insuredName": insuredName,
            "insuredID": insuredID,
            "insuredMobile": insuredMobile
        };
        const requestData = {
            "applicationID": "FENGCHAOHUZHU_SERVICE",
            "thpBizID": thpBizID,
            "cityCode": cityCode,
            "responseNo": responseNo,
            "biBeginDate": biBeginDate,
            "ciBeginDate": ciBeginDate,
            "carInfo": carInfo,
            "personInfo": personInfo,
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
        sendMessage(options, getAccuratePricePostData, "request", unity, licenseNo);
        logInfo(options, `sn: ${sn}, getAccuratePrice => getAccuratePricePostData: ${getAccuratePricePostData}`);
        const getAccuratePriceOptions = {
            "hostname": "api.ztwltech.com",
            "port": 80,
            "method": "POST",
            "path": "/zkyq-web/pottingApi/CalculateApi",
            "headers": {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(getAccuratePricePostData)
            }
        };
        const getAccuratePriceReq = http.request(getAccuratePriceOptions, function (res) {
            res.setEncoding("utf8");
            let getAccuratePriceResult = "";
            res.on("data", (body) => {
                getAccuratePriceResult += body;
            });
            res.on("end", () => {
                const repData = JSON.parse(getAccuratePriceResult);
                sendMessage(options, getAccuratePriceResult, "response", unity, licenseNo);
                logInfo(options, `sn: ${sn}, getAccuratePrice => ReplyTime: ${new Date()} , getAccuratePriceResult: ${getAccuratePriceResult}`);
                if (repData["state"] === "1") {
                    if (repData["data"] && repData["data"].length > 0) {
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
                        // 从响应报文看,此情况从未出现
                        reject({
                            code: 404,
                            message: getAccuratePriceResult
                        });
                    }
                }
                else {
                    reject({ code: 400, message: getAccuratePriceResult });
                }
            });
            res.setTimeout(6000, () => {
                reject({
                    code: 408,
                    message: "智通接口超时"
                });
            });
            res.on("error", (err) => {
                logError(options, `sn: ${sn}, Error on getAccuratePrice: ${err}`);
                reject({
                    code: 500,
                    message: err
                });
            });
        });
        getAccuratePriceReq.end(getAccuratePricePostData);
    });
}
exports.getAccuratePrice = getAccuratePrice;
// 申请核保
async function applyPolicyCheck(insurerCode, // 保险人代码
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
    const sn = options.sn;
    const unity = crypto.randomBytes(64).toString("base64");
    logInfo(options, `sn: ${sn}, applyPolicyCheck => RequestTime: ${new Date()}, requestData: { insurerCode: ${insurerCode}, bizID: ${bizID}，　channelCode: ${channelCode}, applicantName: ${applicantName}, applicantIdNo: ${applicantIdNo}, applicantMobile: ${applicantMobile}, addresseeDetails: ${addresseeDetails}, addresseeCounty: ${addresseeCounty}, addresseeCity: ${addresseeCity}, addresseeProvince: ${addresseeProvince}, policyEmail: ${policyEmail} }`);
    try {
        await hive_verify_1.verify([
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
        ]);
    }
    catch (err) {
        return {
            code: 410,
            message: err.message
        };
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
        sendMessage(options, applyPolicyCheckPostData, "request", unity, bizID);
        logInfo(options, `sn: ${sn}, applyPolicyCheck => applyPolicyCheckPostData: ${applyPolicyCheckPostData}`);
        const applyPolicyCheckOptions = {
            "hostname": "api.ztwltech.com",
            "port": 80,
            "method": "POST",
            "path": "/zkyq-web/apiPay/reqRes",
            "headers": {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(applyPolicyCheckPostData)
            }
        };
        const applyPolicyCheckReq = http.request(applyPolicyCheckOptions, function (res) {
            res.setEncoding("utf8");
            let applyPolicyCheckResult = "";
            res.on("data", (body) => {
                applyPolicyCheckResult += body;
            });
            res.on("end", () => {
                const repData = JSON.parse(applyPolicyCheckResult);
                sendMessage(options, applyPolicyCheckResult, "response", unity, bizID);
                logInfo(options, `sn: ${sn}, applyPolicyCheck => ReplyTime: ${new Date()} , applyPolicyCheckResult: ${applyPolicyCheckResult}`);
                if (repData["state"] === "1") {
                    if (repData["data"]) {
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
                        // 从响应报文看,此情况从未出现
                        reject({
                            code: 404,
                            message: applyPolicyCheckResult
                        });
                    }
                }
                else {
                    reject({ code: 400, message: applyPolicyCheckResult });
                }
            });
            res.setTimeout(6000, () => {
                reject({
                    code: 408,
                    message: "智通接口超时"
                });
            });
            res.on("error", (err) => {
                logError(options, `sn: ${sn}, Error on applyPolicyCheck: ${err}`);
                reject({
                    code: 500,
                    message: err
                });
            });
        });
        applyPolicyCheckReq.end(applyPolicyCheckPostData);
    });
}
exports.applyPolicyCheck = applyPolicyCheck;
// 获取支付链接
async function getPaylink(bizID, // 业务号
    options // 可选参数
) {
    const sn = options.sn;
    const unity = crypto.randomBytes(64).toString("base64");
    logInfo(options, `sn: ${sn}, getPayLink => RequestTime: ${new Date()}, requestData: { bizID: ${bizID} }`);
    try {
        await hive_verify_1.verify([
            hive_verify_1.stringVerifier("bizID", bizID)
        ]);
    }
    catch (err) {
        return {
            code: 410,
            message: err.message
        };
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
        sendMessage(options, paylinkPostData, "request", unity, bizID);
        logInfo(options, `sn: ${sn}, getPayLink => paylinkPostData: ${paylinkPostData}`);
        const paylinkOptions = {
            "hostname": "api.ztwltech.com",
            "port": 80,
            "method": "POST",
            "path": "/zkyq-web/pottingApi/reGetPayLink",
            "headers": {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(paylinkPostData)
            }
        };
        const paylinkReq = http.request(paylinkOptions, function (res) {
            res.setEncoding("utf8");
            let paylinkResult = "";
            res.on("data", (body) => {
                paylinkResult += body;
            });
            res.on("end", () => {
                const repData = JSON.parse(paylinkResult);
                sendMessage(options, paylinkResult, "response", unity, bizID);
                logInfo(options, `sn: ${sn}, getPayLink => ReplyTime: ${new Date()}, paylinkResult: ${paylinkResult}`);
                if (repData["state"] === "1") {
                    if (repData["data"]) {
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
                        // 从响应报文看,此情况从未出现
                        reject({
                            code: 404,
                            message: paylinkResult
                        });
                    }
                }
                else {
                    reject({
                        code: 400,
                        message: paylinkResult
                    });
                }
            });
            res.setTimeout(6000, () => {
                reject({
                    code: 408,
                    message: "智通接口超时"
                });
            });
            res.on("error", (err) => {
                logError(options, `sn: ${sn}, Error on getPayLink: ${err}`);
                reject({
                    code: 500,
                    message: err
                });
            });
        });
        paylinkReq.end(paylinkPostData);
    });
}
exports.getPaylink = getPaylink;
// 手机号验证码接口
async function getUnd(bizID, // 业务号
    verificationCode, // 手机号验证码
    options // 可选参数
) {
    const sn = options.sn;
    const unity = crypto.randomBytes(64).toString("base64");
    logInfo(options, `sn: ${sn}, getUnd => RequestTime: ${new Date()}, requestData: { bizID: ${bizID}, verificationCode: ${verificationCode} }`);
    try {
        await hive_verify_1.verify([
            hive_verify_1.stringVerifier("bizID", bizID),
            hive_verify_1.stringVerifier("verificationCode", verificationCode)
        ]);
    }
    catch (err) {
        return {
            code: 410,
            message: err.message
        };
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
        sendMessage(options, getUndPostData, "request", unity, bizID);
        logInfo(options, `sn: ${sn}, getUnd => getUndPostData: ${getUndPostData}`);
        const getUndOptions = {
            "hostname": "api.ztwltech.com",
            "port": 80,
            "method": "POST",
            "path": "/zkyq-web/pottingApi/getUndInfo",
            "headers": {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(getUndPostData)
            }
        };
        const getUndReq = http.request(getUndOptions, function (res) {
            res.setEncoding("utf8");
            let getUndResult = "";
            res.on("data", (body) => {
                getUndResult += body;
            });
            res.on("end", () => {
                const repData = JSON.parse(getUndResult);
                sendMessage(options, getUndResult, "response", unity, bizID);
                logInfo(options, `sn: ${sn}, getUnd =>  ReplyTime: ${new Date()}, getUndResult: ${getUndResult}`);
                if (repData["state"] === "1") {
                    if (repData["data"]) {
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
                        // 从响应报文看,此情况从未出现
                        reject({
                            code: 404,
                            message: getUndResult
                        });
                    }
                }
                else {
                    reject({
                        code: 400,
                        message: getUndResult
                    });
                }
            });
            res.setTimeout(6000, () => {
                reject({
                    code: 408,
                    message: "智通接口超时"
                });
            });
            res.on("error", (err) => {
                logError(options, `sn: ${sn}, Error on getUnd: ${err}`);
                reject({
                    code: 500,
                    message: err
                });
            });
        });
        getUndReq.end(getUndPostData);
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
// 请求响应记录分析
function sendMessage(options, msg, type, unity, args) {
    if (options && options.disque && options.queue) {
        const sn = options.sn;
        const disque = options.disque;
        const queue = options.queue;
        let job = null;
        if (type === "request") {
            job = {
                "sn": sn,
                "unity": unity,
                "type": type,
                "body": JSON.parse(msg),
                "args": args,
                "src": "智通",
                "timestamp": new Date()
            };
        }
        else {
            job = {
                "sn": sn,
                "unity": unity,
                "type": type,
                "body": JSON.parse(msg),
                "args": args,
                "src": "智通",
                "timestamp": new Date(),
                "state": decorateMessage(msg)
            };
        }
        const job_buff = msgpack.encode(job);
        disque.addjob(queue, job_buff, () => { }, (e) => {
            logError(options, e.message);
        });
    }
}
// 针对响应报文
function decorateMessage(msg) {
    const replyData = JSON.parse(msg);
    if (replyData["state"] === "1") {
        return "成功";
    }
    else {
        return "失败";
    }
}
