import React, {Component} from 'react';
import './Paper.css';
import './Resizable.css';
import {connect} from 'react-redux';
import {addRequest, clearAllMessage, setControlVisibility, setBgColor, setUserId} from '../../actions';
import {withRouter} from 'react-router-dom';
import {Responsive, WidthProvider} from "react-grid-layout";
import Box from "../Box/Box";
import * as Options from './Options';
import {Draggable, Droppable} from 'react-drag-and-drop'
import BoxConfig from "./BoxConfig/BoxConfig";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

class Paper extends Component {

    options = null;
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

        this.options = Options.options();

        this.state = {
            layouts: layouts,
            boxes: boxes
        };
    }

    onLayoutChange(layout, layouts) {
        let boxes = this.state.boxes;
        boxes.forEach((box) => {
            layout.forEach((l) => {
                if (box.key === l.i) {
                    box.layout = l;
                    return false;
                }
            });
        });
        saveToLS("layouts", layouts);
        saveToLS("boxes", this.state.boxes);
        this.setState({layouts});
    }

    getUniqueKey() {
        let dup = false;
        let key = null;
        do {
            key = String(this.state.boxes.length + 1);
            this.state.boxes.forEach((box) => {
                if (box.key === key) {
                    dup = true;
                    return false;
                }
            });
        } while (dup);

        return key;
    }

    addPaper = () => {
        let boxes = this.state.boxes;
        let key = this.getUniqueKey();
        boxes.push({
            key: key,
            title: "NO TITLE ",
            layout: {w: 6, h: 4, x: 0, y: 0, minW: 1, minH: 3, i: key},
        });

        this.setState({
            boxes: boxes
        });

        saveToLS("boxes", boxes);
    };

    removePaper = (key) => {
        let boxes = this.state.boxes;
        boxes.forEach((box, i) => {
            if (box.key === key) {
                boxes.splice(i, 1);
                return false;
            }
        });

        let layouts = this.state.layouts;


        for (let unit in layouts) {
            if (layouts[unit] && layouts[unit].length > 0) {
                layouts[unit].forEach((layout, i) => {
                    if (layout.i === key) {
                        layouts[unit].splice(i, 1);
                        return false;
                    }
                })
            }
        }

        this.setState({
            boxes: boxes,
            layouts: layouts
        });
    };

    clearLayout = () => {
        this.setState({
            boxes: [],
            layouts: {}
        });
    };

    setOption = (key, option) => {
        let boxes = this.state.boxes;
        boxes.forEach((box) => {
            if (box.key === key) {

                if (option.mode === "exclusive") {
                    box.option = {
                        mode: option.mode,
                        type: option.type,
                        config: option.config,
                    };
                } else {
                    box.option.push({
                        mode: option.mode,
                        type: option.type,
                        config: option.config,
                    });
                }

                box.values = {};
                for (let attr in option.config) {
                    box.values[attr] = option.config[attr].value;
                }

                box.config = false;
                box.title = option.title;
                return false;
            }
        });

        this.setState({
            boxes: boxes
        });

        saveToLS("boxes", boxes);
    };

    setOptionValues = (key, values) => {

        let boxes = this.state.boxes;
        boxes.forEach((box) => {
            if (box.key === key) {
                for (let attr in values) {
                    box.values[attr] = values[attr];
                }

                box.config = false;
            }
        });

        this.setState({
            boxes: boxes
        });

        saveToLS("boxes", boxes);
    };

    setOptionClose= (key) => {

        let boxes = this.state.boxes;
        boxes.forEach((box) => {
            if (box.key === key) {
                box.config = false;
            }
        });

        this.setState({
            boxes: boxes
        });

        saveToLS("boxes", boxes);
    };


    toggleConfig = (key) => {
        let boxes = this.state.boxes;
        boxes.forEach((box) => {
            if (box.key === key) {
                box.config = !box.config;
                return false;
            }
        });

        this.setState({
            boxes: boxes
        });

    };

    render() {
        return (
            <div className="papers">
                <div className="papers-controls">
                    <div className="paper-control" onClick={this.addPaper}><i className="fa fa-plus-circle" aria-hidden="true"></i></div>
                    <div className="paper-control-separator"></div>
                    <div className="label">METRICS</div>
                    {Object.keys(this.options).map((name, i) => (
                        <div key={i} className="paper-control"><Draggable type="metric" className="draggable" data={JSON.stringify(this.options[name])}><i className={"fa " + this.options[name].icon} aria-hidden="true"></i></Draggable></div>
                        ))
                    }
                    <div className="paper-control"><Draggable type="metric" className="draggable" data="exclusive,clock,CLOCK"><i className="fa fa-clock-o" aria-hidden="true"></i></Draggable></div>
                    <div className="paper-control paper-right" onClick={this.clearLayout}><i className="fa fa-trash-o" aria-hidden="true"></i></div>
                </div>
                <ResponsiveReactGridLayout className="layout" cols={{lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}} layouts={this.state.layouts} rowHeight={30} onLayoutChange={(layout, layouts) => this.onLayoutChange(layout, layouts)}>
                    {this.state.boxes.map((box, i) => {
                        return <div className="box-layout" key={box.key} data-grid={box.layout}>
                            <button className="box-control box-layout-remove-btn last" onClick={this.removePaper.bind(null, box.key)}><i className="fa fa-times-circle-o" aria-hidden="true"></i></button>
                            <button className="box-control box-layout-config-btn" onClick={this.toggleConfig.bind(null, box.key)}><i className="fa fa-cog" aria-hidden="true"></i></button>
                            {box.config && <BoxConfig box={box} setOptionValues={this.setOptionValues} setOptionClose={this.setOptionClose} />}
                            <Box setOption={this.setOption} box={box}/>
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