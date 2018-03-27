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

const ResponsiveReactGridLayout = WidthProvider(Responsive);

class Paper extends Component {
    dataRefreshTimer = null;

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
                lastRequestTime: null
            },
            /* visitor */
            visitor: {},
            /* counters */
            counters: {
                time: null,
                data: null
            },
            /* counters past data */
            countersHistory: {},
            fixedControl: false,
            visible : true
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
    }

    getLatestData() {
        this.getXLog();
        this.getVisitor();
        this.getCounter();

        this.dataRefreshTimer = setTimeout(() => {
            this.getLatestData();
        }, this.props.config.interval);
    }

    componentDidMount() {
        this.getLatestData();
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 1000);

        document.addEventListener("scroll", this.scroll.bind(this));
        document.addEventListener('visibilitychange', this.visibilitychange.bind(this));

        this.setState({
            visible : document.visibilityState === 'visible'
        });
    }

    componentWillUnmount() {
        clearInterval(this.dataRefreshTimer);
        this.dataRefreshTimer = null;
        document.removeEventListener("scroll", this.scroll.bind(this));
        document.removeEventListener('visibilitychange', this.visibilitychange.bind(this));
    }

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
            visible : document.visibilityState === 'visible'
        });
    };

    getXLog = () => {
        let that = this;
        if (this.props.instances && this.props.instances.length > 0) {
            this.props.addRequest();
            jQuery.ajax({
                method: "GET",
                async: true,
                dataType: 'text',
                url: getHttpProtocol(this.props.config) + '/scouter/v1/xlog/realTime/' + this.state.data.offset1 + '/' + this.state.data.offset2 + '?objHashes=' + JSON.stringify(this.props.instances.map((instance) => {
                    return Number(instance.objHash);
                })),
                xhrFields: getWithCredentials(that.props.config),
                beforeSend: function (xhr) {
                    setAuthHeader(xhr, that.props.config, that.props.user);
                }
            }).done((msg) => {
                this.tick(msg);
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

    getCounter = () => {
        const that = this;
        if (this.props.instances && this.props.instances.length > 0) {
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

            if (!counterKeys) {
                return;
            }

            if (counterKeys.length < 1) {
                return false;
            }

            let instancesAndHosts = this.props.instances.concat(this.props.hosts);

            // 데이터를 조회한적이 없는 경우, 과거 10분 데이터를 가져온다.
            for (let i = 0; i < counterHistoryKeys.length; i++) {
                let counterKey = counterHistoryKeys[i];

                if (!this.counterHistoriesLoaded[counterKey]) {
                    this.counterHistoriesLoaded[counterKey] = false;

                    let now = (new ServerDate()).getTime();
                    let ten = 1000 * 60 * 10;
                    this.props.addRequest();
                    jQuery.ajax({
                        method: "GET",
                        async: true,
                        url: getHttpProtocol(this.props.config) + '/scouter/v1/counter/' + counterKey + '?objHashes=' + JSON.stringify(instancesAndHosts.map((obj) => {
                            return Number(obj.objHash);
                        })) + "&startTimeMillis=" + (now - ten) + "&endTimeMillis=" + now,
                        xhrFields: getWithCredentials(that.props.config),
                        beforeSend: function (xhr) {
                            setAuthHeader(xhr, that.props.config, that.props.user);
                        }
                    }).done((msg) => {
                        this.counterHistoriesLoaded[counterKey] = true;

                        let counterHistory = {};
                        if (msg.result) {
                            for (let i = 0; i < msg.result.length; i++) {
                                let counter = msg.result[i];
                                if(counter.valueList.length > 0) {
                                    counterHistory[counter.objHash] = {};
                                    counterHistory[counter.objHash].timeList = counter.timeList;
                                    counterHistory[counter.objHash].valueList = counter.valueList;
                                }
                            }
                        }

                        let countersHistory = Object.assign(this.state.countersHistory);
                        countersHistory[counterKey] = counterHistory;
                        this.setState({
                            countersHistory: countersHistory
                        });

                    }).fail((xhr, textStatus, errorThrown) => {
                        this.counterHistoriesLoaded[counterKey] = true;
                        errorHandler(xhr, textStatus, errorThrown, this.props);
                    });
                }
            }

            if(!this.counterReady) {
                this.counterReady = counterKeys.every((key) => this.counterHistoriesLoaded[key]);
            }
            if(this.counterReady) {
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
            }
        }
    };

    tick = (msg) => {

        if (!msg) {
            return;
        }

        let result = (JSON.parse(msg)).result;

        let now = (new ServerDate()).getTime();

        let datas = null;
        if (Number(this.props.config.xlog.normal.sampling) !== 100 || Number(this.props.config.xlog.error.sampling) !== 100) {
            datas = result.xlogs.filter((d) => {

                if (Number(d.error)) {
                    return Math.round(Math.random() * 100) > (100 - this.props.config.xlog.error.sampling);
                } else {
                    return Math.round(Math.random() * 100) > (100 - this.props.config.xlog.normal.sampling);
                }
            })
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

        let xlogs = this.state.data.xlogs;
        let newXLogs = this.state.data.newXLogs;
        let firstStepXlogs = this.state.data.firstStepXlogs;
        let secondStepXlogs = this.state.data.secondStepXlogs;
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

        this.setState({
            data: data
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
                <PaperControl addPaper={this.addPaper} addPaperAndAddMetric={this.addPaperAndAddMetric}
                              clearLayout={this.clearLayout} fixedControl={this.state.fixedControl}/>
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
                                {box.option && (box.option.length > 1 || box.option.config ) && <button className="box-control box-layout-config-btn" onClick={this.toggleConfig.bind(null, box.key)}><i className="fa fa-cog" aria-hidden="true"></i></button>}
                                {box.config && <BoxConfig box={box} setOptionValues={this.setOptionValues} setOptionClose={this.setOptionClose} removeMetrics={this.removeMetrics}/>}
                                <Box visible={this.state.visible} setOption={this.setOption} box={box} data={this.state.data} config={this.props.config} visitor={this.state.visitor} counters={this.state.counters} countersHistory={this.state.countersHistory} layoutChangeTime={this.state.layoutChangeTime}/>
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
                <Profiler selection={this.props.selection} newXLogs={this.state.data.newXLogs} xlogs={this.state.data.xlogs} startTime={this.state.data.startTime}/>
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
