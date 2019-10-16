import connect from "react-redux/es/connect/connect";
import {withRouter} from "react-router-dom";
import React,{Component} from "react";
import * as d3 from "d3";
import "./XlogFlowGraph.css";
import ElementType from "../../../../../../../common/ElementType";

class XlogFlowGraph extends Component {

    state = {
        g: null,
    };

    defaultProps ={
        height: 500,
        width: 400,
        duration : 750 ,//ms,
        margin: {
            top: 15, right: 15, bottom: 25, left: 40
        },
    };


    constructor(props){
        super(props);
    }

    componentWillReceiveProps(nextProps){
        if (nextProps.resize !== this.props.resize) {
            // this.renderflow(nextProps.xlogflow);
            this.defaultProps.height = nextProps.resize.height;
            this.defaultProps.width = nextProps.resize.width;
            this.init(this.getTreeData(nextProps.xlogflow));
        }else if (nextProps.xlogflow !== this.props.xlogflow) {
            this.draw(this.getTreeData(nextProps.xlogflow));
        }

    }
    shouldComponentUpdate() {
        // we will handle moving the nodes on our own with d3.js
        // make React ignore this component
        return false;
    }

    getTreeData(data){
        const [[key,value]]= [...data];
        console.log('getTreeData=',value);
        return {
            elapsed : value.toElaped(),
            tree : value.toTree()
        }
    }

    onRef = (ref) => {
        this.setState({ g : d3.select(ref) }, () => {
            d3.select(ref).attr('transform', d => `translate(120, 0)`);
            d3.zoom().on("zoom", () => ref.parent.attr("transform", d3.event.transform));
        });
    };
    init(data){
        const {height,width} = this.defaultProps;
        const {elapsed,tree} = data;
        this.treemap = d3.tree().size([height, width]);
        this.root    = d3.hierarchy(tree, d => d.children);
        this.root.x0 = height / 2;
        this.root.y0 = 0;
        this.min = elapsed.min.dup;
        this.max = elapsed.max.dup;
        this.xScale = d3
            .scaleLinear()
            .range([0, 100])
            .domain([0, this.max]);

        this.topSlow = [];
        this.topChild = [];

        this.root.children.forEach((d)=>this.collapse(d));

        // this.topSlowMax = this.topSlow.sort((a,b) => b - a)[0];
        // this.topSlowMin = this.topSlow.sort((a,b) => b - a)[4];
        // this.topChildMax = this.topChild.sort((a,b) => b - a)[0];
        // this.topChildMin = this.topChild.sort((a,b) => b - a)[4];
        this.draw(tree);
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
            }).on('mouseover', function(d, i) {
                // that.tip.show(d, this);
                // if(!that.timeUpdate) {return;}
                // const _node = that.timeUpdate._groups[0].filter(group => group.__data__.id === (i+1));
                // if(_node.length){
                //     that.timeTip.show(d, _node[0].children[1]);
                // }
            })
            .on('mouseout', function(d, i) {
                // that.tip.hide(d, this);
                // if(!that.timeUpdate) {return;}
                // const _node = that.timeUpdate._groups[0].filter(group => group.__data__.id === (i+1));
                // if(_node.length){
                //     that.timeTip.hide(d, _node[0].children[1]);
                // }
            })
            .on('click', function(d) {
                // d3.event.stopPropagation();
                // that.scope.handleSelectSpan(d);
            });

        nodeEnter.append('circle')
            .attr('class', 'node')
            .attr('r', 1e-6)
            .style("fill", d => d._children ? ElementType.defaultProps.toColor(d.data.type) : "#fff")
            .attr('stroke', d => ElementType.defaultProps.toColor(d.data.type))
            .attr('stroke-width', 2.5);

        // Add labels for the nodes
        nodeEnter.append('text')
            .attr('font-size', 11)
            .attr("dy", "-0.5em")
            .attr("x", (d) =>d.children || d._children ? -15 : 15)
            .attr("text-anchor", (d)=>d.children || d._children ? "end" : "start")
            .text(d => d.data.name.length > 19 ? (d.data.isError ?'◉ ': '') + d.data.name.slice(0, 19) + '...' :  (d.data.isError?'◉ ': '') + d.data.name)
            .style("fill", d => !d.data.isError? '#3d444f': '#E54C17');

        nodeEnter.append('text')
            .attr('class','node-text')
            .attr("x", (d) => d.children || d._children ? -15 : 15)
            .attr("dy", "1em")
            .attr('fill', '#bbb')
            .attr("text-anchor",(d) => d.children || d._children ? "end" : "start")
            .style('font-size', '10px')
            .text(
                d =>
                    `${d.data.objName || ''}${
                        d.data.address ? '-' + d.data.address : d.data.objName || ''
                        }`
            );
        nodeEnter
            .append('rect')
            .attr('rx', 1)
            .attr('ry', 1)
            .attr('height', 2)
            .attr('width', 100)
            .attr('x', function(d) {
                return d.children || d._children ? "-110" : "10";
            })
            .attr('y', -1)
            .style('fill', '#00000020');
        nodeEnter
            .append('rect')
            .attr('rx', 1)
            .attr('ry', 1)
            .attr('height', 2)
            .attr('width', d => this.xScale(d.data.elapsed) + 1 || 0)
            .attr('x', d => {
                if( d.children || d._children ) {
                    return -110 + this.xScale(d.data.elapsed)
                }
                return 10 + this.xScale(d.data.elapsed)
            })
            .attr('y', -1)
            .style('fill',d =>ElementType.defaultProps.toColor(d.data.type));

            // .style( 'fill', d => this.sequentialScale(this.list.indexOf(d.data.serviceCode)));
            // .style( 'fill', d => this.sequentialScale(this.list.indexOf(d.data.serviceCode)));

        // UPDATE
        let nodeUpdate = nodeEnter.merge(node);

        nodeUpdate.transition()
            .duration(this.defaultProps.duration)
            .attr('transform', function(d) {
                return 'translate(' + d.y + ',' + d.x + ')';
            });

        // Update the node attributes and style
        nodeUpdate.select('circle.node')
            .attr('r', 5)
            .style("fill", (d) => {
                return d._children ? ElementType.defaultProps.toColor(d.data.type) : "#fff"
            } )
            .attr('cursor', 'pointer')
            .on('click', d => {
                d3.event.stopPropagation();
                click(d);
            });

        // Remove any exiting nodes
        let nodeExit = node.exit().transition()
            .duration(this.defaultProps.duration)
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
            .attr("class", "tree-link")
            .attr('d', function(d){
                let o = {x: source.x0, y: source.y0}
                return diagonal(o, o);
            })
            .style('stroke-width', 1.5);

        let linkUpdate = linkEnter.merge(link);
        linkUpdate.transition()
            .duration(this.defaultProps.duration)
            .attr('d', function(d){ return diagonal(d, d.parent) });

        var linkExit = link.exit().transition()
            .duration(this.defaultProps.duration)
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
            d.dur = d.elapsed;
            this.topSlow.push(dur);
            this.topChild.push(d.children.length);
            d.childrenLength = d.children.length;
            d.children.forEach(_d=>this.collapse(_d))
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

//
// update(source){
//     const treeData = this.treemap(source);
//
//     // Compute the new tree layout.
//     let nodes = treeData.descendants(),links = treeData.descendants().slice(1);
//
//     // Normalize for fixed-depth.
//     nodes.forEach(function(d){ d.y = d.depth * 180});
//
//     // ****************** Nodes section ***************************
//
//     // Update the nodes...
//     let i=0;
//     let node = this.state.g.selectAll('g.node')
//         .data(nodes, function(d) {return d.id || (d.id = ++i); });
//
//     // Enter any new modes at the parent's previous position.
//     let nodeEnter = node.enter().append('g')
//         .attr('class', 'node')
//         .attr("transform", function(d) {
//             return "translate(" + source.y0 + "," + source.x0 + ")";
//         });
//     // .on('click', click);
//
//     // Add Circle for the nodes
//     nodeEnter.append('circle')
//         .attr('class', 'node')
//         .attr('r', 1e-6)
//         .style("fill", function(d) {
//             return d._children ? "lightsteelblue" : "#fff";
//         });
//
//     // Add labels for the nodes
//     nodeEnter.append('text')
//         .attr("dy", ".35em")
//         .attr("x", function(d) {
//             return d.children || d._children ? -13 : 13;
//         })
//         .attr("text-anchor", function(d) {
//             return d.children || d._children ? "end" : "start";
//         })
//         .text(function(d) { return d.data.name; });
//
//     // UPDATE
//     let nodeUpdate = nodeEnter.merge(node);
//
//     // Transition to the proper position for the node
//     nodeUpdate.transition()
//         .duration(this.defaultProps.duration)
//         .attr("transform", function(d) {
//             return "translate(" + d.y + "," + d.x + ")";
//         });
//
//     // Update the node attributes and style
//     nodeUpdate.select('circle.node')
//         .attr('r', 10)
//         .style("fill", function(d) {
//             return d._children ? "lightsteelblue" : "#fff";
//         })
//         .attr('cursor', 'pointer');
//
//
//     // Remove any exiting nodes
//     var nodeExit = node.exit().transition()
//         .duration(this.defaultProps.duration)
//         .attr("transform", function(d) {
//             return "translate(" + source.y + "," + source.x + ")";
//         })
//         .remove();
//
//     // On exit reduce the node circles size to 0
//     nodeExit.select('circle')
//         .attr('r', 1e-6);
//
//     // On exit reduce the opacity of text labels
//     nodeExit.select('text')
//         .style('fill-opacity', 1e-6);
//
//     // ****************** links section ***************************
//
//     // Update the links...
//     let link = this.state.g.selectAll('path.link')
//         .data(links, function(d) { return d.id; });
//
//     // Enter any new links at the parent's previous position.
//     let linkEnter = link.enter().insert('path', "g")
//         .attr("class", "link")
//         .attr('d', (d)=>{
//             const o = {x: source.x0, y: source.y0}
//             return this.diagonal(o, o);
//         });
//
//     // UPDATE
//     let linkUpdate = linkEnter.merge(link);
//
//     // Transition back to the parent element position
//     linkUpdate.transition()
//         .duration(this.defaultProps.duration)
//         .attr('d', (d)=>this.diagonal(d, d.parent));
//
//     // Remove any exiting links
//     let linkExit = link.exit().transition()
//         .duration(this.defaultProps.duration)
//         .attr('d', (d)=> {
//             const o = {x: source.x, y: source.y};
//             return this.diagonal(o, o);
//         })
//         .remove();
//
//     // Store the old positions for transition.
//     nodes.forEach(function(d){
//         d.x0 = d.x;
//         d.y0 = d.y;
//     });
//
// }