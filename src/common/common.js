// local storage access
import moment from "moment";

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
    if (config.servers && config.servers.length > 0) {
        let server = config.servers.filter((server) => server.default);
        if (server && server.length > 0) {
            return server[0].protocol + "://" + server[0].address + ":" + server[0].port;
        } else {
            return null;
        }
    } else {
        return null;
    }
}

export function errorHandler(xhr, textStatus, errorThrown, props) {

    if (xhr.readyState === 4) {
        if (xhr.responseJSON) {
            if (xhr.responseJSON.resultCode === "401") {
                props.pushMessage("unauthorized", "ERROR - " + xhr.responseJSON.resultCode, xhr.responseJSON.message);
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
        withCredentials: (getDefaultServerConfig(config).authentification === "cookie")
    }
}

export function getDefaultServerConfig(config) {
    if (config.servers && config.servers.length > 0) {
        let server = config.servers.filter((server) => server.default);
        if (server && server.length > 0) {
            return server[0];
        }
    }
    return {};
}

export function getDefaultServerConfigIndex(config) {
    let inx = -1;
    if (config.servers && config.servers.length > 0) {
        for (let i=0; i<config.servers.length; i++) {
            if (config.servers[i].default) {
                inx = i;
                break;
            }
        }
    }

    return inx;
}

export function setAuthHeader(xhr, config, user) {
    if (getDefaultServerConfig(config).authentification === "bearer") {
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

export function getSearchDays(from, to) {
    let aday = 1000 * 60 * 60 * 24;
    let startDayTime = moment(from).hours(0).minutes(0).seconds(0).milliseconds(0).valueOf();
    return Math.ceil(((to - 1000) - startDayTime) / aday);
}

export function getDivideDays(from, to) {
    let days = getSearchDays(from, to);

    let fromTos = [];
    if (days > 0) {
        for (let i = 0; i < days; i++) {
            let splitFrom;
            let splitTo;
            if (i === 0) {
                splitFrom = moment(from).add(i, 'days').valueOf();
                splitTo = moment(from).add(i + 1, 'days').hours(0).minutes(0).seconds(0).milliseconds(0).valueOf();
            } else if (i === (days - 1)) {
                splitFrom = moment(from).add(i, 'days').hours(0).minutes(0).seconds(0).milliseconds(0).valueOf();
                splitTo = moment(to);
            } else {
                splitFrom = moment(from).add(i, 'days').hours(0).minutes(0).seconds(0).milliseconds(0).valueOf();
                splitTo = moment(from).add(i + 1, 'days').hours(0).minutes(0).seconds(0).milliseconds(0).valueOf();
            }

            fromTos.push({
                from: splitFrom,
                to: splitTo
            })
        }
    } else {
        fromTos.push({
            from: from,
            to: to
        })
    }

    return fromTos;
}

export function getParam(props, key) {
    if (key.indexOf(",") > -1) {
        let keys = key.split(",");
        let params = new URLSearchParams(props.location.search);
        let result = [];
        for (let i=0; i<keys.length; i++) {
            let val = params.get(keys[i]);
            if (val === "true") {
                result.push(true);
            } else if (val === "false") {
                result.push(false);
            } else {
                result.push(val);
            }
        }
        return result;
    } else {
        if (props && props.location.search) {
            return (new URLSearchParams(props.location.search)).get(key);
        }
    }
}

export function setRangePropsToUrl (props, pathname) {
    let search = new URLSearchParams(props.location.search);

    if (props.instances.length > 0) {
        search.set("instances", props.instances.map((d) => {
            return d.objHash
        }));
    }

    search.set("realtime", props.range.realTime);
    search.set("longterm", props.range.longTerm);

    let from = props.range.date.clone();
    from.seconds(0);
    from.minutes(props.range.minutes);
    from.hours(props.range.hours);

    let to = from.clone();
    to = to.add(props.range.value, "minutes");

    search.set("from", from.format("YYYYMMDDHHmmss"));
    search.set("to", to.format("YYYYMMDDHHmmss"));

    if (props.location.search !== ("?" + search.toString())) {
        if (pathname) {
            props.history.push({
                pathname: pathname,
                search: "?" + search.toString()
            });
        } else {
            props.history.replace({
                pathname: props.location.pathname,
                search: "?" + search.toString()
            });
        }
    }
}