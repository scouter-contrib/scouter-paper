import {ADD_REQUEST, SET_CONFIG, SET_USER_ID, SET_TARGET, SET_INSTANCES, PUSH_MESSAGE, SET_CONTROL_VISIBILITY, CLEAR_ALL_MESSAGE, SET_BG_COLOR, SET_SELECTION, SET_TEMPLATE} from '../actions';
import {combineReducers} from 'redux';

const configState = {
    protocol: window.location.protocol.replace(":", ""),
    address: window.location.hostname,
    port: 6188,
    interval: 2000,
    numberFormat: "999,999.00",
    dateFormat: "YYYY-MM-DD",
    timeFormat: "HH:MM:SS",
    minuteFormat: "HH:MM",
    authentification : {
        type : "bearer",
        timeout : 1000 * 60 * 60 * 24
    },
    xlog: {
        normal: {
            rows: 5,
            columns: 5,
            opacity : 0.7,
            sampling : 100,
            fills: {
                D_0_2: {
                    color: "#0062B1"
                },
                D_1_2: {
                    color: "#0062B1"
                },
                D_2_0: {
                    color: "#0062B1"
                },
                D_2_1: {
                    color: "#0062B1"
                },
                D_2_2: {
                    color: "#0062B1"
                },
                D_2_3: {
                    color: "#0062B1"
                },
                D_2_4: {
                    color: "#0062B1"
                },
                D_3_2: {
                    color: "#0062B1"
                },
                D_4_2: {
                    color: "#0062B1"
                }
            }
        },
        async: {
            rows: 5,
            columns: 5,
            opacity : 0.7,
            sampling : 100,
            fills: {
                D_0_2: {
                    color: "#888"
                },
                D_1_2: {
                    color: "#888"
                },
                D_2_0: {
                    color: "#888"
                },
                D_2_1: {
                    color: "#888"
                },
                D_2_2: {
                    color: "#888"
                },
                D_2_3: {
                    color: "#888"
                },
                D_2_4: {
                    color: "#888"
                },
                D_3_2: {
                    color: "#888"
                },
                D_4_2: {
                    color: "#888"
                }
            }
        },
        error: {
            rows: 5,
            columns: 5,
            opacity : 0.7,
            sampling : 100,
            fills: {
                D_0_2: {
                    color: "#9F0500"
                },
                D_1_2: {
                    color: "#9F0500"
                },
                D_2_0: {
                    color: "#9F0500"
                },
                D_2_1: {
                    color: "#9F0500"
                },
                D_2_2: {
                    color: "#9F0500"
                },
                D_2_3: {
                    color: "#9F0500"
                },
                D_2_4: {
                    color: "#9F0500"
                },
                D_3_2: {
                    color: "#9F0500"
                },
                D_4_2: {
                    color: "#9F0500"
                }
            }
        }
    },
    fonts : [
        {val : "Bungee",name : "Bungee", generic: "cursive", type : "display"},
        {val : "Righteous",name : "Righteous", generic : "cursive", type : "display"},
        {val : "Mina",name : "Mina", generic : "sans-serif", type : "sans-serif"},
        {val : "Nanum Gothic",name : "Nanum Gothic", generic : "sans-serif", type : "sans-serif"},
        {val : "Noto Sans",name : "Noto Sans", generic : "sans-serif", type : "sans-serif"},
        {val : "Nanum Gothic Coding",name : "Nanum Gothic Coding", generic : "monospace", type : "monospace"},
        {val : "Cousine",name : "Cousine", generic : "monospace", type : "monospace"},
        {val : "Space Mono",name : "Space Mono", generic : "monospace", type : "monospace"},
        {val : "Kavivanar",name : "Kavivanar", generic : "cursive", type : "Handwriting"},
        {val : "Handlee",name : "Handlee", generic : "cursive", type : "Handwriting"}],
    fontSetting : {
        basic : "Righteous",
        menu : "Bungee",
        axis : "Bungee",
        tooltip : "Righteous",
        profiler : "Righteous"
    }
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
    token : null,
    time : null
};

const user = (state = userState, action) => {
    switch (action.type) {
        case SET_USER_ID:
            return Object.assign({}, state, {
                id: action.id,
                token : action.token,
                time : action.time
            });
        default:
            return state;
    }
};


const targetState = {
    hosts : [],
    instances: [],
    selection : {
        x1: null,
        x2: null,
        y1: null,
        y2: null
    }
};

const target = (state = targetState, action) => {
    switch (action.type) {
        case SET_INSTANCES:
            return Object.assign({}, state, {
                instances: action.instances
            });
        case SET_TARGET:
            return Object.assign({}, state, {
                hosts: action.hosts,
                instances: action.instances
            });
        case SET_SELECTION:
            return Object.assign({}, state, {
                selection: action.selection
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
                content : action.content
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

const templateState = {
    boxes: null,
    layouts : null
};

const template = (state = templateState, action) => {
    switch (action.type) {

        case SET_TEMPLATE:
            return Object.assign({}, state, {boxes : action.boxes, layouts: action.layouts});
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
    request,
    template
});

export default scouterApp;