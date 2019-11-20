import * as d3 from "d3";
import {schemeSet3,interpolateViridis} from "d3-scale-chromatic";
import Color from "color-js";

let instanceColors = {};
let metricColors = {};
let xlogColors = {};
const defaultRgbMapBlue10=[
    "#1E90FF"
    ,"#2E8B57"
    ,"#8B4513"
    ,"#66CDAA"
    ,"#0064CD"
    ,"#698AA3"
    ,"#5A5AFF"
    ,"#ADA893"
    ,"#006400"
    ,"#6D7270"
];


class InstanceColor {



    static setInstances(instances, colorType) {
        instanceColors = {};
        const _xlogFamilly = instances.filter(_in=> _in.objFamily === 'javaee' || _in.objFamily === 'tracing');
        const _total = _xlogFamilly.length;
        _xlogFamilly.forEach((instance, n) => {
            xlogColors[instance.objHash] = interpolateViridis(n/_total);
        });

        instances.forEach((instance, n) => {
            instanceColors[instance.objHash] = [];
            let instanceBaseColor;

            if (n > 10) {
                let cnt = Math.floor(n / 10);
                instanceBaseColor = Color(defaultRgbMapBlue10[n % 10]).shiftHue(20 * cnt);
            } else {
                instanceBaseColor = defaultRgbMapBlue10[n]; // 10
            }

            instanceColors[instance.objHash].push(instanceBaseColor);

            for (let i=0; i<4; i++) {
                let color = Color(instanceBaseColor);
                if (colorType === "white") {
                    instanceColors[instance.objHash].push(color.darkenByRatio(0.15 * (i + 1)).toCSS());
                } else {
                    instanceColors[instance.objHash].push(color.lightenByRatio(0.15 * (i + 1)).toCSS());
                }
            }
        });


    }

    static getInstanceColors() {
        return instanceColors;
    }
    static getXlogColors() {
        return xlogColors;
    }

    static getMetricColor(metric, colorType) {
        if (!metricColors[metric]) {
            let inx = Object.values(metricColors).length % 10;
            let hue = Math.floor(Object.values(metricColors).length / 10);
            let color;
            if (colorType === "white") {
                color = Color(d3.schemeCategory10[inx]);
            } else {
                color = Color(schemeSet3[inx]);
            }
            metricColors[metric] = color.darkenByRatio(0.1 * hue).toCSS();
        }

        return metricColors[metric];
    }

}

export default InstanceColor;
