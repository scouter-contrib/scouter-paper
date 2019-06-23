import React, {Component} from 'react';
import './LayoutManager.css';
import {setTemplate, setControlVisibility, pushMessage, setLayoutName} from '../../../actions';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {getData, setData} from '../../../common/common';
import 'url-search-params-polyfill';
import jQuery from "jquery";
import {errorHandler, setAuthHeader, getWithCredentials, getHttpProtocol, getCurrentUser} from '../../../common/common';
import ReactTooltip from 'react-tooltip'

class LayoutManager extends Component {

    constructor(props) {
        super(props);
        this.state = {
            templates: [],
            selectedTemplateNo: null,
            selectedEditNo: null,
            editText: null,
            visible: false,
            savedNo: null
        };
    }

    componentDidMount() {
        this.loadTemplates(this.props.config, this.props.user);
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.visible && nextProps.visible) {
            this.loadTemplates(nextProps.config, nextProps.user);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        ReactTooltip.rebuild();
    }

    saveTemplate = (templates) => {
        let that = this;
        let data = {
            key: "__scouter_paper_layout",
            value: JSON.stringify(templates)
        };

        jQuery.ajax({
            method: "PUT",
            async: true,
            url: getHttpProtocol(this.props.config) + "/scouter/v1/kv",
            xhrFields: getWithCredentials(this.props.config),
            contentType: "application/json",
            data: JSON.stringify(data),
            beforeSend: function (xhr) {
                setAuthHeader(xhr, that.props.config, getCurrentUser(that.props.config, that.props.user));
            }
        }).done((msg) => {
            if (msg && Number(msg.status) === 200) {
                that.setState({
                    templates: templates
                });
            }
        }).fail((xhr, textStatus, errorThrown) => {
            errorHandler(xhr, textStatus, errorThrown, this.props, "saveTemplate", true);
        });
    };

    loadTemplates = (config, user) => {

        jQuery.ajax({
            method: "GET",
            async: true,
            url: getHttpProtocol(config) + "/scouter/v1/kv/__scouter_paper_layout",
            xhrFields: getWithCredentials(config),
            beforeSend: function (xhr) {
                setAuthHeader(xhr, config, getCurrentUser(config, user));
            }
        }).done((msg) => {

            if (msg && Number(msg.status) === 200) {
                if (msg.result) {
                    let list = JSON.parse(msg.result);

                    list.forEach((template) => {

                        delete template.layouts.sm;
                        delete template.layouts.xs;
                        delete template.layouts.xxs;

                        let valid = true;
                        template.boxes.forEach((box) => {
                            if (!valid) {
                                return;
                            }

                            if (Array.isArray(box.option)) {
                                box.option.forEach((o) => {
                                    if (!o.familyName) {
                                        valid = false;
                                        return;
                                    }
                                })
                            }

                        });

                        if (!valid) {
                            template.deprecated = true;
                            return;
                        }
                    });

                    if (list && list.length > 0) {
                        this.setState({
                            templates: list,
                            selectedTemplateNo: null,
                            selectedEditNo: null
                        });
                    } else {
                        this.setState({
                            templates: [],
                            selectedTemplateNo: null,
                            selectedEditNo: null
                        });
                    }
                } else {
                    this.setState({
                        templates: [],
                        selectedTemplateNo: null,
                        selectedEditNo: null
                    });
                }
            }
        }).fail((xhr, textStatus, errorThrown) => {
            errorHandler(xhr, textStatus, errorThrown, this.props, "loadTemplates", true);
        });
    };


    saveClick = () => {
        let templates = this.state.templates.slice(0);
        if (!templates) {
            templates = [];
        }
        let layouts = getData("layouts");
        let boxes = getData("boxes");

        let inx = 0;
        templates.forEach((template) => {
            template.no = inx++;
        });

        templates.push({
            no: templates.length,
            name: "template-" + (inx + 1),
            creationTime: (new Date()).getTime(),
            boxes: boxes,
            layouts: layouts
        });

        this.saveTemplate(templates);
    };

    deleteClick = (no, e) => {
        let templates = Object.assign(this.state.templates);
        for (let i = 0; i < templates.length; i++) {
            let template = templates[i];

            if (template.no === no) {
                templates.splice(i, 1);
                this.setState({
                    templates: templates,
                    selectedTemplateNo: null,
                    selectedEditNo: null
                });

                this.saveTemplate(templates);
                break;
            }
        }

        e.stopPropagation();

    };

    saveAsClick = (no, e) => {
        let templates = this.state.templates.slice(0);
        if (!templates) {
            templates = [];
        }
        let layouts = getData("layouts");
        let boxes = getData("boxes");

        for (let i = 0; i < templates.length; i++) {
            if (templates[i].no === no) {
                templates[i].boxes = boxes;
                templates[i].layouts = layouts;
                templates[i].creationTime = (new Date()).getTime();
            }
        }

        this.saveTemplate(templates);
        this.setState({
            savedNo: no
        });

        setTimeout(() => {
            this.setState({
                savedNo: null
            });
        }, 1000);

        e.stopPropagation();
    };

    loadClick = (no) => {

        for (let i = 0; i < this.state.templates.length; i++) {
            let template = this.state.templates[i];

            if (template.no === no) {
                this.props.setLayoutName(template.name);
                setData("templateName", Object.assign({}, getData("templateName"), {layout: template.name}));
                setData("boxes", template.boxes);
                setData("layouts", template.layouts);

                this.props.setTemplate(template.boxes, template.layouts);

                let search = new URLSearchParams(this.props.location.search);
                search.set('layout', template.name);

                if (!(this.props.history.location.pathname === "/paper" && this.props.history.location.search === search)) {
                    this.props.history.push({
                        pathname: '/paper',
                        search: "?" + search.toString()
                    });
                }

                break;
            }
        }
    };

    templateClick = (no) => {
        this.setState({
            selectedTemplateNo: no
        });

        this.loadClick(no);
    };

    editClick = (no, name, e) => {
        this.setState({
            selectedEditNo: no,
            editText: name
        });

        e.stopPropagation();
    };

    updateClick = (no, e) => {
        let templates = Object.assign(this.state.templates);
        for (let i = 0; i < templates.length; i++) {
            let template = templates[i];
            if (template.no === no) {
                template.name = this.state.editText;
                this.setState({
                    templates: templates,
                    selectedEditNo: null,
                    savedNo: no
                });
                break;
            }
        }
        this.saveTemplate(templates);

        setTimeout(() => {
            this.setState({
                savedNo: null
            });
        }, 1000);

        e.stopPropagation();
    };

    onTextChange = (event) => {
        this.setState({
            editText: event.target.value
        });
    };

    toggleOpen = () => {
        this.setState({
            visible: !this.state.visible
        });
    };

    render() {
        return (
            <div className="layout-manager-bg">
                <div className="layout-summary" onClick={this.toggleOpen}>
                    <span>{this.state.templates.length} LAYOUTS</span>
                    <span className="drop-icon"><span><i className="fa fa-angle-down"
                                                         aria-hidden="true"></i></span></span>
                </div>
                <div className={"layout-manager " + (this.state.visible ? "" : "hidden")}
                     onClick={(e) => e.stopPropagation()}>
                    <div className="content-ilst scrollbar">
                        {(this.state.templates && this.state.templates.length > 0) &&
                        <ul>
                            {this.state.templates.map((d, i) => {
                                return (<li key={i} className={d.no === this.state.selectedTemplateNo ? 'selected' : ''}
                                            onClick={this.templateClick.bind(this, d.no)}>
                                    <div className={"saved-info " + (d.no === this.state.savedNo ? "show " : " ")}>
                                        SAVED
                                    </div>
                                    <div>
                                        {d.deprecated && <div className="deprecated"><span
                                            data-tip="this template is no longer working properly at this paper version">DEPRECATED</span>
                                        </div>}
                                        {(d.no !== this.state.selectedEditNo) && <span className="name">{d.name}</span>}
                                        {(d.no === this.state.selectedEditNo) &&
                                        <span className="name edit"><input type="text" value={this.state.editText}
                                                                           onChange={this.onTextChange.bind(this)}/></span>}
                                    </div>
                                    <div className="btn-control">
                                        <span className="paper-count">{d.boxes.length} PAPERS</span>
                                        {(d.no !== this.state.selectedEditNo) &&
                                        <span className="edit-btn" onClick={this.editClick.bind(this, d.no, d.name)}>EDIT</span>}
                                        {(d.no === this.state.selectedEditNo) && <span className="done-btn"
                                                                                       onClick={this.updateClick.bind(this, d.no)}>DONE</span>}
                                        {(d.no !== this.state.selectedEditNo) &&
                                        <span className="save-as-btn" onClick={this.saveAsClick.bind(this, d.no)}>SAVE AS</span>}
                                        {(d.no !== this.state.selectedEditNo) && <span className="del-btn"
                                                                                       onClick={this.deleteClick.bind(this, d.no)}>DEL</span>}
                                    </div>
                                </li>)
                            })}
                        </ul>
                        }
                        <div className="save-new-btn">
                            <div><span onClick={this.saveClick}>SAVE CURRENT LAYOUT</span></div>
                        </div>
                        {(!this.state.templates || this.state.templates.length < 1) &&
                        <div className="empty-content">NO LAYOUT</div>}
                    </div>
                </div>
                <ReactTooltip/>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        objects: state.target.objects,
        config: state.config,
        user: state.user
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        setTemplate: (boxes, layouts) => dispatch(setTemplate(boxes, layouts)),
        setControlVisibility: (name, value) => dispatch(setControlVisibility(name, value)),
        pushMessage: (category, title, content) => dispatch(pushMessage(category, title, content)),
        setLayoutName: (layout) => dispatch(setLayoutName(layout))
    };
};

LayoutManager = connect(mapStateToProps, mapDispatchToProps)(LayoutManager);

export default withRouter(LayoutManager);