import React, {Component} from 'react';
import './DumpStep.css';
import StepGeneral from "../StepGeneral/StepGeneral";
import TxNavLink from "../TxNavLink/TxNavLink";

//scouter.lang.step.DumpStep
/*
    public int[] stacks;
    public long threadId;
    public String threadName;
    public String threadState;
    public long lockOwnerId;
    public String lockName;
    public String lockOwnerName;
 */
class DumpStep extends Component {
    render() {

        return (
            <div className="step dump-step">
                <StepGeneral startTime={this.props.startTime} row={this.props.row} elapsed={undefined} type="DUMP"/>
                <TxNavLink txLinkClick={this.props.txLinkClick} row={this.props.row}></TxNavLink>
                <div className="message-content">{this.props.row.step.threadState} ID:{this.props.row.step.threadId} {this.props.row.step.threadName}</div>
                <div className={"message-content " + (this.props.formatter ? 'formatter' : '')} >{this.props.row.additionalValueList.length > 0 ? this.props.row.additionalValueList.join('\n') : ''}</div>
            </div>)
    }
}

export default DumpStep;
