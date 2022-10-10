/*
 * @Author: ATSLotus/时桐
 * @Date: 2022-09-06 15:08:31
 * @LastEditors: ATSLotus/时桐
 * @LastEditTime: 2022-10-10 08:59:10
 * @Description: 云存储初始化
 * @FilePath: /agc/src/assets/js/cloudStorage/cloudStorage.js
 */
import { context } from "../connectConfig";

import agconnect from "@agconnect/api";
import "@agconnect/instance";

import "@agconnect/cloudstorage";

import * as Auth from "@/assets/js/auth";
import Swal from "sweetalert2";
import { buildUUID } from "../getUuid";


let storageManagement;
// let storageReference;
/**
 * @description: 初始化存储实例
 * @Date: 2022-09-06 15:34:26
 */
export function cloudStorageInit(){
    agconnect.instance().configInstance(context);

    storageManagement = agconnect.cloudStorage();
    if(storageManagement)
    {
        console.dir("initialize storage succeed:");
        console.dir(storageManagement);
    }
    
}

/**
 * @description: 构建引用
 * @Date: 2022-09-06 22:41:33
 * @param {string} path 实例下的文件夹路径
 * @return {*}
 */
export function createStorageReference(path){
    let storageReference = "";
    if(path)
    {
        if(path.split('://')[0] === 'grs')
            storageReference = storageManagement.storageReferenceFromUrl(path);
        else
            storageReference = storageManagement.storageReference(path);
    }
    else{
        storageReference = storageManagement.storageReference(path);
    }
    
    if(storageReference)
    {
        console.dir("create reference succeed:");
        console.dir(storageReference);
        return storageReference;
    }
    else{
        return false
    }
}

/**
 * @description: 上传进度
 * @Date: 2022-09-06 22:42:45
 * @param {*} uploadTask
 */
function printUploadPercent (uploadTask) {
    uploadTask.on('state_changed', 
    function (snapshot) {
        if(!snapshot){
            console.log('Upload Result is null')
            return;
        }
        if(snapshot.totalByteCount == 0){
            console.log('Upload File is empty')
            return;
        }
        var progress = (snapshot.bytesTransferred / snapshot.totalByteCount) * 100
        console.log('Upload is ' + progress.toFixed(1) + '% done')
        switch (snapshot.state) {
            case 'paused':
                console.log('Upload is paused')
                break
            case 'running':
                console.log('Upload is running')
                break
            case 'success':
                console.log('Upload is success')
                break
            case 'canceled':
                console.log('Upload is canceled')
                break
            case 'error':
                console.log('Upload is error')
                break
        }
    }, 
    function (snapshot) {
        switch (snapshot.state) {
            case 'paused':
                console.log('Upload is paused')
                break
            case 'running':
                console.log('Upload is running')
                break
            case 'success':
                console.log('Upload is success')
                break
            case 'canceled':
                console.log('Upload is canceled')
                break
            case 'error':
                console.log('Upload is error')
                break
        }
    }, 
    function () {
        console.log('Upload is success')
    })
}
/**
 * @description: 上传方法
 * @Date: 2022-09-06 22:39:51
 * @param {File} file 文件 
 * @param {string} folder  文件名
 * @param {string} uid  用户id(非匿名登录)
 */
export async function upload(file,folder,metadata,name){
    let storageReference = createStorageReference();
    let src = '';
    if(name)
        src = folder + "/" + name;
    else
        src = folder + "/" + file.name;
    if(folder){
        let reference = storageReference.child(src);
        let uploadTask = reference.put(file,metadata);
        await printUploadPercent(uploadTask);
    }
        
}

/**
 * @description: 上传字符串
 * @Date: 2022-10-10 08:56:42
 * @param {string} str
 * @param {string} folder
 * @param {string} name
 */
export function uploadString(str,folder,name){
    let storageReference = createStorageReference();
    let src = '';
    if(!name)
        name = buildUUID('xml')+'.xml';
    src = folder + '/' + name; 
    if(folder){
        // console.dir(src);
        let reference = storageReference.child(src);
        let uploadTask = reference.putString(str);
        printUploadPercent(uploadTask);
    }
}

/**
 * @description: 获取文件夹下的所有文件和目录
 * @Date: 2022-09-06 22:43:55
 * @param {string} folder 实例下的文件夹路径
 * @return {Promise<RET>} RET = { res: number, data: msg } 返回函数运行的结果状态以及信息
 */
export function getFileListAll(folder){
    let storageReference = createStorageReference(folder);
    return storageReference.listAll()
    .then( ret => {
        // console.dir(ret);
        // console.log(ret)
        return {res: 1, data: ret}
    })
    .catch( error => {
        return { res: 0, data: error }
    } )
}

/**
 * @description: 删除文件
 * @Date: 2022-09-12 15:18:08
 * @param {string} path 实例下的文件夹路径
 * @return {Promise<RET>} RET = { res: number, data: msg } 返回函数运行的结果状态以及信息
 */
export function deleteFile(path){
    let storageReference = createStorageReference(path);
    return storageReference.delete()
    .then( ret=> {
        return { res: 1, data: ret }
    })
    .catch( err => {
        return { res: 0, data: err }
    })
}

/**
 * @description: 获取文件下载地址
 * @Date: 2022-09-12 15:14:05
 * @param {string} path 实例下的文件夹路径
 * @return {Promise<RET>} RET = { res: number, data: msg } 返回函数运行的结果状态以及信息
 */
export function getDownloadURL(path){
    let storageReference = createStorageReference(path);
    
    return storageReference.getDownloadURL()
    .then((downloadURL) => { 
        return { res: 1,data: downloadURL }
    })
    .catch((err) => { 
        return { res: 0,data: err }
    });
    
}

/**
 * @description: 上传私有文件
 * @Date: 2022-09-06 22:45:21
 * @param {File} file 文件
 * @param {string} folder 实例下的文件夹
 */
export function uploadPrivateFile(file,folder,name){
    Auth.getUserInfo().then(e => {
        if(e.res)
        {
            if(e.user.isAnonymous()){
                Swal.fire({
                    text: '请登录或注册账号',
                    icon: 'warning',
                    confirmButtonColor: "#1E90FF"
                })
            }
            else{
                upload(file,'privateFile/'+e.user.getUid()+'/'+folder,{
                    cacheControl: 'no-cache',
                },name);
            }
        }
        else{
            Swal.fire({
                text: '请登录或注册账号',
                icon: 'warning',
                confirmButtonColor: "#1E90FF"
            })
        }
    })
}