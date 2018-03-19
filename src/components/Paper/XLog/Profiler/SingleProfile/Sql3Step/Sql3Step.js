import React, {Component} from 'react';
import './Sql3Step.css';
import {getDate, zeroPadding} from '../../../../../../common/common';
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

        let stepStartTime = Number(this.props.startTime) + Number(this.props.row.step.start_time);
        return (
            <div className="step sql3-step">
                <div className="general">
                    <span className="index">{zeroPadding(this.props.row.step.index, 5)}</span>
                    <span className="type">SQL</span>
                    <span className="start-time">{getDate(new Date(stepStartTime), 2)}</span>
                    <span className="elapsed">{this.props.row.step.elapsed} ms</span>
                </div>
                <div className={"sql-statement " + (this.props.formatter ? 'formatter' : '')} dangerouslySetInnerHTML={{__html: sql}}></div>
                <div className="sql-param">[{this.props.row.step.param}]</div>
            </div>)
    }
}

export default Sql3Step;