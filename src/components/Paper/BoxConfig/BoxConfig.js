import React, {Component} from 'react';
import './BoxConfig.css';
import connect from "react-redux/es/connect/connect";
import {pushMessage, setControlVisibility} from "../../../actions";

class BoxConfig extends Component {

    constructor(props){
        super(props);

        this.state = {
            values:  Object.assign({}, this.props.box.values),
            singleRow : false,
            removeKeys : []
        };
    }

    resize = () => {
        if (this.refs.boxConfig) {
            let width = this.refs.boxConfig.offsetWidth;
            if (width < 600) {
                if (!this.state.singleRow) {
                    this.setState({
                        singleRow : true
                    });
                }
            } else {
                if (this.state.singleRow) {
                    this.setState({
                        singleRow : false
                    });
                }
            }
        }
    };

    componentDidUpdate() {
        this.resize();
    }

    componentDidMount() {
        this.resize();
    }

    onChange = (attr, event) => {
        let values = this.state.values;
        values[attr] = event.target.value;
        this.setState({
            values : values
        });
    };

    onCheck = (attr, event) => {
        let values = this.state.values;
        values[attr] = event.target.checked;
        this.setState({
            values : values
        });
    };

    onApply = () => {
        //- stack area apply option couter check...

        if( this.props.box.advancedOption && Object.keys(this.state.values).filter(attr =>
                this.state.values[attr].indexOf("STACK")> -1 ? true : false
            ).length > 0
        ){
            let removeKeyTotal = 0;
            if( this.state.removeKeys ){
                removeKeyTotal = this.state.removeKeys.length;
            }
            const counterKeyTotal = this.props.box.option.length - removeKeyTotal;
            if( counterKeyTotal > 1 ){
                this.props.pushMessage("error","Stack Area Info","Only one metric is available");
                this.props.setControlVisibility("Message", true);
                return;
            }

        }


        if (this.state.removeKeys && this.state.removeKeys.length > 0) {
            this.props.removeMetrics(this.props.box.key, this.state.removeKeys)
            if( Object.keys(this.state.values).filter(attr => this.state.values[attr] === "STACK AREA" ? true : false).length > 0){
                this.props.setOptionValues(this.props.box.key, this.state.values);
            }
        } else {
            this.props.setOptionValues(this.props.box.key, this.state.values);
        }
    };

    onCancel = () => {
        this.props.setOptionClose(this.props.box.key);
        this.setState({
            removeKeys: []
        });
    };

    onRemoveToggle = ( counterKey) => {
        let removeKeys = this.state.removeKeys.slice(0);
        let findIndex = removeKeys.findIndex(function (e) {
            return e === counterKey
        });

        if (findIndex < 0) {
            removeKeys.push(counterKey);
        } else {
            removeKeys.splice(findIndex, 1)
        }

        this.setState({
            removeKeys: removeKeys
        });
    };

    render() {
        return (
            <div className={"box-config popup-div " + (this.state.singleRow ? "single-row" : "")} onMouseDown={(e) => {e.stopPropagation();}} onMouseUp={(e) => {e.stopPropagation();}} ref="boxConfig">
                <div className="box-config-content">
                    <div className="box-config-title">
                        <span>CONFIG</span>
                        <span className="close-btn" onClick={this.onCancel}><i className="fa fa-times-circle-o" aria-hidden="true"></i></span>
                    </div>
                    <div className="box-config-advanced-items">
                        { this.props.box.advancedOption && Object.keys(this.props.box.advancedOption).map((attr, i) => {
                            if (this.props.box.advancedOption[attr].type === "selector") {
                                return <div className="box-config-advanced-item" key={i}>
                                    <label>{this.props.box.advancedOption[attr].name}</label>
                                    <select onChange={(e)=>this.onChange(attr,e)} defaultValue={this.state.values[attr]}>
                                        {this.props.box.advancedOption[attr].data.map((d, i) => {
                                            return <option key={i}>{d}</option>
                                        })}
                                    </select>
                                </div>
                            }else{
                                return undefined;
                            }
                        })
                        }
                    </div>
                    <div className={"exclusive-options " + (this.props.box.option.length > 0 ? 'show' : '')}>
                    {(this.props.box.option && this.props.box.option.length > 0) &&
                    this.props.box.option.map((d, i) => {

                        let removed = false;
                        if (this.state.removeKeys) {
                            for (let j=0; j<this.state.removeKeys.length; j++) {
                                if (d.counterKey === this.state.removeKeys[j]) {
                                    removed = true;
                                    break;
                                }
                            }
                        }

                        return <div className={"metric-option " + (removed ? "removed" : "")} key={i}><span>{d.title}</span><span onClick={this.onRemoveToggle.bind(this, d.counterKey)} className="remove-btn"><i className={"fa " + (removed ? "fa-undo" : "fa-times")} aria-hidden="true"></i></span></div>
                    })
                    }
                    </div>
                    <div className="box-config-items">
                    { this.props.box.option && this.props.box.option.config && Object.keys(this.props.box.option.config).map((attr, i) => {
                        if (this.props.box.option.config[attr].type === "input") {
                            return <div className="box-config-item" key={i}>
                                        <label>{this.props.box.option.config[attr].name}</label>
                                        <input type="text" onChange={this.onChange.bind(this, attr)} value={this.state.values[attr]}/>
                                        {this.props.box.option.config[attr].tooltip && this.props.box.option.config[attr].tooltip.type === "link" &&
                                        <div className="config-tooltip">
                                            <a href={this.props.box.option.config[attr].tooltip.content} target="_blank"><i className="fa fa-info-circle" aria-hidden="true"></i> {this.props.box.option.config[attr].tooltip.content}</a>
                                        </div>}
                                        {this.props.box.option.config[attr].tooltip && this.props.box.option.config[attr].tooltip.type === "text" &&
                                        <div className="config-tooltip"><i className="fa fa-info-circle" aria-hidden="true"></i> {this.props.box.option.config[attr].tooltip.content}</div>}
                                    </div>
                        } else if (this.props.box.option.config[attr].type === "selector") {
                            return <div className="box-config-item" key={i}>
                                        <label>{this.props.box.option.config[attr].name}</label>
                                        <select onChange={this.onChange.bind(this, attr)} defaultValue={this.state.values[attr]}>
                                            {this.props.box.option.config[attr].data.map((d, i) => {
                                                return <option key={i}>{d}</option>
                                            })}
                                        </select>
                                        {this.props.box.option.config[attr].tooltip && this.props.box.option.config[attr].tooltip.type === "link" &&
                                        <div className="config-tooltip">
                                            <a href={this.props.box.option.config[attr].tooltip.content} target="_blank"><i className="fa fa-info-circle" aria-hidden="true"></i> {this.props.box.option.config[attr].tooltip.content}</a>
                                        </div>}
                                        {this.props.box.option.config[attr].tooltip && this.props.box.option.config[attr].tooltip.type === "text" &&
                                        <div className="config-tooltip"><i className="fa fa-info-circle" aria-hidden="true"></i> {this.props.box.option.config[attr].tooltip.content}</div>}
                                    </div>
                        } else if (this.props.box.option.config[attr].type === "checkbox") {
                            return <div className="box-config-item" key={i}>
                                <label>{this.props.box.option.config[attr].name}</label>
                                <input type="checkbox" defaultChecked={this.state.values[attr]} onChange={this.onCheck.bind(this, attr)} />
                                {this.props.box.option.config[attr].tooltip && this.props.box.option.config[attr].tooltip.type === "link" &&
                                <div className="config-tooltip">
                                    <a href={this.props.box.option.config[attr].tooltip.content} target="_blank"><i className="fa fa-info-circle" aria-hidden="true"></i> {this.props.box.option.config[attr].tooltip.content}</a>
                                </div>}
                                {this.props.box.option.config[attr].tooltip && this.props.box.option.config[attr].tooltip.type === "text" &&
                                <div className="config-tooltip"><i className="fa fa-info-circle" aria-hidden="true"></i> {this.props.box.option.config[attr].tooltip.content}</div>}
                            </div>
                        } else {
                            return undefined;
                        }
                    })
                    }
                    </div>


                    <div className="box-config-buttons">
                        <button onClick={this.onCancel}>CANCEL</button><button onClick={this.onApply}>APPLY</button>
                    </div>
                </div>
            </div>
        );
    }
}
let mapDispatchToProps = (dispatch) => {
    return {
        pushMessage: (category, title, content) => dispatch(pushMessage(category, title, content)),
        setControlVisibility: (name, value) => dispatch(setControlVisibility(name, value)),
    };
};
BoxConfig = connect(null, mapDispatchToProps)(BoxConfig)
export default BoxConfig;

