import React, {Component} from 'react';
import './FrameProfile.css';
import FrameStepDetail from "./FrameStepDetail/FrameStepDetail";
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import * as d3 from "d3";
import numeral from "numeral";
import moment from "moment";
import {IdAbbr} from "../../../../../common/idAbbr";

const profileMetas = [
    {
        key: "txidAbbr",
        name: "TXID(Abbr)",
        type: "string",
        show: true
    },
    {
        key: "txid",
        name: "TXID",
        type: "string",
        show: false
    },
    {
        key: "service",
        name: "Service",
        type: "string",
        show: true
    },
    {
        key: "ipAddr",
        name: "IP",
        type: "string",
        show: true
    },
    {
        key: "elapsed",
        name: "Elapsed",
        type: "ms",
        show: true
    },
    {
        key: "endTime",
        name: "End Time",
        type: "datetime",
        show: true
    },
    {
        key: "apicallCount",
        name: "API Call",
        type: "number",
        show: true
    },
    {
        key: "apicallTime",
        name: "API Time",
        type: "ms",
        show: true
    },
    {
        key: "sqlCount",
        name: "SQL Count",
        type: "number",
        show: true
    },
    {
        key: "sqlTime",
        name: "SQL Time",
        type: "ms",
        show: true
    },
    {
        key: "cpu",
        name: "CPU",
        type: "ms",
        show: true
    },
    {
        key: "allocatedMemory",
        name: "Memory",
        type: "bytes",
        show: true
    },
    {
        key: "error",
        name: "Error",
        type: "string",
        show: true
    },

    {
        key: "caller",
        name: "Caller",
        type: "string",
        show: false
    },
    {
        key: "city",
        name: "City",
        type: "string",
        show: false
    },
    {
        key: "countryCode",
        name: "Country",
        type: "string",
        show: false
    },
    {
        key: "desc",
        name: "Desc",
        type: "string",
        show: false
    },
    {
        key: "group",
        name: "Group",
        type: "string",
        show: false
    },
    {
        key: "gxid",
        name: "GXID",
        type: "string",
        show: false
    },
    {
        key: "hasDump",
        name: "Dump",
        type: "boolean",
        show: false
    },
    {
        key: "internalId",
        name: "Internal ID",
        type: "string",
        show: false
    },

    {
        key: "login",
        name: "Login",
        type: "string",
        show: false
    },
    {
        key: "objHash",
        name: "Object Hash",
        type: "string",
        show: false
    },
    {
        key: "queuing2ndHost",
        name: "Queuing Host",
        type: "string",
        show: false
    },
    {
        key: "queuing2ndTime",
        name: "Queuing Time",
        type: "ms",
        show: false
    },
    {
        key: "queuingHost",
        name: "Queuing Host",
        type: "string",
        show: false
    },
    {
        key: "queuingTime",
        name: "Queuing Time",
        type: "ms",
        show: false
    },
    {
        key: "referrer",
        name: "Referrer",
        type: "string",
        show: false
    },


    {
        key: "text1",
        name: "Text 1",
        type: "string",
        show: false
    },
    {
        key: "text2",
        name: "Text 2",
        type: "string",
        show: false
    },
    {
        key: "text3",
        name: "Text 3",
        type: "string",
        show: false
    },
    {
        key: "text4",
        name: "Text 4",
        type: "string",
        show: false
    },
    {
        key: "text5",
        name: "Text 5",
        type: "string",
        show: false
    },
    {
        key: "threadName",
        name: "Thread Name",
        type: "string",
        show: false
    },
    {
        key: "userAgent",
        name: "User Agent",
        type: "string",
        show: false
    },
    {
        key: "xlogType",
        name: "XLog Type",
        type: "string",
        show: false
    }
];

const stepMeta = {
    6: {
        name: "apicall",
        getNavName: (step) => "CALL API"
    },
    15: {
        name: "apicall2",
        getNavName: (step) => "CALL API"
    },
    52: {
        name: "spancall",
        getNavName: (step) => "CALL SPAN"
    },
    7: {
        name: "threadSubmit",
        getNavName: (step) => "CALL THREAD"
    },
    13: {
        name: "dispatch",
        getNavName: (step) => "CALL THREAD"
    },
    14: {
        name: "threadCallPossible",
        getNavName: (step) => {
            if(step.threaded === "1") {
                return "CALL THREAD";
            } else {
                return undefined;
            }
        }
    }
};

// public final static byte APICALL = 6;
// public final static byte APICALL2 = 15;
//
// public final static byte THREAD_SUBMIT = 7;
// public final static byte DISPATCH = 13;
// public final static byte THREAD_CALL_POSSIBLE = 14;

class FrameProfile extends Component {

    dateFormat = null;
    fullTimeFormat = null;

    constructor(props) {
        super(props);

        this.state = {
            selectedStep: null
        };
    }

    componentDidMount() {
        this.dateFormat = this.props.config.dateFormat;
        this.fullTimeFormat = this.props.config.dateFormat + " " + this.props.config.timeFormat;

    };

    getNavData = (endtime, gxid, caller, txid, steps) => {

        let flow = {
            main : [],
            sub : []
        };

        if (0 !== Number(gxid) && gxid) {
            flow.main.push({
                id : gxid,
                idx : IdAbbr.abbr(gxid),
                type : gxid === txid ? "current" : "start",
                endtime : endtime
            });
        }

        if (caller && Number(caller) !== 0 && gxid !== caller) {
            flow.main.push({
                id : caller,
                idx : IdAbbr.abbr(caller),
                type : gxid === txid ? "self" : "caller",
                endtime : endtime
            });
        }

        if (txid !== gxid) {
            flow.main.push({
                id : txid,
                idx : IdAbbr.abbr(txid),
                type : "current",
                endtime : endtime
            });
        }

        /*
        steps && steps.forEach((d, i) => {
            const meta = stepMeta[d.step.stepType];
            if (d.step.txid && meta && meta.getNavName(d.step)) {
                flow.sub.push({
                    id : d.step.txid,
                    idx : IdAbbr.abbr(d.step.txid),
                    type : meta.getNavName(d.step),
                    endtime : endtime,
                    elapsed : d.step.elapsed
                });
            }
        });
        */

        return flow;
    };

    txNavClick = (xlog, endtime, e) => {
        e.stopPropagation();
        this.props.rowClick({txid:xlog}, moment(new Date(Number(endtime))).format("YYYYMMDD"));
    };

    txLinkClick = (xlog) => {
        this.props.rowClick({txid:xlog}, moment(new Date(Number(this.props.profile.endTime))).format("YYYYMMDD"));
    };

    margin = {
        left : 100,
        right : 20,
        top : 22
    };

    scale = null;
    axisWidth = 0;
    componentWillReceiveProps(nextProps) {

        let frameAxis = this.refs.frameAxis;
        if (frameAxis && nextProps.profile) {
            let width = frameAxis.offsetWidth;
            this.axisWidth = width - this.margin.left - this.margin.right;

            let svg = d3.select(frameAxis).select("svg");
            if (svg.size() > 0) {
                svg.remove();
            }

            svg = d3.select(frameAxis).append("svg")
                .attr("width", width).attr("height", "30px")
                .append("g").attr("class", "top-group").attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

            this.scale = d3.scaleLinear().range([0, this.axisWidth]).domain([0, nextProps.profile.elapsed]);
            svg.call(d3.axisTop(this.scale).tickFormat((d) => {
                return d + "ms";
            }).ticks(4));

        }
    }

    getStepName = (step) => {
        let stepName = step.stepTypeName;
        switch (step.stepType) {
            case "17" :
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

            case "1" :
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

    showDetail = (step) => {
        this.setState({
            selectedStep : step
        });
    };

    render() {

        let nav = null;
        if (this.props.profile) {
            nav = this.getNavData(this.props.profile.endTime, this.props.profile.gxid, this.props.profile.caller, this.props.profile.txid, this.props.steps);
        }

        return (
            <div className='frame-profile'>
                {/*<div className={"sub-title " + (this.props.narrow ? 'narrow' : '')}>GENERAL INFO</div>*/}
                {/*<div className={"xlog-data " + (this.props.wrap ? 'wrap' : '') + (this.props.narrow ? 'narrow' : '')}>*/}
                <div className={"sub-title "}>GENERAL INFO</div>
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
                                            <span className="txid"
                                                  onClick={this.txNavClick.bind(this, d.id, d.endtime)}>{d.idx}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </span>
                    </div>
                    }
                    {this.props.profile && profileMetas && profileMetas.filter((d) => {return this.props.summary ? d.show : true}).map((meta, i) => {
                        return <div key={i}>
                            <span className="label">{meta.name}</span>
                            <span className="data">
                                {meta.type === "datetime" && d3.timeFormat(this.fullTimeFormat)(new Date(Number(this.props.profile[meta.key])))}
                                {meta.type === "ms" && numeral(this.props.profile[meta.key]).format(this.props.config.numberFormat)+ " ms"}
                                {meta.type === "bytes" && numeral(this.props.profile[meta.key]).format(this.props.config.numberFormat + "b")}
                                {meta.type === "number" && numeral(this.props.profile[meta.key]).format(this.props.config.numberFormat)}
                                {(meta.type !== "datetime" && meta.type !== "ms" && meta.type !== "bytes" && meta.type !== "number") && this.props.profile[meta.key]}
                            </span>
                        </div>
                    })}
                </div>
                <div className="sub-title">PROFILE STEP</div>
                {/*<div className={"xlog-steps " + (this.props.wrap ? 'wrap' : '') + (this.props.narrow ? 'narrow' : '')}>*/}
                <div className="frame-graph">
                    <div ref="frameAxis" className="frame-axis"></div>
                    <div className={"frame-xlog-steps " + (this.props.wrap ? 'wrap' : '')}>
                        {this.scale && this.props.steps && this.props.steps.map((row, i) => {
                            const stepStartTime = Number(row.step.start_time);
                            const elapsed = Number(row.step.elapsed);

                            let start = this.scale(stepStartTime);
                            let width = 3;
                            if (elapsed && elapsed > 0) {
                                width = this.scale(elapsed);
                            }

                            if (width < 3) {
                                width =  3;
                            }

                            let textPadding = 15;
                            let rate = stepStartTime / this.props.profile.elapsed;
                            let textWidth = "50%";
                            if (rate <= 0.5) {
                                textWidth = (this.axisWidth - start - textPadding) + "px";
                            } else {
                                textWidth = (start - textPadding) + "px";
                            }

                            let percentage = (Math.round((row.step.elapsed / this.props.profile.elapsed) * 1000) / 10);
                            let percentageGrade = "normal";
                            if (percentage > 50) {
                                percentageGrade = "warning";
                            }

                            return (<div key={i} className={"step " + ("step-type-" + row.step.stepType)} onClick={this.showDetail.bind(this, row)}>
                                <div className="step-info">
                                    <span className="index">{row.step.index}</span>
                                    <div className="step-general-info">
                                        {row.step.txid &&
                                        <div className="step-name link-other-tx" onClick={this.txNavClick.bind(this, row.step.txid, this.props.profile.endTime)}><i className="fa fa-share" aria-hidden="true"></i> {this.getStepName(row.step)}</div>
                                            }
                                        {!row.step.txid && <div className="step-name">{this.getStepName(row.step)}</div>}
                                        <div className="step-elapsed">{isNaN(row.step.elapsed) ? "" : row.step.elapsed + " ms"} <span className={"percentage " + percentageGrade}>{isNaN(percentage) ? "" : percentage + "%"}</span></div>
                                    </div>
                                </div>
                                <div className="span-info">
                                    <div className="span" style={{left : start + "px", width : width + "px"}}></div>
                                    <div className={"main-value "} style={{left : start + "px"}}>
                                        <div className={"main-value-text " + (rate <= 0.5 ? "left-side" : "right-side")} style={{width : textWidth}}><span>{row.mainValue}</span></div>
                                    </div>
                                </div>
                            </div>)
                        })}
                    </div>
                </div>
                {this.state.selectedStep &&
                <div className="frame-step-detail-popup">
                    <div>
                        <FrameStepDetail
                            bind={this.props.bind} wrap={this.props.wrap} formatter={this.props.formatter}
                            showDetail={this.showDetail} profile={this.props.profile} getStepName={this.getStepName} steps={this.props.steps} info={this.state.selectedStep}></FrameStepDetail>
                    </div>
                </div>}
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
