import React, {Component} from 'react';
import './Sql2Step.css';
import StepGeneral from "../StepGeneral/StepGeneral";
import TxNavLink from "../TxNavLink/TxNavLink";
import sqlFormatter from "sql-formatter";
import Error from "../Error/Error";
//scouter.lang.step.SqlStep3
/*
    //scouter.lang.step.SqlStep
    public int hash;
	public int elapsed;
	public int cputime;
	public String param;
	public int error;

	//scouter.lang.step.SqlStep2
	public byte xtype;
	getXtypePrefix

 */
class Sql2Step extends Component {
    render() {

        let sql = "";

        if (this.props.bind) {
            let params = this.props.row.step.param.split(",");
            for (let i = 0; i < params.length; i++) {
                params[i] = "<span class='param'>" + params[i] + "</span>";
            }
            sql = sqlFormatter.format(this.props.row.mainValue, {
                params: params,
                indent: "  "
            });
        } else {
            sql = sqlFormatter.format(this.props.row.mainValue, {
                indent: "  "
            });
        }

        sql = '<span class="prefix">' + this.props.row.step.xtypePrefix + '</span>' + sql;

        return (
            <div className="step sql2-step">
                <StepGeneral startTime={this.props.startTime} row={this.props.row} elapsed={this.props.row.step.elapsed} type="SQL"/>
                <TxNavLink txLinkClick={this.props.txLinkClick} row={this.props.row}></TxNavLink>
                {(isNaN(this.props.row.step.error) || Number(this.props.row.step.error) > 0) && <Error row={this.props.row}></Error>}
                <div className={"sql-statement " + (this.props.formatter ? 'formatter' : '')} dangerouslySetInnerHTML={{__html: sql}}></div>
                <div className="sql-param">[{this.props.row.step.param}]</div>
            </div>)
    }
}

export default Sql2Step;