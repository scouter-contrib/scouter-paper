import React, {Component} from 'react';
import './Box.css';
import {Droppable} from 'react-drag-and-drop'
import {EmptyBox, ClockBox, XLogBar} from "../../components";
import XLog from "../Paper/XLog/XLog";
import Visitor from "../Paper/Visitor/Visitor";

class Box extends Component {

    onDrop(data) {
        if (data) {
            let option = JSON.parse(data.metric);
            this.props.setOption(this.props.box.key, option);
        }
    }

    render() {

        let type = null;
        if (this.props.box && this.props.box.option && typeof(this.props.box.option) === "object") {
            type = this.props.box.option.type;
        } else if (this.props.box && this.props.box.option && this.props.box.option.length > 0) {
            // TODO check this option
            for (let i = 0; i < this.props.box.metric.length; i++) {
                let metric = this.props.box.metric[i];
                if (metric.mode === "exclusive") {
                    type = metric.type;
                } else {

                }
            }
        }

        return (
            <Droppable className="box-droppable" types={['metric']} onDrop={this.onDrop.bind(this)}>
                <div className="box">
                    <div className="title">{this.props.box.title}</div>
                    <div className="content-wrapper">
                        <div className="content">
                            {!type && <EmptyBox/>}
                            {type === "clock" && <ClockBox box={this.props.box} />}
                            {type === "xlogBar" && <XLogBar box={this.props.box} data={this.props.data} />}
                            {type === "xlog" && <XLog box={this.props.box} data={this.props.data} config={this.props.config} />}
                            {type === "visitor" && <Visitor visitor={this.props.visitor} box={this.props.box} />}
                        </div>
                    </div>
                </div>
            </Droppable>
        );
    }
}

export default Box;
