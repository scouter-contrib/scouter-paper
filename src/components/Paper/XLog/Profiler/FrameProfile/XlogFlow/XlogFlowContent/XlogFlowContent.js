import React,{Component} from "react";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import SQLText from "./SQLText/SQLText"
import "./XlogFlowContent.css"
import {IdAbbr} from "../../../../../../../common/idAbbr";
// import moment from "moment";
import ElementType from "../../../../../../../common/ElementType";
import * as d3 from "d3";
import numeral from "numeral";
import moment from "moment/moment";
import {getCurrentUser, getHttpProtocol, getWithCredentials, setAuthHeader} from "../../../../../../../common/common";
import jQuery from "jquery";

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
            const {thisTxid} = this.props;
            if(thisTxid !== txid && this.isTxFlow()) {
                this.props.txBtnClick({txid: txid, endTime: endTime});
            }
        }
    };
    getProfileType(){
        const {type} = this.props.content;
        return ElementType.defaultProps.toString(type)
    }
    isTxFlow(){

        const {type,txid} = this.props.content;
        const {thisTxid} = this.props;

        switch (type) {
            case ElementType.defaultProps.SERVICE:
            case ElementType.defaultProps.DISPATCH:
            case ElementType.defaultProps.THREAD:
                return thisTxid !== txid;
            default:
                return false;
        }
    }
    getError(){
        let ret = '';
        const {endTime,error} = this.props.content;

        if(isNaN(Number(error))){
            return error;
        }

        jQuery.ajax({
            method: "GET",
            async: false,
            dataType: "json",
            url: `${getHttpProtocol(this.props.config)}/scouter/v1/dictionary/${moment(new Date(Number(endTime))).format("YYYYMMDD")}?dictKeys=[error:${error}]`,
            xhrFields: getWithCredentials(this.props.config),
            beforeSend: (xhr)=>{
                setAuthHeader(xhr, this.props.config, getCurrentUser(this.props.config, this.props.user));
            }
        }).done(data=>{
            const res = data.result[0];
            if(res) {
                ret = res.text
            }
        });
        return ret;
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
            default:
                cov=value;
        }
        return `${cov} ${meta.unit}`;
    }
    render(){
        const isSQL = this.getProfileType() === 'SQL';
        return (
            <div className="xlog-flow-content">
                <div className="title">
                    <span>FLOW CONTENTS - {IdAbbr.abbr(this.props.content.txid)}(TXID : {this.props.content.txid})</span>
                </div>
                <div className="close-btn" onClick={this.close}></div>
                <div className="contents scrollbar">
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
                        FLOW TYPE
                    </div>
                    <div className="type">
                        <span>{this.getProfileType()}</span>
                        {isSQL ? <SQLText meta={this.props.content.tags}/> : <div key="type" className="info">{this.props.content.name}</div>}
                    </div>
                    {
                        this.props.content.isError && <div className="type error">
                            <span>ERROR</span>
                            <div key="error" className="info">
                            {this.getError()}
                            </div>
                        </div>
                    }

                </div>
            </div>
        )
    }
}
const mapStateToProps = (state) => {
    return {
        config: state.config,
        user : state.user
    };
};
XlogFlowContent = connect(mapStateToProps, null)(XlogFlowContent);
export default withRouter(XlogFlowContent);