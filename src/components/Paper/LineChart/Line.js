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

class Line extends Component {
    state ={
        svg : null,
    };

    constructor(props) {
        super(props);

    }


    componentWillReceiveProps(nextProps){
        // console.log("first read;;",nextProps.options,this.props.options);
        if( nextProps.options !== this.props.options){
            //- init
            // this.prepare(null,nextProps.options);
        }
    };

    zoomBrush = () => {
        const extent = d3.event.selection;
        const {realTime} = this.props.range;
    };

    prepare(svg,options){
        const {width,height,margin} = options;
        // const {svg}= this.state;
        // console.log('',svg,margin,width,height);
        // if(!svg) return;
        console.log(options);
        this.svg = d3.select(svg)
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);

        this.svg.append("defs")
            .append("svg:clipPath")
            .attr("id", `area-clip${this.props.box.key}`)
            .append("svg:rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height);

        this.top = this.svg.append("g")
                           .attr("class", "top-group")
                           .attr("transform", `translate(${margin.left},${margin.top}")`);
        this.focus = this.top.append("g").attr("class", "tooltip-focus");

        this.area = this.top.append("g")
                        .attr("class", "stack-area")
                        .attr("clip-path",`url(#area-clip${this.props.box.key})`);

        this.line = this.top.append("g")
                    .attr("class", "line-plot")
                    .attr("clip-path",`url(#area-clip${this.props.box.key})`);

        this.brush = d3.brushX()
            .extent([[0, 0], [width, height]])
            .on("end", this.zoomBrush);

        this.top.append("g").attr("class", "brush").call(this.brush);

        //Axis Draw
        this.xAxis = d3.scaleTime().range([0, width]);
        this.yAxis = d3.scaleLinear().range([height, 0]);

        this.xAxis.domain([this.props.startTime, this.props.endTime]);
        this.yAxis.domain([0, options.maxY]);

        let xAxisCount = Math.floor(width / options.xAxisWidth);
        if (xAxisCount < 1) {
            xAxisCount = 1;
        }
        let yAxisCount = Math.floor(height / options.yAxisHeight);
        if (yAxisCount < 1) {
            yAxisCount = 1;
        }

        this.top.insert("g", ":first-child").attr("class", "axis-y")
            .call(d3.axisLeft(this.yAxis)
            .tickFormat((d)=>numeral(d).format('0.0a')).ticks(yAxisCount));

        this.top.insert("g", ":first-child")
            .attr("class", "grid-y")
            .style("stroke-dasharray", "5 2")
            .style("opacity", options.opacity)
            .call(d3.axisLeft(this.yAxis)
                .tickSize(-options.width)
                .tickFormat("").ticks(yAxisCount));


        this.top.insert("g", ":first-child")
            .attr("class", "axis-x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(this.xAxis)
                .tickFormat(d3.timeFormat(options.timeFormat))
                .ticks(xAxisCount));
        this.top.insert("g", ":first-child")
            .attr("class", "grid-x")
            .style("stroke-dasharray", "5 2")
            .style("opacity", options.opacity)
            .attr("transform", `translate(0,${options.height})`)
            .call(d3.axisBottom(this.xAxis)
                .tickSize(-options.height)
                .tickFormat("")
                .ticks(xAxisCount));

    };

    shouldComponentUpdate() {
        return false;
    };

    onRef = (ref) => {
        this.setState({ svg : d3.select(ref)  } ,()=>{
            this.prepare(ref,this.props.options);
        });
    };

    render(){
        return (
            <svg ref={this.onRef}>
            </svg>
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