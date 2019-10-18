import React,{Component} from "react";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import "./XlogFlowContent.css"
import {IdAbbr} from "../../../../../../../common/idAbbr";
// import moment from "moment";
import ElementType from "../../../../../../../common/ElementType";
import * as d3 from "d3";
import numeral from "numeral";

const contents = [
    {
        key : 'txid',
        show : true,
        dip : 'Transaction ID',
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
        show : true,
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
    click=()=>{
        const {txid,endTime} = this.props.content;
        this.props.txBtnClick({txid: txid,endTime:endTime});
    };

    isTxFlow(){
        const {type} = this.props.content;
        switch (type) {
            case ElementType.defaultProps.SERVICE:
            case ElementType.defaultProps.DISPATCH:
            case ElementType.defaultProps.THREAD:
                return true;
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
                cov = `${IdAbbr.abbr(value)} (${value})`;
                break;
            case 'profile-category':
                cov = ElementType.defaultProps.toString(value);
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
                    <span>FLOW CONTENTS - {IdAbbr.abbr(this.props.content.txid)}</span>
                </div>
                <div className="close-btn" onClick={this.close}></div>
                <div className="contents">
                    <div className="flow-data">

                    {contents.filter(d => d.show)
                             .filter(d => this.props.content[d.key] ? true : false)
                        .map(d =>
                            <div key={d.key}>
                                <span className="label">{d.dip}</span>
                                <span className={`data ${d.key}`}>{this.dataTodisplay(d,this.props.content[d.key])}</span>
                            </div>
                        )
                    }
                    {
                       this.isTxFlow() ?
                           <div key='service'>
                             <span className="label">EndPoint</span>
                             <span className="data">{this.props.content.name}</span>
                          </div>
                          :
                           <div key='pre'>
                               <pre>{this.props.content.name}</pre>
                           </div>
                    }
                    </div>
                    {this.isTxFlow() && <div className="xlog-flow-btn" onClick={this.click}>
                        <div className="flow-btn"><i className="fa fa-sign-out"></i> TRY TX FLOW</div>
                    </div>}
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