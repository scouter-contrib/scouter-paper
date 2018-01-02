import {ADD_REQUEST, SET_CONFIG, SET_USER_ID, SET_INSTANCES, PUSH_MESSAGE, SET_CONTROL_VISIBILITY, CLEAR_ALL_MESSAGE, SET_BG_COLOR} from '../actions';
import {combineReducers} from 'redux';

const configState = {
    protocol: "http",
    address : "127.0.0.1",
    port : 6188,
    interval : 1000,
    numberFormat : "999,999.00",
    dateFormat : "YYYY-MM-DD",
    timeFormat : "HH:MM:SS",
    minuteFormat : "HH:MM"
};

const config = (state = configState, action) => {
    switch (action.type) {
        case SET_CONFIG:
            return Object.assign({}, state, action.config);
        default:
            return state;
    }
};

const userState = {
    id: null,
    when : null
};

const user = (state = userState, action) => {
    switch (action.type) {
        case SET_USER_ID:
            return Object.assign({}, state, {
                id: action.id,
                when : new Date()
            });
        default:
            return state;
    }
};


const targetState = {
    instances: []
};

const target = (state = targetState, action) => {
    switch (action.type) {
        case SET_INSTANCES:
            return Object.assign({}, state, {
                instances: action.instances
            });
        default:
            return state;
    }
};

const requestState = {
    time : null
};

const request = (state = requestState, action) => {
    switch (action.type) {
        case ADD_REQUEST: {
            return Object.assign({}, state, {
                time: (new Date()).getTime()
            });
        }
        default:
            return state;
    }
};

const controlState = {
    TargetSelector: false,
    Message : false,
    Loading : false
};

const control = (state = controlState, action) => {
    switch (action.type) {

        case SET_CONTROL_VISIBILITY: {
            let obj = state;
            obj[action.name] = action.value;
            return Object.assign({}, state, obj);
        }
        default:
            return state;
    }
};

const messageState = {
    messages: []
};

const message = (state = messageState, action) => {
    switch (action.type) {
        case PUSH_MESSAGE:
            let messages = state.messages;
            messages.push({
                category : action.category,
                title : action.title,
                content : action.content,
            });

            return Object.assign({}, state, {messages : messages});

        case CLEAR_ALL_MESSAGE:
            return Object.assign({}, {messages: []});

        default:
            return state;
    }
};

const styleState = {
    bgColor: "white"
};

const style = (state = styleState, action) => {
    switch (action.type) {

        case SET_BG_COLOR:
            return Object.assign({}, state, {bgColor : action.color});
        default:
            return state;
    }
};

const scouterApp = combineReducers({
    target,
    user,
    message,
    control,
    style,
    config,
    request
});

export default scouterApp;