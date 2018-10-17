import React, {Component} from 'react';
import './MessageSumStep.css';
import StepGeneral from "../StepGeneral/StepGeneral";
import TxNavLink from "../TxNavLink/TxNavLink";

//scouter.lang.step.MessageSum
/*
    public String message;
	public int count;
 */
class MessageSumStep extends Component {
    render() {
        return (
            <div className="step message-sum-step">
                <StepGeneral startTime={this.props.startTime} row={this.props.row} elapsed={undefined} type="MSG SUM"/>
                <TxNavLink txLinkClick={this.props.txLinkClick} row={this.props.row}></TxNavLink>
                <div className="message-content">{this.props.row.step.message} {this.props.row.step.count}</div>
            </div>)
    }
}

export default MessageSumStep;