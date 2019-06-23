export const SET_SUPPORTED = 'SET_SUPPORTED';
export const SET_TARGET = 'SET_TARGET';
export const SET_CONTROL_VISIBILITY = 'SET_CONTROL_VISIBILITY';
export const PUSH_MESSAGE = 'PUSH_MESSAGE';
export const CLEAR_ALL_MESSAGE = 'CLEAR_ALL_MESSAGE';
export const SET_BG_COLOR = 'SET_BG_COLOR';
export const SET_CONFIG = 'SET_CONFIG';
export const SET_USER_ID = 'SET_USER_ID';
export const SET_USER_DATA = 'SET_USER_DATA';
export const ADD_REQUEST = 'ADD_REQUEST';
export const SET_SELECTION = 'SET_SELECTION';
export const SET_TEMPLATE = 'SET_TEMPLATE';
export const SET_REAL_TIME = 'SET_REAL_TIME';
export const SET_REAL_TIME_VALUE = 'SET_REAL_TIME_VALUE';
export const SET_FROM_PAST = 'SET_FROM_PAST';

export const SET_RANGE_DATE = 'SET_RANGE_DATE';
export const SET_RANGE_HOURS = 'SET_RANGE_HOURS';
export const SET_RANGE_MINUTES = 'SET_RANGE_MINUTES';
export const SET_RANGE_VALUE = 'SET_RANGE_VALUE';
export const SET_RANGE_DATE_HOURS_MINUTES = 'SET_RANGE_DATE_HOURS_MINUTES';
export const SET_REAL_TIME_RANGE_STEP_VALUE = 'SET_REAL_TIME_RANGE_STEP_VALUE';
export const SET_RANGE_DATE_HOURS_MINUTES_VALUE = 'SET_RANGE_DATE_HOURS_MINUTES_VALUE';
export const SET_RANGE_ALL = 'SET_RANGE_ALL';
export const SET_COUNTER_INFO = 'SET_COUNTER_INFO';
export const SET_CONTROLLER_STATE = 'SET_CONTROLLER_STATE';
export const SET_CONTROLLER_PIN = 'SET_CONTROLLER_PIN';
export const SET_FILTER_MAP = 'SET_FILTER_MAP';
export const ADD_FILTERED_OBJECT = 'ADD_FILTERED_OBJECT';
export const REMOVE_FILTERED_OBJECT = 'REMOVE_FILTERED_OBJECT';
export const SET_SEARCH_CONDITION = 'SET_SEARCH_CONDITION';
export const SET_BOXES = 'SET_BOXES';
export const SET_LAYOUTS = 'SET_LAYOUTS';
export const SET_BOXES_LAYOUTS = 'SET_BOXES_LAYOUTS';
export const SET_LAYOUT_CHANGETIME = 'SET_LAYOUT_CHANGETIME';
export const SET_MENU = 'SET_MENU';
export const SET_TOPOLOGY_OPTION = 'SET_TOPOLOGY_OPTION';
export const SET_ALERT = 'SET_ALERT';
export const SET_BREAKPOINT = 'SET_BREAKPOINT';
export const SET_ACTIVE_SERVICE = 'SET_ACTIVE_SERVICE';

export const SET_TEMPLATE_NAME = 'SET_TEMPLATE_NAME';
export const SET_PRESET_NAME = 'SET_PRESET_NAME';
export const SET_LAYOUT_NAME = 'SET_LAYOUT_NAME';


export const SET_TIME_FOCUS = 'SET_TIME_FOCUS';

export function setTemplateName(preset, layout) {
    return {
        type: SET_TEMPLATE_NAME,
        preset: preset,
        layout: layout
    }
}

export function setPresetName(preset) {
    return {
        type: SET_PRESET_NAME,
        preset: preset
    };
}

export function setLayoutName(layout) {
    return {
        type: SET_LAYOUT_NAME,
        layout: layout
    };
}

export function setBoxes(boxes) {
    return {
        type: SET_BOXES,
        boxes : boxes
    };
}

export function setLayouts(layouts) {
    return {
        type: SET_LAYOUTS,
        layouts : layouts
    };
}

export function setBoxesLayouts(boxes, layouts) {
    return {
        type: SET_BOXES_LAYOUTS,
        boxes : boxes,
        layouts : layouts
    };
}

export function setLayoutChangeTime() {
    return {
        type: SET_LAYOUT_CHANGETIME
    };
}

export function setConfig(config) {
    return {
        type: SET_CONFIG,
        config : config
    };
}

export function setUserId(origin, id, token, time) {
    return {
        type: SET_USER_ID,
        origin : origin,
        id : id,
        token : token,
        time : time
    };
}

export function setCounterInfo(families, objTypes) {
    return {
        type: SET_COUNTER_INFO,
        families : families,
        objTypes : objTypes
    };
}

export function setUserData(userData) {
    return {
        type: SET_USER_DATA,
        userData : userData
    };
}

export function setTarget(objects) {
    return {
        type: SET_TARGET,
        objects : objects
    };
}

export function setFilterMap(filterMap) {
    return {
        type: SET_FILTER_MAP,
        filterMap : filterMap
    };
}

export function addFilteredObject(objHash) {
    return {
        type: ADD_FILTERED_OBJECT,
        objHash : objHash
    };
}

export function removeFilteredObject(objHash) {
    return {
        type: REMOVE_FILTERED_OBJECT,
        objHash : objHash
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

export function setFromPast(fromPast) {
    return {
        type: SET_FROM_PAST,
        fromPast : fromPast
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

export function setRangeDateHoursMinutesValue(date, hours, minutes, value, fromPast) {
    return {
        type: SET_RANGE_DATE_HOURS_MINUTES_VALUE,
        date : date,
        hours : hours,
        minutes : minutes,
        value : value,
        fromPast : fromPast
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

export function setSupported(value) {
    return {
        type: SET_SUPPORTED,
        supported: value
    };
}

export function setControllerState(state) {
    return {
        type: SET_CONTROLLER_STATE,
        state: state
    };
}

export function setControllerPin(pin) {
    return {
        type: SET_CONTROLLER_PIN,
        pin: pin
    };
}

export function setSearchCondition(from, to, time) {
    return {
        type: SET_SEARCH_CONDITION,
        from: from,
        to : to,
        time : time
    };
}

export function setMenu(menu) {
    return {
        type: SET_MENU,
        menu: menu
    };
}

export function setTopologyOption(topologyOption) {
    return {
        type: SET_TOPOLOGY_OPTION,
        topologyOption: topologyOption
    };
}

export function setAlert(alert) {
    return {
        type: SET_ALERT,
        alert: alert
    };
}

export function setBreakpoint(breakpoint) {
    return {
        type: SET_BREAKPOINT,
        breakpoint: breakpoint
    };
}

export function setActiveServiceList(object){
    return {
        type : SET_ACTIVE_SERVICE,
        object : object
    }
}
export function setTimeFocus(active,time,boxKey,keep=false){
    return {
        type : SET_TIME_FOCUS,
        id: boxKey,
        active :active,
        time : time,
        keep : keep
    }

}