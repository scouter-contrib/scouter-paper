import React, {Component} from 'react';
import '../Profiler.css';
import {addRequest, pushMessage, setControlVisibility} from '../../../../../actions';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import jQuery from "jquery";
import {getCurrentUser, getHttpProtocol, getWithCredentials, setAuthHeader} from '../../../../../common/common';
import ActiveServiceList from "./ActiveServiceList";
// import {getParam} from '../../../../common/common';
class ActiveService extends Component {

    constructor(props) {
        super(props);

        // URL로부터 TXID와 날짜를 세팅
        // let txid = getParam(this.props, "txid");
        // let txiddate = getParam(this.props, "txiddate");

        let options = null;
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
            last: null,
            txid: null,
            profile: null,
            steps: null,
            summary: options.summary,
            narrow: options.narrow,
            bind: options.bind,
            wrap: options.wrap,
            formatter: options.formatter,
            listWidth: 100,
            smallScreen: false,
            activeThread : {
                objHash : null,
                objName : null,
                list : []
            }
        };
    }
    keyDown = (event) => {
        if (event.keyCode === 27) {
            this.close();
        }
    };
    componentDidMount() {
        // super.componentDidMount()
        window.addEventListener("resize", this.updateDimensions);
        window.addEventListener("keydown", this.keyDown.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions);
        window.removeEventListener("keydown", this.keyDown.bind(this));
    }

    componentWillReceiveProps(nextProps) {
        if( !this.props.activeObject && nextProps.activeObject ){
            this.getActiveServiceList(nextProps.activeObject)
        }else if( this.props.activeObject && nextProps.activeObject !== this.props.activeObject){
            this.getActiveServiceList(nextProps.activeObject)
        }

    }
    shouldComponentUpdate(nextProps, nextState) {
        // console.log(nextProps.activeObject,this.props.activeObject )
        if (this.state.listWidth !== nextState.listWidth) {
            return true;
        }
        if (this.state.smallScreen !== nextState.smallScreen) {
            return true;
        }
        if (nextState.show !== this.state.show) {
            return true;
        }
        if ( this.state.activeThread.list !== nextState.activeThread.list){
            return true;
        }
        return false;
    }
    close=()=>{
        this.setState({
            show:false,
            activeThread : {
                objHash : null,
                objName : null,
                list : []
            }
        })
    };

    getActiveServiceList= (activeObj) =>{
        // activeObj.objHash
        this.props.setControlVisibility("Loading", true);
        this.props.addRequest();
        const {config,user} = this.props
        const _url = [getHttpProtocol(config),'scouter/v1/activeService/ofObject',activeObj.objHash].join('/')
        jQuery.ajax({
            method: "GET",
            async: true,
            dataType: 'text',
            url: _url,
            xhrFields: getWithCredentials(config),
            beforeSend: function (xhr) {
                setAuthHeader(xhr,config, getCurrentUser(config, user));
            }
        }).done((msg) => {
            this.setState({
               show:true,
               activeThread : {
                   objHash : activeObj.objHash,
                   objName : activeObj.objName,
                   list: JSON.parse(msg).result
               }
            })

        }).always(() => {
            this.props.setControlVisibility("Loading", false);
        });
    }
    rowClick = (xlog, txiddate) => {

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
            })
        }
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
            listWidth: listWidth
        });
    };

    render() {
        let leftStyle = {};
        let rightStyle = {};
        if (!this.state.paramTxid) {
            if (this.state.smallScreen) {
                if (this.state.txid) {
                    leftStyle = {width: "100%", display: "none"};
                    rightStyle = {width: "100%", display: "inline-block"};
                } else {
                    leftStyle = {width: "100%", display: "inline-block"};
                    rightStyle = {width: "100%", display: "none"};
                }
            } else {
                leftStyle = {
                    width: this.state.listWidth + "%",
                    display: this.state.listWidth === 0 ? "none" : "inline-block"
                };
                rightStyle = {
                    width: (100 - this.state.listWidth) + "%",
                    display: this.state.listWidth === 100 ? "none" : "inline-block"
                }
            }
        }
        // txid={this.state.txid}
        const {activeThread} = this.state
        return (
            <div className={"active-thread-list " + (this.state.show ? ' ' : 'hidden')} >
                <div className={"xlog-profiler " + (this.state.paramTxid ? 'param-mode ' : ' ') }>
                <div>
                    <div className="size-control-btns">
                        {/*{!this.state.paramTxid && <button onClick={()=>this.changeListWidth("min")}><i className="fa fa-angle-double-left"></i></button>}*/}
                        {/*{!this.state.paramTxid && <button onClick={()=>this.changeListWidth("small")}><i className="fa fa-angle-left"></i></button>}*/}
                        {/*{!this.state.paramTxid && <button onClick={()=>this.changeListWidth("big")}><i className="fa fa-angle-right"></i></button>}*/}
                        {/*{!this.state.paramTxid && <button onClick={()=>this.changeListWidth("max")}><i className="fa fa-angle-double-right"></i></button>}*/}
                        <button onClick={()=>this.getActiveServiceList(activeThread)}> <i className="fa fa-repeat"/></button>
                        <div className="close-btn" onClick={this.close}></div>
                    </div>

                    <div className="profiler-layout left" style={leftStyle}>
                        <div className="summary">
                            <div className="title">Active Service ({activeThread.objName})</div>
                            <div className="list-summary">Counter = { activeThread.list.length } </div>
                            <div className="close-btn" onClick={()=>this.close()}></div>
                        </div>
                        <div className="profile-list scrollbar">
                            <ActiveServiceList active={activeThread.list} rowClick={this.rowClick}/>
                        </div>
                    </div>

                    <div className="profiler-layout right" style={rightStyle}>
                        <div className="summary">
                        </div>
                        <div className={"profile-steps " + (this.state.narrow ? 'narrow' : '')}>
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
        activeObject : state.target.activeObject,
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

ActiveService = connect(mapStateToProps, mapDispatchToProps)(ActiveService);
export default withRouter(ActiveService);
