import React, {Component} from 'react';
import './InstanceSelector.css';
import {
    addRequest,
    pushMessage,
    setTarget,
    clearAllMessage,
    setControlVisibility,
    setConfig
} from '../../../actions';
import {connect} from 'react-redux';
import jQuery from "jquery";
import {withRouter} from 'react-router-dom';
import {getHttpProtocol, errorHandler, getWithCredentials, setAuthHeader, getCurrentUser} from '../../../common/common';
import 'url-search-params-polyfill';
import * as PaperIcons from '../../../common/PaperIcons'

import InnerLoading from "../../InnerLoading/InnerLoading";

class InstanceSelector extends Component {

    state = {
      deleteObject : false

    };

    savePreset = () => {
        let that = this;
        let objects = [];
        let iconMap = {};
        for (let hash in this.props.selectedObjects) {
            objects.push(this.props.selectedObjects[hash]);
            iconMap[this.props.counterInfo.objTypesMap[this.props.selectedObjects[hash].objType].icon] = true;
        }

        jQuery.ajax({
            method: "GET",
            async: true,
            url: getHttpProtocol(this.props.config) + "/scouter/v1/kv/__scouter_paper_preset",
            xhrFields: getWithCredentials(this.props.config),
            beforeSend: function (xhr) {
                setAuthHeader(xhr, that.props.config, getCurrentUser(that.props.config, that.props.user));
            }
        }).done((msg) => {
            if (msg && Number(msg.status) === 200) {
                let presetList = [];
                if (msg.result) {
                    presetList = JSON.parse(msg.result);
                }

                presetList.push({
                    no: presetList.length + 1,
                    name: "PRESET-" + (presetList.length + 1),
                    creationTime: (new Date()).getTime(),
                    objects: objects.map((d) => d.objHash),
                    iconMap : iconMap
                });

                let data = {
                    key : "__scouter_paper_preset",
                    value : JSON.stringify(presetList)
                };

                jQuery.ajax({
                    method: "PUT",
                    async: true,
                    url: getHttpProtocol(this.props.config) + "/scouter/v1/kv",
                    xhrFields: getWithCredentials(this.props.config),
                    contentType : "application/json",
                    data : JSON.stringify(data),
                    beforeSend: function (xhr) {
                        setAuthHeader(xhr, that.props.config, getCurrentUser(that.props.config, that.props.user));
                    }
                }).done((msg) => {
                    if (msg && Number(msg.status) === 200) {
                        this.props.pushMessage("info", "DONE", "SAVED SUCCESSFULLY");
                        this.props.setControlVisibility("Message", true);
                        that.setState({
                            presets : presetList
                        });
                    }
                }).fail((xhr, textStatus, errorThrown) => {
                    errorHandler(xhr, textStatus, errorThrown, this.props, "savePreset_1", true);
                });
            }
        }).fail((xhr, textStatus, errorThrown) => {
            errorHandler(xhr, textStatus, errorThrown, this.props, "savePreset_2", true);
        });
    };

    cancelClick = () => {
        this.props.closeSelectorPopup();
    };


    instanceClick = (instance) => {
        this.props.instanceClick(instance);
    };



    getIconOrObjectType = (instance) => {
        let objType = this.props.counterInfo.objTypesMap[instance.objType];
        let icon;
        if (objType) {
            icon = objType.icon ? objType.icon : instance.objType;
        }

        return icon;
    };

    onFilterChange = (event) => {

        this.props.onFilterChange(event.target.value);
    };

    onServerClick = (serverId) => {
        this.props.onServerClick(serverId);
    };

    quickSelectByTypeClick = (type) => {
        this.props.quickSelectByTypeClick(type);
    };

    showPresetManager = () => {
        this.props.togglePresetManager();
    };
    deleteChange =(object = false) =>{
        this.setState({
            deleteObject : object
        });
    };
    onDeleteObject=()=>{
        // const {deleteObject}= this.state;
        jQuery.ajax({
            method: "GET",
            async: true,
            url: `${getHttpProtocol(this.props.config)}/scouter/v1/object/remove/inactive`,
            xhrFields: getWithCredentials(this.props.config),
            dataType : "json",
            beforeSend: (xhr)=>{
                setAuthHeader(xhr, this.props.config, getCurrentUser(this.props.config, this.props.user));
            }
        }).done((msg) => {
            if(msg.status ==="200") {
                this.props.onServerClick(this.props.activeServerId);
            }
        });
    };
    render() {

        let iconMap = {"all" : 0};
        let selectedIconMap = {"all" : 0};

        let all = 0;
        this.props.selectedObjects && this.props.objects && this.props.objects.forEach((instance) => {
            let icon = this.getIconOrObjectType(instance);
            if (iconMap[icon] === undefined) {
                iconMap[icon] = 1;
                selectedIconMap[icon] = 0;
            } else {
                iconMap[icon]++;
            }

            let selected = !(!this.props.selectedObjects[instance.objHash]);
            if (selected) {
                selectedIconMap[icon] ++;
                selectedIconMap["all"] ++;
            }
            all++;
        });

        iconMap["all"] = all;
        return (
            <div className="instance-selector-bg" onClick={this.cancelClick}>
                <div>
                    <div className="selector-type-btns" onClick={(e) => e.stopPropagation()}>
                        <div className="selected">SERVER NAVIGATOR</div>
                        <div onClick={this.showPresetManager}>PRESET MANAGER</div>
                    </div>
                    <div className="instance-selector popup-div" onClick={(e) => e.stopPropagation()}>
                        <div className="instance-selector-content">
                            <div className="host-list">
                                <div>
                                    <div className="title">
                                        <div>SERVERS</div>
                                    </div>
                                    <div className="list-content scrollbar">
                                        {this.props.servers && this.props.servers.map((host, i) => {
                                                return (<div className={'host ' + (i === 0 ? 'first ' : ' ') + (host.id === this.props.activeServerId ? 'active ' : ' ')} key={i} onClick={this.onServerClick.bind(this, host.id)}>{host.name}{host.selectedObjectCount > 0 && <span className="host-selected-count">{host.selectedObjectCount}</span>}</div>)
                                            }
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="instance-list">
                                <div>
                                    <div className={"filter " + (this.props.filter && this.props.filter.length > 1 ? 'filtered' : '')}>
                                        <span className="filter-tag">OBJECT</span><span className="filter-separator"></span>
                                        <span className="filter-icon" onClick={this.props.clearFilter}>
                                            <i className="fa fa-filter" aria-hidden="true"></i>
                                        </span>
                                        <input type="search" onChange={this.onFilterChange.bind(this)} value={this.props.filter}/>
                                        <span className="check-btn" onClick={this.props.selectAll}>ALL</span>
                                        <span className="check-btn" onClick={()=>this.props.quickSelectByTypeClick('active')}>ACTIVE</span>
                                        <span className="check-btn" onClick={()=>this.props.quickSelectByTypeClick('inactive')}>INACTIVE</span>

                                    </div>
                                    <div className="icon-type-map">
                                        {(this.props.objects && this.props.objects.length > 0) && (Object.keys(iconMap).sort((a, b) => {
                                            return iconMap[b] - iconMap[a];
                                        }).map((icon, i) => {
                                            return <span className={iconMap[icon] === selectedIconMap[icon] ? "selected" : ""} key={i} onClick={this.quickSelectByTypeClick.bind(this, icon)}>{icon} {iconMap[icon]}</span>
                                        }))}
                                    </div>
                                    <div className="instance-remove-group">
                                        <div className="instance-remove-btn-group">
                                            {!this.state.deleteObject &&
                                            <div className="instance-remove-btn" onClick={()=>this.deleteChange(true)}>
                                                <div className="items">
                                                    <i className="fa fa-trash-o"></i> <span>REMOVE INACTIVE AGENT</span>
                                                </div>
                                            </div>
                                            }
                                            { this.state.deleteObject &&
                                            <div className="remove-cancel-btn half" onClick={() => this.deleteChange(false)}>
                                                <i className="fa fa-trash-o" aria-hidden="true"></i><span>CANCEL</span>
                                            </div>
                                            }
                                            { this.state.deleteObject &&
                                            <div className="remove-ok-btn half warning" onClick={() => this.onDeleteObject()}>
                                                <i className="fa fa-trash-o" aria-hidden="true"></i><span>REMOVE</span>
                                            </div>
                                            }
                                        </div>
                                    </div>
                                    <div className="list-content scrollbar">
                                        {(this.props.objects && this.props.objects.length > 0) && this.props.objects.filter((instance) => {

                                            if (this.props.filter && this.props.filter.length > 1) {
                                                if ((instance.objType && instance.objType.toLowerCase().indexOf(this.props.filter.toLowerCase()) > -1) || (instance.objName && instance.objName.toLowerCase().indexOf(this.props.filter.toLowerCase()) > -1) || (instance.address && instance.address.toLowerCase().indexOf(this.props.filter.toLowerCase()) > -1)) {
                                                    return true;
                                                } else {
                                                    return false;
                                                }
                                            } else {
                                                return true;
                                            }

                                        }).sort((a, b) => {
                                            return (a.objType + a.objName).localeCompare(b.objType + b.objName);
                                        }).map((instance, i) => {
                                            let objType = this.props.counterInfo.objTypesMap[instance.objType];
                                            let icon = "";
                                            let displayName = "";
                                            if (objType) {
                                                icon = objType.icon ? objType.icon : instance.objType;
                                                displayName = objType.displayName;
                                            }


                                            let iconInfo = PaperIcons.getObjectIcon(icon);
                                            return (
                                                <div key={i} className={"instance " + (i === 0 ? 'first ' : ' ') + (!(!(this.props.selectedObjects && this.props.selectedObjects[instance.objHash])) ? "selected" : " ")} onClick={this.instanceClick.bind(this, instance)}>
                                                    <div>
                                                        <div className="type-icon">
                                                            <div className="type-icon-wrapper" style={{color : iconInfo.color, backgroundColor : iconInfo.bgColor}}>
                                                                {iconInfo.fontFamily === "text" && <div className={"object-icon " + iconInfo.fontFamily}>{iconInfo.text}</div>}
                                                                {iconInfo.fontFamily !== "text" && <div className={"object-icon " + iconInfo.fontFamily + " " + iconInfo.text}></div>}
                                                            </div>
                                                        </div>
                                                        <div className="instance-text-info">
                                                            <div className={`instance-name ${instance.alive ? 'alive' : 'down'}`} >{instance.objName}</div>
                                                            <div className={`instance-other ${instance.alive ? 'alive' : 'down'}`} ><span>{instance.address}</span><span className="instance-objtype">{displayName}</span></div>
                                                            { !instance.alive && <div className="broken-instance-label">INACTIVE</div>}
                                                        </div>
                                                    </div>
                                                </div>)
                                        })}
                                        {(!this.props.objects || this.props.objects.length < 1) &&
                                        <div className="no-instance">
                                            <div>
                                                <div>NO OBJECT</div>
                                            </div>
                                        </div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="buttons">
                            <button className="save-preset-btn" onClick={this.savePreset}>SAVE AS PRESET</button>
                            <button onClick={this.cancelClick}>CANCEL</button>
                            <button onClick={this.props.setObjects}>APPLY</button>
                        </div>
                        <InnerLoading visible={this.props.loading}></InnerLoading>
                    </div>
                </div>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        counterInfo: state.counterInfo,
        config: state.config,
        user: state.user,
        range: state.range,
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        setTarget: (objects) => dispatch(setTarget(objects)),
        setControlVisibility: (name, value) => dispatch(setControlVisibility(name, value)),
        clearAllMessage: () => dispatch(clearAllMessage()),
        pushMessage: (category, title, content) => dispatch(pushMessage(category, title, content)),
        addRequest: () => dispatch(addRequest()),
        setConfig: (config) => dispatch(setConfig(config)),
    };
};

InstanceSelector = connect(mapStateToProps, mapDispatchToProps)(InstanceSelector);

export default withRouter(InstanceSelector);
