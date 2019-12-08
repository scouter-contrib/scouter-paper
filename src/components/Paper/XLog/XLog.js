import React, {Component} from 'react';
import './XLog.css';
import * as d3 from "d3";

import XLogPreviewer from "./XLogPreviewer/XLogPreviewer";
import * as common from "../../../common/common";

import {connect} from 'react-redux';
import {setSelection, setTimeFocus} from '../../../actions';
import {withRouter} from 'react-router-dom';
import InstanceColor from "../../../common/InstanceColor";

const XLOG_ELAPSED = 'xlogElapsed';

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
        originY: null,
        preview: {
            width: 100
        },
        opacity : 0.3
    };

    lastStartTime = null;
    lastEndTime = null;
    lastPastTimestamp = null;
    lastPageCnt = null;
    lastClearTimestamp = null;
    errorCount = 0;
    callCount = 0;

    constructor(props) {
        super(props);

        this.state = {
            elapsed: this.props.data.paramMaxElapsed ? Number(this.props.data.paramMaxElapsed) : common.getLocalSettingData(XLOG_ELAPSED, 8000)
        }
    }

    resize = () => {
        this.graphResize();

    };

    componentWillReceiveProps(nextProps) {
        if (this.props.layoutChangeTime !== nextProps.layoutChangeTime) {
            this.graphResize();
        }
        if(!nextProps.timeFocus.keep) {
            this.drawTimeFocus();
        }
        if(!nextProps.timeFocus.active) {
            this.removeFocus(nextProps);
        }

    }

    shouldComponentUpdate(nextProps, nextState) {
        if(!this.props.visible) {
            return false;
        }

        if (this.lastStartTime !== this.props.data.startTime || this.lastEndTime !== this.props.data.endTime) {
            return true;
        }

        if (this.lastPastTimestamp !== nextProps.pastTimestamp) {
            return true;
        }

        if (this.lastPastTimestamp === nextProps.pastTimestamp && this.lastPageCnt !== nextProps.pageCnt) {
            return true;
        }

        if (this.state.elapsed !== nextState.elapsed) {
            return true;
        }

        if (this.props.longTerm !== nextProps.longTerm) {
            return true;
        }

        if (this.props.xlogHistoryDoing !== nextProps.xlogHistoryDoing) {
            return true;
        }
        
        if (nextProps.filter && JSON.stringify(nextProps.filter) !== JSON.stringify(this.props.filter)) {
            return true;
        }

        if (nextProps.filterMap && JSON.stringify(nextProps.filterMap) !== JSON.stringify(this.props.filterMap)) {
            return true;
        }
        if( nextProps.box.values.showClassicMode !== this.beforeShowClassicModeMode){

            return true;
        }
        return false;
    }

    componentDidMount() {
        if (this.props.config.colorType === "white") {
            this.graph.opacity = 0.3;
        } else {
            this.graph.opacity = 0.6;
        }
        this.graph.timeFormat = this.props.config.minuteFormat;
        this.graphInit();
    }

    componentDidUpdate = (prevProps, prevState) => {

        this.resize();
        this.countXLogData();
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

        // 과거 데이터가 조회되거나, 실시간으로 변한 경우, 전체 지우고 다시 그리기
        if (this.lastClearTimestamp !== this.props.data.clearTimestamp) {
            this.lastClearTimestamp = this.props.data.clearTimestamp;
            this.clear();
        }

        if (this.lastPastTimestamp !== this.props.pastTimestamp) {
            this.lastPastTimestamp = this.props.pastTimestamp;
            this.clear();
            this.redraw(this.props.filter);

        } else if (this.lastPastTimestamp === this.props.pastTimestamp && this.lastPageCnt !== this.props.pageCnt) {
            this.lastPageCnt = this.props.pageCnt;
            this.draw(this.props.data.newXLogs, this.props.filter);
        } else{
            this.draw(this.props.data.newXLogs, this.props.filter);
        }

        if (this.props.filter && JSON.stringify(prevProps.filter) !== JSON.stringify(this.props.filter)) {
            this.clear();
            this.redraw(this.props.filter);
        }

        if (this.props.filterMap && JSON.stringify(prevProps.filterMap) !== JSON.stringify(this.props.filterMap)) {
            this.clear();
            this.redraw(this.props.filter);
        }

        if( this.props.box.values.showClassicMode !== this.beforeShowClassicModeMode){
            this.graphInit();
            this.redraw(this.props.filter);
        }
        this.beforeShowClassicModeMode = prevProps.box.values.showClassicMode;



    };

    countXLogData = () => {
        this.errorCount = 0;
        this.callCount = 0;
        let datas = common.getFilteredData(this.props.data.xlogs, this.props.filter);
        datas.forEach((d, i) => {
            if(!this.props.filterMap[d.objHash]){
                return;
            }
            let x = this.graph.x(d.endTime);
            if (Number(d.error)) {
                if (x < 0) this.errorCount--;
                else this.errorCount++;
            } else {
                if (x < 0) this.callCount--;
                else this.callCount++;
            }
        });
    };
    resizeTimer = null;
    graphResize = () => {
        if (this.resizeTimer) {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = null;
        }

        this.resizeTimer = setTimeout(() => {
            if (this.refs.xlogViewer) {
                let box = this.refs.xlogViewer.parentNode.parentNode.parentNode;

                let currentWidth = 0;
                if (this.props.box.values.showPreview === "Y") {
                    currentWidth = box.offsetWidth - this.graph.margin.left - this.graph.preview.width;
                } else {
                    currentWidth = box.offsetWidth - this.graph.margin.left - this.graph.margin.right;
                }

                if ((currentWidth !== this.graph.width) || (this.graph.height !== box.offsetHeight - this.graph.margin.top - this.graph.margin.bottom - 27)) {
                    this.graphInit();
                }
            }
        }, 100);
    };
    removeFocus(nextProps){
        if(nextProps.timeFocus.id !== this.props.box.key) {
            this.graph.focus.select("line.focus-line").remove();
        }
    }
    drawTimeFocus = (isFixed = false) => {

        const xfuc = (d) => {
            const x = this.graph.x(d);
            if(x < 0){
                return 0;
            }
            if(x > this.graph.width){
                return this.graph.width;
            }
            return x;
        };
        if( isFixed && !this.state.noData){
            let hoverLine = this.graph.focus.selectAll("line.focus-line");
            hoverLine.attr("x1",xfuc)
                .attr("x2",xfuc);

            hoverLine.data([this.props.timeFocus.time])
                .enter()
                .append("line")
                .attr("class", "focus-line focus-hover-line")
                .attr("y1", 0)
                .attr("y2", this.graph.height)
                .attr("x1",xfuc)
                .attr("x2",xfuc)
                .exit()
                .remove();

        } else if( !this.state.noData && this.props.timeFocus.id && this.props.timeFocus.id !== this.props.box.key) {
            let hoverLine = this.graph.focus.selectAll("line.focus-line");
            hoverLine.attr("x1",xfuc)
                .attr("x2",xfuc);

            hoverLine.data([this.props.timeFocus.time])
                .enter()
                .append("line")
                .attr("class", "focus-line focus-hover-line")
                .attr("y1", 0)
                .attr("y2", this.graph.height)
                .attr("x1",xfuc)
                .attr("x2",xfuc)
                .exit()
                .remove();

        }else{
            this.graph.focus.select("line.focus-line").remove();
        }

    };

    draw = async (xlogs, filter) => {
        if(this.props.timeFocus.keep) {
            this.drawTimeFocus(true);
        }
        if (this.refs.xlogViewer && xlogs) {
            let context = d3.select(this.refs.xlogViewer).select("canvas").node().getContext("2d");
            let datas = await common.getFilteredData0(xlogs, filter, this.props);
            if(this.isClassMode()){
                datas.forEach(d => {
                    if (!this.props.filterMap[d.objHash]) {
                        return;
                    }
                    let x = this.graph.x(d.endTime);
                    let dy = this.graph.dy(d.elapsed);
                    if (dy < 0) {
                        dy = 3;
                    }
                    if (x > 0) {
                        let xtype = Number(d.xtype);
                        let viewType = 1;
                        // const asyncXLog = xtype >= 2 && xtype <= 4; //@see scouter.lang.pack.XLogTypes.class (scouter.common)
                        switch(xtype){
                            case 2:
                            case 3:
                            case 4:
                                viewType = 2;
                                if(Number(d.error)){
                                  viewType = 4;
                                }
                                break;
                            default :
                                if(Number(d.error)){
                                  viewType = 3;
                                }
                        }
                        switch (viewType) {
                            case 4:
                                // async+error
                                context.drawImage(this.graph.asyncBrush, x - this.graph.clazzBrush.gabX, dy - this.graph.clazzBrush.gabY, this.graph.clazzBrush.width, this.graph.clazzBrush.height);
                                break;
                            case 3:
                                // error
                                context.drawImage(this.graph.errorBrush, x - this.graph.clazzBrush.gabX, dy - this.graph.clazzBrush.gabY, this.graph.clazzBrush.width, this.graph.clazzBrush.height);
                                break;
                            case 2:
                                // async
                                context.drawImage(this.graph.normalBrush, x - this.graph.clazzBrush.gabX, dy - this.graph.clazzBrush.gabY, this.graph.clazzBrush.width, this.graph.clazzBrush.height);
                                break;
                            default :
                                // normal
                                if(this._objBrush[d.objHash]) {
                                    context.drawImage(this._objBrush[d.objHash], x - this.graph.clazzBrush.gabX, dy - this.graph.clazzBrush.gabY, this.graph.clazzBrush.width, this.graph.clazzBrush.height);
                                }else{
                                    console.log('warning..');
                                }
                                break;
                        }
                    }
                })

            }else{
                datas.forEach((d, i) => {
                    if (!this.props.filterMap[d.objHash]) {
                        return;
                    }
                    let x = this.graph.x(d.endTime);
                    if (x > 0) {
                        let y = this.graph.y(d.elapsed);
                        if (y < 0) {
                            y = 0;
                        }
                        if (Number(d.error)) {
                            context.drawImage(this.graph.errorBrush, x - this.graph.errorBrush.gabX, y - this.graph.errorBrush.gabY, this.graph.errorBrush.width, this.graph.errorBrush.height);
                        } else {
                            const xtype = Number(d.xtype);
                            const asyncXLog = xtype >= 2 && xtype <= 4; //@see scouter.lang.pack.XLogTypes.class (scouter.common)
                            if (asyncXLog) {
                                context.drawImage(this.graph.asyncBrush, x - this.graph.asyncBrush.gabX, y - this.graph.asyncBrush.gabY, this.graph.asyncBrush.width, this.graph.asyncBrush.height);
                            } else {
                                context.drawImage(this.graph.normalBrush, x - this.graph.normalBrush.gabX, y - this.graph.normalBrush.gabY, this.graph.normalBrush.width, this.graph.normalBrush.height);
                            }
                        }
                    }
                });

            }

            d3.select(this.refs.xlogViewer).select(".text-right").html(()=>`<p>Total : ${this.callCount} (<span class="text-error">${this.errorCount}</span>)</p>`);

        }
    };
    classBrushEmptyFill(ctx,alpha){
        // 나머지 white 로 변경
        const backGroundColor = this.props.config.colorType === 'white' ? '255,255,255' : '0,0,0' ;
        ctx.fillStyle=`rgba(${backGroundColor},${alpha})`;
        ctx.fillRect(1,0,1,1);
        ctx.fillStyle=`rgba(${backGroundColor},${alpha})`;
        ctx.fillRect(4,1,1,1);
        ctx.fillStyle=`rgba(${backGroundColor},${alpha})`;
        ctx.fillRect(0,3,1,1);
        ctx.fillStyle=`rgba(${backGroundColor},${alpha})`;
        ctx.fillRect(3,4,1,1);
    }
    classBrush=(brush,hash, state='normal',isAysnc=false) =>{

        const ctx = brush.getContext('2d');
        // 전체 사각형 그리기
        switch(state) {
            case 'async':
                ctx.fillStyle='#BBBBBB';
                ctx.fillRect(0,0,5,5);
                this.classBrushEmptyFill(ctx,1);
                break;
            case 'error':
                if(isAysnc) {
                    ctx.fillStyle = `#F2B8B8`;
                }else{
                    ctx.fillStyle = `#E33733`;
                }
                ctx.fillRect(0,0,5,5);
                this.classBrushEmptyFill(ctx,1);
                break;
            default :
                ctx.fillStyle = this.getColor(hash);
                ctx.fillRect(0,0,5,5);
                this.classBrushEmptyFill(ctx,1);
                break;
        }
    };


    getColor=(hash)=>{
        return InstanceColor.getXlogColors()[hash];
    };

    updateXAxis = (clear) => {

        let svg = d3.select(this.refs.xlogViewer).select("svg");
        this.graph.x.domain([this.props.data.startTime, this.props.data.endTime]);
        let xAxisCount = Math.floor(this.graph.width / this.graph.xAxisWidth);
        if (xAxisCount < 1) {
            xAxisCount = 1;
        }
        svg.select(".axis-x").call(d3.axisBottom(this.graph.x).tickFormat(d3.timeFormat(this.isClassMode() ? this.props.config.timeFormat : this.graph.timeFormat)).ticks(xAxisCount));
        svg.select(".grid-x").call(d3.axisBottom(this.graph.x).tickSize(-this.graph.height).tickFormat("").ticks(xAxisCount));

        if (clear) {
            this.clear();
            this.redraw(this.props.filter);
        }
    };

    clear = () => {
        if (this.refs.xlogViewer && this.graph._tempCanvas) {
            let canvas = d3.select(this.refs.xlogViewer).select("canvas").node();
            let context = canvas.getContext("2d");

            this.graph._tempCanvas.width = canvas.width;
            this.graph._tempCanvas.height = canvas.height;

            let tempContext = this.graph._tempCanvas.getContext("2d");
            this.graph.last = 0;

            tempContext.clearRect(0, 0, canvas.width, canvas.height);
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    redraw = (filter) => {
        this.draw(this.props.data.xlogs, filter);
    };

    updateYAxis = (clear) => {

        let yAxisCount = Math.floor(this.graph.height / this.graph.yAxisHeight);
        if (yAxisCount < 1) {
            yAxisCount = 1;
        }

        let svg = d3.select(this.refs.xlogViewer).select("svg");

        this.graph.y.domain([0, this.state.elapsed]);
        this.graph.dy.domain([0, this.state.elapsed]);


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
            this.redraw(this.props.filter);
        }
    };

    moveCanvas = () => {

        if(!this.refs.xlogViewer){
            return;
        }

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
    isClassMode =()=>{
        return this.props.config.others.xlogClassicMode === "Y" || this.props.box.values.showClassicMode === "Y";
    };
    graphInit = () => {
        let that = this;
        let box = this.refs.xlogViewer.parentNode.parentNode.parentNode;
        if (this.props.box.values.showPreview === "Y") {
            this.graph.width = box.offsetWidth - this.graph.margin.left - this.graph.preview.width;
        } else {
            this.graph.width = box.offsetWidth - this.graph.margin.left - this.graph.margin.right;
        }

        this.graph.height = box.offsetHeight - this.graph.margin.top - this.graph.margin.bottom - 27;

        let svg = d3.select(this.refs.xlogViewer).select("svg");
        if (svg.size() > 0) {
            svg.remove();
        }
        svg = d3.select(this.refs.xlogViewer).append("svg").attr("width", this.graph.width + this.graph.margin.left + this.graph.margin.right).attr("height", this.graph.height + this.graph.margin.top + this.graph.margin.bottom).append("g").attr("class", "top-group").attr("transform", "translate(" + this.graph.margin.left + "," + this.graph.margin.top + ")");

        this.graph.x = d3.scaleTime().range([0, this.graph.width]).domain([this.props.data.startTime, this.props.data.endTime]);
        if (this.state.elapsed) {
            this.graph.y = d3.scaleLinear().range([this.graph.height, 0]).domain([0, this.state.elapsed]);
            this.graph.dy = d3.scaleLinear().range([this.graph.height-3, 0]).domain([0, this.state.elapsed]);
        } else {
            this.graph.y = d3.scaleLinear().range([this.graph.height, 0]).domain([0, this.props.data.maxElapsed]);
            this.graph.dy = d3.scaleLinear().range([this.graph.height-3, 0]).domain([0, this.props.data.maxElapsed]);
        }

        // X축 단위 그리기
        let xAxisCount = Math.floor(this.graph.width / this.graph.xAxisWidth);
        if (xAxisCount < 1) {
            xAxisCount = 1;
        }
        svg.append("g").attr("class", "axis-x").attr("transform", "translate(0," + this.graph.height + ")").call(d3.axisBottom(this.graph.x).tickFormat(d3.timeFormat(this.isClassMode() ? this.props.config.timeFormat : this.graph.timeFormat)).ticks(xAxisCount));
        // Y축 단위 그리기
        let yAxisCount = Math.floor(this.graph.height / this.graph.yAxisHeight);
        if (yAxisCount < 1) {
            yAxisCount = 1;
        }

        svg.append("g").attr("class", "axis-y").call(d3.axisLeft(this.graph.y).tickFormat(function (e) {
            if (that.state && that.state.elapsed < 1000) {
                return (e / 1000).toFixed(2) + "s";
            } else {
                return (e / 1000).toFixed(1) + "s";
            }

        }).ticks(yAxisCount));

        // X축 단위 그리드 그리기
        svg.append("g").attr("class", "grid-x").style("stroke-dasharray", "5 2").style("opacity", this.graph.opacity).attr("transform", "translate(0," + this.graph.height + ")").call(d3.axisBottom(this.graph.x).tickSize(-this.graph.height).tickFormat("").ticks(xAxisCount));

        // Y축 단위 그리드 그리기
        svg.append("g").attr("class", "grid-y").style("stroke-dasharray", "5 2").style("opacity", this.graph.opacity).call(d3.axisLeft(this.graph.y).tickSize(-this.graph.width).tickFormat("").ticks(yAxisCount));


        this.graph.focus = svg.append("g").attr("class", "tooltip-focus");

        // 캔버스 그리기
        let canvasDiv = d3.select(this.refs.xlogViewer).select(".canvas-div");
        if (canvasDiv.size() > 0) {
            canvasDiv.remove();
        }
        canvasDiv = d3.select(this.refs.xlogViewer).append("div").attr("class", "canvas-div").style('position', 'absolute').style('top', '0px').style('left', '0px');


        let canvas = canvasDiv.append('canvas').attr('height', this.graph.height).attr('width', this.graph.width + 20).style('position', 'absolute').style('top', this.graph.margin.top + 'px').style('left', this.graph.margin.left + 'px');


        d3.select(this.refs.xlogViewer).select(".canvas-div")
            .on('mousemove',function() {

                    let xPos = d3.mouse(this)[0];
                    const x0 = that.graph.x.invert(xPos - that.graph.margin.left);
                    let hoverLine = that.graph.focus.selectAll("line.x-hover-line");

                    hoverLine.attr("x1", (d) => that.graph.x(d))
                        .attr("x2", (d) => that.graph.x(d));

                    hoverLine.data([x0])
                        .enter()
                        .append("line")
                        .attr("class", "x-hover-line hover-line")
                        .attr("y1", 0)
                        .attr("y2", that.graph.height)
                        .attr("x1", (d) => {
                            return that.graph.x(d);
                        })
                        .attr("x2", (d) => that.graph.x(d))
                        .exit()
                        .remove();
                if(!that.props.timeFocus.keep) {
                    that.props.setTimeFocus(true, x0.getTime(), that.props.box.key);
                }
            })
            .on('mouseout',() =>{
                this.graph.focus.select("line.x-hover-line").remove();
                if(!this.props.timeFocus.keep) {
                    this.props.setTimeFocus(false, null, that.props.box.key);
                }
            })
            .on('dblclick',()=>{
                if(!this.props.timeFocus.keep) {
                    this.graph.focus.select("line.x-hover-line").remove();
                }

                this.props.setTimeFocus(
                    this.props.timeFocus.active,
                    this.props.timeFocus.time,
                    this.props.timeFocus.id,
                    !this.props.timeFocus.keep
                );

            });

        // 드래그 셀렉트
        svg.append("g").append("rect").attr("class", "selection").attr("opacity", 0.2);

        let dragBehavior = d3.drag()
            .on("drag", function () {
                let p = d3.mouse(this);
                let x = p[0] < that.graph.originX ? p[0] : that.graph.originX;
                let y = p[1] < that.graph.originY ? p[1] : that.graph.originY;

                // 가로가 그래프 범위 안에 있도록
                x = x > 0 ? x : 0;
                let width = 0;
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
                let height = 0;
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
                let p = d3.mouse(this);
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

                that.props.setSelection({
                    x1: startTime.getTime(),
                    x2: endTime.getTime(),
                    y1: minTime,
                    y2: maxTime,
                    filter : that.props.filter
                });

                setTimeout(() => {
                    d3.select(".selection").attr("x", 0).attr("y", 0).attr("width", 0).attr("height", 0);
                }, 100)
            });

        canvas.call(dragBehavior);


        // 브러쉬 (XLOG)

        this.graph.clazzBrush = document.createElement("canvas");
        this.graph.clazzBrush.width = this.props.config.xlog.classicMode.columns;
        this.graph.clazzBrush.height = this.props.config.xlog.classicMode.rows;
        this.graph.clazzBrush.gabX = Math.floor(this.graph.clazzBrush.width /2);
        this.graph.clazzBrush.gabY = Math.floor(this.graph.clazzBrush.height/2);

        this.graph.normalBrush = document.createElement("canvas");
        this.graph.normalBrush.width = this.props.config.xlog.normal.columns;
        this.graph.normalBrush.height = this.props.config.xlog.normal.rows;
        this.graph.normalBrush.gabX = Math.floor(this.graph.normalBrush.width /2);
        this.graph.normalBrush.gabY = Math.floor(this.graph.normalBrush.height/2);
        this.graph.normalBrush.gabMin = Math.floor(this.graph.normalBrush.height);

        if(!this.isClassMode()) {
            let normalContext = this.graph.normalBrush.getContext("2d");
            normalContext.globalAlpha = Number(this.props.config.xlog.normal.opacity);
            for (let i = 0; i < this.props.config.xlog.normal.rows; i++) {
                for (let j = 0; j < this.props.config.xlog.normal.columns; j++) {
                    if (this.props.config.xlog.normal.fills["D_" + i + "_" + j] && this.props.config.xlog.normal.fills["D_" + i + "_" + j].color !== "transparent") {
                        normalContext.fillStyle = this.props.config.xlog.normal.fills["D_" + i + "_" + j].color;
                        normalContext.fillRect(j, i, 1, 1);
                    }
                }
            }
        }else{
            this.classBrush(this.graph.normalBrush,"", 'async');
        }

        this.graph.asyncBrush = document.createElement("canvas");
        this.graph.asyncBrush.width = this.props.config.xlog.async.columns;
        this.graph.asyncBrush.height = this.props.config.xlog.async.rows;
        this.graph.asyncBrush.gabX = Math.floor(this.graph.asyncBrush.width / 2);
        this.graph.asyncBrush.gabY = Math.floor(this.graph.asyncBrush.height/ 2);

        if(!this.isClassMode()) {
            let asyncContext = this.graph.asyncBrush.getContext("2d");

            asyncContext.globalAlpha = Number(this.props.config.xlog.async.opacity);
            for (let i = 0; i < this.props.config.xlog.async.rows; i++) {
                for (let j = 0; j < this.props.config.xlog.async.columns; j++) {
                    if (this.props.config.xlog.async.fills["D_" + i + "_" + j] && this.props.config.xlog.async.fills["D_" + i + "_" + j].color !== "transparent") {
                        asyncContext.fillStyle = this.props.config.xlog.async.fills["D_" + i + "_" + j].color;
                        asyncContext.fillRect(j, i, 1, 1);
                    }
                }
            }
        }else{
            this.classBrush(this.graph.asyncBrush,"", 'error',true);
        }

        this.graph.errorBrush = document.createElement("canvas");
        this.graph.errorBrush.height = this.props.config.xlog.error.rows;
        this.graph.errorBrush.width = this.props.config.xlog.error.columns;
        this.graph.errorBrush.gabX = Math.floor(this.graph.errorBrush.width / 2);
        this.graph.errorBrush.gabY = Math.floor(this.graph.errorBrush.height/ 2);

        if(!this.isClassMode()) {
            let errorContext = this.graph.errorBrush.getContext("2d");

            errorContext.globalAlpha = Number(this.props.config.xlog.error.opacity);
            for (let i = 0; i < this.props.config.xlog.error.rows; i++) {
                for (let j = 0; j < this.props.config.xlog.error.columns; j++) {
                    if (this.props.config.xlog.error.fills["D_" + i + "_" + j] && this.props.config.xlog.error.fills["D_" + i + "_" + j].color !== "transparent") {
                        errorContext.fillStyle = this.props.config.xlog.error.fills["D_" + i + "_" + j].color;
                        errorContext.fillRect(j, i, 1, 1);
                    }
                }
            }
        }else{
            this.graph.errorBrush.width = this.props.config.xlog.classicMode.columns;
            this.graph.errorBrush.height = this.props.config.xlog.classicMode.rows;
            this.classBrush(this.graph.errorBrush,"", 'error',false);
        }
        if(this.isClassMode()){
            this._objBrush = [];
            this.props.objects.filter(_d => _d.objFamily === 'javaee' || _d.objFamily === 'tracing')
                .forEach(_d =>{
                    const objBrush= document.createElement("canvas");
                    objBrush.width = this.props.config.xlog.classicMode.columns;
                    objBrush.height = this.props.config.xlog.classicMode.rows;
                    this.classBrush(objBrush, _d.objHash);
                    this._objBrush[_d.objHash] = objBrush;
                })
        }

        this.redraw(this.props.filter);
    };

    axisUp = (e) => {
        const yValue = this.state.elapsed >= 3000 ? this.state.elapsed * 1.3 : this.state.elapsed * 1.7;
        common.setLocalSettingData(XLOG_ELAPSED, yValue);
        this.setState({
            elapsed: yValue
        });
        this.updateURLSearchParams('xlogElapsedTime', yValue);
    };

    axisDown = () => {
        const yValue = this.state.elapsed >= 3000 ? this.state.elapsed / 1.3 : this.state.elapsed / 1.7;
        common.setLocalSettingData(XLOG_ELAPSED, yValue);
        this.setState({
            elapsed: yValue
        });
        this.updateURLSearchParams('xlogElapsedTime', yValue);
    };

    updateURLSearchParams = (name, value) => {
        let search = new URLSearchParams(this.props.location.search);
        search.set(name, value);
        this.props.history.replace({
            pathname: this.props.location.pathname,
            search: "?" + search.toString()
        });
    };

    stopPropagation = (e) => {
        e.stopPropagation();
    };

    render() {
        return (
            <div className="xlog-viewer" ref="xlogViewer" onTouchStart={this.stopPropagation} onMouseDown={this.stopPropagation}>
                {(this.props.longTerm) && <div className="no-longterm-support"><div><div>LONGTERM NOT SUPPORTED</div></div></div>}
                {(this.props.xlogNotSupportedInRange) && <div className="no-longterm-support"><div><div>XLOG NOT SUPPORTED in this range</div></div></div>}
                {this.props.xlogHistoryDoing &&
                <div className="xlog-history-stop-control">
                    <div>
                        <div>{this.props.xlogHistoryRequestCnt} REQUESTED</div>
                        <div className="stop-btn" onClick={this.props.setStopXlogHistory}><i className="fa fa-stop-circle" aria-hidden="true"></i></div>
                    </div>
                </div>
                }
                <div>
                    <div className="axis-button axis-up noselect" onClick={this.axisUp} onMouseDown={this.stopPropagation}>+</div>
                    <div className="text-right"></div>
                </div>
                <div className="axis-button axis-down noselect" onClick={this.axisDown} onMouseDown={this.stopPropagation}>-</div>
                {this.props.box.values.showPreview === "Y" &&
                <XLogPreviewer secondStepTimestamp={this.props.data.secondStepTimestamp} secondStepXlogs={this.props.data.secondStepXlogs} width={this.graph.preview.width} margin={this.graph.margin} maxElapsed={this.state.elapsed}/>
                }
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        config: state.config,
        user: state.user,
        filterMap: state.target.filterMap,
        objects : state.target.objects,
        timeFocus: state.timeFocus,
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        setSelection: (selection) => dispatch(setSelection(selection)),
        setTimeFocus: (active, time, boxKey,keep) => dispatch(setTimeFocus(active, time, boxKey,keep))
    };
};

XLog = connect(mapStateToProps, mapDispatchToProps)(XLog);
export default withRouter(XLog);
