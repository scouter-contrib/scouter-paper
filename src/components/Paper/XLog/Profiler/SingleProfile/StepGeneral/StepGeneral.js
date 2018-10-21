import React, {Component} from 'react';
import './StepGeneral.css';
import {zeroPadding} from '../../../../../../common/common';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import * as d3 from "d3";
import numeral from "numeral";

class StepGeneral extends Component {
    /*
    public int parent;
	public int index;

	public int start_time;
	public int start_cpu;

	getStepType
	getOrder
	getStepTypeName
	*/

    render() {
        let stepStartTime = Number(this.props.startTime) + Number(this.props.row.step.start_time);
        return (
            <div className="general">
                <span className="index">{zeroPadding(this.props.row.step.index, 5)}</span>
                <span className="type">{this.props.type}</span>
                {/*<span className="start-time">{d3.timeFormat(this.props.config.dateFormat + " " + this.props.config.timeFormat + " %L")(new Date(Number(stepStartTime)))}</span>*/}
                {/*<span className="elapsed">{this.props.elapsed !== undefined ? numeral(this.props.elapsed).format(this.props.config.numberFormat) + " ms": ""}</span>*/}
                <span className="elapsed">{this.props.elapsed !== undefined ? numeral(this.props.elapsed).format(this.props.config.numberFormat) + " ms": ""}</span>
                <span className="start-time">{d3.timeFormat(this.props.config.dateFormat + " " + this.props.config.timeFormat + " %L")(new Date(Number(stepStartTime)))}</span>
                {this.props.row.step.stepType === "16" && <span className="value">{Number(this.props.row.step.updated) >= 0 && '#' + this.props.row.step.updated}</span>}
                {this.props.row.step.stepType !== "16" && <span className="value">{!isNaN(this.props.row.step.value) && '#' + this.props.row.step.value}</span>}

            </div>)
    }
}

let mapStateToProps = (state) => {
    return {
        config: state.config
    };
};

StepGeneral = connect(mapStateToProps, undefined)(StepGeneral);
export default withRouter(StepGeneral);
