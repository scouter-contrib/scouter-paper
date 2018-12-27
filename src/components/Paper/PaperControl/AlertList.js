import React, {Component} from 'react';
import './AlertList.css';
import * as d3 from "d3";
import {connect} from 'react-redux';
import TimeAgo from 'react-timeago'

class AlertList extends Component {


    render() {

        return (
            <div className={"popup-div alert-list-wrapper " + (this.props.show ? '' : 'hidden')}>
                <div className="top-control">
                    <div className="alerts">ALERTS</div>
                    <button onClick={this.props.clearAllAlert}>CLEAR ALL</button>
                </div>
                {this.props.alert.data && this.props.alert.data.length > 0 &&
                <ul className="scrollbar">
                    {this.props.alert.data.map((alert, i) => {
                        return (
                            <li key={i}>
                                <div>
                                    <span className={"level " + alert.level}>{alert.level}</span>
                                    <span className="title">{alert.title}</span>
                                    <span className="close-btn" onClick={this.props.clearOneAlert.bind(this, alert.objHash, alert.time)}></span>
                                    <span className="ago"><TimeAgo date={Number(alert.time)}/></span>
                                </div>
                                <div className="alert-content">
                                    <div className="alert-control">
                                        <div onClick={this.props.setRewind.bind(this, alert.time)}><i className="fa fa-clock-o" aria-hidden="true"></i></div>
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
                }
                {(!this.props.alert.data || this.props.alert.data.length < 1) &&
                <div className="no-alerts"><div><div>NO ALERT</div></div></div>
                }
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

