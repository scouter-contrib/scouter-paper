import React, {Component} from 'react';
import './XLogViewer.css';
import {connect} from 'react-redux';
import {clearAllMessage, setControlVisibility} from '../../actions';
import * as d3 from "d3";

class XLogViewer extends Component {

    graph = {
        margin: {
            top: 20, right: 10, bottom: 30, left: 40
        },
        x: null,
        y: null,
        width: null,
        height: null,
        brudh: null,
        timeFormat: "%H:%M",
        timeAxisTick: d3.timeMinute.every(2),
        timeGridTick: d3.timeMinute.every(1),
        elapsedTicks: 10,
        last: 0
    };





    shouldComponentUpdate(nextProps, nextState) {
        console.log(3333);
        return true;
    }

    componentWillReceiveProps(nextProps){
        console.log("componentWillReceiveProps: " + JSON.stringify(nextProps));
    }

    componentDidMount() {
        this.graphInit();
    }

    componentDidUpdate(prevProps, prevState) {


        console.log(1);
        // 시간이 변경되는 경우, 축 및 축 그리드 변경
        if (this.props.data.startTime !== prevProps.data.startTime || this.props.data.endTime !== prevProps.data.endTime) {
            this.moveCanvas();
            this.updateXAxis();
        }

        // 최대 값이 변경되는 경우, 축 및 그리드 변경
        if (this.props.data.maxElapsed !== prevProps.data.maxElapsed) {
            this.updateYAxis();
        }

        console.log(2);
        this.draw(this.props.data.xlogs);
    }

    draw = (xlogs) => {

        console.log(xlogs);

        if (this.refs.xlogViewer && xlogs) {
            let context = d3.select(this.refs.xlogViewer).select("canvas").node().getContext("2d");
            let gabX = Math.floor(this.graph.brush.width / 2);
            let gabY = Math.floor(this.graph.brush.height / 2);
            xlogs.forEach((d, i) => {
                let x = this.graph.x(d.endTime);
                let y = this.graph.y(d.elapsed);

                if (y < 0) {
                    y = 0;
                }

                if (x > 0) {
                    context.drawImage(this.graph.brush, x - gabX, y - gabY, this.graph.brush.width, this.graph.brush.height);
                }
            });
        }
    };

    graphInit = () => {
        this.graph.width = this.refs.xlogViewer.offsetWidth - this.graph.margin.left - this.graph.margin.right;
        this.graph.height = this.refs.xlogViewer.offsetHeight - this.graph.margin.top - this.graph.margin.bottom;

        let svg = d3.select(this.refs.xlogViewer).append("svg").attr("width", this.graph.width + this.graph.margin.left + this.graph.margin.right).attr("height", this.graph.height + this.graph.margin.top + this.graph.margin.bottom).append("g").attr("transform", "translate(" + this.graph.margin.left + "," + this.graph.margin.top + ")");

        this.graph.x = d3.scaleTime().range([0, this.graph.width]).domain([this.props.startTime, this.props.endTime]);
        this.graph.y = d3.scaleLinear().range([this.graph.height, 0]).domain([0, this.props.maxElapsed]);

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
        var div = d3.select(this.refs.xlogViewer).append("div").style('position', 'absolute').style('top', '0px').style('left', '0px');
        div.append('canvas').attr('height', this.graph.height).attr('width', this.graph.width + 20).style('position', 'absolute').style('top', this.graph.margin.top + 'px').style('left', this.graph.margin.left + 'px');

        // 브러쉬 (XLOG)
        this.graph.brush = document.createElement("canvas");
        this.graph.brush.width = 5;
        this.graph.brush.height = 5;
        let context = this.graph.brush.getContext("2d");
        context.globalAlpha = 0.6;
        for (let i = 0; i < 5; i++) {
            context.fillRect(i, i, 1, 1);
            context.fillRect((4 - i), i, 1, 1);
        }
    };

    updateXAxis = () => {
        let svg = d3.select(this.refs.xlogViewer).select("svg");
        this.graph.x.domain([this.props.startTime, this.props.endTime]);
        svg.select(".axis-x").transition().duration(500).call(d3.axisBottom(this.graph.x).tickFormat(d3.timeFormat(this.graph.timeFormat)).ticks(this.graph.timeAxisTick));
        svg.select(".grid-x").transition().duration(500).call(d3.axisBottom(this.graph.x).tickSize(-this.graph.height).tickFormat("").ticks(this.graph.timeGridTick));
    };

    updateYAxis = () => {
        let svg = d3.select(this.refs.xlogViewer).select("svg");
        this.graph.y.domain([0, this.props.maxElapsed]);
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

    render() {
        console.log(3);
        return (
            <div className="xlog-viewer" ref="xlogViewer"></div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        instances: state.target.instances
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        setControlVisibility: (name, value) => dispatch(setControlVisibility(name, value)),
        clearAllMessage: () => dispatch(clearAllMessage())
    };
};

XLogViewer = connect(mapStateToProps, mapDispatchToProps)(XLogViewer);

export default XLogViewer;