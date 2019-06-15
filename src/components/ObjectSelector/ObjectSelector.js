import React, {Component} from 'react';
import './ObjectSelector.css';
import {
    addRequest,
    pushMessage,
    setTarget,
    clearAllMessage,
    setControlVisibility,
    setConfig
} from '../../actions';
import {connect} from 'react-redux';
import jQuery from "jquery";
import {withRouter} from 'react-router-dom';
import {getHttpProtocol, errorHandler, getWithCredentials, setAuthHeader, getCurrentUser} from '../../common/common';
import 'url-search-params-polyfill';
import * as common from '../../common/common'
import * as PaperIcons from '../../common/PaperIcons'
import AgentColor from "../../common/InstanceColor";
import InnerLoading from "../InnerLoading/InnerLoading";
import SimpleSelector from "../SimpleSelector/SimpleSelector";

class ObjectSelector extends Component {

    init = false;

    constructor(props) {
        super(props);
        this.state = {
            servers: [],
            activeServerId: null,
            objects: [],
            selectedObjects: {},
            filter: "",
            loading : false
        };
    }

    componentDidMount() {
        if (common.getDefaultServerConfig(this.props.config).authentification !== "bearer") {
            this.setTargetFromUrl(this.props);
        } else {
            let defaultServerconfig = common.getDefaultServerConfig(this.props.config);
            let origin = defaultServerconfig.protocol + "://" + defaultServerconfig.address + ":" + defaultServerconfig.port;
            if (this.props.config || (this.props.user[origin] && this.props.user[origin].id)) {
                this.setTargetFromUrl(this.props);
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.user.id) {
            this.setTargetFromUrl(nextProps);
        }

        if (JSON.stringify(this.props.user) !== JSON.stringify(nextProps.user)) {
            this.getServers(nextProps.config);
        }

    }

    onFilterChange = (event) => {
        this.setState({
            filter: event.target.value
        });
    };

    clearFilter = () => {
        this.setState({
            filter: ""
        });
    };

    selectAll = () => {
        let filteredObjects = this.state.objects.filter((object) => {
            if (this.state.filter && this.state.filter.length > 1) {
                if ((object.objType && object.objType.toLowerCase().indexOf(this.state.filter.toLowerCase()) > -1) || (object.objName && object.objName.toLowerCase().indexOf(this.state.filter.toLowerCase()) > -1) || (object.address && object.address.toLowerCase().indexOf(this.state.filter.toLowerCase()) > -1)) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return true;
            }
        });

        let isAllSelected = true;
        for (let i = 0; i < filteredObjects.length; i++) {
            if (!this.state.selectedObjects[filteredObjects[i].objHash]) {
                isAllSelected = false;
                break;
            }
        }

        let selectedObjects = Object.assign({}, this.state.selectedObjects);
        if (isAllSelected) {
            for (let i = 0; i < filteredObjects.length; i++) {
                if (this.state.selectedObjects[filteredObjects[i].objHash]) {
                    delete selectedObjects[filteredObjects[i].objHash];
                }
            }
        } else {
            for (let i = 0; i < filteredObjects.length; i++) {
                if (!this.state.selectedObjects[filteredObjects.objHash]) {
                    selectedObjects[filteredObjects[i].objHash] = filteredObjects[i];
                }
            }
        }

        let selectedObjectCount = 0;
        for (let attr in selectedObjects) {
            for (let i = 0; i < this.state.objects.length; i++) {
                if (this.state.objects[i].objHash === attr) {
                    selectedObjectCount++;
                }
            }
        }

        let servers = this.state.servers.slice(0);
        for (let i = 0; i < servers.length; i++) {
            if (servers[i].id === this.state.activeServerId) {
                servers[i].selectedObjectCount = selectedObjectCount;
            }
        }

        this.setState({
            servers: servers,
            selectedObjects: selectedObjects
        });
    };

    setTargetFromUrl = (props) => {

        let that = this;

        if (!this.init) {
            this.props.addRequest();
            jQuery.ajax({
                method: "GET",
                async: true,
                url: getHttpProtocol(props.config) + '/scouter/v1/info/server',
                xhrFields: getWithCredentials(props.config),
                beforeSend: function (xhr) {
                    setAuthHeader(xhr, props.config, getCurrentUser(props.config, props.user));
                }
            }).done((msg) => {

                if (msg && msg.result) {
                    that.init = true;
                    let servers = msg.result;

                    if (servers.length > 0) {
                        if (!servers[0].version) {
                            props.pushMessage("error", "Not Supported", "Paper 2.0 is available only on Scout Server 2.0 and later.");
                            props.setControlVisibility("Message", true);
                            return;
                        }
                    }

                    //현재 멀티서버와 연결된 scouter webapp은 지원하지 않으므로 일단 단일 서버로 가정하고 마지막 서버 시간과 맞춘다.
                    servers.forEach((server) => {
                        common.setServerTimeGap(Number(server.serverTime) - new Date().valueOf());
                    });

                    // GET INSTANCES INFO FROM URL IF EXISTS
                    let objectsParam = new URLSearchParams(this.props.location.search).get('objects');
                    if(!objectsParam) {
                        objectsParam = new URLSearchParams(this.props.location.search).get('instances');
                    }
                    let urlObjectHashes = null;
                    if (objectsParam) {
                        urlObjectHashes = objectsParam.split(",");
                        if (urlObjectHashes) {
                            urlObjectHashes = urlObjectHashes.map((d) => {
                                return Number(d)
                            });
                        }
                    }

                    if (urlObjectHashes) {
                        let selectedObjects = [];
                        let objects = [];
                        let activeServerId = null;
                        servers.forEach((server) => {

                            //일단 단일 서버로 가정하고 서버 시간과 맞춘다.
                            common.setServerTimeGap(Number(server.serverTime) - new Date().valueOf());

                            jQuery.ajax({
                                method: "GET",
                                async: false,
                                url: getHttpProtocol(this.props.config) + '/scouter/v1/object?serverId=' + server.id,
                                xhrFields: getWithCredentials(props.config),
                                beforeSend: function (xhr) {
                                    setAuthHeader(xhr, props.config, getCurrentUser(props.config, props.user));
                                }
                            }).done(function (msg) {
                                objects = msg.result;

                                if (objects && objects.length > 0) {
                                    objects.forEach((instance) => {
                                        urlObjectHashes.forEach((objHash) => {
                                            if (objHash === Number(instance.objHash)) {
                                                selectedObjects.push(instance);
                                                if (!server.selectedObjectCount) {
                                                    server.selectedObjectCount = 0;
                                                }
                                                server.selectedObjectCount++;
                                                // 마지막으로 찾은 서버 ID로 세팅
                                                activeServerId = server.id;
                                            }
                                        });
                                    })
                                }
                            }).fail(function (xhr, textStatus, errorThrown) {
                                errorHandler(xhr, textStatus, errorThrown, that.props, "setTargetFromUrl_1", true);
                            });
                        });

                        if (selectedObjects.length > 0) {
                            selectedObjects.sort((a, b) => a.objName < b.objName ? -1 : 1);

                            let selectedObjectMap = {};
                            for (let i = 0; i < selectedObjects.length; i++) {
                                selectedObjectMap[selectedObjects[i].objHash] = selectedObjects[i];
                            }

                            this.setState({
                                servers: servers,
                                objects: objects,
                                activeServerId: activeServerId,
                                selectedObjects: selectedObjectMap
                            });

                            AgentColor.setInstances(selectedObjects, this.props.config.colorType);
                            this.props.setTarget(selectedObjects);

                        } else {
                            this.setState({
                                servers: servers
                            });
                        }

                    } else {
                        this.setState({
                            servers: servers
                        });
                    }
                }

            }).fail((xhr, textStatus, errorThrown) => {
                errorHandler(xhr, textStatus, errorThrown, that.props, "setTargetFromUrl_2", false);
            });
        }
    };


    getServers = (config) => {

        let that = this;
        this.props.addRequest();

        this.setState({
            loading : true
        });

        jQuery.ajax({
            method: "GET",
            async: true,
            url: getHttpProtocol(config) + '/scouter/v1/info/server'
        }).done((msg) => {
            let servers = msg.result;
            let activeServerId = null;
            if (servers.length > 0) {
                if (!servers[0].version) {
                    activeServerId = 0;
                    this.props.pushMessage("error", "Not Supported", "Paper 2.0 is available only on Scout Server 2.0 and later.");
                    this.props.setControlVisibility("Message", true);
                }
            }

            this.setState({
                servers: servers,
                objects: [],
                activeServerId: activeServerId,
                selectedObjects: {},
                filter: ""
            });
        }).fail((xhr, textStatus, errorThrown) => {
            this.setState({
                servers: [],
                objects: [],
                activeServerId: null,
                selectedObjects: {},
                filter: ""
            });
            errorHandler(xhr, textStatus, errorThrown, that.props, "getServers", false);
        }).always(() => {
            this.setState({
                loading : false
            });
        });

    };

    componentDidUpdate(prevProps, prevState) {
        if (this.props.visible && prevProps.visible !== this.props.visible) {
            if (!this.state.servers || this.state.servers.length < 1) {
                this.getServers(this.props.config);
            }
        }
    }

    onServerClick = (index) => {

        if (!this.state.servers || !this.state.servers[index]) {
            return;
        }

        let serverId = this.state.servers[index].id;

        let that = this;
        this.props.addRequest();
        jQuery.ajax({
            method: "GET",
            async: true,
            url: getHttpProtocol(this.props.config) + '/scouter/v1/object?serverId=' + serverId,
            xhrFields: getWithCredentials(that.props.config),
            beforeSend: function (xhr) {
                setAuthHeader(xhr, that.props.config, getCurrentUser(that.props.config, that.props.user));
            },
        }).done((msg) => {
            if (msg.result) {
                that.setState({
                    activeServerId: index
                });

                const objects = msg.result;
                if (objects) {
                    objects.sort((a, b) => a.objName < b.objName ? -1 : 1);
                    this.setState({
                        objects: msg.result
                    });
                }
            }
        }).fail((xhr, textStatus, errorThrown) => {
            errorHandler(xhr, textStatus, errorThrown, that.props, "onServerClick", true);
        });
    };

    instanceClick = (instance) => {

        let selectedObjects = Object.assign({}, this.state.selectedObjects);
        if (selectedObjects[instance.objHash]) {
            delete selectedObjects[instance.objHash];
        } else {
            selectedObjects[instance.objHash] = instance;
        }

        let selectedObjectCount = 0;
        for (let attr in selectedObjects) {
            for (let i = 0; i < this.state.objects.length; i++) {
                if (this.state.objects[i].objHash === attr) {
                    selectedObjectCount++;
                }
            }
        }

        let servers = this.state.servers;
        for (let i = 0; i < servers.length; i++) {
            if (servers[i].id === this.state.activeServerId) {
                servers[i].selectedObjectCount = selectedObjectCount;
            }
        }

        this.setState({
            servers: servers,
            selectedObjects: selectedObjects
        });
    };

    setObjects = () => {
        let objects = [];
        for (let hash in this.state.selectedObjects) {
            objects.push(this.state.selectedObjects[hash]);
        }

        if (objects.length < 1) {
            this.props.pushMessage("info", "NO MONITORING TARGET", "At least one object must be selected");
            this.props.setControlVisibility("Message", true);
        } else {
            objects.sort((a, b) => a.objName < b.objName ? -1 : 1);
            AgentColor.setInstances(objects, this.props.config.colorType);
            this.props.setTarget(objects);
            this.props.setControlVisibility("TargetSelector", false);
            common.setRangePropsToUrl(this.props, undefined, objects);
            this.props.toggleSelectorVisible();
        }
    };

    savePreset = () => {
        let that = this;
        let objects = [];
        let iconMap = {};
        for (let hash in this.state.selectedObjects) {
            objects.push(this.state.selectedObjects[hash]);
            iconMap[this.props.counterInfo.objTypesMap[this.state.selectedObjects[hash].objType].icon] = true;
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
        this.props.toggleSelectorVisible();
    };

    onChangeScouterServer = (inx) => {
        let config = JSON.parse(JSON.stringify(this.props.config));

        for (let i = 0; i < config.servers.length; i++) {
            if (i === inx) {
                config.servers[i].default = true;
            } else {
                config.servers[i].default = false;
            }
        }

        this.props.setConfig(config);
        this.getServers(config);
        if (localStorage) {
            localStorage.setItem("config", JSON.stringify(config));
        }

        common.setTargetServerToUrl(this.props, config);

        this.props.setTarget([], []);
        this.setState({
            servers: [],
            objects: [],
            activeServerId: null,
            selectedObjects: {},
            filter: ""
        });

    };

    render() {

        return (
            <div className="object-selector-wrapper" onClick={this.props.toggleSelectorVisible}>
                <div className="object-selector" onClick={(e) => e.stopPropagation()}>
                    <div className="api-server-select-control-wrapper">
                        <div className="api-server-select-control">
                            <div className="control-label"><span>API SERVER</span></div>
                            <div className="control-separator"><span></span></div>
                            <div className="control-component"><SimpleSelector selected={common.getDefaultServerConfigIndex(this.props.config)} list={this.props.config.servers} onChange={this.onChangeScouterServer}></SimpleSelector></div>
                        </div>
                    </div>
                    <div className="api-server-select-control-wrapper">
                        <div className="api-server-select-control">
                            <div className="control-label"><span>COLLECTOR</span></div>
                            <div className="control-separator"><span></span></div>
                            <div className="control-component"><SimpleSelector selected={this.state.activeServerId} list={this.state.servers} onChange={this.onServerClick} emptyMessage="NO COLLECT SERVER"></SimpleSelector></div>
                        </div>
                    </div>
                    <div className="object-selector-content">
                        <div className="host-list">
                            <div>
                                <div className="title">
                                    <div>SERVERS</div>
                                </div>
                                <div className="list-content scrollbar">
                                    {this.state.servers && this.state.servers.map((host, i) => {
                                            return (<div className={'host ' + (i === 0 ? 'first ' : ' ') + (host.id === this.state.activeServerId ? 'active ' : ' ')} key={i} onClick={this.onServerClick.bind(this, host.id)}>{host.name}{host.selectedObjectCount > 0 && <span className="host-selected-count">{host.selectedObjectCount}</span>}</div>)
                                        }
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="instance-list">
                            <div>
                                <div
                                    className={"filter " + (this.state.filter && this.state.filter.length > 1 ? 'filtered' : '')}>
                                    <span className="filter-icon" onClick={this.clearFilter}><i className="fa fa-filter" aria-hidden="true"></i></span><span className="filter-tag">OBJECT</span><input type="search" onChange={this.onFilterChange.bind(this)} value={this.state.filter}/><span className="check-btn" onClick={this.selectAll}><i className="fa fa-check-circle-o" aria-hidden="true"></i> ALL</span>
                                </div>
                                <div className="list-content scrollbar">
                                    {(this.state.objects && this.state.objects.length > 0) && this.state.objects.filter((instance) => {

                                        if (this.state.filter && this.state.filter.length > 1) {
                                            if ((instance.objType && instance.objType.toLowerCase().indexOf(this.state.filter.toLowerCase()) > -1) || (instance.objName && instance.objName.toLowerCase().indexOf(this.state.filter.toLowerCase()) > -1) || (instance.address && instance.address.toLowerCase().indexOf(this.state.filter.toLowerCase()) > -1)) {
                                                return true;
                                            } else {
                                                return false;
                                            }
                                        } else {
                                            return true;
                                        }

                                    }).sort((a, b) => {
                                        let compare = a.objType.localeCompare(b.objType);
                                        if (compare === 0) {
                                            return a.objName.localeCompare(b.objName);
                                        } else {
                                            return compare;
                                        }
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
                                            <div key={i} className={"instance " + (i === 0 ? 'first ' : ' ') + (!(!this.state.selectedObjects[instance.objHash]) ? "selected" : " ")} onClick={this.instanceClick.bind(this, instance)}>
                                                <div className="type-icon">
                                                    <div className="type-icon-wrapper" style={{color : iconInfo.color, backgroundColor : iconInfo.bgColor}}>
                                                        {iconInfo.fontFamily === "text" && <div className={"object-icon " + iconInfo.fontFamily}>{iconInfo.text}</div>}
                                                        {iconInfo.fontFamily !== "text" && <div className={"object-icon " + iconInfo.fontFamily + " " + iconInfo.text}></div>}
                                                    </div>
                                                </div>
                                                <div className="instance-text-info">
                                                    <div className="instance-name">{instance.objName}</div>
                                                    <div className="instance-other"><span>{instance.address}</span><span className="instance-objtype">{displayName}</span></div>
                                                </div>
                                            </div>)
                                    })}
                                    {(!this.state.objects || this.state.objects.length < 1) &&
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
                        <button onClick={this.setObjects}>APPLY</button>
                    </div>
                    <InnerLoading visible={this.state.loading}></InnerLoading>
                </div>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        objects: state.target.objects,
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

ObjectSelector = connect(mapStateToProps, mapDispatchToProps)(ObjectSelector);

export default withRouter(ObjectSelector);
