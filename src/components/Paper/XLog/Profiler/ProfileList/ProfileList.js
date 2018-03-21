import React, {Component} from 'react';
import './ProfileList.css';
import Moment from 'react-moment';
import 'moment-timezone';

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
        name: "API CALL COUNT"
    },
    {
        key: "apicallTime",
        name: "API CALL TIME",
        type: "ms"
    },
    {
        key: "sqlCount",
        name: "SQL COUNT"
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
        name: "KBYTES"
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

class ProfileList extends Component {

    getRow = (row, i) => {
        return layout.map((meta, j) => {
            let className = meta.key;
            if (meta.type === "ms") {
                return <span className={className} key={j}>{row[meta.key]} ms</span>
            } else if (meta.type === "date") {
                return <span className={className} key={j}><Moment date={new Date(Number(row[meta.key]))} format="YYYY-MM-DD" ></Moment></span>
            } else if (meta.type === "time") {
                return <span className={className} key={j}><Moment date={new Date(Number(row[meta.key]))} format="YYYY-MM-DD HH:mm:ss" ></Moment></span>
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
                    return <div onClick={this.props.rowClick.bind(this, xlog)} key={i} className={"row " + rowClass + ' ' + (this.props.txid === xlog.txid ? 'active' : '')}>{this.getRow(xlog, i)}</div>;
                })}
            </div>

        );
    }
}

export default ProfileList;