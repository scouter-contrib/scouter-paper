import jQuery from "jquery";
import {getHttpProtocol} from "./common";
import {getWithCredentials} from "./common";
import {setAuthHeader} from "./common";
import {getCurrentUser} from "./common";
import LimitSizeMap from "./LimitSizeMap";

const dictionaryLimit = {
    default: 2000,
    service: 5000,
    apicall: 10000,
    sql: 5000,
    login: 5000,
    desc: 5000,
    referer: 5000,
    ua: 5000,
    method: 5000,
    error: 500,
    hmsg: 5000,
    stackelem: 5000
};

const dictionary = {};
const dirtyKey = new LimitSizeMap(50000);
const dirtyLimit = 3;

export const ImmutableDictionary = {
    IMPORT_KEY: 'scouter-all-setting',
    ALL_OPTIONS_OF_SERVER_KEY: 'allOptionsOfServer',
    EXPORT_KEY: 'scouter-all-setting.json',
    CHART_LINE_TYPE_KEY: 1,
    CHART_LINE_FILL_TYPE_KEY: 2,
};
export const DictType = {
    service: "service",
    apicall: "apicall",
    sql: "sql",
    login: "login",
    desc: "desc",
    referrer: "referer",
    userAgent: "ua",
    method: "method",
    error: "error",
    hashedMessage: "hmsg",
    stackElement: "stackelem"
};

export const Dictionary = {
    bulkSize: 500,
    record: record,
    find: find,
    contains: contains
};

function contains(type, key) {
    return dictionary[type] ? dictionary[type].contains(key) : false;
}

/**
 * find value from dictionary
 * @param type - dict type (eg, service) or the value like dictType:dictKey (eg, service:15330006)
 * @param key - dice key (optional if type parameter includes a key.)
 */
function find(type, key) {
    if (type.includes(":")) {
        const split = type.split(":");
        type = split[0];
        key = split[1];
    }

    let term = dictionary[type] ? dictionary[type].get(key) : null;
    return term;
}

/**
 * record to dictionary cache the given values
 * @param dicts - Set or Array contains type:value form String. (eg, Set["service:111111", sql:"2222222"] )
 * @param props - props to get http protocol, credentials and user.
 * @param yyyymmdd - daily partitioned registry's date to search terms.
 */
async function record(dicts, props, yyyymmdd) {
    //dicts = Set or Array
    if (Array.isArray(dicts)) {
        dicts = new Set(dicts);
    }

    if (dicts.size < 1) return;
    const unregisteredTerms = [...dicts].filter(value => {
        const kv = value.split(":");
        if(kv.length !== 2 || kv[1] === "0") {
            return false;
        }

        if (!dictionary[kv[0]]) {
            return true;
        }

        if (!dictionary[kv[0]].contains(kv[1])) {
            let dirtyCount = dirtyKey.get(kv[0]);
            if (!dirtyCount) {
                dirtyKey.put(kv[0], 1);
            } else {
                if (dirtyCount >= dirtyLimit) {
                    return false;
                } else {
                    dirtyKey.put(kv[0], ++dirtyCount);
                }
            }
            return true;
        }
        return false;
    });

    if (unregisteredTerms.length < 1) return;
    const dictsParam = unregisteredTerms.join(",");

    let result;
    try {
        result = await jQuery.ajax({
            method: "GET",
            url: getHttpProtocol(props.config) + "/scouter/v1/dictionary/" + yyyymmdd + "?dictKeys=" + dictsParam,
            xhrFields: getWithCredentials(props.config),
            beforeSend: function (xhr) {
                setAuthHeader(xhr, props.config, getCurrentUser(props.config, props.user));
            }
        });

    } catch (e) {
        console.log("[Error] fail to get a dictionary term.");
        console.log(e);
        return false;
    }

    //result = {"status":"200","resultCode":"0","message":"","result":[{"textType":"service","dictKey":"515837359","text":"/traceability/cross-service/simple2<GET>"}
    result.result.forEach(item => {
        const type = item.textType;
        if (!dictionary[type]) {
            const limit = dictionaryLimit[type] ? dictionaryLimit[type] : dictionaryLimit["default"];
            dictionary[type] = new LimitSizeMap(limit);
        }
        dictionary[type].put(item.dictKey, item.text);
    });

    return true;
}