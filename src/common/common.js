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

export function errorHandler(xhr, textStatus, errorThrown, props) {

    if (xhr.readyState === 4) {
        if (xhr.responseJSON) {
            if (xhr.responseJSON.resultCode === "401") {
                props.pushMessage("error", "ERROR - " + xhr.responseJSON.resultCode, xhr.responseJSON.message);
                props.setControlVisibility("Message", true);
            } else {
                props.pushMessage("error", "ERROR - " + xhr.responseJSON.resultCode, xhr.responseJSON.message);
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

export function getWithCredentials(config) {
    return {
        withCredentials: (config.authentification && config.authentification.type === "token")
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
    var pad_char = typeof c !== 'undefined' ? c : '0';
    var pad = new Array(1 + p).join(pad_char);
    return (pad + n).slice(-pad.length);
}

let serverTimeGap = 0;
export function setServerTimeGap(millis) {
    serverTimeGap = millis;
}
export function getServerTimeGap() {
    return serverTimeGap;
}
