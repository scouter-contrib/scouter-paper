import React, {Component} from 'react';
import './ApiCall2Step.css';
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

//scouter.lang.step.ApiCallStep2
/*
    public byte async;
 */
class ApiCall2Step extends Component {
    render() {
        return (
            <div className="step api-call2-step">
                <StepGeneral startTime={this.props.startTime} row={this.props.row} elapsed={this.props.row.step.elapsed} type="API"/>
                {(isNaN(this.props.row.step.error) || Number(this.props.row.step.error) > 0) && <Error row={this.props.row}></Error>}
                <div className="message-content"><span className="async-tag">{this.props.row.step.async}</span>{this.props.row.step.address} {this.props.row.step.opt ? this.props.row.step.opt : ''}</div>
            </div>)
    }
}

export default ApiCall2Step;