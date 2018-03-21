import React, {Component} from 'react';
import './MethodSumStep.css';
import StepGeneral from "../StepGeneral/StepGeneral";

//scouter.lang.step.MethodSum
/*
    public int hash;
	public int count;
	public long elapsed;
	public long cputime;
 */
class MethodSumStep extends Component {
    render() {
        return (
            <div className="step method-sum-step">
                <StepGeneral startTime={this.props.startTime} row={this.props.row} elapsed={this.props.row.step.elapsed} type="METHOD SUM"/>
                <div className="message-content">{this.props.row.mainValue} {this.props.row.step.count} {this.props.row.step.cputime}ms</div>
            </div>)
    }
}

export default MethodSumStep;