import React, {Component} from 'react';
import './Profiler.css';
import {addRequest, setControlVisibility, pushMessage} from '../../../../actions';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import jQuery from "jquery";
import {
    setTxidPropsToUrl,
    getFilteredData,
    getHttpProtocol,
    errorHandler,
    getWithCredentials,
    setAuthHeader,
    getSearchDays,
    getDivideDays,
    getParam,
    getCurrentUser,
    getFilteredData0
} from '../../../../common/common';
import SingleProfile from "./SingleProfile/SingleProfile";
import ProfileList from "./ProfileList/ProfileList";
import _ from "lodash";
import moment from "moment";
import copy from 'copy-to-clipboard';
//import {disableBodyScroll, enableBodyScroll} from 'body-scroll-lock';

const xlogMaxSelectionCount = 200;

class Profiler extends Component {

    txidInit = false;
    constructor(props) {
        super(props);

        // URL로부터 TXID와 날짜를 세팅
        let txid = getParam(this.props, "txid");
        let txiddate = getParam(this.props, "txiddate");

        let options = this.getProfilerOptions();
        if (options) {
            options.summary = options.summary === undefined ? true : options.summary;
            options.indent = options.indent === undefined ? true : options.indent;
            options.bind = options.bind === undefined ? true : options.bind;
            options.wrap = options.wrap === undefined ? true : options.wrap;
            options.gap = options.gap === undefined ? true : options.gap;
            options.formatter = options.formatter === undefined ? true : options.formatter;
        } else {
            options = {
                summary: true,
                indent: true,
                bind: true,
                wrap: true,
                gap: true,
                formatter : true
            }
        }

        this.state = {
            show: false,
            xlogs: [],
            last: null,
            txid: null,
            profile: null,
            steps: null,
            summary: options.summary,
            indent: options.indent,
            bind: options.bind,
            wrap: options.wrap,
            gap: options.gap,
            formatter: options.formatter,
            listWidth : 40,
            smallScreen : false,
            paramTxid : txid ? txid : null,
            paramTxidDate : txiddate ? txiddate : null,
            copyBtnText : "COPY URL"
        };
    }

    keyDown = (event) => {
        if (event.keyCode === 27) {
            this.close();
        }
    };

    componentDidMount() {
        window.addEventListener("resize", this.updateDimensions);
        window.addEventListener("keydown", this.keyDown.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions);
        window.removeEventListener("keydown", this.keyDown.bind(this));
    }

    shouldComponentUpdate(nextProps, nextState) {

        if (JSON.stringify(nextProps.selection) !== JSON.stringify(this.props.selection)) {
            return true;
        }

        if (this.state.listWidth !== nextState.listWidth) {
            return true;
        }

        if (this.state.smallScreen !== nextState.smallScreen) {
            return true;
        }

        if (nextState.last !== this.state.last) {
            return true;
        }

        if (nextState.show !== this.state.show) {
            return true;
        }

        if (nextState.txid !== this.state.txid) {
            return true;
        }

        if (JSON.stringify(nextState.profile) !== JSON.stringify(this.state.profile)) {
            return true;
        }

        if (JSON.stringify(nextState.steps) !== JSON.stringify(this.state.steps)) {
            return true;
        }

        if (nextState.summary !== this.state.summary) {
            return true;
        }

        if (nextState.indent !== this.state.indent) {
            return true;
        }

        if (nextState.bind !== this.state.bind) {
            return true;
        }

        if (nextState.wrap !== this.state.wrap) {
            return true;
        }

        if (nextState.gap !== this.state.gap) {
            return true;
        }

        if (nextState.formatter !== this.state.formatter) {
            return true;
        }

        if (nextState.copyBtnText !== this.state.copyBtnText) {
            return true;
        }

        return false;
    }


    updateDimensions = () => {
        let width = document.querySelector("body").clientWidth;
        let smallScreen = false;
        if (width < 801) {
            smallScreen = true;
        }

        if (this.state.smallScreen !== smallScreen) {
            this.setState({
                smallScreen : smallScreen
            })
        }
    };

    componentWillReceiveProps(nextProps) {
        if (this.state.paramTxid === null && (nextProps.selection.x1 === null || nextProps.selection.x2 === null || nextProps.selection.y1 === null || nextProps.selection.y2 === null)) {
            this.setState({
                show: false
            });
        } else {

            if (this.state.paramTxid === null) {
                if (JSON.stringify(nextProps.selection) !== JSON.stringify(this.props.selection)) {
                    let x1 = nextProps.selection.x1;
                    let x2 = nextProps.selection.x2;
                    let y1 = nextProps.selection.y1;
                    let y2 = nextProps.selection.y2;
                    let filter = nextProps.selection.filter;
                    this.getList(x1, x2, y1, y2, filter);
                }
            } else {
                if (!this.txidInit) {
                    this.txidInit = true;

                    this.setState({
                        show: true
                    });

                    this.rowClick({
                        txid : this.state.paramTxid
                    }, this.state.paramTxidDate);
                }

            }

        }
    }

    /*componentDidUpdate(prevProps, prevState) {
        if (this.state.show !== prevState.show) {
            if (this.state.show) {
                disableBodyScroll(document.querySelector("body"));
            } else {
                enableBodyScroll(document.querySelector("body"));
            }
        }
    }*/

    setProfilerOptions = (key, value) => {
        let options = this.getProfilerOptions();
        if (!options) {
            options = {};
        }
        options[key] = value;
        localStorage && localStorage.setItem("profilerOptions", JSON.stringify(options));
    };

    getProfilerOptions = () => {
        if (localStorage) {
            let topologyOptions = localStorage.getItem("profilerOptions");
            if (topologyOptions) {
                return JSON.parse(topologyOptions);
            }
        }

        return null;
    };

    getList = (x1, x2, y1, y2, filter) => {
        let days = getSearchDays(x1, x2);
        let fromTos = getDivideDays(x1, x2);

        if (days > 1) {
            this.setState({
                xlogs: []
            });

            for (let i = 0; i < fromTos.length; i++) {
                this.getListData(fromTos[i].from, fromTos[i].to , y1, y2, true, filter);
            }

        } else {
            this.getListData(x1, x2, y1, y2, false, filter);
        }
    };


    // search의 경우, 마지막 newXLogs가 allXLogs에 들어 있는 문제 있음
    getListData = async (x1, x2, y1, y2, append, filter) => {
        let that = this;
        let allXLogs = that.props.xlogs;
        let newXLogs = that.props.newXLogs;

        let filtered = [];

        if (this.props.realtime) {
            let filtered1 = _(allXLogs)
                .filter(x => x1 <= x.endTime * 1 && x.endTime * 1 <= x2 && y1 <= x.elapsed * 1 && x.elapsed * 1 <= y2)
                .take(xlogMaxSelectionCount).value();

            let last =  xlogMaxSelectionCount - filtered1.length;
            let filtered2 = [];
            if (last > 0) {
                filtered2 = _(newXLogs)
                    .filter(x => x1 <= x.endTime * 1 && x.endTime * 1 <= x2 && y1 <= x.elapsed * 1 && x.elapsed * 1 <= y2)
                    .take(xlogMaxSelectionCount).value();
            }

            if (filtered1.length === 0 && filtered2.length === 0) {
                return;
            }

            filtered = [].concat(filtered1, filtered2);

        } else {
            const filtered1 = _(allXLogs)
                .filter(x => x1 <= x.endTime * 1 && x.endTime * 1 <= x2 && y1 <= x.elapsed * 1 && x.elapsed * 1 <= y2)
                .take(xlogMaxSelectionCount).value();

            if (filtered1.length === 0) {
                return;
            }

            filtered = filtered1;

        }

        filtered = await getFilteredData0(filtered, filter);

        let date = moment(new Date(x1)).format("YYYYMMDD");

        this.props.setControlVisibility("Loading", true);
        this.props.addRequest();
        jQuery.ajax({
            method: "GET",
            async: true,
            url: getHttpProtocol(this.props.config) + '/scouter/v1/xlog-data/' + date + '/multi/' + filtered.map(x => x.txid).toString(),
            xhrFields: getWithCredentials(that.props.config),
            beforeSend: function (xhr) {
                setAuthHeader(xhr, that.props.config, getCurrentUser(that.props.config, that.props.user));
            }
        }).done((msg) => {

            let list = msg.result;

            if (list && list.length > 0) {

                let objectMap = {};
                for (let i = 0; i < this.props.objects.length; i++) {
                    objectMap[this.props.objects[i].objHash] = this.props.objects[i].objName;
                }

                let xlogs = (append ? this.state.xlogs : []);
                for (let i = 0; i < list.length; i++) {
                    let xlog = list[i];
                    let elapsed = Number(xlog.elapsed);
                    if (y1 <= elapsed && y2 >= elapsed) {
                        xlog.objName = objectMap[xlog.objHash];
                        xlogs.push(xlog);
                    }
                }

                if (xlogs && xlogs.length > 0) {
                    this.setState({
                        show: true,
                        xlogs: xlogs,
                        last: (new Date()).getTime()
                    });
                } else {
                    this.setState({
                        show: false
                    });
                }

            }

        }).fail((xhr, textStatus, errorThrown) => {
            errorHandler(xhr, textStatus, errorThrown, this.props);
        }).always(() => {
            this.props.setControlVisibility("Loading", false);
        });
    };

    close = () => {
        this.setState({
            show: false,
            xlogs: [],
            last: null,
            txid: null,
            profile: null,
            steps: null,
            paramTxid : null,
            paramTxidDate: null
        });

        let search = new URLSearchParams(this.props.location.search);

        search.delete("txid");
        search.delete("txiddate");

        setTxidPropsToUrl(this.props, null, null);

        this.props.history.replace({
            pathname: this.props.location.pathname,
            search: "?" + search.toString()
        });
    };

    rowClick = (xlog, txiddate) => {

        let that = this;

        if (!txiddate) {
            if (this.state.txid === xlog.txid) {
                this.setState({
                    txid: null
                });
            } else {
                this.setState({
                    txid: xlog.txid
                });
            }
        }

        let tdate = (txiddate ? txiddate : moment(new Date(Number(xlog.endTime))).format("YYYYMMDD"));
        setTxidPropsToUrl(this.props, tdate, xlog.txid);

        // XLOG DATA
        this.props.setControlVisibility("Loading", true);
        this.props.addRequest();
        jQuery.ajax({
            method: "GET",
            async: true,
            url: getHttpProtocol(this.props.config) + '/scouter/v1/xlog-data/' + tdate + "/" + xlog.txid,
            xhrFields: getWithCredentials(that.props.config),
            beforeSend: function (xhr) {
                setAuthHeader(xhr, that.props.config, getCurrentUser(that.props.config, that.props.user));
            }
        }).done((msg) => {
            this.setState({
                profile: msg.result
            });

            // Profile Data
            this.props.addRequest();
            jQuery.ajax({
                method: "GET",
                async: true,
                url: getHttpProtocol(this.props.config) + '/scouter/v1/profile-data/' + (txiddate ? txiddate : moment(new Date(Number(xlog.endTime))).format("YYYYMMDD")) + "/" + xlog.txid,
                xhrFields: getWithCredentials(that.props.config),
                beforeSend: function (xhr) {
                    setAuthHeader(xhr, that.props.config, getCurrentUser(that.props.config, that.props.user));
                }
            }).done((msg) => {
                const orderedSteps = _.orderBy(msg.result, (e) => Number(e.step.order), ['asc']);
                this.addIndentPropertyTo(orderedSteps);

                const eos = {
                    mainValue: "end of service",
                    additionalValueList: [],
                    step: {
                        parent: "-1",
                        index: orderedSteps.length + 1,
                        start_time: this.state.profile.elapsed,
                        start_cpu: "0",
                        message: "end of service",
                        stepType: "3",
                        order: orderedSteps.length + 1,
                        stepTypeName: "MESSAGE"
                    }
                };
                orderedSteps.push(eos);
                this.setState({
                    steps: orderedSteps
                });

            }).fail((xhr, textStatus, errorThrown) => {
                errorHandler(xhr, textStatus, errorThrown, this.props);
            }).always(() => {
                this.props.setControlVisibility("Loading", false);
            });
        }).fail((xhr, textStatus, errorThrown) => {
            errorHandler(xhr, textStatus, errorThrown, this.props);
            this.props.setControlVisibility("Loading", false);
        });
    };

    addIndentPropertyTo(orderedSteps) {
        const indentMap = {};
        orderedSteps.forEach((v) => {
            const indent = indentMap.hasOwnProperty(v.step.parent) ? indentMap[v.step.parent] + 1 : 0;
            indentMap[v.step.index] = indent;
            v.step.indent = indent;
        });
    }

    toggleSummary = () => {
        this.setState({
            summary: !this.state.summary
        });
        this.setProfilerOptions("summary", !this.state.summary);
    };

    toggleIndent = () => {
        this.setState({
            indent: !this.state.indent
        });
        this.setProfilerOptions("indent", !this.state.indent);
    };

    toggleBind = () => {
        this.setState({
            bind: !this.state.bind
        });
        this.setProfilerOptions("bind", !this.state.bind);
    };

    toggleWrap = () => {
        this.setState({
            wrap: !this.state.wrap
        });
        this.setProfilerOptions("wrap", !this.state.wrap);
    };

    toggleGap = () => {
        this.setState({
            gap: !this.state.gap
        });
        this.setProfilerOptions("gap", !this.state.gap);
    };

    toggleFormatter = () => {
        this.setState({
            formatter: !this.state.formatter
        });
        this.setProfilerOptions("formatter", !this.state.formatter);
    };

    changeListWidth = (e) => {
        let listWidth = this.state.listWidth;

        if (e === "min") {
            listWidth = 0;
        }

        if (e === "max") {
            listWidth = 100;
        }

        if (e === "small") {
            listWidth -= 20;

            if (listWidth < 0) {
                listWidth = 0;
            }
        }

        if (e === "big") {
            listWidth += 20;

            if (listWidth > 100) {
                listWidth = 100;
            }
        }

        this.setState({
            listWidth : listWidth
        });
    };

    clearTxId = () => {
        this.setState({
            txid: null
        });
    };

    copyUrl = () => {
        copy(window.location.href);

        this.setState({
            copyBtnText : "COPIED!"
        });

        setTimeout(() => {
            this.setState({
                copyBtnText : "COPY URL"
            });
        }, 2000);
    };

    render() {

        let leftStyle = {};
        let rightStyle = {};
        if (!this.state.paramTxid) {
            if (this.state.smallScreen) {
                if (this.state.txid) {
                    leftStyle = {width : "100%", display : "none"};
                    rightStyle= {width : "100%", display : "inline-block"};
                } else {
                    leftStyle = {width : "100%", display : "inline-block"};
                    rightStyle= {width : "100%", display : "none"};
                }
            } else {
                leftStyle = {width : this.state.listWidth + "%", display : this.state.listWidth === 0 ? "none" : "inline-block"};
                rightStyle = {width : (100 - this.state.listWidth) + "%", display : this.state.listWidth === 100 ? "none" : "inline-block"}
            }
        }

        return (
            <div className={"xlog-profiler " + (this.state.paramTxid ? 'param-mode ' : ' ') + (this.state.show ? ' ' : 'hidden')}>
                <div>
                    <div className="size-control-btns">
                        {!this.state.paramTxid && <button onClick={this.changeListWidth.bind(this, "min")}><i className="fa fa-angle-double-left"></i></button>}
                        {!this.state.paramTxid && <button onClick={this.changeListWidth.bind(this, "small")}><i className="fa fa-angle-left"></i></button>}
                        {!this.state.paramTxid && <button onClick={this.changeListWidth.bind(this, "big")}><i className="fa fa-angle-right"></i></button>}
                        {!this.state.paramTxid && <button onClick={this.changeListWidth.bind(this, "max")}><i className="fa fa-angle-double-right"></i></button>}
                        <div className="close-btn" onClick={this.close}></div>
                    </div>
                    {!this.state.paramTxid &&
                    <div className="profiler-layout left" style={leftStyle}>
                        <div className="summary">
                            <div className="title">PROFILER</div>
                            <div className="list-summary">{this.state.xlogs.length} ROWS</div>
                            <div className="close-btn" onClick={this.close}></div>
                        </div>
                        <div className="profile-list scrollbar">
                            <ProfileList txid={this.state.txid} xlogs={this.state.xlogs} rowClick={this.rowClick}/>
                        </div>
                    </div>
                    }
                    <div className="profiler-layout right" style={rightStyle}>
                        <div className="summary">
                            {(!this.state.paramTxid && this.state.smallScreen) && <div onClick={this.clearTxId.bind(this)} className="profile-list-btn"><i className="fa fa-chevron-circle-left"></i></div>}
                            {this.state.txid  && <div className="title">DETAIL <span className="selected-info">({this.state.txid ? 'TXID : ' + this.state.txid : 'NO PROFILE SELECTED'})</span>{this.state.txid ? <span className="copy-url-btn" onClick={this.copyUrl}>{this.state.copyBtnText}</span> : null}</div>}
                            {this.state.paramTxid  && <div className="title">DETAIL <span className="selected-info">({this.state.paramTxid ? 'TXID : ' + this.state.paramTxid : 'NO PROFILE SELECTED'})</span>{this.state.paramTxid ? <span className="copy-url-btn" onClick={this.copyUrl}>{this.state.copyBtnText}</span> : null}</div>}
                            <div className="profile-steps-control noselect">
                                <div className={"profile-control-btn " + (this.state.summary ? 'active' : '')} onClick={this.toggleSummary}>{this.state.summary ? <i className="fa fa-check-circle"></i> : <i className="fa fa-circle-o"></i>} SUMMARY</div>
                                <div className={"profile-control-btn " + (this.state.indent ? 'active' : '')} onClick={this.toggleIndent}>{this.state.indent ? <i className="fa fa-check-circle"></i> : <i className="fa fa-circle-o"></i>} INDENT</div>
                                <div className={"profile-control-btn " + (this.state.bind ? 'active' : '')} onClick={this.toggleBind}>{this.state.bind ? <i className="fa fa-check-circle"></i> : <i className="fa fa-circle-o"></i>} BIND</div>
                                <div className={"profile-control-btn " + (this.state.wrap ? 'active' : '')} onClick={this.toggleWrap}>{this.state.wrap ? <i className="fa fa-check-circle"></i> : <i className="fa fa-circle-o"></i>} WRAP</div>
                                <div className={"profile-control-btn " + (this.state.gap ? 'active' : '')} onClick={this.toggleGap}>{this.state.gap ? <i className="fa fa-check-circle"></i> : <i className="fa fa-circle-o"></i>} GAP</div>
                                <div className={"profile-control-btn " + (this.state.formatter ? 'active' : '')} onClick={this.toggleFormatter}>{this.state.formatter ? <i className="fa fa-check-circle"></i> : <i className="fa fa-circle-o"></i>} FORMATTER</div>
                            </div>
                            <div className="close-btn" onClick={this.close}></div>
                        </div>
                        <div className={"profile-steps"}>
                            <div className="profile-steps-content scrollbar">
                                {(this.state.paramTxid || this.state.txid) && <SingleProfile txid={this.state.txid} profile={this.state.profile} steps={this.state.steps} summary={this.state.summary} indent={this.state.indent} bind={this.state.bind} wrap={this.state.wrap} gap={this.state.gap} formatter={this.state.formatter}/>}
                                {(!this.state.paramTxid && !this.state.txid) && <div className="no-profile"><div>NO PROFILE SELECTED</div></div>}
                                </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        objects: state.target.objects,
        config: state.config,
        user: state.user
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        addRequest: () => dispatch(addRequest()),
        pushMessage: (category, title, content) => dispatch(pushMessage(category, title, content)),
        setControlVisibility: (name, value) => dispatch(setControlVisibility(name, value)),
    };
};

Profiler = connect(mapStateToProps, mapDispatchToProps)(Profiler);
export default withRouter(Profiler);
