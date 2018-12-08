import React, {Component} from 'react';
import './SimpleSelector.css';

class SimpleSelector extends Component {

    constructor(props) {
        super(props);
        this.state = {
            open : false
        };
    }

    toggleOpen = () => {
        this.setState({
            open : !this.state.open
        })
    };

    onChange = (inx) => {
        this.props.onChange(inx);
        this.setState({
            open : false
        });
    };

    render() {
        console.log(this.props.selected);
        let selectedItem = this.props.list[this.props.selected];
        return (
            <div className="simple-selector-wrapper" onClick={this.props.toggleSelectorVisible}>
                <div className="selected-server">{selectedItem ? selectedItem.name : this.props.emptyMessage}</div>
                <div onClick={this.toggleOpen} className="drop-icon"><span><i className="fa fa-angle-down" aria-hidden="true"></i></span></div>
                {this.state.open &&
                <div className="server-list scrollbar">
                    <ul>
                        {this.props.list.map((item, inx) => {
                            return (
                                <li onClick={this.onChange.bind(this, inx)} key={inx}><span className={"selected-span " + (this.props.selected === inx ? "selected" : "")}></span>{item.name}</li>
                            )
                        })}
                    </ul>
                </div>}
            </div>
        );
    }
}

export default SimpleSelector;