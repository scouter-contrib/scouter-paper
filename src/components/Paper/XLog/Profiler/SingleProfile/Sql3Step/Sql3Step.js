import React, {Component} from 'react';
import './Sql3Step.css';
import StepGeneral from "../StepGeneral/StepGeneral";
import sqlFormatter from "sql-formatter";

class Sql3Step extends Component {
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
            <div className="step sql3-step">
                <StepGeneral startTime={this.props.startTime} row={this.props.row} elapsed={this.props.row.step.elapsed} type="SQL"/>
                <div className={"sql-statement " + (this.props.formatter ? 'formatter' : '')} dangerouslySetInnerHTML={{__html: sql}}></div>
                <div className="sql-param">[{this.props.row.step.param}]</div>
            </div>)
    }
}

export default Sql3Step;