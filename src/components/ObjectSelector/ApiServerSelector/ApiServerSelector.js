import React, {Component} from 'react';
import './ApiServerSelector.css';

class ApiServerSelector extends Component {

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

    serverClick = (inx) => {
        this.props.onChange(inx);
        this.setState({
            open : false
        });
    };

    render() {
        let selectedServer = this.props.servers[this.props.selected];
        return (
            <div className="api-server-selector-wrapper" onClick={this.props.toggleSelectorVisible}>
                <div className="selected-server">{selectedServer.protocol + "://" + selectedServer.address + ":" + selectedServer.port}</div>
                <div onClick={this.toggleOpen} className="drop-icon"><span><i className="fa fa-angle-down" aria-hidden="true"></i></span></div>
                {this.state.open &&
                <div className="server-list scrollbar">
                    <ul>
                        {this.props.servers.map((server, inx) => {
                            return (
                                <li onClick={this.serverClick.bind(this, inx)} key={inx}><span className={"selected-span " + (this.props.selected === inx ? "selected" : "")}></span>{server.protocol + "://" + server.address + ":" + server.port}</li>
                            )
                        })}
                    </ul>
                </div>}
            </div>
        );
    }
}

export default ApiServerSelector;