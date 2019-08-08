import React, {Component} from 'react';
import './DiskUsage.css';

const layout = [
    {
        key: "objName",
        name: "OBJECT"
    },
    {
        key: "diskDevice",
        name: "DEVICE"
    },
    {
        key: "diskMount",
        name: "MOUNT"
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

class DiskUsage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            allInstance: null,
            boxHeight: 150,
            boxWidth : 499
        };
    }

    componentWillReceiveProps() {

        let allDisk = this.props.diskUsage;

        if (!allDisk || !allDisk.time || !allDisk.diskUsage) {
            return;
        }

        let allInstance = [];
        let arrDiskUsage = allDisk.diskUsage;
        let arrObjName = allDisk.objName;

        let box = this.refs.listBox.parentNode.parentNode.parentNode.parentNode;

        // used & total 사이즈가 0 보다 큰 데이터만 정리
        arrDiskUsage.map((data, index) => {

            if(data !== null) {
                 JSON.stringify((data).map((instance) => {
                    if(instance.used > 0 && instance.total > 0) {
                        instance.objName = arrObjName[index];
                        instance.diskUsage = Math.round((instance.used / instance.total) * 100)
                        instance.diskUsed = instance.used;
                        instance.diskTotal = instance.total;
                        instance.diskMount = instance.mount;
                        instance.diskDevice = instance.device;
                        allInstance.push(instance);
                    }
                    return null;
                }));
            }
            return null;
        });

        if(allInstance.length > 0) {
            this.setState({
                allInstance : allInstance,
                boxHeight : box.offsetHeight,
                boxWidth : box.offsetWidth
            });
        }
    }

    getRow = (row, i) => {

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

    getHeader = () => {
        return layout.map((meta, j) => {

            if(meta.key === 'objName') {
                return <span className={meta.key} key={j}>{meta.name} (Total : {this.state.allInstance.length})</span>
            }else{
                return <span className={meta.key} key={j}>{meta.name}</span>
            }

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
             <div className="row table-title">{this.state.allInstance && this.getHeader()}</div>
                {this.state.allInstance && this.state.allInstance.map((data, i) => {
                    return <div className="row" key={i}>{this.getRow(data, i)}</div>;
                })}
                {(!this.state.allInstance) && <div className="no-data">
                   <div>NO DATA RECEIVED</div> </div>}
           </div>
        );
    }

}

export default DiskUsage;