import jQuery from "jquery";
import {getCurrentUser, getWithCredentials, setAuthHeader} from "./common";

export default class ScouterApi {
//- Default Api
//  App, Control API List
    static isAuthentification(config) {
        const {addr,conf,user,serverId} = config;

        return jQuery.ajax({
            method: "GET",
            async: true,
            url: `${addr}/scouter/v1/kv/a?serverId=${serverId}`,
            xhrFields: getWithCredentials(conf),
            beforeSend: (xhr)=> setAuthHeader(xhr, conf, user)
        });
    }
    static getObjectPreset(config) {
        const {addr,conf,user,serverId} = config;

        return jQuery.ajax({
            method: "GET",
            async: true,
            url: `${addr}/scouter/v1/kv/__scouter_paper_preset?serverId=${serverId}`,
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
            url: `${addr}/scouter/v1/alert/realTime/${ol}/${la}?objType=${objType}&serverId=${serverId}`,
            xhrFields: getWithCredentials(conf),
            beforeSend: (xhr)=> setAuthHeader(xhr, conf, getCurrentUser(conf,user))
        });
    }
    static getConterModel(config){
        const {addr,conf,user,serverId} = config;
        return jQuery.ajax({
            method: "GET",
            async: true,
            url: `${addr}/scouter/v1/info/counter-model?serverId=${serverId}`,
            xhrFields: getWithCredentials(conf),
            beforeSend: (xhr)=> setAuthHeader(xhr, conf, getCurrentUser(conf,user))
        });
    }

    static getMonitoringObjects(config){
        const {addr,conf,user,serverId} = config;
        return jQuery.ajax({
            method: "GET",
            async: true,
            url: `${addr}scouter/v1/object?serverId=${serverId}`,
            xhrFields: getWithCredentials(conf),
            beforeSend: (xhr)=> setAuthHeader(xhr, conf, getCurrentUser(conf,user))
        });

    }
    static getConnectedServer(config){
        const {addr,conf,user} = config;
        return jQuery.ajax({
            method: "GET",
            async: true,
            url: `${addr}scouter/v1/info/server`,
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
            url: `${addr}/scouter/v1/counter/realTime/${params}?objHashes=${JSON.stringify(objects.map(obj=>Number(obj.objHash)))}?serverId=${serverId}`,
            xhrFields: getWithCredentials(conf),
            beforeSend: (xhr)=> setAuthHeader(xhr, conf, getCurrentUser(conf,user))
        });
    }
}