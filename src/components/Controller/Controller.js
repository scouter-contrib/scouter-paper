import React, {Component} from "react";
import "./Controller.css";

import {
    addFilteredObject,
    addRequest,
    clearAllMessage,
    pushMessage,
    removeFilteredObject,
    setBoxes,
    setBoxesLayouts,
    setConfig,
    setControllerState,
    setControlVisibility,
    setFilterMap,
    setLayouts,
    setPresetName,
    setServerId,
    setTarget
} from "../../actions";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import Logo from "../Logo/Logo";
import SimpleSelector from "../SimpleSelector/SimpleSelector";
import InstanceSelector from "../Menu/InstanceSelector/InstanceSelector";
import AgentColor from "../../common/InstanceColor";
import RangeControl from "../Paper/RangeControl/RangeControl";
import TopologyControl from "../TopologyControl/TopologyControl";
import TopologyMinControl from "../TopologyMinControl/TopologyMinControl";
import * as PaperIcons from "../../common/PaperIcons";
import LayoutManager from "../Menu/LayoutManager/LayoutManager";
import PresetManager from "../Menu/PresetManager/PresetManager";
import * as _ from "lodash";
import * as common from "../../common/common";
import {
    buildHttpProtocol,
    errorHandler,
    getDefaultServerConfig,
    getDefaultServerConfigIndex,
    getHttpProtocol,
    getParam,
    setData,
    setRangePropsToUrl,
    setServerTimeGap,
    setTargetServerToUrl
} from "../../common/common";
import PaperControl from "../Paper/PaperControl/PaperControl";
import ScouterApi from "../../common/ScouterApi";


class Controller extends Component {

    constructor(props) {
        super(props);
        this.state = {
            servers: [],
            activeServerId: null,
            counterInfo: {},
            objects: [],
            selectedObjects: JSON.parse(localStorage.getItem("selectedObjects")) || {},
            filter: "",
            loading: false,
            selector: false,
            preset: false,
            filterOpened: false,
            currentTab: "CONTROL"
        };
    }

    componentDidMount() {

        if (getDefaultServerConfig(this.props.config).authentification !== "bearer") {
            this.setTargetFromUrl();
        } else {
            let defaultServerConfig = getDefaultServerConfig(this.props.config);
            let origin = defaultServerConfig.protocol + "://" + defaultServerConfig.address + ":" + defaultServerConfig.port;
            if (this.props.config || (this.props.user[origin] && this.props.user[origin].id)) {
                this.setTargetFromUrl();
            }
        }
        common.setTargetServerToUrl(this.props, this.props.config);
        if (localStorage.getItem("selectedObjects")) {
            let selectedObjects = JSON.parse(localStorage.getItem("selectedObjects"));
            if (selectedObjects.objects) {
                this.applyPreset(selectedObjects);
            } else {
                this.setObjects();
            }
        }

        this.getConfigServerName();


    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.user.id) {
            this.setTargetFromUrl(nextProps);
        }

        if (JSON.stringify(this.props.user) !== JSON.stringify(nextProps.user)) {
            this.getServers(nextProps.config);
        }

        if (nextProps.menu !== "/paper" && this.state.currentTab === "CONFIGURATION") {
            this.setState({
                currentTab: "CONTROL"
            });
        }
        if (this.props.serverId.server) {
            if( this.props.serverId.server[0].id !== nextProps.serverId.server[0].id) {
                this.changeServerName(nextProps.serverId)
            }
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.selector && prevState.selector !== this.state.selector) {
            if (!this.state.servers || this.state.servers.length < 1) {
                this.getServers(this.props.config);
            }
            this.setObjectUpdate();

        }
    }

    setObjectUpdate() {

        const _urlObjectHashs = [ new URLSearchParams(this.props.location.search).get('objects'),
                                  new URLSearchParams(this.props.location.search).get('instances')]
                                 .filter(_urlObjHashs => _urlObjHashs ? true : false);
        try {
            const _conf = common.confBuilder(getHttpProtocol(this.props.config),this.props.config,this.props.user,this.state.activeServerId);
            const _promise = [ScouterApi.getInstanceObjects(_conf),ScouterApi.getCounterModel(_conf)];
            Promise.all(_promise).then((msg) => {
                const [instanceObj,countInfo] = msg;
                if (instanceObj.result) {
                    const objects = instanceObj.result;
                    let objTypesMap = {};
                    let familyNameIcon = {};
                    countInfo.result.objTypes.forEach((objType) => {
                        objTypesMap[objType.name] = objType;
                        familyNameIcon[objType.familyName] = objType.icon;
                    });
                    this.setState({
                        counterInfo: {
                            families: countInfo.result.families,
                            objTypesMap : objTypesMap,
                            familyNameIcon : familyNameIcon
                        }

                    });
                    if (objects) {
                        const [_objectHashs] = _urlObjectHashs;
                        if (_objectHashs) {
                            const _selectorObjHashs = _objectHashs.split(",").map(d => Number(d));
                            const _selectedObjects = objects.filter(_obj => {
                                return _selectorObjHashs.filter(_select => _select === Number(_obj.objHash)).length > 0;
                            }).sort((a, b) => a.objName < b.objName ? -1 : 1);
                            const _selectedObjectsMap = _selectedObjects.reduce((obj, item) => {
                                obj[item.objHash] = item;
                                return obj;
                            }, {});
                            this.setState({
                                objects: objects,
                                selectedObjects: _selectedObjectsMap
                            });
                        } else {
                            this.setState({
                                objects: objects
                            });
                        }
                    }
                }

            });

        } catch (error) {
            console.error(error);
        }

    }

    isObjectAlive = (object) => {
        const {selectedObjects} = this.state;
        const key = object.objHash;
        if (selectedObjects && selectedObjects.hasOwnProperty(key)) {
            return selectedObjects[key].alive;
        } else {
            return false;
        }
    };

    toggleSelectorVisible = () => {
        this.setState({
            selector: !this.state.selector,
            preset: !this.state.selector ? false : this.state.selector
        });
    };

    closeSelectorPopup = () => {
        this.setState({
            selector: false,
            preset: false
        });
    };

    togglePresetManager = () => {
        this.setState({
            preset: !this.state.preset,
            selector: !this.state.preset ? false : this.state.preset
        });
    };
    changeServerName = (serverId) =>{
       const  _server = common.confBuilder(getHttpProtocol(this.props.config),this.props.config,this.props.user,serverId.server[0].id);
       const _searchServerId = serverId.server[0].id;
       ScouterApi.getConnectedServer(_server)
            .done(msg => {
                if (msg.result && msg.result.length > 0) {
                    msg.result.filter(server => server.id === _searchServerId)
                               .forEach( server =>{
                                    const name = `${server.name} (${getHttpProtocol(this.props.config)})`;
                                    const _conf = _.clone(this.props.config);
                                    _conf.servers.filter(_server => _server.default)
                                        .forEach(_server => {
                                            _server.name = name;
                                            _server.id = _searchServerId;
                                        });
                                    this.props.setConfig(_conf);
                                });
                }
            })
    };
    getScouterApiServerId = () => {
        return this.props.serverId.server? this.props.serverId.server[0].id : getParam(this.props,'activesid');
    };
    getConfigServerName = () => {
        let allServerList = buildHttpProtocol(this.props.config);
        let serverNames = {};

        if (allServerList) {
            allServerList.forEach((server) => {
                const  _server = common.confBuilder(server.addr,this.props.config,this.props.user,null);
                ScouterApi.getConnectedServer(_server)
                .done(msg => {
                    if (msg.result && msg.result.length > 0) {
                        const _filter = msg.result.filter(s => s.id === this.getScouterApiServerId())
                        const _info = _filter.length > 0 ? _filter[0] : msg.result[0];
                        serverNames[server.key] = { info : _info};

                    } else {
                        serverNames[server.key] =  {
                            info : { name : "FAILED TO GET NAME", id : "-1"}
                        };
                    }
                }).fail(() => {
                    serverNames[server.key] = {
                        info : { name : "FAILED TO GET NAME", id : "-1"}
                    };
                }).always(() => {
                    let _conf = _.clone(this.props.config);
                    _conf.servers.forEach((server, idx) => {
                        if (serverNames[idx]) {

                            server.name = `${serverNames[idx].info.name} (${server.protocol}://${server.address}:${server.port})`;
                            server.id = serverNames[idx].info.id;
                        }
                    });
                    this.props.setConfig(_conf);

                });

            })
        }
    };

    onChangeScouterServer = (inx) => {
        const config = JSON.parse(JSON.stringify(this.props.config));
        const currentServer = common.getServerInfo(config);
        for (let i = 0; i < config.servers.length; i++) {
            if (i === inx) {
                config.servers[i].default = true;
            } else {
                config.servers[i].default = false;
            }
        }

        this.props.setConfig(config);

        const nextServer = common.getServerInfo(config);
        if (currentServer["address"] === nextServer["address"] && currentServer["port"] === nextServer["port"]) {
            return;
        }

        this.getServers(config);
        if (localStorage) {
            localStorage.setItem("config", JSON.stringify(config));
        }
        this.setState({
            selectedObjects: {},
        },() => {
            setTargetServerToUrl(this.props, config);
            common.replaceAllLocalSettingsForServerChange(currentServer, this.props, config);
            common.clearAllUrlParamOfPaper(this.props, config);
            window.location.reload();
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
        }
        objects.sort((a, b) => a.objName < b.objName ? -1 : 1);
        AgentColor.setInstances(objects, this.props.config.colorType);
        this.props.setTarget(objects);
        const {activeServerId } = this.state;
        const defaultServerId = activeServerId ? activeServerId : this.getScouterApiServerId();

        this.props.setControlVisibility("TargetSelector", false);

        if(defaultServerId) {
            this.props.setServerId([{id: defaultServerId, obj: objects}]);
        }
        setRangePropsToUrl(this.props, undefined, objects,defaultServerId);


        localStorage.setItem("selectedObjects", JSON.stringify(objects));
        this.closeSelectorPopup();
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


    onServerClick = (serverId) => {
        this.props.addRequest();
        const _conf = common.confBuilder(getHttpProtocol(this.props.config),this.props.config,this.props.user,serverId);
        const _promise = [ScouterApi.getInstanceObjects(_conf),ScouterApi.getCounterModel(_conf)];
        Promise.all(_promise).then((msg) => {
            const [instanceObj,countInfo] = msg;
            if (instanceObj.result) {
                const objects = instanceObj.result;
                let objTypesMap = {};
                let familyNameIcon = {};
                countInfo.result.objTypes.forEach((objType) => {
                    objTypesMap[objType.name] = objType;
                    familyNameIcon[objType.familyName] = objType.icon;
                });
                this.setState({
                    activeServerId: serverId,
                    servers: this.state.servers.map(host => ({...host,selectedObjectCount: null}) ),
                    selectedObjects: {} ,
                    counterInfo: {
                        families: countInfo.result.families,
                        objTypesMap : objTypesMap,
                        familyNameIcon : familyNameIcon
                    }

                });
                if (objects) {
                    objects.sort((a, b) => a.objName < b.objName ? -1 : 1);
                    this.setState({
                        objects: instanceObj.result,
                    });
                }
            }

        });
    };


    applyPreset = (preset) => {
        let that = this;


        this.props.addRequest();
        const _conf = common.confBuilder(getHttpProtocol(this.props.config),this.props.config,this.props.user,null);
        ScouterApi.getConnectedServer(_conf)
        .done(msg => {

            if (msg && msg.result) {
                let servers = msg.result;
                if (servers.length > 0) {
                    if (!servers[0].version) {
                        this.props.pushMessage("error", "Not Supported", "Paper 2.0 is available only on Scout Server 2.0 and later.");
                        this.props.setControlVisibility("Message", true);
                        return;
                    }
                }
                //현재 멀티서버와 연결된 scouter webapp은 지원하지 않으므로 일단 단일 서버로 가정하고 마지막 서버 시간과 맞춘다.
                servers.forEach((server) => {
                    setServerTimeGap(Number(server.serverTime) - new Date().valueOf());
                });
                // GET INSTANCES INFO FROM URL IF EXISTS
                let urlObjectHashes = preset.objects.map((d) => {
                    return Number(d)
                });

                if (urlObjectHashes) {
                    let selectedObjects = [];
                    let objects = [];
                    let activeServerId = null;
                    servers.forEach((server) => {
                        //일단 단일 서버로 가정하고 서버 시간과 맞춘다.
                        setServerTimeGap(Number(server.serverTime) - new Date().valueOf());
                        const _sconf = common.confBuilder(getHttpProtocol(this.props.config),this.props.config,this.props.user,server.id);
                        ScouterApi.getSyncInstanceObjects(_sconf)
                        .done(msg => {
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
                            errorHandler(xhr, textStatus, errorThrown, this.props, "applyPreset_1", true);
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
                        this.props.setServerId( [ {id: activeServerId, obj: objects} ] );
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
            errorHandler(xhr, textStatus, errorThrown, that.props, "applyPreset_2", false);
        });


    };

    setTargetFromUrl = () => {
        if (!this.init) {
            this.props.addRequest();
            const conf = common.confBuilder(getHttpProtocol(this.props.config),this.props.config,this.props.user,this.getScouterApiServerId());
            ScouterApi.getConnectedServer(conf)
            .done((msg) => {
                if (msg && msg.result) {
                    this.init = true;
                    let servers = msg.result;
                    if (servers.length > 0) {
                        if (!servers[0].version) {
                            this.props.pushMessage("error", "Not Supported", "Paper 2.0 is available only on Scout Server 2.0 and later.");
                            this.props.setControlVisibility("Message", true);
                            return;
                        }
                    }
                    //현재 멀티서버와 연결된 scouter webapp은 지원하지 않으므로 일단 단일 서버로 가정하고 마지막 서버 시간과 맞춘다.
                    servers.forEach((server) => {
                        setServerTimeGap(Number(server.serverTime) - new Date().valueOf());

                    });

                    // GET INSTANCES INFO FROM URL IF EXISTS
                    let objectsParam = new URLSearchParams(this.props.location.search).get('objects');
                    if (!objectsParam) {
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

                    const presetName = new URLSearchParams(this.props.location.search).get('preset');
                    if (urlObjectHashes || presetName) {
                        let selectedObjects = [];
                        let objects = [];
                        let activeServerId = null;
                        servers.forEach(server => {

                            //일단 단일 서버로 가정하고 서버 시간과 맞춘다.
                            setServerTimeGap(Number(server.serverTime) - new Date().valueOf());
                            const _sconf = common.confBuilder(getHttpProtocol(this.props.config),this.props.config,this.props.user,server.id);
                            if (presetName) {
                                ScouterApi.getPaperPreset(_sconf)
                                .done((msg) => {
                                    if (msg && msg.status === "200") {
                                        if (msg.result) {
                                            let presets = msg.result;
                                            if (presets && presets.length > 0) {
                                                presets.forEach(serverPreset => {
                                                    if (serverPreset.name === presetName) {
                                                        this.props.setPresetName(presetName);
                                                        this.applyPreset(serverPreset);
                                                        activeServerId = server.id;
                                                    }
                                                });
                                            }
                                        }
                                    }
                                }).fail((xhr, textStatus, errorThrown) => {
                                    errorHandler(xhr, textStatus, errorThrown, this.props, "loadPresets", true);
                                });

                            } else {
                                ScouterApi.getSyncInstanceObjects(_sconf)
                                .done(msg => {
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
                                    errorHandler(xhr, textStatus, errorThrown, this.props, "load Instance Object", true);
                                });
                            }
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
                            this.props.setServerId([{id:activeServerId,obj:objects}]);
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
                errorHandler(xhr, textStatus, errorThrown, this.props, "setTargetFromUrl_2", false);
            });
        }
    };

    getServers = (config) => {
        let that = this;
        this.props.addRequest();

        this.setState({
            loading: true
        });

        const conf = common.confBuilder(getHttpProtocol(config),config,this.props.user,null);
        ScouterApi.getConnectedServer(conf)
        .done(msg => {

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
                loading: false
            });
        });

    };

    quickSelect = (filteredObjects) => {
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
        Object.keys(selectedObjects).forEach(_key =>{
            if(!selectedObjects[_key].serverId){
                selectedObjects[_key].serverId = this.state.activeServerId;
            }
        });
        this.setState({
            servers: servers,
            selectedObjects: selectedObjects
        });
    };

    quickSelectByTypeClick = (type) => {
        let filteredObjects;
        if (type === "all") {
            filteredObjects = this.state.objects.filter(()=>true);
        }
        else if(type === "inactive"){
            filteredObjects = this.state.objects.filter((d)=> !d.alive);
        }else if(type === "active"){
            filteredObjects = this.state.objects.filter((d)=> d.alive);
        } else {
            filteredObjects = this.state.objects.filter((object) => {
                return type === this.getIconOrObjectType(object);
            });
        }
        this.quickSelect(filteredObjects);
    };

    getIconOrObjectType = (instance) => {
        let objType = this.state.counterInfo.objTypesMap[instance.objType];
        let icon;
        if (objType) {
            icon = objType.icon ? objType.icon : instance.objType;
        }

        return icon;
    };

    selectAll = () => {
        let filteredObjects = this.state.objects.filter((object) => {
            if (this.state.filter && this.state.filter.length > 1) {
                if ((object.objType && object.objType.toLowerCase().indexOf(this.state.filter.toLowerCase()) > -1)
                    || (object.objName && object.objName.toLowerCase().indexOf(this.state.filter.toLowerCase()) > -1)
                    || (object.address && object.address.toLowerCase().indexOf(this.state.filter.toLowerCase()) > -1))
                {
                    return true;
                } else {
                    return false;
                }
            } else {
                return true;
            }
        });

        this.quickSelect(filteredObjects);
    };

    onFilterChange = (filter) => {
        this.setState({
            filter: filter
        });
    };

    clearFilter = () => {
        this.setState({
            filter: ""
        });
    };

    toggleFilterControl = () => {
        this.setState({
            filterOpened: !this.state.filterOpened
        });
    };

    toggleFilteredObject = (objHash) => {

        if (this.props.filterMap[objHash]) {
            this.props.removeFilteredObject(objHash);
        } else {
            this.props.addFilteredObject(objHash);
        }
    };

    search = (from, to, objects) => {
        this.props.search(from, to, objects);
    };

    changeCurrentTab = (tab) => {
        this.setState({
            currentTab: tab
        });
    };

    setOption = (key, option) => {

        let boxes = this.props.boxes.slice(0);
        boxes.forEach((box) => {
            if (box.key === key) {

                if (option.mode === "exclusive") {
                    box.option = {
                        mode: option.mode,
                        type: option.type,
                        config: option.config,
                        counterKey: option.counterKey,
                        title: option.title
                    };
                } else {

                    if (!box.option) {
                        box.option = [];
                    }

                    if (box.option && !Array.isArray(box.option)) {
                        box.option = [];
                    }

                    let duplicated = false;
                    for (let i = 0; i < box.option.length; i++) {
                        if (box.option[i].counterKey === option.name && box.option[i].familyName === option.familyName) {
                            duplicated = true;
                            break;
                        }
                    }

                    if (!duplicated) {
                        box.option.push({
                            mode: "nonexclusive",
                            type: "counter",
                            config: option.config,
                            counterKey: option.name,
                            title: option.displayName,
                            familyName: option.familyName
                        });
                    }
                    if(!box.advancedOption && option.advancedOption ){
                        box.advancedOption = option.advancedOption;
                    }
                }

                box.values = {};
                for (let attr in option.config) {
                    box.values[attr] = option.config[attr].value;
                }

                if (Array.isArray(box.option)) {
                    box.config = false;
                    let title = "";
                    for (let i = 0; i < box.option.length; i++) {
                        title += box.option[i].title;
                        if (i < (box.option.length - 1)) {
                            title += ", ";
                        }
                    }
                    box.title = title
                } else {
                    box.config = false;
                    box.title = option.title;
                }

                return false;
            }
        });

        this.props.setBoxes(boxes);

        setData("boxes", boxes);
    };

    addPaperAndAddMetric = (data) => {
        let key = this.addPaper();
        if (data) {
            let option = JSON.parse(data);
            this.setOption(key, option);
        }
    };

    clearLayout = () => {
        this.props.setBoxesLayouts([], {});
    };

    getUniqueKey() {
        let dup = false;
        let key = null;
        let i = 1;
        do {
            dup = false;
            key = String(this.props.boxes.length + i);
            for (let i = 0; i < this.props.boxes.length; i++) {
                if (this.props.boxes[i].key === key) {
                    dup = true;
                    break;
                }
            }
            i++;
        } while (dup);

        return key;
    }

    addPaper = () => {
        let boxes = this.props.boxes;
        let key = this.getUniqueKey();
        let nextX = 0;
        let nextY = 0;

        try {

            let rooms = [];
            for (let i = 0; i < boxes.length; i++) {
                let layout = boxes[i].layout;
                if (!rooms[layout.y]) {
                    rooms[layout.y] = [false, false, false, false, false, false, false, false, false, false, false, false];
                }

                for (let i = layout.y; i < layout.y + layout.h; i++) {
                    for (let j = layout.x; j < layout.x + layout.w; j++) {
                        if (!rooms[i]) {
                            rooms[i] = [false, false, false, false, false, false, false, false, false, false, false, false];
                        }
                        rooms[i][j] = true;
                    }
                }
            }

            let find = false;
            for (let i = 0; i < rooms.length; i++) {
                let room = rooms[i];
                if (room) {
                    let cnt = 0;
                    let startX = -1;
                    for (let j = 0; j < room.length; j++) {
                        if (room[j]) {
                            startX = -1;
                            cnt = 0;
                        } else {
                            if (startX < 0) {
                                startX = j;
                            }
                            cnt++;
                        }
                    }

                    if (cnt > 5) {
                        let result = true;
                        for (let j = 1; j < 4; j++) {
                            if (room[i + j]) {
                                for (let k = startX; k < startX + 6; k++) {
                                    if (room[i + j][k]) {
                                        result = false;
                                    }
                                }
                            }
                        }

                        if (result) {
                            nextY = i;
                            nextX = startX;
                            find = true;
                            break;
                        }
                    }
                }
            }

            if (!find) {
                if (rooms.length < 1) {
                    nextX = 0;
                    nextY = 0;
                } else {
                    nextY = rooms.length;
                    nextX = 0;
                }
            }
        } catch (e) {
            nextX = 0;
            nextY = 0;
        }

        boxes.push({
            key: key,
            title: "NO TITLE ",
            layout: {w: 6, h: 4, x: nextX, y: nextY, minW: 1, minH: 3, i: key}
        });


        this.props.setBoxes(boxes);
        setData("boxes", boxes);

        return key;
    };

    toggleAllObjectFilter = (e) => {
        e.stopPropagation();
        if (this.props.objects.length === Object.keys(this.props.filterMap).length) {
            this.props.objects.forEach((o) => {
                this.props.removeFilteredObject(o.objHash);
            });
        } else {
            this.props.objects.forEach((o) => {
                if (!this.props.filterMap[o.objHash]) {
                    this.props.addFilteredObject(o.objHash);
                }
            });
        }
    };

    render() {
        let menu = this.props.menu.replace("/", "");
        return (
            <div>
            <article className={"controller-wrapper scrollbar noselect " + this.props.control.Controller + " " + menu + "-menu"}>
                <Logo></Logo>
                <div className="controller-tabs">
                    <div onClick={this.changeCurrentTab.bind(this, "CONTROL")} className={this.state.currentTab === "CONTROL" ? "selected" : ""}>CONTROL</div>
                    {menu === "paper" && <div onClick={this.changeCurrentTab.bind(this, "CONFIGURATION")} className={this.state.currentTab === "CONFIGURATION" ? "selected" : ""}>PAPER CONFIG</div>}
                </div>
                {this.props.control.Controller === "min" &&
                <div>
                    <div className="controller-min-info">
                        <div className="controller-min-info-row obj-selector" onClick={this.toggleSelectorVisible}>
                            <div className="short-label"><span>OBJ</span></div>
                            {this.props.objects.length > 0 &&
                            <div className="selector-open-btn short-value">{Object.keys(this.props.filterMap).length} / {this.props.objects.length}</div>}
                            {this.props.objects.length <= 0 && <div className="selector-open-btn short-value">-</div>}
                        </div>
                        <div className="controller-min-info-row paper-only">
                            {this.props.range.realTime && <div className="realtime-short-label"><span>RT</span></div>}
                            {!this.props.range.realTime && <div className="realtime-short-label"><span>HISTO</span></div>}
                            {!this.props.range.realTime && <div className="short-time-value"><span>{this.props.range.value}m</span></div>}
                        </div>
                        <div className="topology-only">
                            <TopologyMinControl></TopologyMinControl>
                        </div>
                    </div>
                </div>
                }
                {this.state.currentTab === "CONTROL" &&
                <div>
                    <div className="control-item first">
                        <div className="row desc">
                            <div className="step"><span>1</span></div>
                            <div className="row-message">SELECT API SERVER</div>
                        </div>
                        <div className="row control">
                            <div>
                                <SimpleSelector selected={getDefaultServerConfigIndex(this.props.config)} list={this.props.config.servers} onChange={this.onChangeScouterServer}></SimpleSelector>
                            </div>
                        </div>
                    </div>
                    <div className="control-item">
                        <div className="row desc">
                            <div className="step"><span>2</span></div>
                            <div className="row-message">SELECT TARGET OBJECTS</div>
                        </div>
                        <div className="row control">
                            <div className="object-navigator-btn-wrapper">
                                <div className="object-navigator-btn" onClick={this.toggleFilterControl}>
                                    {this.props.objects.length > 0 &&
                                    <span>{Object.keys(this.props.filterMap).length} / {this.props.objects.length} OBJECTS</span>}
                                    {this.props.objects.length <= 0 && <span>NO SELECTED</span>}
                                    <span className={"check-all-btn " + ((this.props.objects.length === Object.keys(this.props.filterMap).length) ? "selected" : "")} onClick={this.toggleAllObjectFilter.bind(this)}>ALL</span>
                                    <span className="toggle-filter-icon"><i className="fa fa-angle-down" aria-hidden="true"></i></span>
                                </div>
                                <span className="popup-icon" onClick={this.toggleSelectorVisible}><i className="fa fa-crosshairs" aria-hidden="true"></i></span>
                                {this.state.filterOpened &&
                                <div className="object-filter-list scrollbar">
                                    <ul>
                                        {this.props.objects.length < 1 && <li className="empty-object">NO OBJECT SELECTED</li>}
                                        {this.props.objects.sort((a, b) => {
                                            let compare = a.objType.localeCompare(b.objType);
                                            if (compare === 0) {
                                                return a.objName.localeCompare(b.objName);
                                            } else {
                                                return compare;
                                            }
                                        }).map((object, i) => {

                                            let objType = this.props.counterInfo.objTypesMap[object.objType];
                                            let icon = "";
                                            let displayName = "";
                                            if (objType) {
                                                icon = objType.icon ? objType.icon : object.objType;
                                                displayName = objType.displayName;
                                            }

                                            let iconInfo = PaperIcons.getObjectIcon(icon);
                                            return (
                                                <li key={i} className={this.props.filterMap[object.objHash] ? "filtered" : ""} onClick={this.toggleFilteredObject.bind(this, object.objHash)}>
                                                    <div className="row">
                                                        <div className="type-icon">
                                                            <div className="type-icon-wrapper" style={{color: iconInfo.color, backgroundColor: iconInfo.bgColor}}>
                                                                {iconInfo.fontFamily === "text" && <div className={"object-icon " + iconInfo.fontFamily}>{iconInfo.text}</div>}
                                                                {iconInfo.fontFamily !== "text" && <div className={"object-icon " + iconInfo.fontFamily + " " + iconInfo.text}></div>}
                                                            </div>
                                                        </div>
                                                        <div className="instance-text-info">
                                                            <div className={`instance-name ${this.isObjectAlive(object) ? 'alive' : 'down'}`}>{object.objName}</div>
                                                            <div className={`instance-other ${this.isObjectAlive(object) ? 'alive' : 'down'}`}><span>{object.address}</span><span className="instance-objtype">{displayName}</span></div>
                                                        </div>
                                                    </div>
                                                </li>)
                                        })}
                                    </ul>
                                </div>
                                }
                            </div>
                        </div>
                    </div>
                    <div className="control-item paper-only control-item-search">
                        <div className="row desc">
                            <div className="step"><span>3</span></div>
                            <div className="row-message">SEARCH</div>
                        </div>
                        <div className="row control">
                            <div>
                                <RangeControl visible={this.state.rangeControl} search={this.search}
                                              fixedControl={this.state.fixedControl}
                                              changeLongTerm={this.changeLongTerm}/>
                            </div>
                        </div>
                    </div>

                    <div className="control-item paper-only control-item-calendar">
                        <div className="row desc">
                            <div className="step"><span>4</span></div>
                            <div className="row-message">CHANGE LAYOUT
                                <div className="breakpoints"><span data-tip="SMALL LAYOUT ( < 800PX)" className={"breakpoint " + (this.props.control.breakpoint === "lg" ? "selected" : "")}>L</span><span  data-tip="LARGE LAYOUT ( > 800PX)" className={"breakpoint " + (this.props.control.breakpoint === "md" ? "selected" : "")}>S</span></div>
                            </div>
                        </div>
                        <div className="row control">
                            <div>
                                <LayoutManager visible={this.props.control.Controller === "max"}></LayoutManager>
                            </div>
                        </div>
                    </div>

                    <div className="control-item topology-only">
                        <div className="row desc">
                            <div className="step"><span>3</span></div>
                            <div className="row-message">TOPOLOGY OPTION</div>
                        </div>
                        <div className="row control">
                            <div>
                                <TopologyControl></TopologyControl>
                            </div>
                        </div>
                    </div>
                </div>
                }
                {this.state.currentTab === "CONFIGURATION" &&
                <div>
                    <PaperControl addPaper={this.addPaper} addPaperAndAddMetric={this.addPaperAndAddMetric} clearLayout={this.clearLayout} fixedControl={this.state.fixedControl} toggleRangeControl={this.toggleRangeControl} realtime={this.props.range.realTime} alert={this.state.alert} clearAllAlert={this.clearAllAlert} clearOneAlert={this.clearOneAlert} setRewind={this.setRewind} showAlert={this.state.showAlert} toggleShowAlert={this.toggleShowAlert}/>
                </div>
                }
            </article>
                {this.state.selector &&
                <InstanceSelector onFilterChange={this.onFilterChange}
                                  clearFilter={this.clearFilter}
                                  quickSelectByTypeClick={this.quickSelectByTypeClick}
                                  selectAll={this.selectAll}
                                  servers={this.state.servers}
                                  activeServerId={this.state.activeServerId}
                                  objects={this.state.objects}
                                  selectedObjects={this.state.selectedObjects}
                                  filter={this.state.filter}
                                  loading={this.state.loading}
                                  counterInfo={this.state.counterInfo}
                                  onServerClick={this.onServerClick}
                                  instanceClick={this.instanceClick}
                                  setObjects={this.setObjects}
                                  visible={this.state.selector}
                                  toggleSelectorVisible={this.toggleSelectorVisible}
                                  togglePresetManager={this.togglePresetManager}
                                  closeSelectorPopup={this.closeSelectorPopup}/>
                }

                {this.state.preset &&
                <PresetManager visible={this.state.preset}
                               activeServerId={this.state.activeServerId}
                               togglePresetManager={this.togglePresetManager}
                               closeSelectorPopup={this.closeSelectorPopup}
                               toggleSelectorVisible={this.toggleSelectorVisible}
                               setObjects={this.setObjects}
                               applyPreset={this.applyPreset}/>
                }
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        control: state.control,
        menu: state.control.menu,
        objects: state.target.objects,
        filterMap: state.target.filterMap,
        counterInfo: state.counterInfo,
        config: state.config,
        user: state.user,
        range: state.range,
        boxes: state.paper.boxes,
        layouts: state.paper.layouts,
        layoutChangeTime: state.paper.layoutChangeTime,
        topologyOption: state.topologyOption,
        presetName: state.presetName,
        serverId: state.serverId
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        setControllerState: (state) => dispatch(setControllerState(state)),
        setTarget: (objects) => dispatch(setTarget(objects)),
        setControlVisibility: (name, value) => dispatch(setControlVisibility(name, value)),
        clearAllMessage: () => dispatch(clearAllMessage()),
        pushMessage: (category, title, content) => dispatch(pushMessage(category, title, content)),
        addRequest: () => dispatch(addRequest()),
        setConfig: (config) => dispatch(setConfig(config)),
        setFilterMap: (filterMap) => dispatch(setFilterMap(filterMap)),
        addFilteredObject: (objHash) => dispatch(addFilteredObject(objHash)),
        removeFilteredObject: (objHash) => dispatch(removeFilteredObject(objHash)),

        setBoxes: (boxes) => dispatch(setBoxes(boxes)),
        setLayouts: (layouts) => dispatch(setLayouts(layouts)),
        setBoxesLayouts: (boxes, layouts) => dispatch(setBoxesLayouts(boxes, layouts)),
        setPresetName: (preset) => {
            localStorage.setItem("preset", JSON.stringify(preset));
            return dispatch(setPresetName(preset));
        },
        setServerId:(activeServer) => {
            localStorage.setItem("activeServerId", JSON.stringify(activeServer));
            return dispatch(setServerId(activeServer));
        }
    };
};

Controller = connect(mapStateToProps, mapDispatchToProps)(Controller);
export default withRouter(Controller);
