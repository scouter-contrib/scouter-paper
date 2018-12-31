import React, {Component} from 'react';
import './FrameStepDetail.css';

import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import * as d3 from "d3";
import sqlFormatter from "sql-formatter";
import JSONPretty from 'react-json-pretty';
import numeral from "numeral";
import moment from "moment";

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

    goStep = (info) => {
        this.props.showDetail(info);
    };

    toggleSqlOption = (option) => {
        let state = Object.assign({}, this.state);
        state[option] = !this.state[option]
        this.setState(state);
    };

    render() {

        console.log(this.props.profile);
        console.log(this.props.info);
        console.log(this.props.steps);

        let prevList = this.props.steps.filter((d) => {
            if (this.props.steps.annotation && this.props.steps.annotation.length > 0) {
                console.log(this.props.steps.annotation);
            }
            return Number(d.step.index) === (this.props.info.step.index - 1);
        });


        let prev = prevList.length > 0 ? prevList[0] : null;

        let nextList = this.props.steps.filter((d) => {
            return Number(d.step.index) === (Number(this.props.info.step.index) + 1);
        });

        let next = nextList.length > 0 ? nextList[0] : null;

        let startTime = this.props.profile.endTime - this.props.profile.elapsed;


        let sql = "";
        if (this.props.info.step.stepType === "16" || this.props.info.step.stepType === "2" || this.props.info.step.stepType === "8") {
            if (this.state.bind) {
                let params = this.props.info.step.param.split(",");
                for (let i = 0; i < params.length; i++) {
                    params[i] = "<span class='param'>" + params[i] + "</span>";
                }
                sql = sqlFormatter.format(this.props.info.mainValue, {
                    params: params,
                    indent: "  "
                });
            } else {
                sql = sqlFormatter.format(this.props.info.mainValue, {
                    indent: "  "
                });
            }

            if (this.props.info.step.xtypePrefix) {
                sql = '<span class="prefix">' + this.props.info.step.xtypePrefix + '</span>' + sql;
            }

        }

        return (
            <div className={'frame-profile-step-detail ' + ("step-type-" + this.props.info.step.stepType)}>
                <div className="title span">
                    <span className="index">{this.props.info.step.index} / {this.props.steps.length}</span>
                    <span className="step-name">{this.props.getStepName(this.props.info.step)}</span>
                </div>
                <div className="close-btn" onClick={this.close}></div>
                <div className="detail-nav noselect">
                    <div className={"prev " + ("step-type-" + (prev && prev.step.stepType))}>
                        {prev && <div className="nav-name"><span>prev</span></div>}
                        {prev && <span onClick={this.goStep.bind(this, prev)} className="span"><i className="fa fa-angle-left" aria-hidden="true"></i> {this.props.getStepName(prev.step)}</span>}
                    </div>
                    <div className={"current " + ("step-type-" + this.props.info.step.stepType)}>
                        <div className="nav-name"><span>current</span></div>
                        <span className="span">{this.props.getStepName(this.props.info.step)}</span>
                    </div>
                    <div className={"next " + ("step-type-" + (next && next.step.stepType))}>
                        {next && <div className="nav-name"><span>next</span></div>}
                        {next && <span onClick={this.goStep.bind(this, next)} className="span">{this.props.getStepName(next.step)} <i className="fa fa-angle-right" aria-hidden="true"></i></span>}
                    </div>
                </div>
                <div className="frame-step-detail-content scrollbar">
                    <div className="frame-row">
                        <div className="sub-detail-title"><span>start</span></div>
                        <div className="main-value">{d3.timeFormat(this.props.config.dateFormat + " " + this.props.config.timeFormat + " %L")(new Date(Number(startTime) + Number(this.props.info.step.start_time)))}</div>
                    </div>
                    {!isNaN(this.props.info.step.elapsed) &&
                    <div className="frame-row">
                        <div className="sub-detail-title"><span>elapsed</span></div>
                        <div className="main-value">{this.props.info.step.elapsed}ms <span className="percentage">({Math.round((this.props.info.step.elapsed / this.props.profile.elapsed) * 1000) / 10}%)</span></div>
                    </div>
                    }
                    {this.props.info.step.error &&
                    <div className="frame-row">
                        <div className="sub-detail-title"><span>ERROR</span></div>
                        <div className="main-value error">{/*this.props.info.step.error*/}HAS ERROR (SCOUTER PAPER NOT YET SUPPORT DISPLAY ERROR MESSAGE)</div>
                    </div>
                    }
                    {this.props.info.step.stepType !== "12" &&
                    <div className="frame-row">
                        <div className="sub-detail-title">
                            <span>value</span>
                            {sql && <div className="sql-btns">
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
                            </div>}
                        </div>
                        <div className="main-value">
                            {(this.props.info.step.stepType === "16" && Number(this.props.info.step.updated) >= 0) &&
                            <span className="value">{'#' + this.props.info.step.updated}</span>}
                            {(this.props.info.step.stepType !== "16" && !isNaN(this.props.info.step.value)) &&
                            <span className="value">{'#' + this.props.info.step.value}</span>}
                            {sql && <div className={"sql-statement " + (this.state.formatter ? 'formatter' : '') + ' ' + (this.state.wrap ? 'wrap' : '')} dangerouslySetInnerHTML={{__html: sql}}></div>}
                            {!sql && <div className="text">{this.props.info && this.props.info.mainValue}</div>}
                        </div>
                    </div>
                    }
                    {this.props.info.step.stepType === "12" &&
                    <div className="frame-row">
                        <div className="sub-detail-title"><span>DUMP</span></div>
                        <div className="main-value dump">
                            {this.props.info.additionalValueList && this.props.info.additionalValueList.map((line, i) => {
                                return <div key={i}>{line}</div>
                            })}
                        </div>
                    </div>
                    }
                    {sql &&
                    <div className="frame-row">
                        <div className="sub-detail-title"><span>PARAMS</span></div>
                        <div className="main-value">
                            {<div className="sql-param">[{this.props.info.step.param}]</div>}
                        </div>
                    </div>
                    }
                    {(this.props.info.step.stepType === "51" || this.props.info.step.stepType === "52") &&
                        <div>
                        {this.props.info.step.localEndpoint.serviceName &&
                        <div className="frame-row">
                            <div className="sub-detail-title"><span>LOCAL ENDPOINT</span></div>
                            <div className="main-value">
                                <div>
                                    <JSONPretty json={this.props.info.step.localEndpoint}></JSONPretty>
                                </div>
                            </div>
                        </div>
                        }
                        {this.props.info.step.remoteEndpoint.serviceName &&
                        <div className="frame-row">
                            <div className="sub-detail-title"><span>REMOTE ENDPOINT</span></div>
                            <div className="main-value">
                                <div>
                                    <JSONPretty json={this.props.info.step.remoteEndpoint}></JSONPretty>
                                </div>
                            </div>
                        </div>
                        }
                        {(this.props.info.step.annotations && this.props.info.step.annotations.length > 0) &&
                        <div className="frame-row">
                            <div className="sub-detail-title"><span>ANNOTATIONS</span></div>
                            <div className="main-value">
                                <div>
                                    <JSONPretty json={this.props.info.step.annotations}></JSONPretty>
                                </div>
                            </div>
                        </div>
                        }
                        {this.props.info.step.tags &&
                            <div className="frame-row">
                                <div className="sub-detail-title"><span>TAGS</span></div>
                                <div className="tags">
                                    <div>
                                        {Object.keys(this.props.info.step.tags).map((key, i) => {
                                            return (<div key={i}>
                                                <div className="tag-key">{key}</div>
                                                <div className="tag-value">{this.props.info.step.tags[key]}</div>
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
        config: state.config
    };
};

FrameStepDetail = connect(mapStateToProps, undefined)(FrameStepDetail);
export default withRouter(FrameStepDetail);
