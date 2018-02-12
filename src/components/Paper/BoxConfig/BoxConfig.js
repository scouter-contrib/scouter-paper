import React, {Component} from 'react';
import './BoxConfig.css';

class BoxConfig extends Component {

    constructor(props){
        super(props);

        this.state = {
            values:  Object.assign({}, this.props.box.values),
            singleRow : false
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
        this.props.setOptionValues(this.props.box.key, this.state.values);
    };

    onCancel = () => {
        this.props.setOptionClose(this.props.box.key);
    };

    render() {
        return (
            <div className={"box-config " + (this.state.singleRow ? "single-row" : "")} onMouseDown={(e) => {e.stopPropagation();}} onMouseUp={(e) => {e.stopPropagation();}} ref="boxConfig">
                <div className="box-config-content">
                    <div className="box-config-items">
                    {this.props.box.option && this.props.box.option.config && Object.keys(this.props.box.option.config).map((attr, i) => {
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
                    })}
                    </div>
                    <div className="box-config-buttons">
                        <button onClick={this.onCancel}>CANCEL</button><button onClick={this.onApply}>APPLY</button>
                    </div>
                </div>
            </div>
        );
    }
}


export default BoxConfig;

