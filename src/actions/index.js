export const SET_TARGET = 'SET_TARGET';
export const SET_INSTANCES = 'SET_INSTANCES';
export const SET_CONTROL_VISIBILITY = 'SET_CONTROL_VISIBILITY';
export const PUSH_MESSAGE = 'PUSH_MESSAGE';
export const CLEAR_ALL_MESSAGE = 'CLEAR_ALL_MESSAGE';
export const SET_BG_COLOR = 'SET_BG_COLOR';
export const SET_CONFIG = 'SET_CONFIG';
export const SET_USER_ID = 'SET_USER_ID';
export const ADD_REQUEST = 'ADD_REQUEST';
export const SET_SELECTION = 'SET_SELECTION';
export const SET_TEMPLATE = 'SET_TEMPLATE';
export const SET_REAL_TIME = 'SET_REAL_TIME';
export const SET_REAL_TIME_VALUE = 'SET_REAL_TIME_VALUE';
export const SET_RANGE_DATE = 'SET_RANGE_DATE';
export const SET_RANGE_HOURS = 'SET_RANGE_HOURS';
export const SET_RANGE_MINUTES = 'SET_RANGE_MINUTES';
export const SET_RANGE_VALUE = 'SET_RANGE_VALUE';
export const SET_RANGE_DATE_HOURS_MINUTES = 'SET_RANGE_DATE_HOURS_MINUTES';
export const SET_REAL_TIME_RANGE_STEP_VALUE = 'SET_REAL_TIME_RANGE_STEP_VALUE';
export const SET_RANGE_DATE_HOURS_MINUTES_VALUE = 'SET_RANGE_DATE_HOURS_MINUTES_VALUE';
export const SET_RANGE_ALL = 'SET_RANGE_ALL';

export function setConfig(config) {
    return {
        type: SET_CONFIG,
        config : config
    };
}

export function setUserId(id, token, time) {
    return {
        type: SET_USER_ID,
        id : id,
        token : token,
        time : time
    };
}

export function setInstances(instances) {
    return {
        type: SET_INSTANCES,
        instances : instances
    };
}

export function setTarget(hosts, instances) {
    return {
        type: SET_TARGET,
        hosts : hosts,
        instances : instances
    };
}

export function setControlVisibility(name, value) {
    return {
        type: SET_CONTROL_VISIBILITY,
        name : name,
        value : value
    };
}

export function pushMessage(category, title, content) {
    return {
        type: PUSH_MESSAGE,
        category : category,
        title : title,
        content : content
    };
}

export function clearAllMessage() {
    return {
        type: CLEAR_ALL_MESSAGE
    };
}

export function setBgColor(color) {
    return {
        type: SET_BG_COLOR,
        color : color
    };
}

export function addRequest() {
    return {
        type: ADD_REQUEST
    };
}

export function setSelection(selection) {
    return {
        type: SET_SELECTION,
        selection : selection
    };
}

export function setTemplate(boxes, layouts) {
    return {
        type: SET_TEMPLATE,
        boxes : boxes,
        layouts : layouts
    };
}

export function setRealTime(realTime, longTerm) {
    return {
        type: SET_REAL_TIME,
        realTime : realTime,
        longTerm : longTerm
    };
}

export function setRealTimeValue(realTime, longTerm, value) {
    return {
        type: SET_REAL_TIME_VALUE,
        realTime : realTime,
        longTerm : longTerm,
        value : value
    };
}

export function setRealTimeRangeStepValue(realTime, longTerm, value, range, step) {
    return {
        type: SET_REAL_TIME_RANGE_STEP_VALUE,
        realTime : realTime,
        longTerm : longTerm,
        value : value,
        range : range,
        step : step
    };
}

export function setRangeDate(date) {
    return {
        type: SET_RANGE_DATE,
        date : date
    };
}

export function setRangeHours(hours) {
    return {
        type: SET_RANGE_HOURS,
        hours : hours
    };
}

export function setRangeMinutes(minutes) {
    return {
        type: SET_RANGE_MINUTES,
        minutes : minutes
    };
}

export function setRangeDateHoursMinutes(date, hours, minutes) {
    return {
        type: SET_RANGE_DATE_HOURS_MINUTES,
        date : date,
        hours : hours,
        minutes : minutes
    };
}

export function setRangeDateHoursMinutesValue(date, hours, minutes, value) {
    return {
        type: SET_RANGE_DATE_HOURS_MINUTES_VALUE,
        date : date,
        hours : hours,
        minutes : minutes,
        value : value
    };
}

export function setRangeAll(date, hours, minutes, value, realTime, longTerm, range, step) {
    return {
        type: SET_RANGE_ALL,
        date : date,
        hours : hours,
        minutes : minutes,
        value : value,
        realTime : realTime,
        longTerm : longTerm,
        range : range,
        step : step
    };
}

export function setRangeValue(value) {
    return {
        type: SET_RANGE_VALUE,
        value : value
    };
}



