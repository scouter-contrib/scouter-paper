import React, {Component} from 'react';
import './ActiveServiceList.css';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import numeral from "numeral";

const layout = [

    // {
    //     key: "objName",
    //     name: "OBJECT NAME"
    // },
    {
        key: "serviceName",
        name: "SERVICE"
    },
    {
        key: "elapsed",
        name: "ELAPSED",
        type: "ms"
    },
    {
        key: "note",
        name: "NOTE",
    },
    {
        key: "ipaddr",
        name: "IP ADDRESS"
    },
    {
        key: "cpu",
        name: "CPU",
        type: "ms"
    },
    {
        key: "threadStatus",
        name: "STATE"
    },
    {
        key: "threadName",
        name: "THREAD NAME"
    }

];

class ActiveServiceList extends Component {

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

    getRow = (row, i) => {
        return layout.map((meta, j) => {
            let className = meta.key;
            if (meta.type === "number") {
                return <span className={className} key={j} >{numeral(row[meta.key]).format(this.props.config.numberFormat)}</span>
            } else if (meta.type === "ms") {
                return <span className={className + " " + this.getClassName(className,row[meta.key])} key={j}>
                        {numeral(row[meta.key]).format(this.props.config.numberFormat)} ms
                     </span>
            } else {
                return <span className={className} key={j} >{row[meta.key]}</span>
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
            <div className="active-service-list">
                <div className="row header">{this.getHeader()}</div>
                {this.props.active && this.props.active.map((_th, i) => {
                    return <div onClick={() => this.props.rowClick(_th, i)} key={i} className={"row " + (this.props.selectedRowIndex === i ? "selected" : "")}>{this.getRow(_th, i)}</div>;
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

ActiveServiceList = connect(mapStateToProps, undefined)(ActiveServiceList);
export default withRouter(ActiveServiceList);
