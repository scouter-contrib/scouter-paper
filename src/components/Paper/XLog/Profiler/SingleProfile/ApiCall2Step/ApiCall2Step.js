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
                <div className="message-content">{this.props.row.step.async === 1 ? '[async]' : ''}{this.props.row.mainValue} {this.props.row.step.opt == '1' ? '[addr] ' + this.props.row.step.address : ''}</div>
            </div>)
    }
}

export default ApiCall2Step;
