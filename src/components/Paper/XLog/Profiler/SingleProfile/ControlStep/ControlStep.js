import React, {Component} from 'react';
import './ControlStep.css';
import StepGeneral from "../StepGeneral/StepGeneral";
//scouter.lang.step.StepControl
/*
    public String message;
	public int code;
 */
class ControlStep extends Component {
    render() {

        return (
            <div className="step step-control-step">
                <StepGeneral startTime={this.props.startTime} row={this.props.row} elapsed={undefined} type="CONTROL"/>
                <div className="message-content">{this.props.row.step.code} {this.props.row.step.message}</div>
            </div>)
    }
}

export default ControlStep;