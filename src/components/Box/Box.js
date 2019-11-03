import React, {Component} from 'react';
import './Box.css';
import {Droppable} from 'react-drag-and-drop'
import {EmptyBox, ClockBox, XLogBar} from "../../components";
import XLog from "../Paper/XLog/XLog";
import Visitor from "../Paper/Visitor/Visitor";
import DiskUsage from "../Paper/DiskUsage/DiskUsage";
import LineChart from "../Paper/LineChart/LineChart";
import ActiveSpeed from "../Paper/ActiveSpeed/ActiveSpeed";
import Tooltip from "./Tooltip/Tooltip";
import {connect} from "react-redux";

class Box extends Component {

    iconMap = {};
    constructor(props) {
        super(props);

        this.state = {
            titles : {},
            familyNameMap : {},
            tooltip : {
                show : false
            }
        };
    }

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(this.props.objects) !== JSON.stringify(nextProps.objects)) {
            this.iconMap = {};
        }

        if (JSON.stringify(this.props.countersHistoryFrom) !== JSON.stringify(nextProps.countersHistoryFrom) && JSON.stringify(this.props.countersHistoryTo) !== JSON.stringify(nextProps.countersHistoryTo)) {
            this.iconMap = {};
        }

    }


    setTitle = (counterKey, title, color, familyName) => {
        let titles = Object.assign({}, this.state.titles);
        let familyNameMap = {};
        for (let title in titles) {
            if (title.icon) {
                let icons = title.icon.split(",");
                icons.forEach((d) => {
                    this.iconMap[d] = true;
                });
            }
            familyNameMap[titles[title].familyName] = this.props.counterInfo.familyNameIcon[titles[title].familyName];
        }

        familyNameMap[familyName] = this.props.counterInfo.familyNameIcon[familyName];
        let uniqueFamilyNameCnt = Object.keys(familyNameMap).length;

        let icon = "";
        this.props.objects.filter((d) => {
            return d.objFamily === familyName;
        }).forEach((d, idx, array) => {
            if(this.props.counterInfo.objTypesMap[d.objType]) {
                icon += this.props.counterInfo.objTypesMap[d.objType].icon;
                if (idx !== array.length - 1) {
                    icon += ",";
                }
                this.iconMap[this.props.counterInfo.objTypesMap[d.objType].icon] = true;
            }
        });

        titles[title] = {
            counterKey : counterKey,
            title : uniqueFamilyNameCnt > 1 ? title + " (" + familyName + ")" : title,
            color : color,
            icon : icon,
            familyName : familyName
        };

        if (JSON.stringify(this.state.titles) !== JSON.stringify(titles)) {
            this.setState({
                titles : titles,
                familyNameMap : familyNameMap
            });
        }
    };

    removeTitle = (counterKey) => {
        let titles = Object.assign({}, this.state.titles);

        if (Array.isArray(counterKey)) {
            counterKey.forEach((c) => {
                for (let title in titles) {
                    if (titles[title].counterKey === c) {
                        delete titles[title];
                    }
                }
            });

        } else {
            for (let title in titles) {
                if (titles[title].counterKey === counterKey) {
                    delete titles[title];
                }
            }
        }

        this.setState({
            titles : titles
        });
    };

    onDrop(data) {
        if (data) {
            let option = JSON.parse(data.metric);
            if (option.mode === "exclusive") {
                this.setState({
                    titles : {}
                });
            }
            this.props.setOption(this.props.box.key, option);
        }
    }

    showTooltip = (x, y, marginLeft, marginTop, data) => {
        this.setState({
            tooltip : {
                show : true,
                x : x,
                y : y,
                marginLeft : marginLeft,
                marginTop : marginTop,
                data : data
            }
        });
    };

    hideTooltip = () => {
        this.setState({
            tooltip : {
                show : false
            }
        });
    };

    render() {
        let type = null;

        if (this.props.box && this.props.box.option && !Array.isArray(this.props.box.option)) {
            type = this.props.box.option.type;
        } else if (this.props.box && this.props.box.option && Array.isArray(this.props.box.option)) {
            for (let i = 0; i < this.props.box.option.length; i++) {
                let innerOption = this.props.box.option[i];
                if (innerOption.mode === "nonexclusive") {
                    type = innerOption.type;
                    break;
                }
            }
        }

        let titleLength = Object.values(this.state.titles).length;

        return (
            <Droppable className="box-droppable" types={['metric']} onDrop={this.onDrop.bind(this)}>
                <div className="box">
                    <div className="title">
                        <div>
                        {titleLength > 0 &&
                            <div className="icons">
                                {/*{Object.keys(this.iconMap).map((d, i) => (<div key={i} ><IconImage icon={d}/></div>))}*/}
                                {Object.keys(this.iconMap).map((d, i) => (<div key={i} ><div className="icon-text">{d}</div></div>))}
                                <div className="separator"></div>
                            </div>
                        }
                        {titleLength > 0 &&
                        <div className="title-text">
                            {Object.values(this.state.titles).map((d, i) => (<span style={{color : d.color}} key={i}>{d.title} {(i < titleLength -1) ? ', ' : ''}</span>))}
                        </div>
                        }
                        {titleLength < 1 &&
                        <div className="title-text no-title">{this.props.box.title}</div>
                        }
                        </div>
                    </div>
                    <div className="content-wrapper">
                        <div className="content">
                            {!type && <EmptyBox/>}
                            {type === "clock" && <ClockBox layoutChangeTime={this.props.layoutChangeTime} box={this.props.box} />}
                            {type === "xlogBar" && <XLogBar visible={this.props.visible} layoutChangeTime={this.props.layoutChangeTime} box={this.props.box} data={this.props.data} interval={this.props.config.interval} filterMap={this.props.filterMap} />}
                            {type === "xlog" && <XLog visible={this.props.visible} layoutChangeTime={this.props.layoutChangeTime} box={this.props.box} filter={this.props.filter} pastTimestamp={this.props.pastTimestamp} pageCnt={this.props.pageCnt} data={this.props.data} config={this.props.config} startTime={this.props.data.startTime} longTerm={this.props.longTerm} xlogHistoryDoing={this.props.xlogHistoryDoing} xlogHistoryRequestCnt={this.props.xlogHistoryRequestCnt} setStopXlogHistory={this.props.setStopXlogHistory} xlogNotSupportedInRange={this.props.xlogNotSupportedInRange}/>}
                            {type === "visitor" && <Visitor visible={this.props.visible} layoutChangeTime={this.props.layoutChangeTime} visitor={this.props.visitor} box={this.props.box} realtime={this.props.realtime} />}
                            {type === "diskUsage" && <DiskUsage visible={this.props.visible} layoutChangeTime={this.props.layoutChangeTime} diskUsage={this.props.diskUsage} box={this.props.box} realtime={this.props.realtime}/>}
                            {type === "counter" && <LineChart visible={this.props.visible} layoutChangeTime={this.props.layoutChangeTime} time={this.props.counters.time} box={this.props.box} counters={this.props.counters.data} countersHistory={this.props.countersHistory} countersHistoryTimestamp={this.props.countersHistoryTimestamp} countersHistoryFrom={this.props.countersHistoryFrom} countersHistoryTo={this.props.countersHistoryTo} longTerm={this.props.longTerm} setTitle={this.setTitle} removeTitle={this.removeTitle} showTooltip={this.showTooltip} hideTooltip={this.hideTooltip} />}
                            {type === "ActiveSpeed" && <ActiveSpeed visible={this.props.visible} layoutChangeTime={this.props.layoutChangeTime} time={this.props.counters.time} box={this.props.box} counters={this.props.counters.data} setTitle={this.setTitle} removeTitle={this.removeTitle} realtime={this.props.realtime} />}
                            {this.state.tooltip.show && <Tooltip tooltip={this.state.tooltip}/>}
                        </div>
                    </div>
                </div>
            </Droppable>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        config: state.config,
        counterInfo: state.counterInfo,
        objects: state.target.objects,
        filterMap: state.target.filterMap
    };
};

Box = connect(mapStateToProps, undefined)(Box);
export default Box;
