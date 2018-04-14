import React, {Component} from 'react';
import './LineChart.css';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import * as d3 from "d3";
import ServerDate from "../../../common/ServerDate";
import InstanceColor from "../../../common/InstanceColor";
import numeral from "numeral";


class LineChart extends Component {

    lastCountersTime = null;
    lastCountersHistoryTime = null;
    historyInit = {};

    graph = {
        margin: {
            top: 24, right: 20, bottom: 30, left: 40
        },
        svg: null,
        overlay: null,
        width: null,
        height: null,
        x: null,
        y: null,
        path: null,
        startTime: (new ServerDate()).getTime() - (1000 * 60 * 10),
        endTime: (new ServerDate()).getTime(),
        timeFormat: "%H:%M",
        fullTimeFormat: "%Y-%m-%d %H:%M:%S",
        xAxisWidth: 70,
        yAxisHeight: 30,
        noData: true,
        bisector: null,
        currentTooltipTime: null
    };

    constructor(props) {
        super(props);
        this.state = {
            counters: {},
            maxY: null,
            autoMaxY: null
        }
    }

    componentDidMount() {
        this.graph.timeFormat = this.props.config.minuteFormat;
        this.graph.fullTimeFormat = this.props.config.dateFormat + " " + this.props.config.timeFormat;
        this.graphInit();
    }

    shouldComponentUpdate(nextProps, nextState) {

        /*if (this.props.visible && this.props.countersHistoryTimestamp !== nextProps.countersHistoryTimestamp) {
            return true;
        }*/
        return !!this.props.visible;
    }

    loadHistoryCounter(countersHistory, counterKey, longTerm) {
        let counters = this.state.counters;
        counters[counterKey] = [];
        const timeKeyRow = {};
        for (let objHash in countersHistory[counterKey]) {

            let timeList = countersHistory[counterKey][objHash].timeList;
            let valueList = countersHistory[counterKey][objHash].valueList;

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
                    value: valueList[j]
                };

                if (!timeKeyRow[row.time]) {
                    timeKeyRow[row.time] = row;
                } else {
                    timeKeyRow[row.time].data[objHash] = {
                        objHash: objHash,
                        value: valueList[j]
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

    componentWillReceiveProps(nextProps) {
        let counters = Object.assign(this.state.counters);
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

            this.graph.maxY = 10;

            this.setMaxY(counters);

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
            let startTime = nextProps.time - (1000 * 60 * 10);

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

            this.setMaxY(counters);

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


        if (this.props.layoutChangeTime !== nextProps.layoutChangeTime) {
            this.graphResize();
            this.draw();
        }

    }

    setMaxY = (counters) => {
        let maxY = 0;
        for (let attr in counters) {
            for (let i = 0; i < counters[attr].length; i++) {
                for (let hash in counters[attr][i].data) {
                    if (Array.isArray(counters[attr][i].data[hash].value)) {
                        for (let j = 0; j < counters[attr][i].data[hash].value.length; j++) {
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

        if (!maxY || maxY < 10) {
            maxY = 10;
        }

        this.graph.autoMaxY = maxY;

        if (!this.graph.maxY) {
            this.graph.maxY = maxY * 1.2;
        }

        if (this.graph.autoMaxY > this.graph.maxY) {
            this.graph.maxY = this.graph.autoMaxY;
        }
    };

    componentDidUpdate = (prevProps, prevState) => {
        this.graphResize();
        this.draw();
    };

    moveTooltip = () => {
        if (this.graph.currentTooltipTime) {
            let xPosition = this.graph.x(this.graph.currentTooltipTime);
            this.graph.focus.selectAll("circle").attr("cx", xPosition);

            let hoverLine = this.graph.focus.select("line.x-hover-line");
            hoverLine.attr("x1", xPosition);
            hoverLine.attr("x2", xPosition);
        }
    };

    graphAxis = (width, height, init) => {
        this.graph.x = d3.scaleTime().range([0, width]);
        this.graph.y = d3.scaleLinear().range([height, 0]);

        this.graph.x.domain([this.state.startTime, this.state.endTime]);
        this.graph.y.domain([0, this.graph.maxY]);

        let xAxisCount = Math.floor(this.graph.width / this.graph.xAxisWidth);
        if (xAxisCount < 1) {
            xAxisCount = 1;
        }

        let yAxisCount = Math.floor(this.graph.height / this.graph.yAxisHeight);
        if (yAxisCount < 1) {
            yAxisCount = 1;
        }

        if (init) {
            this.graph.svg.insert("g", ":first-child").attr("class", "axis-y").call(d3.axisLeft(this.graph.y).tickFormat(d3.format(".0s")).ticks(yAxisCount));
            this.graph.svg.insert("g", ":first-child").attr("class", "grid-y").style("stroke-dasharray", "5 5").style("opacity", "0.3").call(d3.axisLeft(this.graph.y).tickSize(-this.graph.width).tickFormat("").ticks(yAxisCount));
        } else {
            this.graph.svg.select(".axis-x").call(d3.axisBottom(this.graph.x).tickFormat(d3.timeFormat(this.graph.timeFormat)).ticks(xAxisCount));
            this.graph.svg.select(".grid-x").call(d3.axisBottom(this.graph.x).tickSize(-this.graph.height).tickFormat("").ticks(xAxisCount));
        }

        if (init) {
            this.graph.svg.insert("g", ":first-child").attr("class", "axis-x").attr("transform", "translate(0," + this.graph.height + ")").call(d3.axisBottom(this.graph.x).tickFormat(d3.timeFormat(this.graph.timeFormat)).ticks(xAxisCount));
            this.graph.svg.insert("g", ":first-child").attr("class", "grid-x").style("stroke-dasharray", "5 5").style("opacity", "0.3").attr("transform", "translate(0," + this.graph.height + ")").call(d3.axisBottom(this.graph.x).tickSize(-this.graph.height).tickFormat("").ticks(xAxisCount));
        } else {
            this.graph.svg.select(".axis-y").transition().duration(500).call(d3.axisLeft(this.graph.y).tickFormat(d3.format(".0s")).ticks(yAxisCount));
            this.graph.svg.select(".grid-y").transition().duration(500).call(d3.axisLeft(this.graph.y).tickSize(-this.graph.width).tickFormat("").ticks(yAxisCount));
        }
    };

    removeObjectLine = (obj, counterKey) => {
        let pathClass = "line-" + obj.objHash + "-" + counterKey;
        let path = this.graph.svg.selectAll("path." + pathClass);

        // 데이터 삭제
        let counters = Object.assign(this.state.counters);
        if (counters[counterKey]) {
            delete counters[counterKey];
        }
        delete this.state.counters[counterKey];
        this.setState({
            counters: counters
        });

        // 라인 그래프 삭제
        if (path && path.size() > 0) {
            path.remove();
        }

        // 툴팁 그래프 삭제
        let circleKey = "circle-" + obj.objHash + "_" + counterKey;
        let circle = this.graph.focus.selectAll("circle." + circleKey);

        if (circle.size() > 0) {
            circle.remove();
        }

        // 제목 삭제
        this.props.removeTitle(counterKey);
    };

    drawObjectLine = (obj, option, counterKey, color) => {
        const that = this;
        let pathClass = "line-" + obj.objHash + "-" + counterKey;
        let path = this.graph.svg.selectAll("path." + pathClass);

        if (path.size() < 1) {
            path = this.graph.svg.insert("path", ":first-child").attr("class", pathClass).style("stroke", color);
            this.props.setTitle(counterKey, option.title, color);
        } else {
            path.style("stroke", color);
            this.props.setTitle(counterKey, option.title, color);
            let circleKey = "circle-" + obj.objHash + "_" + counterKey;
            that.graph.focus.select("circle." + circleKey).attr("stroke", color);
        }

        let valueLine = d3.line().curve(d3.curveCatmullRom)
            .defined(function (d) {
                let objData = d.data ? d.data[obj.objHash] : null;
                return objData && !isNaN(objData.value) && !isNaN(that.graph.y(Number(objData.value)));
            })
            .x(function (d) {
                return that.graph.x(d.time);
            })
            .y(function (counter) {
                let objData = counter.data[obj.objHash];
                if (objData) {
                    return that.graph.y(Number(objData.value));
                } else {
                    return that.graph.y(0);
                }
            });

        path.data([that.state.counters[counterKey]]).attr("d", valueLine);
    };


    draw = () => {

        let that = this;

        if (this.refs.lineChart && this.graph.svg) {

            this.graphAxis(this.graph.width, this.graph.height, false);
            if (this.props.instances) {
                let instanceMetricCount = {};
                let hostMetricCount = {};

                for (let counterKey in this.state.counters) {

                    let thisOption = null;
                    for (let j = 0; j < this.props.box.option.length; j++) {
                        if (this.props.box.option[j].counterKey === counterKey) {
                            thisOption = this.props.box.option[j];
                            break;
                        }
                    }

                    if (!thisOption) {
                        for (let i = 0; i < this.props.instances.length; i++) {
                            this.removeObjectLine(this.props.instances[i], counterKey);
                        }
                        for (let i = 0; i < this.props.hosts.length; i++) {
                            this.removeObjectLine(this.props.hosts[i], counterKey);
                        }
                    }

                    if (thisOption && thisOption.objectType === "instance") {
                        for (let i = 0; i < this.props.instances.length; i++) {
                            const obj = that.props.instances[i];
                            if(!instanceMetricCount[obj.objHash]) {
                                instanceMetricCount[obj.objHash] = 0;
                            }
                            const color = InstanceColor.getInstanceColors()[obj.objHash][instanceMetricCount[obj.objHash]++%2===0 ? 'main' : 'sub'];
                            this.drawObjectLine(obj, thisOption, counterKey, color);
                        }
                    }

                    if (thisOption && thisOption.objectType === "host") {
                        for (let i = 0; i < this.props.hosts.length; i++) {
                            const obj = that.props.hosts[i];
                            if(!hostMetricCount[obj.objHash]) {
                                hostMetricCount[obj.objHash] = 0;
                            }
                            const color = InstanceColor.getHostColors()[obj.objHash][hostMetricCount[obj.objHash]++%2===0 ? 'main' : 'sub'];
                            this.drawObjectLine(obj, thisOption, counterKey, color);
                        }
                    }
                }
            }
        }

        this.moveTooltip();
    };


    graphResize = () => {
        let box = this.refs.lineChart.parentNode.parentNode.parentNode.parentNode;
        if ((box.offsetWidth - this.graph.margin.left - this.graph.margin.right !== this.graph.width) || (this.graph.height !== box.offsetHeight - this.graph.margin.top - this.graph.margin.bottom - 27)) {
            this.graphInit();
        }
    };

    mouseOverObject = (obj, thisOption, color) => {
        let that = this;
        let r = 3;

        let circleKey = "circle-" + obj.objHash + "_" + thisOption.counterKey;
        let circle = that.graph.focus.select("circle." + circleKey);
        if (circle.size() < 1) {
            that.graph.focus.append("circle").attr("class", circleKey).attr("r", r).attr("stroke", color);
        }
    };

    mouseMoveObject = (obj, thisOption, counterKey, dataIndex, color, tooltip) => {
        let that = this;

        let circleKey = "circle-" + obj.objHash + "_" + thisOption.counterKey;

        if (!that.state.counters[counterKey][dataIndex].data || !that.state.counters[counterKey][dataIndex].data[obj.objHash]) {
            return false;
        }

        let unit = that.state.counters[counterKey][dataIndex].data[obj.objHash].unit;
        if (unit === undefined) {
            const objData = that.state.counters[counterKey][that.state.counters[counterKey].length - 1].data[obj.objHash];
            if (objData) {
                unit = objData.unit;
            }
        }

        if (!unit) {
            unit = "";
        }


        if (that.state.counters[counterKey][dataIndex].time) {
            tooltip.lines.push({
                instanceName: obj.objName,
                circleKey: circleKey,
                metricName: thisOption.title,
                value: obj.objHash && that.state.counters[counterKey][dataIndex].data[obj.objHash] ? (Math.round(that.state.counters[counterKey][dataIndex].data[obj.objHash].value * 10) / 10) : null,
                displayValue: obj.objHash && that.state.counters[counterKey][dataIndex].data[obj.objHash] ? numeral((Math.round(that.state.counters[counterKey][dataIndex].data[obj.objHash].value * 10) / 10)).format(this.props.config.numberFormat) + " " + unit : null,
                color: color
            });
        } else {
            that.graph.focus.select("circle." + circleKey).style("display", "none");
        }

        return true;
    };

    graphInit = () => {

        let that = this;
        let box = this.refs.lineChart.parentNode.parentNode.parentNode.parentNode;
        this.graph.width = box.offsetWidth - this.graph.margin.left - this.graph.margin.right;
        this.graph.height = box.offsetHeight - this.graph.margin.top - this.graph.margin.bottom - 27;

        let svg = d3.select(this.refs.lineChart).select("svg");
        if (svg.size() > 0) {
            svg.remove();
        }

        this.graph.svg = d3.select(this.refs.lineChart).append("svg").attr("width", this.graph.width + this.graph.margin.left + this.graph.margin.right).attr("height", this.graph.height + this.graph.margin.top + this.graph.margin.bottom).append("g").attr("class", "top-group").attr("transform", "translate(" + this.graph.margin.left + "," + this.graph.margin.top + ")");
        this.graph.focus = this.graph.svg.append("g").attr("class", "tooltip-focus");

        this.graph.overlay = this.graph.svg.append("rect").attr("class", "tooltip-overlay").attr("width", this.graph.width).attr("height", this.graph.height);

        this.graph.overlay.on("mouseover", function () {
            let l = that.refs.lineChartRoot.parentNode.parentNode.parentNode.parentNode.parentNode;
            l.style.zIndex = 9;

            let hoverLine = that.graph.focus.select("line.x-hover-line");
            if (hoverLine.size() > 0) {
                hoverLine.style("display", "block");
            }

            let instanceMetricCount = {};
            let hostMetricCount = {};
            for (let counterKey in that.state.counters) {

                let thisOption = null;
                for (let j = 0; j < that.props.box.option.length; j++) {
                    if (that.props.box.option[j].counterKey === counterKey) {
                        thisOption = that.props.box.option[j];
                        break;
                    }
                }


                if (!thisOption) {
                    break;
                }

                if (thisOption.objectType === "instance") {
                    for (let i = 0; i < that.props.instances.length; i++) {
                        const obj = that.props.instances[i];
                        if(!instanceMetricCount[obj.objHash]) {
                            instanceMetricCount[obj.objHash] = 0;
                        }
                        const color = InstanceColor.getInstanceColors()[obj.objHash][instanceMetricCount[obj.objHash]++%2===0 ? 'main' : 'sub'];
                        that.mouseOverObject(that.props.instances[i], thisOption, color);
                    }
                }

                if (thisOption.objectType === "host") {
                    for (let i = 0; i < that.props.hosts.length; i++) {
                        const obj = that.props.hosts[i];
                        if(!hostMetricCount[obj.objHash]) {
                            hostMetricCount[obj.objHash] = 0;
                        }
                        const color = InstanceColor.getHostColors()[obj.objHash][hostMetricCount[obj.objHash]++%2===0 ? 'main' : 'sub'];
                        that.mouseOverObject(that.props.hosts[i], thisOption, color);
                    }
                }

            }

            that.graph.focus.selectAll("circle").style("display", "block");

            that.props.showTooltip();
        });
        this.graph.overlay.on("mouseout", function () {

            let l = that.refs.lineChartRoot.parentNode.parentNode.parentNode.parentNode.parentNode;
            l.style.zIndex = 5;



            let hoverLine = that.graph.focus.select("line.x-hover-line");
            if (hoverLine.size() > 0) {
                hoverLine.style("display", "none");
            }

            that.graph.focus.selectAll("circle").style("display", "none");

            that.props.hideTooltip();
        });

        this.graph.bisector = d3.bisector(function (d) {
            return d.time;
        }).left;

        this.graph.overlay.on("mousemove", function () {

            let tooltip = {};
            tooltip.lines = [];

            let xPos = d3.mouse(this)[0];
            let yPos = d3.mouse(this)[1];

            if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                let box = that.refs.lineChart.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
                if (window.getComputedStyle) {
                    let style = getComputedStyle(box);
                    let transform = style.transform || style.webkitTransform || style.mozTransform;
                    let mat = transform.match(/^matrix3d\((.+)\)$/);
                    if (mat) return parseFloat(mat[1].split(', ')[13]);
                    mat = transform.match(/^matrix\((.+)\)$/);
                    let transformX = mat ? parseFloat(mat[1].split(', ')[4]) : 0;
                    let transformY = mat ? parseFloat(mat[1].split(', ')[5]) : 0;
                    xPos = xPos - transformX;
                    yPos = yPos - transformY;
                }
            }

            let x0 = that.graph.x.invert(xPos);
            let timeFormat = d3.timeFormat(that.graph.fullTimeFormat);

            let instanceMetricCount = {};
            let hostMetricCount = {};

            for (let counterKey in that.state.counters) {
                let thisOption = null;
                for (let j = 0; j < that.props.box.option.length; j++) {
                    if (that.props.box.option[j].counterKey === counterKey) {
                        thisOption = that.props.box.option[j];
                        break;
                    }
                }

                let dataIndex = that.graph.bisector(that.state.counters[counterKey], x0, 0);

                if (!that.state.counters[counterKey][dataIndex]) {
                    break;
                }

                if (tooltip.timeValue && (tooltip.timeValue < that.state.counters[counterKey][dataIndex].time)) {

                } else {
                    tooltip.time = timeFormat(that.state.counters[counterKey][dataIndex].time);
                    tooltip.timeValue = that.state.counters[counterKey][dataIndex].time;
                }


                if (!thisOption) {
                    break;
                }

                if (thisOption.objectType === "instance") {
                    for (let i = 0; i < that.props.instances.length; i++) {
                        const obj = that.props.instances[i];
                        if(!instanceMetricCount[obj.objHash]) {
                            instanceMetricCount[obj.objHash] = 0;
                        }
                        const color = InstanceColor.getInstanceColors()[obj.objHash][instanceMetricCount[obj.objHash]++%2===0 ? 'main' : 'sub'];
                        that.mouseMoveObject(that.props.instances[i], thisOption, counterKey, dataIndex, color, tooltip);
                    }
                }

                if (thisOption.objectType === "host") {
                    for (let i = 0; i < that.props.hosts.length; i++) {
                        const obj = that.props.hosts[i];
                        if(!hostMetricCount[obj.objHash]) {
                            hostMetricCount[obj.objHash] = 0;
                        }
                        const color = InstanceColor.getHostColors()[obj.objHash][hostMetricCount[obj.objHash]++%2===0 ? 'main' : 'sub'];
                        that.mouseMoveObject(that.props.hosts[i], thisOption, counterKey, dataIndex, color, tooltip);
                    }
                }
            }

            let hoverLine = that.graph.focus.select("line.x-hover-line");
            if (hoverLine.size() < 1) {
                hoverLine = that.graph.focus.append("line").attr("class", "x-hover-line hover-line").attr("y1", 0).attr("y2", that.graph.height);
            }

            let xPosition = that.graph.x(tooltip.timeValue);

            if (tooltip.timeValue) {
                hoverLine.attr("x1", xPosition);
                hoverLine.attr("x2", xPosition);
            }

            if (tooltip && tooltip.lines) {
                for (let i = 0; i < tooltip.lines.length; i++) {
                    if (!isNaN(tooltip.lines[i].value)) {
                        let circle = that.graph.focus.select("circle." + tooltip.lines[i].circleKey);
                        if (circle.size() > 0) {
                            circle.attr("cx", xPosition);
                            circle.attr("cy", that.graph.y(tooltip.lines[i].value));
                        }
                    }
                }
            }

            that.graph.currentTooltipTime = tooltip.timeValue;
            that.props.showTooltip(xPos, yPos, that.graph.margin.left, that.graph.margin.top, tooltip);
        });

        this.graphAxis(this.graph.width, this.graph.height, true);

    };

    axisUp = () => {
        this.graph.maxY = this.graph.maxY * 1.2;
        this.graphAxis(this.graph.width, this.graph.height, false);
        this.draw();
    };

    axisDown = () => {

        this.graph.maxY = this.graph.maxY * 0.8;
        if (this.graph.maxY < this.graph.autoMaxY) {
            this.graph.maxY = this.graph.autoMaxY;
        }

        this.graphAxis(this.graph.width, this.graph.height, false);
        this.draw();
    };

    stopProgation = (e) => {
        e.stopPropagation();
    };

    render() {
        return (
            <div className="line-chart-wrapper" ref="lineChartRoot">
                <div className="line-chart" ref="lineChart"></div>
                <div className="axis-button axis-up noselect" onClick={this.axisUp} onMouseDown={this.stopProgation}>+
                </div>
                <div className="axis-button axis-down noselect" onClick={this.axisDown}
                     onMouseDown={this.stopProgation}>-
                </div>
                {this.state.noData && <div className="no-data">
                    <div>
                        <div>NO DATA RECEIVED</div>
                    </div>
                </div>}
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        hosts: state.target.hosts,
        instances: state.target.instances,
        config: state.config
    };
};


LineChart = connect(mapStateToProps, undefined)(LineChart);
export default withRouter(LineChart);
