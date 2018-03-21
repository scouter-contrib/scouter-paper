import React, {Component} from 'react';
import './ThreadCallPossibleStep.css';
import StepGeneral from "../StepGeneral/StepGeneral";

//scouter.lang.step.ThreadCallPossibleStep
/*
    public long txid;
	public int hash;
	public int elapsed;
	//0 - none thread dispatching, 1 - thread dispatching
	public byte threaded;
	public String nameTemp;
 */
class ThreadCallPossibleStep extends Component {
    render() {

        let status = "";
        if (Number(this.props.row.step.threaded) === 0) {
            status = "[NONE THREAD DISPATCHING]";
        }

        if (Number(this.props.row.step.threaded) === 1) {
            status = "pTHREAD DISPATCHING]";
        }

        return (
            <div className="step thread-call-possible-step">
                <StepGeneral startTime={this.props.startTime} row={this.props.row} elapsed={this.props.row.step.elapsed} type="THREAD CALL"/>
                <div className="message-content">{status}{this.props.row.step.nameTemp}</div>
            </div>)
    }
}

export default ThreadCallPossibleStep;