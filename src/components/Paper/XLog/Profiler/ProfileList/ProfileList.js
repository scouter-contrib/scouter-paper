import React, {Component} from 'react';
import './ProfileList.css';
import {getDate} from '../../../../../common/common';

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
        type: "date"
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
    {
        key: "cpu",
        name: "CPU",
        type: "ms"
    },
    /*{
        key: "desc",
        name: "DESC"
    },*/
    /*{
        key: "group",
        name: "GROUP"
    },*/
    /*{
        key: "gxid",
        name: "GXID"
    },*/
    /*{
        key: "hasDump",
        name: "HAS DUMP"
    },*/
    {
        key: "ipaddr",
        name: "IP ADDRESS"
    },
    {
        key: "kbytes",
        name: "KBYTES"
    },
    {
        key: "login",
        name: "LOGIN"
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
    {
        key: "sqlTime",
        name: "SQL TIME",
        type: "ms"
    },
    /*{
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
    },*/
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
            }
            if (meta.type === "date") {
                return <span className={className} key={j}>{getDate(new Date(Number(row[meta.key])), 2)}</span>
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