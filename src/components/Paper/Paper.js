import React, {Component} from 'react';
import './Paper.css';
import {connect} from 'react-redux';
import {addRequest, clearAllMessage, setControlVisibility, setBgColor, setUserId} from '../../actions';
import {withRouter} from 'react-router-dom';
import {Responsive, WidthProvider} from "react-grid-layout";
import Box from "../Box/Box";
import { Draggable, Droppable } from 'react-drag-and-drop'

const ResponsiveReactGridLayout = WidthProvider(Responsive);
const originalLayouts = getFromLS("layouts") || {};

class Paper extends Component {

    constructor(props) {
        super(props);
        let layouts = getFromLS("layouts");
        let boxes = getFromLS("boxes");

        if (!(layouts)) {
            layouts = {};
        }

        if (!boxes) {
            boxes = [];
        }

        console.log(layouts);
        console.log(boxes);
        this.state = {
            layouts: layouts,
            boxes : boxes
        };
    }



    resetLayout() {
        this.setState({layouts: {}});
    }

    onLayoutChange(layout, layouts) {
        saveToLS("layouts", layouts);
        saveToLS("boxes", this.state.boxes);
        this.setState({layouts});
    }

    addPaper = () => {
        let boxes = this.state.boxes;
        boxes.push({
            key : (boxes.length) + 1,
            title : "NO TITLE ",
            metric : []
        });

        this.setState({
            boxes: boxes
        });

        saveToLS("boxes", boxes);
    };

    setMetric = (key, mode, type, title) => {

        let boxes = this.state.boxes;
        boxes.forEach((box) => {
            if (box.key === key) {
                box.metric.push({
                    mode : mode,
                    type : type
                });
                box.title = title;
                return false;
            }
        });

        this.setState({
            boxes : boxes
        });

        saveToLS("boxes", boxes);
    };

    render() {
        console.log(this.state.boxes);
        return (
            <div className="papers">
                <div className="papers-controls">
                    <div className="paper-control" onClick={this.addPaper}><i className="fa fa-plus-circle" aria-hidden="true"></i></div>
                    <div className="paper-control-separator"></div>
                    <div className="label">METRICS</div>
                    <div className="paper-control"><Draggable type="metric" data="exclusive,clock,CLOCK"><i className="fa fa-clock-o" aria-hidden="true"></i></Draggable></div>
                </div>
                {/*<button onClick={() => this.resetLayout()}>Reset Layout</button>*/}
                <ResponsiveReactGridLayout className="layout" cols={{lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}} rowHeight={30} layouts={this.state.layouts} onLayoutChange={(layout, layouts) =>this.onLayoutChange(layout, layouts)}>
                    {this.state.boxes.map((box, i) => {
                        return <div className="box" key={box.key} data-grid={{w: 6, h: 5, x: 0, y: 0, minW: 1, minH: 2, i: String(i)}}>
                                    <Box setMetric={this.setMetric} box={box} />
                                </div>
                    })}
                </ResponsiveReactGridLayout>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        config: state.config,
        user: state.user
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        setControlVisibility: (name, value) => dispatch(setControlVisibility(name, value)),
        clearAllMessage: () => dispatch(clearAllMessage()),
        setBgColor: (color) => dispatch(setBgColor(color)),
        setUserId: (id) => dispatch(setUserId(id)),
        addRequest: () => dispatch(addRequest()),
    };
};

Paper = connect(mapStateToProps, mapDispatchToProps)(Paper);

export default withRouter(Paper);

function getFromLS(key) {
    let ls = null;
    if (global.localStorage) {
        try {
            ls = JSON.parse(global.localStorage.getItem(key));
        } catch (e) {
            /*Ignore*/
        }
    }
    return ls;
}

function saveToLS(key, value) {
    if (global.localStorage) {
        global.localStorage.setItem(key, JSON.stringify(value));
    }
}