import React, {Component} from 'react';
import './DumpStep.css';
import StepGeneral from "../StepGeneral/StepGeneral";

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
                <div className="message-content">{this.props.row.step.threadId}</div>
                <div className="message-content">{this.props.row.step.threadName}</div>
                <div className="message-content">{this.props.row.step.threadState}</div>
                <div className="message-content">{this.props.row.step.lockOwnerId}</div>
                <div className="message-content">{this.props.row.step.lockName}</div>
                <div className="message-content">{this.props.row.step.lockOwnerName}</div>
                <div className="message-content">{this.props.row.mainValue}</div>
            </div>)
    }
}

export default DumpStep;