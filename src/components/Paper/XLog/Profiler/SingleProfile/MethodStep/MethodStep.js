import React, {Component} from 'react';
import './MethodStep.css';
import StepGeneral from "../StepGeneral/StepGeneral";

// scouter.lang.step.MethodStep
/*
    public int hash;
	public int elapsed;
	public int cputime;
 */
class MethodStep extends Component {
    render() {
        return (
            <div className="step method-step">
                <StepGeneral startTime={this.props.startTime} row={this.props.row} elapsed={this.props.row.step.elapsed} type="METHOD"/>
                <div className="message-content">{this.props.row.mainValue}</div>
            </div>
        )
    }
}

export default MethodStep;