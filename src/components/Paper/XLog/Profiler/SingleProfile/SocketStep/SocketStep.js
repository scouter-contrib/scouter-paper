import React, {Component} from 'react';
import './SocketStep.css';
import StepGeneral from "../StepGeneral/StepGeneral";
import Error from "../Error/Error";

//scouter.lang.step.SocketStep
/*
public byte[] ipaddr;
	public int port;
	public int elapsed;
	public int error;
 */
class SocketStep extends Component {
    render() {

        return (
            <div className="step socket-step">
                <StepGeneral startTime={this.props.startTime} row={this.props.row} elapsed={this.props.row.step.elapsed} type="SOCKET"/>
                {(isNaN(this.props.row.step.error) || Number(this.props.row.step.error) > 0) && <Error row={this.props.row}></Error>}
                <div className="message-content">
                    <span>{this.props.row.step.ipaddr}:{this.props.row.step.port}</span>
                </div>
            </div>)
    }
}

export default SocketStep;