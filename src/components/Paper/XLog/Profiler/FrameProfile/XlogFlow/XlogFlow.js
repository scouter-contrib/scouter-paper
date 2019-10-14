import React,{Component} from "react";
import './XlogFlow.css'
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import XlogFlowChart from './XlogFlowChart/XlogFlowChart'
import XlogFlowRender from './XlogFlowChart/XlogFlowRender'

// const url=`/scouter/v1/xlog-data/${yyyymmdd}/gxid/${gxid}`;
class XlogFlow extends Component {

    state = {
        data: []
    };

    constructor(props) {
        super(props);

    };

//-- event list
    close= () =>{
        this.props.close({
            flow : {
                show : false,
                parameter : {}
            }
        });
    };

//- render
    render() {

        const {data} = this.state;

        return(
            <div className="xlog-flow">
                <div className="title">
                </div>
                <div className="close-btn" onClick={this.close}></div>
                <div className="flow-content">
                    <XlogFlowChart width="100%" height="100%">
                        <XlogFlowRender data={data} />
                    </XlogFlowChart>
                </div>
            </div>
        );
     }
}
const mapStateToProps = (state) => {
    return {
        config: state.config
    };
};

XlogFlow = connect(mapStateToProps, undefined)(XlogFlow);
export default withRouter(XlogFlow);