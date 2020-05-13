import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {setConfig} from '../../../../actions';
import './RealTimeControl.css';
import {timeHourToMin,setData} from "../../../../common/common";

class RealTimeControl extends Component {

    constructor(props) {
        super(props);
        this.state = {
            unit: "unit_m",
            value: "10"
        };
    }
    timeValueChange=(event)=>{
        this.setState({
            value: event.target.value
        });
    };

    timeUnitClick=(event)=>{
        this.setState({
            unit: event.target.value
        })
    };
    applyClick=()=>{
        const {unit,value} = this.state;
        let min = value;
        if(unit === "unit_h"){
            min = timeHourToMin(value);
        }
        const apply = {...this.props.config,realTimeLastRange: min};
        this.props.setConfig(apply);
        setData(apply);

    };
    refreshClick=(event)=>{
        this.props.setConfig({...this.props.config,interval: Number(event.target.value)})
    };
    render() {

        return (
            <div className="realtime-controller">
                <div className="meta-info">
                    <span><i className="fa fa-clock-o"></i></span>
                    <span className="meta-text">LAST {this.props.config.realTimeLastRange}minutes</span>
                </div>
                <div className="time-range">
                    <div className="time-control">
                        <div className="time-last">
                            <input type="text" readOnly value="LAST" ></input>
                        </div>
                        <div className="time-value">
                            <input type="text" value={this.state.value} onChange={this.timeValueChange}></input>
                        </div>
                        <div className="time-unit">
                            <select value={this.state.unit} onChange={this.timeUnitClick}>
                                <option value="unit_m">minutes</option>
                                <option value="unit_h">hours</option>
                            </select>
                        </div>
                        <div className="time-apply">
                            <button onClick={this.applyClick}>APPLY</button>
                        </div>
                        <div className="refresh-every">
                            <span className="refresh-icon">
                                <i className="fa fa-refresh"></i>
                            </span>
                            <div className="refresh-select">
                            <select value={this.props.config.interval} onChange={this.refreshClick}>
                                {/*<option value="-1">OFF</option>*/}
                                <option value="2000">2s</option>
                                <option value="5000">5s</option>
                                <option value="10000">10s</option>
                                <option value="30000">30s</option>
                                <option value="60000">1m</option>
                                <option value="300000">5m</option>
                            </select>
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
        config: state.config,
        range: state.range
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        setConfig: (config) =>dispatch(setConfig(config))
    };
};

RealTimeControl = connect(mapStateToProps, mapDispatchToProps)(RealTimeControl);
export default withRouter(RealTimeControl);