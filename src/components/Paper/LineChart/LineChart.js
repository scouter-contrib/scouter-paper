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
        width: null,
        height: null,
        x: null,
        y: null,
        path: null,
        maxY: null,
        startTime: (new Date()).getTime() - (1000 * 60 * 10),
        endTime: (new Date()).getTime(),
        timeFormat: "%H:%M",
        xAxisWidth: 70,
        yAxisHeight: 30,
        noData : true
    };

    constructor(props) {
        super(props);
        this.state = {
            counters: []
        }
    }

    componentWillReceiveProps(nextProps) {

        if (nextProps.counters && nextProps.time !== this.lastCountersTime) {
            this.lastCountersTime = nextProps.time;

            let endTime = nextProps.time;
            let startTime = nextProps.time - (1000 * 60 * 10);

            let counters = this.state.counters.slice(0);
            counters.push({
                time: nextProps.time,
                data: nextProps.counters
            });

            let overIndex = -1;
            for (let i = 0; i < counters.length; i++) {
                if (counters[i].time < startTime) {
                    overIndex = i;
                }

                if (counters[i].time >= startTime) {
                    break;
                }
            }

            if (overIndex > -1) {
                counters.splice(0, overIndex + 1);
            }

            let maxY = d3.max(counters, function (counter) {
                let max = 0;
                for (let objHash in counter.data) {
                    if (counter.data[objHash].value > max) {
                        max = counter.data[objHash].value;
                    }
                }
                return max;
            });

            if (!maxY || maxY < 10) {
                maxY = 10;
            }

            this.graph.maxY = maxY;

            this.setState({
                startTime: startTime,
                endTime: endTime,
                counters: counters,
                noData : Object.keys(nextProps.counters).length === 0
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

    updateAxis = (clear) => {
        let svg = d3.select(this.refs.lineChart).select("svg");
        this.graph.y.domain([0, this.state.elapsed]);
        svg.select(".axis-y").transition().duration(500).call(d3.axisLeft(this.graph.y).tickFormat((e) => {
            if (this.state && (this.state.elapsed < 1000)) {
                return (e / 1000).toFixed(2) + "s";
            } else {
                return (e / 1000).toFixed(1) + "s";
            }
        }).ticks(this.graph.elapsedTicks));
        svg.select(".grid-y").transition().duration(500).call(d3.axisLeft(this.graph.y).tickSize(-this.graph.width).tickFormat("").ticks(this.graph.elapsedTicks));

        if (clear) {
            this.clear();
            this.redraw();
        }
    };


    graphAxis = (width, height, init) => {
        this.graph.x = d3.scaleTime().range([0, width]);
        this.graph.y = d3.scaleLinear().range([height, 0]);

        this.graph.x.domain([this.state.startTime, this.state.endTime]);

        let maxY = d3.max(this.state.counters, function (counter) {
            let max = 0;
            for (let objHash in counter.data) {
                if (counter.data[objHash].value > max) {
                    max = counter.data[objHash].value;
                }
            }
            return Number(max);
        });

        if (!maxY || maxY < 10) {
            maxY = 10;
        }

        this.graph.maxY = maxY;
        this.graph.y.domain([0, maxY]);

        let xAxisCount = Math.floor(this.graph.width / this.graph.xAxisWidth);
        if (xAxisCount < 1) {
            xAxisCount = 1;
        }

        let yAxisCount = Math.floor(this.graph.height / this.graph.yAxisHeight);
        if (yAxisCount < 1) {
            yAxisCount = 1;
        }

        if (init) {
            this.graph.svg.append("g").attr("class", "axis-y").call(d3.axisLeft(this.graph.y).ticks(yAxisCount));
            this.graph.svg.append("g").attr("class", "grid-y").style("stroke-dasharray", "5 5").style("opacity", "0.3").call(d3.axisLeft(this.graph.y).tickSize(-this.graph.width).tickFormat("").ticks(yAxisCount));
        } else {
            this.graph.svg.select(".axis-x").call(d3.axisBottom(this.graph.x).tickFormat(d3.timeFormat(this.graph.timeFormat)).ticks(xAxisCount));
            this.graph.svg.select(".grid-x").call(d3.axisBottom(this.graph.x).tickSize(-this.graph.height).tickFormat("").ticks(xAxisCount));
        }

        if (init) {
            this.graph.svg.append("g").attr("class", "axis-x").attr("transform", "translate(0," + this.graph.height + ")").call(d3.axisBottom(this.graph.x).tickFormat(d3.timeFormat(this.graph.timeFormat)).ticks(xAxisCount));
            this.graph.svg.append("g").attr("class", "grid-x").style("stroke-dasharray", "5 5").style("opacity", "0.3").attr("transform", "translate(0," + this.graph.height + ")").call(d3.axisBottom(this.graph.x).tickSize(-this.graph.height).tickFormat("").ticks(xAxisCount));
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
                for (let i = 0; i < this.props.instances.length; i++) {
                    let valueline = d3.line()
                        .defined(function (d) {
                            let objData = d.data[that.props.instances[i].objHash];
                            return objData && !isNaN(objData.value);
                        })
                        .curve(d3.curveCardinal)
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

                    this.graph.path.data([that.state.counters]).attr("class", "line line-" + that.props.instances[i].objHash).attr("d", valueline);
                }

            }

        }


    };

    componentDidMount() {
        this.graphInit();
    }

    shouldComponentUpdate() {
        return true;
    }

    graphResize = () => {
        let box = this.refs.lineChart.parentNode.parentNode.parentNode.parentNode;
        if ((box.offsetWidth - this.graph.margin.left - this.graph.margin.right !== this.graph.width) || (this.graph.height !== box.offsetHeight - this.graph.margin.top - this.graph.margin.bottom - 27)) {
            this.graphInit();
        }
    };


    graphInit = () => {

        let box = this.refs.lineChart.parentNode.parentNode.parentNode.parentNode;
        this.graph.width = box.offsetWidth - this.graph.margin.left - this.graph.margin.right;
        this.graph.height = box.offsetHeight - this.graph.margin.top - this.graph.margin.bottom - 27;

        let svg = d3.select(this.refs.lineChart).select("svg");
        if (svg.size() > 0) {
            svg.remove();
        }

        this.graph.svg = d3.select(this.refs.lineChart).append("svg").attr("width", this.graph.width + this.graph.margin.left + this.graph.margin.right).attr("height", this.graph.height + this.graph.margin.top + this.graph.margin.bottom).append("g").attr("class", "top-group").attr("transform", "translate(" + this.graph.margin.left + "," + this.graph.margin.top + ")");

        this.graphAxis(this.graph.width, this.graph.height, true);
        this.graph.path = this.graph.svg.append("path");
    };

    render() {
        return (
            <div className="line-chart-wrapper">
                <div className="line-chart" ref="lineChart"></div>
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