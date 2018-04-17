import React, {Component} from 'react';
import './Paper.css';
import './Resizable.css';
import {connect} from 'react-redux';
import {addRequest, pushMessage, setControlVisibility} from '../../actions';
import {withRouter} from 'react-router-dom';
import {Responsive, WidthProvider} from "react-grid-layout";
import {Box, BoxConfig, PaperControl} from "../../components";
import jQuery from "jquery";
import {getData, setData, getHttpProtocol, errorHandler, getWithCredentials, setAuthHeader} from '../../common/common';
import Profiler from "./XLog/Profiler/Profiler";
import ServerDate from "../../common/ServerDate";
import RangeControl from "./RangeControl/RangeControl";
import moment from 'moment';
import _ from "lodash";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

class Paper extends Component {
    dataRefreshTimer = null;
    xlogHistoryRequestTime = null;
    mounted = false;
    xlogHistoryTemp = [];
    xlogHistoryTotalDays = 0;
    xlogHistoryCurrentDays = 0;

    lastFrom = null;
    lastTo = null;

    constructor(props) {
        super(props);
        this.counterHistoriesLoaded = {};
        this.counterReady = false;

        let layouts = getData("layouts");
        let boxes = getData("boxes");

        if (!(layouts)) {
            layouts = {};
        }

        if (!boxes) {
            boxes = [];
        }

        let range = 1000 * 60 * 10;
        let endTime = (new ServerDate()).getTime();
        let startTime = endTime - range;

        this.state = {
            layouts: layouts,
            layoutChangeTime: null,
            boxes: boxes,

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
                maxElapsed: 2000,
                lastRequestTime: null,
                clearTimestamp : null
            },

            pastTimestamp: null,

            /* visitor */
            visitor: {},

            /* counters */
            counters: {
                time: null,
                data: null
            },

            /* counters past data */
            countersHistory : {
                time: null,
                data: null,
                from: null,
                to: null
            },

            fixedControl: false,
            visible: true,
            rangeControl: false,

            /* realtime */
            realtime: true,

            /*longterm*/
            longTerm: false,

            alert: {
                data: [],
                offset : {}
            }
        };
    }

    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(nextProps.template) !== JSON.stringify(this.props.template)) {
            if (JSON.stringify(nextProps.template.boxes) !== JSON.stringify(this.state.boxes) || JSON.stringify(nextProps.template.layouts) !== JSON.stringify(this.state.layouts)) {
                this.setState({
                    layouts: nextProps.template.layouts,
                    layoutChangeTime: (new Date()).getTime(),
                    boxes: nextProps.template.boxes,
                });
            }
        }

        if (JSON.stringify(this.props.instances) !== JSON.stringify(nextProps.instances)) {
            if (this.state.realtime) {
                let now = (new ServerDate()).getTime();
                let ten = 1000 * 60 * 10;
                this.getCounterHistory(nextProps.instances, nextProps.hosts, now - ten, now, false);
                this.getLatestData(true, nextProps.instances, nextProps.hosts);
            } else {
                this.getXLogHistory(this.lastFrom, this.lastTo, nextProps.instances);
            }
        }
    }

    componentDidMount() {
        this.mounted = true;

        if (this.props.instances && this.props.instances.length > 0) {
            let now = (new ServerDate()).getTime();
            let ten = 1000 * 60 * 10;
            this.getCounterHistory(this.props.instances, this.props.hosts,  now - ten, now, false);
            if (this.state.realtime) {
                this.getLatestData(false, this.props.instances, this.props.hosts);
            }
        }

        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 1000);

        document.addEventListener("scroll", this.scroll.bind(this));
        document.addEventListener('visibilitychange', this.visibilitychange.bind(this));

        this.setState({
            visible: document.visibilityState === 'visible'
        });
    }

    componentWillUnmount() {
        this.mounted = false;
        clearInterval(this.dataRefreshTimer);
        this.dataRefreshTimer = null;
        document.removeEventListener("scroll", this.scroll.bind(this));
        document.removeEventListener('visibilitychange', this.visibilitychange.bind(this));
    }

    getLatestData(clear, instances, hosts) {
        if (clear) {
            // SEARCH 옵션으로 한번이라도 조회했다면 지우고 다시
            if (this.state.pastTimestamp) {
                this.getXLog(true, instances);
            } else {
                // SEARCH에서 다시 REALTIME인 경우 이어서
                this.getXLog(clear, instances);
            }
        } else {
            this.getXLog(false, instances);
        }

        this.getVisitor();
        this.getRealTimeCounter();
        this.getRealTimeAlert(instances, hosts);

        clearInterval(this.dataRefreshTimer);
        this.dataRefreshTimer = null;

        this.dataRefreshTimer = setTimeout(() => {
            this.getLatestData(false, instances, hosts);
        }, this.props.config.interval);

    }


    getRealTimeCounter = () => {
        const that = this;

        if (this.props.instances && this.props.instances.length > 0) {
            let counterKeyMap = {};

            for (let i = 0; i < this.state.boxes.length; i++) {
                let option = this.state.boxes[i].option;

                if (option && option.length > 0) {
                    for (let j = 0; j < option.length; j++) {
                        let innerOption = option[j];
                        if (innerOption.type === "counter") {
                            counterKeyMap[innerOption.counterKey] = true;
                        }
                    }
                }
            }

            let counterKeys = [];
            for (let attr in counterKeyMap) {
                counterKeys.push(attr);
            }

            if (counterKeys.length < 1) {
                return false;
            }

            let instancesAndHosts = this.props.instances.concat(this.props.hosts);

             this.counterReady = counterKeys.every((key) => this.counterHistoriesLoaded[key]);

            if (this.counterReady) {
                let params = JSON.stringify(counterKeys);
                params = params.replace(/"/gi, "");
                this.props.addRequest();
                jQuery.ajax({
                    method: "GET",
                    async: true,
                    url: getHttpProtocol(this.props.config) + '/scouter/v1/counter/realTime/' + params + '?objHashes=' + JSON.stringify(instancesAndHosts.map((obj) => {
                        return Number(obj.objHash);
                    })),
                    xhrFields: getWithCredentials(that.props.config),
                    beforeSend: function (xhr) {
                        setAuthHeader(xhr, that.props.config, that.props.user);
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
                    errorHandler(xhr, textStatus, errorThrown, this.props);
                });
            } else {
                let now = (new ServerDate()).getTime();
                let ten = 1000 * 60 * 10;
                this.getCounterHistory(this.props.instances, this.props.hosts, now - ten, now, false);
            }
        }
    };

    getRealTimeAlert = (instances, hosts) => {
        const that = this;

        let objTypes = [];


        if (instances && instances.length > 0) {
            objTypes = _.chain(instances).map((d) => d.objType).uniq().value();
        }

        if (hosts && hosts.length > 0) {
            objTypes = objTypes.concat(_.chain(hosts).map((d) => d.objType).uniq().value());
        }


        if (objTypes && objTypes.length > 0) {
            objTypes.forEach((objType) => {
                this.props.addRequest();

                let offset1 = this.state.alert.offset[objType] ? this.state.alert.offset[objType].offset1 : 0;
                let offset2 = this.state.alert.offset[objType] ? this.state.alert.offset[objType].offset2 : 0;

                jQuery.ajax({
                    method: "GET",
                    async: true,
                    url: getHttpProtocol(this.props.config) + "/scouter/v1/alert/realTime/" + offset1 + "/" + offset2 + "?objType=" + objType,
                    xhrFields: getWithCredentials(that.props.config),
                    beforeSend: function (xhr) {
                        setAuthHeader(xhr, that.props.config, that.props.user);
                    }
                }).done((msg) => {
                    if (msg) {

                        let alert = this.state.alert;
                        if (!alert.offset[objType]) {
                            alert.offset[objType] = {};
                        }

                        alert.offset[objType].offset1 = msg.result.offset1;
                        alert.offset[objType].offset2 = msg.result.offset2;
                        //alert.data = alert.data.concat(msg.result.alerts);
                        // TODO 증분이 아니고, 모든 데이터가 내려옴
                        if (msg.result.alerts.length > 0) {
                            alert.data = msg.result.alerts.sort((a,b) => {return Number(b.time) - Number(a.time)});
                            this.setState({
                                alert : alert
                            });
                        }

                        console.log(alert);


                    }
                }).fail((xhr, textStatus, errorThrown) => {
                    errorHandler(xhr, textStatus, errorThrown, this.props);
                });
            });
        }
    };

    getSearchDays (from, to) {
        let aday = 1000 * 60 * 60 * 24;
        let startDayTime = moment(from).hours(0).minutes(0).seconds(0).milliseconds(0).valueOf();
        return  Math.ceil(((to-1000) - startDayTime) / aday);
    }

    getDivideDays (from, to) {
        let days = this.getSearchDays(from, to);

        let fromTos = [];
        if (days > 0) {
            for (let i=0; i<days; i++) {
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
                from : from,
                to : to
            })
        }

        return fromTos;
    }

    getCounterHistory = (instances, hosts, from, to, longTerm) => {

        if (instances && instances.length > 0) {
            let counterKeyMap = {};
            let counterHistoryKeyMap = {};

            for (let i = 0; i < this.state.boxes.length; i++) {
                let option = this.state.boxes[i].option;

                if (option && option.length > 0) {
                    for (let j = 0; j < option.length; j++) {
                        let innerOption = option[j];
                        if (innerOption.type === "counter") {
                            counterKeyMap[innerOption.counterKey] = true;
                            counterHistoryKeyMap[innerOption.counterKey] = true;
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
                counterHistoryKeys.push(attr);
            }

            if (counterKeys.length < 1) {
                return false;
            }

            let instancesAndHosts = instances.concat(hosts);

            for (let i = 0; i < counterHistoryKeys.length; i++) {
                let counterKey = counterHistoryKeys[i];
                let now = (new Date()).getTime();
                let startTime = from;
                let endTime = to;
                let url;
                if (longTerm) {

                    let days = this.getSearchDays(from, to);
                    let fromTos = this.getDivideDays(from, to);

                    if (days > 1) {
                        for (let i=0; i<fromTos.length; i++) {
                            url = getHttpProtocol(this.props.config) + '/scouter/v1/counter/stat/' + counterKey + '?objHashes=' + JSON.stringify(instancesAndHosts.map((obj) => {
                                return Number(obj.objHash);
                            })) + "&startYmd=" + moment(fromTos[i].from).format("YYYYMMDD") + "&endYmd=" + moment(fromTos[i].to).format("YYYYMMDD");
                            this.getCounterHistoryData(url, counterKey, from, to, (new Date()).getTime(), true);
                        }
                    } else {
                        url = getHttpProtocol(this.props.config) + '/scouter/v1/counter/stat/' + counterKey + '?objHashes=' + JSON.stringify(instancesAndHosts.map((obj) => {
                            return Number(obj.objHash);
                        })) + "&startYmd=" + moment(startTime).format("YYYYMMDD") + "&endYmd=" + moment(endTime).format("YYYYMMDD");
                        this.getCounterHistoryData(url, counterKey, from, to, now, false);
                    }


                } else {
                    url = getHttpProtocol(this.props.config) + '/scouter/v1/counter/' + counterKey + '?objHashes=' + JSON.stringify(instancesAndHosts.map((obj) => {
                        return Number(obj.objHash);
                    })) + "&startTimeMillis=" + startTime + "&endTimeMillis=" + endTime;
                    this.getCounterHistoryData(url, counterKey, from, to, now, false);
                }
            }
        }
    };

    changeRealtime = (realtime, longTerm) => {

        this.setState({
            realtime: realtime,
            longTerm : longTerm,
            counters: {
                time: null,
                data: null
            },
            countersHistory : {
                time: null,
                data: null,
                from: null,
                to: null
            }
        });

        if (realtime) {
            this.counterHistoriesLoaded = {};
            clearInterval(this.dataRefreshTimer);
            this.dataRefreshTimer = null;

            let now = (new ServerDate()).getTime();
            let ten = 1000 * 60 * 10;
            this.getCounterHistory(this.props.instances, this.props.hosts, now - ten, now, false);
            this.getLatestData(true, this.props.instances, this.props.hosts);
        } else {
            clearInterval(this.dataRefreshTimer);
            this.dataRefreshTimer = null;
        }
    };

    changeLongTerm = (longTerm) => {
        this.setState({
            longTerm: longTerm
        });
    };

    search = (from, to) => {

        this.lastFrom = from;
        this.lastTo = to;

        this.setState({
            countersHistory : {
                time: null,
                data: null,
                from: from,
                to: to
            }
        });

        this.getCounterHistory(this.props.instances, this.props.hosts, from, to, this.state.longTerm);
        this.getXLogHistory(from, to, this.props.instances);
    };

    scroll = () => {
        if (document.documentElement.scrollTop > 60) {
            this.setState({
                fixedControl: true
            });
        } else {
            this.setState({
                fixedControl: false
            });
        }
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

    getXLog = (clear, instances) => {
        let that = this;
        if (instances && instances.length > 0) {
            this.props.addRequest();
            jQuery.ajax({
                method: "GET",
                async: true,
                dataType: 'text',
                url: getHttpProtocol(this.props.config) + '/scouter/v1/xlog/realTime/' + (clear ? 0 : this.state.data.offset1) + '/' + (clear ? 0 : this.state.data.offset2) + '?objHashes=' + JSON.stringify(instances.map((instance) => {
                    return Number(instance.objHash);
                })),
                xhrFields: getWithCredentials(that.props.config),
                beforeSend: function (xhr) {
                    setAuthHeader(xhr, that.props.config, that.props.user);
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
                    data: data
                });

            }).fail((xhr, textStatus, errorThrown) => {
                errorHandler(xhr, textStatus, errorThrown, this.props);
            });
        }
    };

    getXLogHistory = (from, to, instances) => {
        if (instances && instances.length > 0) {

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



            let days = this.getSearchDays(from, to);
            let fromTos = this.getDivideDays(from, to);

            this.xlogHistoryTemp = [];
            this.xlogHistorytotalDays = days;
            this.xlogHistoryCurrentDays = 0;
            this.xlogHistoryRequestTime = now;

            if (days > 1) {
                for (let i=0; i<fromTos.length; i++) {
                    this.getXLogHistoryData(now, fromTos[i].from, fromTos[i].to, instances);
                }
            } else {
                this.getXLogHistoryData(now, from, to, instances);
            }
        }
    };

    getXLogHistoryData = (requestTime, from, to, instances, lastTxid, lastXLogTime) => {
        let that = this;

        if (!this.mounted) {
            return;
        }

        if (this.xlogHistoryRequestTime !== requestTime) {
            return;
        }

        if (this.props.instances && this.props.instances.length > 0) {

            let data = this.state.data;

            this.props.addRequest();
            jQuery.ajax({
                method: "GET",
                async: true,
                dataType: 'text',
                url: getHttpProtocol(this.props.config) + "/scouter/v1/xlog/" + moment(from).format("YYYYMMDD") + "?startTimeMillis=" + from + '&endTimeMillis=' + to + (lastTxid ? '&lastTxid=' + lastTxid : "") + (lastXLogTime ? '&lastXLogTime=' + lastXLogTime : "") + '&objHashes=' +
                JSON.stringify(instances.map((instance) => {
                    return Number(instance.objHash);
                })),
                xhrFields: getWithCredentials(that.props.config),
                beforeSend: function (xhr) {
                    setAuthHeader(xhr, that.props.config, that.props.user);
                }
            }).done((msg) => {
                if (!that.mounted) {
                    return;
                }
                if (!msg) {
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

                this.setState({
                    data: data,
                    pageCnt : (new Date()).getTime()
                });

                if (hasMore) {
                    that.getXLogHistoryData(requestTime, from, to, instances, result.lastTxid, result.lastXLogTime);
                } else {
                    that.xlogHistoryCurrentDays++;
                    if (that.xlogHistoryTotalDays <= that.xlogHistoryCurrentDays) {
                        let data = this.state.data;
                        data.xlogs = Array.prototype.concat.apply([], that.xlogHistoryTemp);
                        this.setState({
                            data: data,
                            pageCnt : (new Date()).getTime()
                        });
                    }
                }

            }).fail((xhr, textStatus, errorThrown) => {
                errorHandler(xhr, textStatus, errorThrown, this.props);
            });
        }
    };

    getVisitor = () => {
        let that = this;
        if (this.props.instances && this.props.instances.length > 0) {
            this.props.addRequest();
            let time = (new ServerDate()).getTime();
            jQuery.ajax({
                method: "GET",
                async: true,
                url: getHttpProtocol(this.props.config) + '/scouter/v1/visitor/realTime?objHashes=' + JSON.stringify(this.props.instances.map((instance) => {
                    return Number(instance.objHash);
                })),
                xhrFields: getWithCredentials(that.props.config),
                beforeSend: function (xhr) {
                    setAuthHeader(xhr, that.props.config, that.props.user);
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
                errorHandler(xhr, textStatus, errorThrown, this.props);
            });
        }
    };


    getCounterHistoryData = (url, counterKey, from , to, now, append) => {
        let that = this;
        this.props.addRequest();
        jQuery.ajax({
            method: "GET",
            async: false,
            url: url,
            xhrFields: getWithCredentials(that.props.config),
            beforeSend: function (xhr) {
                setAuthHeader(xhr, that.props.config, that.props.user);
            }
        }).done((msg) => {
            if (!this.mounted) {
                return;
            }
            let countersHistory = this.state.countersHistory.data ? Object.assign(this.state.countersHistory.data) : {};

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
                    for (let i=0; i<countersHistory[key][objHash].timeList.length; i++) {
                        temp.push({
                            time : Number(countersHistory[key][objHash].timeList[i]),
                            value : countersHistory[key][objHash].valueList[i]
                        });
                    }
                    temp.sort((a,b) => a.time - b.time);
                    for (let i=0; i<temp.length; i++) {
                        if (from < temp[i].time) {
                            smallInx = i;
                            break;
                        }
                    }

                    if (smallInx > -1) {
                        temp.splice(0, smallInx);
                    }

                    let binInx = -1;
                    for (let i=temp.length-1; i>-0; i--) {
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

            this.state.countersHistory.data = countersHistory;

            this.setState({
                countersHistory : {
                    time: new Date().getTime(),
                    data: countersHistory,
                    from : from,
                    to : to
                },
            });
            this.counterHistoriesLoaded[counterKey] = true;
        }).fail((xhr, textStatus, errorThrown) => {
            errorHandler(xhr, textStatus, errorThrown, this.props);
        });
    }

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
    }

    onLayoutChange(layout, layouts) {

        let boxes = this.state.boxes;
        boxes.forEach((box) => {
            layout.forEach((l) => {
                if (box.key === l.i) {
                    box.layout = l;
                    return false;
                }
            });
        });
        setData("layouts", layouts);
        setData("boxes", this.state.boxes);
        this.setState({
            layouts: layouts,
            layoutChangeTime: (new Date()).getTime()
        });

        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 500);

    }

    getUniqueKey() {
        let dup = false;
        let key = null;
        let i = 1;
        do {
            dup = false;
            key = String(this.state.boxes.length + i);
            for (let i = 0; i < this.state.boxes.length; i++) {
                if (this.state.boxes[i].key === key) {
                    dup = true;
                    break;
                }
            }
            i++;
        } while (dup);

        return key;
    }

    toggleRangeControl = () => {
        this.setState({
            rangeControl: !this.state.rangeControl
        });
    };

    addPaper = () => {
        let boxes = this.state.boxes;
        let key = this.getUniqueKey();

        let maxY = 0;
        let height = 0;
        for (let i = 0; i < boxes.length; i++) {
            if (maxY < boxes[i].layout.y) {
                maxY = boxes[i].layout.y;
                height = boxes[i].layout.h;
            }
        }

        boxes.push({
            key: key,
            title: "NO TITLE ",
            layout: {w: 6, h: 4, x: 0, y: (maxY + height), minW: 1, minH: 3, i: key}
        });


        this.setState({
            boxes: boxes
        });

        setData("boxes", boxes);

        return key;
    };

    addPaperAndAddMetric = (data) => {
        let key = this.addPaper();

        if (data) {
            let option = JSON.parse(data);
            this.setOption(key, option);
        }
    };

    removePaper = (key) => {

        let boxes = this.state.boxes;
        boxes.forEach((box, i) => {
            if (box.key === key) {
                boxes.splice(i, 1);
                return false;
            }
        });

        let layouts = this.state.layouts;

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

        this.setState({
            boxes: boxes,
            layouts: layouts,
            layoutChangeTime: (new Date()).getTime()
        });

        setData("layouts", layouts);
        setData("boxes", boxes);
    };

    clearLayout = () => {
        this.setState({
            boxes: [],
            layouts: {},
            layoutChangeTime: (new Date()).getTime()
        });
    };

    setOption = (key, option) => {

        let boxes = this.state.boxes;

        boxes.forEach((box) => {
            if (box.key === key) {

                if (option.mode === "exclusive") {
                    box.option = {
                        mode: option.mode,
                        type: option.type,
                        config: option.config,
                        counterKey: option.counterKey,
                        title: option.title,
                        objectType: option.objectType
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
                        if (box.option[i].counterKey === option.counterKey) {
                            duplicated = true;
                            break;
                        }
                    }

                    if (!duplicated) {
                        box.option.push({
                            mode: option.mode,
                            type: option.type,
                            config: option.config,
                            counterKey: option.counterKey,
                            title: option.title,
                            objectType: option.objectType
                        });
                    }
                }

                box.values = {};
                for (let attr in option.config) {
                    box.values[attr] = option.config[attr].value;
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

        this.setState({
            boxes: boxes
        });

        setData("boxes", boxes);
    };

    setOptionValues = (key, values) => {
        let boxes = this.state.boxes;
        boxes.forEach((box) => {
            if (box.key === key) {
                for (let attr in values) {
                    box.values[attr] = values[attr];
                }

                box.config = false;
            }
        });

        this.setState({
            boxes: boxes
        });

        setData("boxes", boxes);
    };

    setOptionClose = (key) => {
        let boxes = this.state.boxes;
        boxes.forEach((box) => {
            if (box.key === key) {
                box.config = false;
            }
        });

        this.setState({
            boxes: boxes
        });

        setData("boxes", boxes);
    };


    toggleConfig = (key) => {
        let boxes = this.state.boxes;
        boxes.forEach((box) => {
            if (box.key === key) {
                box.config = !box.config;
                return false;
            }
        });

        this.setState({
            boxes: boxes
        });

    };

    removeMetrics = (boxKey, counterKeys) => {

        let boxes = this.state.boxes;
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
                    box.title = box.option.title;
                }
            }
        });

        this.setState({
            boxes: boxes
        });

        setData("boxes", boxes);
    };

    render() {
        let instanceSelected = this.props.instances.length > 0;

        if (instanceSelected) {
            document.querySelector("body").style.overflow = "auto";
        } else {
            //document.querySelector("body").style.overflow = "hidden";
        }

        return (
            <div className="papers">
                <div className={"fixed-alter-object " + (this.state.fixedControl ? 'show' : '')}></div>
                <PaperControl addPaper={this.addPaper} addPaperAndAddMetric={this.addPaperAndAddMetric} clearLayout={this.clearLayout} fixedControl={this.state.fixedControl} toggleRangeControl={this.toggleRangeControl} realtime={this.state.realtime} alert={this.state.alert} />
                <RangeControl visible={this.state.rangeControl} changeRealtime={this.changeRealtime} search={this.search} fixedControl={this.state.fixedControl} toggleRangeControl={this.toggleRangeControl} changeLongTerm={this.changeLongTerm}/>
                {(instanceSelected && (!this.state.boxes || this.state.boxes.length === 0)) &&
                <div className="quick-usage">
                    <div>
                        <div>
                            <div>
                                <h3>NO PAPER</h3>
                                <ol>
                                    <li>CLICK [<i className="fa fa-plus-circle" aria-hidden="true"></i>] BUTTON TO ADD PAPER</li>
                                    <li>AND DRAG METRIC TO PAPER</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>}
                <ResponsiveReactGridLayout className="layout" cols={{lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}} layouts={this.state.layouts} rowHeight={30} onLayoutChange={(layout, layouts) => this.onLayoutChange(layout, layouts)}>
                    {this.state.boxes.map((box, i) => {
                        return (
                            <div className="box-layout" key={box.key} data-grid={box.layout}>
                                <button className="box-control box-layout-remove-btn last" onClick={this.removePaper.bind(null, box.key)}><i className="fa fa-times-circle-o" aria-hidden="true"></i></button>
                                {box.option && (box.option.length > 1 || box.option.config ) &&
                                <button className="box-control box-layout-config-btn" onClick={this.toggleConfig.bind(null, box.key)}><i className="fa fa-cog" aria-hidden="true"></i></button>}
                                {box.config && <BoxConfig box={box} setOptionValues={this.setOptionValues} setOptionClose={this.setOptionClose} removeMetrics={this.removeMetrics}/>}
                                <Box visible={this.state.visible} setOption={this.setOption} box={box} pastTimestamp={this.state.pastTimestamp} pageCnt={this.state.pageCnt} data={this.state.data} config={this.props.config} visitor={this.state.visitor} counters={this.state.counters} countersHistory={this.state.countersHistory.data} countersHistoryFrom={this.state.countersHistory.from} countersHistoryTo={this.state.countersHistory.to} countersHistoryTimestamp={this.state.countersHistory.time} longTerm={this.state.longTerm} layoutChangeTime={this.state.layoutChangeTime} realtime={this.state.realtime}/>
                            </div>
                        )
                    })}
                </ResponsiveReactGridLayout>
                {!instanceSelected &&
                <div className={"select-instance " + (this.state.fixedControl ? 'fixed' : '')}>
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
                <Profiler selection={this.props.selection} newXLogs={this.state.data.newXLogs} xlogs={this.state.data.xlogs} startTime={this.state.data.startTime} realtime={this.state.realtime}/>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        hosts: state.target.hosts,
        instances: state.target.instances,
        selection: state.target.selection,
        config: state.config,
        user: state.user,
        template: state.template
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        addRequest: () => dispatch(addRequest()),
        pushMessage: (category, title, content) => dispatch(pushMessage(category, title, content)),
        setControlVisibility: (name, value) => dispatch(setControlVisibility(name, value))
    };
};

Paper = connect(mapStateToProps, mapDispatchToProps)(Paper);
export default withRouter(Paper);
