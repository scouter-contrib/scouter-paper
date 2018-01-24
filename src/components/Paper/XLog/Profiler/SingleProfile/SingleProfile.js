import React, {Component} from 'react';
import './SingleProfile.css';
import {getDate, getHttpProtocol} from '../../../../../common/common';

const profileMetas = [
    {
        key: "txid",
        name: "TXID",
        type: "string",
        show: true
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
        name: "CIty",
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

class SingleProfile extends Component {

    zeroPadding(n, p, c) {
        var pad_char = typeof c !== 'undefined' ? c : '0';
        var pad = new Array(1 + p).join(pad_char);
        return (pad + n).slice(-pad.length);
    }

    render() {
        console.log(this.props.steps);

        let startTime;
        if (this.props.profile) {
            startTime = Number(this.props.profile.endTime - this.props.profile.elapsed);
        }

        let beforeEndTime;
        return (
            <div className='single-profile'>
                <div className="xlog-data">
                    {this.props.profile && profileMetas && profileMetas.map((meta, i) => {
                        if (this.props.summary) {
                            if (meta.show) {
                                return <div key={i}>
                                    <span className="label">{meta.name}</span>
                                    <span className="data">{this.props.profile[meta.key]}</span>
                                </div>

                            } else {
                                return undefined;
                            }
                        } else {
                            return <div key={i}>
                                <span className="label">{meta.name}</span>
                                <span className="data">{this.props.profile[meta.key]}</span>
                            </div>
                        }
                    })}
                </div>
                {(this.props.steps && this.props.steps.length > 0) &&
                <div className="line"></div>
                }
                <div className={"xlog-steps " + (this.props.wrap ? 'wrap' : '')}>
                    {this.props.steps && this.props.steps.map((row, i) => {
                        let found = row.step.stepType === "9" || row.step.stepType === "16";
                        let stepStartTime = Number(startTime) + Number(row.step.start_time);
                        let stepEndTime = startTime + Number(row.step.start_time) + Number(row.step.elapsed);
                        let gap = 0;
                        if (beforeEndTime) {
                            gap = Number(stepStartTime) - Number(beforeEndTime);
                        }
                        beforeEndTime = stepEndTime;
                        return (
                            <div className="step-div" key={i}>
                                {(this.props.gap && gap > 0) && <div className="gap-time">
                                    <div className="arrow"><i className="fa fa-angle-up" aria-hidden="true"></i></div>
                                    <div>{gap} ms</div>
                                    <div className="arrow"><i className="fa fa-angle-down" aria-hidden="true"></i></div>
                                </div>}
                                {row.step.stepType === "9" &&
                                <div className="step hashed-message">
                                    {row.mainValue}
                                </div>}
                                {row.step.stepType === "16" &&
                                <div className="step sql">
                                    <div className="general">
                                        <span className="index">{this.zeroPadding(row.step.index, 5)}</span>
                                        <span className="elapsed">{row.step.elapsed} ms</span>
                                        <span className="start-time">{getDate(new Date(stepStartTime),2)}</span>
                                        <span className="type">SQL</span>
                                    </div>
                                    <div className="sql-statement">{row.step.xtypePrefix} {row.mainValue}</div>
                                    <div className="sql-param">[{row.step.param}]</div>
                                </div>}
                                {!found &&
                                <div className="step others">{row.mainValue}</div>
                                }
                            </div>)
                    })}
                </div>
            </div>
        );
    }
}

export default SingleProfile;