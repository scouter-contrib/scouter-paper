import React, {Component} from 'react';
import './Profiler.css';
import {addRequest} from '../../../../actions';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import jQuery from "jquery";
import {getHttpProtocol} from '../../../../common/common';

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
        type : "date"
    },
    {
        key: "elapsed",
        name: "ELAPSED",
        type : "ms"
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
        type : "ms"
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
        type : "ms"
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
        type : "ms"
    },
    {
        key: "referrer",
        name: "REFERRER"
    },
    {
        key: "sqlTime",
        name: "SQL TIME",
        type : "ms"
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

class Profiler extends Component {


    constructor(props) {
        super(props);
        this.state = {
            show: false,
            xlogs: [],
            last: null,
            txid : null,
            enter : false,
            profile : null,
            steps : null
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (JSON.stringify(nextProps.selection) !== JSON.stringify(this.props.selection)) {
            return true;
        }

        if (nextState.last !== this.state.last) {
            return true;
        }

        if (nextState.show !== this.state.show) {
            return true;
        }

        if (nextState.txid !== this.state.txid) {
            return true;
        }

        if (nextState.enter !== this.state.enter) {
            return true;
        }

        if (JSON.stringify(nextState.profile) !== JSON.stringify(this.state.profile)) {
            return true;
        }

        return false;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.selection.x1 === null || nextProps.selection.x2 === null || nextProps.selection.y1 === null || nextProps.selection.y2 === null) {
            this.setState({
                show: false
            });
        } else {

            if (JSON.stringify(nextProps.selection) !== JSON.stringify(this.props.selection)) {
                let x1 = nextProps.selection.x1;
                let x2 = nextProps.selection.x2;
                let y1 = nextProps.selection.y1;
                let y2 = nextProps.selection.y2;
                this.getList(x1, x2, y1, y2);
            }
        }
    }

    getYYYYMMDD (date) {
        var mm = date.getMonth() + 1; // getMonth() is zero-based
        var dd = date.getDate();

        return [date.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
        ].join('');
    }

    getDate (date) {
        var mm = date.getMonth() + 1; // getMonth() is zero-based
        var dd = date.getDate();

        let yyyymmdd = [date.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
        ].join('-');

        let hhmmss  = [date.getHours(), date.getMinutes(), date.getSeconds()].join(':');

        return yyyymmdd + ' ' + hhmmss + "." + (date.getMilliseconds() < 100 ? date.getMilliseconds() * 10 : date.getMilliseconds());
    }

    getList = (x1, x2, y1, y2) => {

        let date = this.getYYYYMMDD(new Date(x1));

        this.props.addRequest();
        jQuery.ajax({
            method: "GET",
            async: true,
            url: getHttpProtocol(this.props.config) + '/scouter/v1/xlog-data/search/' + date + '?objHashes=' + this.props.instances[0].objHash + "&startTimeMillis=" + x1 + "&endTimeMillis=" + x2
        }).done((msg) => {

            let list = msg.result;

            if (list && list.length > 0) {

                let instanceMap = {};
                for (let i=0; i<this.props.instances.length; i++) {
                    instanceMap[this.props.instances[i].objHash] = this.props.instances[i].objName;
                }

                let xlogs = [];
                for (let i = 0; i < list.length; i++) {
                    let xlog = list[i];
                    let elapsed = Number(xlog.elapsed);
                    if (y1 <= elapsed && y2 >= elapsed) {
                        xlog.objName = instanceMap[xlog.objHash];
                        xlogs.push(xlog);
                    }
                }

                this.setState({
                    show: true,
                    xlogs: xlogs,
                    last: (new Date()).getTime()
                });
            }

        }).fail((jqXHR, textStatus) => {
            console.log(jqXHR, textStatus);
        });
    };

    close = () => {
        console.log(1);
        this.setState({
            show: false
        });
    };

    getRow = (row, i) => {
        return layout.map((meta, j) => {
            let className = meta.key ;
            if (meta.type === "ms") {
                return <span className={className} key={j}>{row[meta.key]} ms</span>
            } if (meta.type === "date") {
                return <span className={className} key={j}>{this.getDate(new Date(Number(row[meta.key])))}</span>
            }else {
                return <span className={className} key={j}>{row[meta.key]}</span>
            }

        });
    };

    getHeader = () => {
        return layout.map((meta, j) => {
            return <span key={j}>{meta.name}</span>
        });
    };

    rowClick = (xlog) => {
        if (this.state.txid === xlog.txid) {
            this.setState({
                txid: null
            });
        } else {
            this.setState({
                txid: xlog.txid,
                enter: false
            });
        }


        // XLOG DATA
        this.props.addRequest();
        jQuery.ajax({
            method: "GET",
            async: true,
            url: getHttpProtocol(this.props.config) + '/scouter/v1/xlog-data/' + this.getYYYYMMDD(new Date(Number(xlog.endTime))) + "/" + xlog.txid
        }).done((msg) => {
            this.setState({
                profile : msg.result
            });
        }).fail((jqXHR, textStatus) => {
            console.log(jqXHR, textStatus);
        });

        // XLOG DATA
        this.props.addRequest();
        jQuery.ajax({
            method: "GET",
            async: true,
            url: getHttpProtocol(this.props.config) + '/scouter/v1/profile-data/' + this.getYYYYMMDD(new Date(Number(xlog.endTime))) + "/" + xlog.txid
        }).done((msg) => {
            this.setState({
                steps : msg.result
            });

        }).fail((jqXHR, textStatus) => {
            console.log(jqXHR, textStatus);
        });


    };

    mouseListEnter = () => {
        this.setState({
            enter: true
        });
    };

    mouseListLeave = () => {
        this.setState({
            enter: false
        });
    };



    render() {
        let selectRow = (this.state.txid ? true : false);
        if (this.state.enter) {
            selectRow = false;
        }


        var profiles = null;
        if (this.state.profile) {
            profiles = Object.keys(this.state.profile).map((key) => { return {key: key, value : this.state.profile[key]} });
        }

        console.log(this.state.steps);
        return (
            <div className={"xlog-profiler " + (this.state.show ? ' ' : 'hidden ' ) + (selectRow ? 'select-row' : '')}>
                <div onClick={this.close} className="close-btn"></div>
                <div className="profile-list scrollbar" onMouseEnter={this.mouseListEnter} onMouseLeave={this.mouseListLeave}>
                    <div className="xlog-list">
                        <div className="row header">{this.getHeader()}</div>
                        {this.state.xlogs.map((xlog, i) => {
                            let rowClass = (xlog.error ? 'error' : '');
                            return <div onClick={this.rowClick.bind(this, xlog)} key={i} className={"row " + rowClass + ' ' + (this.state.txid === xlog.txid ? 'active' : '')}>{this.getRow(xlog, i)}</div>;
                        })}
                    </div>
                </div>
                <div className={"profile-steps scrollbar "+ (selectRow ? 'select-row' : '')}>
                    <div className="xlog-data">
                    {profiles && profiles.map((data, i) => {
                        return <div key={i}>
                            <span className="label">{data.key}</span>
                            <span className="data">{data.value}</span>
                        </div>
                    })}
                    </div>
                    <div className="line"></div>
                    <div className="xlog-steps">
                    {this.state.steps && this.state.steps.map((step, i) => {
                        return <div key={i}>
                            <span className="data">{step.mainValue}</span>
                        </div>
                    })}
                    </div>

                </div>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        instances: state.target.instances,
        config: state.config,
        user: state.user
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        addRequest: () => dispatch(addRequest())
    };
};

Profiler = connect(mapStateToProps, mapDispatchToProps)(Profiler);
export default withRouter(Profiler);