import React, {Component} from 'react';
import './Unsupport.css';
import browser from './browser-logos.png';

class Unsupport extends Component {

    render() {
        let url = "url(" + browser + ")"
        return (
            <article className="unsupport">
                <div>
                    <div className="logo"><span>SCOUTER PAPER</span></div>
                    <div className="browser-info"><span>{this.props.name}-{this.props.version}</span></div>
                    <div className="msg"><span>Your Browser is not supported</span></div>
                    <div className="line"></div>
                    <div className="support-browser"><span>SUPPORT BROWSER</span></div>
                    <div className="browsers">
                        <a href="https://www.google.com/chrome/">
                            <div className="browser-icon chrome" style={{backgroundImage: url}}>
                                <div className="browser-name"><span>CHROME</span></div>
                            </div>
                        </a>
                        <a href="https://www.mozilla.org/ko/firefox/new/">
                            <div className="browser-icon firefox" style={{backgroundImage: url}}>
                                <div className="browser-name"><span>FIREFOX</span></div>
                            </div>
                        </a>
                        <a href="http://www.opera.com/ko/download">
                            <div className="browser-icon opera" style={{backgroundImage: url}}>
                                <div className="browser-name"><span>OPERA</span></div>
                            </div>
                        </a>
                        <a href="https://support.apple.com/ko_KR/downloads/safari">
                            <div className="browser-icon safari" style={{backgroundImage: url}}>
                                <div className="browser-name"><span>SAFARI</span></div>
                            </div>
                        </a>
                    </div>
                    <div className="click-message">CLICK BROWSER ICON TO GO DOWNLOAD PAGE</div>
                </div>
            </article>
        );
    }
}

export default Unsupport;