import React, {Component} from 'react';
import './LineChart.css';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import * as d3 from "d3";

class LineChart extends Component {

    lastCountersTime = null;

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
        startTime: (new Date()).getTime() - (1000 * 60 * 10),
        endTime: (new Date()).getTime(),
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
            maxY : null,
            autoMaxY : null
        }
    }

    componentDidMount() {
        this.graphInit();
    }

    shouldComponentUpdate() {
        return true;
    }

    componentWillReceiveProps(nextProps) {

        if (nextProps.counters && nextProps.time !== this.lastCountersTime) {

            this.lastCountersTime = nextProps.time;

            let endTime = nextProps.time;
            let startTime = nextProps.time - (1000 * 60 * 10);

            let counters = Object.assign(this.state.counters);

            if (Array.isArray(nextProps.box.option)) {
                for (let i = 0; i < nextProps.box.option.length; i++) {
                    let counterKey = nextProps.box.option[i].counterKey;
                    if (!counters[counterKey]) {
                        counters[counterKey] = [];
                    }

                    counters[counterKey].push({
                        time: nextProps.time,
                        data: nextProps.counters[counterKey]
                    });

                }
            } else {
                let counterKey = nextProps.box.option.counterKey;
                if (!counters[counterKey]) {
                    counters[counterKey] = [];
                }
                counters[counterKey].push({
                    time: nextProps.time,
                    data: nextProps.counters[counterKey]
                });
            }

            for (let attr in counters) {
                let overIndex = -1;
                for (let i = 0; i < counters[attr].length; i++) {
                    if (counters[attr][i].time < startTime) {
                        overIndex = i;
                    }

                    if (counters[attr][i].time >= startTime) {
                        break;
                    }
                }

                if (overIndex > -1) {
                    counters[attr].splice(0, overIndex + 1);
                }
            }

            let maxY = 0;
            for (let attr in this.state.counters) {
                for (let i = 0; i < this.state.counters[attr].length; i++) {
                    for (let hash in this.state.counters[attr][i].data) {
                        if (Array.isArray(this.state.counters[attr][i].data[hash].value)) {
                            for (let j = 0; j < this.state.counters[attr][i].data[hash].value.length; j++) {
                                if (Number(this.state.counters[attr][i].data[hash].value[j]) > maxY) {
                                    maxY = Number(this.state.counters[attr][i].data[hash].value[j]);
                                }
                            }
                        } else {
                            if (Number(this.state.counters[attr][i].data[hash].value) > maxY) {
                                maxY = Number(this.state.counters[attr][i].data[hash].value);
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

            /*if (maxY > this.graph.maxY) {
                this.graph.maxY = maxY;
            }*/


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
        } else {
            let startTime = (new Date()).getTime() - (1000 * 60 * 10);
            let endTime = (new Date()).getTime();

            this.setState({
                startTime: startTime,
                endTime: endTime
            });
        }

    }

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
            this.graph.svg.insert("g", ":first-child").attr("class", "axis-y").call(d3.axisLeft(this.graph.y).ticks(yAxisCount));
            this.graph.svg.insert("g", ":first-child").attr("class", "grid-y").style("stroke-dasharray", "5 5").style("opacity", "0.3").call(d3.axisLeft(this.graph.y).tickSize(-this.graph.width).tickFormat("").ticks(yAxisCount));
        } else {
            this.graph.svg.select(".axis-x").call(d3.axisBottom(this.graph.x).tickFormat(d3.timeFormat(this.graph.timeFormat)).ticks(xAxisCount));
            this.graph.svg.select(".grid-x").call(d3.axisBottom(this.graph.x).tickSize(-this.graph.height).tickFormat("").ticks(xAxisCount));
        }

        if (init) {
            this.graph.svg.insert("g", ":first-child").attr("class", "axis-x").attr("transform", "translate(0," + this.graph.height + ")").call(d3.axisBottom(this.graph.x).tickFormat(d3.timeFormat(this.graph.timeFormat)).ticks(xAxisCount));
            this.graph.svg.insert("g", ":first-child").attr("class", "grid-x").style("stroke-dasharray", "5 5").style("opacity", "0.3").attr("transform", "translate(0," + this.graph.height + ")").call(d3.axisBottom(this.graph.x).tickSize(-this.graph.height).tickFormat("").ticks(xAxisCount));
        } else {
            this.graph.svg.select(".axis-y").transition().duration(500).call(d3.axisLeft(this.graph.y).ticks(yAxisCount));
            this.graph.svg.select(".grid-y").transition().duration(500).call(d3.axisLeft(this.graph.y).tickSize(-this.graph.width).tickFormat("").ticks(yAxisCount));
        }
    };


    draw = () => {

        let that = this;

        if (this.refs.lineChart && this.graph.svg) {

            this.graphAxis(this.graph.width, this.graph.height, false);
            if (this.props.instances) {
                let colorScale = d3.schemeCategory10;
                let cnt = 0;
                for (let counterKey in this.state.counters) {
                    for (let i = 0; i < this.props.instances.length; i++) {

                        let isMultiValue = false;
                        let thisOption = null;
                        for (let j = 0; j < this.props.box.option.length; j++) {
                            if (this.props.box.option[j].counterKey === counterKey) {
                                thisOption = this.props.box.option[j];
                                if (this.props.box.option[j].multiValue) {
                                    isMultiValue = true;
                                }
                                break;
                            }
                        }

                        if (isMultiValue) {
                            for (let j = 0; j < thisOption.multiValue.length; j++) {
                                let valueLine = d3.line().curve(d3.curveMonotoneX)
                                    .defined(function (d) {
                                        let objData = (d.data && d.data[that.props.instances[i].objHash] && d.data[that.props.instances[i].objHash].value) ? d.data[that.props.instances[i].objHash].value : null;
                                        return objData && !isNaN(objData[j]);
                                    })
                                    .x(function (d) {
                                        return that.graph.x(d.time);
                                    })
                                    .y(function (counter) {
                                        let objData = counter.data[that.props.instances[i].objHash];
                                        if (objData.value[j]) {
                                            return that.graph.y(Number(objData.value[j]));
                                        } else {
                                            return that.graph.y(0);
                                        }
                                    });

                                let pathClass = "line-" + that.props.instances[i].objHash + "-" + counterKey + "-" + thisOption.multiValue[j];

                                let path = this.graph.svg.select(".line." + pathClass);
                                if (path.size() < 1) {
                                    path = this.graph.svg.insert("path", ":first-child").attr("class", "line " + pathClass).style("stroke", colorScale[cnt]);
                                    this.props.setTitle(thisOption.title + "(" + thisOption.multiValue[j] + ")", colorScale[cnt]);
                                }
                                path.data([that.state.counters[counterKey]]).attr("d", valueLine);
                                cnt++;
                            }
                        } else {
                            let valueLine = d3.line().curve(d3.curveMonotoneX)
                                .defined(function (d) {
                                    let objData = d.data ? d.data[that.props.instances[i].objHash] : null;
                                    return objData && !isNaN(objData.value);
                                })
                                .x(function (d) {
                                    return that.graph.x(d.time);
                                })
                                .y(function (counter) {
                                    let objData = counter.data[that.props.instances[i].objHash];
                                    if (objData) {
                                        return that.graph.y(Number(objData.value));
                                    } else {
                                        return that.graph.y(0);
                                    }
                                });

                            let pathClass = "line-" + that.props.instances[i].objHash + "-" + counterKey;

                            let path = this.graph.svg.select(".line." + pathClass);
                            if (path.size() < 1) {
                                path = this.graph.svg.insert("path", ":first-child").attr("class", "line " + pathClass).style("stroke", colorScale[cnt]);
                                this.props.setTitle(thisOption.title, colorScale[cnt]);
                            }
                            path.data([that.state.counters[counterKey]]).attr("d", valueLine);
                            cnt++;
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
            let r = 3;
            let hoverLine = that.graph.focus.select("line.x-hover-line");
            if (hoverLine.size() > 0) {
                hoverLine.style("display", "block");
            }

            let colorScale = d3.schemeCategory10;
            let cnt = 0;
            for (let counterKey in that.state.counters) {
                for (let i = 0; i < that.props.instances.length; i++) {

                    let isMultiValue = false;
                    let thisOption = null;
                    for (let j = 0; j < that.props.box.option.length; j++) {
                        if (that.props.box.option[j].counterKey === counterKey) {
                            thisOption = that.props.box.option[j];
                            if (that.props.box.option[j].multiValue) {
                                isMultiValue = true;
                            }
                            break;
                        }
                    }

                    if (isMultiValue) {
                        for (let j = 0; j < thisOption.multiValue.length; j++) {
                            let circleKey = (that.props.instances[i].objName + "_" + thisOption.counterKey + "_" + thisOption.multiValue[j]).replace(/\//gi, "_");
                            let circle = that.graph.focus.select("circle." + circleKey);
                            if (circle.size() < 1) {
                                circle = that.graph.focus.append("circle").attr("class", circleKey).attr("r", r).attr("stroke", colorScale[cnt]);
                            }
                            cnt++;
                        }
                    } else {
                        let circleKey = (that.props.instances[i].objName + "_" + thisOption.counterKey).replace(/\//gi, "_");
                        let circle = that.graph.focus.select("circle." + circleKey);
                        if (circle.size() < 1) {
                            circle = that.graph.focus.append("circle").attr("class", circleKey).attr("r", r).attr("stroke", colorScale[cnt]);
                        }
                        cnt++;
                    }

                }
            }

            that.graph.focus.selectAll("circle").style("display", "block");

            that.props.showTooltip();
        });
        this.graph.overlay.on("mouseout", function () {

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

            let x0 = that.graph.x.invert(d3.mouse(this)[0]);
            let timeFormat = d3.timeFormat(that.graph.fullTimeFormat);

            let colorScale = d3.schemeCategory10;
            let cnt = 0;
            for (let counterKey in that.state.counters) {
                for (let i = 0; i < that.props.instances.length; i++) {
                    let isMultiValue = false;
                    let thisOption = null;
                    for (let j = 0; j < that.props.box.option.length; j++) {
                        if (that.props.box.option[j].counterKey === counterKey) {
                            thisOption = that.props.box.option[j];
                            if (that.props.box.option[j].multiValue) {
                                isMultiValue = true;
                            }
                            break;
                        }
                    }

                    let dataIndex = that.graph.bisector(that.state.counters[counterKey], x0, 0);

                    if (tooltip.timeValue && (tooltip.timeValue < that.state.counters[counterKey][dataIndex].time)) {

                    } else {
                        tooltip.time = timeFormat(that.state.counters[counterKey][dataIndex].time);
                        tooltip.timeValue = that.state.counters[counterKey][dataIndex].time;
                    }

                    if (!that.state.counters[counterKey][dataIndex]) {
                        break;
                    }

                    if (isMultiValue) {
                        for (let j = 0; j < thisOption.multiValue.length; j++) {
                            let circleKey = (that.props.instances[i].objName + "_" + thisOption.counterKey + "_" + thisOption.multiValue[j]).replace(/\//gi, "_");
                            if (tooltip.timeValue === that.state.counters[counterKey][dataIndex].time) {
                                tooltip.lines.push({
                                    instanceName: that.props.instances[i].objName,
                                    circleKey: circleKey,
                                    metricName: thisOption.title + "(" + thisOption.multiValue[j] + ")",
                                    value: Math.round(that.state.counters[counterKey][dataIndex].data[that.props.instances[i].objHash].value[j] * 10) / 10,
                                    color: colorScale[cnt]
                                });
                            } else {
                                that.graph.focus.select("circle." + circleKey).style("display", "none");
                            }

                            cnt++;
                        }
                    } else {
                        let circleKey = (that.props.instances[i].objName + "_" + thisOption.counterKey).replace(/\//gi, "_");
                        if (tooltip.timeValue === that.state.counters[counterKey][dataIndex].time) {
                            tooltip.lines.push({
                                instanceName: that.props.instances[i].objName,
                                circleKey: circleKey,
                                metricName: thisOption.title,
                                value: that.state.counters[counterKey][dataIndex].data[that.props.instances[i].objHash] ? Math.round(that.state.counters[counterKey][dataIndex].data[that.props.instances[i].objHash].value * 10) / 10 : null,
                                color: colorScale[cnt]
                            });
                        } else {
                            that.graph.focus.select("circle." + circleKey).style("display", "none");
                        }

                        cnt++;
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

            that.props.showTooltip(d3.mouse(this)[0], d3.mouse(this)[1], that.graph.margin.left, that.graph.margin.top, tooltip);

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
            <div className="line-chart-wrapper">
                <div className="line-chart" ref="lineChart"></div>
                <div className="axis-button axis-up noselect" onClick={this.axisUp} onMouseDown={this.stopProgation}>+</div>
                <div className="axis-button axis-down noselect" onClick={this.axisDown} onMouseDown={this.stopProgation}>-</div>
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
        instances: state.target.instances
    };
};


LineChart = connect(mapStateToProps, undefined)(LineChart);
export default withRouter(LineChart);