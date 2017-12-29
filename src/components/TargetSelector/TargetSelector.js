import React, {Component} from 'react';
import './TargetSelector.css';
import axios from 'axios';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {setInstances, setControlVisibility, pushMessage} from '../../actions';
import {TargetHost} from '../../components';
import TargetInstance from "./TargetInstance/TargetInstance";
import jQuery from "jquery";
window.$ = window.jQuery = jQuery;


class TargetSelector extends Component {

    url = "http://localhost:6188";

    constructor(props) {
        super(props);
        this.state = {
            hosts: [],
            instances: [],
            activeHostId: null,
            selectedInstances: {}
        };
    }

    componentDidMount() {

        // get server info
        axios.get(this.url + '/scouter/v1/info/server').then(response => {
            if (response && response.data && response.data.result) {
                let hosts = response.data.result;

                // GET INSTANCES INFO FROM URL IF EXISTS
                let instancesParam = new URLSearchParams(this.props.location.search).get('instances');
                let instanceIds = null;
                if (instancesParam) {
                    instanceIds = instancesParam.split(",");
                    if (instanceIds) {
                        instanceIds = instanceIds.map((d) => {return Number(d)});
                    }
                }



                if (instanceIds) {
                    let selectedInstances = [];
                    hosts.forEach((host) => {
                        jQuery.ajax({
                            method: "GET",
                            async: false,
                            url: this.url + '/scouter/v1/object?serverId=' + host.id
                        }).done(function(msg) {
                            let instances = msg.result;
                            if (instances && instances.length > 0) {
                                instances.forEach((instance) => {
                                    instanceIds.forEach((id) => {
                                        if (id === Number(instance.objHash)) {
                                            selectedInstances.push(instance);
                                        }
                                    });
                                })
                            }
                        }).fail(function(jqXHR, textStatus) {
                            console.log(jqXHR, textStatus);
                        });
                    });

                    // LUCKY! FIND ALL INSTANCE
                    if (instanceIds.length === selectedInstances.length) {
                        this.props.setInstances(selectedInstances);
                        this.props.setControlVisibility("TargetSelector", false);
                    } else {
                        this.setState({
                            hosts: hosts
                        });
                        this.props.setControlVisibility("TargetSelector", true);
                    }

                } else {
                    this.setState({
                        hosts: hosts
                    });
                    this.props.setControlVisibility("TargetSelector", true);
                }


            }
        }).catch(error => {
            if (!error.status) {
                this.props.pushMessage("error", "네트워크 오류", "서버에 접속할 수 없습니다");
                this.props.setControlVisibility("Message", true);
            }
        });

    }

    onHostClick = (hostId) => {
        this.setState({
            activeHostId: hostId
        });

        //http://localhost:6188/scouter/v1/object?serverId=12222
        axios.get(this.url + '/scouter/v1/object?serverId=' + hostId).then(response => {
            if (response && response.data && response.data.result) {
                this.setState({
                    instances: response.data.result
                });
            }
        }).catch(response => {
            console.log(response);
        });
    };

    onInstanceClick = (instance) => {
        let selectedInstances = this.state.selectedInstances;
        if (selectedInstances[instance.objHash]) {
            delete selectedInstances[instance.objHash];
        } else {
            selectedInstances[instance.objHash] = instance;
        }

        let selectedInstanceCount = 0;
        for (let attr in selectedInstances) {
            for (let i = 0; i < this.state.instances.length; i++) {
                if (this.state.instances[i].objHash === attr) {
                    selectedInstanceCount++;
                }
            }
        }

        let hosts = this.state.hosts;
        for (let i = 0; i < hosts.length; i++) {
            if (hosts[i].id === this.state.activeHostId) {
                hosts[i].selectedInstanceCount = selectedInstanceCount;
            }
        }

        this.setState({
            hosts: hosts,
            selectedInstances: selectedInstances
        });
    };

    setInstances = () => {
        let instances = [];
        for (let hash in this.state.selectedInstances) {
            instances.push(this.state.selectedInstances[hash]);
        }

        if (instances.length < 1) {
            this.props.pushMessage("info", "선택된 모니터링 대상이 없습니다", "적어도 하나 이상의 인스턴스가 선택되어야 합니다");
            this.props.setControlVisibility("Message", true);
        } else {
            this.props.setInstances(instances);
            this.props.setControlVisibility("TargetSelector", false);

            this.props.history.push({
                pathname: '/realtime',
                search: '?instances=' + instances.map((d) => {return d.objHash})
            })
        }
    };

    hideTargetSelector = () => {
        this.props.setControlVisibility("TargetSelector", false);
    };

    render() {
        return (
            <div className="target-selector">
                <h2><i className="fa fa-info-circle" aria-hidden="true"></i> 모니터링 대상을 선택해주세요</h2>
                <div className="target-box">
                    <div>
                        <div className="first">
                            <div className="target-box-host">
                                <ul>
                                    {this.state.hosts && this.state.hosts.map((host, i) => {
                                        return (
                                            <TargetHost key={i} host={host} onHostClick={this.onHostClick.bind(this)}
                                                        active={host.id === this.state.activeHostId}/>
                                        )
                                    })}
                                </ul>
                            </div>
                        </div>
                        <div className="second">
                            <div className="target-box-instance">
                                {!this.state.activeHostId &&
                                <div className="message">
                                    <span><i className="fa fa-envelope-open-o" aria-hidden="true"></i></span>
                                </div>
                                }
                                {this.state.instances &&
                                <ul>
                                    {this.state.instances.filter((instance) => {
                                        return true;
                                        return instance.objType === 'tomcat';
                                    }).map((instance, i) => {
                                        return (
                                            <TargetInstance key={i} instance={instance}
                                                            onInstanceClick={this.onInstanceClick}
                                                            selected={!(!this.state.selectedInstances[instance.objHash])}/>
                                        )
                                    })}
                                </ul>}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="target-selector-buttons">
                    <button className="btn" onClick={this.hideTargetSelector}>취소</button>
                    <button className="btn" onClick={this.setInstances}>설정</button>
                </div>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        instances: state.target.instances
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        setInstances: (instances) => dispatch(setInstances(instances)),
        setControlVisibility: (name, value) => dispatch(setControlVisibility(name, value)),
        pushMessage: (category, title, content) => dispatch(pushMessage(category, title, content))

    };
};

TargetSelector = connect(mapStateToProps, mapDispatchToProps)(TargetSelector);

export default withRouter(TargetSelector);