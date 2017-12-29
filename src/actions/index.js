export const SET_INSTANCES = 'SET_INSTANCES';
export const SET_CONTROL_VISIBILITY = 'SET_CONTROL_VISIBILITY';
export const PUSH_MESSAGE = 'PUSH_MESSAGE';
export const CLEAR_ALL_MESSAGE = 'CLEAR_ALL_MESSAGE';
export const SET_BG_COLOR = 'SET_BG_COLOR';
export const SET_URL = 'SET_URL';
export const SET_USER_ID = 'SET_USER_ID';
export const ADD_REQUEST = 'ADD_REQUEST';

export function setUrl(protocol, address, port) {
    return {
        type: SET_URL,
        protocol : protocol,
        protocol : protocol,
        port : port
    };
}

export function setUserId(id) {
    return {
        type: SET_USER_ID,
        id : id
    };
}

export function setInstances(instances) {
    return {
        type: SET_INSTANCES,
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

