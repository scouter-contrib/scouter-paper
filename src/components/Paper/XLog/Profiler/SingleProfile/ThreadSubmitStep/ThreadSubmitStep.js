import React, {Component} from 'react';
import './ThreadSubmitStep.css';
import StepGeneral from "../StepGeneral/StepGeneral";
import TxNavLink from "../TxNavLink/TxNavLink";
import Error from "../Error/Error";
//scouter.lang.step.ThreadSubmitStep
/*
public long txid;
	public int hash;
	public int elapsed;
	public int cputime;
	public int error;
 */
class ThreadSubmitStep extends Component {
    render() {
        return (
            <div className="step thread-submit-step">
                <StepGeneral startTime={this.props.startTime} row={this.props.row} elapsed={this.props.row.step.elapsed} type="THREAD SUBMIT"/>
                <TxNavLink txLinkClick={this.props.txLinkClick} row={this.props.row}></TxNavLink>
                {(isNaN(this.props.row.step.error) || Number(this.props.row.step.error) > 0) && <Error row={this.props.row}></Error>}
                <div className="message-content">{this.props.row.mainValue}</div>
            </div>)
    }
}

export default ThreadSubmitStep;