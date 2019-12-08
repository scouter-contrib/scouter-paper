// local storage access
import moment from "moment";
import {Dictionary, DictType} from "./dictionary";
export const version = "2.6.3";

export function getData(key) {
    let ls = null;
    if (window.localStorage) {
        try {
            ls = JSON.parse(window.localStorage.getItem(key));
        } catch (e) {
            /*Ignore*/
        }
    }
    return ls;
}

export function setData(key, value) {
    if (window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(value));
    }
}


// simple stored settings

const LOCAL_SETTING_KEY = "scouter-paper-local-setting";
let localSetting = {};

export function getLocalSetting() {
    let ls = null;
    if (window.localStorage) {
        try {
            ls = JSON.parse(window.localStorage.getItem(LOCAL_SETTING_KEY));
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
    if (window.localStorage) {
        window.localStorage.setItem(LOCAL_SETTING_KEY, JSON.stringify(localSetting));
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

export function getServerInfo(config) {
    if (config.servers && config.servers.length > 0) {
        let server = config.servers.filter((server) => server.default);
        if (server && server.length > 0) {
            return { address: server[0].address, port: server[0].port };
        } else {
            return null;
        }
    } else {
        return null;
    }
}

export function buildHttpProtocol(config) {
    if (config.servers && config.servers.length > 0) {
        let idx = 0;
        return config.servers
                     .map(_server => {
                         return {
                             addr: [_server.protocol, "://", _server.address, ":", _server.port].join(''),
                             authentification: _server.authentification,
                             key : idx++
                         }
                     })
    } else {
        return null;
    }
}

export function getCurrentDefaultServer(config) {
    if (config.servers && config.servers.length > 0) {
        let server = config.servers.filter((server) => server.default);
        if (server && server.length > 0) {
            return server[0];
        } else {
            return null;
        }
    } else {
        return null;
    }
}

export function errorHandler(xhr, textStatus, errorThrown, props, name, isSave) {

    if (xhr.readyState === 4) {
        if (xhr.responseJSON) {
            if (xhr.responseJSON.resultCode === "401") {

                if (isSave) {
                    saveErrorLog(name, xhr.responseJSON.resultCode, xhr.responseJSON.message);
                } else {
                    props.pushMessage("unauthorized", "ERROR - " + xhr.responseJSON.resultCode, xhr.responseJSON.message);
                    props.setControlVisibility("Message", true);
                }

            } else {
                if (isSave) {
                    saveErrorLog(name, xhr.responseJSON.resultCode, xhr.responseJSON.message);
                } else {
                    props.pushMessage("error", "ERROR - "+ xhr.responseJSON.resultCode, xhr.responseJSON.message);
                    props.setControlVisibility("Message", true);
                }
            }
        } else if (xhr.responseText) {
            if (isSave) {
                saveErrorLog(name, xhr.statusText, xhr.responseText);
            } else {
                props.pushMessage("error", "ERROR - " + xhr.statusText, xhr.responseText);
                props.setControlVisibility("Message", true);
            }
        }
    }
    else if (xhr.readyState === 0) {

        if (isSave) {
            saveErrorLog(name, "ERROR", "CAN'T CONNECT TO SERVER");
        } else {
            props.pushMessage("error", "ERROR", "CAN'T CONNECT TO SERVER");
            props.setControlVisibility("Message", true);
        }
    }
    else {
        if (xhr.responseJSON) {

            if (isSave) {
                saveErrorLog(name, xhr.responseJSON.resultCode, xhr.responseJSON.message);
            } else {
                props.pushMessage("error", "ERROR - " + xhr.responseJSON.resultCode, xhr.responseJSON.message);
                props.setControlVisibility("Message", true);
            }

        } else if (xhr.responseText) {

            if (isSave) {
                saveErrorLog(name, xhr.statusText, xhr.responseText);
            } else {
                props.pushMessage("error", "ERROR - " + xhr.responseJSON.resultCode, xhr.responseJSON.message);
                props.setControlVisibility("Message", true);
            }
        }
    }
}

// Save to LocalStorage only 20
export function saveErrorLog(name, resultCode, resultMsg) {

    let errorLog = [{name:name, code:resultCode, msg:resultMsg}];
    console.error(errorLog);

    let savedLog = getData("errorLog");
    let finalLog = errorLog;

    if(savedLog !== null) {

        if(Object.keys(savedLog).length >= 20) {
            savedLog.splice(0,1);
        }

        finalLog = savedLog.concat(errorLog);
    }

    setData("errorLog", finalLog);
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

export function getCurrentUser(config, user) {
    let defaultServerconfig = getDefaultServerConfig(config);
    let origin = defaultServerconfig.protocol + "://" + defaultServerconfig.address + ":" + defaultServerconfig.port;
    return user[origin];
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

export function setXlogfilterToUrl (props, filter) {

    let search = new URLSearchParams(props.location.search);

    if(filter === null) {
        search.delete("xlogfilter");
    }else{
        search.set("xlogfilter", JSON.stringify(filter));
    }

    if (props.location.search !== ("?" + search.toString())) {
        props.history.replace({
          pathname: props.location.pathname,
          search: "?" + search.toString()
        });
    }

}

export function setRangePropsToUrl (props, pathname, objects) {
    let search = new URLSearchParams(props.location.search);

    if (objects) {
        if (objects.length > 0) {
            search.set("objects", objects.map((d) => {
                return d.objHash
            }));
        }
    } else {
        if (props.objects.length > 0) {
            search.set("objects", props.objects.map((d) => {
                return d.objHash
            }));
        }
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
    search.set("fromPast", props.range.fromPast);

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

export function setTxidPropsToUrl (props, txiddate, txid) {
    let search = new URLSearchParams(props.location.search);

    if (txiddate && txid) {
        search.set("txiddate", txiddate);
        search.set("txid", txid);
    } else {
        search.delete("txiddate");
        search.delete("txid");
    }

    if (props.location.search !== ("?" + search.toString())) {
        props.history.replace({
            pathname: props.location.pathname,
            search: "?" + search.toString()
        });
    }
}

export function setTargetServerToUrl (props, config, anotherParam) {
    const server = getServerInfo(config);
    if (server && server.address) {
        setTargetServerToUrl0(props, server.address, server.port, server.protocol, anotherParam);
    }
}

const ALL_OPTIONS_OF_SERVER_KEY = "allOptionsOfServer";

export function clearAllUrlParamOfPaper (props, config) {
    props.history.push({
        pathname: props.location.pathname
    });
}

export function replaceAllLocalSettingsForServerChange (currentServer, props, config) {
    if (currentServer && currentServer.address) {
        saveCurrentAllLocalSettings(currentServer, config);
        reloadAllLocalSettingsOfServer(props, config);
    }
}

export function saveCurrentAllLocalSettings (currentServer, config) {
    const serverKey = currentServer.address + ":" + currentServer.port;

    const option = {
        server: serverKey,
        options: {
            selectedObjects : getData("selectedObjects"),
            templateName : getData("templateName"),
            layouts : getData("layouts"),
            boxes : getData("boxes"),
            preset : getData("preset"),
            profileOptions : getData("profileOptions"),
            topologyPosition : getData("topologyPosition"),
            topologyOptions : getData("topologyOptions"),
            alert : getData("alert")
        }
    };

    const allOptionsOfServer = getData(ALL_OPTIONS_OF_SERVER_KEY) || [];
    let allOptions = allOptionsOfServer.filter(option => option.server !== serverKey);
    allOptions.push(option);

    setData(ALL_OPTIONS_OF_SERVER_KEY, allOptions);
}

export function reloadAllLocalSettingsOfServer (props, config) {
    const server = getServerInfo(config);
    if (server && server.address) {
        const serverKey = server.address + ":" + server.port;
        const allOptionsOfServer = getData(ALL_OPTIONS_OF_SERVER_KEY) || [];
        const option = allOptionsOfServer.filter(option => option["server"] === serverKey);

        if (option && option[0] && option[0].options) {
            setData("selectedObjects", option[0].options["selectedObjects"]);
            setData("templateName", option[0].options["templateName"]);
            setData("layouts", option[0].options["layouts"]);
            setData("boxes", option[0].options["boxes"]);
            setData("preset", option[0].options["preset"]);
            setData("profileOptions", option[0].options["profileOptions"]);
            setData("topologyPosition", option[0].options["topologyPosition"]);
            setData("topologyOptions", option[0].options["topologyOptions"]);
            setData("alert", option[0].options["alert"]);
        }
    }
}

export function setTargetServerToUrl0 (props, serverAddr, serverPort, protocol, anotherParam) {
    let search = new URLSearchParams(props.location.search);

    search.set("address", serverAddr);
    search.set("port", serverPort);
    search.set("protocol", protocol || "http");
    for (let key in anotherParam) {
        if (anotherParam[key]) {
            search.set(key, anotherParam[key]);
        }
    }

    if (props.location.search !== ("?" + search.toString())) {
        props.history.replace({
            pathname: props.location.pathname,
            search: "?" + search.toString()
        });
    }
}

const table = [
        0x00000000, 0x77073096, 0xee0e612c, 0x990951ba, 0x076dc419, 0x706af48f, 0xe963a535, 0x9e6495a3,
        0x0edb8832, 0x79dcb8a4, 0xe0d5e91e, 0x97d2d988, 0x09b64c2b, 0x7eb17cbd, 0xe7b82d07, 0x90bf1d91,
        0x1db71064, 0x6ab020f2, 0xf3b97148, 0x84be41de, 0x1adad47d, 0x6ddde4eb, 0xf4d4b551, 0x83d385c7,
        0x136c9856, 0x646ba8c0, 0xfd62f97a, 0x8a65c9ec, 0x14015c4f, 0x63066cd9, 0xfa0f3d63, 0x8d080df5,
        0x3b6e20c8, 0x4c69105e, 0xd56041e4, 0xa2677172, 0x3c03e4d1, 0x4b04d447, 0xd20d85fd, 0xa50ab56b,
        0x35b5a8fa, 0x42b2986c, 0xdbbbc9d6, 0xacbcf940, 0x32d86ce3, 0x45df5c75, 0xdcd60dcf, 0xabd13d59,
        0x26d930ac, 0x51de003a, 0xc8d75180, 0xbfd06116, 0x21b4f4b5, 0x56b3c423, 0xcfba9599, 0xb8bda50f,
        0x2802b89e, 0x5f058808, 0xc60cd9b2, 0xb10be924, 0x2f6f7c87, 0x58684c11, 0xc1611dab, 0xb6662d3d,
        0x76dc4190, 0x01db7106, 0x98d220bc, 0xefd5102a, 0x71b18589, 0x06b6b51f, 0x9fbfe4a5, 0xe8b8d433,
        0x7807c9a2, 0x0f00f934, 0x9609a88e, 0xe10e9818, 0x7f6a0dbb, 0x086d3d2d, 0x91646c97, 0xe6635c01,
        0x6b6b51f4, 0x1c6c6162, 0x856530d8, 0xf262004e, 0x6c0695ed, 0x1b01a57b, 0x8208f4c1, 0xf50fc457,
        0x65b0d9c6, 0x12b7e950, 0x8bbeb8ea, 0xfcb9887c, 0x62dd1ddf, 0x15da2d49, 0x8cd37cf3, 0xfbd44c65,
        0x4db26158, 0x3ab551ce, 0xa3bc0074, 0xd4bb30e2, 0x4adfa541, 0x3dd895d7, 0xa4d1c46d, 0xd3d6f4fb,
        0x4369e96a, 0x346ed9fc, 0xad678846, 0xda60b8d0, 0x44042d73, 0x33031de5, 0xaa0a4c5f, 0xdd0d7cc9,
        0x5005713c, 0x270241aa, 0xbe0b1010, 0xc90c2086, 0x5768b525, 0x206f85b3, 0xb966d409, 0xce61e49f,
        0x5edef90e, 0x29d9c998, 0xb0d09822, 0xc7d7a8b4, 0x59b33d17, 0x2eb40d81, 0xb7bd5c3b, 0xc0ba6cad,
        0xedb88320, 0x9abfb3b6, 0x03b6e20c, 0x74b1d29a, 0xead54739, 0x9dd277af, 0x04db2615, 0x73dc1683,
        0xe3630b12, 0x94643b84, 0x0d6d6a3e, 0x7a6a5aa8, 0xe40ecf0b, 0x9309ff9d, 0x0a00ae27, 0x7d079eb1,
        0xf00f9344, 0x8708a3d2, 0x1e01f268, 0x6906c2fe, 0xf762575d, 0x806567cb, 0x196c3671, 0x6e6b06e7,
        0xfed41b76, 0x89d32be0, 0x10da7a5a, 0x67dd4acc, 0xf9b9df6f, 0x8ebeeff9, 0x17b7be43, 0x60b08ed5,
        0xd6d6a3e8, 0xa1d1937e, 0x38d8c2c4, 0x4fdff252, 0xd1bb67f1, 0xa6bc5767, 0x3fb506dd, 0x48b2364b,
        0xd80d2bda, 0xaf0a1b4c, 0x36034af6, 0x41047a60, 0xdf60efc3, 0xa867df55, 0x316e8eef, 0x4669be79,
        0xcb61b38c, 0xbc66831a, 0x256fd2a0, 0x5268e236, 0xcc0c7795, 0xbb0b4703, 0x220216b9, 0x5505262f,
        0xc5ba3bbe, 0xb2bd0b28, 0x2bb45a92, 0x5cb36a04, 0xc2d7ffa7, 0xb5d0cf31, 0x2cd99e8b, 0x5bdeae1d,
        0x9b64c2b0, 0xec63f226, 0x756aa39c, 0x026d930a, 0x9c0906a9, 0xeb0e363f, 0x72076785, 0x05005713,
        0x95bf4a82, 0xe2b87a14, 0x7bb12bae, 0x0cb61b38, 0x92d28e9b, 0xe5d5be0d, 0x7cdcefb7, 0x0bdbdf21,
        0x86d3d2d4, 0xf1d4e242, 0x68ddb3f8, 0x1fda836e, 0x81be16cd, 0xf6b9265b, 0x6fb077e1, 0x18b74777,
        0x88085ae6, 0xff0f6a70, 0x66063bca, 0x11010b5c, 0x8f659eff, 0xf862ae69, 0x616bffd3, 0x166ccf45,
        0xa00ae278, 0xd70dd2ee, 0x4e048354, 0x3903b3c2, 0xa7672661, 0xd06016f7, 0x4969474d, 0x3e6e77db,
        0xaed16a4a, 0xd9d65adc, 0x40df0b66, 0x37d83bf0, 0xa9bcae53, 0xdebb9ec5, 0x47b2cf7f, 0x30b5ffe9,
        0xbdbdf21c, 0xcabac28a, 0x53b39330, 0x24b4a3a6, 0xbad03605, 0xcdd70693, 0x54de5729, 0x23d967bf,
        0xb3667a2e, 0xc4614ab8, 0x5d681b02, 0x2a6f2b94, 0xb40bbe37, 0xc30c8ea1, 0x5a05df1b, 0x2d02ef8d,
    ];

export function hash(str) {
	let data = [];
	for (let i = 0; i < str.length; i++){  
	    data.push(str.charCodeAt(i));
	}

	let crc = 0xffffffff;
	for (const b of data) {
		crc = (crc >>> 8) ^ table[(crc ^ b) & 0xff];
	}
	crc = crc ^ 0xffffffff;
	return crc;
}

export async function getFilteredData0(xlogs, filter, props) {
    if (!xlogs || xlogs.length < 1) {
        return xlogs;
    }

    if (!filter.filtering) {
        return xlogs;
    }

    let dicts = new Set();
    let data = [];
    let temp = [];

    // 서버에서 가져온 데이터를 필터로 정제...
    xlogs.forEach(async xlog => {
        if(dicts.size > Dictionary.bulkSize) {
            await Dictionary.record(dicts, props, moment(new Date(Number(data[data.length].endTime))).format("YYYYMMDD"));
            dicts = new Set();
            const filtered = getFilteredData(temp);
            temp = [];
            data = data.concat(filtered);
        }

        if (filter.service && filter.service.includes("*") && !Dictionary.contains("service", xlog.service)) {
            dicts.add(`${DictType.service}:${xlog.service}`);
        }
        if (filter.login && filter.login.includes("*") && !Dictionary.contains("login", xlog.login)) {
            dicts.add( `${DictType.login}:${xlog.login}`);
        }
        if (filter.desc && filter.desc.includes("*") && !Dictionary.contains("desc", xlog.desc)) {
            dicts.add( `${DictType.desc}:${xlog.desc}`);
        }
        if (filter.referrer && filter.referrer.includes("*") && !Dictionary.contains("referrer", xlog.referrer)) {
            dicts.add( `${DictType.referrer}:${xlog.referrer}`);
        }
        if (filter.userAgent && filter.userAgent.includes("*") && !Dictionary.contains("userAgent", xlog.userAgent)) {
            dicts.add( `${DictType.userAgent}:${xlog.userAgent}`);
        }

        temp.push(xlog);
    });

    if (dicts.size > 0) {
        await Dictionary.record(dicts, props, moment(new Date(Number(temp[temp.length - 1].endTime))).format("YYYYMMDD"));
    }
    const filtered = getFilteredData(temp, filter);
    temp = [];
    data = data.concat(filtered);

    return data;
}

// 서버에서 가져온 데이터와 필터 값과의 비교하는 함수
export function getFilteredData (xlogs, filter) {
    let datas = xlogs;

    if (filter.filtering) {
        if (filter.gxid) {
            datas = datas.filter((d) => d.gxid === filter.gxid);
        }

        if (filter.txid) {
            datas = datas.filter((d) => d.txid === filter.txid);
        }

        if (filter.service) {
            datas = datas.filter((d) => {
                return filter.service.includes("*")
                    ? filter.serviceMatcher.include(Dictionary.find(DictType.service, d.service))
                    : d.service === String(hash(filter.service));
            });
        }

        if (filter.minElapsedTime) {
            datas = datas.filter((d) => Number(d.elapsed) >= filter.minElapsedTime);
        }

        if (filter.maxElapsedTime) {
            datas = datas.filter((d) => Number(d.elapsed) <= filter.maxElapsedTime);
        }

        if (filter.address) {
            datas = datas.filter((d) => d.ipaddr === filter.address);
        }

        if (filter.referrer) {
            datas = datas.filter((d) => {
                return filter.referrer.includes("*")
                    ? filter.referrerMatcher.include(Dictionary.find(DictType.referrer, d.referrer))
                    : d.referrer === String(hash(filter.referrer));
            });
        }

        if (filter.login) {
            datas = datas.filter((d) => {
                return filter.login.includes("*")
                    ? filter.loginMatcher.include(Dictionary.find(DictType.login, d.login))
                    : d.login === String(hash(filter.login));
            });
        }

        if (filter.desc) {
            datas = datas.filter((d) => {
                return filter.desc.includes("*")
                    ? filter.descMatcher.include(Dictionary.find(DictType.desc, d.desc))
                    : d.desc === String(hash(filter.desc));
            });
        }

        if (filter.userAgent) {
            datas = datas.filter((d) => {
                return filter.userAgent.includes("*")
                    ? filter.userAgentMatcher.include(Dictionary.find(DictType.userAgent, d.userAgent))
                    : d.userAgent === String(hash(filter.userAgent));
            });
        }

        // filter - text
        if (filter.text1) {
            datas = datas.filter((d) => d.text1 === filter.text1);
        }

        if (filter.text2) {
            datas = datas.filter((d) => d.text2 === filter.text2);
        }

        if (filter.text3) {
            datas = datas.filter((d) => d.text3 === filter.text3);
        }

        if (filter.text4) {
            datas = datas.filter((d) => d.text4 === filter.text4);
        }

        if (filter.text5) {
            datas = datas.filter((d) => d.text5 === filter.text5);
        }

        // filter - profile count
        if (filter.profileCountFrom) {
            datas = datas.filter((d) => Number(d.profileCount) >= filter.profileCountFrom);
        }

        // filter - profile count
        if (filter.profileCountFrom && filter.profileCountTo) {
            datas = datas.filter((d) => (Number(d.profileCount) >= filter.profileCountFrom && Number(d.profileCount) <= filter.profileCountTo));
        }

        // filter - start Hms
        if (filter.startHmsFrom && filter.startHmsTo) {
            let dm = dateMillis(filter.startHmsFrom, filter.startHmsTo);
            if(dm !== null) {
                  const [startFilter,endFilter] = dm.split(':');
                   datas = datas.filter((d) => {
                       const _startTime = Number(d.endTime) - Number(d.elapsed);
                       return _startTime >= Number(startFilter) && _startTime <= Number(endFilter);
                   });

            }
        }

        switch (filter.hasDump) {

            case "Y" : {
                datas = datas.filter((d) => d.hasDump === "1");
                break;
            }

            case "N" : {
                datas = datas.filter((d) => d.hasDump === "0");
                break;
            }

            default : {
                break;
            }
        }
        
        switch (filter.type) {
            case "ERROR" : {
                datas = datas.filter((d) => Number(d.error) !== 0);
                break;
            }

            case "ASYNC" : {
                datas = datas.filter((d) => (Number(d.xtype) >=2 && Number(d.xtype) <= 4));
                break;
            }

            case "SYNC" : {
                datas = datas.filter((d) => (Number(d.xtype) < 2 || Number(d.xtype) > 4));
                break;
            }

            default : {
                break;
            }
        }

    }

    return datas;
}

// from date string to millisecond
export function dateMillis(startHmsFrom, startHmsTo) {

    let dateObj = new Date();
    let month = dateObj.getMonth();
    let day = dateObj.getDate();
    let year = dateObj.getFullYear();

    let startFromTokens = startHmsFrom.split(":");
    let startToTokens = startHmsTo.split(":");

    let startFrom = (new Date(year, month, day, Number(startFromTokens[0]), Number(startFromTokens[1]), Number(startFromTokens[0]))).getTime();
    let startTo = (new Date(year, month, day, Number(startToTokens[0]), Number(startToTokens[1]), Number(startToTokens[0]))).getTime();

    if(isNaN(startFrom) || isNaN(startTo))
        return null;
    return startFrom + ":" + startTo;
}

export function updateQueryStringParameter(uri, key, value) {
    const re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    const separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
    }
    else {
        return uri + separator + key + "=" + value;
    }
}
export function confBuilder(addr,conf,user,serverId){
    return {
        addr  : addr,
        conf  : conf,
        user  : user,
        serverId : serverId
    }
}

export function timeMiToMs(min){
    return min * 60 * 1000;

}