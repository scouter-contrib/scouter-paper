import React, {Component} from 'react';
import './SocketSumStep.css';
import StepGeneral from "../StepGeneral/StepGeneral";
import TxNavLink from "../TxNavLink/TxNavLink";
import Error from "../Error/Error";

//scouter.lang.step.SocketSum
/*
    public byte[] ipaddr;
	public int port;
	public int count;
	public long elapsed;
	public int error;
 */
class SocketSumStep extends Component {
    render() {

        return (
            <div className="step socket-sum-step">
                <StepGeneral startTime={this.props.startTime} row={this.props.row} elapsed={this.props.row.step.elapsed} type="SOCKET SUM"/>
                <TxNavLink txLinkClick={this.props.txLinkClick} row={this.props.row}></TxNavLink>
                {(isNaN(this.props.row.step.error) || Number(this.props.row.step.error) > 0) && <Error row={this.props.row}></Error>}
                <div className="message-content">
                    <span>{this.props.row.step.ipaddr}:{this.props.row.step.port} {this.props.row.step.count}</span>
                </div>
            </div>)
    }
}

export default SocketSumStep;