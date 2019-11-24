import React, {Component} from 'react';
import './FrameStepDetail.css';

import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import * as d3 from "d3";
import sqlFormatter from "sql-formatter";
import JSONPretty from 'react-json-pretty';
import jQuery from "jquery";
import {getCurrentUser, getHttpProtocol, getWithCredentials, setAuthHeader} from "../../../../../../common/common";
import moment from "moment/moment";

class FrameStepDetail extends Component {

    dateFormat = null;
    fullTimeFormat = null;

    constructor(props) {
        super(props);

        this.state = {
            bind: true,
            wrap: true,
            formatter:true
        };
    }

    componentDidMount() {
        this.dateFormat = this.props.config.dateFormat;
        this.fullTimeFormat = this.props.config.dateFormat + " " + this.props.config.timeFormat;

        this.setState({
            bind: this.props.bind,
            wrap: this.props.wrap,
            formatter:this.props.formatter
        });
    };

    close = () => {
        this.props.showDetail(null);
    };

    goStep = (index) => {
        this.props.showDetail(index);
    };

    toggleSqlOption = (option) => {
        let state = Object.assign({}, this.state);
        state[option] = !this.state[option]
        this.setState(state);

        if (option === "bind") {
            this.props.toggleBind();
        } else if (option === "wrap") {
            this.props.toggleWrap();
        } else if (option === "formatter") {
            this.props.toggleFormatter();
        }

    };

    getSqlMainValue = (info) => {
        let sql = "";
        if (info.step.stepType === "16") {
            if (this.state.bind) {
                let params = divideParams(info.step.param);
                let {sql: sql0, params: params0} = literalBind(info.mainValue, params);

                for (let i = 0; i < params0 && params0.length; i++) {
                    params0[i] = "<span class='param'>" + params0[i] + "</span>";
                }
                sql = sqlFormatter.format(sql0, {
                    params: params0,
                    indent: "  "
                });

            } else {
                sql = sqlFormatter.format(info.mainValue, {
                    indent: "  "
                });
            }

            sql = '<span class="prefix">' + info.step.xtypePrefix + '</span>' + sql;
        } else {
            if (this.state.bind) {
                let params = info.step.param.split(",");
                for (let i = 0; i < params.length; i++) {
                    params[i] = "<span class='param'>" + params[i] + "</span>";
                }
                sql = sqlFormatter.format(info.mainValue, {
                    params: params,
                    indent: "  "
                });
            } else {
                sql = sqlFormatter.format(info.mainValue, {
                    indent: "  "
                });
            }

            if (info.step.xtypePrefix) {
                sql = '<span class="prefix">' + info.step.xtypePrefix + '</span>' + sql;
            }
        }


        return sql;
    };
    getError(error){
        let ret = '';
        const {endTime} = this.props.profile;
        jQuery.ajax({
            method: "GET",
            async: false,
            dataType: "json",
            url: `${getHttpProtocol(this.props.config)}/scouter/v1/dictionary/${moment(new Date(Number(endTime))).format("YYYYMMDD")}?dictKeys=[error:${error}]`,
            xhrFields: getWithCredentials(this.props.config),
            beforeSend: (xhr)=>{
                setAuthHeader(xhr, this.props.config, getCurrentUser(this.props.config, this.props.user));
            }
        }).done(data=>{
            const res = data.result[0];
            if(res) {
                ret = res.text
            }
        });
        return ret ? ret : 'HAS ERROR (DISPLAY ERROR MESSAGE IS NOT YET SUPPORTED)';
    }
    render() {

        let selectedIndex = this.props.selectedIndex;
        let info = this.props.steps[selectedIndex];

        let stepLength = this.props.steps.length;
        let startTime = this.props.profile.endTime - this.props.profile.elapsed;
        let timeFormatter = d3.timeFormat(this.props.config.dateFormat + " " + this.props.config.timeFormat + " %L");
        let stepElapsedTime = this.props.getElapsedTime(info);
        let prev = null;
        if (selectedIndex > 0) {
            prev = this.props.steps[selectedIndex - 1];
        }

        let next = null;
        if (selectedIndex < stepLength - 1) {
            next = this.props.steps[selectedIndex + 1];
        }

        let isSql = false;
        if (info.step.stepType === "16" || info.step.stepType === "2" || info.step.stepType === "8") {
            isSql = true;
        }

        let isZipkin = false;
        if (info.step.stepType === "51" || info.step.stepType === "52") {
            isZipkin = true;
        }

        return (
            <div className={"frame-profile-step-detail step-type-" + info.step.stepType}>
                <div className="title span">
                    <span className="index">{selectedIndex} / {this.props.steps.length - 1}</span>
                    <span className="step-name">{this.props.getStepName(info.step)}</span>
                </div>
                <div className="close-btn" onClick={this.close}></div>
                <div className="detail-nav noselect">
                    <div className={"prev step-type-" + (prev && prev.step.stepType)}>
                        {prev && <div className="nav-name"><span>prev</span></div>}
                        {prev && <span onClick={this.goStep.bind(this, selectedIndex - 1)} className="span span-bg-color"><i className="fa fa-angle-left" aria-hidden="true"></i> {this.props.getStepName(prev.step)}</span>}
                    </div>
                    <div className={"current step-type-" + info.step.stepType}>
                        <div className="nav-name"><span>current</span></div>
                        <span className="span span-bg-color">{this.props.getStepName(info.step)}</span>
                    </div>
                    <div className={"next step-type-" + (next && next.step.stepType)}>
                        {next && <div className="nav-name"><span>next</span></div>}
                        {next && <span onClick={this.goStep.bind(this, selectedIndex + 1)} className="span span-bg-color">{this.props.getStepName(next.step)} <i className="fa fa-angle-right" aria-hidden="true"></i></span>}
                    </div>
                </div>
                <div className="frame-step-detail-content scrollbar">
                    <div className="frame-row">
                        <div className="sub-detail-title"><span>start time</span></div>
                        <div className="main-value"><span className="gab-from-start">(+{Number(info.step.start_time)}ms) <i className="fa fa-long-arrow-right" aria-hidden="true"></i></span><span className="step-start-time">{timeFormatter(new Date(Number(startTime) + Number(info.step.start_time)))}</span></div>
                    </div>
                    {stepElapsedTime !== undefined &&
                    <div className="frame-row">
                        <div className="sub-detail-title"><span>step elapsed time</span></div>
                        <div className="main-value">{stepElapsedTime}ms <span className="percentage">({Math.round((stepElapsedTime / this.props.profile.elapsed) * 1000) / 10}%)</span></div>
                    </div>
                    }
                    {(info.step.error && Number(info.step.error) !== 0) &&
                    <div className="frame-row">
                        <div className="sub-detail-title"><span>ERROR</span></div>
                        <div className="main-value error">{this.getError(info.step.error)}</div>
                    </div>
                    }
                    {info.step.stepType === "12" &&  // DUMP라면
                    <div className="frame-row">
                        <div className="sub-detail-title"><span>DUMP</span></div>
                        <div className="main-value dump">
                            {info.additionalValueList && info.additionalValueList.map((line, i) => {
                                return <div key={i}>{line}</div>
                            })}
                        </div>
                    </div>
                    }
                    {info.step.stepType !== "12" && // DUMP가 아니면
                    <div className="frame-row">
                        <div className="sub-detail-title">
                            <span>{isSql ? "sql" : "value"}</span>
                            {isSql && // SQL 인경우 버튼 추가
                            <div className="sql-btns">
                                <div onClick={this.toggleSqlOption.bind(this, "bind")} className={this.state.bind ? "active" : ""}>
                                    <span className="icon no-active"><i className="fa fa-circle-o"></i></span>
                                    <span className="icon active"><i className="fa fa-check-circle"></i></span>
                                    <span>BIND</span>
                                </div>
                                <div onClick={this.toggleSqlOption.bind(this, "wrap")} className={this.state.wrap ? "active" : ""}>
                                    <span className="icon no-active"><i className="fa fa-circle-o"></i></span>
                                    <span className="icon active"><i className="fa fa-check-circle"></i></span>
                                    <span>WRAP</span>
                                </div>
                                <div onClick={this.toggleSqlOption.bind(this, "formatter")} className={this.state.formatter ? "active" : ""}>
                                    <span className="icon no-active"><i className="fa fa-circle-o"></i></span>
                                    <span className="icon active"><i className="fa fa-check-circle"></i></span>
                                    <span>FORMATTER</span>
                                </div>
                            </div>
                            }
                        </div>
                        <div className="main-value">
                            {isSql && <div className={"sql-statement " + (this.state.formatter ? 'formatter' : '') + ' ' + (this.state.wrap ? 'wrap' : '')} dangerouslySetInnerHTML={{__html: this.getSqlMainValue(info)}}></div>}
                            {!isSql && <div className="text">{info && this.props.getMainValue(info)}</div>}
                        </div>
                    </div>
                    }
                    {isSql &&
                    <div className="frame-row">
                        <div className="sub-detail-title"><span>PARAMS</span></div>
                        <div className="main-value">
                            {<div className="sql-param">[{info.step.param}]</div>}
                        </div>
                    </div>
                    }
                    {(isSql && info.step.stepType === "16" && Number(info.step.updated) >= 0) &&
                    <div className="frame-row">
                        <div className="sub-detail-title"><span>AFFECTED ROW COUNT</span></div>
                        <div className="main-value">{info.step.updated}</div>
                    </div>
                    }

                    {info.step.stepType === "21" &&
                    <div className="frame-row">
                        <div className="sub-detail-title"><span>SQL PARAM</span></div>
                        <div className="main-value">[{info.step.param}]</div>
                    </div>
                    }
                    {info.step.stepType === "21" &&
                    <div className="frame-row">
                        <div className="sub-detail-title"><span>SQL PARAM ERROR</span></div>
                        <div className="main-value">[{info.step.param_error}]</div>
                    </div>
                    }
                    {isZipkin &&
                    <div>
                        {info.step.localEndpoint.serviceName &&
                        <div className="frame-row">
                            <div className="sub-detail-title"><span>LOCAL ENDPOINT</span></div>
                            <div className="main-value">
                                <div>
                                    <JSONPretty json={info.step.localEndpoint}></JSONPretty>
                                </div>
                            </div>
                        </div>
                        }
                        {info.step.remoteEndpoint.serviceName &&
                        <div className="frame-row">
                            <div className="sub-detail-title"><span>REMOTE ENDPOINT</span></div>
                            <div className="main-value">
                                <div>
                                    <JSONPretty json={info.step.remoteEndpoint}></JSONPretty>
                                </div>
                            </div>
                        </div>
                        }
                        {(info.step.annotations && info.step.annotations.length > 0) &&
                        <div className="frame-row">
                            <div className="sub-detail-title"><span>ANNOTATIONS</span></div>
                            <div className="main-value">
                                <div>
                                    <JSONPretty json={info.step.annotations}></JSONPretty>
                                </div>
                            </div>
                        </div>
                        }
                        {info.step.tags &&
                        <div className="frame-row">
                            <div className="sub-detail-title"><span>TAGS</span></div>
                            <div className="tags">
                                <div>
                                    {Object.keys(info.step.tags).map((key, i) => {
                                        return (<div key={i}>
                                            <div className="tag-key">{key}</div>
                                            <div className="tag-value">{info.step.tags[key]}</div>
                                        </div>)
                                    })}
                                </div>
                            </div>
                        </div>
                        }
                    </div>
                    }
                </div>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        config: state.config,
        user: state.user
    };
};

FrameStepDetail = connect(mapStateToProps, undefined)(FrameStepDetail);
export default withRouter(FrameStepDetail);

function divideParams(params) {
    if(!params) return;

    const paramArray = [];

    let start = 0;
    let isQ = false;
    let isDQ = false;

    Array.from(params).forEach((ch, i) => {
        if (ch === ',' && !isQ && !isDQ) {
            paramArray.push(params.substring(start, i));
            start = i + 1;

        } else if (ch === "'" && !isDQ) {
            isQ = !isQ;

        } else if (ch === '"' && !isQ) {
            isDQ = !isDQ;
        }
    });
    paramArray.push(params.substring(start));

    return paramArray;
}


function literalBind(sql, params) {
    if(!params) return {sql: sql, params: []};
    if(!sql) return {sql: sql, params: params};

    const re = /@{\d+}/g;

    let boundSql = "";
    let pos = 0;
    let index = 0;

    while(true) {
        let matched = re.exec(sql);
        if (matched) {
            boundSql = boundSql
                + sql.substring(pos, matched.index)
                + stripSideChar(params[index], "'");

            pos = matched.index + matched[0].length;
            index++;

        } else {
            break;
        }
    }

    boundSql = boundSql + sql.substring(pos);

    return {
        sql: boundSql,
        params: params.slice(index)
    }

}

function stripSideChar(str, ch) {
    if (!str) {
        return str;
    }
    if (str[0] === ch && str[str.length - 1] === ch) {
        return str.substring(1, str.length -1);
    }

    return str;
}