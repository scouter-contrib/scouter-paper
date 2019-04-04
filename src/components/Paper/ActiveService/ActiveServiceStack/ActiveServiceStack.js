import React, {Component} from 'react';
import './ActiveServiceStack.css';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import numeral from "numeral";
import SyntaxHighlighter from 'react-syntax-highlighter';
import {docco} from 'react-syntax-highlighter/dist/esm/styles/hljs';

const meta = [

    {
        key: "blockCount",
        name: "Blocked Count",
        type:"string"
    },
    {
        key: "blockTime",
        name: "Blocked Time",
        type:"string"
    },
    {
        key: "lockName",
        name: "Lock Name",
        type:"string"
    },
    {
        key: "lockOwnerId",
        name: "Lock Owner Id",
        type:"string"
    },
    {
        key: "lockOwnerName",
        name: "Lock Owner Name",
        type:"string"
    },
    {
        key: "elapsed",
        name: "Service Elapsed",
        type: "ms"
    },
    {
        key: "serviceName",
        name: "Service Name",
        type:"string"
    },
    {
        key: "txidName",
        name: "Service Txid",
        type:"string"
    },
    {
        key: "threadStatus",
        name: "STATE",
        type:"string"
    },
    {
        key: "threadCpuTime",
        name: "Thread CPU Time",
        type: "ms"
    },
    {
        key: "threadName",
        name: "THREAD Name",
        type:"string"
    },
    {
        key: "threadId",
        name: "THREAD Id",
        type:"string"
    },
    {
        key: "threadUserTime",
        name: "Thread User Time",
        type: "ms"
    },
    {
        key: "waitedCount",
        name: "Waited Count",
        type: "number"
    },
    {
        key: "waitedTime",
        name: "Waited Time",
        type: "ms"
    },



];

class ActiveServiceStack extends Component {

    dateFormat = null;
    fullTimeFormat = null;

    componentDidMount() {
        this.dateFormat = this.props.config.dateFormat;
        this.fullTimeFormat = this.props.config.dateFormat + " " + this.props.config.timeFormat;
    }

    getClassName = (key, elap) =>{
        if( key !== 'elapsed') {
            return '';
        } else if( elap <= 3000 ){
            return 'short';
        } else if( elap >= 3000 && elap <= 7000){
            return 'medium';
        } else if( elap > 7000 ){
            return 'long';
        }
    };
    render() {
        const {map} = this.props.stack;
        return (
                <div className={"stack-content"}>
                    <div className={"sub-title"}>
                        <span className="label">Key</span>
                        <span className="data">Value</span>
                    </div >
                    <div className={"stack-frame"}>
                    {
                        meta.map((meta, j) => {
                            return(
                            <div key={j}>
                                <span className="label">{meta.name}</span>
                                <span className={"data " + this.getClassName(meta.key,map[meta.key])}>
                                    {meta.type === "ms" && `${numeral(+map[meta.key]).format(this.props.config.numberFormat)} ms`}
                                    {meta.type === "number" && `${numeral(map[meta.key]).format(this.props.config.numberFormat)}`}
                                    {meta.type === "string" && `${map[meta.key]}`}
                                </span>
                            </div>
                            );
                        })

                    }
                    </div>
                    <div className={"sub-title"}>
                        <div>Stack Info</div>
                    </div>
                    {
                        map['stackTrace'] &&
                        <div className={"stack-trace-content"}>
                            <SyntaxHighlighter
                                language='java'
                                useInlineStyles={true}
                                style={docco}>{map['stackTrace']}
                            </SyntaxHighlighter>
                        </div>
                    }
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        config: state.config
    };
};

ActiveServiceStack = connect(mapStateToProps, undefined)(ActiveServiceStack);
export default withRouter(ActiveServiceStack);
