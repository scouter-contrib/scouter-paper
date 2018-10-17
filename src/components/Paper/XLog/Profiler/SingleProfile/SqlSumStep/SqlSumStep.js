import React, {Component} from 'react';
import './SqlSumStep.css';
import StepGeneral from "../StepGeneral/StepGeneral";
import TxNavLink from "../TxNavLink/TxNavLink";
import Error from "../Error/Error";

//scouter.lang.step.SqlSum
/*
public int hash;
	public int count;
	public long elapsed;
	public long cputime;
	public int error;

	public String param;
	public String param_error;
 */
class SqlSumStep extends Component {
    render() {
        return (
            <div className="step sql-sum-step">
                <StepGeneral startTime={this.props.startTime} row={this.props.row} elapsed={this.props.row.step.elapsed} type="SQL SUM"/>
                <TxNavLink txLinkClick={this.props.txLinkClick} row={this.props.row}></TxNavLink>
                {(isNaN(this.props.row.step.error) || Number(this.props.row.step.error) > 0) && <Error row={this.props.row}></Error>}
                <div className="message-content">{this.props.row.mainValue} {this.props.row.step.count} {this.props.row.step.cputime}ms</div>
                <div className="sql-param">[{this.props.row.step.param}]</div>
                <div className="sql-param">[{this.props.row.step.param_error}]</div>

            </div>)
    }
}

export default SqlSumStep;