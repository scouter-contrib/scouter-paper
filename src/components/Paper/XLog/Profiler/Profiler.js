import React, {Component} from 'react';
import './Profiler.css';
import {addRequest, setControlVisibility, pushMessage} from '../../../../actions';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import jQuery from "jquery";
import {getDate, getHttpProtocol, errorHandler, getWithCredentials, setAuthHeader} from '../../../../common/common';
import SingleProfile from "./SingleProfile/SingleProfile";
import ProfileList from "./ProfileList/ProfileList";
import _ from "lodash";
import {disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks} from 'body-scroll-lock';

const xlogMaxSelectionCount = 200;

class Profiler extends Component {

    constructor(props) {
        super(props);
        this.state = {
            show: false,
            xlogs: [],
            last: null,
            txid: null,
            profile: null,
            steps: null,
            summary: true,
            indent: true,
            bind: true,
            wrap: false,
            gap: true,
            formatter: false
        }
    }

    keyDown = (event) => {
        if (event.keyCode === 27) {
            this.setState({
                show: false
            });
        }
    };

    componentWillMount() {
        document.addEventListener("keydown", this.keyDown.bind(this));
    }


    componentWillUnmount() {
        document.removeEventListener("keydown", this.keyDown.bind(this));
    }

    shouldComponentUpdate(nextProps, nextState) {

        if (JSON.stringify(nextProps.selection) !== JSON.stringify(this.props.selection)) {
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

        return false;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.selection.x1 === null || nextProps.selection.x2 === null || nextProps.selection.y1 === null || nextProps.selection.y2 === null) {
            this.setState({
                show: false
            });
        } else {
            if (JSON.stringify(nextProps.selection) !== JSON.stringify(this.props.selection)) {
                let x1 = nextProps.selection.x1;
                let x2 = nextProps.selection.x2;
                let y1 = nextProps.selection.y1;
                let y2 = nextProps.selection.y2;
                this.getList(x1, x2, y1, y2);
            }
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.show !== prevState.show) {
            if (this.state.show) {
                disableBodyScroll(document.querySelector("body"));
            } else {
                enableBodyScroll(document.querySelector("body"));
            }
        }
    }

    getList = (x1, x2, y1, y2) => {
        var that = this;
        let allXLogs = that.props.xlogs;
        const filtered = _(allXLogs)
            .filter(x => x1 <= x.endTime * 1 && x.endTime * 1 <= x2 && y1 <= x.elapsed * 1 && x.elapsed * 1 <= y2)
            .take(xlogMaxSelectionCount).value();

        if (filtered.length === 0) {
            return;
        }

        let date = getDate(new Date(x1), 1);
        this.props.addRequest();
        jQuery.ajax({
            method: "GET",
            async: true,
            url: getHttpProtocol(this.props.config) + '/scouter/v1/xlog-data/' + date + '/multi/' + filtered.map(x => x.txid).toString(),
            xhrFields: getWithCredentials(that.props.config),
            beforeSend: function (xhr) {
                setAuthHeader(xhr, that.props.config, that.props.user);
            }
        }).done((msg) => {

            let list = msg.result;

            if (list && list.length > 0) {

                let instanceMap = {};
                for (let i = 0; i < this.props.instances.length; i++) {
                    instanceMap[this.props.instances[i].objHash] = this.props.instances[i].objName;
                }

                let xlogs = [];
                for (let i = 0; i < list.length; i++) {
                    let xlog = list[i];
                    let elapsed = Number(xlog.elapsed);
                    if (y1 <= elapsed && y2 >= elapsed) {
                        xlog.objName = instanceMap[xlog.objHash];
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
        });
    };

    close = () => {
        this.setState({
            show: false,
            xlogs: [],
            last: null,
            txid: null,
            profile: null,
            steps: null
        });
    };


    rowClick = (xlog) => {

        var that = this;

        if (this.state.txid === xlog.txid) {
            this.setState({
                txid: null
            });
        } else {
            this.setState({
                txid: xlog.txid
            });
        }


        // XLOG DATA
        this.props.addRequest();
        jQuery.ajax({
            method: "GET",
            async: true,
            url: getHttpProtocol(this.props.config) + '/scouter/v1/xlog-data/' + getDate(new Date(Number(xlog.endTime)), 1) + "/" + xlog.txid,
            xhrFields: getWithCredentials(that.props.config),
            beforeSend: function (xhr) {
                setAuthHeader(xhr, that.props.config, that.props.user);
            }
        }).done((msg) => {
            this.setState({
                profile: msg.result
            });
        }).fail((xhr, textStatus, errorThrown) => {
            errorHandler(xhr, textStatus, errorThrown, this.props);
        });

        // XLOG DATA
        this.props.addRequest();
        jQuery.ajax({
            method: "GET",
            async: true,
            url: getHttpProtocol(this.props.config) + '/scouter/v1/profile-data/' + getDate(new Date(Number(xlog.endTime)), 1) + "/" + xlog.txid,
            xhrFields: getWithCredentials(that.props.config),
            beforeSend: function (xhr) {
                setAuthHeader(xhr, that.props.config, that.props.user);
            }
        }).done((msg) => {
            const orderedSteps = _.orderBy(msg.result, (e) => Number(e.step.order), ['asc']);
            this.addIndentPropertyTo(orderedSteps);

            this.setState({
                steps: orderedSteps
            });

        }).fail((xhr, textStatus, errorThrown) => {
            errorHandler(xhr, textStatus, errorThrown, this.props);
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
    };

    toggleIndent = () => {
        this.setState({
            indent: !this.state.indent
        });
    };

    toggleBind = () => {
        this.setState({
            bind: !this.state.bind
        });
    };


    toggleWrap = () => {
        this.setState({
            wrap: !this.state.wrap
        });
    };

    toggleGap = () => {
        this.setState({
            gap: !this.state.gap
        });
    };

    toggleFormatter = () => {
        this.setState({
            formatter: !this.state.formatter
        });
    };

    render() {
        return (
            <div className={"xlog-profiler " + (this.state.show ? ' ' : 'hidden')}>
                <div>
                    <div className="profiler-layout left">
                        <div className="summary">
                            <div className="title">PROFILER</div>
                            <div className="list-summary">{this.state.xlogs.length} ROWS</div>
                        </div>
                        <div className="profile-list scrollbar">
                            <ProfileList txid={this.state.txid} xlogs={this.state.xlogs} rowClick={this.rowClick}/>
                        </div>
                    </div>
                    <div className="profiler-layout right">
                        <div className="summary">
                            <div className="title">DETAIL</div>
                            <div className="list-summary">{this.state.txid ? 'TXID : ' + this.state.txid : 'NO PROFILE SELECTED'}</div>
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
                                {this.state.txid && <SingleProfile txid={this.state.txid} profile={this.state.profile} steps={this.state.steps} summary={this.state.summary} indent={this.state.indent} bind={this.state.bind} wrap={this.state.wrap} gap={this.state.gap} formatter={this.state.formatter}/>}
                                {!this.state.txid && <div className="no-profile"><div>NO PROFILE SELECTED</div></div>}
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
        instances: state.target.instances,
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