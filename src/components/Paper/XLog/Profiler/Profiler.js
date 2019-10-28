import React, {Component} from 'react';
import './Profiler.css';
import {addRequest, setControlVisibility, pushMessage} from '../../../../actions';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import jQuery from "jquery";
import {
    setTxidPropsToUrl,
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
import FrameProfile from "./FrameProfile/FrameProfile";
import ProfileList from "./ProfileList/ProfileList";
import _ from "lodash";
import moment from "moment";
import copy from 'copy-to-clipboard';
import {IdAbbr} from "../../../../common/idAbbr";
import SplitterLayout from 'react-splitter-layout';
import 'react-splitter-layout/lib/index.css';

const xlogMaxSelectionCount = 200;

class Profiler extends Component {

    txidInit = false;
    layoutChangeTimer = null;

    constructor(props) {
        super(props);

        // URL로부터 TXID와 날짜를 세팅
        let txid = getParam(this.props, "txid");
        let txiddate = getParam(this.props, "txiddate");

        let options = this.getProfilerOptions();
        if (options) {
            options.summary = options.summary === undefined ? true : options.summary;
            options.narrow = options.narrow === undefined ? false : options.narrow;
            options.bind = options.bind === undefined ? true : options.bind;
            options.wrap = options.wrap === undefined ? false : options.wrap;
            options.formatter = options.formatter === undefined ? true : options.formatter;
        } else {
            options = {
                summary: true,
                narrow: false,
                bind: true,
                wrap: false,
                formatter: true
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
            narrow: options.narrow,
            bind: options.bind,
            wrap: options.wrap,
            formatter: options.formatter,
            smallScreen: false,
            paramTxid: txid ? txid : null,
            paramTxidDate: txiddate ? txiddate : null,
            copyBtnText: "COPY URL",
            rightWidth : 60
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

        if (nextState.narrow !== this.state.narrow) {
            return true;
        }

        if (nextState.bind !== this.state.bind) {
            return true;
        }

        if (nextState.wrap !== this.state.wrap) {
            return true;
        }

        if (nextState.formatter !== this.state.formatter) {
            return true;
        }

        if (nextState.copyBtnText !== this.state.copyBtnText) {
            return true;
        }

        if (nextState.rightWidth !== this.state.rightWidth) {
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
                smallScreen: smallScreen
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
                    this.getList(x1, x2, y1, y2, filter, nextProps.filterMap);
                }
            } else {
                if (!this.txidInit) {
                    this.txidInit = true;

                    this.setState({
                        show: true
                    });

                    this.rowClick({
                        txid: this.state.paramTxid
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

    getList = (x1, x2, y1, y2, filter, filterMap) => {
        let days = getSearchDays(x1, x2);
        let fromTos = getDivideDays(x1, x2);

        if (days > 1) {
            this.setState({
                xlogs: []
            });

            for (let i = 0; i < fromTos.length; i++) {
                this.getListData(fromTos[i].from, fromTos[i].to, y1, y2, true, filter, filterMap);
            }

        } else {
            this.getListData(x1, x2, y1, y2, false, filter, filterMap);
        }
    };


    // search의 경우, 마지막 newXLogs가 allXLogs에 들어 있는 문제 있음
    getListData = async (x1, x2, y1, y2, append, filter, filterMap) => {
        let that = this;
        let allXLogs = that.props.xlogs;
        let newXLogs = that.props.newXLogs;

        let filtered = [];

        if (this.props.realtime) {
            let filtered1 = _(allXLogs)
                .filter(x => x1 <= x.endTime * 1 && x.endTime * 1 <= x2 && y1 <= x.elapsed * 1 && x.elapsed * 1 <= y2)
                .take(xlogMaxSelectionCount).value();

            let last = xlogMaxSelectionCount - filtered1.length;
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

        filtered = filtered.filter((d) => {
            return filterMap[d.objHash];
        });
        //- 필터링 되어 비어있는 영역의 xlog 부터 카운팅이 0 인경우 조회 하지 않고 리턴
        if( filtered.length === 0 ){
            return;
        }

        // remove duplication txid
        let strTxid = filtered.map(x => x.txid).reduce(function(a,b){ if(a.indexOf(b) < 0) a.push(b); return a;},[]);

        let date = moment(new Date(x1)).format("YYYYMMDD");

        this.props.setControlVisibility("Loading", true);
        this.props.addRequest();
        jQuery.ajax({
            method: "GET",
            async: true,
            url: getHttpProtocol(this.props.config) + '/scouter/v1/xlog-data/' + date + '/multi/' + strTxid,
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
            errorHandler(xhr, textStatus, errorThrown, this.props, "getListData", true);
        }).always(() => {
            setTimeout(() => {
                this.props.setControlVisibility("Loading", false);
            }, 300);
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
            paramTxid: null,
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
        } else {
            this.setState({
                txid: xlog.txid
            });
        }

        if (this.refs.profileStepsContent) {
            this.refs.profileStepsContent.scrollTop = 0;
        }

        const tdate = (txiddate ? txiddate : moment(new Date(Number(xlog.endTime))).format("YYYYMMDD"));

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
            if (msg.result) {
                setTxidPropsToUrl(this.props, tdate, xlog.txid);
                msg.result.txidAbbr = IdAbbr.abbr(msg.result.txid);

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
                    this.addTxidAbbrPropertyTo(orderedSteps);

                    const eos = {
                        mainValue: "end of service",
                        additionalValueList: [],
                        step: {
                            parent: "-1",
                            index: orderedSteps.length,
                            start_time: this.state.profile && this.state.profile.elapsed,
                            start_cpu: "0",
                            message: "end of service",
                            stepType: "3",
                            order: orderedSteps.length,
                            stepTypeName: "MESSAGE",
                            elapsed : undefined
                        }
                    };
                    orderedSteps.push(eos);
                    this.setState({
                        steps: orderedSteps
                    });

                }).fail((xhr, textStatus, errorThrown) => {
                    errorHandler(xhr, textStatus, errorThrown, this.props, "rowClick_1", true);
                }).always(() => {
                    setTimeout(() => {
                        this.props.setControlVisibility("Loading", false);
                    }, 100);
                });
            }

        }).fail((xhr, textStatus, errorThrown) => {
            errorHandler(xhr, textStatus, errorThrown, this.props, "rowClick_2", true);
            this.props.setControlVisibility("Loading", false);
        }).always(() => {
            setTimeout(() => {
                this.props.setControlVisibility("Loading", false);
            }, 100);
        });
    };

    addTxidAbbrPropertyTo(steps) {
        steps.forEach((v) => {
            if (v.step.txid) {
                v.step.txidAbbr = IdAbbr.abbr(v.step.txid);
            }
        });
    }

    toggleSummary = () => {
        this.setState({
            summary: !this.state.summary
        });
        this.setProfilerOptions("summary", !this.state.summary);
    };

    toggleNarrow = () => {
        this.setState({
            narrow: !this.state.narrow
        });
        this.setProfilerOptions("narrow", !this.state.narrow);
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

    toggleFormatter = () => {
        this.setState({
            formatter: !this.state.formatter
        });
        this.setProfilerOptions("formatter", !this.state.formatter);
    };

    clearTxId = () => {
        this.setState({
            txid: null
        });
    };

    copyUrl = () => {
        copy(window.location.href);

        this.setState({
            copyBtnText: "COPIED!"
        });

        setTimeout(() => {
            this.setState({
                copyBtnText: "COPY URL"
            });
        }, 2000);
    };

    onSecondaryPaneSizeChange = (d) => {

        if (this.layoutChangeTimer) {
            clearTimeout(this.layoutChangeTimer);
            this.layoutChangeTimer = null;
        }

        this.layoutChangeTimer = setTimeout(() => {
            this.setState({
                rightWidth : d
            });
        }, 1000);
    };

    render() {

        return (
            <div
                className={"xlog-profiler " + (this.state.paramTxid ? 'param-mode ' : ' ') + (this.state.show ? ' ' : 'hidden')}>
                <div>
                    <SplitterLayout percentage={true} primaryMinSize={20} secondaryMinSize={20} secondaryInitialSize={60} vertical={this.state.smallScreen} onSecondaryPaneSizeChange={this.onSecondaryPaneSizeChange}>
                        {!this.state.paramTxid &&
                        <div className="profiler-layout left">
                            <div className="summary">
                                <div className="title">PROFILER</div>
                                <div className="list-summary">{this.state.xlogs.length} ROWS</div>
                                {this.state.smallScreen && <div className="close-btn" onClick={this.close}></div>}
                            </div>
                            <div className="profile-list scrollbar">
                                <ProfileList txid={this.state.txid} xlogs={this.state.xlogs} rowClick={this.rowClick}/>
                            </div>
                        </div>
                        }
                        <div className="profiler-layout right">
                            <div className="summary">
                                {(!this.state.paramTxid && this.state.smallScreen) &&
                                <div onClick={this.clearTxId.bind(this)} className="profile-list-btn"><i className="fa fa-chevron-circle-left"></i></div>}
                                {!this.state.txid && <div className="title">NO PROFILE SELECTED</div>}
                                {this.state.txid && <div className="title">DETAIL <span className="selected-info">({this.state.txid ? 'TXID : ' + this.state.txid : 'NO PROFILE SELECTED'})</span>{this.state.txid ? <span className="copy-url-btn" onClick={this.copyUrl}>{this.state.copyBtnText}</span> : null}</div>}
                                {!this.state.txid && this.state.paramTxid && <div className="title">DETAIL <span className="selected-info">({this.state.paramTxid ? 'TXID : ' + this.state.paramTxid : 'NO PROFILE SELECTED'})</span>{this.state.paramTxid ? <span className="copy-url-btn" onClick={this.copyUrl}>{this.state.copyBtnText}</span> : null}</div>}
                                <div className="profile-steps-control noselect">
                                    <div className={"profile-control-btn " + (this.state.summary ? 'active' : '')} onClick={this.toggleSummary}>{this.state.summary ? <i className="fa fa-check-circle"></i> : <i className="fa fa-circle-o"></i>} SUMMARY</div>
                                    <div className={"profile-control-btn " + (this.state.narrow ? 'active' : '')} onClick={this.toggleNarrow}>{this.state.narrow ? <i className="fa fa-check-circle"></i> : <i className="fa fa-circle-o"></i>} NARROW</div>
                                    <div className={"profile-control-btn " + (this.state.bind ? 'active' : '')} onClick={this.toggleBind}>{this.state.bind ? <i className="fa fa-check-circle"></i> : <i className="fa fa-circle-o"></i>} BIND</div>
                                    <div className={"profile-control-btn " + (this.state.wrap ? 'active' : '')} onClick={this.toggleWrap}>{this.state.wrap ? <i className="fa fa-check-circle"></i> : <i className="fa fa-circle-o"></i>} WRAP</div>
                                    <div className={"profile-control-btn " + (this.state.formatter ? 'active' : '')} onClick={this.toggleFormatter}>{this.state.formatter ? <i className="fa fa-check-circle"></i> : <i className="fa fa-circle-o"></i>} FORMATTER</div>
                                </div>
                                {!this.state.smallScreen && <div className="close-btn" onClick={this.close}></div>}
                            </div>
                            <div className={"profile-steps " + (this.state.narrow ? 'narrow' : '')}>
                                <div ref="profileStepsContent" className="profile-steps-content scrollbar">
                                    {(this.state.paramTxid || this.state.txid) &&
                                    <FrameProfile rowClick={this.rowClick} txid={this.state.txid}
                                                  profile={this.state.profile} steps={this.state.steps}
                                                  summary={this.state.summary} narrow={this.state.narrow}
                                                  bind={this.state.bind} wrap={this.state.wrap}
                                                  formatter={this.state.formatter}
                                                  toggleFormatter={this.toggleFormatter}
                                                  toggleBind={this.toggleBind}
                                                  toggleWrap={this.toggleWrap}
                                                  rightWidth={this.state.rightWidth} />
                                    }
                                    {(!this.state.paramTxid && !this.state.txid) && <div className="no-profile">
                                        <div>NO PROFILE SELECTED</div>
                                    </div>}
                                </div>
                            </div>
                        </div>
                    </SplitterLayout>
                </div>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        objects: state.target.objects,
        config: state.config,
        user: state.user,
        filterMap: state.target.filterMap
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
