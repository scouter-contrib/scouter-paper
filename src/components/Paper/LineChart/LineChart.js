import React, {Component} from 'react';
import './LineChart.css';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import ServerDate from "../../../common/ServerDate";
import Line from "./Line";
import {
    setRangeDateHoursMinutes,
    setRealTimeRangeStepValue,
    setRealTimeValue,
    setSearchCondition,
    setTimeFocus
} from "../../../actions";

class LineChart extends Component {

    lastCountersTime = null;
    lastCountersHistoryTime = null;
    historyInit = {};
    chartType = "LINE";
    timeFocusId = null;
    graph = {
        margin: {
            top: 15, right: 15, bottom: 25, left: 40
        },
        svg: null,
        overlay: null,
        width: 700,
        height: 50,
        x: null,
        y: null,
        path: null,
        startTime: (new ServerDate()).getTime() - (1000 * 60 * 10),
        endTime: (new ServerDate()).getTime(),
        timeFormat: "%H:%M",
        timeFormatSec: "%H:%M:%S",
        fullTimeFormat: "%Y-%m-%d %H:%M:%S",
        xAxisWidth: 70,
        yAxisHeight: 30,
        noData: true,
        bisector: null,
        currentTooltipTime: null,
        opacity : 0.3
    };

    constructor(props) {
        super(props);
        this.state = {
            counters: {},
            maxY: null,
            autoMaxY: null,
            options: {...this.graph},
        }

    }
    resize(){
        console.log('resize....');
        let box = this.refs.lineChart.parentNode.parentNode.parentNode.parentNode;
        this.graph.width = box.offsetWidth - this.graph.margin.left - this.graph.margin.right;
        this.graph.height = box.offsetHeight - this.graph.margin.top - this.graph.margin.bottom - 27;
        this.setState({
            options : {...this.graph, type : this.chartType}
        });
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.resize);
    };
    componentDidMount() {
        window.addEventListener("resize", this.resize);
        if (this.props.config.colorType === "white") {
            this.graph.opacity = 0.3;
        } else {
            this.graph.opacity = 0.6;
        }
        this.graph.timeFormat = this.props.config.minuteFormat;
        this.graph.fullTimeFormat = this.props.config.dateFormat + " " + this.props.config.timeFormat;
        this.resize();

    }

    shouldComponentUpdate(nextProps, nextState) {

        /*if (this.props.visible && this.props.countersHistoryTimestamp !== nextProps.countersHistoryTimestamp) {
            return true;
        }*/

        return !!this.props.visible;
    }



    componentWillReceiveProps(nextProps) {
        let counters = Object.assign({}, this.state.counters);


        if( nextProps.box.values['chartType'] !== this.chartType){
            //- LINE FILL => LINE Change
            if( nextProps.box.values['chartType'] === 'LINE' && this.chartType === 'LINE FILL' ){
                // this.removeLineFill();
            }
            //- LINE or LINE FILL => STACK;
            if( nextProps.box.values['chartType'] === 'STACK AREA' && ( this.chartType === 'LINE' || this.chartType === 'LINE FILL') ){
                // this.removeLineFill();
                // this.removeLine();
            }
            // STACK => LINE or LINE FILL
            if( (nextProps.box.values['chartType'] === 'LINE' || nextProps.box.values['chartType'] === 'LINE FILL' ) && ( this.chartType === 'STACK AREA') ){
                // this.removeStackFill();
            }
        }

        if (nextProps.countersHistory && this.lastCountersHistoryTime !== nextProps.countersHistoryTimestamp) {

            this.lastCountersHistoryTime = nextProps.countersHistoryTimestamp;
            for (let i = 0; i < nextProps.box.option.length; i++) {
                let counterKey = nextProps.box.option[i].counterKey;
                if (nextProps.countersHistory[counterKey]) {

                    counters = this.loadHistoryCounter(nextProps.countersHistory, counterKey, nextProps.longTerm);
                    this.setState({
                        counters: counters
                    });
                } else {
                    counters[counterKey] = [];
                    this.setState({
                        counters: counters
                    });
                }
            }

            this.graph.maxY = 1;

            this.setMaxY(counters, nextProps.box.option);

            let startTime = (new ServerDate()).getTime() - (1000 * 60 * 10);
            let endTime = (new ServerDate()).getTime();

            if (nextProps.countersHistoryFrom && nextProps.countersHistoryTo) {
                endTime = nextProps.countersHistoryTo;
                startTime = nextProps.countersHistoryFrom;
            }

            this.setState({
                startTime: startTime,
                endTime: endTime
            });
        }

        if (nextProps.counters && nextProps.time !== this.lastCountersTime) {

            this.lastCountersTime = nextProps.time;

            let endTime = nextProps.time;
            let startTime = nextProps.time - (1000 * 60 * 10); //- realtime

            for (let i = 0; i < nextProps.box.option.length; i++) {
                let counterKey = nextProps.box.option[i].counterKey;
                counters[counterKey] = counters[counterKey] || [];
                counters[counterKey].push({
                    time: nextProps.time,
                    data: nextProps.counters[counterKey]
                });
            }

            for (let counterKey in counters) {
                let overIndex = -1;
                for (let i = 0; i < counters[counterKey].length; i++) {
                    if (counters[counterKey][i].time < startTime) {
                        overIndex = i;
                    } else {
                        break;
                    }
                }

                if (overIndex > -1) {
                    counters[counterKey].splice(0, overIndex + 1);
                }
            }

            this.setMaxY(counters, nextProps.box.option);

            let noData = true;
            if (Array.isArray(nextProps.box.option)) {
                for (let i = 0; i < nextProps.box.option.length; i++) {
                    let counterKey = nextProps.box.option[i].counterKey;
                    if (nextProps.counters[counterKey]) {
                        if (Object.keys(nextProps.counters[counterKey]).length !== 0) {
                            noData = false;
                            break;
                        }
                    }

                }
            } else {
                let counterKey = nextProps.box.option.counterKey;
                if (Object.keys(nextProps.counters[counterKey]).length !== 0) {
                    noData = false;
                }
            }

            this.setState({
                startTime: startTime,
                endTime: endTime,
                counters: counters,
                noData: noData
            });

        }
        //- 이전 툴팁이 고정 되었으면 자동 해지 할수 있도록 이벤트 체크
        this.chartType = nextProps.box.values['chartType'];
        if(!this.props.timeFocus.keep) {
            // this.drawTimeFocus();
        }
    }

    loadHistoryCounter(countersHistory, counterKey, longTerm) {
        let decimalPoint = this.props.config.decimalPoint;
        let pow = 1;

        if (decimalPoint > 0) {
            pow = Math.pow(10, decimalPoint);
        }

        let counters = this.state.counters;
        counters[counterKey] = [];
        const timeKeyRow = {};
        for (let objHash in countersHistory[counterKey]) {

            let timeList = countersHistory[counterKey][objHash].timeList;
            let valueList = countersHistory[counterKey][objHash].valueList;
            let unit = countersHistory[counterKey][objHash].unit;

            for (let j = 0; j < timeList.length; j++) {
                let row = {};
                let timeUnit = 2000;
                if (longTerm) {
                    timeUnit = 1000 * 60 * 5;
                }
                row.time = parseInt(timeList[j] / timeUnit, 10) * timeUnit;
                row.data = {};
                row.data[objHash] = {
                    objHash: objHash,
                    value: Math.round(valueList[j] * pow) / pow,
                    unit: unit
                };

                if (!timeKeyRow[row.time]) {
                    timeKeyRow[row.time] = row;
                } else {
                    timeKeyRow[row.time].data[objHash] = {
                        objHash: objHash,
                        value: Math.round(valueList[j] * pow) / pow,
                        unit: unit
                    };
                }
            }
        }

        for (const timeKey in timeKeyRow) {
            counters[counterKey].push(timeKeyRow[timeKey]);
        }
        counters[counterKey].sort((a, b) => a.time - b.time);

        return counters;
    }

    setMaxY = (counters, option) => {


        let metricMap = {};
        option.forEach((option) => {
            metricMap[option.counterKey] = true;
        });

        let maxY = 0;
        if( this.chartType === "STACK AREA"){
            for (let attr in counters) {
                if (!metricMap[attr]) {
                    continue;
                }
                for (let i = 0; i < counters[attr].length; i++) {
                    // y축 sum
                    const sum = Object.keys(counters[attr][i].data)
                        .map(_key => Number(counters[attr][i].data[_key].value))
                        .reduce((acc,cur)=> acc+cur,0);
                    if( sum > maxY){
                        maxY = sum;
                    }
                }
            }

        }else {
            for (let attr in counters) {
                if (!metricMap[attr]) {
                    continue;
                }

                for (let i = 0; i < counters[attr].length; i++) {
                    for (let hash in counters[attr][i].data) {
                        if (Array.isArray(counters[attr][i].data[hash].value)) {
                            for (let j = 0; j < counters[attr][i].data[hash].value.length; j++) {
                                // line chart
                                if (Number(counters[attr][i].data[hash].value[j]) > maxY) {
                                    maxY = Number(counters[attr][i].data[hash].value[j]);
                                }
                            }
                        } else {
                            if (Number(counters[attr][i].data[hash].value) > maxY) {
                                maxY = Number(counters[attr][i].data[hash].value);
                            }
                        }
                    }
                }
            }
        }

        if (!maxY || maxY < 1) {
            maxY = 1;
        }

        this.graph.autoMaxY = maxY;

        if (!this.graph.maxY) {
            this.graph.maxY = maxY * 1.2;
        }

        if (this.graph.autoMaxY > this.graph.maxY) {
            this.graph.maxY = this.graph.autoMaxY * 1.2;
        }


    };

    axisUp = () => {

    };

    axisDown = () => {

    };

    stopProgation = (e) => {
        e.stopPropagation();
    };

    render() {
        return (
            <div className="line-chart-wrapper" ref="lineChartRoot">
                <div className="line-chart" ref="lineChart">
                    <svg width={this.state.options.width + this.graph.margin.left+this.graph.margin.right} height={this.state.options.height+this.graph.margin.top+this.graph.margin.bottom} >
                        <Line  startTime={this.state.startTime}
                               endTime={this.state.endTime}
                               counters={this.state.counters}
                               noData={this.state.noData}
                               options={this.state.options}
                               box = {this.props.box}
                         >
                         </Line>
                    </svg>
                </div>
                <div className="axis-button axis-up noselect" onClick={this.axisUp} onMouseDown={this.stopProgation}><i className="fa fa-angle-up" aria-hidden="true"></i></div>
                <div className="axis-button axis-down noselect" onClick={this.axisDown} onMouseDown={this.stopProgation}><i className="fa fa-angle-down" aria-hidden="true"></i></div>
                {
                    this.state.noData && <div className="no-data">
                        <div>
                            <div>NO DATA RECEIVED</div>
                        </div>
                   </div>
                }
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        objects: state.target.objects,
        config: state.config,
        filterMap: state.target.filterMap,
        timeFocus: state.timeFocus,
        range: state.range,
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        setTimeFocus: (active, time, boxKey,keep) => dispatch(setTimeFocus(active, time, boxKey,keep)),
        setRealTimeValue: (realTime, longTerm, value) => dispatch(setRealTimeValue(realTime, longTerm, value)),
        setRangeDateHoursMinutes: (date, hours, minutes) => dispatch(setRangeDateHoursMinutes(date, hours, minutes)),
        setRealTimeRangeStepValue: (realTime, longTerm, value, range, step) => dispatch(setRealTimeRangeStepValue(realTime, longTerm, value, range, step)),
        setSearchCondition: (from, to, time) => dispatch(setSearchCondition(from, to, time)),
    };
};

LineChart = connect(mapStateToProps, mapDispatchToProps)(LineChart);
export default withRouter(LineChart);
