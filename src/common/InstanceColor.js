import * as d3 from "d3";
import {schemeSet3} from "d3-scale-chromatic";
import Color from "color-js";

let instanceColors = {};
let metricColors = {};
class InstanceColor {
    static setInstances(instances, colorType) {
        instanceColors = {};
        instances.forEach((instance, n) => {
            instanceColors[instance.objHash] = [];
            let instanceBaseColor;
            if (n > 9) {
                let cnt = Math.floor(n / 10);
                instanceBaseColor = Color(d3.schemeCategory10[n % 10]).shiftHue(20 * cnt);
            } else {
                instanceBaseColor = d3.schemeCategory10[n]; // 10
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
