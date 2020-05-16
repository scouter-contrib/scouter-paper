import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import numeral from "numeral";
import './TopologyMetaInfo.css';

const formatFunc = (x,setting) => {
    return numeral(x).format(setting);
};
const cpuValueFunc = (x,setting) =>{
    if(typeof  x === 'object') {
        return x.hasOwnProperty('value') ? formatFunc(x.value,setting) : '0';
    }else{
        return '0'
    }
};
const activeValueFunc = (x) =>{
    if(typeof  x === 'object') {
        return x.hasOwnProperty('value') ? (Array.isArray(x.value) ? x.value.map(d => Number(d)).reduce((x,y)=>x+y,0) : x.value )  : '0';
    }else{
        return '0'
    }
};
const defaultStyle ={
    fontFamily: "'Righteous', 'Nanum Gothic', cursive",
    fontSize: "12px",
    fontWeight: "bold",
    color: "rgb(0, 0, 0, 0.6)"
};
const defaultItemStyle ={
    fontFamily: "'Righteous', 'Nanum Gothic', cursive",
    fontSize: "11px",
    color: "white",
    marginLeft: "10px"
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
            if(!this.state.forceHide) {
                this.setState({
                    forceHide: true
                })
            }
        }
        if(this.props.objects !== nextProps.objects){
            if(this.state.forceHide) {
                this.setState({
                    forceHide: false
                })
            }
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
                        let counter = [dp, 0, 0, 0, 0, 0, 0 , 0 ];
                        if (objTypeFamily === "javaee") {
                            counter = this.props.counterDic.get(dp);
                        } else {
                            counter = this.props.counterDic.get([id, dp].join('-'));
                        }

                        return counter;
                    })
                    .filter(v => v ? true : false )
                    .sort((a,b) => a[0].localeCompare(b[0]));


        }else{
            return [];
        }
    };
    _getCategoryStyle=()=>{


      if( this.props.node ){
          const style = this.props.sytleInfo[this.props.node.objCategory];
          if(style){
              return {
                  fontFamily: "'Righteous', 'Nanum Gothic', cursive",
                  fontSize: `12px`,
                  color: style.color,
                  fontWeight: "bold",
              }
          }

      }
      return defaultStyle;
    };
    render() {
        const items = this.getNodeItemList();
        return (
            <div className={`topology-meta-info ${this._isDisplay()} scrollbar` } >
                <div className="top-control">
                    <div className="meta-info">
                        <span style={this._getCategoryStyle()}>{this.props.node? `${this.props.node.objCategory.toUpperCase()}` : 'UNKNOWN-ID'}</span>
                        <span style={defaultItemStyle}>{items? `${items.length} target` : ''}</span>
                    </div>
                    <div className="hide-button">
                        <button onClick={this.hideClick}>HIDE</button>
                    </div>
                </div>
                <div className="divTable blueTable">
                    <div className="divTableHeading">
                        <div className="divTableRow">
                        {['NAME','TPS','ERROR RATE','ELAPSED TIME','FROM CPU','TO CPU','FROM ACTIVE','TO ACTIVE'].map(h=>{
                            return(
                                <div className="divTableHead" key={h}>{h}</div>
                            )
                        })}
                        </div>
                    </div>
                    <div className="divTableBody">
                        { items.map((item,i)=>{
                            const [name, tps, errorRate, avgElasp,fromCpu,toCpu, fromActive, toActive]=item;
                            const {id} = this.props.node;
                            return (
                                <div className="divTableRow" key={name}>
                                    <div className="divTableCell" >{this.props.trimDic(id,name)}</div>
                                    <div className="divTableCell" >{formatFunc(tps,this.props.config.numberFormat)}</div>
                                    <div className="divTableCell" >{formatFunc(errorRate,this.props.config.numberFormat)}</div>
                                    <div className="divTableCell" >{formatFunc(avgElasp,this.props.config.numberFormat)}</div>
                                    <div className="divTableCell" >{cpuValueFunc(fromCpu,this.props.config.numberFormat)}</div>
                                    <div className="divTableCell" >{cpuValueFunc(toCpu,this.props.config.numberFormat)}</div>
                                    <div className="divTableCell" >{activeValueFunc(fromActive)}</div>
                                    <div className="divTableCell" >{activeValueFunc(toActive)}</div>
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
        range: state.range,
        objects: state.objects
    };
};


TopologyMetaInfo = connect(mapStateToProps)(TopologyMetaInfo);
export default withRouter(TopologyMetaInfo);