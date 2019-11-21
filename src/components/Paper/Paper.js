import React, {Component} from "react";
import "./Paper.css";
import "./Resizable.css";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import {addRequest, pushMessage, setBoxes, setBoxesLayouts, setLayoutChangeTime, setControlVisibility, setLayouts, setRangeDateHoursMinutesValue, setRealTime, setTemplate, setBreakpoint, setTemplateName, setLayoutName, setTimeFocus} from "../../actions";
import {Responsive, WidthProvider} from "react-grid-layout";
import {Box, BoxConfig, XLogFilter} from "../../components";
import jQuery from "jquery";
import * as common from "../../common/common";
import {errorHandler, getCurrentUser, getData, getDivideDays, getHttpProtocol, getSearchDays, getWithCredentials, setAuthHeader, setData} from "../../common/common";
import Profiler from "./XLog/Profiler/Profiler";
import ActiveService from "./ActiveService/ActiveService";
import ServerDate from "../../common/ServerDate";
import moment from "moment";
import * as Options from "./PaperControl/Options"
import OldVersion from "../OldVersion/OldVersion";
import ScouterPatternMatcher from "../../common/ScouterPatternMatcher";
import {timeMiToMs} from "../../common/common";


const ResponsiveReactGridLayout = WidthProvider(Responsive);

class Paper extends Component {
    dataRefreshTimer = null;
    xlogHistoryRequestTime = null;
    mounted = false;
    xlogHistoryTemp = [];
    xlogHistoryTotalDays = 0;
    xlogHistoryCurrentDays = 0;
    isLoading = false;

    lastFrom = null;
    lastTo = null;

    needSearch = false;
    needSearchFrom = null;
    needSearchTo = null;

    boxesRef = {};
    breakpoint = "lg";
    resizeTimer = null;

    constructor(props) {
        super(props);
        this.counterHistoriesLoaded = {};
        this.counterReady = false;

        let layouts = getData("layouts");
        let boxes = getData("boxes");
      
        // xs와 xxs를 제거하면서, 기존에 저장된 데이터 warning 로그가 생성되어, lg, md 이외의 정보 삭제
        if (layouts) {
            for (let breakpoint in layouts) {
                if (!(breakpoint === "md" || breakpoint === "lg")) {
                    delete layouts[breakpoint];
                }
            }
        }
        if (!(layouts)) {
            layouts = {};
        }
        if (!boxes) {
            boxes = [];
        }

        let range = timeMiToMs(this.props.config.realTimeXLogLastRange);
        let endTime = (new ServerDate()).getTime();
        let startTime = endTime - range;


        //URL로부터 XLOG 응답시간 축 시간 값 세팅
        let xlogElapsedTime = common.getParam(this.props, "xlogElapsedTime");

        const templateName = getData("templateName");
        const layoutOnLocal = templateName ? templateName.layout : null;

        //URL로부터 layout 세팅
        let layoutFromParam = common.getParam(this.props, "layout");
        if ((layoutFromParam && layoutFromParam !== layoutOnLocal) || Object.keys(layouts).length === 0) {
            jQuery.ajax({
                method: "GET",
                async: true,
                url: getHttpProtocol(this.props.config) + "/scouter/v1/kv/__scouter_paper_layout",
                xhrFields: getWithCredentials(this.props.config),
                beforeSend: (xhr) => {
                    setAuthHeader(xhr, this.props.config, getCurrentUser(this.props.config, this.props.user));
                }
            }).done((msg) => {
                if (msg && Number(msg.status) === 200) {
                    let isSet = false;
                    let layouts = JSON.parse(msg.result);
                    let boxesFallback;
                    let layoutsFallback;
                    let templateNameFallback;
                    for (let i = 0; i < layouts.length; i++) {
                        if (layoutFromParam === layouts[i].name) {
                            this.props.setTemplate(layouts[i].boxes, layouts[i].layouts);
                            setData("templateName", Object.assign({}, getData("templateName"), {layout: layouts[i].name}));
                            this.props.setLayoutName(layouts[i].name);
                            isSet = true;
                            break;
                        } else {
                            boxesFallback = layouts[i].boxes;
                            layoutsFallback = layouts[i].layouts;
                            templateNameFallback = layouts[i].name;
                        }
                    }
                    if (!isSet && boxesFallback) {
                        this.props.setTemplate(boxesFallback, layoutsFallback);
                        setData("templateName", Object.assign({}, getData("templateName"), {layout: templateNameFallback}));
                        this.props.setLayoutName(templateNameFallback);
                    }
                }
            }).fail((xhr, textStatus, errorThrown) => {
                errorHandler(xhr, textStatus, errorThrown, this.props, "layout", true);
            });

        }

        // URL로부터 range 컨트럴의 데이터를 세팅
        let params = common.getParam(this.props, "realtime,longterm,from,to,fromPast");

        let now = moment();
        let from = now.clone().subtract(10, "minutes");
        let to = now;
        if (params[2] && params[3]) {

            let fromPast = true;
            if (params[4] === false || params[4] === "false") {
                fromPast = false;
            }

            if (params[2].length === 14 && params[3].length === 14) {
                from = moment(params[2], "YYYYMMDDhhmmss");
                to = moment(params[3], "YYYYMMDDhhmmss");
            } else {
                from = moment(Number(params[2]));
                to = moment(Number(params[3]));
            }

            let value = Math.floor((to.valueOf() - from.valueOf()) / (1000 * 60));
            // 전달된 범위가 최소 범위보다 작을 경우, 최소 범위로 조회
            if (value < this.props.config.range.shortHistoryStep) {
                value = this.props.config.range.shortHistoryStep;
                to = from.clone().add(value, "minutes");
            }

            // 현재 시간으로부터 조회라면, 계산된 value로 from to를 다시 세팅
            if (!fromPast) {
                to = moment();
                from = to.clone().subtract(value, "minutes");
            }

            if (!isNaN(value)) {
                this.props.setRangeDateHoursMinutesValue(from, from.hours(), from.minutes(), value, fromPast);
                this.needSearch = true;
                this.needSearchFrom = from.valueOf();
                this.needSearchTo = to.valueOf();
            }
        }

        if (params[0] || params[0] === null) {//realtime
            this.props.setRealTime(true, false);
            common.setRangePropsToUrl(this.props);

        } else {
            if (params[1]) {//longterm
                this.props.setRealTime(false, true);
            } else {
                //no longterm param then check config
                if (params[1] === undefined || params[1] === null) {
                    const shortLimitMillis = this.props.config.range.shortHistoryRange * 60 * 1000;
                    if (shortLimitMillis && shortLimitMillis < to.diff(from)) {
                        this.props.setRealTime(false, true);
                    } else {
                        this.props.setRealTime(false, false);
                    }
                } else {
                    this.props.setRealTime(false, false);
                }
            }
        }

        this.state = {
            filters: [],

            data: {
                tempXlogs: [],
                firstStepXlogs: [],
                firstStepTimestamp: null,
                secondStepXlogs: [],
                secondStepTimestamp: null,
                xlogs: [],
                newXLogs: [],
                offset1: 0,
                offset2: 0,
                startTime: startTime,
                endTime: endTime,
                range: range,
                maxElapsed: 8000,
                paramMaxElapsed: xlogElapsedTime,
                lastRequestTime: null,
                clearTimestamp: null
            },
            xlogHistoryDoing: false,
            xlogHistoryRequestCnt: 0,
            xlogNotSupportedInRange: false,

            pastTimestamp: null,

            /* visitor */
            visitor: {},

            /* diskUsage */
            diskUsage: {},

            /* counters */
            counters: {
                time: null,
                data: null
            },

            /* counters past data */
            countersHistory: {
                time: null,
                data: null,
                from: null,
                to: null
            },

            visible: true,
            rangeControl: false
        };

        // 초기화 : 만약 라인 차트 타입 설정이 없는 경우
        if( boxes ){
            for (const key in boxes) {
                if( !boxes[key].advancedOption && Array.isArray(boxes[key].option) ){
                    boxes[key].advancedOption = Options.options().lineChart.config;
                    for(const attr in boxes[key].advancedOption ){
                        boxes[key].values[attr] =  boxes[key].advancedOption[attr].value;
                    }
                }
                if(boxes[key].option && boxes[key].option.type ==='xlog' && !boxes[key].option.config['showClassicMode']){
                    boxes[key].option.config['showClassicMode'] = Options.options().xlog.config.showClassicMode;
                    boxes[key].values['showClassicMode'] = 'N';
                }
            }
        }
        this.props.setBoxesLayouts(boxes, layouts);

        if (templateName) {
            this.props.setTemplateName(templateName.preset, templateName.layout);
        }

        let anotherParam = {};
        if (templateName && templateName.layout) {
            anotherParam.layout = templateName.layout;
        }

        common.setTargetServerToUrl(this.props, this.props.config, anotherParam);
    }

    componentDidUpdate = (prevProps, nextState) => {
        let counterKeyMap = {};
        for (let i = 0; i < this.props.boxes.length; i++) {
            let option = this.props.boxes[i].option;

            if (option && option.length > 0) {
                for (let j = 0; j < option.length; j++) {
                    let innerOption = option[j];
                    if (innerOption.type === "counter") {
                        counterKeyMap[innerOption.counterKey] = true;
                    }
                }
            }
        }

        let prevCounterKeyMap = {};
        for (let i = 0; i < prevProps.boxes.length; i++) {
            let option = prevProps.boxes[i].option;

            if (option && option.length > 0) {
                for (let j = 0; j < option.length; j++) {
                    let innerOption = option[j];
                    if (innerOption.type === "counter") {
                        prevCounterKeyMap[innerOption.counterKey] = true;
                    }
                }
            }
        }

        // 카운터들이 변경되었을때, 다시 조회
        if (JSON.stringify(prevCounterKeyMap) !== JSON.stringify(counterKeyMap)) {
            if (this.props.range.realTime) {
                let now = (new ServerDate()).getTime();
                let ten = (this.props.config.preload === "Y") ? timeMiToMs(this.props.config.realTimeLastRange) : 1000;
                this.getCounterHistory(this.props.objects, now - ten, now, false);
                this.getLatestData(true, this.props.objects);
            } else {
                if (this.needSearch && this.props.objects && this.props.objects.length > 0) {
                    this.needSearch = false;
                    this.search(this.needSearchFrom, this.needSearchTo, this.props.objects);
                } else {
                    if (this.lastFrom && this.lastTo) {
                        this.getXLogHistory(this.lastFrom, this.lastTo, this.props.objects, this.props.range.longTerm);
                    }
                }
            }
        }

    };

    componentWillReceiveProps(nextProps) {

        if (this.props.searchCondition.time !== nextProps.searchCondition.time) {
            this.search(nextProps.searchCondition.from, nextProps.searchCondition.to);
        }

        if (JSON.stringify(nextProps.template) !== JSON.stringify(this.props.template)) {
            if (JSON.stringify(nextProps.template.boxes) !== JSON.stringify(this.state.boxes) || JSON.stringify(nextProps.template.layouts) !== JSON.stringify(this.state.layouts)) {
                // 초기화 : 로드한 차트에 만약 라인 차트 타입 설정이 없는 경우
                const boxes = nextProps.template.boxes;
                if( boxes ){
                    for (const key in boxes) {
                        if( !boxes[key].advancedOption && Array.isArray(boxes[key].option) ){
                            boxes[key].advancedOption = Options.options().lineChart.config;
                            for(const attr in boxes[key].advancedOption ){
                                boxes[key].values[attr] =  boxes[key].advancedOption[attr].value;
                            }
                        }
                        if(boxes[key].option.type ==='xlog' && !boxes[key].option.config['showClassicMode']){
                            boxes[key].option.config['showClassicMode'] = Options.options().xlog.config.showClassicMode;
                            boxes[key].values['showClassicMode'] = 'N';
                        }
                    }
                }
                this.props.setBoxesLayouts(boxes, nextProps.template.layouts);
            }
        }

        if (JSON.stringify(this.props.objects) !== JSON.stringify(nextProps.objects)) {
            if (this.props.range.realTime) {
                let now = (new ServerDate()).getTime();
                let ten = (this.props.config.preload === "Y") ? timeMiToMs(this.props.config.realTimeLastRange) : 1000;
                this.getCounterHistory(nextProps.objects, now - ten, now, false);
                this.getLatestData(true, nextProps.objects);
            } else {
                if (this.needSearch) {
                    this.needSearch = false;
                    this.search(this.needSearchFrom, this.needSearchTo, nextProps.objects);
                } else {
                    if (this.lastFrom && this.lastTo) {
                        this.getXLogHistory(this.lastFrom, this.lastTo, nextProps.objects, this.props.range.longTerm);
                    }
                }
            }
        }

        if (JSON.stringify(this.props.filterMap) !== JSON.stringify(nextProps.filterMap)) {
            this.getVisitor(nextProps);
        }

        if (this.props.range.realTime !== nextProps.range.realTime) {
            this.setState({
                counters: {
                    time: null,
                    data: null
                },
                countersHistory: {
                    time: null,
                    data: null,
                    from: null,
                    to: null
                }
            });

            if (nextProps.range.realTime) {
                this.counterHistoriesLoaded = {};
                clearInterval(this.dataRefreshTimer);
                this.dataRefreshTimer = null;

                let now = (new ServerDate()).getTime();
                let ten = (this.props.config.preload === "Y") ? timeMiToMs(this.props.config.realTimeLastRange) : 1000;
                this.getCounterHistory(this.props.objects, now - ten, now, false);
                this.getLatestData(true, this.props.objects);
            } else {
                clearInterval(this.dataRefreshTimer);
                this.dataRefreshTimer = null;
            }

            this.props.setTimeFocus(false,null,this.props.timeFocus.id);
        }

        if (JSON.stringify(this.props.objects) !== JSON.stringify(nextProps.objects) || JSON.stringify(this.props.range) !== JSON.stringify(nextProps.range)) {
            common.setRangePropsToUrl(nextProps);
        }

        // get box key & set xlog filter by url
        let boxKey;
        for (let i = 0; i < this.props.boxes.length; i++) {
            let title = this.props.boxes[i].title;
            let key = this.props.boxes[i].key;

            if(title === "XLOG") {
                boxKey = key;
                break;
            }
        }

        if(boxKey && this.isLoading === false) {
            let xlogfilter = common.getParam(this.props, "xlogfilter");
            if(xlogfilter)
                this.setXlogFilterByUrl(boxKey, JSON.parse(xlogfilter));
            this.isLoading = true;
        }
    }

    componentDidMount() {
        this.mounted = true;

        if (this.props.objects && this.props.objects.length > 0) {
            let now = (new ServerDate()).getTime();
            let ten = (this.props.config.preload === "Y") ? timeMiToMs(this.props.config.realTimeLastRange) : 1000;
            this.getCounterHistory(this.props.objects, now - ten, now, false);
            if (this.props.range.realTime) {
                this.getLatestData(false, this.props.objects);
            }
        }

        /*setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 1000);*/

        document.addEventListener('visibilitychange', this.visibilitychange.bind(this));

        this.setState({
            visible: document.visibilityState === 'visible'
        });

        window.addEventListener("resize", this.resize);

    }


    componentWillUnmount() {
        this.mounted = false;
        clearInterval(this.dataRefreshTimer);
        this.dataRefreshTimer = null;

        window.removeEventListener("resize", this.resize);

        document.removeEventListener('visibilitychange', this.visibilitychange.bind(this));

    }

    resize = () => {
        if (this.resizeTimer) {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = null;
        }

        this.resizeTimer = setTimeout(() => {
            this.props.setLayoutChangeTime();
        }, 1000);

    };

    getLatestData(clear, objects) {
        if (clear) {
            // SEARCH 옵션으로 한번이라도 조회했다면 지우고 다시
            if (this.state.pastTimestamp) {
                this.getXLog(true, objects);
            } else {
                // SEARCH에서 다시 REALTIME인 경우 이어서
                this.getXLog(clear, objects);
            }
        } else {
            this.getXLog(false, objects);
        }

        this.getVisitor(this.props);
        this.getDiskUsage(this.props);
        this.getRealTimeCounter();

        clearInterval(this.dataRefreshTimer);
        this.dataRefreshTimer = null;

        this.dataRefreshTimer = setTimeout(() => {
            this.getLatestData(false, objects);
        }, this.props.config.interval);

    }


    getRealTimeCounter = () => {
        const that = this;

        if (this.props.objects && this.props.objects.length > 0) {
            let counterKeyMap = {};
            for (let i = 0; i < this.props.boxes.length; i++) {
                let option = this.props.boxes[i].option;

                if (option && option.length > 0) {
                    for (let j = 0; j < option.length; j++) {
                        let innerOption = option[j];
                        if (innerOption.type === "counter") {
                            counterKeyMap[innerOption.counterKey] = true;
                        }
                    }
                } else if (option && option.type === "ActiveSpeed") {
                    counterKeyMap[option.counterKey] = true;
                }
            }

            let counterKeys = [];
            for (let attr in counterKeyMap) {
                counterKeys.push(attr);
            }

            if (counterKeys.length < 1) {
                return false;
            }

            this.counterReady = counterKeys.filter((key) => key !== "ActiveSpeed").every((key) => this.counterHistoriesLoaded[key]);

            if (this.counterReady) {
                let params = JSON.stringify(counterKeys.map((key) => encodeURI(key)));
                params = params.replace(/"/gi, "");
                this.props.addRequest();
                jQuery.ajax({
                    method: "GET",
                    async: true,
                    url: getHttpProtocol(this.props.config) + '/scouter/v1/counter/realTime/' + params + '?objHashes=' + JSON.stringify(this.props.objects.map((obj) => {
                        return Number(obj.objHash);
                    })),
                    xhrFields: getWithCredentials(that.props.config),
                    beforeSend: function (xhr) {
                        setAuthHeader(xhr, that.props.config, getCurrentUser(that.props.config, that.props.user));
                    }
                }).done((msg) => {
                    if (!that.mounted) {
                        return;
                    }
                    let map = {};

                    for (let i = 0; i < counterKeys.length; i++) {
                        map[counterKeys[i]] = {};
                    }

                    if (msg.result) {
                        for (let i = 0; i < msg.result.length; i++) {
                            let counter = msg.result[i];
                            map[counter.name][counter.objHash] = counter;
                        }
                    }

                    this.setState({
                        counters: {
                            time: (new ServerDate()).getTime(),
                            data: map
                        }
                    });
                }).fail((xhr, textStatus, errorThrown) => {
                    errorHandler(xhr, textStatus, errorThrown, this.props, "getRealTimeCounter", true);
                });
            } else {
                let now = (new ServerDate()).getTime();
                let ten = (this.props.config.preload === "Y") ? timeMiToMs(this.props.config.realTimeLastRange) : 1000;
                this.getCounterHistory(this.props.objects, now - ten, now, false);
            }
        }
    };

    // load all data
    getCounterHistory = (objects, from, to, longTerm) => {
        this.getPaperCounterHistory(objects, from, to, longTerm, null);
    };

    // load specific box data
    getSingleCounterHistory = (box) => {
        let now = (new ServerDate()).getTime();
        let ten = timeMiToMs(this.props.config.realTimeLastRange);
        let longTerm = false;
        let objects = this.props.objects;
        this.getPaperCounterHistory(objects, now - ten, now, longTerm, box);
    };

    tempBox = "";

    getPaperCounterHistory = (objects, from, to, longTerm, box) => {

        if (objects && objects.length > 0) {

            let counterKeyMap = {};
            let counterHistoryKeyMap = {};

            for (let i = 0; i < this.props.boxes.length; i++) {
                let option = this.props.boxes[i].option;

                if (option && option.length > 0) {
                    for (let j = 0; j < option.length; j++) {
                        let innerOption = option[j];
                        if (innerOption.type === "counter") {
                            counterKeyMap[innerOption.counterKey] = true;
                            counterHistoryKeyMap[innerOption.counterKey] = {
                                key: innerOption.counterKey,
                                familyName: innerOption.familyName
                            };
                        }
                    }
                }
            }

            let counterKeys = [];
            for (let attr in counterKeyMap) {
                counterKeys.push(attr);
            }

            let counterHistoryKeys = [];
            for (let attr in counterHistoryKeyMap) {
                counterHistoryKeys.push(counterHistoryKeyMap[attr]);
            }

            if (counterKeys.length < 1) {
                return false;
            }

            for (let i = 0; i < counterHistoryKeys.length; i++) {
                let counterKey = counterHistoryKeys[i].key;
                let familyName = counterHistoryKeys[i].familyName;
                let now = (new Date()).getTime();
                let startTime = from;
                let endTime = to;
                let url;

                // specific box
                if(box !== null) {
                    for (let j = 0; j < box.option.length; j++) {
                        let counterKey2 = box.option[j].counterKey;
                        if(counterKey === counterKey2 || (this.tempBox !== undefined && (this.tempBox).indexOf(counterKey) >= 0)) {
                            if((this.tempBox).indexOf(counterKey) === -1) this.tempBox += counterKey+":";
                            startTime = from;
                            break;
                        }
                    }
                }

                if (longTerm) {

                    url = getHttpProtocol(this.props.config)
                            + '/scouter/v1/counter/stat/' + encodeURI(counterKey) + '?objHashes='+ JSON.stringify(objects.filter((d) => {
                                return d.objFamily === familyName;
                    }).map((obj) => {
                            return Number(obj.objHash);
                    })) +"&startYmd=" + moment(startTime).format("YYYYMMDD")
                        + "&endYmd=" + moment(endTime).format("YYYYMMDD");
                    this.getCounterHistoryData(url, counterKey, from, to, now, false);

                } else {
                    url = getHttpProtocol(this.props.config) + '/scouter/v1/counter/' + encodeURI(counterKey) + '?objHashes=' + JSON.stringify(objects.filter((d) => {
                            return d.objFamily === familyName;
                }).map((obj) => {
                        return Number(obj.objHash);
                })) +"&startTimeMillis=" + startTime + "&endTimeMillis="
                    + endTime;
                    this.getCounterHistoryData(url, counterKey, from, to, now, false);
                }
            }

        }
    };

    changeLongTerm = (longTerm) => {
        this.setState({
            longTerm: longTerm
        });
    };

    setLoading = (visible) => {
        if (visible) {
            this.props.setControlVisibility('Loading',true);
        } else {
            setTimeout(() =>{
                this.props.setControlVisibility('Loading', false);
            },300);
        }
    };

    search = (from, to, objects) => {

        this.lastFrom = from;
        this.lastTo = to;

        this.setState({
            countersHistory: {
                time: null,
                data: null,
                from: from,
                to: to
            }
        });

        this.getCounterHistory(objects || this.props.objects, from, to, this.props.range.longTerm);
        this.getXLogHistory(from, to, objects || this.props.objects, this.props.range.longTerm);

    };

    visibilitychange = () => {
        this.setState({
            visible: document.visibilityState === 'visible'
        });
    };

    sampling = (data) => {
        return data.filter((d) => {
            if (Number(d.error)) {
                return Math.round(Math.random() * 100) > (100 - this.props.config.xlog.error.sampling);
            } else {
                return Math.round(Math.random() * 100) > (100 - this.props.config.xlog.normal.sampling);
            }
        })
    };

    getXLog = (clear, objects) => {
        let that = this;
        if (objects && objects.length > 0) {
            this.props.addRequest();
            jQuery.ajax({
                method: "GET",
                async: true,
                dataType: 'text',
                url: getHttpProtocol(this.props.config) + '/scouter/v1/xlog/realTime/' + (clear ? 0 : this.state.data.offset1) + '/' + (clear ? 0 : this.state.data.offset2) + '?objHashes=' + JSON.stringify(objects.map((instance) => {
                    return Number(instance.objHash);
                })),
                xhrFields: getWithCredentials(that.props.config),
                beforeSend: function (xhr) {
                    setAuthHeader(xhr, that.props.config, getCurrentUser(that.props.config, that.props.user));
                }
            }).done((msg) => {

                if (!msg) {
                    return;
                }

                let result = (JSON.parse(msg)).result;

                let now = (new ServerDate()).getTime();

                let datas = null;
                if (Number(this.props.config.xlog.normal.sampling) !== 100 || Number(this.props.config.xlog.error.sampling) !== 100) {
                    datas = this.sampling(result.xlogs);
                } else {
                    datas = result.xlogs;
                }

                let tempXlogs = this.state.data.tempXlogs.concat(datas);
                let data = this.state.data;

                data.offset1 = result.xlogLoop;
                data.offset2 = result.xlogIndex;
                data.tempXlogs = tempXlogs;
                data.lastRequestTime = now;

                let endTime = (new ServerDate()).getTime();
                let startTime = endTime - this.state.data.range;

                let firstStepStartTime = this.state.data.lastRequestTime - 1000;
                let secondStepStartTime = firstStepStartTime - 5000;

                this.removeOverTimeXLogFrom(data.tempXlogs, startTime);
                if (!this.state.visible) {
                    this.setState({
                        data: data
                    });
                    return;
                }

                let xlogs = clear ? [] : this.state.data.xlogs;
                let newXLogs = clear ? [] : this.state.data.newXLogs;
                let firstStepXlogs = clear ? [] : this.state.data.firstStepXlogs;
                let secondStepXlogs = clear ? [] : this.state.data.secondStepXlogs;
                let lastStepXlogs = [];

                for (let i = 0; i < secondStepXlogs.length; i++) {
                    let d = secondStepXlogs[i];
                    if (d.endTime >= firstStepStartTime) {
                        firstStepXlogs.push(secondStepXlogs.splice(i, 1)[0]);
                    } else if (d.endTime >= secondStepStartTime && d.endTime < firstStepStartTime) {

                    } else {
                        lastStepXlogs.push(secondStepXlogs.splice(i, 1)[0]);
                    }
                }


                for (let i = 0; i < firstStepXlogs.length; i++) {
                    let d = firstStepXlogs[i];
                    if (d.endTime >= firstStepStartTime) {

                    } else if (d.endTime >= secondStepStartTime && d.endTime < firstStepStartTime) {
                        secondStepXlogs.push(firstStepXlogs.splice(i, 1)[0]);
                    } else {
                        lastStepXlogs.push(firstStepXlogs.splice(i, 1)[0]);
                    }
                }

                for (let i = 0; i < tempXlogs.length; i++) {
                    let d = tempXlogs[i];
                    if (d.endTime >= firstStepStartTime) {
                        firstStepXlogs.push(d);
                    } else if (d.endTime >= secondStepStartTime && d.endTime < firstStepStartTime) {
                        secondStepXlogs.push(d);
                    } else {
                        lastStepXlogs.push(d);
                    }
                }

                xlogs = xlogs.concat(newXLogs);
                newXLogs = lastStepXlogs;

                this.removeOverTimeXLogFrom(xlogs, startTime);

                data.tempXlogs = [];
                data.firstStepXlogs = firstStepXlogs;
                data.firstStepTimestamp = now;
                data.secondStepXlogs = secondStepXlogs;
                data.secondStepTimestamp = now;
                data.xlogs = xlogs;
                data.newXLogs = newXLogs;
                data.startTime = startTime;
                data.endTime = endTime;
                data.pastTimestamp = null;
                data.clearTimestamp = clear ? (new Date()).getTime() : data.clearTimestamp;
                this.setState({
                    data: data,
                    xlogNotSupportedInRange: false
                });

            }).fail((xhr, textStatus, errorThrown) => {
                errorHandler(xhr, textStatus, errorThrown, this.props, "getXLog", true);
            });
        }
    };

    setStopXlogHistory = () => {
        this.xlogHistoryRequestTime = null;
        this.setState({
            xlogHistoryDoing: false,
            xlogHistoryRequestCnt: 0
        });

    };

    getXLogHistory = (from, to, objects, longTerm) => {

        if (longTerm) {
            let data = this.state.data;
            let now = (new ServerDate()).getTime();
            data.lastRequestTime = now;
            data.tempXlogs = [];
            data.newXLogs = [];
            data.xlogs = [];
            data.startTime = from;
            data.endTime = to;

            this.setState({
                data: data,
                pastTimestamp: now
            });
            return;
        }

        //xlog retrieve limit is 60 minute
        if (to - from > 60 * 60 * 1000) {
            let data = this.state.data;
            let now = (new ServerDate()).getTime();
            data.lastRequestTime = now;
            data.tempXlogs = [];
            data.newXLogs = [];
            data.xlogs = [];
            data.startTime = from;
            data.endTime = to;

            this.setState({
                data: data,
                pastTimestamp: now,
                xlogNotSupportedInRange: true
            });
            return;
        }

        if (objects && objects.length > 0) {

            let data = this.state.data;
            let now = (new ServerDate()).getTime();
            data.lastRequestTime = now;
            data.tempXlogs = [];
            data.newXLogs = [];
            data.xlogs = [];
            data.startTime = from;
            data.endTime = to;

            this.setState({
                data: data,
                pastTimestamp: now,
                xlogHistoryDoing: true,
                xlogHistoryRequestCnt: 0,
                xlogNotSupportedInRange: false
            });

            let days = getSearchDays(from, to);
            let fromTos = getDivideDays(from, to);

            this.xlogHistoryTemp = [];
            this.xlogHistorytotalDays = days;
            this.xlogHistoryCurrentDays = 0;
            this.xlogHistoryRequestTime = now;

            if (days > 1) {
                for (let i = 0; i < fromTos.length; i++) {
                    this.getXLogHistoryData(now, fromTos[i].from, fromTos[i].to, objects);
                }
            } else {
                this.getXLogHistoryData(now, from, to, objects);
            }
        }
    };

    getXLogHistoryData = (requestTime, from, to, objects, lastTxid, lastXLogTime) => {
        let that = this;

        if (!this.mounted) {
            return;
        }

        if (this.xlogHistoryRequestTime !== requestTime) {
            return;
        }

        if (objects && objects.length > 0) {

            let data = this.state.data;

            this.props.addRequest();
            jQuery.ajax({
                method: "GET",
                async: true,
                dataType: 'text',
                url: getHttpProtocol(this.props.config) + "/scouter/v1/xlog/" + moment(from).format("YYYYMMDD") + "?startTimeMillis=" + from + '&endTimeMillis=' + to + (lastTxid ? '&lastTxid=' + lastTxid : "") + (lastXLogTime ? '&lastXLogTime=' + lastXLogTime : "") + '&objHashes=' +
                JSON.stringify(objects.map((instance) => {
                    return Number(instance.objHash);
                })),
                xhrFields: getWithCredentials(that.props.config),
                beforeSend: function (xhr) {
                    setAuthHeader(xhr, that.props.config, getCurrentUser(that.props.config, that.props.user));
                }
            }).done((msg) => {
                if (!that.mounted) {
                    return;
                }
                if (!msg) {
                    return;
                }

                if (this.xlogHistoryRequestTime !== requestTime) {
                    let data = this.state.data;
                    data.xlogs = Array.prototype.concat.apply([], that.xlogHistoryTemp);
                    this.setState({
                        data: data
                    });
                    return;
                }

                let result = (JSON.parse(msg)).result;

                let hasMore = result.hasMore;

                let xlogs = null;
                if (Number(this.props.config.xlog.normal.sampling) !== 100 || Number(this.props.config.xlog.error.sampling) !== 100) {
                    xlogs = this.sampling(result.xlogs);
                } else {
                    xlogs = result.xlogs;
                }

                that.xlogHistoryTemp.push(xlogs);
                data.newXLogs = xlogs;


                if (hasMore) {
                    this.setState({
                        data: data,
                        pageCnt: (new Date()).getTime(),
                        xlogHistoryRequestCnt: this.state.xlogHistoryRequestCnt + 1
                    });

                    that.getXLogHistoryData(requestTime, from, to, objects, result.lastTxid, result.lastXLogTime);
                } else {
                    that.xlogHistoryCurrentDays++;
                    if (that.xlogHistoryTotalDays <= that.xlogHistoryCurrentDays) {
                        let data = this.state.data;
                        data.xlogs = Array.prototype.concat.apply([], that.xlogHistoryTemp);
                        this.setState({
                            data: data,
                            pageCnt: (new Date()).getTime(),
                            xlogHistoryDoing: false,
                            xlogHistoryRequestCnt: 0
                        });
                    }
                }

            }).fail((xhr, textStatus, errorThrown) => {
                errorHandler(xhr, textStatus, errorThrown, this.props, "getXLogHistoryData", true);
            });
        }
    };

    getVisitor = (props) => {
        let that = this;
        if (props.objects && props.objects.length > 0) {
            let filterdObjects = props.objects.filter((instance) => {
                return props.filterMap[instance.objHash]
            });

            if (filterdObjects.length > 0) {
                props.addRequest();
                let time = (new ServerDate()).getTime();
                jQuery.ajax({
                    method: "GET",
                    async: true,
                    url: getHttpProtocol(props.config) + '/scouter/v1/visitor/realTime?objHashes=' + JSON.stringify(filterdObjects.map((instance) => {
                        return Number(instance.objHash);
                    })),
                    xhrFields: getWithCredentials(props.config),
                    beforeSend: function (xhr) {
                        setAuthHeader(xhr, props.config, getCurrentUser(props.config, props.user));
                    }
                }).done((msg) => {
                    if (!that.mounted) {
                        return;
                    }
                    this.setState({
                        visitor: {
                            time: time,
                            visitor: msg.result
                        }
                    });
                }).fail((xhr, textStatus, errorThrown) => {
                    errorHandler(xhr, textStatus, errorThrown, props, "getVisitor", true);
                });
            } else {
                let time = (new ServerDate()).getTime();
                this.setState({
                    visitor: {
                        time: time,
                        visitor: 0
                    }
                });
            }


        }
    };

    getDiskUsage = (props) => {
        if(!this.mounted){
            return;
        }
        let time = (new ServerDate()).getTime();
        let refreshTime = 1000 * 60 * 15; // 15min
        let diffTime = time - (!this.state.diskRefreshTime ? time-refreshTime: this.state.diskRefreshTime);

        if (props.objects && props.objects.length > 0 && diffTime >= refreshTime) {
            const filterdObjects = props.objects.filter(instance => {
                return instance.objFamily === "host" && instance.alive
            });
            if(filterdObjects.length === 0){
                return;
            }
            props.addRequest();
            const _promoise = filterdObjects.map((data)=>{
                  return jQuery.ajax({
                    method: "GET",
                    async: true,
                    dataType: "json",
                    url: getHttpProtocol(props.config) + '/scouter/v1/object/host/realTime/disk/ofObject/'+ JSON.parse(JSON.stringify(data)).objHash,
                    xhrFields: getWithCredentials(props.config),
                    beforeSend: function (xhr) {
                        setAuthHeader(xhr, props.config, getCurrentUser(props.config, props.user));
                    }
                });
            });
            jQuery.when(..._promoise)
                .done((...get)=>{
                    const disk= filterdObjects.map((obj,ix)=>{
                       return {...obj,disk : (Array.isArray(get[ix]) ? get[ix][0].result : get[ix].result ) }
                    });
                    this.setState({
                            diskRefreshTime: time,
                            diskUsage: {
                                time: (new ServerDate()).getTime(),
                                diskUsage: disk
                            }});

                })
        }
    };

    getCounterHistoryData = (url, counterKey, from, to, now, append) => {
        this.setLoading(true);
        let that = this;
        this.props.addRequest();
        jQuery.ajax({
            method: "GET",
            async: true,
            url: url,
            xhrFields: getWithCredentials(that.props.config),
            beforeSend: function (xhr) {
                setAuthHeader(xhr, that.props.config, getCurrentUser(that.props.config, that.props.user));
            }
        }).done((msg) => {
            if (!this.mounted) {
                return;
            }
            let countersHistory = this.state.countersHistory.data ? Object.assign({}, this.state.countersHistory.data) : {};

            let counterHistory;

            if (msg.result) {
                for (let i = 0; i < msg.result.length; i++) {
                    let counter = msg.result[i];
                    counterHistory = countersHistory[counterKey] ? countersHistory[counterKey] : {};
                    if (counter.valueList.length > 0) {

                        if (append) {
                            if (counterHistory[counter.objHash]) {
                                counterHistory[counter.objHash].timeList = counterHistory[counter.objHash].timeList.concat(counter.timeList);
                                counterHistory[counter.objHash].valueList = counterHistory[counter.objHash].valueList.concat(counter.valueList);
                                counterHistory[counter.objHash].unit = counter.unit;
                                countersHistory[counterKey] = counterHistory;
                            } else {
                                counterHistory[counter.objHash] = {};
                                counterHistory[counter.objHash].timeList = counter.timeList;
                                counterHistory[counter.objHash].valueList = counter.valueList;
                                counterHistory[counter.objHash].unit = counter.unit;
                                countersHistory[counterKey] = counterHistory;
                            }
                        } else {
                            counterHistory[counter.objHash] = {};
                            counterHistory[counter.objHash].timeList = counter.timeList;
                            counterHistory[counter.objHash].valueList = counter.valueList;
                            counterHistory[counter.objHash].unit = counter.unit;
                            countersHistory[counterKey] = counterHistory;
                        }


                    }
                }
            }

            for (let key in countersHistory) {

                for (let objHash in countersHistory[key]) {

                    let smallInx = -1;
                    let temp = [];
                    for (let i = 0; i < countersHistory[key][objHash].timeList.length; i++) {
                        temp.push({
                            time: Number(countersHistory[key][objHash].timeList[i]),
                            value: countersHistory[key][objHash].valueList[i]
                        });
                    }
                    temp.sort((a, b) => a.time - b.time);
                    for (let i = 0; i < temp.length; i++) {
                        if (from < temp[i].time) {
                            smallInx = i;
                            break;
                        }
                    }

                    if (smallInx > -1) {
                        temp.splice(0, smallInx);
                    }

                    let binInx = -1;
                    for (let i = temp.length - 1; i > -0; i--) {
                        if (to > temp[i].time) {
                            binInx = i;
                            break;
                        }
                    }

                    if (binInx > -1) {
                        temp.splice(binInx + 1, temp.length - binInx);
                    }

                    countersHistory[key][objHash].timeList = temp.map((d) => d.time);
                    countersHistory[key][objHash].valueList = temp.map((d) => d.value);

                }

            }

            this.setState({
                countersHistory: {
                    time: new Date().getTime(),
                    data: countersHistory,
                    from: from,
                    to: to
                }
            });


            this.counterHistoriesLoaded[counterKey] = true;

            this.setLoading(false);
        }).fail((xhr, textStatus, errorThrown) => {
            errorHandler(xhr, textStatus, errorThrown, this.props, "getCounterHistoryData", true);
        });
    };

    removeOverTimeXLogFrom(tempXlogs, startTime) {
        let outOfRangeIndex = -1;
        for (let i = 0; i < tempXlogs.length; i++) {
            let d = tempXlogs[i];
            if (startTime < d.endTime) {
                break;
            }
            outOfRangeIndex = i;
        }

        if (outOfRangeIndex > -1) {
            tempXlogs.splice(0, outOfRangeIndex + 1);
        }
    };

    onLayoutChange(layout, layouts) {

        let boxes = this.props.boxes;
        boxes.forEach((box) => {
            layout.forEach((l) => {
                if (box.key === l.i) {
                    box.layout = l;
                    return false;
                }
            });
        });

        setData("layouts", layouts);
        setData("boxes", boxes);
        this.props.setLayouts(layouts);

        /*setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 500);*/

    };

    toggleRangeControl = () => {
        this.setState({
            rangeControl: !this.state.rangeControl
        });
    };

    removePaper = (key) => {

        let boxes = this.props.boxes;
        boxes.forEach((box, i) => {
            if (box.key === key) {
                boxes.splice(i, 1);
                return false;
            }
        });

        let layouts = this.props.layouts;

        for (let unit in layouts) {
            if (layouts[unit] && layouts[unit].length > 0) {
                layouts[unit].forEach((layout, i) => {
                    if (layout.i === key) {
                        layouts[unit].splice(i, 1);
                        return false;
                    }
                })
            }
        }

        this.props.setBoxesLayouts(boxes, layouts);

        setData("layouts", layouts);
        setData("boxes", boxes);
    };

    // specific box data load
    reloadData = (key) => {
        let boxes = this.props.boxes;
        boxes.forEach((box, i) => {
            if (box.key === key) {

                if(box.option !== undefined && box.option.type !== undefined && box.option.type === "diskUsage") {
                    this.setLoading(true);
                    this.setState({
                        diskRefreshTime: null
                    });
                    setTimeout(() =>{ this.setLoading(false); },100);
                }else{
                    this.getSingleCounterHistory(box);
                }
                return false;
           }
        });
    };

    setOption = (key, option) => {

        // paper init counter position : 2
        let boxes = this.props.boxes.slice(0);
        boxes.forEach((box) => {
            if (box.key === key) {

                if (option.mode === "exclusive") {
                    box.option = {
                        mode: option.mode,
                        type: option.type,
                        config: option.config,
                        counterKey: option.counterKey,
                        title: option.title
                    };
                } else {

                    if (!box.option) {
                        box.option = [];
                    }

                    if (box.option && !Array.isArray(box.option)) {
                        box.option = [];
                    }

                    let duplicated = false;
                    for (let i = 0; i < box.option.length; i++) {
                        if (box.option[i].counterKey === option.name && box.option[i].familyName === option.familyName) {
                            duplicated = true;
                            break;
                        }
                    }

                    if (!duplicated) {
                        box.option.push({
                            mode: "nonexclusive",
                            type: "counter",
                            config: option.config,
                            counterKey: option.name,
                            title: option.displayName,
                            familyName: option.familyName
                        });
                    }
                    if(!box.advancedOption && option.advancedOption ){
                        box.advancedOption = option.advancedOption;
                    }
                }

                box.values = {};
                for (let attr in option.config) {
                    box.values[attr] = option.config[attr].value;
                }
                if(option.advancedOption) {
                    for (let attr in option.advancedOption) {
                        box.values[attr] = option.advancedOption[attr].value;
                    }
                }
                if (Array.isArray(box.option)) {
                    box.config = false;
                    let title = "";
                    for (let i = 0; i < box.option.length; i++) {
                        title += box.option[i].title;
                        if (i < (box.option.length - 1)) {
                            title += ", ";
                        }
                    }
                    box.title = title
                } else {
                    box.config = false;
                    box.title = option.title;
                }

                return false;
            }
        });

        this.props.setBoxes(boxes);

        setData("boxes", boxes);
    };

    setOptionValues = (key, values) => {
        let boxes = this.props.boxes;
        boxes.forEach((box) => {
            if (box.key === key) {
                for (let attr in values) {
                    box.values[attr] = values[attr];
                }

                box.config = false;
            }
        });

        this.props.setBoxes(boxes);

        setData("boxes", boxes);
    };


    removeMetrics = (boxKey, counterKeys) => {

        if (this.boxesRef && this.boxesRef[boxKey]) {
            this.boxesRef[boxKey].removeTitle(counterKeys);
        }

        let boxes = this.props.boxes.slice(0);
        boxes.forEach((box) => {
            if (box.key === boxKey) {
                box.config = false;

                let options = box.option.filter((option) => {
                    let index = counterKeys.findIndex(function (e) {
                        return e === option.counterKey;
                    });

                    return index < 0;
                });

                box.option = options;
                box.config = false;
                let title = "";
                if (box.option.length > 0) {
                    for (let i = 0; i < box.option.length; i++) {
                        title += box.option[i].title;
                        if (i < (box.option.length - 1)) {
                            title += ", ";
                        }
                    }
                    box.title = title
                } else {
                    box.title = "NO TITLE";
                }
            }
        });

        this.props.setBoxes(boxes);

        setData("boxes", boxes);
    };

    setOptionClose = (key) => {
        let boxes = this.props.boxes;
        boxes.forEach((box) => {
            if (box.key === key) {
                box.config = false;
            }
        });

        this.props.setBoxes(boxes);

        setData("boxes", boxes);
    };


    toggleConfig = (key) => {
        let boxes = this.props.boxes;
        boxes.forEach((box) => {
            if (box.key === key) {
                box.config = !box.config;
                return false;
            }
        });

        this.props.setBoxes(boxes);

    };

    toggleFilter = (key) => {
        let filters = this.state.filters;
        let found = false;
        filters.forEach((filter) => {
            if (filter.key === key) {
                filter.show = !filter.show;
                found = true;
                return false;
            }
        });

        if (!found) {
            filters.push({
                key: key,
                show: true,
                data: {
                    filtering: false
                }
            });
        }

        this.setState({
            filters: filters
        });
    };

    setXlogFilter = (key, filtering, filter) => {
        let filters = Object.assign(this.state.filters);
        let filterInfo = filters.filter((d) => d.key === key)[0];
        filterInfo.show = false;
        if (filtering) {
            filter.filtering = true;
            filterInfo.data = filter;
        } else {
            filterInfo.data = {filtering: false};
        }

        this.setState({
            filters: filters
        });

        // set xlog filter to url
        common.setXlogfilterToUrl(this.props, filter);
    };

    // set xlog filter by url
    setXlogFilterByUrl = (key, filter) => {

        filter.serviceMatcher = new ScouterPatternMatcher(filter.service);
        filter.referrerMatcher = new ScouterPatternMatcher(filter.referrer);
        filter.userAgentMatcher = new ScouterPatternMatcher(filter.userAgent);
        filter.loginMatcher = new ScouterPatternMatcher(filter.login);
        filter.descMatcher = new ScouterPatternMatcher(filter.desc);

        let filters = Object.assign(this.state.filters);

        filters.push({
             key: key,
             show: false,
             data: {
                 filtering: true
             }
        });

        let filterInfo = filters.filter((d) => d.key === key)[0];
        filter.filtering = true;
        filterInfo.data = filter;

        this.setState({
              filters: filters
        });
    };

    closeFilter = (key) => {
        let filters = Object.assign(this.state.filters);
        let filterInfo = filters.filter((d) => d.key === key)[0];
        filterInfo.show = false;
        this.setState({
            filters: filters
        });
    };

    onBreakpointChange(newBreakpoint, newCols) {
        this.breakpoint = newBreakpoint;
        this.props.setBreakpoint(newBreakpoint);

    }

    render() {
        let objectSelected = this.props.objects.length > 0;

        return (
            <div className="papers">
                {!this.props.supported.supported && <OldVersion />}
                {this.props.supported.supported &&
                <div>
                    <div className="fixed-alter-object"></div>
                    {(objectSelected && (!this.props.boxes || this.props.boxes.length === 0)) &&
                    <div className="quick-usage">
                        <div>
                            <div>
                                <div>
                                    <h3>NO PAPER</h3>
                                    <ol>
                                        <li>CLICK <span className="add-paper-btn"><i className="fa fa-plus-circle" aria-hidden="true"></i> ADD PAPER</span> BUTTON IN LEFT PAPER CONFIG TO ADD PAPER</li>
                                        <li>AND DRAG METRIC TO PAPER</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>}
                    <ResponsiveReactGridLayout className="layout" breakpoints={{lg: 801, md: 800}} cols={{lg: 12, md: 6}} layouts={this.props.layouts} rowHeight={30} onLayoutChange={(layout, layouts) => this.onLayoutChange(layout, layouts)} onBreakpointChange={(newBreakpoint, newCols) => this.onBreakpointChange(newBreakpoint, newCols)}>
                        {this.props.boxes.map((box, i) => {
                            let filterInfo = this.state.filters.filter((d) => d.key === box.key)[0];
                            return (
                                <div className="box-layout" key={box.key} data-grid={box.layout}>
                                    <button className="box-control box-layout-remove-btn last" onClick={this.removePaper.bind(null, box.key)}><i className="fa fa-times-circle-o" aria-hidden="true"></i></button>
                                    {box.option && box.option.type !== 'diskUsage' && <button className="box-control box-layout-config-btn" onClick={this.toggleConfig.bind(null, box.key)}><i className="fa fa-cog" aria-hidden="true"></i></button>}
                                    {box.option && box.option.type !== "xlog" && (box.option.mode !== "exclusive" || box.option.type === 'diskUsage') && box.option && <button className="box-control box-layout-config-btn" onClick={this.reloadData.bind(null, box.key)}><i className="fa fa-refresh" aria-hidden="true"></i></button>}
                                    {box.option && (box.option.length > 1 || box.option.config ) && box.option.type === "xlog" && <button className={"box-control filter-btn " + (filterInfo && filterInfo.data && filterInfo.data.filtering ? "filtered" : "")} onClick={this.toggleFilter.bind(null, box.key)}><i className="fa fa-filter" aria-hidden="true"></i></button>}
                                    {box.config && <BoxConfig box={box} setOptionValues={this.setOptionValues} setOptionClose={this.setOptionClose} removeMetrics={this.removeMetrics}/>}
                                    {filterInfo && filterInfo.show && <XLogFilter box={box} filterInfo={filterInfo ? filterInfo.data : {filtering: false}} setXlogFilter={this.setXlogFilter} closeFilter={this.closeFilter}/>}
                                    <Box onRef={ref => this.boxesRef[box.key] = ref} visible={this.state.visible} setOption={this.setOption} box={box} filter={filterInfo ? filterInfo.data : {filtering: false}} pastTimestamp={this.state.pastTimestamp} pageCnt={this.state.pageCnt} data={this.state.data} config={this.props.config} visitor={this.state.visitor} diskUsage={this.state.diskUsage} counters={this.state.counters} countersHistory={this.state.countersHistory.data} countersHistoryFrom={this.state.countersHistory.from} countersHistoryTo={this.state.countersHistory.to} countersHistoryTimestamp={this.state.countersHistory.time} longTerm={this.props.range.longTerm} layoutChangeTime={this.props.layoutChangeTime} realtime={this.props.range.realTime} xlogHistoryDoing={this.state.xlogHistoryDoing} xlogHistoryRequestCnt={this.state.xlogHistoryRequestCnt} setStopXlogHistory={this.setStopXlogHistory} xlogNotSupportedInRange={this.state.xlogNotSupportedInRange}/>
                                </div>
                            )
                        })}
                    </ResponsiveReactGridLayout>
                    {!objectSelected &&
                    <div className="select-instance">
                        <div>
                            <div className="select-instance-message">
                                <div className="icon">
                                    <div><i className="fa fa-info-circle" aria-hidden="true"></i></div>
                                </div>
                                <div className="msg">NO INSTANCE SELECTED</div>
                            </div>
                        </div>
                    </div>
                    }
                   <Profiler selection={this.props.selection} newXLogs={this.state.data.newXLogs} xlogs={this.state.data.xlogs} startTime={this.state.data.startTime} realtime={this.props.range.realTime}/>
                   <ActiveService realtime={this.props.range.realTime} />

                </div>}
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        objects: state.target.objects,
        filterMap: state.target.filterMap,
        selection: state.target.selection,
        config: state.config,
        user: state.user,
        template: state.template,
        range: state.range,
        supported: state.supported,
        boxes: state.paper.boxes,
        layouts: state.paper.layouts,
        layoutChangeTime: state.paper.layoutChangeTime,
        searchCondition: state.searchCondition,
        timeFocus : state.timeFocus
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        addRequest: () => dispatch(addRequest()),
        pushMessage: (category, title, content) => dispatch(pushMessage(category, title, content)),
        setControlVisibility: (name, value) => dispatch(setControlVisibility(name, value)),
        setRealTime: (realTime, longTerm) => dispatch(setRealTime(realTime, longTerm)),
        setRangeDateHoursMinutesValue: (date, hours, minutes, value, fromPast) => dispatch(setRangeDateHoursMinutesValue(date, hours, minutes, value, fromPast)),
        setTemplate: (boxes, layouts) => dispatch(setTemplate(boxes, layouts)),
        setLayoutName: (layout) => dispatch(setLayoutName(layout)),
        setBoxes: (boxes) => dispatch(setBoxes(boxes)),
        setLayouts: (layouts) => dispatch(setLayouts(layouts)),
        setBoxesLayouts: (boxes, layouts) => dispatch(setBoxesLayouts(boxes, layouts)),
        setLayoutChangeTime: () => dispatch(setLayoutChangeTime()),
        setBreakpoint: (breakpoint) => dispatch(setBreakpoint(breakpoint)),
        setTemplateName: (preset, layout) => dispatch(setTemplateName(preset, layout)),
        setTimeFocus: (active, time, boxKey,keep) => dispatch(setTimeFocus(active, time, boxKey,keep))
    };
};

Paper = connect(mapStateToProps, mapDispatchToProps)(Paper);
export default withRouter(Paper);
