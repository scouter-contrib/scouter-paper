import React, {Component} from 'react';
import './Box.css';
import {Draggable, Droppable} from 'react-drag-and-drop'
import Clock from 'react-live-clock';
import EmptyBox from "../Paper/EmptyBox/EmptyBox";
import ClockBox from "../Paper/ClockBox/ClockBox";

class Box extends Component {

    onDrop(data) {
        let infos = data.metric.split(",");
        let mode = infos[0];
        let type = infos[1];
        let title = infos[2];
        this.props.setMetric(this.props.box.key, mode, type, title);
    }

    render() {

        let type = null;
        if (this.props.box && this.props.box.metric && this.props.box.metric.length > 0) {
            for (let i=0; i<this.props.box.metric.length; i++) {
                let metric = this.props.box.metric[i];
                if (metric.mode === "exclusive") {
                    type = metric.type;
                } else {

                }
            }
        }

        return (
            <Droppable types={['metric']} onDrop={this.onDrop.bind(this)}>
                <div className="box">
                    <div className="title">{this.props.box.title}</div>
                    <div className="content-wrapper">
                        <div className="content">
                            {!type && <EmptyBox/>}
                            {type === "clock" && <ClockBox/>}
                        </div>
                    </div>
                </div>
            </Droppable>
        );
    }
}

export default Box;
