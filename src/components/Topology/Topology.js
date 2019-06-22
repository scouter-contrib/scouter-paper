import React, {Component} from "react";
import "./Topology.css";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import logo from "../../img/scouter.png";
import logoBlack from "../../img/scouter_black.png";
import {addRequest, pushMessage, setControlVisibility, setTopologyOption} from "../../actions";
import jQuery from "jquery";
import {errorHandler, getCurrentUser, getHttpProtocol, getWithCredentials, setAuthHeader} from "../../common/common";
import * as d3 from "d3";
import _ from "lodash";
import numeral from "numeral";
import OldVersion from "../OldVersion/OldVersion";

class Topology extends Component {

    serverCnt = 0;
    doneServerCnt = 0;

    nodes = [];
    topology = [];
    links = [];
    linked = {};
    objTypeNameMap = new Map();
    objCounterMap = new Map();

    preNodeCount = 0;

    polling = null;
    interval = 5000;
    completeInstanceList = false;
    resizeTimer = null;

    svg = null;
    width = 100;
    height = 100;
    r = 16;
    simulation = null;
    instances = {};

    option = {
        fontSize: 9
    };

    objCategoryInfo = {
        REDIS: {
            fontFamily: "technology-icons",
            fontSize: "18px",
            text: "\uf15c",
            color: "#a42122"
        },
        KAFKA: {
            fontFamily: "Glyphter",
            fontSize: "18px",
            text: "\u004a",
            color: "#000000"
        },
        RABBITMQ: {
            fontFamily: "Glyphter",
            fontSize: "18px",
            text: "\u0049",
            color: "#F55708"
        },
        DB: {
            fontFamily: "technology-icons",
            fontSize: "18px",
            text: "\uf117",
            color: "#1B3F8B"
        },
        javaee: {
            fontFamily: "technology-icons",
            fontSize: "18px",
            text: "\uf137",
            color: "#e76f00"
        },
        CLIENT: {
            fontFamily: "FontAwesome",
            fontSize: "18px",
            text: "\uF007",
            color: "#68b030"
        },
        EXTERNAL: {
            fontFamily: "FontAwesome",
            fontSize: "18px",
            text: "\uF0C1",
            color: "#6331ae"
        },
        NEO_DEFAULT: {
            fontFamily: "FontAwesome",
            fontSize: "18px",
            text: "\uF0C1",
            color: "#282828"
        }
    };

    objCountersCpuInfo = {
        IN_DANGER: {
            state: 'IN-DANGER',
            color: '#fc2527',
        },
        WARNING: {
            state: 'WARNING',
            color: '#ffd259'
        },
        DEFAULT: {
            state: 'DEFAULT',
            color: '#ffffff'
        }
    };


    componentDidMount() {
        if (!this.polling) {
            this.polling = setInterval(() => {
                this.getTopology(this.props.config, this.props.filterMap, this.props.user, this.props.topologyOption.grouping);
            }, this.interval);
        }

        this.getAllInstanceInfo(this.props.config);
        window.addEventListener("resize", this.resize);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.resize);
        if (this.polling) {
            clearInterval(this.polling);
            this.polling = null;
        }
    }

    componentWillReceiveProps(nextProps) {

        if (JSON.stringify(this.props.config) !== JSON.stringify(nextProps.config)) {
            this.getAllInstanceInfo(nextProps.config);
        }

        if (this.completeInstanceList && JSON.stringify(this.props.filterMap) !== JSON.stringify(nextProps.filterMap)) {
            this.getTopology(nextProps.config, nextProps.filterMap, nextProps.user, nextProps.topologyOption.grouping);
        }

        if (this.props.topologyOption.distance !== nextProps.topologyOption.distance) {
            this.simulation.force("link").distance([nextProps.topologyOption.distance]);
            this.simulation.alpha(1).restart();
        }

        if (this.props.topologyOption.zoom !== nextProps.topologyOption.zoom) {
            if (nextProps.topologyOption.zoom) {
                d3.select(this.refs.topologyChart).selectAll("svg").call(this.zoom.scaleExtent([0.2, 5]).on("zoom", this.zoomed));
            } else {
                d3.select(this.refs.topologyChart).selectAll("svg").call(this.zoom.scaleExtent([1, 1]).on("zoom", this.zoomed));
                this.svg.attr("transform", d3.zoomIdentity.scale(1));
            }
        }

        if (this.props.topologyOption.grouping !== nextProps.topologyOption.grouping) {
            this.getTopology(nextProps.config, nextProps.filterMap, nextProps.user, nextProps.topologyOption.grouping);
        }
        if(this.props.topologyOption.arcLine !== nextProps.topologyOption.arcLine){
            this.update(nextProps.topologyOption.pin, nextProps.topologyOption.tpsToLineSpeed, nextProps.topologyOption.speedLevel);
        }

        if (this.props.topologyOption.tpsToLineSpeed !== nextProps.topologyOption.tpsToLineSpeed) {
            this.update(nextProps.topologyOption.pin, nextProps.topologyOption.tpsToLineSpeed, nextProps.topologyOption.speedLevel);

        }

        if (this.props.topologyOption.speedLevel !== nextProps.topologyOption.speedLevel) {
            if (nextProps.topologyOption.tpsToLineSpeed) {
                this.update(nextProps.topologyOption.pin, nextProps.topologyOption.tpsToLineSpeed, nextProps.topologyOption.speedLevel);
            }
        }


        if (this.props.topologyOption.pin !== nextProps.topologyOption.pin) {
            if (!nextProps.topologyOption.pin) {
                this.node.each((d) => {
                    d.fixed = false;
                    d.fx = null;
                    d.fy = null;
                })
            } else {
                this.node.each((d) => {
                    d.fixed = true;
                    d.fx = d.x;
                    d.fy = d.y;
                });

                this.memorizeAll(this.node);
            }
        }

        if (this.props.topologyOption.redLine !== nextProps.topologyOption.redLine) {
            this.edgeFlowPath.attr("class", function (d) {
                if (nextProps.topologyOption.redLine) {
                    if (d.errorCount > 0) {
                        return 'edge-flow-path error';
                    } else {
                        return 'edge-flow-path';
                    }
                } else {
                    return 'edge-flow-path';
                }
            });
        }


    }


    resize = () => {

        if (this.resizeTimer) {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = null;
        }

        this.resizeTimer = setTimeout(() => {
            let wrapper = this.refs.topologyChart;
            if (wrapper) {
                this.width = wrapper.offsetWidth;
                this.height = wrapper.offsetHeight;
                if (this.svg) {
                    d3.select(this.refs.topologyChart).selectAll("svg").attr("width", this.width).attr("height", this.height);
                    this.svg.attr("width", this.width).attr("height", this.height);
                    this.simulation.force("center", d3.forceCenter(this.width / 2, this.height / 2));
                    this.update(this.props.topologyOption.pin);
                }
            }
        }, 1000);
    };


    getAllInstanceInfo = (config) => {
        let that = this;
        this.props.addRequest();

        this.setState({
            loading: true
        });

        jQuery.ajax({
            method: "GET",
            async: true,
            url: getHttpProtocol(config) + '/scouter/v1/info/server'
        }).done((msg) => {
            let servers = msg.result;
            this.instances = {};
            if (servers && servers.length > 0) {
                this.serverCnt = servers.length;
                this.doneServerCnt = 0;
                for (let i = 0; i < servers.length; i++) {
                    this.getInstanceList(servers[i].id);
                }
            }

        }).fail((xhr, textStatus, errorThrown) => {
            this.setState({
                servers: [],
                objects: []
            });
            errorHandler(xhr, textStatus, errorThrown, that.props, "getAllInstanceInfo", false);
        }).always(() => {
            this.setState({
                loading: false
            });
        });
    };

    getInstanceList = (serverId) => {
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
                const objects = msg.result;
                this.doneServerCnt++;
                if (objects && objects.length > 0) {
                    objects.forEach((o) => {
                        that.instances[Number(o.objHash)] = o;
                    });
                }

                if (this.doneServerCnt >= this.serverCnt) {
                    this.getTopology(this.props.config, this.props.filterMap, this.props.user, this.props.topologyOption.grouping);
                    this.completeInstanceList = true;
                }
            }
        }).fail((xhr, textStatus, errorThrown) => {
            errorHandler(xhr, textStatus, errorThrown, that.props, "getInstanceList", true);
        });
    };

    getObjectNameMerge = (category,name,grouping) => {
        if( !grouping || !category ) {
            return name;
        }
        let obj = this.objTypeNameMap.get(category);
        if( obj ){
            if( obj.filter(d => d === name).length === 0 ){
                obj.push(name);
            }
            this.objTypeNameMap.set(category,obj)
            return obj;
        }else{
            let _ret = [name];
            this.objTypeNameMap.set(category,_ret)
            return _ret;
        }

    };

    setObjectCounter = (data,name,grouping) =>{

        if( name && grouping ){
            const d = {
                tps :   data.count / data.period ,
                errorRate : data.errorCount / data.count * 100,
                avgElaps:   data.totalElapsed / data.count
            };
            let acc = this.objCounterMap.get(name)
            if( acc ){
                // let [_1,_2,_3,_4] = acc;
                // this.objCounterMap.set(name, [
                //     name,
                //     (_2 +=d.tps),
                //     (_3 +=d.errorRate),
                //     (_4 +=d.avgElaps)
                // ]);
            }else {
                //new
                this.objCounterMap.set(name, [
                    name,
                    d.tps,
                    d.errorRate,
                    d.avgElaps
                ]);
            }

        }
    }
    getUnknownObjectType = (data, position, grouping=false) => {
        let result = {};
        result["objType"] = null;
        result["objTypeName"] = null;
        result["category"] = null;
        switch (data.interactionType) {
            case "INTR_API_INCOMING" : {
                //result["objType"] = "API" + data[position + "ObjHash"];
                result["objType"] = "API-INCOMING-UNKNOWN";
                result["objTypeName"] = "API-INCOMING-UNKNOWN";

                if (position === "from") {
                    result["category"] = "API-INCOMING-UNKNOWN";
                }
                break;
            }

            case "INTR_API_OUTGOING" : {
                //result["objType"] = "API" + data[position + "ObjHash"];
                result["objType"] = "API-UNKNOWN";
                result["objTypeName"] = "API-UNKNOWN";

                if (position === "to") {
                    result["category"] = "API-UNKNOWN";
                }
                break;
            }

            case "INTR_NORMAL_INCOMING" : {
                result["objType"] = ["IN",this.instances[data.toObjHash].objType,"CLIENT"].join("-");
                result["objTypeName"] = "";

                if (position === "from") {
                    result["category"] = "CLIENT";
                }
                break;
            }

            case "INTR_NORMAL_OUTGOING" : {
                result["objType"] = ["OUT",this.instances[data.fromObjHash].objType,"NORMAL"].join("-");
                result["objTypeName"] = this.getObjectNameMerge(result["objType"],data[position + "ObjName"],grouping);

                if (position === "from") {

                } else {
                    this.setObjectCounter(data,[result["objType"],data[position + "ObjName"]].join('-'),grouping);
                    result["category"] = "EXTERNAL";
                }
                break;
            }
            case "INTR_REDIS_CALL" : {
                result["objType"] = ["OUT",this.instances[data.fromObjHash].objType,"REDIS"].join("-");
                const redisName = data[position + "ObjName"] || "-";
                result["objTypeName"] =  this.getObjectNameMerge(result["objType"],redisName.length > 1 ? redisName : "REDIS",grouping);
                if (position === "from") {

                } else {
                    this.setObjectCounter(data,[ result["objType"],redisName.length > 1 ? redisName : "REDIS" ].join('-'),grouping);
                    result["category"] = "REDIS";
                }
                break;
            }
            case "INTR_KAFKA_CALL" : {
                result["objType"] = "KAFKA" + data[position + "ObjHash"];
                const kafkaName = data[position + "ObjName"] || "-";
                result["objTypeName"] =  this.getObjectNameMerge(result["objType"],kafkaName.length > 1 ? kafkaName : "KFAKA",grouping);
                if (position === "from") {

                } else {
                    this.setObjectCounter(data,[ result["objType"],kafkaName.length > 1 ? kafkaName : "KFAKA" ].join('-'),grouping);
                    result["category"] = "KAFKA";
                }
                break;
            }
            case "INTR_RABBITMQ_CALL" : {
                result["objType"] = ["OUT",this.instances[data.fromObjHash].objType,"RABBITMQ"].join("-");
                const rabbitName = data[position + "ObjName"] || "-";
                result["objTypeName"] =  this.getObjectNameMerge(result["objType"],rabbitName.length > 1 ? rabbitName : "RABBITMQ",grouping);
                if (position === "from") {

                } else {
                    this.setObjectCounter(data,[ result["objType"],rabbitName.length > 1 ? rabbitName : "RABBITMQ" ].join('-'),grouping);
                    result["category"] = "RABBITMQ";
                }
                break;
            }
            case "INTR_DB_CALL" : {
                result["objType"] = ["OUT",this.instances[data.fromObjHash].objType,"DB"].join("-");
                result["objTypeName"] = this.getObjectNameMerge(result["objType"],data[position + "ObjName"],grouping);
                if (position === "from") {

                } else {
                    this.setObjectCounter(data,[ result["objType"],data[position + "ObjName"]].join('-'),grouping);
                    result["category"] = "DB";
                }
                break;
            }

            default : {
                result["objType"] = "UNKNOWN" + data[position + "ObjHash"];
                result["objTypeName"] = "UNKNOWN";
            }
        }
        return result;
    };

    getTopology = (config, filterMap, user, grouping) => {

        let that = this;
        let objects = Object.keys(filterMap);
        this.objTypeNameMap.clear();
        this.objCounterMap.clear();
        if (objects && objects.length > 0) {
            this.props.addRequest();
            jQuery.ajax({
                method: "GET",
                async: true,
                url: getHttpProtocol(config) + '/scouter/v1/interactionCounter/realTime?objHashes=' + JSON.stringify(objects.map((instance) => {
                    return Number(instance);
                })),
                xhrFields: getWithCredentials(config),
                beforeSend: function (xhr) {
                    setAuthHeader(xhr, config, getCurrentUser(config, user));
                }
            }).done((msg) => {
                let list = msg.result;
                if (list) {
                    let objectTypeTopologyMap = {};
                    let objToTypeMap = {};
                    if (grouping) {
                        list.forEach((d) => {

                            if (that.instances[Number(d.fromObjHash)] && that.instances[Number(d.fromObjHash)].objType) {
                                d.fromObjType = that.instances[d.fromObjHash].objType;
                                d.fromObjTypeName = that.instances[d.fromObjHash].objType;
                                d.fromObjTypeFamily = that.instances[d.fromObjHash].objFamily;
                                d.fromObjCategory = that.instances[d.fromObjHash].objFamily;
                                this.setObjectCounter(d,that.instances[Number(d.fromObjHash)].objName,grouping);
                            } else {
                                let typeInfo = that.getUnknownObjectType(d, "from",true);
                                d.fromObjType = typeInfo["objType"];
                                d.fromObjTypeName = typeInfo["objTypeName"];
                                d.fromObjTypeFamily = null;
                                d.fromObjCategory = typeInfo["category"];
                            }

                            d.fromObjCountersCpu = _.find(d.fromObjCounters, {name: 'Cpu'});

                            if (that.instances[Number(d.toObjHash)] && that.instances[Number(d.toObjHash)].objType) {
                                d.toObjType = that.instances[d.toObjHash].objType;
                                d.toObjTypeName = that.instances[d.toObjHash].objType;
                                d.toObjTypeFamily = that.instances[d.toObjHash].objFamily;
                                d.toObjCategory = that.instances[d.toObjHash].objFamily;
                                // this.setObjectCounter(d,that.instances[Number(d.toObjHash)].objName,grouping);
                            } else {
                                let typeInfo = that.getUnknownObjectType(d, "to",true);
                                d.toObjType = typeInfo["objType"];
                                d.toObjTypeName = typeInfo["objTypeName"];
                                d.toObjTypeFamily = null;
                                d.toObjCategory = typeInfo["category"];
                            }
                            d.toObjCountersCpu = _.find(d.toObjCounters, {name: 'Cpu'});

                            if (!objToTypeMap[d.fromObjHash]) objToTypeMap[d.fromObjHash] = {};
                            if (!objToTypeMap[d.toObjHash]) objToTypeMap[d.toObjHash] = {};
                            objToTypeMap[d.fromObjHash] = d.fromObjType;
                            objToTypeMap[d.toObjHash] = d.toObjType;



                            // console.log(dd.fromObjType,d.toObjType);
                            const topology_key = [d.fromObjType,"_",d.toObjType].join(""); //- from + to object type 별로 그룹핑 함
                            if (objectTypeTopologyMap[topology_key]) {
                                objectTypeTopologyMap[topology_key].count += Number(d.count);
                                objectTypeTopologyMap[topology_key].errorCount += Number(d.errorCount);
                                objectTypeTopologyMap[topology_key].totalElapsed += Number(d.totalElapsed);
                            } else {
                                objectTypeTopologyMap[topology_key] = {
                                    fromObjHash: d.fromObjType,
                                    fromObjName: d.fromObjTypeName,
                                    fromObjTypeFamily: d.fromObjTypeFamily,
                                    fromObjCategory: d.fromObjCategory,
                                    fromObjCountersCpu: d.fromObjCountersCpu,
                                    toObjHash: d.toObjType,
                                    toObjName: d.toObjTypeName,
                                    toObjTypeFamily: d.toObjTypeFamily,
                                    toObjCategory: d.toObjCategory,
                                    toObjCountersCpu: d.toObjCountersCpu,
                                    count: Number(d.count),
                                    errorCount: Number(d.errorCount),
                                    period: Number(d.period),
                                    totalElapsed: Number(d.totalElapsed),
                                };
                            }
                        });
                    } else {
                        list.forEach((d) => {
                            if (that.instances[Number(d.fromObjHash)] && that.instances[Number(d.fromObjHash)].objType) {
                                d.fromObjCategory = that.instances[d.fromObjHash].objFamily;
                            } else {
                                let typeInfo = that.getUnknownObjectType(d, "from");
                                d.fromObjType = typeInfo["objType"];
                                d.fromObjTypeName = typeInfo["objTypeName"];
                                d.fromObjTypeFamily = null;
                                d.fromObjCategory = typeInfo["category"];
                            }
                            d.fromObjCountersCpu = _.find(d.fromObjCounters, {name: 'Cpu'});

                            if (that.instances[Number(d.toObjHash)] && that.instances[Number(d.toObjHash)].objType) {
                                d.toObjCategory = that.instances[d.toObjHash].objFamily;
                            } else {
                                let typeInfo = that.getUnknownObjectType(d, "to");
                                d.toObjType = typeInfo["objType"];
                                d.toObjTypeName = typeInfo["objTypeName"];
                                d.toObjTypeFamily = null;
                                d.toObjCategory = typeInfo["category"];
                            }
                            d.toObjCountersCpu = _.find(d.toObjCounters, {name: 'Cpu'});
                            //- object hash 별로 개별 (from + to)
                            objectTypeTopologyMap[d.fromObjHash + "_" + d.toObjHash] = {
                                group: false,
                                fromObjHash: d.fromObjHash,
                                fromObjName: d.fromObjName,
                                fromObjTypeFamily: d.fromObjTypeFamily,
                                fromObjCategory: d.fromObjCategory,
                                fromObjCountersCpu: d.fromObjCountersCpu,
                                toObjHash: d.toObjHash,
                                toObjName: d.toObjName,
                                toObjTypeFamily: d.toObjTypeFamily,
                                toObjCategory: d.toObjCategory,
                                toObjCountersCpu: d.toObjCountersCpu,
                                count: Number(d.count),
                                errorCount: Number(d.errorCount),
                                period: Number(d.period),
                                totalElapsed: Number(d.totalElapsed)
                            };
                        });
                    }

                    let topology = [];
                    let outCount = 0;
                    // unknown link connect;
                    for (let attr in objectTypeTopologyMap) {
                        let obj = objectTypeTopologyMap[attr];
                        if (obj.fromObjHash === "0" || obj.fromObjHash === "") {
                            obj.fromObjHash = "OUTSIDE-" + (outCount++);
                            obj.fromObjName = "OUTSIDE";
                        }

                        if (obj.toObjHash === "0" || obj.toObjHash === "") {
                            obj.toObjHash = "OUTSIDE-" + (outCount++);
                            obj.toObjName = "OUTSIDE";
                        }
                        topology.push(obj);
                    }

                    let links = [];
                    _.forEach(topology, (obj) => {
                        links.push({
                            source: obj.fromObjHash,
                            target: obj.toObjHash,
                            count: obj.count,
                            errorCount: obj.errorCount,
                            interactionType: obj.interactionType,
                            period: obj.period,
                            totalElapsed: obj.totalElapsed
                        });
                    });
                    // from, to 정보에서 유일한 노드 정보 추출
                    let nodes = _.uniqBy(_.map(topology, (d) => {
                        return {
                            id: d.fromObjHash,
                            objName: d.fromObjName,
                            objCategory: d.fromObjCategory ? d.fromObjCategory : "",
                            objTypeFamily: d.fromObjTypeFamily ? d.fromObjTypeFamily : "",
                            objCountersCpu: d.fromObjCountersCpu ? d.fromObjCountersCpu.value : ""
                        }
                    }).concat(_.map(topology, (d) => {
                        return {
                            id: d.toObjHash,
                            objName: d.toObjName,
                            objCategory: d.toObjCategory ? d.toObjCategory : "",
                            objTypeFamily: d.toObjTypeFamily ? d.toObjTypeFamily : "",
                            objCountersCpu: d.toObjCountersCpu ? d.toObjCountersCpu.value : ""
                        }
                    })), (d) => {
                        return d.id;
                    });
                    //- node count calc
                    nodes.forEach((node) => {
                        node.grouping = grouping;
                        const nodeInstance = Object.values(objToTypeMap).filter((d) => d === node.objName);
                        if( grouping ) {
                            Object.values(this.instances).filter(d => node.id === d.objType).forEach(d => {
                                this.getObjectNameMerge(node.id, d.objName, grouping);
                            });
                        }
                        node.instanceCount = nodeInstance.length;
                    });

                    let linked = {};
                    //- linking 된 노드 체킹
                    links.forEach((d) => {
                        linked[`${d.source},${d.target}`] = true;
                    });

                    this.nodes = this.mergeNode(this.nodes, nodes);
                    this.topology = topology;
                    this.links = this.mergeLink(this.links, links);
                    this.linked = linked;

                    /*this.setState({
                     list: msg.result
                     });*/

                    this.setState({
                        lastUpdateTime: (new Date()).getTime()
                    });

                    this.props.setTopologyOption({
                        nodeCount: this.nodes.length,
                        linkCount: this.links.length
                    });

                    this.update(this.props.topologyOption.pin, this.props.topologyOption.tpsToLineSpeed, this.props.topologyOption.speedLevel);
                }

            }).fail((xhr, textStatus, errorThrown) => {
                errorHandler(xhr, textStatus, errorThrown, this.props, "getTopology", true);
            });
        } else {
            this.nodes = [];
            this.topology = [];
            this.links = [];
            this.linked = {};

            this.props.setTopologyOption({
                nodeCount: 0,
                linkCount: 0
            });

            this.update(this.props.topologyOption.pin);
        }
    };


    mergeLink = (currentLinks, newLinks) => {

        let linkMap = {};

        currentLinks.forEach((link) => {
            let id = "";
            if (typeof(link.source) === "object") {
                id = link.source.id + "_" + link.target.id;
            } else {
                id = link.source + "_" + link.target;
            }

            linkMap[id] = {
                update: false,
                link: link
            };
        });

        newLinks.forEach((link) => {
            let id = link.source + "_" + link.target;
            if (linkMap[id]) {
                linkMap[id].update = true;
                linkMap[id].link.count = link.count;
                linkMap[id].link.errorCount = link.errorCount;
                linkMap[id].link.interactionType = link.interactionType;
                linkMap[id].link.period = link.period;
                linkMap[id].link.totalElapsed = link.totalElapsed;
            } else {
                linkMap[id] = {
                    update: true,
                    link: link
                };
            }
        });

        for (let id in linkMap) {
            if (!linkMap[id].update) {
                delete linkMap[id];
            }
        }

        let mergedLink = [];

        for (let id in linkMap) {
            mergedLink.push(linkMap[id].link);
        }

        return mergedLink;
    };

    mergeNode = (currentNodes, newNodes) => {
        let nodeMap = {};

        currentNodes.forEach((node) => {
            nodeMap[node.id] = {
                update: false,
                node: node
            };
        });

        newNodes.forEach((node) => {
            if (nodeMap[node.id]) {
                nodeMap[node.id].update = true;
                nodeMap[node.id].node.objCategory = node.objCategory;
                nodeMap[node.id].node.objName = node.objName;
                nodeMap[node.id].node.objTypeFamily = node.objTypeFamily;
                nodeMap[node.id].node.objCountersCpu = node.objCountersCpu;
                nodeMap[node.id].node.instanceCount = node.instanceCount;
            } else {
                nodeMap[node.id] = {
                    update: true,
                    node: node
                };
            }
        });


        for (let id in nodeMap) {
            if (!nodeMap[id].update) {
                delete nodeMap[id];
            }
        }

        let mergedNode = [];

        for (let id in nodeMap) {
            mergedNode.push(nodeMap[id].node);
        }

        return mergedNode;
    };

    isConnected = (a, b) => {
        return this.linked[`${a},${b}`] || this.linked[`${b},${a}`];
    };

    dragStarted = (d) => {
        if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
        d3.event.sourceEvent.stopPropagation();
        d.fx = d.x;
        d.fy = d.y;
    };

    dragged = (d) => {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    };

    dragEnd = (d) => {
        if (!d3.event.active) this.simulation.alphaTarget(0);
        if (!d.fixed) {
            if (!this.props.topologyOption.pin) {
                d.fx = null;
                d.fy = null;
            }
        } else {
            //this.memorizeNode(d); // 성능은 1개씩 저장하는 것이 맞지만, 구 버전 클라이언트에서 이미 PIN되어 있는데 저장 정보가 없다면, PIN 토글 전까지 노드 한개 정보만 변경되고, 나머지는 떠다니게 되므로, 하위 호환성 측면에서 전체를 저장
            this.memorizeAll(this.node);
        }
    };

    getCategoryInfo = (category) => {
        if (category && this.objCategoryInfo[category]) {
            return this.objCategoryInfo[category];
        } else {
            return this.objCategoryInfo["NEO_DEFAULT"];
        }
    };

    getCountersCpuInfo = (cpu) => {
        cpu = Number(cpu);

        if (cpu >= 90) return this.objCountersCpuInfo['IN_DANGER'];
        else if (cpu >= 70) return this.objCountersCpuInfo['WARNING'];

        return this.objCountersCpuInfo['DEFAULT'];
    };

    makeEdge = (d) => {
        let x1 = d.source.x;
        let y1 = d.source.y;
        let x2 = d.target.x;
        let y2 = d.target.y;
        let dx = x2 - x1;
        let dy = y2 - y1;
        let dr = Math.sqrt(dx * dx + dy * dy);
        let drx = dr;
        let dry = dr;
        let xRotation = 0;
        let largeArc = 0;
        if (d.sweep === undefined) {
            d.sweep = true;
        }
        let sweep = d.sweep ? 1 : 0;
        if (x1 === x2 && y1 === y2) {
            xRotation = -45;
            largeArc = 1;
            drx = 30;
            dry = 30;
            x2 = x2 + 1;
            y2 = y2 + 1;
        }



        // self or grouping 이 아닌경우 엣지 생성
        if( !this.props.topologyOption.grouping || this.props.topologyOption.arcLine || d.source === d.target) {
            return ["M", x1, ",", y1, "A", drx, ",", dry, " ", xRotation, ",", largeArc, ",", sweep, " ", x2, ",", y2].join("");
        } else {
            return ["M", x1, ",", y1, "A", 0, ",", 0, " ", xRotation, ",", largeArc, ",", sweep, " ", x2, ",", y2].join("");
        }
    };

    zoomed = () => {
        this.svg.attr("transform", d3.event.transform);
    };

    nodeTypeHover = (d, o) => {
        if (o.id === d.id) {
            return 1.0;
        }

        const isConnectedValue = this.isConnected(o.id, d.id);
        if (isConnectedValue) {
            return 1.0;
        }
        return 0.4;
    };

    linkTypeHover = (d, o) => {
        if (d.id === o.source.id || d.id === o.target.id) {
            return 1;
        } else {
            return 0.5;
        }
    };
    _trimPrefix =(prefix,name) =>{
        return _.replace(name,prefix+"-","");
    };
    _showTooltip = (d, isShow=false) =>{

        if (this.props.topologyOption.highlight && this.props.topologyOption.grouping && (  d.objCategory && d.objCategory !== "CLIENT" ) ) {
            const isLocationMove = this.props.control.Controller === "max" && this.props.control.pin;
            const toolTipOffsetX=  isLocationMove ? -380 : -20;
            const toolTipOffsetY=  -70;

            let dpObjName = [];

            if( d.objTypeFamily === "javaee" ){
                dpObjName = this.objTypeNameMap.get(d.objName);
            }else{
                dpObjName = this.objTypeNameMap.get(d.id);
            }
            this.tooltip.transition(500).style("opacity", 1);
            this.tooltip.html(
                //- tooltip value 값을 응답 시간을 최대 시간 기준으로 최대 10개로 제한 한다.
                _(( Array.isArray(dpObjName) ? dpObjName : [dpObjName] ).map(dp=> {
                    let counter  = [dp,0,0,0];
                    if( d.objTypeFamily === "javaee" ){
                        counter = this.objCounterMap.get(dp);
                    }else{
                        counter = this.objCounterMap.get([d.id,dp].join('-'));
                    }
                    return counter;
                }).filter(v => v ? true : false ).sort((a,b)=> b[3]-a[3] ))
                    .take(10)
                    .values()
                    .map( cnt  => {

                            const [name, tps, errorRate, avgElasp] = cnt;
                            return `<div class="tooltip-group">
                                         <p>${this._trimPrefix(d.id,name)}</p>
                                    <div class="tooltip-counter">
                                         <tspan>${numeral(tps).format(this.props.config.numberFormat)} r/s</tspan>
                                         <tspan style="color:red">${numeral(errorRate).format(this.props.config.numberFormat)}%</tspan>
                                         <tspan>${numeral(avgElasp).format(this.props.config.numberFormat)}ms</tspan>
                                     </div>
                            </div>`;


                    })
                .join(' ')
            )
            .style("left",[d3.event.pageX + toolTipOffsetX,"px"].join(''))
            .style("top",[d3.event.pageY + toolTipOffsetY,"px"].join(''));
        }

        if(!isShow){
            if (this.props.topologyOption.grouping) {
                this.tooltip.transition(500).style("opacity", 0);
            }
        }
    };

    hover = (d,isIcon=false) => {

        if (this.props.topologyOption.highlight) {
            this.node.transition(500).style('opacity', o => {
                return this.nodeTypeHover(d, o);
            });

            this.nodeNameText.transition(500).style('opacity', o => {
                return this.nodeTypeHover(d, o);
            });

            this.nodeInstanceCountText.transition(500).style('opacity', o => {
                return this.nodeTypeHover(d, o);
            });

            this.nodeLabel.transition(500).style('opacity', o => {
                return this.nodeTypeHover(d, o);
            });

            this.edgeTextList.transition(500).style('opacity', o => {
                return this.linkTypeHover(d, o);
            });

            this.edgeFlowPath.transition(500).style('stroke-opacity', o => {
                return this.linkTypeHover(d, o);
            });


        }


    };

    leave = (d) => {
        if (this.props.topologyOption.highlight) {
            this.node.transition(500).style('opacity', 1.0);
            this.nodeNameText.transition(500).style('opacity', 1.0);
            this.nodeInstanceCountText.transition(500).style('opacity', 1.0);
            this.nodeLabel.transition(500).style('opacity', 1.0);
            this.edgeTextList.transition(500).style('opacity', 1);
            this.edgeFlowPath.transition(500).style('stroke-opacity', 0.5);

        }

    };

    getStepCountByTps = (tps, tpsMode) => {

        if (tpsMode === "slow") {
            return Math.round(150 * (tps ** (-0.421)));

        } else if (tpsMode === "medium") {
            return Math.round(71 * (tps ** (-0.452)));

        } else if (tpsMode === "fast") {
            return Math.round(55 * (tps ** (-0.529)));

        } else {
            return Math.round(55 * (tps ** (-0.529)));
        }
    };

    styleAnimateEdge = (d, edge, tpsToLineSpeed, speedLevel) => {
        if (tpsToLineSpeed) {
            const tps = (d.count / d.period);
            let step = this.getStepCountByTps(tps, speedLevel || this.props.topologyOption.speedLevel);
            if (step < 4) step = 4;
            if (step > 250) step = 250;
            let flow = step / 20;

            if (!speedLevel && edge.prevTps && tps < edge.prevTps * 1.35 && tps > edge.prevTps * 0.8) {
                return edge.prevStyle;

            } else {
                edge.prevStepCount = step;
                edge.prevTps = tps;
                edge.prevStyle = `flow ${flow}s infinite steps(${step})`;

                return edge.prevStyle;
            }
        } else {
            return "flow 0s infinite steps(20)";
        }
    };

    memorizeAll = (nodes) => {
        let storageTopologyPosition = localStorage.getItem("topologyPosition");
        let topologyPosition = {};

        if (storageTopologyPosition) {
            topologyPosition = JSON.parse(storageTopologyPosition);
        }

        nodes.each((d) => {
            topologyPosition[d.id] = {
                x: d.x,
                y: d.y
            }
        });

        localStorage.setItem("topologyPosition", JSON.stringify(topologyPosition));
    };

    memorizeNode = (node) => {
        let storageTopologyPosition = localStorage.getItem("topologyPosition");
        let topologyPosition = {};

        if (storageTopologyPosition) {
            topologyPosition = JSON.parse(storageTopologyPosition);
        }

        topologyPosition[node.id] = {
            x: node.x,
            y: node.y
        };

        localStorage.setItem("topologyPosition", JSON.stringify(topologyPosition));

    };

    getNodePosition = () => {
        let storageTopologyPosition = localStorage.getItem("topologyPosition");
        let topologyPosition = {};

        if (storageTopologyPosition) {
            topologyPosition = JSON.parse(storageTopologyPosition);
        }

        return topologyPosition;
    };

    getX = (d) => {
        return Number(localStorage.getItem(d.id + "-x"));
    };

    getY = (d) => {
        return Number(localStorage.getItem(d.id + "-y"));
    };

    linkKey=(d) =>{
        if (typeof(d.source) === "object") {
            return d.source.id + "-" + d.target.id;
        } else {
            return d.source + "-" + d.target;
        }
    };

    update = (pin, tpsToLineSpeed, speedLevel) => {
        let that = this;

        let wrapper = this.refs.topologyChart;
        this.width = wrapper.offsetWidth;
        this.height = wrapper.offsetHeight;

        let nodes = this.nodes;
        let links = this.links;

        if (!this.svg) {
            this.svg = d3.select(this.refs.topologyChart).append("svg").attr("width", this.width).attr("height", this.height).append("g");
            //- allow adding
            this.svg
                .append("defs")
                .append("marker")
                .attr("class", "arrowhead")
                .attr("id", "arrowhead")
                .attr("viewBox", "-0 -5 10 10")
                .attr("refX", "20")
                .attr("refY", "0")
                .attr("orient", "auto")
                .attr("markerWidth", "3")
                .attr("markerHeight", "3")
                .attr("xoverflow", "visible")
                .attr("opacity", .7)
                .append("path")
                .attr("d", "M 0,-5 L 10, 0 L 0, 5")
                .style("fill", 'white');




            this.edgePathGroup = this.svg.append("g").attr("class", "edge-path-group");
            this.edgeTextGroup = this.svg.append("g").attr("class", "edge-text-group");
            this.edgeFlowPathGroup = this.svg.append("g").attr("class", "edge-flow-path-group");
            this.nodeNameTextGroup = this.svg.append("g").attr("class", "node-name-text-group");
            this.nodeInstanceCountTextGroup = this.svg.append("g").attr("class", "node-instance-count-text-group");
            this.nodeGroup = this.svg.append("g").attr("class", "node-group");
            this.nodeLabelGroup = this.svg.append("g").attr("class", "node-labels");
            this.nodeIconGroup = this.svg.append("g").attr("class", "node-icon-group");

            this.zoom = d3.zoom().on("zoom", this.zoomed);
            if (this.props.topologyOption.zoom) {
                d3.select(this.refs.topologyChart).selectAll("svg").call(this.zoom.scaleExtent([0.2, 5]));
            } else {
                d3.select(this.refs.topologyChart).selectAll("svg").call(this.zoom.scaleExtent([1, 1]));
            }

            this.simulation = d3.forceSimulation();
            this.simulation.force("link", d3.forceLink().id(function (d) {
                return d.id;
            }));
            this.simulation.force('charge', d3.forceManyBody().strength([-10]));
            this.simulation.force("center", d3.forceCenter(this.width / 2, this.height / 2));
            this.simulation.force("collide", d3.forceCollide(30));
            this.simulation.nodes(nodes).on("tick", this.ticked);
            this.simulation.force("link").links(links).distance([this.props.topologyOption.distance]);

            this.tooltip = d3.select(".topology-chart")
                .append("div")
                .attr("class", "tooltip")
                .style("z-index",999)
                .style("opacity", 0);
        }

        // 노드에 표시되는 텍스트
        this.edgePathList = this.edgePathGroup.selectAll(".edge-path").data(links);
        this.edgePathList.exit().remove();
        this.edgePathList = this.edgePathList.enter().append('path').merge(this.edgePathList).attr('class', 'edge-path').attr('id', function (d, i) {
            if (typeof(d.source) === "object") {
                return 'edgePath' + d.source.id + "_" + d.target.id;
            } else {
                return 'edgePath' + d.source + "_" + d.target;
            }
        }).style("pointer-events", "none");

        this.edgeTextList = this.edgeTextGroup.selectAll(".edge-text").data(links);
        this.edgeTextList.exit().remove();
        this.edgeTextList = this.edgeTextList.enter().append('text').merge(this.edgeTextList).style("pointer-events", "none").attr('class', 'edge-text')
            .attr('dy', this.calcEdgeTextDy)
            .attr('id', (d, i) => 'edgeLabel' + i);

        this.edgeTextList.selectAll("textPath").remove();

        this.edgeTextPath = this.edgeTextList.append('textPath').attr('xlink:href', function (d, i) {
            if (typeof(d.source) === "object") {
                return '#edgePath' + d.source.id + "_" + d.target.id;
            } else {
                return '#edgePath' + d.source + "_" + d.target;
            }
        }).style("text-anchor", "middle").style("pointer-events", "all").attr("startOffset", "50%").attr('class', 'edge-text-path');

        this.edgeTextPath.append("tspan").attr('class', 'tps-tspan').text(function (d) {
            let tps = numeral(d.count / d.period).format(that.props.config.numberFormat);
            return tps + "r/s ";
        });

        this.edgeTextPath.append("tspan").attr('class', 'error-rate-tspan').text(function (d) {
            let errorRate = numeral((d.errorCount / d.count) * 100).format(that.props.config.numberFormat);
            return errorRate + "% ";
        });

        this.edgeTextPath.append("tspan").attr('class', 'avg-elapsed-tspan').text(function (d) {
            let avgElapsedTime = numeral(d.totalElapsed / d.count).format(that.props.config.numberFormat);
            return avgElapsedTime + "ms";
        });

        // 노드간의 연결 선
        this.edgeFlowPath = this.edgeFlowPathGroup.selectAll(".edge-flow-path").data(links);
        this.edgeFlowPath.exit().remove();
        this.edgeFlowPath = this.edgeFlowPath.enter().append('path').merge(this.edgeFlowPath).attr('class', function (d) {
            if (that.props.topologyOption.redLine) {
                if (d.errorCount > 0) {
                    return 'edge-flow-path error';
                } else {
                    return 'edge-flow-path';
                }
            } else {
                return 'edge-flow-path';
            }
        }).attr('id', function (d, i) {
            return 'edgeFlowPath' + i
        })
        .style("pointer-events", "none")
        .style("animation", function (d) {
            return that.styleAnimateEdge(d, this, tpsToLineSpeed, speedLevel);
        });

        this.edgeFlowPath.style("pointer-events", "auto");
        //- arc
        if( this.props.topologyOption.grouping ) {

            this.edgeFlowPath.attr("marker-end", (d, i) => {
                if(this.props.topologyOption.arcLine) {
                    return "url(#arrowhead-unknown)";
                }
                if (typeof(d.source) === "object") {
                    if (d.source.id === d.target.id) {
                        return `url(#arrowhead-${d.source.id})`;
                    }
                } else {
                    if (d.source === d.target) {
                        return `url(#arrowhead-${d.source})`;
                    }
                }
                return "url(#arrowhead)";

            });
        }

        this.edgeFlowPath.on("click", that.edgeClicked);



        // 노드 아래에 표시되는 명칭
        this.nodeNameText = this.nodeNameTextGroup.selectAll(".node-name").data(nodes)
        this.nodeNameText.exit().remove();

        this.nodeNameText = this.nodeNameText.enter()
            .append("text")
            .merge(this.nodeNameText)
            .attr("class", "node-name")
            .style("font-size", (this.option.fontSize + 1) + "px")
            .style("font-weight", (d) => d.objTypeFamily === "javaee" ? "bold" : "normal")
            .style("fill", (d) => d.objTypeFamily === "javaee" ? "#ffd600" : "white")
            .text(d =>{
                if( !this.props.topologyOption.grouping ) {
                    return d.objName;
                }
                if( d.objCategory === "CLIENT"){
                    return;
                }
                if( d.objTypeFamily !== "javaee" ){
                    if( Array.isArray(d.objName) ){
                        return [d.objName.length, "target(s)"].join(" ");
                    }
                }else{
                    return d.objName;
                }

            });
        // 노드의 인스턴수 수
        this.nodeInstanceCountText = this.nodeInstanceCountTextGroup.selectAll(".node-inst-count").data(nodes);
        this.nodeInstanceCountText.exit().remove();
        this.nodeInstanceCountText = this.nodeInstanceCountText.enter().append("text").merge(this.nodeInstanceCountText).attr("class", "node-inst-count")
            .style("font-size", this.option.fontSize + "px")
            .style("fill", "#81f33b")
            .text((d) => d.grouping && d.instanceCount > 0 ? d.instanceCount + " instances" : "");

        // 노드
        this.node = this.nodeGroup.selectAll(".node").data(nodes);
        this.node.exit().remove();
        this.node = this.node.enter().append("circle").merge(this.node).attr("r", this.r).style("stroke-width", "4px")
            .attr('class', (d) => 'node cpu-' + that.getCountersCpuInfo(d.objCountersCpu).state)
            .style("fill", (d) => that.getCountersCpuInfo(d.objCountersCpu).color)
            .style("stroke", (d) => that.getCategoryInfo(d.objCategory).color);

        this.node.call(d3.drag().on("start", this.dragStarted).on("drag", this.dragged).on("end", this.dragEnd));
        // this.node.on("mouseover", (d) => that.hover(d));
        // this.node.on("mouseout", (d) => that.leave(d));

        //- node 부분과, node Icon 부분의 이벤트 경합으로 인한 부하 발생, 노드 ICON으로 이벤트 기반으로 단일화
        // 노드 라벨
        this.nodeLabel = this.nodeLabelGroup.selectAll(".node-label").data(nodes);
        this.nodeLabel.exit().remove();
        this.nodeLabel = this.nodeLabel.enter().append("text").merge(this.nodeLabel).attr("class", "node-label").style("font-size", this.option.fontSize + "px");
        this.nodeLabel.text(function (d) {
            return (d.objTypeFamily ? d.objTypeFamily : d.objCategory).toUpperCase();
        }).style("fill", function (d) {
            return that.getCategoryInfo(d.objCategory).color;
        });

        // 노드 아이콘
        this.nodeIcon = this.nodeIconGroup.selectAll(".node-icon").data(nodes);
        this.nodeIcon.exit().remove();
        this.nodeIcon = this.nodeIcon.enter().append("text").merge(this.nodeIcon);
        this.nodeIcon.attr("class", "node-icon").style("font-family", function (d) {
            return that.getCategoryInfo(d.objCategory).fontFamily;
        }).style("font-size", function (d) {
            return that.getCategoryInfo(d.objCategory).fontSize;
        }).style("fill", function (d) {
            return that.getCategoryInfo(d.objCategory).color;
        }).text(function (d) {
            return that.getCategoryInfo(d.objCategory).text;
        }).call(d3.drag().on("start", this.dragStarted).on("drag", this.dragged).on("end", this.dragEnd));
        this.nodeIcon.on("mouseover", (d) => this.hover(d));
        this.nodeIcon.on("mouseout", (d) => this.leave(d));
        this.nodeIcon.on("mouseover.tooltip", (d) =>{
            this._showTooltip(d,true);
        });
        this.nodeIcon.on("mouseleave.tooltip", (d) =>{
            this._showTooltip(d,false);
        });



        this.simulation.nodes(nodes).on("tick", this.ticked);
        this.simulation.force("link").links(links);

        if (this.nodes && this.preNodeCount !== this.nodes.length) {
            this.simulation.stop();
            for (var i = 0, n = Math.ceil(Math.log(this.simulation.alphaMin()) / Math.log(1 - this.simulation.alphaDecay())); i < n; ++i) {
                this.simulation.tick();
            }
            this.simulation.alpha(1).restart();
        } else {
            this.simulation.restart();
        }

        if (pin) {
            let topologyPosition = this.getNodePosition();
            this.node.each((d) => {

                let pos = topologyPosition[d.id];
                if (pos) {
                    d.fixed = true;
                    d.fx = topologyPosition[d.id].x;
                    d.fy = topologyPosition[d.id].y;
                } else {
                    d.fixed = true;
                    d.fx = null;
                    d.fy = null;
                }

            });
        }
        this.preNodeCount = nodes.length;
    };

    edgeClicked = (d, x, y, z) => {
        d.sweep = !d.sweep;
        this.edgePathList.attr('d', this.makeEdge);
        this.edgeFlowPath.attr('d', this.makeEdge);
        this.edgeTextList.attr('dy', this.calcEdgeTextDy);
    };

    calcEdgeTextDy = (d) => {
        if (d.sweep === undefined) {
            d.sweep = true;
        }
        if (!d.sweep) {
            return 15;
        } else {
            return -10;
        }
    };

    ticked = () => {
        let that = this;
        // 노드 위치
        this.node.attr("cx", function (d) {
            return d.x;

        }).attr("cy", function (d) {
            return d.y;
        });


        // // 노드 명 아래 가운데 위치 하도록
        this.nodeNameText.attr("x", function (d) {
            const width = this.getComputedTextLength();
            return d.x - (width / 2);
        }).attr("y", function (d) {
            return d.y + that.r + (that.option.fontSize / 2) + 6;
        });

        this.nodeInstanceCountText.attr("x", function (d) {
            const width = this.getComputedTextLength();
            return d.x - (width / 2);
        }).attr("y", function (d) {
            return d.y + that.r + (that.option.fontSize / 2) + 17;
        });

        // 노드 타입 명칭 상단 가운데 위치 하도록
        this.nodeLabel.attr("x", function (d) {
            let width = this.getComputedTextLength();
            return d.x - (width / 2);
        }).attr("y", function (d) {
            return d.y + (that.option.fontSize / 2) - 24;
        });

        // 노드 타입 명칭 상단 가운데 위치 하도록
        this.nodeIcon.attr("x", function (d) {
            let width = this.getComputedTextLength();
            return d.x - (width / 2);
        }).attr("y", function (d) {
            return d.y + that.option.fontSize / 2 + 3;
        });

        // 에지 선
        this.edgePathList.attr('d', that.makeEdge);
        this.edgeFlowPath.attr('d', that.makeEdge);
    };

    render() {
        return (
            <div className="topology-wrapper">
                {!this.props.supported.supported && <OldVersion />}
                {this.props.supported.supported &&
                <div>
                    {(!this.topology || this.topology.length < 1) &&
                    <div className="no-topology-data">
                        <div>
                            <div className="logo-div"><img alt="scouter-logo" className="logo" src={this.props.config.theme === "theme-gray" ? logoBlack : logo}/></div>
                            <div>NO TOPOLOGY DATA</div>
                        </div>
                    </div>
                    }
                    <div className="topology-chart" ref="topologyChart"></div>
                </div>}
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        control: state.control,
        objects: state.target.objects,
        selection: state.target.selection,
        config: state.config,
        user: state.user,
        template: state.template,
        range: state.range,
        counterInfo: state.counterInfo,
        supported: state.supported,
        filterMap: state.target.filterMap,
        topologyOption: state.topologyOption
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        addRequest: () => dispatch(addRequest()),
        pushMessage: (category, title, content) => dispatch(pushMessage(category, title, content)),
        setControlVisibility: (name, value) => dispatch(setControlVisibility(name, value)),
        setTopologyOption: (topologyOption) => dispatch(setTopologyOption(topologyOption))
    };
};

Topology = connect(mapStateToProps, mapDispatchToProps)(Topology);
export default withRouter(Topology);
