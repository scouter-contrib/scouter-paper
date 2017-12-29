import React, {Component} from 'react';
import './ContentWrapper.css';

class ContentWrapper extends Component {
    render() {
        return (
            <article className="content-wrapper">
                <div>{this.props.children}</div>
            </article>
        );
    }
}

export default ContentWrapper;