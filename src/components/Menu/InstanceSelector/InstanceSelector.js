import React, {Component} from 'react';
import './InstanceSelector.css';
import {addRequest, pushMessage, setInstances, clearAllMessage, setControlVisibility} from '../../../actions';
import {connect} from 'react-redux';
import jQuery from "jquery";
import {withRouter} from 'react-router-dom';
import {getHttpProtocol} from '../../../common/common';

class InstanceSelector extends Component {

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

        this.props.addRequest();
        jQuery.ajax({
            method: "GET",
            async: true,
            url: getHttpProtocol(this.props.config) + '/scouter/v1/info/server'
        }).done((msg) => {
            if (msg && msg.result) {
                let hosts = msg.result;

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
                    let instances = [];
                    let activeHostId = null;
                    hosts.forEach((host) => {
                        jQuery.ajax({
                            method: "GET",
                            async: false,
                            url: getHttpProtocol(this.props.config) + '/scouter/v1/object?serverId=' + host.id
                        }).done(function(msg) {
                            instances = msg.result;
                            if (instances && instances.length > 0) {
                                instances.forEach((instance) => {
                                    instanceIds.forEach((id) => {
                                        if (id === Number(instance.objHash)) {
                                            selectedInstances.push(instance);
                                            if (!host.selectedInstanceCount) {
                                                host.selectedInstanceCount = 0;
                                            }
                                            host.selectedInstanceCount++;
                                            // 마지막으로 찾은 호스트 ID로 세팅
                                            activeHostId = host.id;
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

                        let selectedInstanceMap = {};

                        for (let i=0; i<selectedInstances.length; i++) {
                            selectedInstanceMap[selectedInstances[i].objHash] = selectedInstances[i];
                        }

                        this.setState({
                            hosts: hosts,
                            instances : instances,
                            activeHostId : activeHostId,
                            selectedInstances: selectedInstanceMap
                        });

                        this.props.setInstances(selectedInstances);

                    } else {
                        this.setState({
                            hosts: hosts
                        });
                    }

                } else {
                    this.setState({
                        hosts: hosts
                    });
                }
            }

        }).fail((jqXHR, textStatus) => {
            console.log(jqXHR, textStatus);
        });



    }

    getHosts = () => {
        this.props.addRequest();
        jQuery.ajax({
            method: "GET",
            async: true,
            url: getHttpProtocol(this.props.config) + '/scouter/v1/info/server'
        }).done((msg) => {
            this.setState({
                hosts: msg.result
            });
        }).fail((jqXHR, textStatus) => {
            console.log(jqXHR, textStatus);
        });

    };

    componentDidUpdate(prevProps, prevState) {
        if (this.props.visible && prevProps.visible !== this.props.visible) {
            if (!this.state.hosts || this.state.hosts.length < 1) {
                this.getHosts();
            }

        }
    }

    onHostClick = (hostId) => {
        this.setState({
            activeHostId: hostId
        });

        this.props.addRequest();
        jQuery.ajax({
            method: "GET",
            async: true,
            url: getHttpProtocol(this.props.config) + '/scouter/v1/object?serverId=' + hostId
        }).done((msg) => {
            this.setState({
                instances: msg.result
            });
        }).fail((jqXHR, textStatus) => {
            console.log(jqXHR, textStatus);
        });
    };

    instanceClick = (instance) => {

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
            this.props.pushMessage("info", "NO MONITORING TARGET", "At least one instance must be selected");
            this.props.setControlVisibility("Message", true);
        } else {
            this.props.setInstances(instances);
            this.props.setControlVisibility("TargetSelector", false);

            this.props.history.push({
                pathname: '/paper',
                search: '?instances=' + instances.map((d) => {return d.objHash})
            });

            this.props.toggleSelectorVisible();
        }


    };

    cancelClick = () => {
        this.props.toggleSelectorVisible();
    };

    render() {
        return (
            <div className={"instance-selector-bg " + (this.props.visible ? "" : "hidden")}>
            <div className="instance-selector">
                <div className="instance-selector-content">
                    <div className="host-list">
                        <div className="title">
                            <div>HOSTS</div>
                        </div>
                        {this.state.hosts && this.state.hosts.map((host, i) => {
                                return (<div className={'host ' + (i === 0 ? 'first ' : ' ') + (host.id === this.state.activeHostId ? 'active ' : ' ')} key={i} onClick={this.onHostClick.bind(this, host.id)}>{host.name}{host.selectedInstanceCount > 0 && <span className="host-selected-count">{host.selectedInstanceCount}</span>}</div>)
                            }
                        )}
                    </div>
                    <div className="instance-list">
                        <div className="title">
                            <div>INSTANCES</div>
                        </div>
                        {this.state.instances && this.state.instances.filter((instance) => {
                            return instance.objFamily === 'javaee';
                        }).map((instance, i) => {
                            return (<div key={i} className={"instance " +  (i === 0 ? 'first ' : ' ') + (!(!this.state.selectedInstances[instance.objHash]) ? "selected" : " ")} onClick={this.instanceClick.bind(this, instance)}>{instance.objName}</div>)
                        })}
                    </div>
                </div>
                <div className="buttons">
                    <button onClick={this.cancelClick}>CANCEL</button><button onClick={this.setInstances}>APPLY</button>
                </div>
            </div>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        instances: state.target.instances,
        config: state.config
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        setInstances: (instances) => dispatch(setInstances(instances)),
        setControlVisibility: (name, value) => dispatch(setControlVisibility(name, value)),
        clearAllMessage: () => dispatch(clearAllMessage()),
        pushMessage: (category, title, content) => dispatch(pushMessage(category, title, content)),
        addRequest: () => dispatch(addRequest()),
    };
};

InstanceSelector = connect(mapStateToProps, mapDispatchToProps)(InstanceSelector);

export default withRouter(InstanceSelector);