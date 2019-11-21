import React, {Component} from 'react';
import './LineChart.css';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import ServerDate from "../../../common/ServerDate";
import Line from "./Line";
import * as _ from "lodash";
import {timeMiToMs} from "../../../common/common";

class LineChart extends Component {

    lastCountersTime = null;
    lastCountersHistoryTime = null;
    historyInit = {};
    chartType = "LINE";
    graph = {
        margin: {
            top: 15, right: 15, bottom: 25, left: 40
        },
        width: 700,
        height: 50,
        startTime: (new ServerDate()).getTime() - (1000 * 60 * 10),
        endTime: (new ServerDate()).getTime(),
        timeFormat: "%H:%M",
        fullTimeFormat: "%Y-%m-%d %H:%M:%S",
        xAxisWidth: 70,
        yAxisHeight: 30,
        noData: true,
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

        if(this.refs) {
            let box = this.refs.lineChart.parentNode.parentNode.parentNode.parentNode;
            this.graph.width = box.offsetWidth - this.graph.margin.left - this.graph.margin.right;
            this.graph.height = box.offsetHeight - this.graph.margin.top - this.graph.margin.bottom - 27;
            this.setState({
                options: {...this.graph, type: this.chartType}
            });
        }
    }

    componentWillUnmount() {

    };
    componentDidMount() {
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
        if (nextProps.countersHistory && this.lastCountersHistoryTime !== nextProps.countersHistoryTimestamp) {

            this.lastCountersHistoryTime = nextProps.countersHistoryTimestamp;
            for (let i = 0; i < nextProps.box.option.length; i++) {
                let counterKey = nextProps.box.option[i].counterKey;
                if (nextProps.countersHistory[counterKey]) {

                    counters = this.loadHistoryCounter(nextProps.countersHistory, counterKey, nextProps.longTerm);
                    this.setState({
                        counters: counters,
                    });
                } else {
                    counters[counterKey] = [];
                    this.setState({
                        counters: counters,
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
            const removeCounter = this.removeCounter(this.props.box.option,counters);
            removeCounter.forEach(d=> delete counters[d.counter]);
            this.setState({
                startTime: startTime,
                endTime: endTime,
                search : true,
                removeCounter : removeCounter.length > 0 ? removeCounter : null,
                options : {...this.graph,type : nextProps.box.values['chartType']},
            });
        }

        if (nextProps.counters && nextProps.time !== this.lastCountersTime) {

            this.lastCountersTime = nextProps.time;

            let endTime = nextProps.time;
            let startTime = nextProps.time - timeMiToMs(this.props.config.realTimeLastRange); //- realtime

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
            //- object remove , couter remove
            const removeCounter = this.removeCounter(this.props.box.option,counters);
            removeCounter.forEach(d=> delete counters[d.counter]);

            this.setState({
                startTime: startTime,
                endTime: endTime,
                counters: noData ? [] : counters,
                removeCounter : removeCounter.length > 0 ? removeCounter : null,
                noData: noData,
                options : {...this.graph,type : nextProps.box.values['chartType']},
                search : false
            });
        }

        if(nextProps.box.values['chartType'] !== this.chartType ) {
            this.setState({
                options : {...this.graph,type : nextProps.box.values['chartType']}
            });
        }
        this.chartType = nextProps.box.values['chartType'];


    }
    removeObject(prevList, currentList){
        const ret = [];
        let currentInstanceMap = {};
        if (currentList && currentList.length > 0) {
            for (let i = 0; i < currentList.length; i++) {
                currentInstanceMap[currentList[i].objHash] = true;
            }
        }

        if (prevList && prevList.length > 0) {
            for (let i = 0; i < prevList.length; i++) {
                if (!currentInstanceMap[prevList[i].objHash]) {

                    for (let counterKey in this.state.counters) {

                        let thisOption = null;
                        for (let j = 0; j < this.props.box.option.length; j++) {
                            if (this.props.box.option[j].counterKey === counterKey) {
                                thisOption = this.props.box.option[j];
                                break;
                            }
                        }

                        if (thisOption) {
                            ret.push( { key : prevList[i].objHash , counter : counterKey});
                        }
                    }
                }
            }
        }
        return ret;
    }
    removeCounter(boxOption,counters){
        const ret = [];
        for(const counterKey in counters) {
            let thisOption = boxOption.filter((d) => {
                return d.counterKey === counterKey
            })[0];
            if(!thisOption){
                ret.push(this.props.objects.map( d => {
                    return {key : d.objHash , counter : counterKey}
                }));
            }
        }
        return ret.length > 0 ? _.flattenDeep(ret,d=>d) : [];
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
            this.graph.maxY = maxY * 1.5;
        }

        if (this.graph.autoMaxY > this.graph.maxY) {
            this.graph.maxY = this.graph.autoMaxY * 1.5;
        }


    };

    axisUp = () => {
        this.graph.maxY = this.graph.maxY * 1.2;
        this.setState({
            options: {...this.graph}
        });
    };

    axisDown = () => {
        this.graph.maxY = this.graph.maxY * 0.8;
        if (this.graph.maxY < this.graph.autoMaxY) {
            this.graph.maxY = this.graph.autoMaxY;
        }
        this.setState({
           options: {...this.graph}
        });
    };

    stopProgation = (e) => {
        e.stopPropagation();
    };
    componentDidUpdate = (prevProps, prevState) => {

        if(this.isChangedSize()){
            this.resize();
        }
        const removeObject = this.removeObject(prevProps.objects,this.props.objects);
        if(removeObject.length > 0){
            this.setState({
                removeObject : removeObject
            });
        };
    };

    isChangedSize(){
        const box = this.refs.lineChart.parentNode.parentNode.parentNode.parentNode;
        if ((box.offsetWidth - this.graph.margin.left - this.graph.margin.right !== this.graph.width) || (this.graph.height !== box.offsetHeight - this.graph.margin.top - this.graph.margin.bottom - 27)) {
            return true;
        }
        return false;

    }

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
                               removeCounter={this.state.removeCounter}
                               removeObject={this.state.removeObject}
                               box = {this.props.box}
                               setTitle={this.props.setTitle}
                               removeTitle={this.props.removeTitle}
                               search={this.state.search}
                               hideTooltip={this.props.hideTooltip}
                               showTooltip={this.props.showTooltip}
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
        range: state.range,
    };
};


LineChart = connect(mapStateToProps, null)(LineChart);
export default withRouter(LineChart);
