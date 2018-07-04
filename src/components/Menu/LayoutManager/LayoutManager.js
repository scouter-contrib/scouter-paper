import React, {Component} from 'react';
import './LayoutManager.css';
import {setTemplate, setControlVisibility, pushMessage} from '../../../actions';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {getData, setData, getDefaultServerConfig} from '../../../common/common';
import 'url-search-params-polyfill';
import jQuery from "jquery";
import {errorHandler, setAuthHeader, getWithCredentials, getHttpProtocol, getCurrentUser} from '../../../common/common';

class LayoutManager extends Component {

    constructor(props) {
        super(props);
        this.state = {
            templates: [],
            selectedTemplateNo : null,
            selectedEditNo : null,
            editText : null
        };
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.visible && nextProps.visible) {
            this.loadTemplates(nextProps.config, nextProps.user);
        }
    }

    saveTemplate = (templates) => {
        let that = this;
        let data = {
            key : "__scouter_paper_layout",
            value : JSON.stringify(templates)
        };

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
                    templates : templates
                });
            }
        }).fail((xhr, textStatus, errorThrown) => {
            errorHandler(xhr, textStatus, errorThrown, this.props);
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

            let defaultTemplate = JSON.parse('[{"no":0,"name":"TIME-XLOG-WAS-HOST-SAMPLE","creationTime":1521048658358,"boxes":[{"key":"1","title":"CLOCK","layout":{"w":3,"h":5,"x":0,"y":0,"i":"1","minW":1,"minH":3,"moved":false,"static":false},"option":{"mode":"exclusive","type":"clock","config":{"timezone":{"name":"TIMEZONE","type":"selector","data":["Asia/Seoul","UCT","US/Central","US/Pacific","Europe/Paris","Asia/Tokyo","Australia/Sydney"],"value":"Asia/Seoul"},"format":{"name":"TIME FORMAT","type":"input","value":"HH:mm:ss","tooltip":{"type":"link","content":"https://momentjs.com/docs/#/displaying/format/"}}}},"values":{"timezone":"Asia/Seoul","format":"HH:mm:ss"},"config":false},{"key":"2","title":"XLOG BAR","layout":{"w":3,"h":5,"x":3,"y":0,"i":"2","minW":1,"minH":3,"moved":false,"static":false},"option":{"mode":"exclusive","type":"xlogBar","config":{"count":{"name":"SHOW COUNT","type":"checkbox","value":false},"history":{"name":"HISTORY COUNT","type":"selector","data":[1,2,3,4,5],"value":1}}},"values":{"count":false,"history":1},"config":false},{"key":"3","title":"VISITOR","layout":{"w":4,"h":5,"x":6,"y":0,"i":"3","minW":1,"minH":3,"moved":false,"static":false},"option":{"mode":"exclusive","type":"visitor","config":{"showNumber":{"name":"SHOW NUMBER","type":"checkbox","value":true},"showGraph":{"name":"SHOW GRAPH","type":"checkbox","value":false},"showAxis":{"name":"AXIS","type":"selector","data":["BOTH","LEFT","RIGHT","NONE"],"value":"BOTH"},"range":{"name":"Range","type":"input","value":"60","tooltip":{"type":"text","content":"seconds"}}}},"values":{"showNumber":true,"showGraph":false,"showAxis":"BOTH","range":"60"},"config":false},{"key":"4","title":"XLOG","layout":{"w":5,"h":8,"x":0,"y":5,"i":"4","minW":1,"minH":3,"moved":false,"static":false},"option":{"mode":"exclusive","type":"xlog","config":{"showPreview":{"name":"SHOW PROCESS","type":"selector","data":["Y","N"],"value":"N"}}},"values":{"showPreview":"N"},"config":false},{"key":"5","title":"TPS, Elapsed Time","layout":{"w":5,"h":8,"x":5,"y":5,"i":"5","minW":1,"minH":3,"moved":false,"static":false},"option":[{"mode":"nonexclusive","type":"counter","counterKey":"TPS","title":"TPS","objectType":"instance"},{"mode":"nonexclusive","type":"counter","counterKey":"ElapsedTime","title":"Elapsed Time","objectType":"instance"}],"values":{},"config":false},{"key":"6","title":"Cpu, Mem","layout":{"w":5,"h":7,"x":0,"y":13,"i":"6","minW":1,"minH":3,"moved":false,"static":false},"option":[{"mode":"nonexclusive","type":"counter","counterKey":"Cpu","title":"Cpu","objectType":"host"},{"mode":"nonexclusive","type":"counter","counterKey":"Mem","title":"Mem","objectType":"host"}],"values":{},"config":false},{"key":"7","title":"Disk Read Bytes, Disk Write Bytes","layout":{"w":5,"h":7,"x":5,"y":13,"i":"7","minW":1,"minH":3,"moved":false,"static":false},"option":[{"mode":"nonexclusive","type":"counter","counterKey":"DiskReadBytes","title":"Disk Read Bytes","objectType":"host"},{"mode":"nonexclusive","type":"counter","counterKey":"DiskWriteBytes","title":"Disk Write Bytes","objectType":"host"}],"values":{},"config":false}],"layouts":{"lg":[{"w":3,"h":5,"x":0,"y":0,"i":"1","minW":1,"minH":3,"moved":false,"static":false},{"w":3,"h":5,"x":3,"y":0,"i":"2","minW":1,"minH":3,"moved":false,"static":false},{"w":6,"h":5,"x":6,"y":0,"i":"3","minW":1,"minH":3,"moved":false,"static":false},{"w":6,"h":8,"x":0,"y":5,"i":"4","minW":1,"minH":3,"moved":false,"static":false},{"w":6,"h":8,"x":6,"y":5,"i":"5","minW":1,"minH":3,"moved":false,"static":false},{"w":6,"h":7,"x":0,"y":13,"i":"6","minW":1,"minH":3,"moved":false,"static":false},{"w":6,"h":7,"x":6,"y":13,"i":"7","minW":1,"minH":3,"moved":false,"static":false}],"sm":[{"w":3,"h":5,"x":0,"y":0,"i":"1","minW":1,"minH":3,"moved":false,"static":false},{"w":3,"h":5,"x":3,"y":0,"i":"2","minW":1,"minH":3,"moved":false,"static":false},{"w":6,"h":5,"x":0,"y":5,"i":"3","minW":1,"minH":3,"moved":false,"static":false},{"w":6,"h":8,"x":0,"y":10,"i":"4","minW":1,"minH":3,"moved":false,"static":false},{"w":6,"h":8,"x":0,"y":18,"i":"5","minW":1,"minH":3,"moved":false,"static":false},{"w":6,"h":7,"x":0,"y":26,"i":"6","minW":1,"minH":3,"moved":false,"static":false},{"w":6,"h":7,"x":0,"y":33,"i":"7","minW":1,"minH":3,"moved":false,"static":false}],"xs":[{"w":4,"h":5,"x":0,"y":0,"i":"1","minW":1,"minH":3,"moved":false,"static":false},{"w":4,"h":5,"x":0,"y":5,"i":"2","minW":1,"minH":3,"moved":false,"static":false},{"w":4,"h":5,"x":0,"y":10,"i":"3","minW":1,"minH":3,"moved":false,"static":false},{"w":4,"h":8,"x":0,"y":15,"i":"4","minW":1,"minH":3,"moved":false,"static":false},{"w":4,"h":8,"x":0,"y":23,"i":"5","minW":1,"minH":3,"moved":false,"static":false},{"w":4,"h":7,"x":0,"y":31,"i":"6","minW":1,"minH":3,"moved":false,"static":false},{"w":4,"h":7,"x":0,"y":38,"i":"7","minW":1,"minH":3,"moved":false,"static":false}],"xxs":[{"w":2,"h":5,"x":0,"y":0,"i":"1","minW":1,"minH":3,"moved":false,"static":false},{"w":2,"h":5,"x":0,"y":5,"i":"2","minW":1,"minH":3,"moved":false,"static":false},{"w":2,"h":5,"x":0,"y":10,"i":"3","minW":1,"minH":3,"moved":false,"static":false},{"w":2,"h":8,"x":0,"y":15,"i":"4","minW":1,"minH":3,"moved":false,"static":false},{"w":2,"h":8,"x":0,"y":23,"i":"5","minW":1,"minH":3,"moved":false,"static":false},{"w":2,"h":7,"x":0,"y":31,"i":"6","minW":1,"minH":3,"moved":false,"static":false},{"w":2,"h":7,"x":0,"y":38,"i":"7","minW":1,"minH":3,"moved":false,"static":false}],"md":[{"w":3,"h":5,"x":0,"y":0,"i":"1","minW":1,"minH":3,"moved":false,"static":false},{"w":3,"h":5,"x":3,"y":0,"i":"2","minW":1,"minH":3,"moved":false,"static":false},{"w":4,"h":5,"x":6,"y":0,"i":"3","minW":1,"minH":3,"moved":false,"static":false},{"w":5,"h":8,"x":0,"y":5,"i":"4","minW":1,"minH":3,"moved":false,"static":false},{"w":5,"h":8,"x":5,"y":5,"i":"5","minW":1,"minH":3,"moved":false,"static":false},{"w":5,"h":7,"x":0,"y":13,"i":"6","minW":1,"minH":3,"moved":false,"static":false},{"w":5,"h":7,"x":5,"y":13,"i":"7","minW":1,"minH":3,"moved":false,"static":false}]}}]');

            if (msg && Number(msg.status) === 200) {
                if (msg.result) {
                    let list = JSON.parse(msg.result);
                    if (list && list.length > 0) {
                        this.setState({
                            templates : list,
                            selectedTemplateNo : null,
                            selectedEditNo : null
                        });
                    } else {
                        this.setState({
                        templates : defaultTemplate,
                        selectedTemplateNo : null,
                        selectedEditNo : null
                    });
                    }
                } else {
                    this.setState({
                        templates : defaultTemplate,
                        selectedTemplateNo : null,
                        selectedEditNo : null
                    });
                }
            }
        }).fail((xhr, textStatus, errorThrown) => {
            errorHandler(xhr, textStatus, errorThrown, this.props);
        });
    };

    cancelClick = () => {
        this.props.toggleLayoutManagerVisible();
    };

    saveClick = () => {
        let templates = this.state.templates;
        if (!templates) {
            templates = [];
        }
        let layouts = getData("layouts");
        let boxes = getData("boxes");

        templates.push({
            no : templates.length,
            name : "template-" + (templates.length + 1),
            creationTime : (new Date()).getTime(),
            boxes : boxes,
            layouts : layouts
        });

        this.saveTemplate(templates);
    };

    deleteClick = () => {
        if (this.state.selectedTemplateNo === null) {
            this.props.pushMessage("info", "NO LAYOUT SELECTED", "select layout to delete first");
            this.props.setControlVisibility("Message", true);
        } else {
            let templates = Object.assign(this.state.templates);
            for (let i=0; i<templates.length; i++) {
                let template = templates[i];

                if (template.no === this.state.selectedTemplateNo) {
                    templates.splice(i, 1);
                    this.setState({
                        templates : templates,
                        selectedTemplateNo : null,
                        selectedEditNo : null
                    });

                    this.saveTemplate(templates);
                    break;
                }
            }
        }
    };

    loadClick = () => {
        if (this.state.selectedTemplateNo === null) {
            this.props.pushMessage("info", "NO LAYOUT SELECTED", "select layout to load first");
            this.props.setControlVisibility("Message", true);
        } else {
            for (let i=0; i<this.state.templates.length; i++) {
                let template = this.state.templates[i];

                if (template.no === this.state.selectedTemplateNo) {
                    setData("boxes", template.boxes);
                    setData("layouts", template.layouts);

                    this.props.setTemplate(template.boxes, template.layouts);
                    this.props.toggleLayoutManagerVisible();

                    this.props.history.push({
                        pathname: '/paper',
                        search: '?instances=' + this.props.instances.map((d) => {
                            return d.objHash
                        })
                    });

                    break;
                }
            }
        }

    };

    templateClick = (no) => {
        this.setState({
            selectedTemplateNo : no
        });
    };

    editClick = (no, name) => {
        this.setState({
            selectedEditNo : no,
            editText : name
        });
    };

    updateClick = (no) => {
        let templates = Object.assign(this.state.templates);
        for (let i=0; i<templates.length; i++) {
            let template = templates[i];
            if (template.no === no) {
                template.name = this.state.editText;
                this.setState({
                    templates : templates,
                    selectedTemplateNo : null,
                    selectedEditNo : null
                });
                break;
            }
        }
        this.saveTemplate(templates);
    };

    onTextChange = (event) => {
        this.setState({
            editText: event.target.value
        });
    };

    render() {

        return (
            <div className={"layout-manager-bg " + (this.props.visible ? "" : "hidden")} onClick={this.props.toggleLayoutManagerVisible}>
                <div className={"layout-manager-fixed-bg"}></div>
                <div className="layout-manager popup-div" onClick={(e) => e.stopPropagation()}>
                    <div className="title">
                        <div>LAYOUTS</div>
                    </div>
                    <div className="content-ilst scrollbar">
                        {(this.state.templates && this.state.templates.length > 0) &&
                        <ul>
                            {this.state.templates.map((d, i) => {
                                return (<li key={i} className={d.no === this.state.selectedTemplateNo ? 'selected' : ''} onClick={this.templateClick.bind(this, d.no)}>
                                    <div>
                                        <span className="no">{i+1}</span>
                                        {(d.no !== this.state.selectedEditNo) && <span className="name">{d.name}</span>}
                                        {(d.no === this.state.selectedEditNo) && <span className="name edit"><input type="text" value={this.state.editText} onChange={this.onTextChange.bind(this )} /></span>}
                                        {(d.no !== this.state.selectedEditNo) && <span className="edit-btn" onClick={this.editClick.bind(this, d.no, d.name)}>EDIT</span>}
                                        {(d.no === this.state.selectedEditNo) && <span className="done-btn" onClick={this.updateClick.bind(this, d.no)}>DONE</span>}
                                    </div>
                                </li>)
                            })}
                        </ul>
                        }
                        {(!this.state.templates || this.state.templates.length < 1) && <div className="empty-content">NO LAYOUT</div>}
                    </div>
                    <div className="buttons">
                        <button className="delete-btn" onClick={this.deleteClick}>DELETE</button>
                        <button className="save-btn" onClick={this.saveClick}>SAVE CURRENT LAYOUT</button>
                        <button className="cancel-btn" onClick={this.cancelClick}>CANCEL</button>
                        <button className="load-btn" onClick={this.loadClick}>LOAD</button>
                    </div>
                </div>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        instances: state.target.instances,
        config: state.config,
        user: state.user
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        setTemplate: (boxes, layouts) => dispatch(setTemplate(boxes, layouts)),
        setControlVisibility: (name, value) => dispatch(setControlVisibility(name, value)),
        pushMessage: (category, title, content) => dispatch(pushMessage(category, title, content)),
    };
};

LayoutManager = connect(mapStateToProps, mapDispatchToProps)(LayoutManager);

export default withRouter(LayoutManager);