import React, {Component} from 'react';
import './Home.css';
import {withRouter} from 'react-router-dom';
import logo from '../../img/scouter.png';
import jQuery from "jquery";
const git = "https://github.com/mindplates/scouter-paper";
const version = "1.3";

class Home extends Component {

    constructor(props) {
        super(props);
        this.state = {
            release : false,
            showNote : false
        };
    }

    componentDidMount = () => {
        let that = this;
        var url = 'https://api.github.com/repos/mindplates/scouter-paper/releases/latest';
        jQuery.get(url).done(function (data) {
            if (data.tag_name > version) {
                that.setState({
                    release : true,
                    version : data.name,
                    url : data.html_url,
                    text : data.body
                });
            }
        });
    };

    render() {
        return (
            <div className="home">
                <div>
                    <div>
                        {this.state.release &&
                        <div className="release">
                            <div className="msg">NEW VERSION({this.state.version}) RELEASED</div>
                            <div className="btns"><a href={this.state.url}><span>DOWNLOAD</span></a><span onClick={() => {this.setState({showNote:true})}}>RELEASE NOTE</span></div>
                        </div>
                        }
                        {(this.state.release && this.state.showNote) &&
                        <div className="note">
                            <div>
                                <div className="release-title">{this.state.version} RELEASE NOTE</div>
                                <div className="release-note">{this.state.text}</div>
                            </div>
                        </div>
                        }
                        <div className="home-content">
                            <div className="top-div">
                                <div className="logo-div"><img alt="scouter-logo" className="logo" src={logo}/></div>
                                <div className="product">SCOUTER PAPER</div>
                                <div className="version">V-{version}</div>
                                <div className="power-by">powered by <a href="https://github.com/scouter-project/scouter" target="scouter_paper">scouter</a></div>
                                <div className="compatibility">(SCOUTER Compatibility 1.8.4+)</div>
                                <div className="git"><span className="tag">GITHUB</span><a href={git} target="scouter_paper">{git}</a></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(Home);