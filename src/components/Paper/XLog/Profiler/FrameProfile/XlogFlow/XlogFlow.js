import React,{Component} from "react";
import jQuery from "jquery";
import './XlogFlow.css'
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import XlogFlowChart from './XlogFlowChart/XlogFlowChart'
import XlogFlowRender from './XlogFlowChart/XlogFlowRender'
import {getCurrentUser, getHttpProtocol, getWithCredentials, setAuthHeader} from "../../../../../../common/common";
import {addRequest, setControlVisibility} from "../../../../../../actions";
import moment from "moment/moment";

// const url=`/scouter/v1/xlog-data/${yyyymmdd}/gxid/${gxid}`;
class XlogFlow extends Component {

    state = {
        data: []
    };

    constructor(props) {
        super(props);

    };
    componentDidMount() {
        // console.log("componentDidMount");
        //- first create event
        window.addEventListener("resize", this.resize);
        this.loadByGxId();
    }

    componentWillUnmount(){

    }

    componentWillReceiveProps(nextProps){
        console.log("componentWillReceiveProps");
    }

    resize = () =>{

    };

    tryDepFlowSearch(globalTracing){
        //next try step
        const {config, user} = this.props;
        const _promise = globalTracing.map(_tx =>{
            const yyyymmdd = moment(new Date(Number(_tx.endTime))).format("YYYYMMDD");
            const _url = `${getHttpProtocol(config)}/scouter/v1/profile-data/${yyyymmdd}/${_tx.txid}`;
            return jQuery.ajax({
                method: "GET",
                async: true,
                dataType: 'text',
                url: _url,
                xhrFields: getWithCredentials(config),
                beforeSend: function (xhr) {
                    setAuthHeader(xhr, config, getCurrentUser(config, user));
                }
            });
        });
        jQuery.when(_promise).then(result=>{
            const serviceMap = globalTracing.map(_global =>{
                const map = {};
                return map[_global.txid] = {
                    name  : _global.service,
                    objHash : _global.objHash,
                    txid : _global.txid,
                    error : _global.error,
                    xType : _global.xlogType,
                    elapsed : new Number(_global.elapsed),
                    threadName : _global.threadName,
                    tag : {
                        caller : _global.caller,
                        ip : _global.ipAddr
                    }
                }
            });
            let index = 0;
            const depSteps= result.map(_data =>{
                return JSON.parse(_data.responseText);
            }).map(_data =>{
                const  _ret = {
                           txid : serviceMap[index].txid,
                           steps: _data
                        };
                index++;
                return _ret;
            })
            console.log(serviceMap,depSteps);
        });

    }

    loadByGxId(){
        this.props.setControlVisibility("Loading", true);
        this.props.addRequest();
        const {config, user,flow } = this.props;
        // console.log("loadByGxId",flow,user);
        const _url = `${getHttpProtocol(config)}/scouter/v1/xlog-data/${flow.parameter.yyyymmdd}/gxid/${flow.parameter.gxid}`;
        jQuery.ajax({
            method: "GET",
            async: true,
            dataType: 'text',
            url: _url,
            xhrFields: getWithCredentials(config),
            beforeSend: function (xhr) {
                setAuthHeader(xhr, config, getCurrentUser(config, user));
            }
        }).done((msg) => {
            const reponseObj = JSON.parse(msg);
            if(reponseObj.status === "200"){
                this.tryDepFlowSearch(reponseObj.result);
            }
        }).always(() => {
            this.props.setControlVisibility("Loading", false);
        });
    };
    shouldComponentUpdate(nextProps,nextState) {
        if( nextProps.flow !== this.props.flow) {
            return false;
        }
        return true;
    }


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
        config: state.config,
        user: state.user,
        objects: state.target.objects
    };
};
let mapDispatchToProps = (dispatch) => {
    return {
        addRequest: () => dispatch(addRequest()),
        setControlVisibility: (name, value) => dispatch(setControlVisibility(name, value)),
    };
};

XlogFlow = connect(mapStateToProps, mapDispatchToProps)(XlogFlow);
export default withRouter(XlogFlow);