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
import * as _ from "lodash";
import moment from 'moment';
import numeral from "numeral";
import InstanceColor from "../../../common/InstanceColor";

class Line extends Component {
    state = {
        g : null,
    };
    isInit = false;

    isZoom = false;
    zoomData = null;

    zoomReset(){
        this.isZoom = false;
        this.zoomData = null;
    }
    componentWillReceiveProps(nextProps){
        if(!this.isInit){
            return;
        }
//-    realtime <=> search reset
        if(nextProps.removeObject !== this.props.removeObject){
            this.peakClear();
            _.forEach(nextProps.removeObject, d=>this.removeCounterLine(d.key,d.counter));

        }
        if(nextProps.removeCounter !== this.props.removeCounter){
            _.forEach(nextProps.removeCounter,d=>this.removeCounterLine(d.key,d.counter,true));
        }


        const {type} = nextProps.options;
        const thisType  = this.props.options.type;
        if( type !== thisType){
            this.peakClear();
            switch(thisType){
                case 'STACK AREA':
                    this.stackArea.selectAll('path').remove();
                    break;
                default:
                    this.line.selectAll('path').remove();
            }
            this.focus.selectAll("circle").remove();
            this.zoomReset();
            this.changedOption(nextProps.options,nextProps);
            this.paint(nextProps);
        }

        if(!nextProps.range.realTime){
            this.zoomReset();

        }

        const isResize = nextProps.options.width !== this.props.options.width ||
                         nextProps.options.height !==  this.props.options.height;
// -    normal
        if(!this.isZoom) {
            if (nextProps.options !== this.props.options) {
                this.changedOption(nextProps.options, nextProps);
            }

            if( nextProps.filterMap !== this.props.filterMap){
                this.paint(nextProps);
            }
            if ((!nextProps.range.realTime && !nextProps.timeFocus.active) ||
                  nextProps.counters !== this.props.counters) {
                this.paint(nextProps);
            }
// -   zoom state
        }else if( this.zoomData && isResize) {
            this.changedOption({...this.zoomData.options ,
                width  :  nextProps.options.width,
                height :  nextProps.options.height,
            },this.zoomData);
            this.paint(this.zoomData);

        }
        if(!nextProps.noData) {
            if(nextProps.timeFocus.active) {
                this.drawTimeFocus(nextProps.timeFocus.keep, nextProps);
            }
            if(!nextProps.timeFocus.active) {
                this.removeFocus(nextProps);
            }
        }
    };
    linePlot(data,thisOption,counterKey,metricCount,peakData){
        for (let i = 0; i < data.objects.length; i++) {
            const obj = data.objects[i];
            if (obj.objFamily === thisOption.familyName ) {
                if (!metricCount[obj.objHash]) {
                    metricCount[obj.objHash] = 0;
                }
                let color;
                if (data.config.graph.color === "metric") {
                    color = InstanceColor.getMetricColor(thisOption.counterKey, data.config.colorType);
                } else {
                    color = InstanceColor.getInstanceColors(data.config.colorType)[obj.objHash][(metricCount[obj.objHash]++) % 5];
                }
                this.drawLine(obj, thisOption, counterKey, color, data);
                const _maxBy = _.maxBy(data.counters[counterKey], d => {
                    const _valueObj = d.data[obj.objHash];
                    if (_valueObj) {
                        return Number(_valueObj.value);
                    }
                });
                if(data.filterMap[obj.objHash]) {
                    if (_maxBy) {
                        peakData.push({
                            time: _maxBy.time,
                            color: color,
                            counter: Number(_maxBy.data[obj.objHash].value)
                        })
                    }
                }

            }
        }
    };
    paint (data){

        if (data.objects) {
            this.xScale.domain([data.startTime, data.endTime]);
            this.yScale.domain([0, data.options.maxY]);
// Y축
            let xAxisCount = Math.floor(data.options.width / data.options.xAxisWidth);
            if (xAxisCount < 1) {
                xAxisCount = 1;
            }

            let yAxisCount = Math.floor(data.options.height / data.options.yAxisHeight);
            if (yAxisCount < 1) {
                yAxisCount = 1;
            }
            this.tickY.ticks(yAxisCount);
            this.gridTickY.tickSize(-data.options.width)
                .ticks(yAxisCount);
            this.axisY.transition().duration(500).call(this.tickY);
            this.gridY.transition().duration(500).call(this.gridTickY);
//- X축
            this.tickX.tickFormat(d3.timeFormat(this.getTimeFormat(data.endTime - data.startTime)))
                .ticks(xAxisCount);

            this.gridTickX.tickSize(-data.options.height)
                .ticks(xAxisCount);

            this.axisX.attr("transform", `translate(0,${data.options.height})`)
                .call(this.tickX);
            this.gridX.attr("transform", `translate(0,${data.options.height})`)
                .call(this.gridTickX);
            this.focus.selectAll("line").attr("y2",data.options.height);

            let instanceMetricCount = {};
            let peakData = [];
            try {
                for (let counterKey in data.counters) {
                    let thisOption = data.box.option.filter((d) => {
                        return d.counterKey === counterKey
                    })[0];
                    if (thisOption) {
                        switch (data.options.type) {
                            case 'STACK AREA':
                                this.stackAreaPaint(thisOption, counterKey, data);
                                break;
                            default :
                                //- LINE,LINEFILL
                                this.linePlot(data, thisOption, counterKey, instanceMetricCount, peakData);
                        }
                    }
                }
                //-peakpaint
                this.peakPaint(data.options.type, peakData);
            }catch (e) {
                console.error(e);
            }
        }
        this.moveTooltip();


    };
    peakClear(){
        try {
            this.peakBrush.selectAll('circle').remove();
            this.peakBrush.selectAll('text').remove();
        }catch (e) {
            console.log(e);
        }
    };
    peakPaint = (chartType,peakData) =>{
      if(peakData.length === 0){
            this.peakClear();
            return;
      }
      if(chartType === 'STACK AREA'){
          return;
      }

      const _peak =  _.maxBy(peakData,d => d.counter);
      const _paintC = this.peakBrush.selectAll("circle")
          .attr('cx',d => this.xScale(d.time))
          .attr('cy',d => this.yScale(d.counter))
          .data([_peak]);

        _paintC.enter()
                .append('circle')
                .attr('r',3)
                .attr('fill',d => d.color)
                .exit()
              .remove();

        const _paintT = this.peakBrush.selectAll("text")
            .attr('y',d => this.yScale(d.counter)-7)
            .attr('x',d => this.xScale(d.time))
            .text(d => numeral(d.counter).format('0.0a'))
            .data([_peak]);

        _paintT.enter()
            .append('text')
            .style('text-anchor', 'middle')
            .style('font-size','10px')
            .exit()
            .remove();

    };

    moveTooltip = () => {
        if (this.currentTooltipTime) {
            let xPosition = this.xScale(this.currentTooltipTime);
            this.focus.selectAll("circle").attr("cx", xPosition);

            let hoverLine = this.focus.select("line.x-hover-line");
            hoverLine.attr("x1", xPosition);
            hoverLine.attr("x2", xPosition);
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
    removeCounterLine(objHash, counterKey,isRemoveTitle=false) {
        let pathClass = "line-" + objHash + "-" + this.replaceName(counterKey);
        let path = this.line.selectAll("path." + pathClass);
        // 라인 그래프 삭제
        if (path && path.size() > 0) {
            path.remove();
        }

        // 툴팁 그래프 삭제
        let circleKey = "circle-" + objHash + "_" + this.replaceName(counterKey);
        let circle = this.focus.selectAll("circle." + circleKey);

        if (circle.size() > 0) {
            circle.remove();
        }
        // 제목 삭제
        if(isRemoveTitle) {
            this.props.removeTitle(counterKey);
        }
    };

    removeFocus(nextProps){
        if(nextProps.timeFocus.id !== this.props.box.key) {
            this.focus.select("line.focus-line").remove();
        }
    }
    focusLine=(time,y2)=>{
        let hoverLine = this.focus.selectAll("line.focus-line");
        const xfuc = (d) => {
            const x = this.xScale(d);
            if(x < 0){
                return 0;
            }
            if(x > this.props.options.width){
                return this.props.options.width;
            }
            return x;
        };
        hoverLine.attr("x1",xfuc)
            .attr("x2",xfuc);

        hoverLine.data([time])
            .enter()
            .append("line")
            .attr("class", "focus-line focus-hover-line")
            .attr("y1", 0)
            .attr("y2", y2)
            .attr("x1", xfuc)
            .attr("x2",xfuc)
            .exit()
            .remove();
        hoverLine.style("display","block");
    };
    drawTimeFocus=(isFixed=false,nextProps)=>{
        if( isFixed || nextProps.timeFocus.id !== this.props.box.key) {
            this.focusLine(this.props.timeFocus.time,nextProps.options.height);
        }else{
            this.focus.select("line.focus-line").remove();
        }
    };
    stackAreaPaint=(thisOption, counterKey, data) => {
        let instanceMetricCount = {};
        const color = {};
        //- instance color making
        for (const attr  in this.props.objects) {
            const _obj = this.props.objects[attr];
            if (_obj.objFamily === thisOption.familyName) {
                if (!instanceMetricCount[_obj.objHash]) {
                    instanceMetricCount[_obj.objHash] = 0;
                }
                if (this.props.config.graph.color === "metric") {
                    const _cl = InstanceColor.getMetricColor(thisOption.counterKey, this.props.config.colorType);
                    color[_obj.objHash] = _cl;
                } else {
                    const _cl = InstanceColor.getInstanceColors(this.props.config.colorType)[_obj.objHash][(instanceMetricCount[_obj.objHash]++) % 5];
                    color[_obj.objHash] = _cl;
                }
            }
        }
        //- instance data flat data making
        const stackData = _(data.counters[counterKey])
            .map((d) => {
                const _r = Object.keys(d.data).map(key => {
                    const _keyValue = [];
                    _keyValue['objHash'] = d.data[key].objHash;
                    _keyValue['time']    = d.time;
                    _keyValue['value']   = Number(d.data[key].value);
                    _keyValue['color']   = color[d.data[key].objHash];
                    return _keyValue;
                });
                return _r;
            }).flatMapDepth().value();
        //- 인스턴스 별 데이터로 변환
        let ld = d3.nest().key(d => d.objHash).entries(stackData);
        const _sort = [];

        //- 인스턴스 순서 정렬
        for (const attr  in this.props.objects) {
            const _obj = this.props.objects[attr];
            const _find = _.findIndex(ld, (o) =>  o.key === _obj.objHash);
            if(_find > -1 ){
                _sort.push(ld[_find]);
            }

        }
        //- 인스턴스 그리기
        const area = d3.area().curve(d3[this.props.config.graph.curve])
            .x(d =>{
                return this.xScale(d[0]);
            })
            .y0(d => this.yScale(d[2]))
            .y1(d => this.yScale(d[1]));

        if (this.props.config.graph.break === "Y") {
            area.defined((d)=>{
                return !isNaN(d[0]) && !isNaN(d[1]) && !isNaN(d[2]);
            })
        }

        //- 시간 별 Y축 데이터 어그리게이션
        let pre = {};
        //- 차트 갱신
        let paintGroup = this.stackArea.selectAll("path.line")
            .data(_sort)
            .attr("d",(d)=> {
                const _d = _.map(d.values,(_node) =>{
                    const _key = _node.time;
                    const pre_v =  pre[_key] ? pre[_key] : 0;
                    const next_v = pre_v + Number(_node.value);
                    pre[_key] = next_v;
                    return [_node.time,next_v,pre_v];
                });
                return area(_d);
            })
            .style("opacity",(d) =>{
                return data.filterMap[d.key] ?  data.config.graph.opacity : 0;
            });

        //- 차트 생성
        paintGroup.enter()
            .append('path')
            .attr('class',(d)=> `line ${d.key}` )
            .attr('data-col-name', (d)=> d.key)
            .style("fill", (d)=> {
                return color[d.key];
            })
            .attr("fill-opacity", this.props.config.graph.fillOpacity)
            .attr("stroke",(d) =>{
                return color[d.key];
            })
            .style("stroke-width", this.props.config.graph.width);

        //- 차트 갱신 후 데이터 삭제
        paintGroup.exit().remove();
    };
    drawLine = (obj, option, counterKey, color,data) => {
        if (this.props.config.graph.fill === 'Y' || this.props.box.values['chartType'] === "LINE FILL") {
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

            let areaClass = "area-" + obj.objHash + "-" + this.replaceName(counterKey);
            let area = this.line.selectAll("path." + areaClass)
                                .data([data.counters[counterKey]])
                                .attr("d",valueArea)
                                .style("opacity", data.filterMap[obj.objHash] ?  data.config.graph.opacity : 0);
            area= area.enter()
                .insert('path')
                .attr("class",areaClass)
                .style("stroke", color)
                .style("fill", color)
                .attr("fill-opacity", this.props.config.graph.fillOpacity);

            area.exit().remove();

            area.transition()
                .delay(100)

        }

        const valueLine = d3.line().curve(d3[this.props.config.graph.curve]);

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

        let pathClass = `line-${obj.objHash}-${this.replaceName(counterKey)}`;
        let path = this.line.selectAll("path." + pathClass)
                            .data([data.counters[counterKey]])
                            .attr("d",valueLine)
                            .style("opacity", data.filterMap[obj.objHash] ?  data.config.graph.opacity : 0);
        path = path.enter()
            .insert("path")
            .attr("class",pathClass)
            .style("stroke", color)
            .style("stroke-width", data.config.graph.width);

        this.setAnimation(path);

        path.exit().remove();


        if (this.props.config.graph.color === "instance") {
            if (this.props.config.colorType === "white") {
                this.props.setTitle(counterKey, option.title, "#333", option.familyName);
            } else {
                this.props.setTitle(counterKey, option.title, "white", option.familyName);
            }
        } else {
            this.props.setTitle(counterKey, option.title, color, option.familyName);
        }

    };
    setAnimation(svg){
        const {realTime} = this.props.range;
        return realTime ? svg : svg.transition().duration(500);
    }
    getTimeFormat(duration){

       if( duration <= (1000 * 60 * 5)) {
           return this.props.config.timeFormat;
       }else{
           return this.props.config.minuteFormat;
       }
    }

    changedOption(changed,props){

        let repaint=false;
        if(changed.width !== this.props.options.width || changed.height !==  this.props.options.height ) {
            this.brush.extent([[0, 0], [changed.width, changed.height]]);
            this.brushG.call(this.brush);
            this.area_clip
                .attr("width", changed.width)
                .attr("height", changed.height);
            this.xScale = this.xScale.range([0, changed.width]);
            this.yScale = this.yScale.range([changed.height, 0]);
            repaint=true;
        }

        // if(changed.height !== this.props.options.height ||
        //    changed.width !== this.props.options.width  ){
        //    this.paint(this.props);
        // }
        if(repaint){
            this.paint(props);
        }
    }

    zoomBrush = () => {
        const extent = d3.event.selection;
        const {realTime} = this.props.range;
        if(extent) {
            this.brushG.call(this.brush.move,null);
            const endTime = this.xScale.invert(extent[1]);
            const startTime = this.xScale.invert(extent[0]);
            if(realTime) {
                this.isZoom = true;
                this.zoomData = {...this.props, startTime: startTime.getTime(), endTime: endTime.getTime()}
                this.changedOption(this.zoomData.options, this.zoomData);
                this.paint(this.zoomData);
            }else{
                const startDate= moment(startTime);
                this.props.setRealTimeRangeStepValue(false, this.props.range.longTerm,
                    this.props.range.value,
                    this.props.config.range.shortHistoryRange, this.props.config.range.shortHistoryStep);
                this.props.setRangeDateHoursMinutes(startDate, startDate.hours(), startDate.minutes());
                this.props.setSearchCondition(startTime.valueOf(), endTime.valueOf(), new Date().getTime());
            }
        }else if(realTime) {
            this.isZoom = false;
            // restore
            this.changedOption(this.props.options,this.props);
            this.paint(this.props);
        }


    };

    mouseOverObject = (obj, thisOption, color) => {

        let r = 3;

        let circleKey = "circle-" + obj.objHash + "_" + this.replaceName(thisOption.counterKey);
        let circle = this.focus.select("circle." + circleKey);
        if (circle.size() < 1) {
            circle = this.focus.append("circle").attr("class", circleKey).attr("r", r).attr("stroke", color);
        }

        if (this.props.filterMap[obj.objHash]) {
            circle.style("opacity", 1);
        } else {
            circle.style("opacity", 0);
        }

    };
    mouseMoveObject = (obj, thisOption, counterKey, dataIndex, color, tooltip) => {
        

        let circleKey = "circle-" + obj.objHash + "_" + this.replaceName(thisOption.counterKey);
        let unit = this.props.counters[counterKey][dataIndex].data[obj.objHash] ? this.props.counters[counterKey][dataIndex].data[obj.objHash].unit : "";

        let valueOutput = obj.objHash && this.props.counters[counterKey][dataIndex].data[obj.objHash]  ? this.props.counters[counterKey][dataIndex].data[obj.objHash].value : null ;
        const valueOrigin = obj.objHash && this.props.counters[counterKey][dataIndex].data[obj.objHash]  ? this.props.counters[counterKey][dataIndex].data[obj.objHash].value : null ;
        if( this.props.options.type === "STACK AREA" && valueOutput ){
            valueOutput = this.counterSum + valueOutput;
            this.counterSum = valueOutput;
        }

        if (this.props.counters[counterKey][dataIndex].time) {
            if (this.props.filterMap[obj.objHash]) {
                tooltip.lines.push({
                    instanceName: obj.objName,
                    circleKey: circleKey,
                    metricName: thisOption.title,
                    value: valueOutput ? valueOutput : null,
                    displayValue: valueOrigin ? numeral(valueOrigin).format(this.props.config.numberFormat) + " " + unit : null,
                    color: color
                });
            }
        } else {
            this.focus.select("circle." + circleKey).style("display", "none");
        }

        return true;
    };
    
    prepare(g){

        const {width,height,margin} = this.props.options;
        const {options} = this.props;
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

        this.brushG = this.top.append("g").attr("class", "brush");
        this.brushG.call(this.brush);
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
        this.peakBrush = this.top.append("g").attr("class", "peak").attr("clip-path",`url(#area-clip${this.props.box.key})`);
// event setting

        this.svg.on("mouseover",  ()=> {
            let layer = g.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
            layer.style.zIndex = 9;

            let hoverLine = this.focus.select("line.x-hover-line");
            if (hoverLine.size() > 0) {
                hoverLine.style("display", "block");
            }

            let instanceMetricCount = {};
            for (let counterKey in this.props.counters) {
                let thisOption = this.props.box.option.filter((d) => {return d.counterKey === counterKey})[0];
                if (!thisOption) {
                    break;
                }

                for (let i = 0; i < this.props.objects.length; i++) {
                    const obj = this.props.objects[i];
                    if (thisOption.familyName === obj.objFamily) {
                        if (!instanceMetricCount[obj.objHash]) {
                            instanceMetricCount[obj.objHash] = 0;
                        }
                        let color;
                        if (this.props.config.graph.color === "metric") {
                            color = InstanceColor.getMetricColor(thisOption.counterKey, this.props.config.colorType);
                        } else {
                            color = InstanceColor.getInstanceColors(this.props.config.colorType)[obj.objHash][(instanceMetricCount[obj.objHash]++) % 5];
                        }
                        this.mouseOverObject(this.props.objects[i], thisOption, color);
                    }
                }
            }

            this.focus.selectAll("circle").style("display", "block");
        });



        this.svg.on("mouseout",() =>{

            let layer = g.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
            layer.style.zIndex = 5;
            this.focus.selectAll("circle").style("display", "none");
            this.focus
                .select("line.x-hover-line")
                .style("display", "none");

            this.props.hideTooltip();
            this.currentTooltipTime = null;
            //- 해제
            if(!this.props.timeFocus.keep) {
                this.props.setTimeFocus(false, null, this.props.box.key);
            }

        });
        this.bisector = d3.bisector(function (d) {
            return d.time;
        }).left;
        
        const that = this; 
        this.svg.on("mousemove", function(){
            
            let tooltip = {};
            tooltip.lines = [];
            let xPos = d3.mouse(this)[0] - that.props.options.margin.left;
            let yPos = d3.mouse(this)[1];
            if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                let box = g.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
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

            let x0 = that.xScale.invert(xPos);
            let timeFormat = d3.timeFormat(that.props.options.fullTimeFormat);

            let instanceMetricCount = {};

            for (let counterKey in that.props.counters) {
                let thisOption = that.props.box.option.filter((d) => {return d.counterKey === counterKey})[0];
                let dataIndex = that.bisector(that.props.counters[counterKey], x0, 0);

                if (!that.props.counters[counterKey][dataIndex]) {
                    break;
                }

                if (tooltip.timeValue && (tooltip.timeValue < that.props.counters[counterKey][dataIndex].time)) {

                } else {
                    tooltip.time = timeFormat(that.props.counters[counterKey][dataIndex].time);
                    tooltip.timeValue = that.props.counters[counterKey][dataIndex].time;
                }

                if (!thisOption) {
                    break;
                }
                that.counterSum = 0;
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

            let hoverLine = that.focus.select("line.x-hover-line").style('display','block');
            if (hoverLine.size() < 1) {
                hoverLine = that.focus.append("line").attr("class", "x-hover-line hover-line").attr("y1", 0).attr("y2", that.props.options.height);
            }

            let xPosition = that.xScale(tooltip.timeValue);

            if (tooltip.timeValue) {
                hoverLine.attr("x1", xPosition);
                hoverLine.attr("x2", xPosition);
            }

            if (tooltip && tooltip.lines) {
                for (let i = 0; i < tooltip.lines.length; i++) {

                    if (!isNaN(tooltip.lines[i].value)) {
                        let circle = that.focus.select("circle." + tooltip.lines[i].circleKey);
                        if(circle) {
                            circle.attr("cx", xPosition);
                            circle.attr("cy", that.yScale(tooltip.lines[i].value));

                            circle.data([tooltip.lines[i].value])
                                .enter()
                                .style('display', 'block')
                                .exit()
                                .remove();
                        }

                    }
                }
            }

            tooltip.chartType = that.props.options.type;
            tooltip.counterSum = numeral(that.counterSum).format(that.props.config.numberFormat);
            that.currentTooltipTime = tooltip.timeValue;

            if(!that.props.timeFocus.keep){
                that.props.setTimeFocus(true,x0.getTime(),that.props.box.key);
            }

            that.props.showTooltip(xPos, yPos, that.props.options.margin.left, that.props.options.margin.top, tooltip);


        });

        this.svg.on("contextmenu",()=>{
            d3.event.preventDefault();
            if(!this.props.timeFocus.keep){
                this.focus.select("line.x-hover-line").style("display","none");
                this.focus.selectAll("circle").style("display","none");
                this.props.hideTooltip();
            }
            this.props.setTimeFocus(
                this.props.timeFocus.active,
                this.props.timeFocus.time,
                this.props.timeFocus.id,
                !this.props.timeFocus.keep
            );
        });

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