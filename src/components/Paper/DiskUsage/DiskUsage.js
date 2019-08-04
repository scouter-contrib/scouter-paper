import React, {Component} from 'react';
import './DiskUsage.css';

const layout = [
    {
        key: "objName",
        name: "OBJECT"
    },
    {
        key: "device",
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

        arrDiskUsage.map((data, index) => {

            if(data !== null) {
                 JSON.stringify((data).map((instance) => {
                    if(instance.used > 0 && instance.mount) {
                        instance.objName = arrObjName[index];
                        instance.diskUsage = Math.round((instance.used / instance.total) * 100)
                        instance.diskUsed = instance.used;
                        instance.diskTotal = instance.total;
                        instance.diskMount = instance.mount;
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

        let limit = this.state.boxHeight/40;
        if(this.state.boxHeight < 151) limit = 3;
        if(this.state.boxHeight < 121) limit = 1;

        return (i < limit) && layout.map((meta, j) => {

            let limit = this.state.boxWidth/100;
            if(this.state.boxWidth < 250) limit = 0;

            let className = meta.key;
            let data = row[className];

            if(data !== undefined && (j < limit)){
                if (meta.type === "bytes") {
                    return <span key={j}>{this.bytesToSize(data)}</span>
                }else if (meta.type === "percent"){
                    return <span key={j}>{data}%</span>
                }else{
                    return <span key={j}>{data}</span>
                }
            }
            return null;
        });
    };

    getHeader = () => {
        return layout.map((meta, j) => {

            let limit = this.state.boxWidth/100;

            if(this.state.boxWidth < 250) limit = 0;

            if(j < limit){
                if(meta.key === 'objName') {
                    return <span key={j}>{meta.name} (Total : {this.state.allInstance.length})</span>
                }else{
                    return <span key={j}>{meta.name}</span>
                }
            }
            return null;
        });
    };

    bytesToSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return 'n/a';
        const i = parseInt(Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024)), 10);
        if (i === 0) return `${bytes} ${sizes[i]})`;
        return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`;
    }

    render() {
        return (
           <div className="disk-usage-list" ref="listBox">
             <div className="row active">{this.state.allInstance && this.getHeader()}</div>
                {this.state.allInstance && this.state.allInstance.map((data, i) => {
                    return <div className="row" key={i}>{this.getRow(data, i)}</div>;
                })}
           </div>
        );
    }

}

export default DiskUsage;