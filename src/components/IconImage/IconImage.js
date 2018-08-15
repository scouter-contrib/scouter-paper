import React, {Component} from 'react';
import './IconImage.css';

import java from '../../img/icons/java.png';
import kafka from '../../img/icons/kafka.png';
import mysql from '../../img/icons/mysql.png';
import nginx from '../../img/icons/nginx.png';
import redis from '../../img/icons/redis.png';
import tomcat from '../../img/icons/tomcat.png';
import linux from '../../img/icons/linux.png';
import jetty from '../../img/icons/jetty.png';
import object from '../../img/icons/cube.png';

class IconImage extends Component {

    render() {
        let icon = object;
        switch (this.props.icon) {
            case "tomcat" : {
                icon = tomcat;
                break;
            }
            case "java" : {
                icon = java;
                break;
            }

            case "kafka" : {
                icon = kafka;
                break;
            }

            case "mysql" : {
                icon = mysql;
                break;
            }

            case "nginx" : {
                icon = nginx;
                break;
            }

            case "redis" : {
                icon = redis;
                break;
            }

            case "linux" : {
                icon = linux;
                break;
            }

            case "jetty" : {
                icon = jetty;
                break;
            }

            default : {
                icon = object;
                break;
            }
        }

        return (
            <div className="icon-img-wrapper">
                <div>
                    <img className="icon-img" alt={icon} src={icon}/>
                </div>
            </div>

        );
    }
}

export default IconImage;