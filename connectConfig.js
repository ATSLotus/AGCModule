/*
 * @Author: ATSLotus/时桐
 * @Date: 2022-09-02 19:21:44
 * @LastEditors: ATSLotus/时桐
 * @LastEditTime: 2022-10-10 08:34:33
 * @Description: AGC初始化
 * @FilePath: /agc/src/assets/js/connectConfig.js
 */

import agconnect from "@agconnect/api";
import "@agconnect/instance";

/**
 * @description: 
 * @Date: 2022-09-02 20:28:29
 * @return {*}
 */
//此处需替添加SDK
var context = 
{
	
};

export function configInstance(){
    agconnect.instance().configInstance(context);
}

export	{
	context
}


