import React,{Component} from "react";
import {
    setRangeDateHoursMinutes,
    setRealTimeRangeStepValue,
    setRealTimeValue,
    setSearchCondition,
    setTimeFocus
} from "../../../actions";
import connect from "react-redux/es/connect/connect";
import {withRouter} from "react-router-dom";
import * as d3 from "d3";
import numeral from "numeral";
import InstanceColor from "../../../common/InstanceColor";

class Line extends Component {
    state = {
        g : null,
    };
    isInit = false;
    constructor(props) {
        super(props);

    }


    componentWillReceiveProps(nextProps){
        if(!this.isInit){
            return;
        }
        if( nextProps.options !== this.props.options){
            this.changedOption(nextProps.options,nextProps);
        }
        this.paint(nextProps);
    };
    paint (data){


        if (data.objects) {
            let instanceMetricCount = {};
            for (let counterKey in data.counters) {
                let thisOption = data.box.option.filter((d) => {return d.counterKey === counterKey})[0];
                if (!thisOption) {
                    for (let i = 0; i < data.objects.length; i++) {
                        this.removeCounterLine(data.objects[i], counterKey);
                    }
                } else if(data.options.type ==='STACK AREA') {
                    // this.drawStackLine(thisOption,counterKey);
                } else {
                    for (let i = 0; i < data.objects.length; i++) {
                        const obj = data.objects[i];

                        if (obj.objFamily === thisOption.familyName) {
                            if (!instanceMetricCount[obj.objHash]) {
                                instanceMetricCount[obj.objHash] = 0;
                            }
                            let color;
                            if (data.config.graph.color === "metric") {
                                color = InstanceColor.getMetricColor(thisOption.counterKey, data.config.colorType);
                            } else {
                                color = InstanceColor.getInstanceColors(data.config.colorType)[obj.objHash][(instanceMetricCount[obj.objHash]++) % 5];
                            }
                            this.drawLine(obj, thisOption, counterKey, color,data);
                        }
                    }

                }
            }
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
    removeCounterLine(obj, counterKey) {
        let pathClass = "line-" + obj.objHash + "-" + this.replaceName(counterKey);
        let path = this.line.selectAll("path." + pathClass);

        // 라인 그래프 삭제
        if (path && path.size() > 0) {
            path.remove();
        }

        // 툴팁 그래프 삭제
        let circleKey = "circle-" + obj.objHash + "_" + this.replaceName(counterKey);
        let circle = this.focus.selectAll("circle." + circleKey);

        if (circle.size() > 0) {
            circle.remove();
        }
        // 제목 삭제
        this.props.removeTitle(counterKey);
    };

    drawLine = (obj, option, counterKey, color,data) => {
        if (this.props.box.values['chartType'] === "LINE FILL") {

            let areaClass = "area-" + obj.objHash + "-" + this.replaceName(counterKey);
            let area = this.line.selectAll("path." + areaClass)


            if (area.size() < 1) {
                area = this.line.insert("path", ":first-child").attr("class", areaClass).style("stroke", color);
            }

            let valueArea = d3.area().curve(d3[this.props.config.graph.curve])
                .x((d) =>this.xScale(d.time))
                .y0(data.options.height)
                .y1((counter) =>{
                    let objData = counter.data[obj.objHash];
                    if (objData) {
                        return this.yScale(objData.value);
                    } else {
                        return this.yScale(0);
                    }
                });


            if (data.config.graph.break === "Y") {
                valueArea.defined((d)=> {
                    let objData = d.data ? d.data[obj.objHash] : null;
                    return objData && !isNaN(d.time) && !isNaN(objData.value) && !isNaN(this.yScale(objData.value));
                })
            }


            if (!this.props.filterMap[obj.objHash]) {
                area.data([data.counters[counterKey]])
                    .attr("d", valueArea)
                    .style("fill", color)
                    .style("opacity", 0)
                    .transition()
                    .delay(100);
            } else {
                area.data([data.counters[counterKey]])
                    .attr("d", valueArea)
                    .style("fill", color)
                    .style("opacity", data.config.graph.fillOpacity)
                    .transition()
                    .delay(100);
            }
        }



        let pathClass = `line-${obj.objHash}-${this.replaceName(counterKey)}`;
        let path = this.line.selectAll("path." + pathClass);

        if (path.size() < 1) {
            path = this.line.insert("path", ":first-child").attr("class", pathClass).style("stroke", color);
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
        }

        let valueLine = d3.line().curve(d3[this.props.config.graph.curve]);

        if (this.props.config.graph.break === "Y") {
            valueLine.defined((d) => {
                let objData = d.data ? d.data[obj.objHash] : null;
                return objData && !isNaN(d.time) && !isNaN(objData.value) && !isNaN(this.yScale(objData.value));
            })
        }

        valueLine.x( (d)=> {
            return this.xScale(d.time);
        }).y((counter) => {
            let objData = counter.data[obj.objHash];
            if (objData) {
                return this.yScale(objData.value);
            } else {
                return this.yScale(0);
            }
        });

        if (!this.props.filterMap[obj.objHash]) {
            this.setAnimation(path.data([data.counters[counterKey]])).attr("d", valueLine).style("stroke-width", this.props.config.graph.width).style("opacity", 0);
        } else {
            this.setAnimation(path.data([data.counters[counterKey]])).attr("d", valueLine).style("stroke-width", this.props.config.graph.width).style("opacity", this.props.config.graph.opacity);
        }
    };
    setAnimation(svg){
        const {realTime} = this.props.range;
        return realTime ? svg : svg.transition().duration(500);
    }
    changedOption(changed,props){

        this.area_clip
            .attr("width", changed.width)
            .attr("height", changed.height);

        this.xScale = this.xScale.range([0, changed.width]);
        this.yScale = this.yScale.range([changed.height, 0]);

        this.xScale.domain([props.startTime,props.endTime]);
        this.yScale.domain([0, changed.maxY]);


        let xAxisCount = Math.floor(changed.width / changed.xAxisWidth);
        if (xAxisCount < 1) {
            xAxisCount = 1;
        }
        let yAxisCount = Math.floor(changed.height / changed.yAxisHeight);
        if (yAxisCount < 1) {
            yAxisCount = 1;
        }
// Y축
        this.tickY.ticks(yAxisCount);

        this.gridTickY.tickSize(-changed.width)
                      .ticks(yAxisCount);

        this.axisY.transition().duration(500).call(this.tickY);
        this.gridY.transition().duration(500).call(this.gridTickY);
//- X축
        this.tickX.tickFormat(d3.timeFormat(changed.timeFormat))
                  .ticks(xAxisCount);

        this.gridTickX.tickSize(-changed.height)
                      .ticks(xAxisCount);

        this.axisX.attr("transform", `translate(0,${changed.height})`)
                  .call(this.tickX);
        this.gridX.attr("transform", `translate(0,${changed.height})`)
                  .call(this.gridTickX);

    }
    zoomBrush = () => {
        const extent = d3.event.selection;
        const {realTime} = this.props.range;
    };

    prepare(g){

        const {width,height,margin} = this.props.options;
        const {options} = this.props;
        // const {svg}= this.state;

        // console.log('',svg,margin,width,height);

        this.svg = d3.select(g.parentNode);
        this.area_clip = this.svg.append("defs")
                .append("svg:clipPath")
                .attr("id", `area-clip${this.props.box.key}`)
                .append("svg:rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", width)
                .attr("height", height);

        this.top = d3.select(g).attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        this.focus = this.top.append("g").attr("class", "tooltip-focus");
        //
        this.stackArea = this.top.append("g")
                        .attr("class", "stack-area")
                        .attr("clip-path",`url(#area-clip${this.props.box.key})`);
        //
        this.line = this.top.append("g")
                    .attr("class", "line-plot")
                    .attr("clip-path",`url(#area-clip${this.props.box.key})`);

        this.brush = d3.brushX()
            .extent([[0, 0], [width, height]])
            .on("end", this.zoomBrush);

        this.top.append("g").attr("class", "brush").call(this.brush);
        //
        // //Axis Draw
        this.xScale = d3.scaleTime().range([0, width]);
        this.yScale = d3.scaleLinear().range([height, 0]);
        //
        this.xScale.domain([this.props.startTime, this.props.endTime]);
        this.yScale.domain([0, options.maxY]);
        //
        let xAxisCount = Math.floor(width / options.xAxisWidth);
        if (xAxisCount < 1) {
            xAxisCount = 1;
        }
        let yAxisCount = Math.floor(height / options.yAxisHeight);
        if (yAxisCount < 1) {
            yAxisCount = 1;
        }
// Y축
        this.tickY = d3.axisLeft(this.yScale)
                        .tickFormat((d)=>numeral(d).format('0.0a'));

        this.tickY.ticks(yAxisCount);

        this.axisY = this.top.insert("g", ":first-child").attr("class", "axis-y")
            .call(this.tickY);

        this.gridTickY = d3.axisLeft(this.yScale)
            .tickSize(-options.width)
            .tickFormat("");
        this.gridTickY.ticks(yAxisCount);

        this.gridY = this.top.insert("g", ":first-child")
                    .attr("class", "grid-y")
                    .style("stroke-dasharray", "5 2")
                    .style("opacity", options.opacity)
                    .call(this.gridTickY);
//- X축
        this.tickX = d3.axisBottom(this.xScale)
            .tickFormat(d3.timeFormat(options.timeFormat));

        this.tickX.ticks(xAxisCount);
        this.axisX = this.top.insert("g", ":first-child")
            .attr("class", "axis-x")
            .attr("transform", "translate(0," + height + ")")
            .call(this.tickX);

        this.gridTickX = d3.axisBottom(this.xScale)
            .tickSize(-options.height)
            .tickFormat("");

        this.gridTickX.ticks(xAxisCount);

        this.gridX = this.top.insert("g", ":first-child")
                             .attr("class", "grid-x")
                             .style("stroke-dasharray", "5 2")
                             .style("opacity", options.opacity)
                             .attr("transform", `translate(0,${options.height})`)
                             .call(this.gridTickX);
        this.isInit = true;
    };
    componentDidMount() {

    }

    shouldComponentUpdate() {
        return false;
    };

    onRef = (ref) => {
        this.setState({ g : d3.select(ref)  } ,()=>{
            this.prepare(ref);
        });
    };


    render(){
        return (
            <g ref={this.onRef} className="top-group">
            </g>
        );
    };
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

Line = connect(mapStateToProps, mapDispatchToProps)(Line);
export default withRouter(Line);