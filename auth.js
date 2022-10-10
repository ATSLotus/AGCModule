/*
 * @Author: ATSLotus/时桐
 * @Date: 2022-09-02 19:20:57
 * @LastEditors: ATSLotus/时桐
 * @LastEditTime: 2022-10-10 08:45:39
 * @Description: 
 * @FilePath: /agc/src/assets/js/auth.js
 */
import { context } from "@/assets/js/connectConfig";

import agconnect from "@agconnect/api";
import "@agconnect/instance";

import "@agconnect/auth";

import * as cDB from "@/assets/js/cloudDatabase/cloudDatabase"
import * as roleDB from "@/assets/js/cloudDatabase/sys_roleDB"
import * as userDB from "@/assets/js/cloudDatabase/sys_userDB"
import { sys_role } from "@/components/model/sys_role"
import { sys_user } from "@/components/model/sys_user"

agconnect.instance().configInstance(context);


export class AuthCrypt { }

AuthCrypt.prototype.encrypt = function (value) {
    return value + '---authEncrypt';
}

AuthCrypt.prototype.decrypt = function (value) {
    return value.split('---')[0];
}

export class Crypt {
}

Crypt.prototype.encrypt = function (value) {
    return value + '---encrypt';
}

Crypt.prototype.decrypt = function (value) {
    return value.split('---')[0];
}

// agconnect.instance().setCryptImp(new Crypt());

export function setAuthCryptImp(cryptImpl) {
    agconnect.auth().setCryptImp(cryptImpl);
}

export function setCryptImp(cryptImpl) {
    agconnect.instance().setCryptImp(cryptImpl);
}

/**
 * @description: Set where auth-related data is stored locally。0：indexedDB；1：sessionStorage；2：memory
 * @Date: 2022-09-04 19:02:35
 * @param {number} saveMode 存储模式
 * @return {null}
 */
export function setUserInfoPersistence(saveMode) {
    agconnect.auth().setUserInfoPersistence(saveMode);
}

/**
 * @description: 获取当前登录账号的信息
 * @Date: 2022-10-10 08:33:41
 * @return {Promise<RET>} RET = { res: number, data: msg } 返回函数运行的结果状态以及信息
 */
export function getUserInfo() {

    return agconnect.auth().getCurrentUser().then(user => {
        if (user) {
            //业务逻辑
            return { res: 1, data: user }
        }
        else {
            return { res: 0 }
        }
    });

}

/**
 * @description: 获取登录或注册验证码
 * @Date: 2022-10-10 08:36:57
 * @param {string} countryCode 国际电话区号, 中国为86
 * @param {string} phoneNumber 手机号
 * @param {string} sendInterval 发送验证码间隔, 30-120s
 * @return {Promise<RET>} RET = { res: number, data: msg } 返回函数运行的结果状态以及信息
 */
export function getLoginVerifyCode(countryCode, phoneNumber, sendInterval) {

    return agconnect.auth().requestPhoneVerifyCode(countryCode,
        phoneNumber,
        agconnect.auth.Action.ACTION_REGISTER_LOGIN,
        'zh_CN',//发送验证码的语言
        sendInterval)
        .then(ret => {
            //验证码申请成功
            return { res: 1, data: ret };
        }).catch(error => {
            //验证码申请失败 
            return { res: 0, data: error };
        });
}

/**
 * @description: 获取重置密码验证码
 * @Date: 2022-10-10 08:40:39
 * @param {string} countryCode 国际电话区号, 中国为86
 * @param {string} phoneNumber 手机号
 * @param {string} sendInterval 发送验证码间隔, 30-120s
 * @return {Promise<RET>} RET = { res: number, data: msg } 返回函数运行的结果状态以及信息
 */
export function getResetVerifyCode(countryCode, phoneNumber, sendInterval) {
    return agconnect.auth().requestPhoneVerifyCode(countryCode,
        phoneNumber,
        agconnect.auth.Action.ACTION_RESET_PASSWORD,// 重置密码时action需要传agconnect.auth.Action.ACTION_RESET_PASSWORD
        'zh_CN',//发送验证码的语言
        sendInterval)
        .then(ret => {
            //验证码申请成功
            return { res: 1, data: ret }
        }).catch(error => {
            //验证码申请失败 
            return { res: 0, data: error }
        })
}

/**
 * @description: 注册用户
 * @Date: 2022-10-10 08:41:23
 * @param {string} countryCode 国际电话区号, 中国为86
 * @param {string} phoneNumber 手机号
 * @param {*} password 密码
 * @param {*} verifyCode 验证码
 * @return {Promise<RET>} RET = { res: number, data: msg } 返回函数运行的结果状态以及信息
 */
export function register(countryCode, phoneNumber, password, verifyCode) {
    let phoneUser = new agconnect.auth.PhoneUser(countryCode, phoneNumber, password, verifyCode);
    return agconnect.auth().createPhoneUser(phoneUser)
        .then(async user => {
            //创建用户成功
            return { res: 1, data: user };
        }).catch(error => {
            //创建用户失败
            return { res: 0, data: error };
        });
}

/**
 * @description: 用手机号登录
 * @Date: 2022-10-10 08:42:50
 * @param {string} countryCode 国际电话区号, 中国为86
 * @param {string} phoneNumber 手机号
 * @param {*} password 密码
 * @param {*} verifyCode 验证码
 * @return {Promise<RET>} RET = { res: number, data: msg } 返回函数运行的结果状态以及信息
 */
export function loginByPhone(countryCode, phoneNumber, password, verifyCode) {
    let credential = '';
    if (verifyCode) {
        //验证码登录, 密码可为空
        credential = agconnect.auth.PhoneAuthProvider.credentialWithVerifyCode(countryCode, phoneNumber, password, verifyCode);
    }
    else {
        //密码登录
        credential = agconnect.auth.PhoneAuthProvider.credentialWithPassword(countryCode, phoneNumber, password);
    }

    return agconnect.auth().signIn(credential)
        .then(user => {
            //登录成功
            return { res: 1, data: user };
        }).catch(error => {
            //登录失败
            return { res: 0, data: error };
        });
}

/**
 * @description: 匿名登录
 * @Date: 2022-10-10 08:44:05
 * @return {Promise<RET>} RET = { res: number, data: msg } 返回函数运行的结果状态以及信息
 */
export function loginByAnonymousAccount() {
    return agconnect.auth().signInAnonymously().then(user => {
        //登录成功
        return { res: 1, data: user }
    }).catch(error => {
        //登录失败
        return { res: 0, data: error }
    });
}

/**
 * @description: 
 * @Date: 2022-10-10 08:44:37
 * @param {Function} func 函数方法, 等出成功后执行
 * @return {null}
 */
export function logout(func){
    return agconnect.auth().signOut().then(func)
    .catch(error => {
        //登出失败
        console.dir(error);
    });
}

/**
 * @description: 重置密码
 * @Date: 2022-10-10 08:47:36
 * @param {string} countryCode 国际电话区号, 中国为86
 * @param {string} phoneNumber 手机号
 * @param {*} newPassword 密码
 * @param {*} verifyCode 验证码
 * @return {Promise<RET>} RET = { res: number, data: msg } 返回函数运行的结果状态以及信息
 */
export function resetPasswordByPhone(countryCode, phoneNumber, newPassword, verifyCode) {
    return agconnect.auth().resetPasswordByPhone(countryCode, phoneNumber, newPassword, verifyCode).then(ret => {
        return { res: 1, ret }
    }).catch(e => {
        return { res: 0, e }
    })
}