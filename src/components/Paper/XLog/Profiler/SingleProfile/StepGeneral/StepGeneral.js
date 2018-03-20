import React, {Component} from 'react';
import './StepGeneral.css';
import {getDate, zeroPadding} from '../../../../../../common/common';

class StepGeneral extends Component {
    render() {
        let stepStartTime = Number(this.props.startTime) + Number(this.props.row.step.start_time);
        console.log(this.props.row.step.value);
        return (
            <div className="general">
                <span className="index">{zeroPadding(this.props.row.step.index, 5)}</span>
                <span className="type">{this.props.type}</span>
                <span className="start-time">{getDate(new Date(stepStartTime), 2)}</span>
                <span className="elapsed">{this.props.elapsed} ms</span>
                <span className="value">{!isNaN(this.props.row.step.value) && '#' + this.props.row.step.value}</span>
            </div>)
    }
}

export default StepGeneral;