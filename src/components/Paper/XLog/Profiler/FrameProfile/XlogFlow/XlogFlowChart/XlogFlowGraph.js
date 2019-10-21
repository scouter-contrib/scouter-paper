import connect from "react-redux/es/connect/connect";
import {withRouter} from "react-router-dom";
import React,{Component} from "react";
import * as d3 from "d3";
import d3tip from 'd3-tip';
import * as _ from 'lodash'
import "./XlogFlowGraph.css";
import ElementType from "../../../../../../../common/ElementType";
import numeral from "numeral";

// # zoom in, zoom out
// # resizing
// # positing
// # tooltip
// # full info

class XlogFlowGraph extends Component {

    state = {
        g: null,
    };
    constructor(props){
        super(props);
        this.properies ={
            height: 500,
            width: 400,
            duration : 500 ,//ms,
            margin: {
                top: 15, right: 15, bottom: 25, left: 40
            },
        };
    }
    

    //
    //
    // constructor(props){
    //     super(props);
    // }

    componentWillReceiveProps(nextProps){
        if (nextProps.resize !== this.props.resize) {
            this.properies.height = nextProps.resize.height;
            this.properies.width = nextProps.resize.width;
            this.init(this.getTreeData(nextProps.xlogflow));
        }else if (nextProps.xlogflow !== this.props.xlogflow) {
            this.init(this.getTreeData(nextProps.xlogflow));
        }

    }
    shouldComponentUpdate() {
        // we will handle moving the nodes on our own with d3.js
        // make React ignore this component
        return false;
    }

    getTreeData(data){
        const [[,value]]= [...data];

        const max = _(value.toElaped())
                        .flatMapDeep()
                        .map(d=>d.dup)
                        .max();
        return {
            elapsed : {
                max : max,
                min : 0
            },
            tree : value.toTree()
        }
    }

    onRef = (ref) => {
        this.setState({ g : d3.select(ref) }, () => {
            let zoom = d3.zoom()
                .scaleExtent([0.7, 10])
                .on("zoom", this.zoomed);

            d3.select(ref)
                .attr('transform', d => `translate(120, 0)`);

            d3.select(ref.parentNode)
                .call(zoom);
            //
            this.tip = d3tip()
                .attr('class', 'd3-tip')
                .style('z-index', '999')
                .offset([-8, 0])
                .html(d =>{
                    let svc = "";
                    switch(d.data.type){
                        case ElementType.defaultProps.SQL:
                            svc="";
                            break;
                        default :
                            svc=d.data.name;
                    }
                    return [
                         { key : 'svc', value : svc , dis : `<i class="fa fa-exchange"></i>${svc}` }
                        ,{ key : 'obj', value : d.data.objName , dis : `<i class="fa fa-television"></i>${d.data.objName}` }
                        ,{ key : 'adr', value : d.data.address , dis : `<i class="fa fa-external-link-square"></i>${d.data.address} `}
                        ,{ key : 'the', value : d.data.threadName ,  dis : `<i class="fa fa-tasks"></i>${d.data.threadName}`}
                        ]
                        .filter(d=> d.value ? true: false)
                        .map(d=> `<div>${d.dis}</div>`).join('')
                });
            d3.select(ref.parentNode)
            d3.select(ref.parentNode)
               .call(this.tip);

        });
    };
    zoomed = () =>{
        this.state.g.attr(
            'transform',
            `translate(${d3.event.transform.x + 120},${d3.event.transform.y})scale(${d3.event.transform.k})`
        )
    };

    init(data){
        const {height,width} = this.properies;
        const {elapsed,tree} = data;
        this.treemap = d3.tree().size([height, width]);
        this.root    = d3.hierarchy(tree, d => d.children);
        this.root.x0 = height / 2;
        this.root.y0 = 0;
        // this.min = elapsed.min ?  elapsed.min.dup : 0;
        this.max = elapsed.max ? elapsed.max : 0; // default max;

        this.xScale = d3
            .scaleLinear()
            .range([0, 100])
            .domain([0, this.max]);


        this.topSlow=[];
        this.topChild=[];
        this.root.children.forEach((d)=>this.collapse(d));
        this.draw(this.root);
    }
    draw(source) {
        const that = this;
        // Assigns the x and y position for the nodes
        let treeData = this.treemap(this.root);
        // Compute the new tree layout.
        let nodes = treeData.descendants(),
            links = treeData.descendants().slice(1);

        // Normalize for fixed-depth.
        nodes.forEach((d)=> d.y = d.depth * 140);
        let i=0;
        let node = this.state.g.selectAll('g.node')
            .data(nodes, function(d) {return d.id || (d.id = ++i); });

        let nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr('cursor', 'pointer')
            .attr("transform", function(d) {
                return `translate(${source.y0} ,${source.x0})`;
            }).on('mouseover', function (d, i)  {
                that.tip.show(d,this);
            })
            .on('mouseout', function(d, i) {
                that.tip.hide(d,this);
            })
            .on('click', (d)=> {
                that.tip.hide(d,this);
                d3.event.stopPropagation();
                this.props.clickContent(d.data);
                // that.scope.handleSelectSpan(d);
            });

        nodeEnter.append('circle')
            .attr('class', 'node')
            .attr('r', 1e-6)
            .style("fill", d => d.children || d._children  ? ElementType.defaultProps.toColor(d.data.type) : "#fff")
            .attr('stroke', d => ElementType.defaultProps.toColor(d.data.type))
            .attr('stroke-width', 2.5);


        // Add labels for the nodes
        nodeEnter.append('text')
            .attr('font-size', 11)
            .attr("dy", "-0.5em")
            .attr("x", (d) =>d.children || d._children ? -15 : 15)
            .attr("text-anchor", (d)=>d.children || d._children ? "end" : "start")
            .text(d => {
                const {txid,isError,name} = d.data;
                const isOwner = txid === this.props.txid;
                if( name.length > 19 ){
                    return `${isOwner ? '▶ ' : (isError ? '◉' : '')}${name.slice(0, 19)}...`;
                }else {
                    return `${isOwner ? '▶ ' : (isError ? '◉' : '')}${name}`;
                }
            })
            .style("fill", d => {
                const {txid,isError} = d.data;
                const isOwner = txid === this.props.txid;
                if( isOwner ){
                    return '#e03d60';
                }else{
                    return !isError ? '#3d444f':'#E54C17';
                }
            });

        nodeEnter.append('text')
            .attr('class','node-text')
            .attr("x", (d) => d.children || d._children ? -15 : 15)
            .attr("dy", "1em")
            .attr('fill', (d) => ElementType.defaultProps.toColor(d.data.type))
            .attr("text-anchor",(d) => d.children || d._children ? "end" : "start")
            .style('font-size', '10px')
            .text(d =>{
                const {type,elapsed,dupCount} = d.data;
                const {numberFormat} = this.props.config;
                const dupCnt = dupCount > 1 ? `(${dupCount})` : '';
                return `${ElementType.defaultProps.toString(type)}${dupCnt}`+ (type !== '0' ? `-${numeral(elapsed).format(numberFormat)}ms` : '');
            });

        nodeEnter
            .append('rect')
            .attr('rx', 1)
            .attr('ry', 1)
            .attr('height', 2)
            .attr('width', 100)
            .attr('x', (d) =>d.children ? "-110" : "10")
            .attr('y', -1)
            .style('fill', '#00000020');
        nodeEnter
            .append('rect')
            .attr('rx', 1)
            .attr('ry', 1)
            .attr('height', 2)
            .attr('width', d => this.xScale(d.data.elapsed) + 1 || 0)
            .attr('x', (d) => d.children || d._children  ? "-110" : "10")
            .attr('y', -1)
            .style('fill',d =>ElementType.defaultProps.toColor(d.data.type));

            // .style( 'fill', d => this.sequentialScale(this.list.indexOf(d.data.serviceCode)));
            // .style( 'fill', d => this.sequentialScale(this.list.indexOf(d.data.serviceCode)));

        // UPDATE
        let nodeUpdate = nodeEnter.merge(node);

        nodeUpdate.transition()
            .duration(this.properies.duration)
            .attr('transform', function(d) {
                return 'translate(' + d.y + ',' + d.x + ')';
            });

        // Update the node attributes and style
        nodeUpdate.select('circle.node')
            .attr('r', 5)
            .style("fill", (d) => {
                return d.children || d._children  ? ElementType.defaultProps.toColor(d.data.type) : "#fff"
            } )
            .attr('cursor', 'pointer')
            .on('click', d => {
                d3.event.stopPropagation();
                click(d);
            });

        // Remove any exiting nodes
        let nodeExit = node.exit().transition()
            .duration(this.properies.duration)
            .attr('transform', function(d) {
                return 'translate(' + source.y + ',' + source.x + ')';
            })
            .remove();

        // On exit reduce the node circles size to 0
        nodeExit.select('circle')
            .attr('r', 1e-6);
        // On exit reduce the opacity of text labels
        nodeExit.select('text')
            .style('fill-opacity', 1e-6);

        // ****************** links section ***************************

        // Update the links...
        let link = this.state.g.selectAll('path.tree-link')
            .data(links, function(d) { return d.id; })
            .style('stroke-width', 1.5);

        let linkEnter = link.enter().insert('path', "g")
            .attr("class",(d)=>`tree-link ${d.data.isError ? 'error-link' : ''}`)
            .attr('d', function(d){
                let o = {x: source.x0, y: source.y0}
                return diagonal(o, o);
            })
            .style('stroke-width', 1.5);

        let linkUpdate = linkEnter.merge(link);
        linkUpdate.transition()
            .duration(this.properies.duration)
            .attr('d', function(d){ return diagonal(d, d.parent) });
//linkExit
        link.exit().transition()
            .duration(this.properies.duration)
            .attr('d', function(d) {
                var o = {x: source.x, y: source.y}
                return diagonal(o, o)
            })
            .style('stroke-width', 1.5)
            .remove();

        nodes.forEach(function(d){
            d.x0 = d.x;
            d.y0 = d.y;
        });
        function diagonal(s, d) {
            return `M ${s.y} ${s.x}
      C ${(s.y + d.y) / 2} ${s.x}, ${(s.y + d.y) / 2} ${d.x},
      ${d.y} ${d.x}`;
        }
        function click(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
            that.draw(d);
        }
    }
    collapse=(d) =>{
        if(d.children) {
            let dur = d.elapsed;
            // d.children.forEach((_d) => dur -= _d.elapsed);
            //
            d._children = d.children;
            d.dur = d.elapsed;
            this.topSlow.push(dur);
            this.topChild.push(d.children.length);
            d.childrenLength = d.children.length;
            d.children.forEach(_d=>this.collapse(_d));
            // d.children = null
        }
    };

    render() {

        return (
            <g ref={this.onRef} className="top-group" />
        )
    };

}


const mapStateToProps = (state) => {
    return {
        config: state.config
    };
};

XlogFlowGraph = connect(mapStateToProps, undefined)(XlogFlowGraph);
export default withRouter(XlogFlowGraph);