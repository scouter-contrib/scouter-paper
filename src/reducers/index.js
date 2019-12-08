import {
    SET_ACTIVE_SERVICE,
    SET_MENU,
    SET_BOXES_LAYOUTS,
    SET_LAYOUTS,
    SET_BOXES,
    SET_LAYOUT_CHANGETIME,
    SET_SUPPORTED,
    ADD_REQUEST,
    SET_CONFIG,
    SET_USER_ID,
    SET_USER_DATA,
    SET_TARGET,
    PUSH_MESSAGE,
    SET_CONTROL_VISIBILITY,
    CLEAR_ALL_MESSAGE,
    SET_BG_COLOR,
    SET_SELECTION,
    SET_TEMPLATE,
    SET_REAL_TIME,
    SET_RANGE_DATE,
    SET_RANGE_HOURS,
    SET_RANGE_MINUTES,
    SET_RANGE_VALUE,
    SET_REAL_TIME_VALUE,
    SET_FROM_PAST,
    SET_RANGE_DATE_HOURS_MINUTES,
    SET_REAL_TIME_RANGE_STEP_VALUE,
    SET_RANGE_DATE_HOURS_MINUTES_VALUE,
    SET_RANGE_ALL,
    SET_COUNTER_INFO,
    SET_CONTROLLER_STATE,
    SET_CONTROLLER_PIN,
    SET_FILTER_MAP,
    ADD_FILTERED_OBJECT,
    REMOVE_FILTERED_OBJECT,
    SET_SEARCH_CONDITION,
    SET_TOPOLOGY_OPTION,
    SET_ALERT,
    SET_BREAKPOINT,
    SET_TEMPLATE_NAME,
    SET_PRESET_NAME,
    SET_LAYOUT_NAME,
    SET_TIME_FOCUS,
} from '../actions';
import {combineReducers} from 'redux';
import moment from 'moment';
const configState = {
    servers : [
        {
            protocol: (window.location.protocol.replace(":", "").toLowerCase() === "http" || window.location.protocol.replace(":", "").toLowerCase() === "https") ? window.location.protocol.replace(":", "").toLowerCase() : "http",
            address: window.location.hostname ? window.location.hostname : "127.0.0.1",
            port: 6188,
            authentification :"bearer",
            default : true
        }
    ],
    interval: 2000,
    realTimeLastRange : 10,
    realTimeXLogLastRange : 10,
    preload: "Y",
    alertInterval : 60,
    numberFormat: "0,0.0",
    decimalPoint: 1,
    dateFormat: "%Y-%m-%d",
    timeFormat: "%H:%M:%S",
    minuteFormat: "%H:%M",
    theme : "theme-blue/white",
    colorType : "white",
    graph : {
        color : "instance",
        width : 2,
        opacity : 1,
        fill : "N",
        fillOpacity : 0.4,
        curve : "curveCatmullRom",
        break : "Y"
    },
    alert : {
        notification : "Y"
    },
    range : {
        shortHistoryRange : 360,
        shortHistoryStep : 10,
        longHistoryRange : 24 * 30,
        longHistoryStep : 60
    },
    xlog: {
        classicMode: {
            rows: 5,
            columns: 5,
            opacity : 1.0,
            sampling : 100,
            fills: {
                D_0_0: {
                    color: "#0062B1"
                },
                D_0_2: {
                    color: "#0062B1"
                },
                D_0_3: {
                    color: "#0062B1"
                },
                D_0_4: {
                    color: "#0062B1"
                },
                D_1_0: {
                    color: "#0062B1"
                },
                D_1_1: {
                    color: "#0062B1"
                },
                D_1_2: {
                    color: "#0062B1"
                },
                D_1_3: {
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
                D_3_1: {
                    color: "#0062B1"
                },
                D_3_2: {
                    color: "#0062B1"
                },
                D_3_3: {
                    color: "#0062B1"
                },
                D_3_4: {
                    color: "#0062B1"
                },
                D_4_0: {
                    color: "#0062B1"
                },
                D_4_1: {
                    color: "#0062B1"
                },
                D_4_2: {
                    color: "#0062B1"
                },
                D_4_4: {
                    color: "#0062B1"
                }
            }
        },
        normal: {
            rows: 5,
            columns: 5,
            opacity : 0.7,
            sampling : 100,
            fills: {
                D_0_0: {
                    color: "#0062B1"
                },
                D_0_4: {
                    color: "#0062B1"
                },
                D_1_1: {
                    color: "#0062B1"
                },
                D_1_3: {
                    color: "#0062B1"
                },
                D_2_2: {
                    color: "#0062B1"
                },
                D_3_1: {
                    color: "#0062B1"
                },
                D_3_3: {
                    color: "#0062B1"
                },
                D_4_0: {
                    color: "#0062B1"
                },
                D_4_4: {
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
                D_0_0: {
                    color: "#888"
                },
                D_0_4: {
                    color: "#888"
                },
                D_1_1: {
                    color: "#888"
                },
                D_1_3: {
                    color: "#888"
                },
                D_2_2: {
                    color: "#888"
                },
                D_3_1: {
                    color: "#888"
                },
                D_3_3: {
                    color: "#888"
                },
                D_4_0: {
                    color: "#888"
                },
                D_4_4: {
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
                D_0_0: {
                    color: "#9F0500"
                },
                D_0_4: {
                    color: "#9F0500"
                },
                D_1_1: {
                    color: "#9F0500"
                },
                D_1_3: {
                    color: "#9F0500"
                },
                D_2_2: {
                    color: "#9F0500"
                },
                D_3_1: {
                    color: "#9F0500"
                },
                D_3_3: {
                    color: "#9F0500"
                },
                D_4_0: {
                    color: "#9F0500"
                },
                D_4_4: {
                    color: "#9F0500"
                }
            }
        }
    },
    fonts : [
        {val : "NanumSquare",name : "NanumSquare", generic: "sans-serif", type : "display"},
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
        basic : "NanumSquare",
        menu : "Bungee",
        axis : "Bungee",
        axisFontSize : "8px",
        tooltip : "NanumSquare",
        profiler : "NanumSquare"
    },
    others : {
        checkUpdate : "Y",
        errorReport : "Y",
        xlogClassicMode : "N",
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

const counterInfoState = {
    families : [],
    objTypesMap : {},
    familyNameIcon : {}
};

const counterInfo = (state = counterInfoState, action) => {
    switch (action.type) {
        case SET_COUNTER_INFO:
            let objTypesMap = {};
            let familyNameIcon = {};
            action.objTypes.forEach((objType) => {
                objTypesMap[objType.name] = objType;
                familyNameIcon[objType.familyName] = objType.icon;
            });

            return Object.assign({}, state, {
                families: action.families,
                objTypesMap : objTypesMap,
                familyNameIcon : familyNameIcon
            });

        default:
            return state;
    }
};

const userState = {};

const user = (state = userState, action) => {
    switch (action.type) {
        case SET_USER_ID:
            let currentState = Object.assign({}, state);
            currentState[action.origin] = {
                id: action.id,
                token : action.token,
                time : action.time
            };
            
            return currentState;

        case SET_USER_DATA:
            return Object.assign({}, state, action.userData);

        default:
            return state;
    }
};


const targetState = {
    objects: [],
    filterMap : {},
    selection : {
        x1: null,
        x2: null,
        y1: null,
        y2: null
    }
};

const target = (state = targetState, action) => {
    switch (action.type) {
        case SET_TARGET:
            let filterMap = {};
            action.objects.forEach((object) => {
                filterMap[object.objHash] = true;
            });

            return Object.assign({}, state, {
                objects: action.objects,
                filterMap : filterMap
            });
        case SET_SELECTION:
            return Object.assign({}, state, {
                selection: action.selection
            });
        case SET_ACTIVE_SERVICE:
            return Object.assign({}, state, {
                activeObject: action.object
            });
        case SET_FILTER_MAP:
            return Object.assign({}, state, {
                filterMap: action.filterMap
            });
        case ADD_FILTERED_OBJECT: {
            let currentFilterMap = Object.assign({}, state.filterMap);
            currentFilterMap[action.objHash] = true;
            return Object.assign({}, state, {
                filterMap: currentFilterMap
            });
        }

        case REMOVE_FILTERED_OBJECT: {
            let currentFilterMap = Object.assign({}, state.filterMap);
            delete currentFilterMap[action.objHash];
            return Object.assign({}, state, {
                filterMap: currentFilterMap
            });
        }
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


let storageController = null;
let pin = null;
if (localStorage) {
    storageController = localStorage.getItem("controller");
    pin = localStorage.getItem("pin");
    if (pin === "true") {
        pin = true;
    } else {
        pin = false;
    }
}

const controlState = {
    TargetSelector: false,
    Message : false,
    Loading : false,
    Controller : storageController ? storageController : "min",
    menu : "/",
    pin : pin !== null ? pin : false,
    breakpoint : "lg"
};

const control = (state = controlState, action) => {
    switch (action.type) {

        case SET_CONTROL_VISIBILITY: {
            let obj = state;
            obj[action.name] = action.value;
            return Object.assign({}, state, obj);
        }

        case SET_CONTROLLER_STATE: {
            if (localStorage) {
                localStorage.setItem("controller", action.state);
            }
            return Object.assign({}, state, {Controller : action.state});
        }

        case SET_CONTROLLER_PIN: {
            if (localStorage) {
                localStorage.setItem("pin", action.pin);
            }
            return Object.assign({}, state, {pin : action.pin});
        }

        case SET_MENU: {
            return Object.assign({}, state, {menu : action.menu});
        }

        case SET_BREAKPOINT: {
            return Object.assign({}, state, {breakpoint : action.breakpoint});
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

const paperState = {
    boxes: [],
    layouts : {},
    layoutChangeTime : null
};

const paper = (state = paperState, action) => {
    switch (action.type) {

        case SET_BOXES:
            return Object.assign({}, state, {boxes : action.boxes, layoutChangeTime : (new Date()).getTime()});
        case SET_LAYOUTS:
            return Object.assign({}, state, {layouts : action.layouts, layoutChangeTime : (new Date()).getTime()});
        case SET_BOXES_LAYOUTS:
            return Object.assign({}, state, {boxes : action.boxes, layouts : action.layouts, layoutChangeTime : (new Date()).getTime()});
        case SET_LAYOUT_CHANGETIME:
            return Object.assign({}, state, {layoutChangeTime : (new Date()).getTime()});
        default:
            return state;
    }
};


const searchConditionState = {
    from: null,
    to : null,
    time : null
};

const searchCondition = (state = searchConditionState, action) => {
    switch (action.type) {

        case SET_SEARCH_CONDITION:
            return Object.assign({}, state, {from : action.from, to: action.to, time:action.time});
        default:
            return state;
    }
};

let now = moment();
now.subtract(10, "minutes");

const rangeState = {
    date : now,
    hours : now.hours(),
    minutes : now.minutes(),
    value : configState.range.shortHistoryStep,
    realTime : true,
    fromPast : true,
    longTerm : false,
    range : configState.range.shortHistoryRange,
    step : configState.range.shortHistoryStep
};

const range = (state = rangeState, action) => {
    switch (action.type) {
        case SET_REAL_TIME:
            if (state.longTerm === action.longTerm) {
                return Object.assign({}, state, {realTime : action.realTime, longTerm: action.longTerm});
            } else {
                if (action.longTerm) {
                    return Object.assign({}, state, {realTime : action.realTime, longTerm: action.longTerm, range : configState.range.longHistoryRange * 60, step : configState.range.longHistoryStep});
                } else {
                    return Object.assign({}, state, {realTime : action.realTime, longTerm: action.longTerm, range : configState.range.shortHistoryRange, step : configState.range.shortHistoryStep});
                }
            }

        case SET_REAL_TIME_VALUE:
            return Object.assign({}, state, {realTime : action.realTime, longTerm: action.longTerm, value: action.value});
        case SET_REAL_TIME_RANGE_STEP_VALUE:
            return Object.assign({}, state, {realTime : action.realTime, longTerm: action.longTerm, value: action.value, range : action.range, step : action.step});
        case SET_RANGE_DATE:
            return Object.assign({}, state, {date : action.date});
        case SET_RANGE_HOURS:
            return Object.assign({}, state, {hours : action.hours});
        case SET_RANGE_MINUTES:
            return Object.assign({}, state, {minutes : action.minutes});
        case SET_RANGE_VALUE:
            return Object.assign({}, state, {value : action.value});
        case SET_RANGE_DATE_HOURS_MINUTES:
            return Object.assign({}, state, {date : action.date, hours : action.hours, minutes : action.minutes});
        case SET_RANGE_DATE_HOURS_MINUTES_VALUE:
            return Object.assign({}, state, {date : action.date, hours : action.hours, minutes : action.minutes, value : action.value, fromPast : action.fromPast});
        case SET_RANGE_ALL:
            return Object.assign({}, state, {date : action.date, hours : action.hours, minutes : action.minutes, value : action.value, realTime : action.realTime, longTerm: action.longTerm, range : action.range, step : action.step});
        case SET_FROM_PAST:
            return Object.assign({}, state, {fromPast : action.fromPast});
        default:
            return state;
    }
};

const supportedState = {
    supported : true
};

const supported = (state = supportedState, action) => {
    switch (action.type) {

        case SET_SUPPORTED:
            return Object.assign({}, state, {supported : action.supported});
        default:
            return state;
    }
};

let topologyOptionState = {
    tpsToLineSpeed : true,
    speedLevel : "fast",
    redLine : true,
    highlight : true,
    distance : 300,
    zoom : false,
    pin : false,
    lastUpdateTime : null,
    grouping : true,
    arcLine : false,
    nodeCount : 0,
    linkCount : 0
};

if (localStorage) {
    let storageTopologyOptionState = localStorage.getItem("topologyOptions");
    if (storageTopologyOptionState) {
        topologyOptionState = JSON.parse(storageTopologyOptionState);
    }
}

const topologyOption = (state = topologyOptionState, action) => {
    switch (action.type) {
        case SET_TOPOLOGY_OPTION:
            let options = Object.assign({}, state, action.topologyOption);


            localStorage && localStorage.setItem("topologyOptions", JSON.stringify(options));
            return options;
        default:
            return state;
    }
};

let alertInfo = JSON.parse(localStorage.getItem("alert"));

const alertState = {
    data: [],
    offset: {},
    clearTime: alertInfo ? alertInfo.clearTime : null,
    clearItem: alertInfo ? alertInfo.clearItem : {}
};

const alert = (state = alertState, action) => {
    switch (action.type) {
        case SET_ALERT:
            let options = Object.assign({}, state, action.alert);
            return options;
        default:
            return state;
    }
};


const templateNameState = {
    preset: null,
    layout: null
};

const templateName = (state = templateNameState, action) => {
    switch (action.type) {
        case SET_TEMPLATE_NAME:
            return {
                preset: action.preset,
                layout: action.layout
            }
        case SET_PRESET_NAME:
            return {
                preset: action.preset,
                layout: null
            }
        case SET_LAYOUT_NAME:
            return Object.assign({}, state, {layout: action.layout});
        default:
            return state;
    }
};

const timeFocusState = {
    active : false,
    time : null,
    id : null,
    keep : false,
};

const timeFocus =(state=timeFocusState, action ) =>{
    switch (action.type) {
        case SET_TIME_FOCUS:
            return {
                active : action.active,
                time: action.time,
                id: action.id,
                keep : action.keep
            };
        default:
            return state;
    }
};
const scouterApp = combineReducers({
    supported,
    target,
    counterInfo,
    user,
    message,
    control,
    style,
    config,
    request,
    template,
    range,
    searchCondition,
    paper,
    topologyOption,
    alert,
    templateName,
    timeFocus
});

export default scouterApp;