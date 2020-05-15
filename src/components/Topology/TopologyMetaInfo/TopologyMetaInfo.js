import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import numeral from "numeral";
import './TopologyMetaInfo.css';

const formatFunc = (x,setting) => {
    return numeral(x).format(setting);
};

class TopologyMetaInfo extends Component {

    constructor(props) {
        super(props);
        this.state = {
            forceHide: false
        };
    };

    componentWillReceiveProps(nextProps) {
        if(this.props.node !== nextProps.node){
            this.setState({
                forceHide: true
            })
        }
    };
    _isDisplay( ){
        return this.state.forceHide?'show': 'hide';
    };

    hideClick= () =>{
        const {forceHide} = this.state;
        this.setState({
            forceHide: !forceHide
        })
    };

    getNodeItemList=()=>{
        if(this.props.node){
            const {objTypeFamily,objName,id} = this.props.node;

            const _ext = this.props.nameDic.get(objTypeFamily === "javaee" ? objName : id);

            return ( Array.isArray(_ext) ? _ext : [_ext] )
                   .map(dp=> {
                        let counter = [dp, 0, 0, 0];
                        if (objTypeFamily === "javaee") {
                            counter = this.props.counterDic.get(dp);
                        } else {
                            counter = this.props.counterDic.get([id, dp].join('-'));
                        }

                        return counter;
                    })
                    .filter(v => v ? true : false );


        }else{
            return [];
        }
    };
    render() {

        const items = this.getNodeItemList();
        return (
            <div className={`topology-meta-info ${this._isDisplay()}`} >
                <div className="top-control">
                    <div className="meta-info">{this.props.node? this.props.node.id : 'UNKNOWN-ID'}</div>
                    <div className="hide-button">
                        <button onClick={this.hideClick}>HIDE</button>
                    </div>
                </div>
                <div className="divTable blueTable">
                    <div className="divTableHeading">
                        <div className="divTableRow">
                        {['NAME','TPS','ERROR RATE','ELAPSED TIME'].map(h=>{
                            return(
                                <div className="divTableHead" key={h}>{h}</div>
                            )
                        })}
                        </div>
                    </div>
                    <div className="divTableBody">
                        { items.map((item,i)=>{
                            const [name, tps, errorRate, avgElasp]=item;
                            const {id} = this.props.node;
                            return (
                                <div className="divTableRow" key={name}>
                                    <div className="divTableCell" >{this.props.trimDic(id,name)}</div>
                                    <div className="divTableCell" >{formatFunc(tps,this.props.config.numberFormat)}</div>
                                    <div className="divTableCell" >{formatFunc(errorRate,this.props.config.numberFormat)}</div>
                                    <div className="divTableCell" >{formatFunc(avgElasp,this.props.config.numberFormat)}</div>
                                </div>
                            )
                            })
                        }

                   </div>
                </div>
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