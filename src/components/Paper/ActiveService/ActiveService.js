import React, {Component} from 'react';
import './ActiveService.css';
import {addRequest, setControlVisibility} from '../../../actions/index';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import jQuery from "jquery";
import {getCurrentUser, getHttpProtocol, getWithCredentials, setAuthHeader} from '../../../common/common';
import ActiveServiceList from "./ActiveServiceList/ActiveServiceList";
import ActiveServiceStack from "./ActiveServiceStack/ActiveServiceStack";
import moment from 'moment'
import SplitterLayout from 'react-splitter-layout';
import 'react-splitter-layout/lib/index.css';

class ActiveService extends Component {

    constructor(props) {
        super(props);

        this.state = {
            show: false,
            last: null,
            txid: null,
            profile: null,
            steps: null,
            smallScreen: false,
            activeThread: {
                objHash: null,
                objName: null,
                list: []
            },
            stackTrace: {
                objHash: null,
                objName: null,
                threadId: null,
                map: {},
                show: false
            },
            selectedRowIndex : null
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
        this.updateDimensions();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions);
        window.removeEventListener("keydown", this.keyDown.bind(this));
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.activeObject && nextProps.activeObject) {
            this.getActiveServiceList(nextProps.activeObject);
        } else if (this.props.activeObject && nextProps.activeObject !== this.props.activeObject) {
            this.getActiveServiceList(nextProps.activeObject);
        }

    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.state.smallScreen !== nextState.smallScreen) {
            return true;
        }
        if (nextState.show !== this.state.show) {
            return true;
        }

        if (this.state.activeThread.list !== nextState.activeThread.list) {
            return true;
        }

        if (this.state.stackTrace !== nextState.stackTrace) {
            return true;
        }
        return false;
    }

    close = () => {
        this.setState({
            show: false,
            activeThread: {
                objHash: null,
                objName: null,
                list: []
            },
            stackTrace: {
                objHash: null,
                objName: null,
                threadId: null,
                show: false,
                map: {}
            },
            selectedRowIndex : null
        });
    };

    getActiveServiceList = (activeObj = this.state.activeThread) => {
        this.props.setControlVisibility("Loading", true);
        this.props.addRequest();
        const {config, user} = this.props;
        const _url = `${getHttpProtocol(config)}/scouter/v1/activeService/ofObject/${activeObj.objHash}`;
        jQuery.ajax({
            method: "GET",
            async: true,
            dataType: 'text',
            url: _url,
            xhrFields: getWithCredentials(config),
            beforeSend: function (xhr) {
                setAuthHeader(xhr, config, getCurrentUser(config, user));
            }
        }).done((msg) => {
            this.setState({
                show: true,
                activeThread: {
                    objHash: activeObj.objHash,
                    objName: activeObj.objName,
                    list: JSON.parse(msg).result
                },
                stackTrace: {
                    objHash: null,
                    objName: null,
                    threadId: null,
                    show: false,
                    map: {}
                },
                selectedRowIndex : null
            });

        }).always(() => {
            this.props.setControlVisibility("Loading", false);
        });
    };
    rowClick = (activeThread = this.state.stackTrace, i) => {
        this.props.setControlVisibility("Loading", true);
        this.props.addRequest();
        const {config, user} = this.props;
        const _url = `${getHttpProtocol(config)}/scouter/v1/activeService/thread/${activeThread.threadId}/ofObject/${activeThread.objHash}`;
        jQuery.ajax({
            method: "GET",
            async: true,
            dataType: 'text',
            url: _url,
            xhrFields: getWithCredentials(config),
            beforeSend: function (xhr) {
                setAuthHeader(xhr, config, getCurrentUser(config, user));
            }
        }).done((msg) => {
            this.setState({
                stackTrace: {
                    objHash: activeThread.objHash,
                    objName: activeThread.objName,
                    map: JSON.parse(msg).result,
                    threadId: activeThread.threadId,
                    show: true
                },
                selectedRowIndex : i
            });

        }).always(() => {
            this.props.setControlVisibility("Loading", false);
        });
    };

    updateDimensions = () => {
        let width = document.querySelector("body").clientWidth;
        let smallScreen = false;
        if (width < 801) {
            smallScreen = true;
        }

        if (this.state.smallScreen !== smallScreen) {
            this.setState({
                smallScreen: smallScreen
            });
        }
    };

    render() {
        const {activeThread} = this.state;

        return (
            <div className={"active-thread-list " + (this.state.show ? ' ' : 'hidden')}>
                <div className="active-service">
                    <div>
                        <SplitterLayout percentage={true} primaryMinSize={20} secondaryMinSize={20} secondaryInitialSize={60} vertical={this.state.smallScreen}>
                            <div className="active-layout left">
                                <div className="summary">
                                    <div className="active-control-btns">
                                        <button onClick={() => this.getActiveServiceList()}><i className={"fa fa-refresh"}/></button>
                                    </div>
                                    <div className="title">ACTIVE SERVICE LIST</div>
                                    <div className="list-summary">{activeThread.objName}</div>
                                    <div className="list-summary">{moment(new Date()).format('YYYY.MM.DD HH:mm:ss')}, {activeThread.list.length} ROWS</div>
                                    {this.state.smallScreen && <div className="close-btn" onClick={this.close}></div>}
                                </div>
                                <div className="active-list scrollbar">
                                    <ActiveServiceList active={activeThread.list} rowClick={this.rowClick} selectedRowIndex={this.state.selectedRowIndex}/>
                                </div>
                            </div>
                            <div className="active-layout">
                                <div className="summary">
                                    {!this.state.smallScreen && <div className="close-btn" onClick={this.close}></div>}
                                    <div className="title">STACK TRACE</div>
                                    {(this.state.stackTrace && this.state.stackTrace.threadId) && <div className="list-summary">Thread ID {this.state.stackTrace.threadId}, {this.state.stackTrace.objName}</div>}
                                    {(this.state.stackTrace && this.state.stackTrace.threadId) && <div className="list-summary">{moment(new Date()).format('YYYY.MM.DD HH:mm:ss')}</div>}
                                    {!(this.state.stackTrace && this.state.stackTrace.threadId) && <div className="list-summary">NO SERVICE SELECTED</div>}
                                        </div>
                                <div className="stack-trace scrollbar">
                                    {(this.state.stackTrace && this.state.stackTrace.threadId) && <ActiveServiceStack stack={this.state.stackTrace} refresh={this.rowClick} restore={this.getActiveServiceList}/>}
                                    {!(this.state.stackTrace && this.state.stackTrace.threadId) && <div className="no-profile"><div>NO SERVICE SELECTED</div></div>}
                                </div>
                            </div>
                        </SplitterLayout>
                    </div>
                </div>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        objects: state.target.objects,
        activeObject: state.target.activeObject,
        config: state.config,
        user: state.user,
        filterMap: state.target.filterMap
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        addRequest: () => dispatch(addRequest()),
        setControlVisibility: (name, value) => dispatch(setControlVisibility(name, value)),
    };
};

ActiveService = connect(mapStateToProps, mapDispatchToProps)(ActiveService);
export default withRouter(ActiveService);
