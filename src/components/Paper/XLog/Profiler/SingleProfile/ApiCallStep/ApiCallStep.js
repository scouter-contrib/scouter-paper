import React, {Component} from 'react';
import './ApiCallStep.css';
import StepGeneral from "../StepGeneral/StepGeneral";
import Error from "../Error/Error";

//scouter.lang.step.ApiCallStep
/*
    public long txid;
	public int hash;
	public int elapsed;
	public int cputime;
	public int error;
	//optional
	transient public byte opt;
	public String address;
 */
class ApiCallStep extends Component {
    render() {
        return (
            <div className="step api-call-step">
                <StepGeneral startTime={this.props.startTime} row={this.props.row} elapsed={this.props.row.step.elapsed} type="API"/>
                {(isNaN(this.props.row.step.error) || Number(this.props.row.step.error) > 0) && <Error row={this.props.row}></Error>}
                <div className="message-content">{this.props.row.step.async === 1 ? '[async]' : ''}{this.props.row.mainValue} {this.props.row.step.opt == '1' ? 'addr:' + this.props.row.step.addr : ''}</div>
            </div>)
    }
}

export default ApiCallStep;