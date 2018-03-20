import React, {Component} from 'react';
import './Sql2Step.css';
import StepGeneral from "../StepGeneral/StepGeneral";

class Sql2Step extends Component {
    render() {
        return (
            <div className="step hashed-message">
                {this.props.row.step.time > -1 &&
                <StepGeneral startTime={this.props.startTime} row={this.props.row} elapsed={this.props.row.step.time} type="MSG"/>
                }
                <div className="message-content">{this.props.row.mainValue}</div>
            </div>)
    }
}

export default Sql2Step;