import React, {Component} from 'react';
import './ParameterizedMessageStep.css';
import StepGeneral from "../StepGeneral/StepGeneral";

//scouter.lang.step.ParameterizedMessageStep
/*
private static char delimETX = 3;

	private int hash;
	private int elapsed = -1;
	private byte level = 0; //0:debug, 1:info, 2:warn, 3:error
	private String paramString;
 */
class ParameterizedMessageStep extends Component {
    render() {
        return (
            <div className="step parameterized-message-step">
                <StepGeneral startTime={this.props.startTime} row={this.props.row} elapsed={this.props.row.step.elapsed} type="CUSTOM"/>
                <div className={"message-content " + this.props.row.step.level.toLowerCase()}>{this.props.row.mainValue}</div>
            </div>)
    }
}

export default ParameterizedMessageStep;
