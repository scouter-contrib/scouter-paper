import React, {Component} from 'react';
import './FrameProfile.css';
import FrameStepDetail from "./FrameStepDetail/FrameStepDetail";
import XlogFlow from "./XlogFlow/XlogFlow";
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import * as d3 from "d3";
import numeral from "numeral";
import moment from "moment";
import {profileMetas} from "./meta"
import {IdAbbr} from "../../../../../common/idAbbr";
import TimeRatio from './TimeRatio';

class FrameProfile extends Component {

    dateFormat = null;
    fullTimeFormat = null;

    margin = {
        left: 100,
        right: 5,
        top: 22
    };

    scale = null;
    axisWidth = 0;
    resizeTimer = null;

    constructor(props) {
        super(props);

        this.state = {
            selectedStepIndex: null,
            lastResizeTime : null,
            flow : {
                show : false,
                parameter : {}
            }
        };
    }

    componentDidMount() {
        this.dateFormat = this.props.config.dateFormat;
        this.fullTimeFormat = this.props.config.dateFormat + " " + this.props.config.timeFormat;
        window.addEventListener("resize", this.resize);
    };

    componentWillReceiveProps(nextProps) {
        this.init(nextProps);
        if (nextProps.rightWidth !== this.props.rightWidth) {
            this.resize();
        }
        if(nextProps.steps !== this.props.steps){
            this.setState({
                selectedStepIndex: null,
                flow : {
                    show : false,
                    parameter : {}
                }
            })
        }

    }

    init = (props) => {
        let frameAxis = this.refs.frameAxis;
        if (frameAxis && props.profile) {
            let width = frameAxis.offsetWidth;
            this.axisWidth = width - this.margin.left - this.margin.right;
            let ticks = Math.round(this.axisWidth / 150);
            if (ticks < 3) {
                ticks = 3;
            }

            let svg = d3.select(frameAxis).select("svg");
            if (svg.size() > 0) {
                svg.remove();
            }

            svg = d3.select(frameAxis).append("svg")
                .attr("width", width).attr("height", "30px")
                .append("g").attr("class", "top-group").attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

            this.scale = d3.scaleLinear().range([0, this.axisWidth]).domain([0, props.profile.elapsed]);
            svg.call(d3.axisTop(this.scale).tickFormat((d) => {
                return d + "ms";
            }).ticks(ticks));
        }
    };

    componentWillUnmount() {
        window.removeEventListener("resize", this.resize);
    }

    resize = () => {
        if (this.resizeTimer) {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = null;
        }

        this.resizeTimer = setTimeout(() => {
            this.init(this.props);
            this.setState({
                lastResizeTime : (new Date()).getTime()
            });
        }, 1000);

    };

    getNavData = (endtime, gxid, caller, txid, steps) => {

        let flow = {
            main: [],
            sub: []
        };

        if (0 !== Number(gxid) && gxid) {
            flow.main.push({
                id: gxid,
                idx: IdAbbr.abbr(gxid),
                type: gxid === txid ? "current" : "start",
                endtime: endtime
            });
        }

        if (caller && Number(caller) !== 0 && gxid !== caller) {
            flow.main.push({
                id: caller,
                idx: IdAbbr.abbr(caller),
                type: gxid === txid ? "self" : "caller",
                endtime: endtime
            });
        }

        if (txid !== gxid) {
            flow.main.push({
                id: txid,
                idx: IdAbbr.abbr(txid),
                type: "current",
                endtime: endtime
            });
        }

        return flow;
    };

    txNavClick = (xlog, endtime, e) => {
        e.stopPropagation();
        this.props.rowClick({txid: xlog}, moment(new Date(Number(endtime))).format("YYYYMMDD"));
    };

    txLinkClick = (xlog) => {
        this.props.rowClick({txid: xlog}, moment(new Date(Number(this.props.profile.endTime))).format("YYYYMMDD"));
    };


    getStepName = (step) => {
        let stepName = step.stepTypeName;
        switch (step.stepType) {
            case "17" : {
                stepName = "CUSTOM";
                break;
            }
            case "9" :
            case "3" : {
                stepName = "MSG";
                break;
            }

            case "16" :
            case "2" :
            case "8" : {
                stepName = "SQL";
                break;
            }

            case "10" :
            case "1" : {
                stepName = "METHOD";
                break;
            }

            case "51" : {
                stepName = "SPAN";
                break;
            }

            case "52" : {
                stepName = "SPAN CALL";
                break;
            }

            case "5" : {
                stepName = "SOCKET";
                break;
            }

            case "15" :
            case "6" : {
                stepName = "API CALL";
                break;
            }

            case "7" : {
                stepName = "THREAD SUBMIT";
                break;
            }

            case "12" : {
                stepName = "DUMP";
                break;
            }

            case "13" : {
                stepName = "DISPATCH";
                break;
            }

            case "14" : {
                stepName = "THREAD CALL";
                break;
            }

            case "11" : {
                stepName = "METHOD SUM";
                break;
            }

            case "21" : {
                stepName = "SQL SUM";
                break;
            }

            case "31" : {
                stepName = "MESSAGE SUM";
                break;
            }

            case "42" : {
                stepName = "SOCKET SUM";
                break;
            }

            case "43" : {
                stepName = "API CALL SUM";
                break;
            }

            case "99" : {
                stepName = "CONTROL";
                break;
            }

            default : {
                stepName = step.stepTypeName;
                break
            }
        }

        return stepName;
    };

    showDetail = (index) => {
        this.setState({
            selectedStepIndex: index
        });
    };
    showFlowClose =(flow) =>{
        this.setState({
            flow : flow
        });
    };

    //sql3 literal bind?
    getElapsedTime = (row) => {
        switch (row.step.stepType) {
            case "9" : {
                return Number(row.step.time) >= 0 ? Number(row.step.time) : undefined;
            }

            case "12" :
            case "31" :
            case "99" : {
                return undefined;
            }

            case "16" :
            case "2" :
            case "8" :
            case "1" :
            case "51" :
            case "52" :
            case "10" :
            case "3" :
            case "5" :
            case "6" :
            case "15" :
            case "7" :
            case "17" :
            case "13" :
            case "14" :
            case "11" :
            case "21" :
            case "42" :
            case "43" : {
                return row.step.elapsed;
            }

            default : {
                return Number(row.step.elapsed);
            }
        }

    };

    getMainValue = (row) => {
        // needs check 10 (Method2Step) , 5 (SOCKET), 6(ApiCallStep), 13(DispatchStep), 14(ThreadCallPossibleStep), 11, 21, 31
        switch (row.step.stepType) {
            case "9" : {
                return row.mainValue + (row.step.time >= 0 ? ' #' + row.step.value + ' ' + row.step.time + 'ms' : "");
            }

            case "10" :
            case "1" : {
                const fullMethod = row.mainValue;
                const parts = fullMethod.split('.');
                let methodNameSimple = fullMethod;
                if (parts.length >= 2) {
                    const methodName = parts[parts.length - 1];
                    const bracePos = methodName.indexOf('(');
                    if (bracePos > 0) {
                        methodNameSimple = parts[parts.length - 2] + "#" + methodName.substring(0, bracePos) + "()";
                    }

                    return methodNameSimple + " [" + fullMethod + "]";
                } else {
                    return fullMethod;
                }
            }

            case "15" :
            case "6" : {
                return (String(row.step.async) === "1" ? '[async]' : '') + row.mainValue + (String(row.step.opt) === '1' ? ' [addr] ' + row.step.address : '');
            }

            case "12" : {
                return "[" + row.step.threadState + "] ID:" + row.step.threadId + " " + row.step.threadName + (row.additionalValueList && row.additionalValueList.length > 0 ? " [" + row.additionalValueList[0] + "]" : "");
            }

            case "13" : {
                return row.step.address + " " + row.step.opt;
            }

            case "14" : {
                let status = "";
                if (Number(row.step.threaded) === 0) {
                    status = "";
                }

                if (Number(row.step.threaded) === 1) {
                    status = "[THREAD DISPATCHING]";
                }

                return status + " " + row.mainValue;
            }

            case "21" :
            case "11" : {
                return row.mainValue + " " + row.step.count + " " + row.step.cputime + "ms";
            }

            case "31" : {
                return row.step.message + " " + row.step.count;
            }

            case "42" : {
                return row.step.ipaddr + ":" + row.step.port + " " + row.step.count;
            }

            case "43" : {
                return row.mainValue + " " + row.step.count + " " + (row.step.opt ? row.step.opt : '');
            }

            case "99" : {
                return row.step.code + " " + row.step.message;
            }

            case "16" :
            case "2" :
            case "8" : {
                return row.step.xtypePrefix + row.mainValue;
            }

            case "17" : {
                let level = "";
                if (Number(row.step.level) === 0 || row.step.level === "DEBUG") {
                    level = "DEBUG";
                }

                if (Number(row.step.level) === 1 || row.step.level === "INFO") {
                    level = "INFO";
                }

                if (Number(row.step.level) === 2 || row.step.level === "WARN") {
                    level = "WARN";
                }

                if (Number(row.step.level) === 3 || row.step.level === "ERROR") {
                    level = "ERROR";
                }

                return (level ? "[" + level + "]" : "") + row.mainValue;
            }

            case "5" : {
                return "[Connect] " + row.mainValue + ":" + row.step.port;
            }

            case "51" :
            case "52" :
            case "3" :
            case "7" :
            default : {
                return row.mainValue;
            }
        }

    };

    boolTostr = (val="0") => {
        switch (val) {
            case "1": return "Y";
            case "0": return "N";
            default:
                return "N";
        }
    };
    onClickTxToXFlow=(gxid,txid,caller,endtime,clickId ) =>{
        const yyyymmdd = moment(new Date(Number(endtime))).format("YYYYMMDD");
        this.setState({
            flow : {
                show : true,
                parameter : {
                    gxid : gxid,
                    txid : txid,
                    caller : caller,
                    yyyymmdd : yyyymmdd,
                    isGX : clickId === "Gxid"
                }
            }
        });

    };

    render() {
        let nav = null;
        if (this.props.profile) {
            nav = this.getNavData(this.props.profile.endTime, this.props.profile.gxid, this.props.profile.caller, this.props.profile.txid, this.props.steps);
        }
        return (
            <div className='frame-profile'>
                <div className={"sub-title " + (this.props.narrow ? 'narrow' : '')}>GENERAL INFO</div>
                <div className={"xlog-data " + (this.props.wrap ? 'wrap' : '')}>
                    {(nav && nav.main.length > 1) &&
                    <div>
                        <span className="label">TX FLOW</span>
                        <span className="data">
                            {nav.main.map((d, i) => {
                                return (
                                    <div className="tx-link-wrapper" key={i}>
                                        {i !== 0 && <div className="arrow"><i className="fa fa-long-arrow-right" aria-hidden="true"></i></div>}
                                        <div className={"tx-link link-other-tx " + d.type}>
                                            <span className="type">{d.type}</span>
                                            <span className="txid" onClick={this.txNavClick.bind(this, d.id, d.endtime)}>{d.idx}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </span>
                    </div>
                    }
                    {
                        this.props.profile && ['Txid','Gxid'].map(k=>{
                            return <div key={k}>
                                <span className="label">{k}</span>
                                <span className="data tx-link" onClick={()=>{
                                    const { gxid,txid,caller,endTime } = this.props.profile;
                                    this.onClickTxToXFlow(gxid,txid,caller,endTime,k);
                                }}>{IdAbbr.abbr(this.props.profile[k.toLowerCase()])}</span>
                            </div>
                        })
                    }

                    {this.props.profile && profileMetas && profileMetas.filter((d) => {
                        return this.props.summary ? (d.show && this.props.profile[d.key] ) : true
                    }).map((meta, i) => {
                        return <div key={i}>
                            <span className="label">{meta.name}</span>
                            <span className={"data " + (meta.name.toLowerCase() === "error" ? "error" : "")}>
                                {meta.type === "datetime" && d3.timeFormat(this.fullTimeFormat)(new Date(Number(this.props.profile[meta.key])))}
                                {meta.type === "ms" && `${numeral(this.props.profile[meta.key]).format(this.props.config.numberFormat)} ms`}
                                {meta.type === "bytes" && `${numeral(this.props.profile[meta.key]).format(this.props.config.numberFormat)} b`}
                                {meta.type === "number" && numeral(this.props.profile[meta.key]).format(this.props.config.numberFormat)}
                                {meta.type === "boolean" && this.boolTostr(this.props.profile[meta.key]) }
                                {(meta.type !== "datetime" && meta.type !== "ms" && meta.type !== "bytes" && meta.type !== "number" && meta.type !== "boolean") && this.props.profile[meta.key]}
                            </span>
                        </div>
                    })}
                </div>
                {
                    this.props.profile && 
                    <TimeRatio cpu={this.props.profile.cpu} 
                        sql={this.props.profile.sqlTime} 
                        api={this.props.profile.apicallTime} 
                        elapsed={this.props.profile.elapsed}/>
                }
                
                
                <div className="sub-title">PROFILE STEP</div>
                {/*<div className={"xlog-steps " + (this.props.wrap ? 'wrap' : '') + (this.props.narrow ? 'narrow' : '')}>*/}
                <div className={"frame-graph " + (this.props.narrow ? 'narrow' : '')}>
                    <div ref="frameAxis" className="frame-axis"></div>
                    <div className={"frame-xlog-steps " + (this.props.wrap ? 'wrap' : '')}>
                        {this.scale && this.props.steps && this.props.steps.map((row, i) => {
                            const stepStartTime = Number(row.step.start_time);
                            const elapsed = this.getElapsedTime(row);

                            let start = this.scale(stepStartTime);
                            let width = 3;
                            if (elapsed && elapsed > 0) {
                                width = this.scale(elapsed);
                            }

                            if (width < 3) {
                                width = 3;
                            }

                            let textPadding = 15;
                            let rate = this.props.profile.elapsed > 0 ? stepStartTime / this.props.profile.elapsed : 0;
                            let textWidth = "50%";
                            if (rate <= 0.5) {
                                textWidth = (this.axisWidth - start - textPadding) + "px";
                            } else {
                                textWidth = (start + width - textPadding) + "px";
                            }

                            let percentage = ((elapsed !== undefined) ? (Math.round((elapsed / this.props.profile.elapsed) * 1000) / 10) : undefined);
                            let percentageGrade = "normal";
                            if (percentage > 50) {
                                percentageGrade = "warning";
                            }

                            let mainValue = this.getMainValue(row);

                            let isExtenalStep = false;
                            if ((row.step.stepType === "2" || row.step.stepType === "8" || row.step.stepType === "16" || row.step.stepType === "6" || row.step.stepType === "15") || (row.step.stepType === "17" && (row.mainValue.toUpperCase().indexOf("[REDIS]") > -1 || row.mainValue.toUpperCase().indexOf("[KAFKA]") > -1 || row.mainValue.toUpperCase().indexOf("[RABBIT]") > -1))) {
                                isExtenalStep = true;
                            }

                            let isDump = false;
                            if (row.step.stepType === "12") {
                                isDump = true;
                            }

                            return (
                                <div key={i} className={"step step-type-" + row.step.stepType} onClick={this.showDetail.bind(this, i)}>
                                    <div className="step-info">
                                        <span className="index">{row.step.index}</span>
                                        <div className="step-general-info">
                                            {row.step.txid &&
                                            <div className="step-name link-other-tx" onClick={this.txNavClick.bind(this, row.step.txid, this.props.profile.endTime)}>
                                                <i className="fa fa-share" aria-hidden="true"></i> {this.getStepName(row.step)}
                                            </div>
                                            }
                                            {!row.step.txid &&
                                            <div className={"step-name " + (isExtenalStep ? "external-step " : " ") + (isDump ? "dump-step" : "")}><span className="span-color">{this.getStepName(row.step)}</span></div>
                                            }
                                            <div className={"step-elapsed " + percentageGrade}>
                                                <span>{isNaN(elapsed) ? "" : elapsed + " ms"}</span>
                                            </div>
                                            <div className={"percentage " + percentageGrade}>
                                                <span>{isNaN(percentage) ? "" : percentage + "%"}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="span-info">
                                        <div className="span span-bg-color" style={{left: start + "px", width: width + "px"}}></div>
                                        <div className={"main-value "}
                                             style={{left: (rate <= 0.5 ? start : start + width - 5) + "px"}}>
                                            <div className={"main-value-text " + (rate <= 0.5 ? "left-side" : "right-side")}
                                                 style={{width: textWidth}}><span>{mainValue}</span></div>
                                        </div>
                                        {(row.step.error && Number(row.step.error) !== 0) &&
                                        <div className="error">ERR</div>}
                                    </div>
                                    <div className="step-hover"></div>
                                </div>
                            )
                        })}
                    </div>
                </div>
                {this.state.selectedStepIndex !== null &&
                <div className="frame-step-detail-popup">
                    <div>
                        <FrameStepDetail bind={this.props.bind} wrap={this.props.wrap} formatter={this.props.formatter}
                                         showDetail={this.showDetail} profile={this.props.profile}
                                         getStepName={this.getStepName} steps={this.props.steps}
                                         selectedIndex={this.state.selectedStepIndex} getMainValue={this.getMainValue}
                                         getElapsedTime={this.getElapsedTime}
                                         toggleFormatter={this.props.toggleFormatter} toggleBind={this.props.toggleBind}
                                         toggleWrap={this.props.toggleWrap}></FrameStepDetail>
                    </div>
                </div>
                }
                {
                    this.state.flow.show &&
                        <div className="frame-xlog-flow">
                            <div>
                                <XlogFlow flow={this.state.flow} close={this.showFlowClose} doubleClick={this.props.rowClick} >
                                </XlogFlow>
                            </div>
                        </div>
                }

            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        config: state.config
    };
};

FrameProfile = connect(mapStateToProps, undefined)(FrameProfile);
export default withRouter(FrameProfile);
