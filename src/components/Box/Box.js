import React, {Component} from 'react';
import './Box.css';
import {Droppable} from 'react-drag-and-drop'
import {EmptyBox, ClockBox, XLogBar} from "../../components";
import XLog from "../Paper/XLog/XLog";
import Visitor from "../Paper/Visitor/Visitor";
import LineChart from "../Paper/LineChart/LineChart";

class Box extends Component {

    constructor(props) {
        super(props);

        this.state = {
            titles : {}
        };
    }

    setTitle = (title, color) => {
        let titles = Object.assign(this.state.titles);
        titles[title] = {
            title : title,
            color : color
        };
        this.setState({
            titles : this.state.titles
        });
    };

    onDrop(data) {
        if (data) {
            let option = JSON.parse(data.metric);
            this.props.setOption(this.props.box.key, option);
        }
    }

    render() {

        let type = null;

        if (this.props.box && this.props.box.option && !Array.isArray(this.props.box.option)) {
            type = this.props.box.option.type;
        } else if (this.props.box && this.props.box.option && Array.isArray(this.props.box.option)) {
            for (let i = 0; i < this.props.box.option.length; i++) {
                let innerOption = this.props.box.option[i];
                if (innerOption.mode === "nonexclusive") {
                    type = innerOption.type;
                    break;
                }
            }
        }

        let titleLength = Object.values(this.state.titles).length;
        return (
            <Droppable className="box-droppable" types={['metric']} onDrop={this.onDrop.bind(this)}>
                <div className="box">
                    <div className="title">{titleLength > 0 ? Object.values(this.state.titles).map((d, i) => (<span style={{color : d.color}} key={i}>{d.title} {(i < titleLength -1) ? ', ' : ''}</span>)) : this.props.box.title}</div>
                    <div className="content-wrapper">
                        <div className="content">
                            {!type && <EmptyBox/>}
                            {type === "clock" && <ClockBox layoutChangeTime={this.props.layoutChangeTime} box={this.props.box} />}
                            {type === "xlogBar" && <XLogBar layoutChangeTime={this.props.layoutChangeTime} box={this.props.box} data={this.props.data} />}
                            {type === "xlog" && <XLog layoutChangeTime={this.props.layoutChangeTime} box={this.props.box} data={this.props.data} config={this.props.config} />}
                            {type === "visitor" && <Visitor layoutChangeTime={this.props.layoutChangeTime} visitor={this.props.visitor} box={this.props.box} />}
                            {type === "counter" && <LineChart layoutChangeTime={this.props.layoutChangeTime} time={this.props.counters.time} box={this.props.box} counters={this.props.counters.data} setTitle={this.setTitle} />}
                        </div>
                    </div>
                </div>
            </Droppable>
        );
    }
}

export default Box;
