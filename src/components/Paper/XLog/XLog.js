import React, {Component} from 'react';
import './XLog.css';
import * as d3 from "d3";
import Profiler from "./Profiler/Profiler";


class XLog extends Component {

    graph = {
        margin: {
            top: 24, right: 20, bottom: 30, left: 40
        },
        x: null,
        y: null,
        width: null,
        height: null,
        brush: null,
        timeFormat: "%H:%M",
        last: 0,
        xAxisWidth: 70,
        yAxisHeight: 30,
        originX: null,
        originY: null
    };

    lastStartTime = null;
    lastEndTime = null;

    constructor(props) {
        super(props);

        this.state = {
            elapsed: 2000,
            xlog: [],
            selection: {
                x1: null,
                x2: null,
                y1: null,
                y2: null
            }
        }
    }

    resize = () => {
        this.graphResize();
    };

    componentDidMount() {
        this.graphInit();
    }

    componentDidUpdate = (prevProps, prevState) => {
        this.resize();

        // 시간이 변경되는 경우, 축 및 축 그리드 변경
        if (this.lastStartTime !== this.props.data.startTime || this.lastEndTime !== this.props.data.endTime) {
            this.lastStartTime = this.props.data.startTime;
            this.lastEndTime = this.props.data.endTime;
            this.moveCanvas();
            this.updateXAxis(false);
        }

        // 최대 값이 변경되는 경우, 축 및 그리드 변경
        if (this.state.elapsed !== prevState.elapsed) {
            this.updateYAxis(true);
        }

        this.draw(this.props.data.newXLogs);
    };


    graphResize = () => {
        let box = this.refs.xlogViewer.parentNode.parentNode.parentNode;
        if ((box.offsetWidth - this.graph.margin.left - this.graph.margin.right !== this.graph.width) || (this.graph.height !== box.offsetHeight - this.graph.margin.top - this.graph.margin.bottom - 27)) {
            this.graphInit();
        }
    };


    draw = (xlogs) => {
        if (this.refs.xlogViewer && xlogs) {
            let context = d3.select(this.refs.xlogViewer).select("canvas").node().getContext("2d");
            let gabX = Math.floor(this.graph.normalBrush.width / 2);
            let gabY = Math.floor(this.graph.normalBrush.height / 2);
            xlogs.forEach((d, i) => {
                let x = this.graph.x(d.endTime);
                let y = this.graph.y(d.elapsed);

                if (y < 0) {
                    y = 0;
                }

                if (x > 0) {
                    console.log("draw");
                    if (Number(d.error)) {
                        context.drawImage(this.graph.errorBrush, x - gabX, y - gabY, this.graph.errorBrush.width, this.graph.errorBrush.height);
                    } else {
                        context.drawImage(this.graph.normalBrush, x - gabX, y - gabY, this.graph.normalBrush.width, this.graph.normalBrush.height);
                    }
                }
            });
        }
    };

    updateXAxis = (clear) => {

        let svg = d3.select(this.refs.xlogViewer).select("svg");
        this.graph.x.domain([this.props.data.startTime, this.props.data.endTime]);
        let xAxisCount = Math.floor(this.graph.width / this.graph.xAxisWidth);
        if (xAxisCount < 1) {
            xAxisCount = 1;
        }
        svg.select(".axis-x").call(d3.axisBottom(this.graph.x).tickFormat(d3.timeFormat(this.graph.timeFormat)).ticks(xAxisCount));
        svg.select(".grid-x").call(d3.axisBottom(this.graph.x).tickSize(-this.graph.height).tickFormat("").ticks(xAxisCount));

        if (clear) {
            this.clear();
            this.redraw();
        }
    };

    clear = () => {
        let canvas = d3.select(this.refs.xlogViewer).select("canvas").node();
        let context = canvas.getContext("2d");

        this.graph._tempCanvas.width = canvas.width;
        this.graph._tempCanvas.height = canvas.height;

        let tempContext = this.graph._tempCanvas.getContext("2d");
        this.graph.last = 0;

        tempContext.clearRect(0, 0, canvas.width, canvas.height);
        context.clearRect(0, 0, canvas.width, canvas.height);
    };

    redraw = () => {
        this.draw(this.props.data.xlogs);
    };

    updateYAxis = (clear) => {

        let yAxisCount = Math.floor(this.graph.height / this.graph.yAxisHeight);
        if (yAxisCount < 1) {
            yAxisCount = 1;
        }

        let svg = d3.select(this.refs.xlogViewer).select("svg");
        this.graph.y.domain([0, this.state.elapsed]);
        svg.select(".axis-y").transition().duration(500).call(d3.axisLeft(this.graph.y).tickFormat((e) => {
            if (this.state && (this.state.elapsed < 1000)) {
                return (e / 1000).toFixed(2) + "s";
            } else {
                return (e / 1000).toFixed(1) + "s";
            }
        }).ticks(yAxisCount));
        svg.select(".grid-y").transition().duration(500).call(d3.axisLeft(this.graph.y).tickSize(-this.graph.width).tickFormat("").ticks(yAxisCount));

        if (clear) {
            this.clear();
            this.redraw();
        }
    };

    moveCanvas = () => {
        let canvas = d3.select(this.refs.xlogViewer).select("canvas").node();
        let context = canvas.getContext("2d");

        if (!this.graph._tempCanvas) {
            this.graph._tempCanvas = document.createElement('canvas');
            this.graph._tempCanvas.width = canvas.width;
            this.graph._tempCanvas.height = canvas.height;
        } else if (this.graph._tempCanvas.width !== canvas.width || this.graph._tempCanvas.height !== canvas.height) {
            this.graph._tempCanvas.width = canvas.width;
            this.graph._tempCanvas.height = canvas.height;
        }

        let tempContext = this.graph._tempCanvas.getContext("2d");
        let moveCanvasX = this.graph.x(this.props.data.startTime);
        moveCanvasX += this.graph.last;
        let pixel = Math.floor(moveCanvasX);
        this.graph.last = moveCanvasX - pixel;

        tempContext.clearRect(0, 0, canvas.width, canvas.height);
        tempContext.drawImage(canvas, 0, 0, canvas.width, canvas.height);

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(this.graph._tempCanvas, -pixel, 0, canvas.width, canvas.height);
    };

    graphInit = () => {
        let box = this.refs.xlogViewer.parentNode.parentNode.parentNode;
        this.graph.width = box.offsetWidth - this.graph.margin.left - this.graph.margin.right;
        this.graph.height = box.offsetHeight - this.graph.margin.top - this.graph.margin.bottom - 27;

        let svg = d3.select(this.refs.xlogViewer).select("svg");
        if (svg.size() > 0) {
            svg.remove();
        }
        svg = d3.select(this.refs.xlogViewer).append("svg").attr("width", this.graph.width + this.graph.margin.left + this.graph.margin.right).attr("height", this.graph.height + this.graph.margin.top + this.graph.margin.bottom).append("g").attr("class", "top-group").attr("transform", "translate(" + this.graph.margin.left + "," + this.graph.margin.top + ")");


        this.graph.x = d3.scaleTime().range([0, this.graph.width]).domain([this.props.data.startTime, this.props.data.endTime]);
        this.graph.y = d3.scaleLinear().range([this.graph.height, 0]).domain([0, this.props.data.maxElapsed]);

        // X축 단위 그리기
        let xAxisCount = Math.floor(this.graph.width / this.graph.xAxisWidth);
        if (xAxisCount < 1) {
            xAxisCount = 1;
        }
        svg.append("g").attr("class", "axis-x").attr("transform", "translate(0," + this.graph.height + ")").call(d3.axisBottom(this.graph.x).tickFormat(d3.timeFormat(this.graph.timeFormat)).ticks(xAxisCount));
        // Y축 단위 그리기
        let yAxisCount = Math.floor(this.graph.height / this.graph.yAxisHeight);
        if (yAxisCount < 1) {
            yAxisCount = 1;
        }

        svg.append("g").attr("class", "axis-y").call(d3.axisLeft(this.graph.y).tickFormat(function (e) {
            if (this.state && this.state.elapsed < 1000) {
                return (e / 1000).toFixed(2) + "s";
            } else {
                return (e / 1000).toFixed(1) + "s";
            }

        }).ticks(yAxisCount));

        // X축 단위 그리드 그리기
        svg.append("g").attr("class", "grid-x").style("stroke-dasharray", "5 5").style("opacity", "0.3").attr("transform", "translate(0," + this.graph.height + ")").call(d3.axisBottom(this.graph.x).tickSize(-this.graph.height).tickFormat("").ticks(xAxisCount));

        // Y축 단위 그리드 그리기
        svg.append("g").attr("class", "grid-y").style("stroke-dasharray", "5 5").style("opacity", "0.3").call(d3.axisLeft(this.graph.y).tickSize(-this.graph.width).tickFormat("").ticks(yAxisCount));

        // 캔버스 그리기
        let canvasDiv = d3.select(this.refs.xlogViewer).select(".canvas-div");
        if (canvasDiv.size() > 0) {
            canvasDiv.remove();
        }
        canvasDiv = d3.select(this.refs.xlogViewer).append("div").attr("class", "canvas-div").style('position', 'absolute').style('top', '0px').style('left', '0px');
        let canvas = canvasDiv.append('canvas').attr('height', this.graph.height).attr('width', this.graph.width + 20).style('position', 'absolute').style('top', this.graph.margin.top + 'px').style('left', this.graph.margin.left + 'px');


        // 드래그 셀렉트
        svg.append("g").append("rect").attr("class", "selection").attr("opacity", 0.2);
        let that = this;
        var dragBehavior = d3.drag()
            .on("drag", function () {
                var p = d3.mouse(this);
                var x = p[0] < that.graph.originX ? p[0] : that.graph.originX;
                var y = p[1] < that.graph.originY ? p[1] : that.graph.originY;

                // 가로가 그래프 범위 안에 있도록
                x = x > 0 ? x : 0;
                var width = 0;
                if (p[0] > that.graph.originX) {
                    width = Math.abs(p[0] - that.graph.originX);
                } else {
                    width = Math.abs(x - that.graph.originX);
                }

                if (x + width > that.graph.width) {
                    width = that.graph.width - x;
                }

                // 세로가 그래프 범위 안에 있도록
                y = y > 0 ? y : 0;
                var height = 0;
                if (p[1] > that.graph.originY) {
                    height = Math.abs(p[1] - that.graph.originY);
                } else {
                    height = Math.abs(y - that.graph.originY);
                }

                if ((y + height) > that.graph.height) {
                    height = that.graph.height - y;
                }

                d3.select(".selection").attr("x", x).attr("y", y).attr("width", width).attr("height", height);
            })
            .on("start", function () {
                var p = d3.mouse(this);
                that.graph.originX = p[0];
                that.graph.originY = p[1];
                d3.select(".selection").attr("x", that.graph.originX).attr("y", that.graph.originY).attr("width", 0).attr("height", 0);
            })
            .on("end", function () {

                let startTime = that.graph.x.invert(Number(d3.select(".selection").attr("x")));
                let endTime = that.graph.x.invert(Number(d3.select(".selection").attr("x")) + Number(d3.select(".selection").attr("width")));
                let minTime = that.graph.y.invert(Number(d3.select(".selection").attr("y")) + Number(d3.select(".selection").attr("height")));
                let maxTime = that.graph.y.invert(Number(d3.select(".selection").attr("y")));

                if (maxTime >= that.state.elapsed) {
                    maxTime = Infinity;
                }

                that.setState({
                    selection: {
                        x1: startTime.getTime(),
                        x2: endTime.getTime(),
                        y1: minTime,
                        y2: maxTime
                    }
                });

                setTimeout(() => {
                    d3.select(".selection").attr("x", 0).attr("y", 0).attr("width", 0).attr("height", 0);
                }, 100)
            });

        canvas.call(dragBehavior);

        // 브러쉬 (XLOG)
        this.graph.normalBrush = document.createElement("canvas");
        this.graph.normalBrush.width = this.props.config.xlog.normal.rows;
        this.graph.normalBrush.height = this.props.config.xlog.normal.columns;
        let normalContext = this.graph.normalBrush.getContext("2d");

        normalContext.globalAlpha = 0.6;
        for (let i = 0; i < this.props.config.xlog.normal.rows; i++) {
            for (let j = 0; j < this.props.config.xlog.normal.columns; j++) {
                if (this.props.config.xlog.normal.fills["D_" + i + "_" + j] && this.props.config.xlog.normal.fills["D_" + i + "_" + j].color !== "transparent") {
                    normalContext.fillStyle = this.props.config.xlog.normal.fills["D_" + i + "_" + j].color;
                    normalContext.fillRect(i, j, 1, 1);
                }
            }
        }

        this.graph.errorBrush = document.createElement("canvas");
        this.graph.errorBrush.width = this.props.config.xlog.error.rows;
        this.graph.errorBrush.height = this.props.config.xlog.error.columns;
        let errorContext = this.graph.errorBrush.getContext("2d");

        errorContext.globalAlpha = 0.6;
        for (let i = 0; i < this.props.config.xlog.error.rows; i++) {
            for (let j = 0; j < this.props.config.xlog.error.columns; j++) {
                if (this.props.config.xlog.error.fills["D_" + i + "_" + j] && this.props.config.xlog.error.fills["D_" + i + "_" + j].color !== "transparent") {
                    errorContext.fillStyle = this.props.config.xlog.error.fills["D_" + i + "_" + j].color;
                    errorContext.fillRect(i, j, 1, 1);
                }
            }
        }

        this.redraw();
    };

    shouldComponentUpdate() {
        return true;
    }

    axisUp = (e) => {
        this.setState({
            elapsed: this.state.elapsed * 2
        });
    };

    axisDown = () => {
        this.setState({
            elapsed: this.state.elapsed / 2
        });
    };

    stopProgation = (e) => {
        e.stopPropagation();
    };

    render() {
        return (
            <div className="xlog-viewer" ref="xlogViewer" onTouchStart={this.stopProgation}
                 onMouseDown={this.stopProgation}>
                <div></div>
                <div className="axis-button axis-up" onClick={this.axisUp} onMouseDown={this.stopProgation}><i
                    className="fa fa-angle-up" aria-hidden="true"></i></div>
                <div className="axis-button axis-down" onClick={this.axisDown} onMouseDown={this.stopProgation}><i
                    className="fa fa-angle-down" aria-hidden="true"></i></div>
                <Profiler selection={this.state.selection} xlogs={this.props.data.xlogs}/>
            </div>
        );
    }
}


export default XLog;
