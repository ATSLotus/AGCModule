/*
 * @Author: ATSLotus/时桐
 * @Date: 2022-09-12 15:35:25
 * @LastEditors: ATSLotus/时桐
 * @LastEditTime: 2022-10-10 08:55:29
 * @Description: 
 * @FilePath: /agc/src/assets/js/cloudDatabase/cloudDatabase.js
 */
import { context } from "@/assets/js/connectConfig";

import agconnect from "@agconnect/api";
import "@agconnect/instance"; 

import * as database from "@agconnect/database";

agconnect.instance().configInstance(context);

let agcCloudDB;
let cloudDBZone;
export var isSuccess = false;

const schema = require("@/components/config/ezpsyDB.json");

/**
 * @description: 数据库初始化
 * @Date: 2022-09-06 09:03:58
 */
export async function init() {

    await database.AGConnectCloudDB.initialize(context);

    agcCloudDB = await database.AGConnectCloudDB.getInstance();
    await agcCloudDB.createObjectType(schema);
    console.dir("create CloudDB success:")
    console.dir(agcCloudDB);

    const config = new database.CloudDBZoneConfig('Ezpsy');
    cloudDBZone = await agcCloudDB.openCloudDBZone(config);
    console.dir("create cloudDBZone success:");
    console.dir(cloudDBZone);
    isSuccess = true;

}

/**
 * @description: 关闭云数据库空间
 * @Date: 2022-10-10 08:49:22
 */
export async function close() {
    agcCloudDB.closeCloudDBZone(cloudDBZone);
}

/**
 * @description: 增加新的数据
 * @Date: 2022-10-10 08:49:45
 * @param {Class} Data
 * @return {*}
 */
export async function addNewData(Data){
    try {
        const cloudDBZoneResult = await cloudDBZone.executeUpsert(Data);
        console.log('upsert ' + cloudDBZoneResult + ' record');
        return cloudDBZoneResult;
    } catch (e) {
        console.log(e);
    }
}

/**
 * @description: 获取数据库列表
 * @Date: 2022-10-10 08:50:38
 * @param {*} className 数据库类
 * @param {*} keyName 关键词字段
 * @param {*} key 关键词
 * @return {*}
 */
export async function getQuery(className,keyName,key){
    const query = await database.CloudDBZoneQuery.where(className).equalTo(keyName, key);
    return query;
}

/**
 * @description: 查询某表单下的所有数据
 * @Date: 2022-10-10 08:54:04
 * @param {*} obj 数据库类
 * @return {*}
 */
export async function executeQueryAll(obj){
    try {
        const query = database.CloudDBZoneQuery.where(obj);
        const snapshot = await cloudDBZone.executeQuery(query);
        const resultArray = snapshot.getSnapshotObjects();
        console.log(resultArray);
        return resultArray;
    } catch(e) {
        console.log(e);
        return e;
    }
}

/**
 * @description: 查询方法
 * @Date: 2022-09-06 08:53:05
 * @param {*} cloudDBZoneQuery
 * @return {*}
 */
export async function executeQuery(cloudDBZoneQuery) {
    try {
        const snapshot = await cloudDBZone.executeQuery(cloudDBZoneQuery);
        const resultArray = snapshot.getSnapshotObjects();
        return resultArray;
    } catch (e) {
        return e;
    }
}

/**
 * @description: 删除方法, 通过主键删除
 * @Date: 2022-09-06 10:14:14
 * @param {*} Obj 数据库类实例
 * @return {*}
 */
export async function executeDelete (Obj) {
    try {
        const num = await cloudDBZone.executeDelete(Obj);
        return num;
    } catch (e) {
        console.log(e);
        return 0;
    }
}