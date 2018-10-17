import React, {Component} from 'react';
import './ApiCallSumStep.css';
import StepGeneral from "../StepGeneral/StepGeneral";
import TxNavLink from "../TxNavLink/TxNavLink";
import Error from "../Error/Error";
// scouter.lang.step.ApiCallSum
/*
    public int hash;
	public int count;
	public long elapsed;
	public long cputime;
	public int error;
	public byte opt;
 */
class ApiCallSumStep extends Component {
    render() {
        return (
            <div className="step api-call-sum-step">
                <StepGeneral startTime={this.props.startTime} row={this.props.row} elapsed={this.props.row.step.elapsed} type="API SUM"/>
                <TxNavLink txLinkClick={this.props.txLinkClick} row={this.props.row}></TxNavLink>
                {(isNaN(this.props.row.step.error) || Number(this.props.row.step.error) > 0) && <Error row={this.props.row}></Error>}
                <div className="message-content">{this.props.row.mainValue} {this.props.row.step.count} {this.props.row.step.opt ? this.props.row.step.opt : ''}</div>
            </div>)
    }
}

export default ApiCallSumStep;