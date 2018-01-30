import React, {Component} from 'react';
import './Visitor.css';
import * as d3 from "d3";

class Visitor extends Component {

    lastVisitorTime = null;

    graph = {
        margin: {
            top: 30, right: 40, bottom: 30, left: 40
        },
        svg: null,
        width: null,
        height: null,
        x: null,
        y: null,
        path: null,
        maxY : null
    };

    constructor(props) {
        super(props);
        this.state = {
            visitors: [],
            small : false
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

            let maxY = d3.max(this.state.visitors, function (d) {
                return d.visitor;
            });

            if (maxY < 10) {
                maxY = 10;
            }

            this.setState({
                visitors: visitors,
                maxY : maxY
            });

        }

        let box = this.refs.visitor.parentNode.parentNode.parentNode;
        if (box.offsetWidth < 300) {
            if (!this.state.small) {
                this.setState({
                    small : true
                });
            }
        } else {
            if (this.state.small) {
                this.setState({
                    small : false
                });
            }
        }
    }

    componentDidUpdate = (prevProps, prevState) => {

        if (this.props.box.values.showGraph) {
            this.graphInit();
        }

        this.graphResize();
        this.draw();


    };

    draw = () => {
        let that = this;

        if (this.props.box.values.showGraph) {
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


                /*this.graph.svg.select(".y-axis").transition().duration(500).call(d3.axisLeft(that.graph.y).ticks(5));
                this.graph.svg.select(".y-axis").selectAll(".tick line").remove();
                this.graph.svg.select(".y-axis").selectAll(".domain").remove();*/
            }
        } else {
            let svg = d3.select(this.refs.visitor).select("svg");
            if (svg.size() > 0) {
                svg.remove();
            }
        }



    };

    componentDidMount() {
        this.graphInit();
    }

    shouldComponentUpdate() {
        return true;
    }

    graphResize = () => {
        let box = this.refs.visitor.parentNode.parentNode.parentNode;
        if ((box.offsetWidth - this.graph.margin.left - this.graph.margin.right !== this.graph.width) || (this.graph.height !== box.offsetHeight - this.graph.margin.top - this.graph.margin.bottom - 27)) {
            this.graphInit();
        }
    };

    graphInit = () => {

        if (!this.props.box.values.showGraph) {
            return;
        }

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

        if (box.clientHeight < 200) {
            this.graph.margin.top = 10;
            this.graph.margin.bottom = 10;
        } else {
            this.graph.margin.top = 30;
            this.graph.margin.bottom = 30;
        }

        if (box.clientWidth < 300) {
            this.graph.margin.left = 30;
            this.graph.margin.right = 30;
        } else {
            this.graph.margin.left = 40;
            this.graph.margin.right = 40;
        }

        /*this.graph.svg.append("g").attr("class", "y-axis").call(d3.axisLeft(this.graph.y).ticks(5));
        this.graph.svg.select(".y-axis").selectAll(".tick line").remove();
        this.graph.svg.select(".y-axis").selectAll(".domain").remove();*/

    };

    render() {
        return (
            <div className="visitor" ref="visitor">
                {/*{this.state.visitors && this.state.visitors.length}*/}
                {(this.props.box.values.showGraph && (this.props.box.values.showAxis === "BOTH" || this.props.box.values.showAxis === "LEFT")) &&
                <div className="axix-y left" style={{width : this.graph.margin.left + "px", top : this.graph.margin.top + "px", bottom : this.graph.margin.bottom + "px"}}>
                    <div className="top">{this.state.maxY}</div>
                    <div className="middle">{(this.state.maxY && !isNaN(this.state.maxY)) &&  Math.round(this.state.maxY / 2)}</div>
                    <div className="bottom">0</div>
                </div>}
                {(this.props.box.values.showGraph && (this.props.box.values.showAxis === "BOTH" || this.props.box.values.showAxis === "RIGHT")) &&
                <div className="axix-y right" style={{width : this.graph.margin.left + "px", top : this.graph.margin.top + "px", bottom : this.graph.margin.bottom + "px"}}>
                    <div className="top">{this.state.maxY}</div>
                    <div className="middle">{(this.state.maxY && !isNaN(this.state.maxY)) &&  Math.round(this.state.maxY / 2)}</div>
                    <div className="bottom">0</div>
                </div>}
                {(this.props.box.values.showNumber && this.props.visitor) &&
                <div className={"visitor-numbers " + (this.state.small ? 'small' : '')}>
                    <div>
                        <div>{this.props.visitor.visitor}</div>
                    </div>
                </div>
                }
            </div>
        );
    }
}


export default Visitor;
