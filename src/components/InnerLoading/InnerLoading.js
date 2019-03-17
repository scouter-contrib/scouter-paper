import React, {Component} from 'react';
import './InnerLoading.css';

class InnerLoading extends Component {

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.visible !== nextProps.visible;
    }
    componentDidUpdate(prevProps, prevState) {

        if (this.props.visible) {
            this.refs.innerLoading.style.display = "table";
            this.refs.innerLoading.style.opacity = "1";
        } else {
            this.refs.innerLoading.style.opacity = "0";
            setTimeout(() => {
                this.refs.innerLoading.style.display = "none";
            }, 500);
        }
    }

    render() {
        return (
            <div className="innerLoading" ref="innerLoading">
                <div>
                    <div className="spinner">
                        <div className="cube1"></div>
                        <div className="cube2"></div>
                    </div>
                </div>
            </div>
        );
    }
}

export default InnerLoading;