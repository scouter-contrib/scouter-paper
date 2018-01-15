import React, {Component} from 'react';
import './XLog.css';
import * as d3 from "d3";


class XLog extends Component {

    graph = {
        margin: {
            top: 20, right: 20, bottom: 30, left: 40
        },
        x: null,
        y: null,
        width: null,
        height: null,
        brush: null,
        timeFormat: "%H:%M",
        timeAxisTick: d3.timeMinute.every(2),
        timeGridTick: d3.timeMinute.every(1),
        elapsedTicks: 10,
        last: 0
    };

    lastStartTime = null;
    lastEndTime = null;
    lastMaxElapsed = null;

    constructor(props) {
        super(props);
    }

    resize = () => {


        this.graphResize();


    };

    componentDidMount() {


        this.graphInit();


    }

    componentDidUpdate = (prevProps, prevState) => {
        this.resize();
        //console.log(this.refs.xlogViewer.offsetHeight);

        // 시간이 변경되는 경우, 축 및 축 그리드 변경
        if (this.lastStartTime !== this.props.data.startTime || this.lastEndTime !== this.props.data.endTime) {
            this.lastStartTime = this.props.data.startTime;
            this.lastEndTime = this.props.data.endTime;
            this.moveCanvas();
            this.updateXAxis();

        }

        // 최대 값이 변경되는 경우, 축 및 그리드 변경
        if (this.lastMaxElapsed !== this.props.data.maxElapsed) {
            this.lastMaxElapsed = this.props.data.maxElapsed;
            //this.updateYAxis();
            console.log(2);
        }

        //console.log(this.props.data.xlogs);
        this.draw(this.props.data.xlogs);


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
                    context.drawImage(this.graph.normalBrush, x - gabX, y - gabY, this.graph.normalBrush.width, this.graph.normalBrush.height);
                }
            });
        }
    };

    updateXAxis = () => {
        let svg = d3.select(this.refs.xlogViewer).select("svg");
        this.graph.x.domain([this.props.data.startTime, this.props.data.endTime]);
        svg.select(".axis-x").call(d3.axisBottom(this.graph.x).tickFormat(d3.timeFormat(this.graph.timeFormat)).ticks(this.graph.timeAxisTick));
        svg.select(".grid-x").call(d3.axisBottom(this.graph.x).tickSize(-this.graph.height).tickFormat("").ticks(this.graph.timeGridTick));
    };

    updateYAxis = () => {
        let svg = d3.select(this.refs.xlogViewer).select("svg");
        this.graph.y.domain([0, this.props.data.maxElapsed]);
        svg.select(".axis-y").transition().duration(500).call(d3.axisLeft(this.graph.y).tickFormat(function (e) {
            return (e / 1000).toFixed(1) + "s";
        }).ticks(this.graph.elapsedTicks));
        svg.select(".grid-y").transition().duration(500).call(d3.axisLeft(this.graph.y).tickSize(-this.graph.width).tickFormat("").ticks(this.graph.elapsedTicks));
    };

    moveCanvas = () => {
        let canvas = d3.select(this.refs.xlogViewer).select("canvas").node();
        let context = canvas.getContext("2d");

        if (!this.graph._tempCanvas) {
            this.graph._tempCanvas = document.createElement('canvas');
            this.graph._tempCanvas.width = canvas.width;
            this.graph._tempCanvas.height = canvas.height;
        }

        let tempContext = this.graph._tempCanvas.getContext("2d");
        let moveCanvasX = this.graph.x(this.props.startTime);
        moveCanvasX += this.graph.last;
        let pixel = Math.floor(moveCanvasX);
        this.graph.last = moveCanvasX - pixel;

        tempContext.clearRect(0, 0, canvas.width, canvas.height);
        tempContext.drawImage(canvas, 0, 0, canvas.width, canvas.height);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(this.graph._tempCanvas, -pixel, 0, canvas.width, canvas.height);
    };

    graphInit = () => {

        console.log("init");

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
        svg.append("g").attr("class", "axis-x").attr("transform", "translate(0," + this.graph.height + ")").call(d3.axisBottom(this.graph.x).tickFormat(d3.timeFormat(this.graph.timeFormat)).ticks(this.graph.timeAxisTick));
        // Y축 단위 그리기
        svg.append("g").attr("class", "axis-y").call(d3.axisLeft(this.graph.y).tickFormat(function (e) {
            return (e / 1000).toFixed(1) + "s";
        }).ticks(this.graph.elapsedTicks));

        // X축 단위 그리드 그리기
        svg.append("g").attr("class", "grid-x").style("stroke-dasharray", "5 5").style("opacity", "0.3").attr("transform", "translate(0," + this.graph.height + ")").call(d3.axisBottom(this.graph.x).tickSize(-this.graph.height).tickFormat("").ticks(this.graph.timeGridTick));

        // Y축 단위 그리드 그리기
        svg.append("g").attr("class", "grid-y").style("stroke-dasharray", "5 5").style("opacity", "0.3").call(d3.axisLeft(this.graph.y).tickSize(-this.graph.width).tickFormat("").ticks(this.graph.elapsedTicks));


        // 캔버스 그리기
        let canvasDiv = d3.select(this.refs.xlogViewer).select(".canvas-div");
        if (canvasDiv.size() > 0) {
            canvasDiv.remove();
        }
        canvasDiv = d3.select(this.refs.xlogViewer).append("div").attr("class", "canvas-div").style('position', 'absolute').style('top', '0px').style('left', '0px');
        canvasDiv.append('canvas').attr('height', this.graph.height).attr('width', this.graph.width + 20).style('position', 'absolute').style('top', this.graph.margin.top + 'px').style('left', this.graph.margin.left + 'px');


        // 브러쉬 (XLOG)
        this.graph.normalBrush = document.createElement("canvas");
        this.graph.normalBrush.width = this.props.config.xlog.normal.rows;
        this.graph.normalBrush.height = this.props.config.xlog.normal.columns;
        let context = this.graph.normalBrush.getContext("2d");

        context.globalAlpha = 0.6;
        for (let i=0; i<this.props.config.xlog.normal.rows; i++) {
            for (let j=0; j<this.props.config.xlog.normal.columns; j++) {
                if (this.props.config.xlog.normal.fills["D_" + i + "_" + j] && this.props.config.xlog.normal.fills["D_" + i + "_" + j].color !== "transparent") {
                    console.log(this.props.config.xlog.normal.fills["D_" + i + "_" + j].color);
                    context.fillStyle = this.props.config.xlog.normal.fills["D_" + i + "_" + j].color;
                    context.fillRect(i, j, 1, 1);
                }
            }
        }


    };

    shouldComponentUpdate() {
        return true;
    }


    render() {

        return (
            <div className="xlog-viewer" ref="xlogViewer">

            </div>
        );
    }
}


export default XLog;
