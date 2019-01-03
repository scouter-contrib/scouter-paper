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
            top: 15, right: 15, bottom: 25, left: 40
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
        currentTooltipTime: null,
        opacity : 0.3
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
        if (this.props.config.colorType === "white") {
            this.graph.opacity = 0.3;
        } else {
            this.graph.opacity = 0.6;
        }


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



    componentWillReceiveProps(nextProps) {
        let counters = Object.assign({}, this.state.counters);
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
        for (let attr in counters) {
            if (!metricMap[attr]) {
                continue;
            }

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

    removeObjLine(prevList, currentList) {
        // 제외된 인스턴스 찾기
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
                            this.removeObjectLineOnly(prevList[i], counterKey);
                        }
                    }
                }
            }
        }
    }

    componentDidUpdate = (prevProps, prevState) => {

        if (prevProps.layoutChangeTime !== this.props.layoutChangeTime) {
            if (this.graphResize()) {
                this.draw();
            }
        } else {
            this.graphResize();
            this.draw();
            this.removeObjLine(prevProps.objects, this.props.objects);
        }

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

    leftAxisFormat = (d) => {
        return numeral(d).format('0.0a');
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
            this.graph.svg.insert("g", ":first-child").attr("class", "axis-y").call(d3.axisLeft(this.graph.y).tickFormat(this.leftAxisFormat).ticks(yAxisCount));
            this.graph.svg.insert("g", ":first-child").attr("class", "grid-y").style("stroke-dasharray", "5 5").style("opacity", this.graph.opacity).call(d3.axisLeft(this.graph.y).tickSize(-this.graph.width).tickFormat("").ticks(yAxisCount));
        } else {
            this.graph.svg.select(".axis-x").call(d3.axisBottom(this.graph.x).tickFormat(d3.timeFormat(this.graph.timeFormat)).ticks(xAxisCount));
            this.graph.svg.select(".grid-x").call(d3.axisBottom(this.graph.x).tickSize(-this.graph.height).tickFormat("").ticks(xAxisCount));
        }

        if (init) {
            this.graph.svg.insert("g", ":first-child").attr("class", "axis-x").attr("transform", "translate(0," + this.graph.height + ")").call(d3.axisBottom(this.graph.x).tickFormat(d3.timeFormat(this.graph.timeFormat)).ticks(xAxisCount));
            this.graph.svg.insert("g", ":first-child").attr("class", "grid-x").style("stroke-dasharray", "5 5").style("opacity", this.graph.opacity).attr("transform", "translate(0," + this.graph.height + ")").call(d3.axisBottom(this.graph.x).tickSize(-this.graph.height).tickFormat("").ticks(xAxisCount));
        } else {
            this.graph.svg.select(".axis-y").transition().duration(500).call(d3.axisLeft(this.graph.y).tickFormat(this.leftAxisFormat).ticks(yAxisCount));
            this.graph.svg.select(".grid-y").transition().duration(500).call(d3.axisLeft(this.graph.y).tickSize(-this.graph.width).tickFormat("").ticks(yAxisCount));
        }
    };

    replaceAll(str, searchStr, replaceStr) {
        return str.split(searchStr).join(replaceStr);
    }

    replaceName (name) {
        if (name) {
            return this.replaceAll(this.replaceAll(name, "%", "_PCT_"), '$', '_DOLLAR_');
        }
        return name;
    }

    removeObjectLine = (obj, counterKey) => {
        let pathClass = "line-" + obj.objHash + "-" + this.replaceName(counterKey);
        let path = this.graph.svg.selectAll("path." + pathClass);

        // 데이터 삭제
        let counters = Object.assign({}, this.state.counters);
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
        let circleKey = "circle-" + obj.objHash + "_" + this.replaceName(counterKey);
        let circle = this.graph.focus.selectAll("circle." + circleKey);

        if (circle.size() > 0) {
            circle.remove();
        }

        // 제목 삭제
        this.props.removeTitle(counterKey);
    };

    removeObjectLineOnly = (obj, counterKey) => {
        let pathClass = "line-" + obj.objHash + "-" + this.replaceName(counterKey);
        let path = this.graph.svg.selectAll("path." + pathClass);

        // 라인 그래프 삭제
        if (path && path.size() > 0) {
            path.remove();
        }

        // 툴팁 그래프 삭제
        let circleKey = "circle-" + obj.objHash + "_" + this.replaceName(counterKey);
        let circle = this.graph.focus.selectAll("circle." + circleKey);

        if (circle.size() > 0) {
            circle.remove();
        }

    };

    drawObjectLine = (obj, option, counterKey, color) => {
        const that = this;

        if (this.props.config.graph.fill === "Y") {

            let areaClass = "area-" + obj.objHash + "-" + this.replaceName(counterKey);
            let area = this.graph.svg.selectAll("path." + areaClass);

            if (area.size() < 1) {
                area = this.graph.svg.insert("path", ":first-child").attr("class", areaClass).style("stroke", color);
            }

            let valueArea = d3.area().curve(d3[this.props.config.graph.curve])
                .x(function (d) {
                    return that.graph.x(d.time);
                })
                .y0(that.graph.height)
                .y1(function (counter) {
                    let objData = counter.data[obj.objHash];
                    if (objData) {
                        return that.graph.y(objData.value);
                    } else {
                        return that.graph.y(0);
                    }
                });

            if (this.props.config.graph.break === "Y") {
                valueArea.defined(function (d) {
                    let objData = d.data ? d.data[obj.objHash] : null;
                    return objData && !isNaN(d.time) && !isNaN(objData.value) && !isNaN(that.graph.y(objData.value));
                })
            }


            if (!this.props.filterMap[obj.objHash]) {
                area.data([that.state.counters[counterKey]]).attr("d", valueArea).style("fill", color).style("opacity", 0);
            } else {
                area.data([that.state.counters[counterKey]]).attr("d", valueArea).style("fill", color).style("opacity", this.props.config.graph.fillOpacity);
            }
        }


        let pathClass = "line-" + obj.objHash + "-" + this.replaceName(counterKey);
        let path = this.graph.svg.selectAll("path." + pathClass);

        if (path.size() < 1) {
            path = this.graph.svg.insert("path", ":first-child").attr("class", pathClass).style("stroke", color);
            if (this.props.config.graph.color === "instance") {
                if (this.props.config.colorType === "white") {
                    this.props.setTitle(counterKey, option.title, "#333", option.familyName);
                } else {
                    this.props.setTitle(counterKey, option.title, "white", option.familyName);
                }
            } else {
                this.props.setTitle(counterKey, option.title, color, option.familyName);
            }
        } else {
            path.style("stroke", color);
            if (this.props.config.graph.color === "instance") {
                if (this.props.config.colorType === "white") {
                    this.props.setTitle(counterKey, option.title, "#333", option.familyName);
                } else {
                    this.props.setTitle(counterKey, option.title, "white", option.familyName);
                }
            } else {
                this.props.setTitle(counterKey, option.title, color, option.familyName);
            }

            let circleKey = "circle-" + obj.objHash + "_" + this.replaceName(counterKey);
            that.graph.focus.select("circle." + circleKey).attr("stroke", color);
        }

        let valueLine = d3.line().curve(d3[this.props.config.graph.curve]);

        if (this.props.config.graph.break === "Y") {
            valueLine.defined(function (d) {
                let objData = d.data ? d.data[obj.objHash] : null;
                return objData && !isNaN(d.time) && !isNaN(objData.value) && !isNaN(that.graph.y(objData.value));
            })
        }

        valueLine.x(function (d) {
            return that.graph.x(d.time);
        }).y(function (counter) {
            let objData = counter.data[obj.objHash];
            if (objData) {
                return that.graph.y(objData.value);
            } else {
                return that.graph.y(0);
            }
        });

        if (!this.props.filterMap[obj.objHash]) {
            path.data([that.state.counters[counterKey]]).attr("d", valueLine).style("stroke-width", this.props.config.graph.width).style("opacity", 0);
        } else {
            path.data([that.state.counters[counterKey]]).attr("d", valueLine).style("stroke-width", this.props.config.graph.width).style("opacity", this.props.config.graph.opacity);
        }
    };

    drawTimer = null;

    draw = () => {

        let that = this;

        if (this.drawTimer) {
            clearTimeout(this.drawTimer);
            this.drawTimer = null;
        }

        this.drawTimer = setTimeout(() => {
            if (this.refs.lineChart && this.graph.svg) {

                this.graphAxis(this.graph.width, this.graph.height, false);
                if (this.props.objects) {
                    let instanceMetricCount = {};

                    for (let counterKey in this.state.counters) {
                        let thisOption = that.props.box.option.filter((d) => {return d.counterKey === counterKey})[0];

                        if (!thisOption) {
                            for (let i = 0; i < this.props.objects.length; i++) {
                                this.removeObjectLine(this.props.objects[i], counterKey);
                            }
                        } else {
                            for (let i = 0; i < this.props.objects.length; i++) {
                                const obj = that.props.objects[i];

                                if (obj.objFamily === thisOption.familyName) {
                                    if (!instanceMetricCount[obj.objHash]) {
                                        instanceMetricCount[obj.objHash] = 0;
                                    }
                                    let color;
                                    if (this.props.config.graph.color === "metric") {
                                        color = InstanceColor.getMetricColor(thisOption.counterKey, this.props.config.colorType);
                                    } else {
                                        color = InstanceColor.getInstanceColors(this.props.config.colorType)[obj.objHash][(instanceMetricCount[obj.objHash]++) % 5];
                                    }
                                    this.drawObjectLine(obj, thisOption, counterKey, color);
                                }
                            }
                        }
                    }
                }
            }

            this.moveTooltip();
        }, 200);

    };


    graphResize = () => {
        let resized = false;
        let box = this.refs.lineChart.parentNode.parentNode.parentNode.parentNode;
        if ((box.offsetWidth - this.graph.margin.left - this.graph.margin.right !== this.graph.width) || (this.graph.height !== box.offsetHeight - this.graph.margin.top - this.graph.margin.bottom - 27)) {
            resized = true;
            this.graphInit();
        }

        return resized;
    };

    mouseOverObject = (obj, thisOption, color) => {
        let that = this;
        let r = 3;

        let circleKey = "circle-" + obj.objHash + "_" + this.replaceName(thisOption.counterKey);
        let circle = that.graph.focus.select("circle." + circleKey);
        if (circle.size() < 1) {
            circle = that.graph.focus.append("circle").attr("class", circleKey).attr("r", r).attr("stroke", color);
        }

        if (this.props.filterMap[obj.objHash]) {
            circle.style("opacity", 1);
        } else {
            circle.style("opacity", 0);
        }

    };

    mouseMoveObject = (obj, thisOption, counterKey, dataIndex, color, tooltip) => {
        let that = this;

        let circleKey = "circle-" + obj.objHash + "_" + this.replaceName(thisOption.counterKey);
        let unit = that.state.counters[counterKey][dataIndex].data[obj.objHash] ? that.state.counters[counterKey][dataIndex].data[obj.objHash].unit : "";

        if (that.state.counters[counterKey][dataIndex].time) {
            if (this.props.filterMap[obj.objHash]) {
                tooltip.lines.push({
                    instanceName: obj.objName,
                    circleKey: circleKey,
                    metricName: thisOption.title,
                    value: obj.objHash && that.state.counters[counterKey][dataIndex].data[obj.objHash] ? that.state.counters[counterKey][dataIndex].data[obj.objHash].value : null,
                    displayValue: obj.objHash && that.state.counters[counterKey][dataIndex].data[obj.objHash] ? numeral(that.state.counters[counterKey][dataIndex].data[obj.objHash].value).format(this.props.config.numberFormat) + " " + unit : null,
                    color: color
                });
            }
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
            let layer = that.refs.lineChartRoot.parentNode.parentNode.parentNode.parentNode.parentNode;
            layer.style.zIndex = 9;

            let hoverLine = that.graph.focus.select("line.x-hover-line");
            if (hoverLine.size() > 0) {
                hoverLine.style("display", "block");
            }

            let instanceMetricCount = {};
            for (let counterKey in that.state.counters) {
                let thisOption = that.props.box.option.filter((d) => {return d.counterKey === counterKey})[0];
                if (!thisOption) {
                    break;
                }

                for (let i = 0; i < that.props.objects.length; i++) {
                    const obj = that.props.objects[i];
                    if (thisOption.familyName === obj.objFamily) {
                        if (!instanceMetricCount[obj.objHash]) {
                            instanceMetricCount[obj.objHash] = 0;
                        }
                        let color;
                        if (that.props.config.graph.color === "metric") {
                            color = InstanceColor.getMetricColor(thisOption.counterKey, that.props.config.colorType);
                        } else {
                            color = InstanceColor.getInstanceColors(that.props.config.colorType)[obj.objHash][(instanceMetricCount[obj.objHash]++) % 5];
                        }
                        that.mouseOverObject(that.props.objects[i], thisOption, color);
                    }
                }
            }

            that.graph.focus.selectAll("circle").style("display", "block");

            //that.props.showTooltip();
        });
        this.graph.overlay.on("mouseout", function () {

            let layer = that.refs.lineChartRoot.parentNode.parentNode.parentNode.parentNode.parentNode;
            layer.style.zIndex = 5;

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

            for (let counterKey in that.state.counters) {
                let thisOption = that.props.box.option.filter((d) => {return d.counterKey === counterKey})[0];
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

                for (let i = 0; i < that.props.objects.length; i++) {
                    const obj = that.props.objects[i];
                    if (thisOption.familyName === obj.objFamily) {

                        if (!instanceMetricCount[obj.objHash]) {
                            instanceMetricCount[obj.objHash] = 0;
                        }
                        let color;
                        if (that.props.config.graph.color === "metric") {
                            color = InstanceColor.getMetricColor(thisOption.counterKey, that.props.config.colorType);
                        } else {
                            color = InstanceColor.getInstanceColors(that.props.config.colorType)[obj.objHash][(instanceMetricCount[obj.objHash]++) % 5];
                        }
                        that.mouseMoveObject(that.props.objects[i], thisOption, counterKey, dataIndex, color, tooltip);
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
                <div className="axis-button axis-up noselect" onClick={this.axisUp} onMouseDown={this.stopProgation}><i className="fa fa-angle-up" aria-hidden="true"></i></div>
                <div className="axis-button axis-down noselect" onClick={this.axisDown} onMouseDown={this.stopProgation}><i className="fa fa-angle-down" aria-hidden="true"></i></div>
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
        objects: state.target.objects,
        config: state.config,
        filterMap: state.target.filterMap
    };
};

LineChart = connect(mapStateToProps, undefined)(LineChart);
export default withRouter(LineChart);
