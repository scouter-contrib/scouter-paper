import React, {Component} from "react";
import "./Topology.css";
import {connect} from "react-redux";
import {withRouter} from 'react-router-dom';
import {addRequest, pushMessage, setControlVisibility, setRealTime, setRealTimeValue, setRangeDate, setRangeHours, setRangeMinutes, setRangeValue, setRangeDateHoursMinutes, setRangeDateHoursMinutesValue, setRangeAll, setTemplate} from "../../actions";
import jQuery from "jquery";
import {errorHandler, getData, getHttpProtocol, getWithCredentials, setAuthHeader, setData, getSearchDays, getDivideDays, getCurrentUser} from "../../common/common";
import * as d3 from "d3";
import _ from "lodash";
import numeral from "numeral";

class Topology extends Component {

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

    objCategoryInfo = {
        REDIS : {
            fontFamily : "technology-icons",
            fontSize : "18px",
            text : "\uf15c",
            color : "red"
        },
        DB : {
            fontFamily : "technology-icons",
            fontSize : "18px",
            text : "\uf117",
            color : "blue"
        },
        javaee : {
            fontFamily : "technology-icons",
            fontSize : "18px",
            text : "\uf137",
            color : "orange"
        },
        CLIENT : {
            fontFamily : "FontAwesome",
            fontSize : "18px",
            text : "\uF007",
            color : "black"
        },
        EXTERNAL : {
            fontFamily : "FontAwesome",
            fontSize : "18px",
            text : "\uF0C1",
            color : "green"
        },
        NEO_DEFAULT : {
            fontFamily : "FontAwesome",
            fontSize : "18px",
            text : "\uF0C1",
            color : "green"
        }
    }

    constructor(props) {
        super(props);

        this.state = {
            list: [],
            topology : []
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

    componentDidMount() {
        if (!this.polling) {
            this.polling = setInterval(() => {
                this.getTopology(this.props.config, this.props.objects, this.props.user);
            }, this.interval);
        }

        this.getAllInstanceInfo(this.props.config);

    }

    componentWillUnmount() {
        if (this.polling) {
            clearInterval(this.polling);
            this.polling = null;
        }
    }

    componentDidUpdate(prevProps, prevState) {
        //console.log(this.state.list);
        //console.log(this.instances);
        console.log(this.props.counterInfo);

        this.draw();
    }

    getAllInstanceInfo = (config) => {
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
            this.instances = {};
            if (servers && servers.length > 0) {
                for (let i=0; i<servers.length; i++) {
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
                loading : false
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
                if (objects && objects.length > 0) {
                    objects.forEach((o)=> {
                        that.instances[Number(o.objHash)] = o;
                    });
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
                result["objType"]= "API" + data[position + "ObjHash"];
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
                    console.log(list);
                    console.log(that.instances);
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
                                fromObjHash : d.fromObjType,
                                fromObjName : d.fromObjTypeName,
                                fromObjTypeFamily : d.fromObjTypeFamily,
                                fromObjCategory : d.fromObjCategory,
                                toObjHash : d.toObjType,
                                toObjName : d.toObjTypeName,
                                toObjTypeFamily : d.toObjTypeFamily,
                                toObjCategory : d.toObjCategory,
                                count : Number(d.count),
                                errorCount : Number(d.errorCount),
                                period : Number(d.period),
                                totalElapsed: Number(d.totalElapsed)
                            };
                        }


                    });

                    console.log(objectTypeTopologyMap);

                    let topology = [];
                    for (let attr in objectTypeTopologyMap) {
                        topology.push(objectTypeTopologyMap[attr])
                    }

                    this.setState({
                        list : msg.result,
                        topology : topology
                    });
                }

            }).fail((xhr, textStatus, errorThrown) => {
                errorHandler(xhr, textStatus, errorThrown, this.props);
            });
        }
    };

    dragstarted = (d) => {
        if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    };

    dragged = (d) => {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    };

    dragended = (d) => {
        if (!d3.event.active) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    };


    /*
    function tick() {
  link.attr("d", function(d) {
  var x1 = d.source.x,
      y1 = d.source.y,
      x2 = d.target.x,
      y2 = d.target.y,
      dx = x2 - x1,
      dy = y2 - y1,
      dr = Math.sqrt(dx * dx + dy * dy),

      // Defaults for normal edge.
      drx = dr,
      dry = dr,
      xRotation = 0, // degrees
      largeArc = 0, // 1 or 0
      sweep = 1; // 1 or 0

      // Self edge.
      if ( x1 === x2 && y1 === y2 ) {
        // Fiddle with this angle to get loop oriented.
        xRotation = -45;

        // Needs to be 1.
        largeArc = 1;

        // Change sweep to change orientation of loop.
        //sweep = 0;

        // Make drx and dry different to get an ellipse
        // instead of a circle.
        drx = 30;
        dry = 20;

        // For whatever reason the arc collapses to a point if the beginning
        // and ending points of the arc are the same, so kludge it.
        x2 = x2 + 1;
        y2 = y2 + 1;
      }

 return "M" + x1 + "," + y1 + "A" + drx + "," + dry + " " + xRotation + "," + largeArc + "," + sweep + " " + x2 + "," + y2;
});

     */


    getCatgegoryInfo = (category) => {
        if (this.objCategoryInfo[category]) {
            return this.objCategoryInfo[category];
        } else {
            this.objCategoryInfo["NEO_DEFAULT"];
        }
    };


    marker = () => {
        this.svg.append('svg:defs').selectAll('marker')
            .data([{ id: 'end-arrow', opacity: 1 }, { id: 'end-arrow-fade', opacity: 0.1 }])
            .enter().append('marker')
            .attr('id', d => d.id)
            .attr('viewBox', '0 0 40 40')
            .attr('refX', 58)
            .attr('refY', 20)
            .attr('markerWidth', 20)
            .attr('markerHeight', 20)
            .attr('orient', 'auto')
            .attr('stroke', this.lineColor)
            .attr('stroke-width', 8)
            .attr('opacity', 0.5)

            .attr('fill', "transparent")
            .append('svg:path')
            .attr('d', 'M0,0 L20,20 L0,40')
            .style('opacity', d => d.opacity);
    };

    draw = () => {

        let that = this;



        let wrapper = this.refs.topologyChart.parentNode;
        this.width = wrapper.offsetWidth;
        this.height = wrapper.offsetHeight;

        let list = this.state.topology.slice(0);

        console.log(list);

        let outCount = 0;
        let links = [];
        //console.log(list);
        _.forEach(list, (obj) => {
            if (obj.fromObjHash === "0" || obj.fromObjHash === "" ) {
                obj.fromObjHash = "OUTSIDE-" + (outCount++);
                obj.fromObjName = "OUTSIDE";
            }

            if (obj.toObjHash === "0" || obj.toObjHash === "" ) {
                obj.toObjHash = "OUTSIDE-" + (outCount++);
                obj.toObjName = "OUTSIDE";
            }

            links.push({
                source: obj.fromObjHash,
                target: obj.toObjHash,
                count : obj.count,
                errorCount : obj.errorCount,
                interactionType : obj.interactionType,
                period : obj.period,
                totalElapsed : obj.totalElapsed
            });
        });

        let nodes = _.uniqBy(_.map(list, (d) => {
            return {
                id : d.fromObjHash,
                objName : d.fromObjName,
                objCategory : d.fromObjCategory,
                objTypeFamily : d.fromObjTypeFamily
            }
        }).concat(_.map(list, (d) => {
            return {
                id : d.toObjHash,
                objName : d.toObjName,
                objCategory : d.toObjCategory,
                objCategory : d.toObjCategory,
                objTypeFamily : d.toObjTypeFamily
            }
        })), (d) => {
            return d.id;
        });

        if (!this.init && nodes.length > 0) {
            this.svg = d3.select(this.refs.topologyChart).append("svg").attr("width", this.width).attr("height", this.height)
                /*.call(d3.zoom().on("zoom", function () {
                    that.svg.attr("transform", d3.event.transform)
                }));*/

            //this.marker();

            this.simulation = d3.forceSimulation();
            this.simulation.force("link", d3.forceLink().id(function(d) { return d.id; }));
            this.simulation.force('charge', d3.forceManyBody().strength([-10]));
            this.simulation.force("center", d3.forceCenter(this.width / 2, this.height / 2));
            this.simulation.force("collide", d3.forceCollide(40));
            this.simulation.nodes(nodes).on("tick", this.ticked);

            this.link = this.svg.append("g").style("stroke", "transparent").selectAll("line").data(links).enter().append("line")/*.attr('marker-end', 'url(#end-arrow)')*/;

            this.edgepaths = this.svg.selectAll(".edgepath")
                .data(links)
                .enter()
                .append('path')
                .attr('class', 'edgepath')
                .attr('id', function (d, i) {return 'edgepath' + i})
                .style("pointer-events", "none");

            this.edgelabels = this.svg.selectAll(".edgelabel")
                .data(links)
                .enter()
                .append('text')
                .style("pointer-events", "none")
                .attr('class', 'edgelabel')
                .attr('dy', -10)
                .attr('id', function (d, i) {return 'edgelabel' + i});

            this.edgeLabelsTextPath = this.edgelabels.append('textPath')
                .attr('xlink:href', function (d, i) {return '#edgepath' + i})
                .style("text-anchor", "middle")
                .style("pointer-events", "none")
                .attr("startOffset", "50%")
                .attr('class', 'edge-label-path');

            this.edgeLabelsTextPath
                .append("tspan")
                .attr('class', 'tps-text')
                .text(function(d) {
                    let tps = numeral(d.count / d.period).format(that.props.config.numberFormat);
                    return tps + "TPS ";
                });

            this.edgeLabelsTextPath
                .append("tspan")
                .attr('class', 'error-rate-text')
                .text(function(d) {
                    let errorRate = numeral((d.errorCount / d.count) * 100).format(that.props.config.numberFormat);
                    return errorRate + "% ";
                });

            this.edgeLabelsTextPath
                .append("tspan")
                .attr('class', 'avg-elapsed-text')
                .text(function(d) {
                    let avgElapsedTime  = numeral(d.totalElapsed / d.count).format(that.props.config.numberFormat);
                    return avgElapsedTime + "ms";
                });

                //.attr('class', 'edge-label-text');
                /*.text(function (d, i, e) {

                    e[i].append("tspan").text("tst");
                    console.log(e[i]);
                    let tps = numeral(d.count / d.period).format(that.props.config.numberFormat);
                    let errorRate = numeral((d.errorCount / d.count) * 100).format(that.props.config.numberFormat);
                    let avgElapsedTime  = numeral(d.totalElapsed / d.count).format(that.props.config.numberFormat);
                    return  "<tspan>" + tps + " TPS, " + errorRate + "%, " + avgElapsedTime + "ms</tspan>";
                })*/
                /*.text(function (d) {
                    let tps = numeral(d.count / d.period).format(that.props.config.numberFormat);
                    let errorRate = numeral((d.errorCount / d.count) * 100).format(that.props.config.numberFormat);
                    let avgElapsedTime  = numeral(d.totalElapsed / d.count).format(that.props.config.numberFormat);
                    return  tps + " TPS, " + errorRate + "%, " + avgElapsedTime + "ms";
                })*/



            this.flowline = this.svg.selectAll(".flowline")
                .data(links)
                .enter()
                .append('path')
                .attr('class', 'flowline')
                .attr('id', function (d, i) {return 'flowline' + i})
                .style("pointer-events", "none");












            this.objectTypeLabel = this.svg.append("g").attr("class", "labels").selectAll("text").data(nodes).enter().append("text").attr("class", "label");
            this.objectTypeLabel.text(function(d) { return d.objName; });

            this.node = this.svg.append("g").attr("class", "nodes").selectAll("circle").data(nodes).enter().append("circle");
            this.node.call(d3.drag().on("start", this.dragstarted).on("drag", this.dragged).on("end", this.dragended));

            this.nodeLabelGroup = this.svg.append("g").attr("class", "node-labels").selectAll("text").data(nodes).enter().append("g");
            this.nodeLabel = this.nodeLabelGroup.append("text").attr("class", "label").text(function(d) {
                return (d.objTypeFamily ? d.objTypeFamily : d.objCategory).toUpperCase();
            });

            this.nodeIconGroup = this.svg.append("g").attr("class", "node-icon-group").selectAll("text").data(nodes).enter().append("g");
            this.nodeIcon = this.nodeIconGroup.append("text").attr("class", "node-icon")
                .style("font-family", function(d) {
                    return that.getCatgegoryInfo(d.objCategory).fontFamily;
                })
                .style("font-size", function(d) {
                    return that.getCatgegoryInfo(d.objCategory).fontSize;
                }).style("fill", function(d) {
                    return that.getCatgegoryInfo(d.objCategory).color;
                })
                .text(function(d) {
                    return that.getCatgegoryInfo(d.objCategory).text;
                });

            this.simulation.force("link").links(links).distance([300]);
            this.init = true;
        }
    };

    ticked = () => {

        let that = this;
        let fontSize = 9;
        let nodeLabelFontSize = 8;
        this.link.attr("x1", function(d) { return d.source.x; });
        this.link.attr("y1", function(d) { return d.source.y; });
        this.link.attr("x2", function(d) { return d.target.x; });
        this.link.attr("y2", function(d) { return d.target.y; });

        this.node.attr("r", this.r).style("fill", "#efefef").style("stroke", "#424242").style("stroke-width", "4px");
        this.node.attr("cx", function (d) {
            return d.x;
        });
        this.node.attr("cy", function(d) {
            return d.y;
        });

        this.nodeLabel.attr("x", function(d) {
            let width = this.getComputedTextLength();
            return d.x - (width / 2);
        }).attr("y", function (d) {
            return d.y + nodeLabelFontSize / 2 - 24;
        }).style("font-size", nodeLabelFontSize + "px").style("fill", "white");

        this.nodeIcon.attr("x", function(d) {
            let width = this.getComputedTextLength();
            return d.x - (width / 2);
        }).attr("y", function (d) {
            return d.y + nodeLabelFontSize / 2 + 3;
        });

        let padding = {
            left : 4,
            right : 4,
            bottom : 2,
            top : 2
        };




        this.objectTypeLabel.attr("x", function(d) {
            let width = this.getComputedTextLength();
            return d.x - (width / 2);
        });

        this.objectTypeLabel.attr("y", function (d) {
            return d.y + that.r + (fontSize/2) + 5;
        });

        this.objectTypeLabel.style("font-size", fontSize + "px").style("fill", "white");

        this.edgepaths.attr('d', function (d) {
            // 직선
            //return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;


            // 곡선
            /*var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" +
                d.source.x + "," +
                d.source.y + "A" +
                dr + "," + dr + " 0 0,1 " +
                d.target.x + "," +
                d.target.y;*/

          var x1 = d.source.x,
                y1 = d.source.y,
                x2 = d.target.x,
                y2 = d.target.y,
                dx = x2 - x1,
                dy = y2 - y1,
                dr = Math.sqrt(dx * dx + dy * dy),

                // Defaults for normal edge.
                drx = dr,
                dry = dr,
                xRotation = 0, // degrees
                largeArc = 0, // 1 or 0
                sweep = 1; // 1 or 0

            // Self edge.
            if ( x1 === x2 && y1 === y2 ) {
                // Fiddle with this angle to get loop oriented.
                xRotation = -45;

                // Needs to be 1.
                largeArc = 1;

                // Change sweep to change orientation of loop.
                //sweep = 0;

                // Make drx and dry different to get an ellipse
                // instead of a circle.
                drx = 30;
                dry = 30;

                // For whatever reason the arc collapses to a point if the beginning
                // and ending points of the arc are the same, so kludge it.
                x2 = x2 + 1;
                y2 = y2 + 1;
            }

            return "M" + x1 + "," + y1 + "A" + drx + "," + dry + " " + xRotation + "," + largeArc + "," + sweep + " " + x2 + "," + y2;
        });

        this.flowline.attr('d', function (d) {
            // 직선
            //return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;

            // 곡선
            /*var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" +
                d.source.x + "," +
                d.source.y + "A" +
                dr + "," + dr + " 0 0,1 " +
                d.target.x + "," +
                d.target.y;*/

            var x1 = d.source.x,
                y1 = d.source.y,
                x2 = d.target.x,
                y2 = d.target.y,
                dx = x2 - x1,
                dy = y2 - y1,
                dr = Math.sqrt(dx * dx + dy * dy),

                // Defaults for normal edge.
                drx = dr,
                dry = dr,
                xRotation = 0, // degrees
                largeArc = 0, // 1 or 0
                sweep = 1; // 1 or 0

            // Self edge.
            if ( x1 === x2 && y1 === y2 ) {
                // Fiddle with this angle to get loop oriented.
                xRotation = -45;

                // Needs to be 1.
                largeArc = 1;

                // Change sweep to change orientation of loop.
                //sweep = 0;

                // Make drx and dry different to get an ellipse
                // instead of a circle.
                drx = 30;
                dry = 30;

                // For whatever reason the arc collapses to a point if the beginning
                // and ending points of the arc are the same, so kludge it.
                x2 = x2 + 1;
                y2 = y2 + 1;
            }

            return "M" + x1 + "," + y1 + "A" + drx + "," + dry + " " + xRotation + "," + largeArc + "," + sweep + " " + x2 + "," + y2;
        });

       /* this.edgelabels.attr('transform', function (d) {



            if (d.target.x < d.source.x) {
                var bbox = this.getBBox();
                var rx = bbox.x + bbox.width / 2;
                var ry = bbox.y + bbox.height / 2;
                return 'rotate(180 ' + rx + ' ' + ry + ')';
            }
            else {
                return 'rotate(0)';
            }
        });*/
    };

    render() {


        return (
            <div className="topology-wrapper">
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

            setRealTime : (realTime, longTerm) => dispatch(setRealTime(realTime, longTerm)),
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
