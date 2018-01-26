import React, {Component} from 'react';
import './Visitor.css';
import * as d3 from "d3";

class Visitor extends Component {

    lastVisitorTime = null;

    graph = {
        margin: {
            top: 30, right: 20, bottom: 30, left: 40
        },
        svg: null,
        width: null,
        height: null,
        x: null,
        y: null,
        path: null
    };

    constructor(props) {
        super(props);
        this.state = {
            visitors: []
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.visitor && nextProps.visitor.time !== this.lastVisitorTime) {
            this.lastVisitorTime = nextProps.visitor.time;
            let visitors = this.state.visitors.slice(0);
            visitors.push(nextProps.visitor);

            if (false) {
                if (visitors.length > 0) {
                    let lastestTime = visitors[visitors.length - 1].time;
                    let overflowIndex = -1;
                    for (let i = (visitors.length - 1); i >= 0; i--) {
                        if (lastestTime - visitors[i].time > (this.props.box.values.range * 1000)) {
                            overflowIndex = i;
                            break;
                        }
                    }

                    if (overflowIndex > 0) {
                        visitors.splice(0, (overflowIndex + 1));
                    }
                }
            } else {
                if (visitors.length > this.props.box.values.range) {
                    let overflowCnt = visitors.length - this.props.box.values.range;
                    visitors.splice(0, overflowCnt);
                }
            }

            console.log(visitors.length);

            this.setState({
                visitors: visitors
            });
        }
    }

    componentDidUpdate = (prevProps, prevState) => {
        this.resize();
        this.draw();
    };

    draw = () => {

        let that = this;
        if (this.refs.visitor && this.graph.svg) {

            this.graph.x.domain(d3.extent(this.state.visitors, function (d) {
                return d.time;
            }));

            let maxY = d3.max(this.state.visitors, function (d) {
                return d.visitor;
            });

            if (maxY < 10) {
                maxY = 10;
            }

            this.graph.y.domain([0, maxY]);


            var valueline = d3.line().curve(d3.curveCardinal)
                .x(function (d) {
                    return that.graph.x(d.time);
                })
                .y(function (d) {
                    return that.graph.y(d.visitor);
                });

            this.graph.path.selectAll(".line").remove().exit();
            this.graph.path.data([that.state.visitors]).transition().duration(500).attr("class", "line").attr("d", valueline);
            this.graph.svg.select(".y-axis").transition().duration(500).call(d3.axisLeft(that.graph.y).ticks(5));
            this.graph.svg.select(".y-axis").selectAll(".tick line").remove();
            this.graph.svg.select(".y-axis").selectAll(".domain").remove();
        }
    };

    componentDidMount() {
        this.graphInit();
    }

    shouldComponentUpdate() {
        return true;
    }

    resize = () => {
        this.graphResize();
    };

    graphResize = () => {
        let box = this.refs.visitor.parentNode.parentNode.parentNode;
        if ((box.offsetWidth - this.graph.margin.left - this.graph.margin.right !== this.graph.width) || (this.graph.height !== box.offsetHeight - this.graph.margin.top - this.graph.margin.bottom - 27)) {
            this.graphInit();
        }
    };

    graphInit = () => {
        let box = this.refs.visitor.parentNode.parentNode.parentNode;
        this.graph.width = box.offsetWidth - this.graph.margin.left - this.graph.margin.right;
        this.graph.height = box.offsetHeight - this.graph.margin.top - this.graph.margin.bottom - 27;

        let svg = d3.select(this.refs.visitor).select("svg");
        if (svg.size() > 0) {
            svg.remove();
        }

        this.graph.svg = d3.select(this.refs.visitor).append("svg").attr("width", this.graph.width + this.graph.margin.left + this.graph.margin.right).attr("height", this.graph.height + this.graph.margin.top + this.graph.margin.bottom).append("g").attr("class", "top-group").attr("transform", "translate(" + this.graph.margin.left + "," + this.graph.margin.top + ")");

        this.graph.x = d3.scaleTime().range([0, this.graph.width]);
        this.graph.y = d3.scaleLinear().range([this.graph.height, 0]);

        this.graph.path = this.graph.svg.append("path");

        this.graph.x.domain(d3.extent(this.state.visitors, function (d) {
            return d.time;
        }));

        let maxY = d3.max(this.state.visitors, function (d) {
            return d.visitor;
        });

        if (maxY < 10) {
            maxY = 10;
        }

        this.graph.y.domain([0, maxY]);


        this.graph.svg.append("g").attr("class", "y-axis").call(d3.axisLeft(this.graph.y).ticks(5));
        this.graph.svg.select(".y-axis").selectAll(".tick line").remove();
        this.graph.svg.select(".y-axis").selectAll(".domain").remove();

    };

    render() {

        //console.log(this.props.box);
        return (
            <div className="visitor" ref="visitor">
                {/*{this.state.visitors && this.state.visitors.length}*/}
            </div>
        );
    }
}


export default Visitor;
