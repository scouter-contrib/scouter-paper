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

export function getDate(date, type) {
    if (type === 1) {
        let mm = date.getMonth() + 1; // getMonth() is zero-based
        let dd = date.getDate();

        return [date.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
        ].join('');
    } else if (type === 2) {
        let mm = date.getMonth() + 1; // getMonth() is zero-based
        let dd = date.getDate();

        let yyyymmdd = [date.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
        ].join('-');

        let hhmmss  = [date.getHours(), date.getMinutes(), date.getSeconds()].join(':');

        let ms = date.getMilliseconds();
        if (ms < 1) {
            ms = "000";
        } else if (ms < 10) {
            ms = ms * 100;
        } else if (ms <100) {
            ms = ms * 10;
        }
        return yyyymmdd + ' ' + hhmmss + "." + ms;
    }

}
