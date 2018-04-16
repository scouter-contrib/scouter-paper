import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import * as d3 from "d3";
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import InputRange from 'react-input-range';
import 'react-input-range/lib/css/index.css';
import './RangeControl.css';

class RangeControl extends Component {

    constructor(props) {
        super(props);

        let now = moment();
        now.subtract(10, "minutes");
        this.state = {
            date: now,
            hours: now.hours(),
            minutes : now.minutes(),
            value: this.props.config.range.shortHistoryStep,
            realtime : true,
            longTerm : false,
            range : this.props.config.range.shortHistoryRange,
            step : this.props.config.range.shortHistoryStep
        };
        this.handleChange = this.dateChange.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }

    dateChange = (date) => {
        this.setState({
            date: date
        });
    };

    hoursChange = (e) => {
        if (e.target.value) {

        }
        this.setState({
            hours: e.target.value
        });
    };

    wheel = (e) => {

    };

    handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            this.search();
        }
    };



    minutesChange = (e) => {
        this.setState({
            minutes: e.target.value
        });
    };

    changeTimeType = (type) => {
        this.setState({
            realtime: type === "realtime",
            longTerm : type === "realtime" ? false : this.state.longTerm,
            value: this.state.value > this.props.config.range.shortHistoryRange ? this.props.config.range.shortHistoryRange : this.state.value,
            range : this.props.config.range.shortHistoryRange,
            step : this.props.config.range.shortHistoryStep
        });

        this.props.changeRealtime(type === "realtime", type === "realtime" ? false : this.state.longTerm);
    };

    changeLongTerm = () => {

        if (this.state.realtime) {
            return;
        }

        if (this.state.longTerm) {

            this.setState({
                longTerm: false,
                range : this.props.config.range.shortHistoryRange,
                step : this.props.config.range.shortHistoryStep,
                value : this.state.value > this.props.config.range.shortHistoryRange ? this.props.config.range.shortHistoryRange : this.state.value
            });

            this.props.changeLongTerm(false);
        } else {
            this.setState({
                longTerm: true,
                range : this.props.config.range.longHistoryRange * 60,
                step : this.props.config.range.longHistoryStep,
                value : this.state.value < this.props.config.range.longHistoryStep ? this.props.config.range.longHistoryStep : this.state.value
            });

            this.props.changeLongTerm(true);
        }
    };


    moveAndSearch = (type) => {

        if (this.state.realtime) {
            return;
        }

        let value = this.state.value;
        let current = this.state.date.clone();
        current.seconds(0);
        current.minutes(this.state.minutes);
        current.hours(this.state.hours);

        if (type === "before") {
            current.subtract(value, "minutes");
        } else {
            current.add(value, "minutes");
        }

        this.setState({
            date: current,
            hours: current.hours(),
            minutes : current.minutes()
        });

        let startDate = current.clone();
        let endDate = startDate.clone();
        endDate.add(value, "minutes");

        this.search(startDate, endDate);
    };



    search = (startDateParam, endDateParam) => {
        if (startDateParam && endDateParam) {
            this.props.search(startDateParam.valueOf(), endDateParam.valueOf());
        } else {
            let startDate = this.state.date.clone();
            startDate.seconds(0);
            startDate.minutes(this.state.minutes);
            startDate.hours(this.state.hours);

            let endDate = startDate.clone();
            endDate.add(this.state.value, "minutes");

            this.props.search(startDate.valueOf(), endDate.valueOf());
        }
    };

    render() {

        let startDate = this.state.date.clone();
        startDate.seconds(0);
        startDate.minutes(this.state.minutes);
        startDate.hours(this.state.hours);

        let endDate = startDate.clone();
        endDate.add(this.state.value, "minutes");

        return (
            <div className={"range-controls noselect " + (this.props.visible ? 'visible ' : ' ') + (this.props.fixedControl ? 'fixed' : '') }>
                <div className="close-btn" onClick={this.props.toggleRangeControl}></div>
                <div className="time-type">
                    <div onClick={this.changeTimeType.bind(this, "realtime")} className={"time-type-item real-time " + (this.state.realtime ? "selected" : "")}>REALTIME</div>
                    <div onClick={this.changeTimeType.bind(this, "search")} className={"time-type-item search-time " + (!this.state.realtime ? "selected" : "")}>SEARCH</div>
                    <div onClick={this.changeLongTerm.bind(this)} className={"time-type-item longterm-time " + (this.state.longTerm ? "selected " : " ") + (this.state.realtime ? "disabled" : "")}>{this.props.config.range.longHistoryRange}H</div>
                </div>
                <div className="time-controller">
                    <div>
                        <DatePicker
                            selected={this.state.date}
                            onChange={this.dateChange}
                            dateFormat="YYYY-MM-DD"
                            className="range-time-control rage-date"
                            disabled={this.state.realtime}
                        />
                        <div className="desc-label"><span>D</span></div>
                    </div>
                    <div>
                        <input type="number" className="range-time-control rage-hours" min={0} max={23} value={this.state.hours} onChange={this.hoursChange} disabled={this.state.realtime} onWheel={(e) => this.wheel.bind(this)} onKeyPress={this.handleKeyPress} />
                        <div className="desc-label"><span>H</span></div>
                    </div>
                    <div>
                        <input type="number" className="range-time-control rage-minute" min={0} max={59} value={this.state.minutes} onChange={this.minutesChange} disabled={this.state.realtime} onWheel={(e) => this.wheel.bind(this)} onKeyPress={this.handleKeyPress} />
                        <div className="desc-label"><span>M</span></div>
                    </div>
                    <div className="span-separator"></div>
                    <div className="span-range">
                        <div className="span-range-right-bg"></div>
                        <InputRange
                            maxValue={this.state.range}
                            minValue={this.props.config.range.shortHistoryStep}
                            value={this.state.value}
                            step={this.state.step}
                            disabled={this.state.realtime}
                            formatLabel={value => {
                                let hours = Math.floor(value / 60);
                                let minute = value % 60;
                                if (hours > 0) {
                                    if (minute > 0) {
                                        return hours + "H " + minute + "M";
                                    } else {
                                        return hours + "H";
                                    }
                                } else {
                                    return value + "M";
                                }

                            }}
                            onChange={value => this.setState({ value })} />

                    </div>
                    <div className="range-right-btn">
                        <button className={"search-btn " + (this.state.realtime ? "disabled" : "")} onClick={this.search}>SEARCH</button>
                    </div>
                </div>
                <div className={"selected-time " + (this.state.realtime ? "disabled" : "")}>
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
        config: state.config
    };
};

RangeControl = connect(mapStateToProps, undefined)(RangeControl);
export default withRouter(RangeControl);
