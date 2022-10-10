/*
 * @Author: ATSLotus/时桐
 * @Date: 2022-09-04 18:38:22
 * @LastEditors: ATSLotus/时桐
 * @LastEditTime: 2022-10-10 08:48:48
 * @Description: 
 * @FilePath: /agc/src/assets/js/storage.js
 */
// import agconnect from '@hw-agconnect/api';
// import '@hw-agconnect/storage';

import * as Auth from '@/assets/js/auth';
import { configInstance } from "@/assets/js/connectConfig"

/**
 * @description: 设置用户信息存储模式以及加密方式
 * @Date: 2022-10-10 08:48:16
 */
export function setStorage(){
    configInstance();
    
    Auth.setCryptImp(new Auth.Crypt());
    Auth.setAuthCryptImp(new Auth.AuthCrypt());

    Auth.setUserInfoPersistence(0);
}
