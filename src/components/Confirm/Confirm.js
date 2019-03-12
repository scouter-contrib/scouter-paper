import React, {Component} from 'react';
import './Confirm.css';
import {connect} from 'react-redux';
import {setControlVisibility} from '../../actions';
import {withRouter} from 'react-router-dom';

class Confirm extends Component {
    static defaultProps = {
        buttons: [
            {
                label: 'Confirm',
                onClick: () => null
            },
            {
                label: 'Cancel',
                onClick: () => null
            }
        ],
        style :{
            width : '100%'
        },
        messages:{
            title : "",
            content : "",
        },
        text_icon : "fa fa-info-circle"

    };

    constructor(props) {
        super(props);

        this.state = {
            index : 0
        };
    }

    componentDidMount() {

    }


    render() {
        return (
                <div className="confirm-message" style={{width : this.props.style.width}} >
                    <div className="message-content-layout the-thing">
                        <div className="message-content">
                            <div className="center-message">
                                <div className="message-title"><i className={this.props.text_icon} />{this.props.messages.title}</div>
                                <div className="center-message-content">{this.props.messages.content}</div>
                                <div className="message-btns">
                                    {
                                        this.props.buttons.map((_btn,i)=><button key={i} onClick={_btn.onClick}>{_btn.label}</button>)
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        );
    }
}

let mapDispatchToProps = (dispatch) => {
    return {
        setControlVisibility: (name, value) => dispatch(setControlVisibility(name, value)),
    };
};

Confirm = connect(undefined, mapDispatchToProps)(Confirm);

export default withRouter(Confirm);