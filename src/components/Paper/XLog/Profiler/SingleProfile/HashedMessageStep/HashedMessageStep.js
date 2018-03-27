import React, {Component} from 'react';
import './HashedMessageStep.css';

//scouter.lang.step.HashedMessageStep
/*
    public int hash;
	public int time;
	public int value;
 */
class HashedMessageStep extends Component {
    render() {
        return (
            <div className="step hashed-message">
                <div className="message-content">
                    <div className="tag"><span className="type-tag">MSG</span></div>
                    <div><span>{this.props.row.mainValue} {this.props.row.step.time >= 0 && '#' + this.props.row.step.value + ' ' + this.props.row.step.time + 'ms'}</span></div>
                </div>
            </div>)
    }
}

export default HashedMessageStep;
