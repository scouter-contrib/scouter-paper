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

export function getHttpProtocol(config) {
    return config.protocol + "://" + config.address + ":" + config.port;
}