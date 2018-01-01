import React, {Component} from 'react';
import './Box.css';
import {Draggable, Droppable} from 'react-drag-and-drop'
import Clock from 'react-live-clock';
import EmptyBox from "../Paper/EmptyBox/EmptyBox";
import ClockBox from "../Paper/ClockBox/ClockBox";

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
            for (let i=0; i<this.props.box.metric.length; i++) {
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
                        </div>
                    </div>
                </div>
            </Droppable>
        );
    }
}

export default Box;
