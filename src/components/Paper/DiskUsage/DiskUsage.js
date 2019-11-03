import React, {Component} from 'react';
import './DiskUsage.css';
import connect from "react-redux/es/connect/connect";
import {withRouter} from "react-router-dom";
import * as d3 from "d3";

const layout = [
    {
        key: "objName",
        name: "OBJECT",
        type: "string"
    },
    {
        key: "diskDevice",
        name: "DEVICE",
        type: "string"
    },
    {
        key: "diskMount",
        name: "MOUNT",
        type: "string"
    },
    {
        key: "diskUsed",
        name: "USED",
        type: "bytes"
    },
    {
        key: "diskTotal",
        name: "TOTAL",
        type: "bytes"
    },
    {
        key: "diskUsage",
        name: "USAGE",
        type: "percent"
    }
];
const orderBy ={
  auto : "asc",
  asc  : "desc",
  desc : "auto"
};


class DiskUsage extends Component {


    constructor(props) {
        super(props);
        this.state = {
            allInstance: null,
            boxHeight: 150,
            boxWidth : 499,
            time : new Date().getTime(),
            sort : layout.map(d=>({...d, order:"auto"}))
        };
    }
    componentDidMount() {
        this.dateFormat = this.props.config.dateFormat;
        this.fullTimeFormat = this.props.config.dateFormat + " " + this.props.config.timeFormat;
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.diskUsage !== this.props.diskUsage) {
            const  {diskUsage,time} = nextProps.diskUsage;

            let box = this.refs.listBox.parentNode.parentNode.parentNode.parentNode;

                const allInstance = diskUsage.filter(obj => obj.disk)
                            .map(obj => obj.disk.map(dk=>{
                            return {
                                objHash: obj.objHash,
                                objName: obj.objName,
                                diskUsage: Number(dk.pct),
                                diskUsed: Number(dk.used),
                                diskTotal: Number(dk.total),
                                diskMount: dk.mount,
                                diskDevice: dk.device
                            }
                        })
                    )
                    .flatMap(d=>d)
                    .filter(d=>d.diskUsed > 0 && d.diskTotal > 0)

            if (allInstance.length > 0) {

                this.setState({
                    time : time,
                    allInstance: {
                        data: allInstance,
                        origin: [...allInstance]
                    },
                    boxHeight: box.offsetHeight,
                    boxWidth: box.offsetWidth,
                    sort : layout.map(d=>({...d, order:"auto"}))
                });
            }

        }
        let box = this.refs.listBox.parentNode.parentNode.parentNode.parentNode;
        const {boxWidth,boxHeight} = this.state;

        if( box.offsetHeight !== boxHeight || box.offsetWidth !== boxWidth){
            this.setState({
                boxHeight: box.offsetHeight,
                boxWidth: box.offsetWidth
            });
        }



    }
    shouldComponentUpdate(nextProps, nextState){
        if(nextProps.realTime !== this.props.realtime){
            return true;
        }
        if(nextProps.diskUsage !== this.props.diskUsage){
            return true;
        }
        if(nextProps.filterMap !== this.props.filterMap){
            return true;
        }

        if(nextState.sort !== this.state.sort){
            return true;
        }
        if(nextState.boxHeight !== this.state.boxHeight
        || nextState.boxWidth !== this.state.boxWidth){
            return true;
        }
        return false;

    }
    getRow = (row) => {
        return layout.map((meta, j) => {

            let className = meta.key;
            let data = row[className];
            if(data !== undefined){
                if (meta.type === "bytes") {
                    return <span className={meta.key} key={j}>{this.bytesToSize(data)}</span>
                }else if (meta.type === "percent"){
                    return <span className={meta.key} key={j}>{data}%</span>
                }else{
                    return <span className={meta.key} key={j}>{data}</span>
                }
            }
            return null;
        });
    };

    onSort(meta){

        const {data,origin} = this.state.allInstance;
        const {order,key,type} = meta;
        const _orderBy = orderBy[order];
        let _orderData;
        if(type === "string"){
             switch(_orderBy) {
                 case "desc":
                     data.sort((a, b) => b[key].localeCompare(a[key]));
                     _orderData = data;
                     break;
                 case "asc":
                     data.sort((a, b) => a[key].localeCompare(b[key]));
                     _orderData = data;
                     break;
                 default:
                     _orderData = origin;
             }
        }else{
            switch(_orderBy) {
                case "desc":
                    data.sort((a, b) => String(b[key]).localeCompare(String(a[key]), 'en-US', { numeric: true, sensitivity: 'base' }));
                    _orderData = data;
                    break;
                case "asc":
                    data.sort((a, b) => String(a[key]).localeCompare(String(b[key]), 'en-US', { numeric: true, sensitivity: 'base' }));
                    _orderData = data;
                    break;
                default:
                    _orderData = origin;
            }
        }

        this.setState({
            allInstance: {
                data: [..._orderData],
                origin: origin
            },
            sort: layout.map(d=> {
                if( d.key === key){
                    d.order = _orderBy;
                }else {
                    d.order = "auto";
                }
                return d;
            })
        });

    }
    getHostTotal=() =>{
        const { diskUsage } = this.props.diskUsage;
        if(diskUsage){
            return diskUsage.filter(obj => this.props.filterMap[obj.objHash])
                  .length;
        }
        return 0;
    };
    getHeader = () => {
        const {sort} = this.state;


        return sort.map((meta, j) => {
            let iconClass ="";
            switch(meta.order){
                case "asc":
                    iconClass = "fa fa-sort-up";
                    break;
                case "desc":
                    iconClass = "fa fa-sort-desc";
                    break;
                default:
                    iconClass = "fa fa-sort";
            }
            return <span className={meta.key} key={j} onClick={()=>this.onSort(meta)}>{meta.name}
                    <i className={iconClass} style={{color:"#a0a0a0", cursor: "pointer"}}></i>
            </span>

        });
    };

    // 데이터 변환
    bytesToSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return 'n/a';
        const i = parseInt(Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024)), 10);
        if (i === 0) return `${bytes} ${sizes[i]})`;
        return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`;
    }

    render() {
        return (
           <div className="disk-usage-list scrollbar" ref="listBox" style={{width: this.state.boxWidth + "px"}}>
           { !this.props.realtime && <div className="no-data"><div>REALTIME ONLY</div></div>}
           { (this.props.realtime && this.state.allInstance) &&
                <div className="disk-retrieve">
                   { `HOST TOTAL:${this.getHostTotal()}, RETRIEVE TIME:${d3.timeFormat(this.fullTimeFormat)(new Date(this.state.time))}`}
               </div>
           }
           { (this.props.realtime && this.state.allInstance) && <div className="row table-title">{this.getHeader()}</div>}

           { (this.props.realtime && this.state.allInstance) &&
                this.state.allInstance.data.map((data,i)=>{
                         return this.props.filterMap[data.objHash]  ? <div className="row" key={i}>{this.getRow(data)}</div>:"";
                      })
           }
           { (this.props.realtime &&  !this.state.allInstance) && <div className="no-data">
               <div>NO DATA RECEIVED</div> </div>
           }
           </div>
        );


    }

}


let mapStateToProps = (state) => {
    return {
        objects: state.target.objects,
        config: state.config,
        filterMap: state.target.filterMap
    };
};


DiskUsage = connect(mapStateToProps)(DiskUsage);
export default withRouter(DiskUsage);