import React, {Component} from 'react';
import './Loading.css';
import './Spinner.css'
class Loading extends Component {

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.visible !== nextProps.visible;
    }

    componentDidUpdate(prevProps, prevState) {

        if (this.props.visible) {
            this.refs.loading.style.display = "table";
            this.refs.loading.style.opacity = "1";
        } else {
            this.refs.loading.style.opacity = "0";
            setTimeout(() => {
                this.refs.loading.style.display = "none";
            }, 500);
        }
    }

    render() {
        return (
            <div className="loading" ref="loading">
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

export default Loading;