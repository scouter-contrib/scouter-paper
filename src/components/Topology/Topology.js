import React, {Component} from "react";
import "./Topology.css";
import {connect} from "react-redux";
import {withRouter} from 'react-router-dom';
import {
    addRequest,
    pushMessage,
    setControlVisibility,
    setRealTime,
    setRealTimeValue,
    setRangeDate,
    setRangeHours,
    setRangeMinutes,
    setRangeValue,
    setRangeDateHoursMinutes,
    setRangeDateHoursMinutesValue,
    setRangeAll,
    setTemplate
} from "../../actions";
import jQuery from "jquery";
import {
    errorHandler,
    getData,
    getHttpProtocol,
    getWithCredentials,
    setAuthHeader,
    setData,
    getSearchDays,
    getDivideDays,
    getCurrentUser
} from "../../common/common";
import * as d3 from "d3";
import _ from "lodash";
import numeral from "numeral";

class Topology extends Component {

    dragChanged = false;
    lastTicked = 0;

    polling = null;
    interval = 5000;
    init = false;

    svg = null;
    width = 100;
    height = 100;
    lineColor = "white";
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

    serverCnt = 0;
    doneServerCnt = 0;

    constructor(props) {
        super(props);

        this.state = {
            list: [],
            topology: [],
            nodes : [],
            links : [],

            zoom : false,
            pin : false,
            redLine : false,
            distance : 300
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!this.polling) {
            this.polling = setInterval(() => {
                this.getTopology(nextProps.config, nextProps.objects, nextProps.user);
            }, this.interval);
        }

        if (JSON.stringify(this.props.config) !== JSON.stringify(nextProps.config)) {
            this.getAllInstanceInfo(nextProps.config);
        }
    }

    resizeTimer = null;
    resize = () => {

        if (this.resizeTimer) {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = null;
        }

        this.resizeTimer = setTimeout(() => {
            let wrapper = this.refs.topologyChart;
            this.width = wrapper.offsetWidth;
            this.height = wrapper.offsetHeight;
            if (this.svg) {
                this.svg.attr("width", this.width).attr("height", this.height);
            }
        }, 1000);


    };

    componentDidMount() {
        if (!this.polling) {
            this.polling = setInterval(() => {
                this.getTopology(this.props.config, this.props.objects, this.props.user);
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

    componentDidUpdate(prevProps, prevState) {
        if (!this.init && this.state.topology.length > 0) {
            this.draw();
            this.init = true;
        }

        if (this.init && JSON.stringify(this.state.topology) !== JSON.stringify(prevState.topology)) {
            this.update();
        }
    }

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
            errorHandler(xhr, textStatus, errorThrown, that.props);
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
                    this.getTopology(this.props.config, this.props.objects, this.props.user);
                }
            }
        }).fail((xhr, textStatus, errorThrown) => {
            errorHandler(xhr, textStatus, errorThrown, that.props);
        });
    };


    getUnknownObjectType = (data, position) => {
        let result = {};
        result["objType"] = null;
        result["objTypeName"] = null;
        result["category"] = null;

        switch (data.interactionType) {
            case "INTR_API_INCOMING" : {
                result["objType"] = "API" + data[position + "ObjHash"];
                result["objTypeName"] = "API";
                break;
            }

            case "INTR_API_OUTGOING" : {
                result["objType"] = "API" + data[position + "ObjHash"];
                result["objTypeName"] = "API";
                break;
            }

            case "INTR_NORMAL_INCOMING" : {
                result["objType"] = "NORMAL" + data[position + "ObjHash"];
                result["objTypeName"] = "NORMAL";
                if (position === "from") {
                    result["category"] = "CLIENT";
                }
                break;
            }

            case "INTR_NORMAL_OUTGOING" : {
                result["objType"] = "NORMAL" + data[position + "ObjHash"];
                result["objTypeName"] = data[position + "ObjName"];
                if (position === "from") {

                } else {
                    result["category"] = "EXTERNAL";
                }
                break;
            }
            case "INTR_REDIS_CALL" : {
                result["objType"] = "REDIS" + data[position + "ObjHash"];
                result["objTypeName"] = "REDIS";
                if (position === "from") {

                } else {
                    result["category"] = "REDIS";
                }
                break;
            }

            case "INTR_DB_CALL" : {
                result["objType"] = "DB" + data[position + "ObjHash"];
                result["objTypeName"] = data[position + "ObjName"];
                if (position === "from") {

                } else {
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

    getTopology = (config, objects, user) => {
        let that = this;

        if (objects && objects.length > 0) {
            this.props.addRequest();
            jQuery.ajax({
                method: "GET",
                async: true,
                url: getHttpProtocol(config) + '/scouter/v1/interactionCounter/realTime?objHashes=' + JSON.stringify(objects.map((instance) => {
                    return Number(instance.objHash);
                })),
                xhrFields: getWithCredentials(config),
                beforeSend: function (xhr) {
                    setAuthHeader(xhr, config, getCurrentUser(config, user));
                }
            }).done((msg) => {

                let list = msg.result;

                if (list && list.length > 0) {
                    let objectTypeTopologyMap = {};
                    let cnt = 0;
                    list.forEach((d) => {
                        if (that.instances[Number(d.fromObjHash)] && that.instances[Number(d.fromObjHash)].objType) {
                            d.fromObjType = that.instances[d.fromObjHash].objType;
                            d.fromObjTypeName = that.instances[d.fromObjHash].objType;
                            d.fromObjTypeFamily = that.instances[d.fromObjHash].objFamily;
                            d.fromObjCategory = that.instances[d.fromObjHash].objFamily;
                        } else {
                            let typeInfo = that.getUnknownObjectType(d, "from");
                            d.fromObjType = typeInfo["objType"];
                            d.fromObjTypeName = typeInfo["objTypeName"];
                            d.fromObjTypeFamily = null;
                            d.fromObjCategory = typeInfo["category"];
                        }

                        if (that.instances[Number(d.toObjHash)] && that.instances[Number(d.toObjHash)].objType) {
                            d.toObjType = that.instances[d.toObjHash].objType;
                            d.toObjTypeName = that.instances[d.toObjHash].objType;
                            d.toObjTypeFamily = that.instances[d.toObjHash].objFamily;
                            d.toObjCategory = that.instances[d.toObjHash].objFamily;
                        } else {
                            let typeInfo = that.getUnknownObjectType(d, "to");
                            d.toObjType = typeInfo["objType"];
                            d.toObjTypeName = typeInfo["objTypeName"];
                            d.toObjTypeFamily = null;
                            d.toObjCategory = typeInfo["category"];
                        }

                        if (objectTypeTopologyMap[d.fromObjType + "_" + d.toObjType]) {
                            cnt++;
                            objectTypeTopologyMap[d.fromObjType + "_" + d.toObjType].count += Number(d.count);
                            objectTypeTopologyMap[d.fromObjType + "_" + d.toObjType].errorCount += Number(d.errorCount);
                            objectTypeTopologyMap[d.fromObjType + "_" + d.toObjType].totalElapsed += Number(d.totalElapsed);
                        } else {
                            cnt++;
                            objectTypeTopologyMap[d.fromObjType + "_" + d.toObjType] = {
                                fromObjHash: d.fromObjType,
                                fromObjName: d.fromObjTypeName,
                                fromObjTypeFamily: d.fromObjTypeFamily,
                                fromObjCategory: d.fromObjCategory,
                                toObjHash: d.toObjType,
                                toObjName: d.toObjTypeName,
                                toObjTypeFamily: d.toObjTypeFamily,
                                toObjCategory: d.toObjCategory,
                                count: Number(d.count),
                                errorCount: Number(d.errorCount),
                                period: Number(d.period),
                                totalElapsed: Number(d.totalElapsed)
                            };
                        }
                    });

                    let topology = [];
                    let outCount = 0;
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
                            objCategory: d.fromObjCategory,
                            objTypeFamily: d.fromObjTypeFamily
                        }
                    }).concat(_.map(topology, (d) => {
                        return {
                            id: d.toObjHash,
                            objName: d.toObjName,
                            objCategory: d.toObjCategory,
                            objTypeFamily: d.toObjTypeFamily
                        }
                    })), (d) => {
                        return d.id;
                    });

                    this.setState({
                        list: msg.result,
                        topology: topology,
                        nodes : this.mergeNode(this.state.nodes, nodes),
                        links : this.mergeLink(this.state.links, links)
                    });
                }

            }).fail((xhr, textStatus, errorThrown) => {
                errorHandler(xhr, textStatus, errorThrown, this.props);
            });
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
                update : false,
                link : link
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
                    update : true,
                    link : link
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
                update : false,
                node : node
            };
        });



        newNodes.forEach((node) => {
            if (nodeMap[node.id]) {
                nodeMap[node.id].update = true;
                nodeMap[node.id].node.objCategory = node.objCategory;
                nodeMap[node.id].node.objName = node.objName;
                nodeMap[node.id].node.objTypeFamily = node.objTypeFamily;
            } else {
                nodeMap[node.id] = {
                    update : true,
                    node : node
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

    dragstarted = (d) => {
        if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
        d3.event.sourceEvent.stopPropagation();
        d.fx = d.x;
        d.fy = d.y;
        this.dragChanged = true;
    };

    dragged = (d) => {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    };

    dblclick = (d) => {
        if (d.fixed) {
            d.fixed = false;
            d.fx = null;
            d.fy = null;
        } else {
            d.fixed = true;
        }
    };

    dragended = (d) => {
        if (!d3.event.active) this.simulation.alphaTarget(0);
        if (!d.fixed) {
            if (!this.state.pin) {
                d.fx = null;
                d.fy = null;
            }
        }
        this.dragChanged = false;
    };

    getCatgegoryInfo = (category) => {
        if (this.objCategoryInfo[category]) {
            return this.objCategoryInfo[category];
        } else {
            this.objCategoryInfo["NEO_DEFAULT"];
        }
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
        let sweep = 1;

        if (x1 === x2 && y1 === y2) {
            xRotation = -45;
            largeArc = 1;
            drx = 30;
            dry = 30;
            x2 = x2 + 1;
            y2 = y2 + 1;
        }

        return "M" + x1 + "," + y1 + "A" + drx + "," + dry + " " + xRotation + "," + largeArc + "," + sweep + " " + x2 + "," + y2;
    };

    draw = () => {

        let that = this;

        let wrapper = this.refs.topologyChart;
        this.width = wrapper.offsetWidth;
        this.height = wrapper.offsetHeight;

        let nodes = this.state.nodes;
        let links = this.state.links;

        d3.select(this.refs.topologyChart).selectAll("svg").remove();
        this.svg = d3.select(this.refs.topologyChart).append("svg").attr("width", this.width).attr("height", this.height);

        if (this.state.zoom) {
            this.svg.call(d3.zoom().on("zoom", function () {
                that.svg.attr("transform", d3.event.transform);
            }));
        }

        this.simulation = d3.forceSimulation();
        this.simulation.force("link", d3.forceLink().id(function (d) {
            return d.id;
        }));
        this.simulation.force('charge', d3.forceManyBody().strength([-10]));
        this.simulation.force("center", d3.forceCenter(this.width / 2, this.height / 2));
        this.simulation.force("collide", d3.forceCollide(40));
        this.simulation.nodes(nodes).on("tick", this.ticked);

        // 노드에 표시되는 텍스트
        this.edgePathGroup = this.svg.append("g").attr("class", "edge-path-group");
        this.edgePathList = this.edgePathGroup.selectAll(".edge-path").data(links).enter().append('path').attr('class', 'edge-path').attr('id', function (d, i) {
            return 'edgePath' + d.source + "_" + d.target;
        }).style("pointer-events", "none");
        this.edgeTextGroup = this.svg.append("g").attr("class", "edge-text-group");
        this.edgeTextList = this.edgeTextGroup.selectAll(".edge-text").data(links).enter().append('text').style("pointer-events", "none").attr('class', 'edge-text').attr('dy', -10).attr('id', function (d, i) {
            return 'edgeLabel' + i
        });
        this.edgeTextPath = this.edgeTextList.append('textPath').attr('xlink:href', function (d, i) {
            return '#edgePath' + d.source + "_" + d.target;
        }).style("text-anchor", "middle").style("pointer-events", "none").attr("startOffset", "50%").attr('class', 'edge-text-path');

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
        this.edgeFlowPathGroup = this.svg.append("g").attr("class", "edge-flow-path-group");
        this.edgeFlowPath = this.edgeFlowPathGroup.selectAll(".edge-flow-path").data(links).enter().append('path').attr('class', 'edge-flow-path').attr('id', function (d, i) {
            return 'edgeFlowPath' + i
        }).style("pointer-events", "none");

        // 노드 아래에 표시되는 명칭
        this.nodeNameTextGroup = this.svg.append("g").attr("class", "node-name-text-group");
        this.nodeNameText = this.nodeNameTextGroup.selectAll(".node-name").data(nodes).enter().append("text").attr("class", "node-name").style("font-size", this.option.fontSize + "px").style("fill", "white").text(function (d) {
            return d.objName;
        });

        // 노드
        this.nodeGroup = this.svg.append("g").attr("class", "node-group");
        this.node = this.nodeGroup.selectAll("circle").data(nodes).enter().append("circle").attr("class", "node").attr("r", this.r).style("stroke-width", "4px").style("fill", "white").style("stroke", function (d) {
            return that.getCatgegoryInfo(d.objCategory).color;
        });
        this.node.on("dblclick", this.dblclick)
        this.node.call(d3.drag().on("start", this.dragstarted).on("drag", this.dragged).on("end", this.dragended));

        this.nodeLabelGroup = this.svg.append("g").attr("class", "node-labels").selectAll("text").data(nodes).enter();
        this.nodeLabel = this.nodeLabelGroup.append("text").attr("class", "node-label").style("font-size", this.option.fontSize + "px").text(function (d) {
            return (d.objTypeFamily ? d.objTypeFamily : d.objCategory).toUpperCase();
        }).style("fill", function (d) {
            return that.getCatgegoryInfo(d.objCategory).color;
        });

        this.nodeIconGroup = this.svg.append("g").attr("class", "node-icon-group").selectAll("text").data(nodes).enter();
        this.nodeIcon = this.nodeIconGroup.append("text").attr("class", "node-icon").style("font-family", function (d) {
            return that.getCatgegoryInfo(d.objCategory).fontFamily;
        }).style("font-size", function (d) {
            return that.getCatgegoryInfo(d.objCategory).fontSize;
        }).style("fill", function (d) {
            return that.getCatgegoryInfo(d.objCategory).color;
        }).text(function (d) {
            return that.getCatgegoryInfo(d.objCategory).text;
        });
        this.nodeIcon.on("dblclick", this.dblclick);
        this.nodeIcon.call(d3.drag().on("start", this.dragstarted).on("drag", this.dragged).on("end", this.dragended));


        this.simulation.force("link").links(links).distance([this.state.distance]);
        this.init = true;

    };

    update = () => {
        let that = this;

        let nodes = this.state.nodes;
        let links = this.state.links;

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
        this.edgeTextList = this.edgeTextList.enter().append('text').merge(this.edgeTextList).style("pointer-events", "none").attr('class', 'edge-text').attr('dy', -10).attr('id', function (d, i) {
            return 'edgeLabel' + i
        });

        this.edgeTextList.selectAll("textPath").remove();
        this.edgeTextPath = this.edgeTextList.append('textPath').attr('xlink:href', function (d, i) {
            if (typeof(d.source) === "object") {
                return '#edgePath' + d.source.id + "_" + d.target.id;
            } else {
                return '#edgePath' + d.source + "_" + d.target;
            }
        }).style("text-anchor", "middle").style("pointer-events", "none").attr("startOffset", "50%").attr('class', 'edge-text-path');

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
            if (that.state.redLine) {
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
        }).style("pointer-events", "none");


        // 노드 아래에 표시되는 명칭
        this.nodeNameText = this.nodeNameTextGroup.selectAll(".node-name").data(nodes);
        this.nodeNameText.exit().remove();
        this.nodeNameText = this.nodeNameText.enter().append("text").merge(this.nodeNameText).attr("class", "node-name").style("font-size", this.option.fontSize + "px").style("fill", "white").text(function (d) {
            return d.objName;
        });

        // 노드
        this.node = this.nodeGroup.selectAll(".node").data(nodes);
        this.node.exit().remove();
        this.node.enter().append("circle").merge(this.node).attr("class", "node").attr("r", this.r).style("stroke-width", "4px").style("fill", "white").style("stroke", function (d) {
            return that.getCatgegoryInfo(d.objCategory).color;
        });
        this.node.on("dblclick", this.dblclick)
        this.node.call(d3.drag().on("start", this.dragstarted).on("drag", this.dragged).on("end", this.dragended));

        // 노드 라벨
        this.nodeLabel = this.nodeLabelGroup.selectAll(".node-label").data(nodes);
        this.nodeLabel.exit().remove();
        this.nodeLabel.enter().append("text").merge(this.nodeLabel).attr("class", "node-label").style("font-size", this.option.fontSize + "px").text(function (d) {
            return (d.objTypeFamily ? d.objTypeFamily : d.objCategory).toUpperCase();
        }).style("fill", function (d) {
            return that.getCatgegoryInfo(d.objCategory).color;
        });

        // 노드 아이콘
        this.nodeIcon = this.nodeIconGroup.selectAll(".node-icon").data(nodes);
        this.nodeIcon.exit().remove();
        this.nodeIcon.enter().append("text").merge(this.nodeIcon).attr("class", "node-icon").style("font-family", function (d) {
            return that.getCatgegoryInfo(d.objCategory).fontFamily;
        }).style("font-size", function (d) {
            return that.getCatgegoryInfo(d.objCategory).fontSize;
        }).style("fill", function (d) {
            return that.getCatgegoryInfo(d.objCategory).color;
        }).text(function (d) {
            return that.getCatgegoryInfo(d.objCategory).text;
        }).on("dblclick", this.dblclick).call(d3.drag().on("start", this.dragstarted).on("drag", this.dragged).on("end", this.dragended));

        // Update and restart the simulation.



        this.simulation.nodes(nodes).on("tick", this.ticked);;
        this.simulation.force("link").links(links);
        this.simulation.alpha(1).restart();
    };

    ticked = () => {
        const now = new Date().valueOf();
        if(now - this.lastTicked < 100) {
            return;
        }
        this.lastTicked = new Date().valueOf();

        const posChanged = _.find(this.state.nodes, function(n) {
            return n.vx !== 0 || n.vy !== 0 || n.x !== n.fx || n.y !== n.fy;
        });
        if (!posChanged && !this.dragChanged) {
            return;
        }

        let that = this;
        // 노드 위치
        this.node.attr("cx", function (d) {
            return d.x;
        }).attr("cy", function (d) {
            return d.y;
        });

        // 노드 명 아래 가운데 위치 하도록
        this.nodeNameText.attr("x", function (d) {
            const width = this.getComputedTextLength();
            return d.x - (width / 2);
        }).attr("y", function (d) {
            return d.y + that.r + (that.option.fontSize / 2) + 5;
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

    checkBtnClick = (property) => {
        let that = this;
        let state = Object.assign({}, this.state);
        state[property] = !state[property];
        this.setState(state);

        if (property === "zoom") {
            if (state[property]) {
                this.svg.call(d3.zoom().on("zoom", function () {
                    that.svg.attr("transform", d3.event.transform);
                }));
            } else {
                this.svg.call(d3.zoom().on("zoom", null));
            }
        }

        if (property === "pin") {
            if (!state[property]) {
                this.node.each((d) => {
                    d.fx = null;
                    d.fy = null;
                })
            }
        }

        if (property === "redLine") {
            this.edgeFlowPath.attr("class", function(d) {
                if (state[property]) {
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
    };

    changeDistance = (dir) => {
        let distance = this.state.distance;
        if (dir === "plus") {
            distance += 30;
        } else {
            distance -= 30;
            if (distance < 120) {
                distance = 120;
            }
        }

        this.setState({
            distance : distance
        });

        this.simulation.force("link").distance([distance]);
    };

    render() {
        return (
            <div className="topology-wrapper">
                <div className="controller noselect">
                    <div className="left">
                        <div className="summary">{this.state.nodes.length} NODES</div>
                        <div className="summary">{this.state.links.length} LINKS</div>
                    </div>
                    <div className="right">
                        <div className="group">
                            <div className="check-btn" onClick={this.changeDistance.bind(this, "plus")} >DISTANCE+</div>
                            <div className="check-btn" onClick={this.changeDistance.bind(this, "minus")}>DISTANCE-</div>
                        </div>
                        <div className="group">
                            <div className={"check-btn " + (this.state.zoom ? "on" : "off")} onClick={this.checkBtnClick.bind(this, "zoom")}>ZOOM</div>
                            <div className={"check-btn " + (this.state.pin ? "on" : "pin")} onClick={this.checkBtnClick.bind(this, "pin")}>PIN</div>
                            <div className={"check-btn " + (this.state.redLine ? "on" : "redLine")} onClick={this.checkBtnClick.bind(this, "redLine")}>RED LINE</div>
                        </div>
                    </div>
                </div>
                <div className="topology-chart" ref="topologyChart"></div>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        objects: state.target.objects,
        selection: state.target.selection,
        config: state.config,
        user: state.user,
        template: state.template,
        range: state.range,
        counterInfo: state.counterInfo,
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        addRequest: () => dispatch(addRequest()),
        pushMessage: (category, title, content) => dispatch(pushMessage(category, title, content)),
        setControlVisibility: (name, value) => dispatch(setControlVisibility(name, value)),

        setRealTime: (realTime, longTerm) => dispatch(setRealTime(realTime, longTerm)),
        setRealTimeValue: (realTime, longTerm, value) => dispatch(setRealTimeValue(realTime, longTerm, value)),
        setRangeDate: (date) => dispatch(setRangeDate(date)),
        setRangeHours: (hours) => dispatch(setRangeHours(hours)),
        setRangeMinutes: (minutes) => dispatch(setRangeMinutes(minutes)),
        setRangeValue: (value) => dispatch(setRangeValue(value)),
        setRangeDateHoursMinutes: (date, hours, minutes) => dispatch(setRangeDateHoursMinutes(date, hours, minutes)),
        setRangeDateHoursMinutesValue: (date, hours, minutes, value) => dispatch(setRangeDateHoursMinutesValue(date, hours, minutes, value)),
        setRangeAll: (date, hours, minutes, value, realTime, longTerm, range, step) => dispatch(setRangeAll(date, hours, minutes, value, realTime, longTerm, range, step)),

        setTemplate: (boxes, layouts) => dispatch(setTemplate(boxes, layouts))

    };
};

Topology = connect(mapStateToProps, mapDispatchToProps)(Topology);
export default withRouter(Topology);
