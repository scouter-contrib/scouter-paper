import connect from "react-redux/es/connect/connect";
import {withRouter} from "react-router-dom";
import React,{Component} from "react";
import * as d3 from "d3";

class XlogFlowRender extends Component {
    state = {
        g: null,
    };

    constructor(props) {
        super(props);

    };

    shouldComponentUpdate() {
        // we will handle moving the nodes on our own with d3.js
        // make React ignore this component
        return false;
    }

    onRef = (ref) => {
        this.setState({ g : d3.select(ref) }, () => this.renderflow(this.props.data))
    };

    renderflow = (data) =>{

    };


    render() {

        return (
            <g ref={this.onRef} className="flows" />
        )
    };

}


const mapStateToProps = (state) => {
    return {
        config: state.config
    };
};

XlogFlowRender = connect(mapStateToProps, undefined)(XlogFlowRender);
export default withRouter(XlogFlowRender);