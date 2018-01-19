import React, {Component} from 'react';
import './Profiler.css';
import {addRequest} from '../../../../actions';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import jQuery from "jquery";
import {getHttpProtocol} from '../../../../common/common';

const layout = [
    {
        key: "txid",
        name: "TXID"
    },
    {
        key: "apicallCount",
        name: "API CALL COUNT"
    },
    {
        key: "apicallTime",
        name: "API CALL TIME"
    },
    {
        key: "caller",
        name: "CALLER"
    },
    {
        key: "city",
        name: "CITY"
    },
    {
        key: "countryCode",
        name: "COUNTRY"
    },
    {
        key: "cpu",
        name: "CPU"
    },
    {
        key: "desc",
        name: "DESC"
    },
    {
        key: "elapsed",
        name: "ELAPSED"
    },
    {
        key: "endTime",
        name: "END TIME"
    },
    {
        key: "error",
        name: "ERROR"
    },
    {
        key: "group",
        name: "GROUP"
    },
    {
        key: "gxid",
        name: "GXID"
    },
    {
        key: "hasDump",
        name: "HAS DUMP"
    },
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
    {
        key: "objHash",
        name: "OBJHASH"
    },
    {
        key: "queuingTime",
        name: "QUEUING TIME"
    },
    {
        key: "referrer",
        name: "REFERRER"
    },
    {
        key: "service",
        name: "SERVICE"
    },
    {
        key: "sqlTime",
        name: "SQL TIME"
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
        key: "threadNameHash",
        name: "THREAD NAME HASH"
    },
    {
        key: "userAgent",
        name: "USER AGENT"
    },
    {
        key: "userid",
        name: "USERID"
    },
    {
        key: "xtype",
        name: "XTYPE"
    }
];

class Profiler extends Component {


    constructor(props) {
        super(props);
        this.state = {
            show: false,
            xlogs: [],
            last: null,
            txid : null
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

    getList = (x1, x2, y1, y2) => {

        this.props.addRequest();
        jQuery.ajax({
            method: "GET",
            async: true,
            url: getHttpProtocol(this.props.config) + '/scouter/v1/xlog-data/search/20180120?objHashes=' + this.props.instances[0].objHash + "&startTimeMillis=" + x1 + "&endTimeMillis=" + x2
        }).done((msg) => {

            let list = msg.result;

            if (list && list.length > 0) {
                let xlogs = [];
                for (let i = 0; i < list.length; i++) {
                    let xlog = list[i];
                    let elapsed = Number(xlog.elapsed);
                    if (y1 <= elapsed && y2 >= elapsed) {
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
            return <span key={j}>{row[meta.key]}</span>
        });
    };

    getHeader = () => {
        return layout.map((meta, j) => {
            return <span key={j}>{meta.name}</span>
        });
    };

    rowClick = (txid) => {
        this.setState({
            txid: txid
        });
    };

    render() {
        console.log(this.state.xlogs);
        console.log(this.state.show);
        return (
            <div className={"xlog-profiler " + (this.state.show ? '' : 'hidden')}>
                <div onClick={this.close} className="close-btn"></div>
                <div className="profile-content scrollbar">
                    <div className="xlog-list">
                        <div className="row header">{this.getHeader()}</div>
                        {this.state.xlogs.map((xlog, i) => {
                            return <div onClick={this.rowClick.bind(this, xlog.txid)} key={i} className={"row " + (this.state.txid === xlog.txid ? 'active' : '')}>{this.getRow(xlog, i)}</div>;
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