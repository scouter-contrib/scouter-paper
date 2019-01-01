import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import * as d3 from "d3";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import InputRange from 'react-input-range';
import 'react-input-range/lib/css/index.css';
import './RangeControl.css';
import {setRealTimeValue, setRealTimeRangeStepValue, setRangeDate, setRangeHours, setRangeMinutes, setRangeValue, setRangeDateHoursMinutes, setSearchCondition} from '../../../actions';

class RangeControl extends Component {

    constructor(props) {
        super(props);
        this.handleChange = this.dateChange.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }

    dateChange = (date) => {
        this.props.setRangeDate(date);
    };

    hoursChange = (e) => {
        if (isNaN(e)) {
            this.props.setRangeHours(e.target.value);
        } else {
            this.props.setRangeHours(e);
        }
    };

    minutesChange = (e) => {
        if (isNaN(e)) {
            this.props.setRangeMinutes(e.target.value);
        } else {
            this.props.setRangeMinutes(e);
        }
    };

    wheel = (e) => {

    };

    handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            this.search();
        }
    };

    changeTimeType = (type) => {
        let value = this.props.range.value > this.props.config.range.shortHistoryRange ? this.props.config.range.shortHistoryRange : this.props.range.value;
        this.props.setRealTimeRangeStepValue(type === "realtime", type === "realtime" ? false : this.props.range.longTerm, value, this.props.config.range.shortHistoryRange, this.props.config.range.shortHistoryStep);
    };

    changeLongTerm = () => {

        if (this.props.range.realTime) {
            return;
        }

        if (this.props.range.longTerm) {
            let value = this.props.range.value > this.props.config.range.shortHistoryRange ? this.props.config.range.shortHistoryRange : this.props.range.value;
            this.props.setRealTimeRangeStepValue(this.props.range.realTime, false, value, this.props.config.range.shortHistoryRange, this.props.config.range.shortHistoryStep);
        } else {
            let value = this.props.range.value < this.props.config.range.longHistoryStep ? this.props.config.range.longHistoryStep : this.props.range.value
            this.props.setRealTimeRangeStepValue(this.props.range.realTime, true, value, this.props.config.range.longHistoryRange * 60, this.props.config.range.longHistoryStep);
        }
    };

    moveAndSearch = (type) => {

        if (this.props.range.realTime) {
            return;
        }

        let value = this.props.range.value;
        let current = this.props.range.date.clone();
        current.seconds(0);
        current.minutes(this.props.range.minutes);
        current.hours(this.props.range.hours);

        if (type === "before") {
            current.subtract(value, "minutes");
        } else {
            current.add(value, "minutes");
        }

        this.props.setRangeDateHoursMinutes(current, current.hours(), current.minutes());

        let startDate = current.clone();
        let endDate = startDate.clone();
        endDate.add(value, "minutes");

        this.search(startDate, endDate);
    };

    search = (startDateParam, endDateParam) => {

        if (startDateParam && endDateParam) {
            this.props.setSearchCondition(startDateParam.valueOf(), endDateParam.valueOf(), (new Date()).getTime());
        } else {
            let startDate = this.props.range.date.clone();
            startDate.seconds(0);
            startDate.minutes(this.props.range.minutes);
            startDate.hours(this.props.range.hours);

            let endDate = startDate.clone();
            endDate.add(this.props.range.value, "minutes");

            this.props.setSearchCondition(startDate.valueOf(), endDate.valueOf(), (new Date()).getTime());
        }
    };

    render() {
        let startDate = this.props.range.date.clone();
        startDate.seconds(0);
        startDate.minutes(this.props.range.minutes);
        startDate.hours(this.props.range.hours);

        let endDate = startDate.clone();
        endDate.add(this.props.range.value, "minutes");


        return (
            <div className={"range-controls noselect " + (this.props.visible ? 'visible ' : ' ') + (this.props.fixedControl ? 'fixed' : '') }>
                <div className="time-type">
                    <div onClick={this.changeTimeType.bind(this, "realtime")} className={"time-type-item real-time " + (this.props.range.realTime ? "selected" : "")}>REALTIME</div>
                    <div onClick={this.changeTimeType.bind(this, "search")} className={"time-type-item search-time " + (!this.props.range.realTime ? "selected" : "")}>SEARCH</div>
                    <div onClick={this.changeLongTerm.bind(this)} className={"time-type-item longterm-time " + (this.props.range.longTerm ? "selected " : " ") + (this.props.range.realTime ? "disabled" : "")}>{this.props.config.range.longHistoryRange/24}D</div>
                </div>
                <div className="time-controller">
                    <div>
                        <DatePicker
                            selected={this.props.range.date}
                            onChange={this.dateChange}
                            dateFormat="YYYY-MM-DD"
                            className="range-time-control rage-date"
                            disabled={this.props.range.realTime}
                        />
                        <div className="desc-label"><span>D</span></div>
                    </div>
                    <div>
                        <input type="number" className="range-time-control rage-hours" min={0} max={23} value={this.props.range.hours} onChange={this.hoursChange} disabled={this.props.range.realTime} onWheel={(e) => this.wheel.bind(this)} onKeyPress={this.handleKeyPress} />
                        <div className="desc-label"><span>H</span></div>
                    </div>
                    <div>
                        <input type="number" className="range-time-control rage-minute" min={0} max={59} value={this.props.range.minutes} onChange={this.minutesChange} disabled={this.props.range.realTime} onWheel={(e) => this.wheel.bind(this)} onKeyPress={this.handleKeyPress} />
                        <div className="desc-label"><span>M</span></div>
                    </div>
                    <div className="span-separator"></div>
                    <div className="span-range">
                        <div className="span-range-right-bg"></div>
                        <InputRange
                            maxValue={this.props.range.range*1}
                            minValue={this.props.config.range.shortHistoryStep*1}
                            value={this.props.range.value*1}
                            step={this.props.range.step*1}
                            disabled={this.props.range.realTime}
                            formatLabel={value => {
                                let days = Math.floor(value / 1440);
                                let remains = value - days * 1440;
                                let hours = Math.floor(remains / 60);
                                let minute = remains % 60;
                                if (days > 0) {
                                    if (hours > 0) {
                                        return days + "D " + hours + "H";
                                    } else {
                                        return days + "D";
                                    }
                                } else if (hours > 0) {
                                    if (minute > 0) {
                                        return hours + "H " + minute + "M";
                                    } else {
                                        return hours + "H";
                                    }
                                } else {
                                    return value + "M";
                                }

                            }}
                            onChange={value => this.props.setRangeValue(value)} />

                    </div>
                    <div className="range-right-btn">
                        <button className={"search-btn " + (this.props.range.realTime ? "disabled" : "")} onClick={this.search}>SEARCH</button>
                    </div>
                </div>
                <div className={"selected-time " + (this.props.range.realTime ? "disabled" : "")}>
                    <div onClick={this.moveAndSearch.bind(this, "before")} className="move-before"><i className="fa fa-angle-left"></i> <i className="fa fa-search"></i></div>
                    <div onClick={this.moveAndSearch.bind(this, "after")} className="move-after"><i className="fa fa-search"></i> <i className="fa fa-angle-right"></i></div>
                    <div className="start-time">{d3.timeFormat(this.props.config.dateFormat + " " + this.props.config.minuteFormat)(new Date(startDate.valueOf()))}</div>
                    <div className="end-time">{d3.timeFormat(this.props.config.dateFormat + " " + this.props.config.minuteFormat)(new Date(endDate.valueOf()))}</div>
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
        setRealTimeValue: (realTime, longTerm, value) => dispatch(setRealTimeValue(realTime, longTerm, value)),
        setRangeDate: (date) => dispatch(setRangeDate(date)),
        setRangeHours: (hours) => dispatch(setRangeHours(hours)),
        setRangeMinutes: (minutes) => dispatch(setRangeMinutes(minutes)),
        setRangeValue: (value) => dispatch(setRangeValue(value)),
        setRangeDateHoursMinutes: (date, hours, minutes) => dispatch(setRangeDateHoursMinutes(date, hours, minutes)),
        setRealTimeRangeStepValue: (realTime, longTerm, value, range, step) => dispatch(setRealTimeRangeStepValue(realTime, longTerm, value, range, step)),
        setSearchCondition: (from, to, time) => dispatch(setSearchCondition(from, to, time))

    };
};

RangeControl = connect(mapStateToProps, mapDispatchToProps)(RangeControl);
export default withRouter(RangeControl);