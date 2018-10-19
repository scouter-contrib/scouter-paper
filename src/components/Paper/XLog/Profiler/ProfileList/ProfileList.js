import React, {Component} from 'react';
import './ProfileList.css';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import * as d3 from "d3";
import numeral from "numeral";

const layout = [

    {
        key: "objName",
        name: "INSTANCE"
    },
    {
        key: "service",
        name: "SERVICE"
    },
    {
        key: "endTime",
        name: "END TIME",
        type: "time"
    },
    {
        key: "elapsed",
        name: "ELAPSED",
        type: "ms"
    },
    /*{
        key: "txid",
        name: "TXID"
    },*/
    {
        key: "apicallCount",
        name: "API CALL COUNT",
        type: "number"
    },
    {
        key: "apicallTime",
        name: "API CALL TIME",
        type: "ms"
    },
    {
        key: "sqlCount",
        name: "SQL COUNT",
        type: "number"
    },
    {
        key: "sqlTime",
        name: "SQL TIME",
        type: "ms"
    },
    /*{
        key: "caller",
        name: "CALLER"
    },*/
    /*{
        key: "city",
        name: "CITY"
    },
    {
        key: "countryCode",
        name: "COUNTRY"
    },*/
    /*{
        key: "group",
        name: "GROUP"
    },*/
    /*{
        key: "gxid",
        name: "GXID"
    },*/
    {
        key: "ipAddr", // on xlog data api
        name: "IP ADDRESS"
    },
    {
        key: "cpu",
        name: "CPU",
        type: "ms"
    },
    {
        key: "allocatedMemory", // on xlog data api
        name: "Memory",
        type: "kbytes"
    },
    /*{
        key: "objHash",
        name: "OBJHASH"
    },*/
    {
        key: "queuingTime",
        name: "QUEUING TIME",
        type: "ms"
    },
    {
        key: "referrer",
        name: "REFERRER"
    },
    /*{
        key: "threadNameHash",
        name: "THREAD NAME HASH"
    },
    {
        key: "userAgent",
        name: "USER AGENT"
    },*/
    /*{
        key: "userid",
        name: "USERID"
    },
    {
        key: "xtype",
        name: "XTYPE"
    }*/
    {
        key: "hasDump",
        name: "HAS DUMP"
    },
    {
        key: "login",
        name: "LOGIN"
    },
    {
        key: "desc",
        name: "DESC"
    },
    {
        key: "text1",
        name: "TEXT1"
    },
    {
        key: "text2",
        name: "TEXT2"
    },
    {
        key: "text3",
        name: "TEXT3"
    },
    {
        key: "text4",
        name: "TEXT4"
    },
    {
        key: "text5",
        name: "TEXT5"
    },
    {
        key: "error",
        name: "ERROR"
    },
];

const xlogTypes = {
    "WEB_SERVICE": 0,
    "APP_SERVICE": 1,
    "BACK_THREAD": 2,
    "ASYNCSERVLET_DISPATCHED_SERVICE": 3,
    "BACK_THREAD2": 4
};

class ProfileList extends Component {

    dateFormat = null;
    fullTimeFormat = null;

    componentDidMount() {
        this.dateFormat = this.props.config.dateFormat;
        this.fullTimeFormat = this.props.config.dateFormat + " " + this.props.config.timeFormat;
    }



    getRow = (row, i) => {
        return layout.map((meta, j) => {
            let className = meta.key;
            if (meta.type === "number") {
                return <span className={className} key={j}>{numeral(row[meta.key]).format(this.props.config.numberFormat)}</span>
            } else if (meta.type === "ms") {
                return <span className={className} key={j}>{numeral(row[meta.key]).format(this.props.config.numberFormat)} ms</span>
            } else if (meta.type === "date") {
                return <span className={className} key={j}>{d3.timeFormat(this.dateFormat)(new Date(Number(row[meta.key])))}</span>
            } else if (meta.type === "time") {
                return <span className={className} key={j}>{d3.timeFormat(this.fullTimeFormat)(new Date(Number(row[meta.key])))}</span>
            } else if (meta.type === "kbytes") {
                return <span className={className} key={j}>{numeral(row[meta.key]).format(this.props.config.numberFormat + "b")}</span>
            } else {
                return <span className={className} key={j}>{row[meta.key]}</span>
            }

        });
    };

    getHeader = () => {
        return layout.map((meta, j) => {
            return <span key={j}>{meta.name}</span>
        });
    };


    render() {
        return (
            <div className="xlog-profile-list">
                <div className="row header">{this.getHeader()}</div>
                {this.props.xlogs && this.props.xlogs.map((xlog, i) => {
                    let rowClass = (xlog.error ? 'error' : '');
                    const xtype = xlogTypes[xlog.xlogType];
                    rowClass += xtype && xtype >= 2 && xtype <= 4 ? ' async' : '';

                    return <div onClick={this.props.rowClick.bind(this, xlog, null)} key={i} className={"row " + rowClass + ' ' + (this.props.txid === xlog.txid ? 'active' : '')}>{this.getRow(xlog, i)}</div>;
                })}
            </div>

        );
    }
}

let mapStateToProps = (state) => {
    return {
        config: state.config
    };
};

ProfileList = connect(mapStateToProps, undefined)(ProfileList);
export default withRouter(ProfileList);
