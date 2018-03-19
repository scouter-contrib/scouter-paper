import React, {Component} from 'react';
import './ApiCallSumStep.css';
import {getDate, zeroPadding} from '../../../../../../common/common';

class ApiCallSumStep extends Component {
    render() {
        let stepStartTime = Number(this.props.startTime) + Number(this.props.row.step.start_time);
        return (
            <div className="step hashed-message">
                {this.props.row.step.time > -1 &&
                <div className="general">
                    <span className="index">{zeroPadding(this.props.row.step.index, 5)}</span>
                    <span className="type">MSG</span>
                    <span className="start-time">{getDate(new Date(stepStartTime), 2)}</span>
                    <span className="elapsed">{this.props.row.step.time} ms</span>
                    <span className="value">#{this.props.row.step.value}</span>
                </div>
                }
                <div className="message-content">{this.props.row.mainValue}</div>
            </div>)
    }
}

export default ApiCallSumStep;