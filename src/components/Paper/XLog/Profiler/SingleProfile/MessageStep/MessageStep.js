import React, {Component} from 'react';
import './MessageStep.css';
import StepGeneral from "../StepGeneral/StepGeneral";

//scouter.lang.step.MessageStep
/*
public String message;
 */
class MessageStep extends Component {
    render() {
        return (
            <div className="step message-step">
                <StepGeneral startTime={this.props.startTime} row={this.props.row} elapsed={undefined} type="MSG"/>
                <div className="message-content">{this.props.row.mainValue ? this.props.row.mainValue : this.props.row.step.message}</div>
            </div>)
    }
}

export default MessageStep;