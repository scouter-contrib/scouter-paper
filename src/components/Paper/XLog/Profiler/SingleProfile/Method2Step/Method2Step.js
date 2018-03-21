import React, {Component} from 'react';
import './Method2Step.css';
import StepGeneral from "../StepGeneral/StepGeneral";
import Error from "../Error/Error";

// scouter.lang.step.Method2Step
/*
    //MethodStep
    public int hash;
	public int elapsed;
	public int cputime;

	//Method2Step
	public int error;
 */
class Method2Step extends Component {
    render() {
        return (
            <div className="step method2-step">
                <StepGeneral startTime={this.props.startTime} row={this.props.row} elapsed={this.props.row.step.elapsed} type="METHOD"/>
                {(isNaN(this.props.row.step.error) || Number(this.props.row.step.error) > 0) && <Error row={this.props.row}></Error>}
                <div className="message-content">{this.props.row.mainValue}</div>
            </div>
        )
    }
}

export default Method2Step;