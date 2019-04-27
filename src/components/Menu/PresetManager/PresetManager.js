import React, {Component} from 'react';
import './PresetManager.css';
import {getData, setData} from '../../../common/common';
import {setControlVisibility, pushMessage, setPresetName} from '../../../actions';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import 'url-search-params-polyfill';
import jQuery from "jquery";
import {errorHandler, setAuthHeader, getWithCredentials, getHttpProtocol, getCurrentUser} from '../../../common/common';
import InnerLoading from "../../InnerLoading/InnerLoading";
import IconImage from "../../IconImage/IconImage";

class PresetManager extends Component {

    constructor(props) {
        super(props);
        this.state = {
            presets: [],
            selectedPresetNo : null,
            selectedEditNo : null,
            editText : null,
            loading : false
        };
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.visible && nextProps.visible) {
            this.loadPresets(nextProps.config, nextProps.user);
        }
    }

    componentDidMount() {
        this.loadPresets(this.props.config, this.props.user);
    }

    savePreset = (presets) => {
        let that = this;
        let data = {
            key : "__scouter_paper_preset",
            value : JSON.stringify(presets)
        };

        this.setState({
            loading : true
        });

        jQuery.ajax({
            method: "PUT",
            async: true,
            url: getHttpProtocol(this.props.config) + "/scouter/v1/kv",
            xhrFields: getWithCredentials(this.props.config),
            contentType : "application/json",
            data : JSON.stringify(data),
            beforeSend: function (xhr) {
                setAuthHeader(xhr, that.props.config, getCurrentUser(that.props.config, that.props.user));

            }
        }).done((msg) => {
            if (msg && Number(msg.status) === 200) {
                that.setState({
                    presets : presets
                });
            }
        }).fail((xhr, textStatus, errorThrown) => {
            errorHandler(xhr, textStatus, errorThrown, this.props, "savePreset", true);
        }).always(() => {
            this.setState({
                loading : false
            });
        });
    };

    loadPresets = (config, user) => {
        this.setState({
            loading : true
        });

        jQuery.ajax({
            method: "GET",
            async: true,
            url: getHttpProtocol(config) + "/scouter/v1/kv/__scouter_paper_preset",
            xhrFields: getWithCredentials(config),
            beforeSend: function (xhr) {
                setAuthHeader(xhr, config, getCurrentUser(config, user));
            }
        }).done((msg) => {
            if (msg && Number(msg.status) === 200) {
                if (msg.result) {
                    let list = JSON.parse(msg.result);
                    if (list && list.length > 0) {
                        this.setState({
                            presets : list,
                            selectedPresetNo : null,
                            selectedEditNo : null
                        });
                    }
                }
            }
        }).fail((xhr, textStatus, errorThrown) => {
            errorHandler(xhr, textStatus, errorThrown, this.props, "loadPresets", true);
        }).always(() => {
            this.setState({
                loading : false
            });
        });
    };

    cancelClick = () => {
        this.props.closeSelectorPopup();
    };

    deleteClick = () => {
        if (this.state.selectedPresetNo === null) {
            this.props.pushMessage("info", "NO PRESET SELECTED", "select preset to delete first");
            this.props.setControlVisibility("Message", true);
        } else {
            let presets = this.state.presets.slice(0);
            for (let i=0; i<presets.length; i++) {
                let preset = presets[i];

                if (preset.no === this.state.selectedPresetNo) {
                    presets.splice(i, 1);
                    break;
                }
            }

            for (let i=0; i<presets.length; i++) {
                presets[i].no = i+1;
            }

            this.setState({
                presets : presets,
                selectedPresetNo : null,
                selectedEditNo : null
            });

            this.savePreset(presets);
        }
    };

    loadClick = () => {
        if (this.state.selectedPresetNo === null) {
            this.props.pushMessage("info", "NO PRESET SELECTED", "select preset to load first");
            this.props.setControlVisibility("Message", true);
        } else {
            for (let i=0; i<this.state.presets.length; i++) {
                let preset = this.state.presets[i];

                if (preset.no === this.state.selectedPresetNo) {
                    setData("templateName", Object.assign({}, getData("templateName"), {preset: preset.name}));
                    this.props.setPresetName(preset.name);
                    this.props.applyPreset(preset);
                    this.props.closeSelectorPopup();
                    localStorage.setItem("selectedObjects", JSON.stringify(preset));
                    /*
                    this.props.togglePresetManager();

                    const server = getCurrentDefaultServer(this.props.config);
                    let newUrl = updateQueryStringParameter(window.location.href, "objects", preset.objects);
                    newUrl = updateQueryStringParameter(newUrl, "address", server.address);
                    newUrl = updateQueryStringParameter(newUrl, "port", server.port);
                    newUrl = updateQueryStringParameter(newUrl, "authentification", server.authentification);
                    window.location.href = newUrl;
                    window.history.go(0);
                    */

                    break;
                }
            }
        }

    };

    presetClick = (no) => {
        this.setState({
            selectedPresetNo : no
        });
    };

    editClick = (no, name) => {
        this.setState({
            selectedEditNo : no,
            editText : name
        });
    };

    updateClick = (no) => {
        let presets = this.state.presets.slice(0);
        for (let i=0; i<presets.length; i++) {
            let preset = presets[i];
            if (preset.no === no) {
                preset.name = this.state.editText;
                if (preset.instances) {
                    if (!preset.objects) {
                        preset.objects = [];
                    }
                    preset.objects = preset.objects.concat(preset.instances);
                    delete preset.instances;
                }

                if (preset.hosts) {
                    if (!preset.objects) {
                        preset.objects = [];
                    }
                    preset.objects = preset.objects.concat(preset.hosts);
                    delete preset.hosts;
                }

                this.setState({
                    presets : presets,
                    selectedPresetNo : null,
                    selectedEditNo : null
                });
                break;
            }
        }
        this.savePreset(presets);
    };

    onTextChange = (event) => {
        this.setState({
            editText: event.target.value
        });
    };

    showSelector = () => {
        this.props.toggleSelectorVisible();
    };

    render() {
        return (
            <div className="preset-manager-bg"  onClick={this.cancelClick}>
                <div>
                    <div className="selector-type-btns" onClick={(e) => e.stopPropagation()}>
                        <div onClick={this.showSelector}>SERVER NAVIGATOR</div>
                        <div  className="selected">PRESET MANAGER</div>
                    </div>
                    <div className="preset-manager popup-div" onClick={(e) => e.stopPropagation()}>
                        <div className="title">
                            <div>PRESETS</div>
                        </div>
                        <div className="content-ilst scrollbar">
                            {(this.state.presets && this.state.presets.length > 0) &&
                            <ul>
                                {this.state.presets.map((d, i) => {
                                    let objectLength = 0;

                                    if (d.objects) {
                                        objectLength = d.objects.length;
                                    } else {
                                        if (d.instances) {
                                            objectLength = d.instances.length;
                                        }
                                        if (d.hosts) {
                                            objectLength += d.hosts.length;
                                        }
                                    }

                                    return (<li key={i} className={d.no === this.state.selectedPresetNo ? 'selected' : ''} onClick={this.presetClick.bind(this, d.no)}>
                                        <div>
                                            <div>
                                                <div>
                                                    {(d.no !== this.state.selectedEditNo) && <span className="name">{d.name}</span>}
                                                    {(d.no === this.state.selectedEditNo) && <span className="name edit"><input type="text" value={this.state.editText} onChange={this.onTextChange.bind(this )} /></span>}
                                                    {(d.no !== this.state.selectedEditNo) && <span className="edit-btn" onClick={this.editClick.bind(this, d.no, d.name)}>EDIT</span>}
                                                    {(d.no === this.state.selectedEditNo) && <span className="done-btn" onClick={this.updateClick.bind(this, d.no)}>DONE</span>}
                                                </div>
                                                <div className="summary-info">
                                                    <span>{objectLength} OBJECTS</span>
                                                    <div className="icon-list">
                                                        {d.iconMap && Object.keys(d.iconMap).map((icon, i) => {
                                                            return <div className="icon-item" key={i}><IconImage icon={icon}/></div>
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>)
                                })}
                            </ul>
                            }
                            {(!this.state.presets || this.state.presets.length < 1) && <div className="empty-content">NO PRESET</div>}
                        </div>
                        <div className="buttons">
                            <button className="delete-btn" onClick={this.deleteClick}>DELETE</button>
                            <button className="cancel-btn" onClick={this.cancelClick}>CANCEL</button>
                            <button className="load-btn" onClick={this.loadClick}>LOAD</button>
                        </div>
                        <InnerLoading visible={this.state.loading}></InnerLoading>
                    </div>
                </div>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        objects: state.target.objects,
        config: state.config,
        user: state.user,
        counterInfo: state.counterInfo
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        setControlVisibility: (name, value) => dispatch(setControlVisibility(name, value)),
        pushMessage: (category, title, content) => dispatch(pushMessage(category, title, content)),
        setPresetName: (preset) => {
            localStorage.setItem("preset", JSON.stringify(preset));
            return dispatch(setPresetName(preset));
        }
    };
};

PresetManager = connect(mapStateToProps, mapDispatchToProps)(PresetManager);

export default withRouter(PresetManager);
