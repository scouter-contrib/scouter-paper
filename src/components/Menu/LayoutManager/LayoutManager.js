import React, {Component} from 'react';
import './LayoutManager.css';
import {setTemplate, setControlVisibility, pushMessage} from '../../../actions';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {getData, setData} from '../../../common/common';
import 'url-search-params-polyfill';

class LayoutManager extends Component {

    init = false;

    constructor(props) {
        super(props);
        this.state = {
            templates: [],
            selectedTemplateNo : null,
            selectedEditNo : null,
            editText : null
        };
    }

    componentDidMount() {

    }


    loadTemplates = () => {
        let templates = getData("templates");
        if (templates) {
            this.setState({
                templates : templates,
                selectedTemplateNo : null,
                selectedEditNo : null
            });
        } else {
            let defaultTemplate = JSON.parse('[{"no":0,"name":"TIME-XLOG-WAS-HOST-SAMPLE","creationTime":1521048658358,"boxes":[{"key":"1","title":"CLOCK","layout":{"w":3,"h":5,"x":0,"y":0,"i":"1","minW":1,"minH":3,"moved":false,"static":false},"option":{"mode":"exclusive","type":"clock","config":{"timezone":{"name":"TIMEZONE","type":"selector","data":["Asia/Seoul","UCT","US/Central","US/Pacific","Europe/Paris","Asia/Tokyo","Australia/Sydney"],"value":"Asia/Seoul"},"format":{"name":"TIME FORMAT","type":"input","value":"HH:mm:ss","tooltip":{"type":"link","content":"https://momentjs.com/docs/#/displaying/format/"}}}},"values":{"timezone":"Asia/Seoul","format":"HH:mm:ss"},"config":false},{"key":"2","title":"XLOG BAR","layout":{"w":3,"h":5,"x":3,"y":0,"i":"2","minW":1,"minH":3,"moved":false,"static":false},"option":{"mode":"exclusive","type":"xlogBar","config":{"count":{"name":"SHOW COUNT","type":"checkbox","value":false},"history":{"name":"HISTORY COUNT","type":"selector","data":[1,2,3,4,5],"value":1}}},"values":{"count":false,"history":1},"config":false},{"key":"3","title":"VISITOR","layout":{"w":4,"h":5,"x":6,"y":0,"i":"3","minW":1,"minH":3,"moved":false,"static":false},"option":{"mode":"exclusive","type":"visitor","config":{"showNumber":{"name":"SHOW NUMBER","type":"checkbox","value":true},"showGraph":{"name":"SHOW GRAPH","type":"checkbox","value":false},"showAxis":{"name":"AXIS","type":"selector","data":["BOTH","LEFT","RIGHT","NONE"],"value":"BOTH"},"range":{"name":"Range","type":"input","value":"60","tooltip":{"type":"text","content":"seconds"}}}},"values":{"showNumber":true,"showGraph":false,"showAxis":"BOTH","range":"60"},"config":false},{"key":"4","title":"XLOG","layout":{"w":5,"h":8,"x":0,"y":5,"i":"4","minW":1,"minH":3,"moved":false,"static":false},"option":{"mode":"exclusive","type":"xlog","config":{"showPreview":{"name":"SHOW PROCESS","type":"selector","data":["Y","N"],"value":"N"}}},"values":{"showPreview":"N"},"config":false},{"key":"5","title":"TPS, Elapsed Time","layout":{"w":5,"h":8,"x":5,"y":5,"i":"5","minW":1,"minH":3,"moved":false,"static":false},"option":[{"mode":"nonexclusive","type":"counter","counterKey":"TPS","title":"TPS","objectType":"instance"},{"mode":"nonexclusive","type":"counter","counterKey":"ElapsedTime","title":"Elapsed Time","objectType":"instance"}],"values":{},"config":false},{"key":"6","title":"Cpu, Mem","layout":{"w":5,"h":7,"x":0,"y":13,"i":"6","minW":1,"minH":3,"moved":false,"static":false},"option":[{"mode":"nonexclusive","type":"counter","counterKey":"Cpu","title":"Cpu","objectType":"host"},{"mode":"nonexclusive","type":"counter","counterKey":"Mem","title":"Mem","objectType":"host"}],"values":{},"config":false},{"key":"7","title":"Disk Read Bytes, Disk Write Bytes","layout":{"w":5,"h":7,"x":5,"y":13,"i":"7","minW":1,"minH":3,"moved":false,"static":false},"option":[{"mode":"nonexclusive","type":"counter","counterKey":"DiskReadBytes","title":"Disk Read Bytes","objectType":"host"},{"mode":"nonexclusive","type":"counter","counterKey":"DiskWriteBytes","title":"Disk Write Bytes","objectType":"host"}],"values":{},"config":false}],"layouts":{"lg":[{"w":3,"h":5,"x":0,"y":0,"i":"1","minW":1,"minH":3,"moved":false,"static":false},{"w":3,"h":5,"x":3,"y":0,"i":"2","minW":1,"minH":3,"moved":false,"static":false},{"w":6,"h":5,"x":6,"y":0,"i":"3","minW":1,"minH":3,"moved":false,"static":false},{"w":6,"h":8,"x":0,"y":5,"i":"4","minW":1,"minH":3,"moved":false,"static":false},{"w":6,"h":8,"x":6,"y":5,"i":"5","minW":1,"minH":3,"moved":false,"static":false},{"w":6,"h":7,"x":0,"y":13,"i":"6","minW":1,"minH":3,"moved":false,"static":false},{"w":6,"h":7,"x":6,"y":13,"i":"7","minW":1,"minH":3,"moved":false,"static":false}],"sm":[{"w":3,"h":5,"x":0,"y":0,"i":"1","minW":1,"minH":3,"moved":false,"static":false},{"w":3,"h":5,"x":3,"y":0,"i":"2","minW":1,"minH":3,"moved":false,"static":false},{"w":6,"h":5,"x":0,"y":5,"i":"3","minW":1,"minH":3,"moved":false,"static":false},{"w":6,"h":8,"x":0,"y":10,"i":"4","minW":1,"minH":3,"moved":false,"static":false},{"w":6,"h":8,"x":0,"y":18,"i":"5","minW":1,"minH":3,"moved":false,"static":false},{"w":6,"h":7,"x":0,"y":26,"i":"6","minW":1,"minH":3,"moved":false,"static":false},{"w":6,"h":7,"x":0,"y":33,"i":"7","minW":1,"minH":3,"moved":false,"static":false}],"xs":[{"w":4,"h":5,"x":0,"y":0,"i":"1","minW":1,"minH":3,"moved":false,"static":false},{"w":4,"h":5,"x":0,"y":5,"i":"2","minW":1,"minH":3,"moved":false,"static":false},{"w":4,"h":5,"x":0,"y":10,"i":"3","minW":1,"minH":3,"moved":false,"static":false},{"w":4,"h":8,"x":0,"y":15,"i":"4","minW":1,"minH":3,"moved":false,"static":false},{"w":4,"h":8,"x":0,"y":23,"i":"5","minW":1,"minH":3,"moved":false,"static":false},{"w":4,"h":7,"x":0,"y":31,"i":"6","minW":1,"minH":3,"moved":false,"static":false},{"w":4,"h":7,"x":0,"y":38,"i":"7","minW":1,"minH":3,"moved":false,"static":false}],"xxs":[{"w":2,"h":5,"x":0,"y":0,"i":"1","minW":1,"minH":3,"moved":false,"static":false},{"w":2,"h":5,"x":0,"y":5,"i":"2","minW":1,"minH":3,"moved":false,"static":false},{"w":2,"h":5,"x":0,"y":10,"i":"3","minW":1,"minH":3,"moved":false,"static":false},{"w":2,"h":8,"x":0,"y":15,"i":"4","minW":1,"minH":3,"moved":false,"static":false},{"w":2,"h":8,"x":0,"y":23,"i":"5","minW":1,"minH":3,"moved":false,"static":false},{"w":2,"h":7,"x":0,"y":31,"i":"6","minW":1,"minH":3,"moved":false,"static":false},{"w":2,"h":7,"x":0,"y":38,"i":"7","minW":1,"minH":3,"moved":false,"static":false}],"md":[{"w":3,"h":5,"x":0,"y":0,"i":"1","minW":1,"minH":3,"moved":false,"static":false},{"w":3,"h":5,"x":3,"y":0,"i":"2","minW":1,"minH":3,"moved":false,"static":false},{"w":4,"h":5,"x":6,"y":0,"i":"3","minW":1,"minH":3,"moved":false,"static":false},{"w":5,"h":8,"x":0,"y":5,"i":"4","minW":1,"minH":3,"moved":false,"static":false},{"w":5,"h":8,"x":5,"y":5,"i":"5","minW":1,"minH":3,"moved":false,"static":false},{"w":5,"h":7,"x":0,"y":13,"i":"6","minW":1,"minH":3,"moved":false,"static":false},{"w":5,"h":7,"x":5,"y":13,"i":"7","minW":1,"minH":3,"moved":false,"static":false}]}}]');
            this.setState({
                templates : defaultTemplate,
                selectedTemplateNo : null,
                selectedEditNo : null
            });
            setData("templates", defaultTemplate);
        }
    };

    componentWillReceiveProps(nextProps) {
        if (!this.props.visible && nextProps.visible) {
            this.loadTemplates();
        }
    }


    componentDidUpdate(prevProps, prevState) {


    }

    cancelClick = () => {
        this.props.toggleLayoutManagerVisible();
    };

    saveClick = () => {
        let templates = getData("templates");
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

        setData("templates", templates);
        this.loadTemplates();
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
                    setData("templates", templates);

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
        console.log(no);
        console.log(this.state.editText);
        let templates = Object.assign(this.state.templates);
        for (let i=0; i<templates.length; i++) {
            let template = templates[i];


            if (template.no === no) {
                console.log(2222);
                template.name = this.state.editText;
                this.setState({
                    templates : templates,
                    selectedTemplateNo : null,
                    selectedEditNo : null
                });
                setData("templates", templates);

                break;
            }
        }
    };



    onTextChange = (event) => {
        this.setState({
            editText: event.target.value
        });
    };

    render() {

        return (
            <div className={"layout-manager-bg " + (this.props.visible ? "" : "hidden")}>
                <div className="layout-manager">
                    <div className="title">
                        <div>LAYOUTS</div>
                    </div>
                    <div className="content-ilst scrollbar">
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