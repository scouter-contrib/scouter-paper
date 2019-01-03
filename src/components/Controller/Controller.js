import React, {Component} from 'react';
import './Controller.css';
import {setControllerState} from '../../actions';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import Logo from "../Logo/Logo";
import SimpleSelector from "../SimpleSelector/SimpleSelector";
import InstanceSelector from "../Menu/InstanceSelector/InstanceSelector";
import AgentColor from "../../common/InstanceColor";
import RangeControl from "../Paper/RangeControl/RangeControl";
import TopologyControl from "../TopologyControl/TopologyControl";
import TopologyMinControl from "../TopologyMinControl/TopologyMinControl";
import * as PaperIcons from '../../common/PaperIcons'
import LayoutManager from "../Menu/LayoutManager/LayoutManager";
import PresetManager from "../Menu/PresetManager/PresetManager";
import {getDefaultServerConfig, getDefaultServerConfigIndex, setServerTimeGap, setRangePropsToUrl, getHttpProtocol, errorHandler, getWithCredentials, setAuthHeader, getCurrentUser, setData} from '../../common/common';
import {
    addRequest,
    pushMessage,
    setTarget,
    clearAllMessage,
    setControlVisibility,
    setConfig,
    setFilterMap,
    addFilteredObject,
    removeFilteredObject,
    setBoxes,
    setLayouts,
    setBoxesLayouts
} from '../../actions';
import jQuery from "jquery";
import PaperControl from "../Paper/PaperControl/PaperControl";


class Controller extends Component {

    constructor(props) {
        super(props);
        this.state = {
            servers: [],
            activeServerId: null,
            objects: [],
            selectedObjects: {},
            filter: "",
            loading : false,
            selector: false,
            preset : false,
            filterOpened : false,
            currentTab : "CONTROL"
        };
    }

    componentDidMount() {
        if (getDefaultServerConfig(this.props.config).authentification !== "bearer") {
            this.setTargetFromUrl(this.props);
        } else {
            let defaultServerconfig = getDefaultServerConfig(this.props.config);
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

        if (nextProps.menu !== "/paper" && this.state.currentTab === "CONFIGURATION") {
            this.setState({
                currentTab : "CONTROL"
            });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.selector && prevState.selector !== this.state.selector) {
            if (!this.state.servers || this.state.servers.length < 1) {
                this.getServers(this.props.config);
            }
        }
    }

    toggleSelectorVisible = () => {
        this.setState({
            selector: !this.state.selector,
            preset : !this.state.selector ? false : this.state.selector
        });
    };

    closeSelectorPopup = () => {
        this.setState({
            selector: false,
            preset : false
        });
    };

    togglePresetManager = () => {
        this.setState({
            preset: !this.state.preset,
            selector : !this.state.preset ? false : this.state.preset
        });
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

        this.props.setTarget([], []);
        this.setState({
            servers: [],
            objects: [],
            activeServerId: null,
            selectedObjects: {},
            filter: ""
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
            setRangePropsToUrl(this.props, undefined, objects);
            this.closeSelectorPopup();
        }
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
                    activeServerId: serverId
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
            errorHandler(xhr, textStatus, errorThrown, that.props);
        });
    };


    applyPreset = (preset) => {
        let that = this;
        let props = this.props;

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
                                objects = objects
                                    .filter(instance => {
                                        return (instance.objName.match(new RegExp("/", "g")) || []).length < 3;
                                    });

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
                            errorHandler(xhr, textStatus, errorThrown, that.props);
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
            errorHandler(xhr, textStatus, errorThrown, that.props);
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
                        setServerTimeGap(Number(server.serverTime) - new Date().valueOf());
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
                            setServerTimeGap(Number(server.serverTime) - new Date().valueOf());

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
                                    objects = objects
                                        .filter(instance => {
                                            return (instance.objName.match(new RegExp("/", "g")) || []).length < 3;
                                        });

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
                                errorHandler(xhr, textStatus, errorThrown, that.props);
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
                errorHandler(xhr, textStatus, errorThrown, that.props);
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
            errorHandler(xhr, textStatus, errorThrown, that.props);
        }).always(() => {
            this.setState({
                loading : false
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

        this.setState({
            servers: servers,
            selectedObjects: selectedObjects
        });
    };

    quickSelectByTypeClick = (type) => {
        let filteredObjects;
        if (type === "all") {
            filteredObjects = this.state.objects.filter((object) => {
                return true;
            });
        } else {
            filteredObjects = this.state.objects.filter((object) => {
                return type === this.getIconOrObjectType(object);
            });
        }
        this.quickSelect(filteredObjects);
    };

    getIconOrObjectType = (instance) => {
        let objType = this.props.counterInfo.objTypesMap[instance.objType];
        let icon;
        if (objType) {
            icon = objType.icon ? objType.icon : instance.objType;
        }

        return icon;
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
            currentTab : tab
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
                            familyName : option.familyName
                        });
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

        /*
        this.setState({
            boxes: boxes
        });
        */
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
        /*
        this.setState({
            boxes: [],
            layouts: {},
            layoutChangeTime: (new Date()).getTime()
        });
        */
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

        let maxY = 0;
        let height = 0;
        for (let i = 0; i < boxes.length; i++) {
            if (maxY < boxes[i].layout.y) {
                maxY = boxes[i].layout.y;
                height = boxes[i].layout.h;
            }
        }

        boxes.push({
            key: key,
            title: "NO TITLE ",
            layout: {w: 6, h: 4, x: 0, y: (maxY + height), minW: 1, minH: 3, i: key}
        });


        this.props.setBoxes(boxes);
        /*
        this.setState({
            boxes: boxes
        });
        */

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
                                                            <div className="type-icon-wrapper" style={{color : iconInfo.color, backgroundColor : iconInfo.bgColor}}>
                                                                {iconInfo.fontFamily === "text" && <div className={"object-icon " + iconInfo.fontFamily}>{iconInfo.text}</div>}
                                                                {iconInfo.fontFamily !== "text" && <div className={"object-icon " + iconInfo.fontFamily + " " + iconInfo.text}></div>}
                                                            </div>
                                                        </div>
                                                        <div className="instance-text-info">
                                                            <div className="instance-name">{object.objName}</div>
                                                            <div className="instance-other"><span>{object.address}</span><span className="instance-objtype">{displayName}</span></div>
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
                    <div className="control-item paper-only">
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

                    <div className="control-item paper-only">
                        <div className="row desc">
                            <div className="step"><span>4</span></div>
                            <div className="row-message">CHANGE LAYOUT <div className="breakpoints" data-tip="CURRENT PAPER LAYER"><span className={"breakpoint " + (this.props.control.breakpoint === "lg" ? "selected" : "")}>Large</span><span className={"breakpoint " + (this.props.control.breakpoint === "md" ? "selected" : "")}>Small</span></div></div>
                        </div>
                        <div className="row control">
                            <div>
                                <LayoutManager visible={true}></LayoutManager>
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
                        <PaperControl addPaper={this.addPaper} addPaperAndAddMetric={this.addPaperAndAddMetric} clearLayout={this.clearLayout} fixedControl={this.state.fixedControl} toggleRangeControl={this.toggleRangeControl} realtime={this.props.range.realTime} alert={this.state.alert} clearAllAlert={this.clearAllAlert} clearOneAlert={this.clearOneAlert} setRewind={this.setRewind} showAlert={this.state.showAlert} toggleShowAlert={this.toggleShowAlert} />
                    </div>
                }
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
                                  onServerClick={this.onServerClick}
                                  instanceClick={this.instanceClick}
                                  setObjects={this.setObjects}
                                  visible={this.state.selector}
                                  toggleSelectorVisible={this.toggleSelectorVisible}
                                  togglePresetManager={this.togglePresetManager}
                                  closeSelectorPopup={this.closeSelectorPopup} />
                }

                {this.state.preset &&
                <PresetManager visible={this.state.preset}
                               togglePresetManager={this.togglePresetManager}
                               closeSelectorPopup={this.closeSelectorPopup}
                               toggleSelectorVisible={this.toggleSelectorVisible}
                               setObjects={this.setObjects}
                               applyPreset={this.applyPreset}/>
                }

            </article>
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
        boxes : state.paper.boxes,
        layouts : state.paper.layouts,
        layoutChangeTime : state.paper.layoutChangeTime,
        topologyOption: state.topologyOption
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
        setBoxesLayouts: (boxes, layouts) => dispatch(setBoxesLayouts(boxes, layouts))
    };
};

Controller = connect(mapStateToProps, mapDispatchToProps)(Controller);
export default withRouter(Controller);
