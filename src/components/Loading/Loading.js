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
            }, 1000);
        }
    }

    render() {
        return (
            <div className="loading" ref="loading">
                <div className="loading_ui">
                    <div className='loader'>
                        <div className="inner one"></div>
                        <div className="inner two"></div>
                        <div className="inner three"></div>
                        <div className="loading_text" data-text="Loading...">Loading...</div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Loading;