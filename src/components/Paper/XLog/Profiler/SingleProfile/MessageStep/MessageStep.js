import React, {Component} from 'react';
import './MessageStep.css';

//scouter.lang.step.MessageStep
/*
public String message;
 */
class MessageStep extends Component {
    render() {
        return (
            <div className="step message-step">
                <div className="message-content">
                    <div className="tag"><span className="type-tag">MSG</span></div>
                    <div><span>{this.props.row.step.message}</span></div>
                </div>
            </div>)
    }
}

export default MessageStep;
