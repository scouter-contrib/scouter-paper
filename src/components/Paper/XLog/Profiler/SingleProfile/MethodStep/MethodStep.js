import React, {Component} from 'react';
import './MethodStep.css';
import StepGeneral from "../StepGeneral/StepGeneral";
import TxNavLink from "../TxNavLink/TxNavLink";

// scouter.lang.step.MethodStep
/*
    public int hash;
	public int elapsed;
	public int cputime;
 */
class MethodStep extends Component {
    render() {
        const fullMethod = this.props.row.mainValue;
        const parts = fullMethod.split('.');
        let methodNameSimple = fullMethod;
        if(parts.length >= 2) {
            const methodName = parts[parts.length - 1];
            const bracePos = methodName.indexOf('(');
            if(bracePos > 0) {
                methodNameSimple = parts[parts.length - 2] + "#" + methodName.substring(0, bracePos) + "()";
            }
        }

        return (
            <div className="step method-step">
                <StepGeneral startTime={this.props.startTime} row={this.props.row} elapsed={this.props.row.step.elapsed} type="METHOD"/>
                <TxNavLink txLinkClick={this.props.txLinkClick} row={this.props.row}></TxNavLink>
                <div className="message-content">{methodNameSimple} <span className="gray">[{fullMethod}]</span></div>
            </div>
        )
    }
}

export default MethodStep;
