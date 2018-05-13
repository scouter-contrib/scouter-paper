import React, {Component} from 'react';
import './InstanceSelector.css';
import {
    addRequest,
    pushMessage,
    setTarget,
    setInstances,
    clearAllMessage,
    setControlVisibility,
    setConfig
} from '../../../actions';
import {connect} from 'react-redux';
import jQuery from "jquery";
import {withRouter} from 'react-router-dom';
import {getHttpProtocol, errorHandler, getWithCredentials, setAuthHeader} from '../../../common/common';
import 'url-search-params-polyfill';
import * as common from '../../../common/common'
import AgentColor from "../../../common/InstanceColor";

class InstanceSelector extends Component {

    init = false;

    constructor(props) {
        super(props);
        this.state = {
            servers: [],
            instances: [],
            activeServerId: null,
            selectedInstances: {},
            selectedHosts: {},
            filter : ""
        };
    }

    componentDidMount() {
        if (common.getDefaultServerConfig(this.props.config).authentification !== "bearer") {
            this.setTargetFromUrl(this.props);
        } else {
            if (this.props.config || (this.props.user && this.props.user.id)) {
                this.setTargetFromUrl(this.props);
            }
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
        let filterdInstance = this.state.instances.filter((instance) => {
            if (instance.objFamily === 'javaee') {
                if (this.state.filter && this.state.filter.length > 1) {
                    if ((instance.objType && instance.objType.toLowerCase().indexOf(this.state.filter.toLowerCase()) > -1) || (instance.objName && instance.objName.toLowerCase().indexOf(this.state.filter.toLowerCase()) > -1) || (instance.address && instance.address.toLowerCase().indexOf(this.state.filter.toLowerCase()) > -1)) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return true;
                }
            } else {
                return false;
            }
        });

        let isAllSelected = true;

        for (let i=0; i<filterdInstance.length; i++) {
            if (!this.state.selectedInstances[filterdInstance[i].objHash]) {
                isAllSelected = false;
                break;
            }
        }

        let selectedInstances = Object.assign(this.state.selectedInstances);

        if (isAllSelected) {
            for (let i=0; i<filterdInstance.length; i++) {
                if (this.state.selectedInstances[filterdInstance[i].objHash]) {
                    delete selectedInstances[filterdInstance[i].objHash];
                }
            }
        } else {
            for (let i=0; i<filterdInstance.length; i++) {
                if (!this.state.selectedInstances[filterdInstance.objHash]) {
                    selectedInstances[filterdInstance[i].objHash] = filterdInstance[i];
                }
            }
        }

        let selectedInstanceCount = 0;
        for (let attr in selectedInstances) {
            for (let i = 0; i < this.state.instances.length; i++) {
                if (this.state.instances[i].objHash === attr) {
                    selectedInstanceCount++;
                }
            }
        }

        let servers = this.state.servers;
        for (let i = 0; i < servers.length; i++) {
            if (servers[i].id === this.state.activeServerId) {
                servers[i].selectedInstanceCount = selectedInstanceCount;
            }
        }

        this.setState({
            servers: servers,
            selectedInstances: selectedInstances
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
                    setAuthHeader(xhr, props.config, props.user);
                }
            }).done((msg) => {
                if (msg && msg.result) {
                    that.init = true;
                    let servers = msg.result;
                    //현재 멀티서버와 연결된 scouter webapp은 지원하지 않으므로 일단 단일 서버로 가정하고 마지막 서버 시간과 맞춘다.
                    servers.forEach((server) => {
                        common.setServerTimeGap(Number(server.serverTime) - new Date().valueOf());
                    });

                    // GET INSTANCES INFO FROM URL IF EXISTS
                    let instancesParam = new URLSearchParams(this.props.location.search).get('instances');
                    let urlInstanceObjHashes = null;
                    if (instancesParam) {
                        urlInstanceObjHashes = instancesParam.split(",");
                        if (urlInstanceObjHashes) {
                            urlInstanceObjHashes = urlInstanceObjHashes.map((d) => {
                                return Number(d)
                            });
                        }
                    }

                    if (urlInstanceObjHashes) {
                        let selectedHosts = [];
                        let selectedHostMap = {};
                        let selectedInstances = [];
                        let instances = [];
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
                                    setAuthHeader(xhr, props.config, props.user);
                                }
                            }).done(function (msg) {
                                instances = msg.result;

                                if (instances) {
                                    instances.sort((a, b) => a.objName < b.objName ? -1 : 1);

                                    const hosts = {};
                                    instances.filter((o) => o.objFamily === 'host').forEach((o) => {
                                        hosts[o.objName] = o;
                                    });

                                    instances.filter((o) => o.objFamily === 'javaee').forEach((o) => {
                                        let instanceName = o.objName;
                                        let hostName = instanceName.substring(0, instanceName.lastIndexOf('/'));
                                        o.host = hosts[hostName];
                                    });
                                }

                                if (instances && instances.length > 0) {
                                    instances.forEach((instance) => {
                                        urlInstanceObjHashes.forEach((objHash) => {
                                            if (objHash === Number(instance.objHash)) {
                                                selectedInstances.push(instance);
                                                if (!server.selectedInstanceCount) {
                                                    server.selectedInstanceCount = 0;
                                                }

                                                if (instance.host) {
                                                    if (!selectedHostMap[instance.host.objHash]) {
                                                        selectedHostMap[instance.host.objHash] = instance.host;
                                                        selectedHosts.push(instance.host);
                                                    }
                                                }

                                                server.selectedInstanceCount++;
                                                // 마지막으로 찾은 서버 ID로 세팅
                                                activeServerId = server.id;
                                            }
                                        });
                                    })
                                }
                            }).fail(function (xhr, textStatus, errorThrown) {
                                errorHandler(xhr, textStatus, errorThrown, that.props);
                            });
                        });


                        // LUCKY! FIND ALL INSTANCE
                        //if (urlInstanceObjHashes.length === selectedInstances.length) {
                        if (selectedInstances.length > 0) {
                            selectedInstances.sort((a, b) => a.objName < b.objName ? -1 : 1);
                            selectedHosts && selectedHosts.sort((a, b) => a.objName < b.objName ? -1 : 1);

                            let selectedInstanceMap = {};

                            for (let i = 0; i < selectedInstances.length; i++) {
                                selectedInstanceMap[selectedInstances[i].objHash] = selectedInstances[i];
                            }

                            this.setState({
                                servers: servers,
                                instances: instances,
                                activeServerId: activeServerId,
                                selectedInstances: selectedInstanceMap
                            });

                            AgentColor.setHosts(selectedHosts, this.props.config.colorType);
                            AgentColor.setInstances(selectedInstances, this.props.config.colorType);
                            this.props.setTarget(selectedHosts, selectedInstances);

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
                errorHandler(xhr, textStatus, errorThrown, that.props);
            });
        }
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.user.id) {
            this.setTargetFromUrl(nextProps);
        }
    }

    getServers = (config) => {
        let that = this;
        this.props.addRequest();
        jQuery.ajax({
            method: "GET",
            async: true,
            url: getHttpProtocol(config) + '/scouter/v1/info/server'
        }).done((msg) => {
            this.setState({
                servers: msg.result,
                instances: [],
                activeServerId: null,
                selectedInstances: {},
                selectedHosts: {},
                filter : ""
            });
        }).fail((xhr, textStatus, errorThrown) => {
            this.setState({
                servers: [],
                instances: [],
                activeServerId: null,
                selectedInstances: {},
                selectedHosts: {},
                filter : ""
            });
            errorHandler(xhr, textStatus, errorThrown, that.props);
        });

    };

    componentDidUpdate(prevProps, prevState) {
        if (this.props.visible && prevProps.visible !== this.props.visible) {
            if (!this.state.servers || this.state.servers.length < 1) {
                this.getServers(this.props.config);
            }
        }
    }

    onServerClick = (serverId) => {
        let that = this;
        this.props.addRequest();
        jQuery.ajax({
            method: "GET",
            async: true,
            url: getHttpProtocol(this.props.config) + '/scouter/v1/object?serverId=' + serverId,
            xhrFields: getWithCredentials(that.props.config),
            beforeSend: function (xhr) {
                setAuthHeader(xhr, that.props.config, that.props.user);
            },
        }).done((msg) => {
            if (msg.result) {

                that.setState({
                    activeServerId: serverId

                });

                const instances = msg.result;
                if (instances) {
                    instances.sort((a, b) => a.objName < b.objName ? -1 : 1);

                    // find host
                    const hosts = {};
                    instances.filter((o) => o.objFamily === 'host').forEach((o) => {
                        hosts[o.objName] = o;
                    });

                    instances.filter((o) => o.objFamily === 'javaee').forEach((o) => {
                        let instanceName = o.objName;
                        let hostName = instanceName.substring(0, instanceName.lastIndexOf('/'));
                        o.host = hosts[hostName];
                    });
                }
            }

            this.setState({
                instances: msg.result
            });

        }).fail((xhr, textStatus, errorThrown) => {
            errorHandler(xhr, textStatus, errorThrown, that.props);
        });
    };

    instanceClick = (instance) => {

        let selectedInstances = Object.assign(this.state.selectedInstances);
        if (selectedInstances[instance.objHash]) {
            delete selectedInstances[instance.objHash];
        } else {
            selectedInstances[instance.objHash] = instance;
        }

        let selectedInstanceCount = 0;
        for (let attr in selectedInstances) {
            for (let i = 0; i < this.state.instances.length; i++) {
                if (this.state.instances[i].objHash === attr) {
                    selectedInstanceCount++;
                }
            }
        }

        let servers = this.state.servers;
        for (let i = 0; i < servers.length; i++) {
            if (servers[i].id === this.state.activeServerId) {
                servers[i].selectedInstanceCount = selectedInstanceCount;
            }
        }

        this.setState({
            servers: servers,
            selectedInstances: selectedInstances
        });

    };

    setInstances = () => {
        let instances = [];
        let hosts = [];
        let hostMap = {};
        for (let hash in this.state.selectedInstances) {
            let instance = this.state.selectedInstances[hash];
            let host = instance.host;
            instances.push(instance);
            if (host) {
                if (!hostMap[host.objHash]) {
                    hostMap[host.objHash] = true;
                    hosts.push(host);
                }
            }
        }

        if (instances.length < 1) {
            this.props.pushMessage("info", "NO MONITORING TARGET", "At least one instance must be selected");
            this.props.setControlVisibility("Message", true);
        } else {
            instances && instances.sort((a, b) => a.objName < b.objName ? -1 : 1);
            hosts && hosts.sort((a, b) => a.objName < b.objName ? -1 : 1);

            AgentColor.setHosts(hosts, this.props.config.colorType);
            AgentColor.setInstances(instances, this.props.config.colorType);

            this.props.setTarget(hosts, instances);
            this.props.setControlVisibility("TargetSelector", false);

            common.setRangePropsToUrl(this.props, "/paper");
            /*this.props.history.push({
                pathname: '/paper',
                search: '?instances=' + instances.map((d) => {
                    return d.objHash
                })
            });*/

            this.props.toggleSelectorVisible();
        }


    };

    cancelClick = () => {
        this.props.toggleSelectorVisible();
    };

    onChangeScouterServer = (event) => {
        let inx = Number(event.target.value);
        let config = this.props.config;

        for (let i=0; i<config.servers.length; i++) {
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

    };

    render() {
        return (
            <div className={"instance-selector-bg " + (this.props.visible ? "" : "hidden")}>
                <div className={"instance-selector-fixed-bg"}>
                </div>
                <div className="instance-selector popup-div">
                    <div className="scouter-servers">
                        <div className="scouter-server-label">SCOUTER SERVER</div>
                        <div>
                            <select value={common.getDefaultServerConfigIndex(this.props.config)} onChange={this.onChangeScouterServer.bind(this)}>
                            {this.props.config.servers.map((server, inx) => {
                                return (
                                    <option key={inx} value={inx}>{server.protocol + "://" + server.address + ":" + server.port}</option>
                                )
                            })}
                            </select>
                        </div>
                    </div>
                    <div className="instance-selector-content">
                        <div className="host-list">
                            <div>
                                <div className="title">
                                    <div>SERVERS</div>
                                </div>
                                <div className="list-content scrollbar">
                                    {this.state.servers && this.state.servers.map((host, i) => {
                                            return (<div
                                                className={'host ' + (i === 0 ? 'first ' : ' ') + (host.id === this.state.activeServerId ? 'active ' : ' ')}
                                                key={i}
                                                onClick={this.onServerClick.bind(this, host.id)}>{host.name}{host.selectedInstanceCount > 0 &&
                                            <span
                                                className="host-selected-count">{host.selectedInstanceCount}</span>}</div>)
                                        }
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="instance-list">
                            <div>
                                <div className={"filter " + (this.state.filter && this.state.filter.length > 1 ? 'filtered' : '')}>
                                    <span className="filter-icon" onClick={this.clearFilter}><i className="fa fa-filter" aria-hidden="true"></i></span><span className="filter-tag">INSTANCE</span><input type="search" onChange={this.onFilterChange.bind(this)} value={this.state.filter} /><span className="check-btn" onClick={this.selectAll}><i className="fa fa-check-circle-o" aria-hidden="true"></i> ALL</span>
                                </div>
                                <div className="list-content scrollbar">
                                    {(this.state.instances && this.state.instances.length > 0) && this.state.instances.filter((instance) => {
                                        if (instance.objFamily === 'javaee') {
                                            if (this.state.filter && this.state.filter.length > 1) {
                                                if ((instance.objType && instance.objType.toLowerCase().indexOf(this.state.filter.toLowerCase()) > -1) || (instance.objName && instance.objName.toLowerCase().indexOf(this.state.filter.toLowerCase()) > -1) || (instance.address && instance.address.toLowerCase().indexOf(this.state.filter.toLowerCase()) > -1)) {
                                                    return true;
                                                }  else {
                                                    return false;
                                                }
                                            } else {
                                                return true;
                                            }
                                        } else {
                                            return false;
                                        }
                                    }).map((instance, i) => {
                                        return (
                                            <div key={i} className={"instance " + (i === 0 ? 'first ' : ' ') + (!(!this.state.selectedInstances[instance.objHash]) ? "selected" : " ")} onClick={this.instanceClick.bind(this, instance)}>
                                                <div className="instance-name">{instance.objName}</div><div className="instance-other"><span>{instance.address}</span><span className="instance-objtype">{instance.objType}</span></div>
                                            </div>)
                                    })}
                                    {(!this.state.instances || this.state.instances.length < 1) && <div className="no-instance"><div><div>NO INSTANCE</div></div></div> }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="buttons">
                        <button onClick={this.cancelClick}>CANCEL</button>
                        <button onClick={this.setInstances}>APPLY</button>
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
        user: state.user,
        range: state.range,
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        setTarget: (hosts, instances) => dispatch(setTarget(hosts, instances)),
        setInstances: (instances) => dispatch(setInstances(instances)),
        setControlVisibility: (name, value) => dispatch(setControlVisibility(name, value)),
        clearAllMessage: () => dispatch(clearAllMessage()),
        pushMessage: (category, title, content) => dispatch(pushMessage(category, title, content)),
        addRequest: () => dispatch(addRequest()),
        setConfig: (config) => dispatch(setConfig(config)),
    };
};

InstanceSelector = connect(mapStateToProps, mapDispatchToProps)(InstanceSelector);

export default withRouter(InstanceSelector);
