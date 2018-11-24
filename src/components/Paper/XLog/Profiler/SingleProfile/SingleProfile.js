import React, {Component} from 'react';
import './SingleProfile.css';
import HashedMessageStep from "./HashedMessageStep/HashedMessageStep";
import MethodStep from "./MethodStep/MethodStep";
import SpanStep from "./SpanStep/SpanStep";
import SpanCallStep from "./SpanCallStep/SpanCallStep";
import SqlStep from "./SqlStep/SqlStep";
import MessageStep from "./MessageStep/MessageStep";
import SocketStep from "./SocketStep/SocketStep";
import ApiCallStep from "./ApiCallStep/ApiCallStep";
import ApiCall2Step from "./ApiCall2Step/ApiCall2Step";
import ThreadSubmitStep from "./ThreadSubmitStep/ThreadSubmitStep";
import Sql2Step from "./Sql2Step/Sql2Step";
import Sql3Step from "./Sql3Step/Sql3Step";
import Method2Step from "./Method2Step/Method2Step";
import MethodSumStep from "./MethodSumStep/MethodSumStep";
import DumpStep from "./DumpStep/DumpStep";
import DispatchStep from "./DispatchStep/DispatchStep";
import ThreadCallPossibleStep from "./ThreadCallPossibleStep/ThreadCallPossibleStep";
import ParameterizedMessageStep from "./ParameterizedMessageStep/ParameterizedMessageStep";
import SqlSumStep from "./SqlSumStep/SqlSumStep";
import MessageSumStep from "./MessageSumStep/MessageSumStep";
import SocketSumStep from "./SocketSumStep/SocketSumStep";
import ApiCallSumStep from "./ApiCallSumStep/ApiCallSumStep";
import ControlStep from "./ControlStep/ControlStep";
import Step from "./Step/Step";
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

class SingleProfile extends Component {

    dateFormat = null;
    fullTimeFormat = null;

    componentDidMount() {
        this.dateFormat = this.props.config.dateFormat;
        this.fullTimeFormat = this.props.config.dateFormat + " " + this.props.config.timeFormat;
    }

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

        return flow;
    };

    txNavClick = (xlog, endtime) => {
        this.props.rowClick({txid:xlog}, moment(new Date(Number(endtime))).format("YYYYMMDD"));
    };

    txLinkClick = (xlog) => {
        this.props.rowClick({txid:xlog}, moment(new Date(Number(this.props.profile.endTime))).format("YYYYMMDD"));
    };

    render() {
        let startTime;
        if (this.props.profile) {
            startTime = Number(this.props.profile.endTime - this.props.profile.elapsed);
        }

        let beforeStepStartTime;

        let nav = null;
        if (this.props.profile) {
            nav = this.getNavData(this.props.profile.endTime, this.props.profile.gxid, this.props.profile.caller, this.props.profile.txid, this.props.steps);
        }
        return (
            <div className='single-profile'>
                <div className="tx-nav">
                    <div className="main">
                        {(nav && nav.main.length > 0) && nav.main.map((d, i) => {
                            return (
                                <div className="tx-link-wrapper" key={i}>
                                    {i !== 0 && <div className="arrow"><i className="fa fa-long-arrow-right" aria-hidden="true"></i></div>}
                                    <div className={"tx-link " + d.type}>
                                        <span className="type">{d.type}</span>
                                        <span className="txid" onClick={this.txNavClick.bind(this, d.id, d.endtime)}>{d.idx}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="sub">
                        {(nav && nav.sub.length > 0) && nav.sub.map((d, i) => {
                            return (
                                <div className="tx-link-wrapper" key={i}>
                                    <div className="arrow"><i className="fa fa-long-arrow-right" aria-hidden="true"></i></div>
                                    <div className="tx-link">
                                        <span className="type">{d.type}</span>
                                        <span className="txid" onClick={this.txNavClick.bind(this, d.id, d.endtime)}>{d.idx}</span>
                                        {d.elapsed >= 0 && <span className="elapsed">{d.elapsed} ms</span>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
                {/*<div className={"sub-title " + (this.props.narrow ? 'narrow' : '')}>GENERAL INFO</div>*/}
                {/*<div className={"xlog-data " + (this.props.wrap ? 'wrap' : '') + (this.props.narrow ? 'narrow' : '')}>*/}
                <div className={"sub-title "}>GENERAL INFO</div>
                <div className={"xlog-data " + (this.props.wrap ? 'wrap' : '')}>
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
                <div className={"xlog-steps " + (this.props.wrap ? 'wrap' : '')}>
                    {this.props.steps && this.props.steps.map((row, i) => {
                        const stepStartTime = Number(row.step.start_time);
                        let gap = 0;
                        if (beforeStepStartTime) {
                            gap = stepStartTime - beforeStepStartTime;
                        }
                        beforeStepStartTime = stepStartTime;

                        return (
                            <Step gap={gap} showGap={this.props.gap} narrow={this.props.narrow} indent={row.step.indent} applyIndent={this.props.indent} key={i}>
                                {row.step.stepType === "9" && <HashedMessageStep txLinkClick={this.txLinkClick} narrow={this.props.narrow} startTime={startTime} row={row}/>}
                                {row.step.stepType === "16" && <Sql3Step txLinkClick={this.txLinkClick} narrow={this.props.narrow} formatter={this.props.formatter} bind={this.props.bind} startTime={startTime} row={row}/>}
                                {row.step.stepType === "2" && <SqlStep txLinkClick={this.txLinkClick} narrow={this.props.narrow} startTime={startTime} row={row}/>}
                                {row.step.stepType === "8" && <Sql2Step txLinkClick={this.txLinkClick} narrow={this.props.narrow} startTime={startTime} row={row}/>}
                                {row.step.stepType === "1" && <MethodStep txLinkClick={this.txLinkClick} narrow={this.props.narrow} startTime={startTime} row={row}/>}
                                {row.step.stepType === "51" && <SpanStep txLinkClick={this.txLinkClick} formatter={this.props.formatter} narrow={this.props.narrow} startTime={startTime} row={row}/>}
                                {row.step.stepType === "52" && <SpanCallStep txLinkClick={this.txLinkClick} formatter={this.props.formatter} narrow={this.props.narrow} startTime={startTime} row={row}/>}
                                {row.step.stepType === "10" && <Method2Step txLinkClick={this.txLinkClick} narrow={this.props.narrow} startTime={startTime} row={row}/>}
                                {row.step.stepType === "3" && <MessageStep txLinkClick={this.txLinkClick} narrow={this.props.narrow} startTime={startTime} row={row}/>}
                                {row.step.stepType === "5" && <SocketStep txLinkClick={this.txLinkClick} narrow={this.props.narrow} startTime={startTime} row={row}/>}
                                {row.step.stepType === "6" && <ApiCallStep txLinkClick={this.txLinkClick} narrow={this.props.narrow} startTime={startTime} row={row}/>}
                                {row.step.stepType === "15" && <ApiCall2Step txLinkClick={this.txLinkClick} narrow={this.props.narrow} startTime={startTime} row={row}/>}
                                {row.step.stepType === "7" && <ThreadSubmitStep txLinkClick={this.txLinkClick} narrow={this.props.narrow} startTime={startTime} row={row}/>}
                                {row.step.stepType === "17" && <ParameterizedMessageStep txLinkClick={this.txLinkClick} narrow={this.props.narrow} startTime={startTime} row={row}/>}
                                {row.step.stepType === "12" && <DumpStep txLinkClick={this.txLinkClick} narrow={this.props.narrow} formatter={this.props.formatter} startTime={startTime} row={row}/>}
                                {row.step.stepType === "13" && <DispatchStep txLinkClick={this.txLinkClick} narrow={this.props.narrow} startTime={startTime} row={row}/>}
                                {(row.step.stepType === "14" && row.step.threaded === "1") && <ThreadCallPossibleStep txLinkClick={this.txLinkClick} narrow={this.props.narrow} startTime={startTime} row={row}/>}
                                {row.step.stepType === "11" && <MethodSumStep txLinkClick={this.txLinkClick} narrow={this.props.narrow} startTime={startTime} row={row}/>}
                                {row.step.stepType === "21" && <SqlSumStep txLinkClick={this.txLinkClick} narrow={this.props.narrow} startTime={startTime} row={row}/>}
                                {row.step.stepType === "31" && <MessageSumStep txLinkClick={this.txLinkClick} narrow={this.props.narrow} startTime={startTime} row={row}/>}
                                {row.step.stepType === "42" && <SocketSumStep txLinkClick={this.txLinkClick} narrow={this.props.narrow} startTime={startTime} row={row}/>}
                                {row.step.stepType === "43" && <ApiCallSumStep txLinkClick={this.txLinkClick} narrow={this.props.narrow} startTime={startTime} row={row}/>}
                                {row.step.stepType === "99" && <ControlStep txLinkClick={this.txLinkClick} narrow={this.props.narrow} startTime={startTime} row={row}/>}
                            </Step>)
                    })}
                </div>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        config: state.config
    };
};

SingleProfile = connect(mapStateToProps, undefined)(SingleProfile);
export default withRouter(SingleProfile);
