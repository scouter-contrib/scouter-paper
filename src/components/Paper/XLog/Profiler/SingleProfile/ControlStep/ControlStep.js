import React, {Component} from 'react';
import './ControlStep.css';
import StepGeneral from "../StepGeneral/StepGeneral";
import TxNavLink from "../TxNavLink/TxNavLink";
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
                <TxNavLink txLinkClick={this.props.txLinkClick} row={this.props.row}></TxNavLink>
                <div className="message-content">{this.props.row.step.code} {this.props.row.step.message}</div>
            </div>)
    }
}

export default ControlStep;