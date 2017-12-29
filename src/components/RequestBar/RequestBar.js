import React, {Component} from 'react';
import './RequestBar.css';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';

class RequestBar extends Component {

    lastRequestTIme = null;
    range = 2000;

    constructor(props) {
        super(props);
        this.state = {
            requests: []
        };
    }

    componentWillReceiveProps(nextProps) {

        if (this.lastRequestTIme !== nextProps.request.time) {
            let requests = this.state.requests;

            let dup = requests.filter((d) => {
                return d.time === nextProps.request.time;
            }).length;

            if (dup < 1) {
                requests.push({
                    process: false,
                    time: nextProps.request.time
                });

                let now = new Date().getTime();
                requests = requests.filter((d) => {
                    if (!d.process || now < (d.time + this.range)) {
                        return true;
                    } else {
                        return false;
                    }
                });

                this.setState({
                    requests: requests
                });
            }


        }

    }

    shouldComponentUpdate(nextProps, nextState) {
        let update = false;
        if (this.lastRequestTIme !== nextProps.request.time) {
            this.lastRequestTIme = nextProps.request.time;
            update = true;
        }
        return update;
    }

    componentDidUpdate() {

        let requests = this.state.requests;

        let now = new Date().getTime();
        this.refs.requestBar.querySelectorAll("div").forEach((e) => {
            if ((now - this.range) > e.getAttribute("data-time")) {
                e.remove();
            }
        });

        requests.forEach((d) => {
            let dup = this.refs.requestBar.querySelectorAll("div[data-time='" + d.time + "'");
            if (dup.length < 1) {
                let div = document.createElement("div");
                div.setAttribute("data-time", d.time);
                this.refs.requestBar.appendChild(div);
                setTimeout(() => {
                    div.classList.add("request");
                }, (now - d.time));
            }
        });

        requests = requests.map((d) => {
            d.process = true;
            return d;
        });

        this.setState({
            requests: requests
        });

    }

    render() {
        return (
            <div className="request-bar" ref="requestBar"></div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        request: state.request
    };
};

RequestBar = connect(mapStateToProps, null)(RequestBar);

export default withRouter(RequestBar);