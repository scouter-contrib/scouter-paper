import React,{Component} from "react";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import "./XlogFlowContent.css"
import {IdAbbr} from "../../../../../../../common/idAbbr";
import sqlFormatter from "sql-formatter";
// import moment from "moment";
import ElementType from "../../../../../../../common/ElementType";
import * as d3 from "d3";
import numeral from "numeral";

const contents = [
    {
        key : 'txid',
        show : true,
        dip : 'Txid',
        type : 'scouter-tx',
        unit : ''
    },
    {
        key : 'endTime',
        dip : 'EndTime',
        type : 'date',
        unit : '',
        show : true,
    },
    {
        key : 'elapsed',
        show : true,
        dip : 'Duration',
        type : 'number',
        unit : 'ms'
    },
    {
        key : 'excludeObjName',
        dip : '',
        type : 'boolean',
        unit : '',
        show : false,
    },
    {
        key : 'type',
        show : false,
        dip : 'Profile Type',
        type : 'profile-category',
        unit : ''
    },
    {
        key : 'threadName',
        show : true,
        dip : 'Thread Name',
        type : 'string',
        unit : ''
    },
    {
        key : 'address',
        show : true,
        dip : 'Address',
        type : 'string',
        unit : ''
    },
    {
        key : 'objName',
        show : true,
        dip : 'Instance Name',
        type : 'string',
        unit : ''
    },
    {
        key : 'name',
        dip : 'EndPoint',
        type : 'string',
        unit : '',
        show : false,
    }
];

class XlogFlowContent extends Component {


    close=()=>{
        this.props.close();
    };

    click=(target)=>{
        if(target === 'txid') {
            const {txid, endTime} = this.props.content;
            this.props.txBtnClick({txid: txid, endTime: endTime});
        }
    };
    getProfileType(){
        const {type} = this.props.content;
        return ElementType.defaultProps.toString(type)
    }
    isTxFlow(){

        const {type,txid} = this.props.content;
        switch (type) {
            case ElementType.defaultProps.SERVICE:
            case ElementType.defaultProps.DISPATCH:
            case ElementType.defaultProps.THREAD:
                return this.props.thisTxid !== txid;
            default:
                return false;
        }
    }
    dataTodisplay(meta,value){
        const {numberFormat,timeFormat,dateFormat} = this.props.config;
        const fullTimeFormat = `${dateFormat} ${timeFormat}`;
        let cov;
        switch(meta.type){
            case 'date':
                cov = d3.timeFormat(fullTimeFormat)(new Date(Number(value)));
                break
            case 'number':
                cov= numeral(value).format(numberFormat);
                break
            case 'scouter-tx':
                cov = `${IdAbbr.abbr(value)}`;
                break;
            case 'profile-category':
                cov = ElementType.defaultProps.toString(value);
                break;
            case 'SQL':
                cov = sqlFormatter.format(value,{indent : "  "});
                break;
            default:
                cov=value;
        }
        return `${cov} ${meta.unit}`;
    }
    render(){
        return (
            <div className="xlog-flow-content">
                <div className="title">
                    <span>FLOW CONTENTS - {IdAbbr.abbr(this.props.content.txid)}(TXID : {this.props.content.txid})</span>
                </div>
                <div className="close-btn" onClick={this.close}></div>
                <div className="contents">
                    <div className="sub-title">
                        FLOW INFO
                    </div>
                    <div className="flow-data">
                        {contents.filter(d => d.show)
                                 .filter(d => this.props.content[d.key] ? true : false)
                            .map(d =>
                                <div key={d.key}>
                                    <span className="label">{d.dip}</span>
                                    <span className={`data ${this.isTxFlow() ? d.key : ''}`} onClick={()=>this.click(d.key)}>{this.dataTodisplay(d,this.props.content[d.key])}</span>
                                </div>
                            )
                        }
                    </div>
                    <div className="sub-title">
                        FLOW TYPE - {this.getProfileType()}
                    </div>
                    <div key='text' className={`type ${this.getProfileType() === 'SQL' ? 'sql-statement formatter' :''}`}>
                       {this.dataTodisplay({type : this.getProfileType(), unit : ''},this.props.content.name)}
                    </div>


                </div>
            </div>
        )
    }
}
const mapStateToProps = (state) => {
    return {
        config: state.config,
    };
};
XlogFlowContent = connect(mapStateToProps, null)(XlogFlowContent);
export default withRouter(XlogFlowContent);