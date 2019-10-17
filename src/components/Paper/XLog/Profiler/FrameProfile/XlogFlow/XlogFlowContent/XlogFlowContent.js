import React,{Component} from "react";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import "./XlogFlowContent.css"
import {IdAbbr} from "../../../../../../../common/idAbbr";
class XlogFlowContent extends Component {

    close=()=>{
        this.props.close();
    };

    render(){
        return (
            <div className="xlog-flow-content">
                <div className="title">
                    <span>FLOW CONTENTS - {IdAbbr.abbr(this.props.content.txid)}</span>
                </div>
                <div className="close-btn" onClick={this.close}></div>
                <div className="contents">
                    <pre>
                        {this.props.content.name}
                    </pre>
                </div>
            </div>
        )
    }
}
const mapStateToProps = (state) => {
    return {
        config: state.config,
    };
};
XlogFlowContent = connect(mapStateToProps, null)(XlogFlowContent);
export default withRouter(XlogFlowContent);