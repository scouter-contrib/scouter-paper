// local storage access

export function getData(key) {
    let ls = null;
    if (global.localStorage) {
        try {
            ls = JSON.parse(global.localStorage.getItem(key));
        } catch (e) {
            /*Ignore*/
        }
    }
    return ls;
}

export function setData(key, value) {
    if (global.localStorage) {
        global.localStorage.setItem(key, JSON.stringify(value));
    }
}


// simple stored settings

const LOCAL_SETTING_KEY = "scouter-paper-local-setting";
let localSetting = {};

export function getLocalSetting() {
    let ls = null;
    if (global.localStorage) {
        try {
            ls = JSON.parse(global.localStorage.getItem(LOCAL_SETTING_KEY));
        } catch (e) {
        }
        if (ls) {
            localSetting = ls;
        }
    }
    return localSetting;
}

export function setLocalSettingData(key, value) {
    getLocalSetting();
    localSetting[key] = value;
    if (global.localStorage) {
        global.localStorage.setItem(LOCAL_SETTING_KEY, JSON.stringify(localSetting));
    }
}

export function getLocalSettingData(key, defaultValue) {
    let value = getLocalSetting()[key];
    return value ? value : defaultValue;
}

export function getHttpProtocol(config) {
    return config.protocol + "://" + config.address + ":" + config.port;
}

export function errorHandler(xhr, textStatus, errorThrown, props, name, isSave) {

    // Save to LocalStorage or Not
    if (isSave) {
        saveErrorLog(name, xhr);
    } else {

        if (xhr.readyState === 4) {
            if (xhr.responseJSON) {
                if (xhr.responseJSON.resultCode === "401") {
                    props.pushMessage("unauthorized", "ERROR - " + xhr.responseJSON.resultCode, xhr.responseJSON.message);
                    props.setControlVisibility("Message", true);
                } else {
                    props.pushMessage("error", "ERROR - "+ xhr.responseJSON.resultCode, xhr.responseJSON.message);
                    props.setControlVisibility("Message", true);
                }
            }
        }
        else if (xhr.readyState === 0) {
            props.pushMessage("error", "ERROR", "CAN'T CONNECT TO SERVER");
            props.setControlVisibility("Message", true);
        }
        else {
            props.pushMessage("error", "ERROR - " + xhr.responseJSON.resultCode, xhr.responseJSON.message);
            props.setControlVisibility("Message", true);
        }
    }
}

// Save to LocalStorage only 20
export function saveErrorLog(name, xhr) {

    var resultCode;
    var resultMsg;

    // check dataType
    if(name == 'getXLog') {
        xhr = JSON.parse(xhr.responseText);
        resultCode = xhr.resultCode
        resultMsg = xhr.message;
    }else{
        resultCode = xhr.responseJSON.resultCode
        resultMsg = xhr.responseJSON.message;
    }

    var errorLog = [{name:name, code:resultCode, msg:resultMsg}];
    console.error(errorLog);

    var savedLog = getData("errorLog");
    var finalLog = errorLog;

    if(savedLog != undefined) {

        if(Object.keys(savedLog).length >= 20) {
            savedLog.splice(0,1);
        }

        finalLog = savedLog.concat(errorLog);
    }

    setData("errorLog", finalLog);
}

export function getWithCredentials(config) {
    return {
        withCredentials: (config.authentification && config.authentification.type === "cookie")
    }
}

export function setAuthHeader(xhr, config, user) {
    if (config.authentification && config.authentification.type === "bearer") {
        if (user && user.token) {
            xhr.setRequestHeader('Authorization', 'bearer ' + user.token);
        }
    }
}

export function zeroPadding(n, p, c) {
    let pad_char = typeof c !== 'undefined' ? c : '0';
    let pad = new Array(1 + p).join(pad_char);
    return (pad + n).slice(-pad.length);
}

let serverTimeGap = 0;
export function setServerTimeGap(millis) {
    serverTimeGap = millis;
}
export function getServerTimeGap() {
    return serverTimeGap;
}

/**
 * Simple object check.
 * @param item
 * @returns {*|boolean}
 */
export function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 * @param target
 * @param sources
 * @returns {*}
 */
export function mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return mergeDeep(target, ...sources);
}