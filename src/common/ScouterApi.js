import jQuery from "jquery";
import {getCurrentUser, getWithCredentials, setAuthHeader} from "./common";

export default class ScouterApi {
//- Default Api
//  App, Control API List
    static objBuilder(objects){
        return Object.keys(objects).map(_id => {
            return {
                id: _id,
                objects: JSON.stringify(objects[_id].map(instance =>Number(instance.objHash)))
            }
        })
    }
    static getRealTimeXLOG(config,objectInfo,clear,offset1,offset2){
        const {addr,conf,user} = config;
        const {id,objects} = objectInfo;

       return jQuery.ajax({
            method: "GET",
            async: true,
            dataType: 'json',
            url: `${addr}/scouter/v1/xlog/realTime/${clear ? 0 : offset1}/${clear ? 0 : offset2}?objHashes=${objects}&serverId=${id}`,
            xhrFields: getWithCredentials(conf),
            beforeSend: (xhr)=> setAuthHeader(xhr, conf, user)
        })
    }
    static isAuthentification(config) {
        const {addr,conf,user,serverId} = config;

        return jQuery.ajax({
            method: "GET",
            async: true,
            url: `${addr}/scouter/v1/kv/a${serverId ? `?serverId=${serverId}`: '' }`,
            dataType:"JSON",
            xhrFields: getWithCredentials(conf),
            beforeSend: (xhr)=> setAuthHeader(xhr, conf, user)
        });
    }
    static getPaperPreset(config) {
        const {addr,conf,user,serverId} = config;

        return jQuery.ajax({
            method: "GET",
            async: true,
            dataType:"JSON",
            url: `${addr}/scouter/v1/kv/__scouter_paper_preset${serverId ? `?serverId=${serverId}`: '' }`,
            xhrFields: getWithCredentials(conf),
            beforeSend: (xhr)=> setAuthHeader(xhr, conf, getCurrentUser(conf,user))
        });
    }
    static setPaperPreset(config,data) {
        const {addr,conf,user,serverId} = config;
        return jQuery.ajax({
            method: "PUT",
            async: true,
            dataType:"JSON",
            url: `${addr}/scouter/v1/kv${serverId ? `?serverId=${serverId}`: '' }`,
            contentType : "application/json",
            data : JSON.stringify(data),
            xhrFields: getWithCredentials(conf),
            beforeSend: (xhr)=> setAuthHeader(xhr, conf, getCurrentUser(conf,user))
        });
    }
    static getLayoutTemplate(config) {
        const {addr,conf,user,serverId} = config;

        return jQuery.ajax({
            method: "GET",
            async: true,
            dataType:"JSON",
            url: `${addr}/scouter/v1/kv/__scouter_paper_layout${serverId ? `?serverId=${serverId}`: '' }`,
            xhrFields: getWithCredentials(conf),
            beforeSend: (xhr)=> setAuthHeader(xhr, conf, getCurrentUser(conf,user))
        });
    }
    static getAlertList(config,offset,objType){
        const {addr,conf,user,serverId} = config;
        const {ol,la} = offset;
        return jQuery.ajax({
            method: "GET",
            async: true,
            url: `${addr}/scouter/v1/alert/realTime/${ol}/${la}?objType=${objType}${serverId ? `&serverId=${serverId}`: '' }`,
            xhrFields: getWithCredentials(conf),
            beforeSend: (xhr)=> setAuthHeader(xhr, conf, getCurrentUser(conf,user))
        });
    }
    static getCounterModel(config){
        const {addr,conf,user,serverId} = config;
        return jQuery.ajax({
            method: "GET",
            async: true,
            url: `${addr}/scouter/v1/info/counter-model${serverId ? `?serverId=${serverId}`: '' }`,
            xhrFields: getWithCredentials(conf),
            beforeSend: (xhr)=> setAuthHeader(xhr, conf, getCurrentUser(conf,user))
        });
    }
    static getInstanceObjects(config){
        const {addr,conf,user,serverId} = config;
        return jQuery.ajax({
            method: "GET",
            async: true,
            dataType:"JSON",
            url: `${addr}/scouter/v1/object${serverId ? `?serverId=${serverId}`: '' }`,
            xhrFields: getWithCredentials(conf),
            beforeSend: (xhr)=> setAuthHeader(xhr, conf, getCurrentUser(conf,user))
        });

    }
    static getSyncInstanceObjects(config){
        const {addr,conf,user,serverId} = config;
        return jQuery.ajax({
            method: "GET",
            async: false,
            dataType:"JSON",
            url: `${addr}/scouter/v1/object${serverId ? `?serverId=${serverId}`: '' }`,
            xhrFields: getWithCredentials(conf),
            beforeSend: (xhr)=> setAuthHeader(xhr, conf, getCurrentUser(conf,user))
        });

    }
    static getSyncConnectedServer(config){
        const {addr,conf,user} = config;
        return jQuery.ajax({
            method: "GET",
            async: false,
            dataType:"JSON",
            url: `${addr}/scouter/v1/info/server`,
            xhrFields: getWithCredentials(conf),
            beforeSend: (xhr)=> setAuthHeader(xhr, conf, getCurrentUser(conf,user))
        });

    }
    static getConnectedServer(config){
        const {addr,conf,user} = config;
        return jQuery.ajax({
            method: "GET",
            async: true,
            dataType:"JSON",
            url: `${addr}/scouter/v1/info/server`,
            xhrFields: getWithCredentials(conf),
            beforeSend: (xhr)=> setAuthHeader(xhr, conf, getCurrentUser(conf,user))
        });

    }
    //- 실시간 쪽
    static getRealTimeCounter(config,params,objects){
        const {addr,conf,user,serverId} = config;
        return jQuery.ajax({
            method: "GET",
            async: true,
            url: `${addr}/scouter/v1/counter/realTime/${params}?objHashes=${JSON.stringify(objects.map(obj=>Number(obj.objHash)))}${serverId ? `&serverId=${serverId}`: '' }`,
            xhrFields: getWithCredentials(conf),
            beforeSend: (xhr)=> setAuthHeader(xhr, conf, getCurrentUser(conf,user))
        });
    }
    //- agent 관리
    static allInactiveRemove(config){
        const {addr,conf,user,serverId} = config;
        return jQuery.ajax({
            method: "GET",
            async: true,
            dataType:"json",
            url: `${addr}/scouter/v1/object/remove/inactive${serverId ? `?serverId=${serverId}`: '' }`,
            xhrFields: getWithCredentials(conf),
            beforeSend: (xhr)=> setAuthHeader(xhr, conf, getCurrentUser(conf,user))
        });
    }

}