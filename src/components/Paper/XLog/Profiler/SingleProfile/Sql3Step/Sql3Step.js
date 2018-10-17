import React, {Component} from 'react';
import './Sql3Step.css';
import StepGeneral from "../StepGeneral/StepGeneral";
import sqlFormatter from "sql-formatter";
import Error from "../Error/Error";
import TxNavLink from "../TxNavLink/TxNavLink";
//scouter.lang.step.SqlStep2
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

	//scouter.lang.step.SqlStep3
	public int updated; -> StepGeneral
 */
class Sql3Step extends Component {
    render() {

        let sql = "";

        if (this.props.bind) {
            let params = divideParams(this.props.row.step.param);
            let {sql: sql0, params: params0} = literalBind(this.props.row.mainValue, params);

            for (let i = 0; i < params0 && params0.length; i++) {
                params0[i] = "<span class='param'>" + params0[i] + "</span>";
            }
            sql = sqlFormatter.format(sql0, {
                params: params0,
                indent: "  "
            });

        } else {
            sql = sqlFormatter.format(this.props.row.mainValue, {
                indent: "  "
            });
        }

        sql = '<span class="prefix">' + this.props.row.step.xtypePrefix + '</span>' + sql;

        return (
            <div className="step sql3-step">
                <StepGeneral startTime={this.props.startTime} row={this.props.row} elapsed={this.props.row.step.elapsed} type="SQL"/>
                <TxNavLink txLinkClick={this.props.txLinkClick} row={this.props.row}></TxNavLink>
                {(isNaN(this.props.row.step.error) || Number(this.props.row.step.error) > 0) && <Error row={this.props.row}></Error>}
                <div className={"sql-statement " + (this.props.formatter ? 'formatter' : '')} dangerouslySetInnerHTML={{__html: sql}}></div>
                <div className="sql-param">[{this.props.row.step.param}]</div>
            </div>)
    }
}

function literalBind(sql, params) {
    if(!params) return {sql: sql, params: []};
    if(!sql) return {sql: sql, params: params};

    const re = /@{\d+}/g;

    let boundSql = "";
    let pos = 0;
    let index = 0;

    while(true) {
        let matched = re.exec(sql);
        if (matched) {
            boundSql = boundSql
                + sql.substring(pos, matched.index)
                + stripSideChar(params[index], "'");

            pos = matched.index + matched[0].length;
            index++;

        } else {
            break;
        }
    }

    boundSql = boundSql + sql.substring(pos);

    return {
        sql: boundSql,
        params: params.slice(index)
    }

}

function stripSideChar(str, ch) {
    if (!str) {
        return str;
    }
    if (str[0] === ch && str[str.length - 1] === ch) {
        return str.substring(1, str.length -1);
    }

    return str;
}

function divideParams(params) {
    if(!params) return;

    const paramArray = [];

    let start = 0;
    let isQ = false;
    let isDQ = false;

    Array.from(params).forEach((ch, i) => {
        if (ch === ',' && !isQ && !isDQ) {
            paramArray.push(params.substring(start, i));
            start = i + 1;

        } else if (ch === "'" && !isDQ) {
            isQ = !isQ;

        } else if (ch === '"' && !isQ) {
            isDQ = !isDQ;
        }
    });
    paramArray.push(params.substring(start));

    return paramArray;
}

export default Sql3Step;
