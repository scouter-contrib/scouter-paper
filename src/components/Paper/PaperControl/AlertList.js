import React, {Component} from 'react';
import './AlertList.css';
import * as d3 from "d3";
import {connect} from 'react-redux';
import TimeAgo from 'react-timeago'

class AlertList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            clearTime: null,
            clearItemMap: {},
            alert : []
        }
    }

    clearAll = () => {
        if (this.props.alert.data && this.props.alert.data.length > 0) {
            let last = this.props.alert.data[0];
            this.setState({
                clearTime: Number(last.time),
                clearItemMap: {}
            });
        } else {
            this.setState({
                clearTime: (new Date()).getTime(),
                clearItemMap: {}
            });
        }
    };

    clearItem = (objHash, time) => {
        let clearItemMap = this.state.clearItemMap;

        if (!clearItemMap[objHash]) {
            clearItemMap[objHash] = {};
        }

        clearItemMap[objHash][time] = true;

        this.setState({
            clearItemMap: clearItemMap
        });
    };

    componentWillReceiveProps(nextProps){
        let filteredAlertList = nextProps.alert.data.filter((alert) => {
            if (this.state.clearTime) {
                if (this.state.clearTime >= Number(alert.time)) {
                    return false;
                } else {
                    if (this.state.clearItemMap[alert.objHash] && this.state.clearItemMap[alert.objHash][alert.time]) {
                        return false;
                    } else {
                        return true;
                    }
                }
            } else {
                if (this.state.clearItemMap[alert.objHash] && this.state.clearItemMap[alert.objHash][alert.time]) {
                    return false;
                } else {
                    return true;
                }
            }
        });

        this.props.setAlertCount(filteredAlertList.length);

        console.log(filteredAlertList.length);

        this.setState({
            alert: filteredAlertList
        });
    }

    render() {

        return (
            <div className={"alert-list " + (this.props.show ? '' : 'hidden')}>
                <div className="top-control">
                    <button onClick={this.clearAll}>CLEAR ALL</button>
                </div>
                <ul className="scrollbar">
                    {this.state.alert.map((alert, i) => {
                        return (
                            <li key={i}>
                                <div>
                                    <span className={"level " + alert.level}>{alert.level}</span>
                                    <span className="title">{alert.title}</span>
                                    <span className="close-btn" onClick={this.clearItem.bind(this, alert.objHash, alert.time)}></span>
                                    <span className="ago"><TimeAgo date={Number(alert.time)}/></span>
                                </div>
                                <div className="alert-content">
                                    <div className="alert-control">
                                        <div><i className="fa fa-clock-o" aria-hidden="true"></i></div>
                                    </div>
                                    <div className="alert-item">
                                        <div>
                                            <span
                                                className="time">{d3.timeFormat(this.props.config.dateFormat + " " + this.props.config.timeFormat)(new Date(Number(alert.time)))}</span>
                                            <span className="objType">{alert.objType}</span>
                                            <span className="objName">{alert.objName}</span>
                                        </div>
                                        <div>
                                            <span className="message">{alert.message}</span>
                                        </div>
                                    </div>

                                </div>


                            </li>
                        )
                    })}
                </ul>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        config: state.config
    };
};

AlertList = connect(mapStateToProps, undefined)(AlertList);
export default AlertList;

