import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import './TopologyMetaInfo.css';


class TopologyMetaInfo extends Component {

    // constructor(props) {
    //     super(props);
    // }
    _isDisplay( ){
        return 'show';
    };

    hideClick= () =>{

    };

    getNodeItemList=()=>{
        console.log(this.props.node);
    };

    render() {
        const items = this.getNodeItemList();
        const {_isDisplay,hideClick} = this;
        return (
            <div className={`topology-meta-info ${_isDisplay()}`} >
                <div className="top-control">
                    <div className="title"></div>
                    <button onClick={hideClick}>HIDE</button>
                </div>
              <ul className="scrollbar">
                <li>
                   <div>
                       <span></span>
                   </div>
                   <div >

                   </div>
                </li>
              </ul>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        config: state.config,
        range: state.range
    };
};


TopologyMetaInfo = connect(mapStateToProps)(TopologyMetaInfo);
export default withRouter(TopologyMetaInfo);