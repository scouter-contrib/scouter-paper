import * as d3 from "d3";
import Color from "color-js";


let colorMain1 = [];
let colorSub1 = [];
let colorMain2 = [];
let colorSub2 = [];


for(let n=0; n < 5; n++) {
    colorMain1.push(d3.schemeCategory20[n*2]);
    colorSub1.push(d3.schemeCategory20[n*2+1]);
}

for(let n=0; n < 5; n++) {
    colorMain1.push(d3.schemeCategory20b[n*4]);
    colorSub1.push(d3.schemeCategory20b[n*4+2]);
}

for(let n=0; n < 5; n++) {
    colorMain2.push(d3.schemeCategory20b[n*4+1]);
    colorSub2.push(d3.schemeCategory20b[n*4+3]);
}

for(let n=5; n < 10; n++) {
    colorMain2.push(d3.schemeCategory20[n*2]);
    colorSub2.push(d3.schemeCategory20[n*2+1]);
}

for(let n=0; n < 5; n++) {
    colorMain1.push(d3.schemeCategory20c[n*4]);
    colorSub1.push(d3.schemeCategory20c[n*4+2]);
}
for(let n=0; n < 5; n++) {
    colorMain2.push(d3.schemeCategory20c[n*4+1]);
    colorSub2.push(d3.schemeCategory20c[n*4+3]);
}

let instanceColors = {};
let hostColors = {};
let metricColors = {};
class InstanceColor {
    static setInstances(instances) {
        const mainColors = colorMain1.concat(colorMain2);
        const subColors = colorSub1.concat(colorSub2);

        instanceColors = {};
        instances.forEach((instance, n) => {
            instanceColors[instance.objHash] = {
                main: mainColors[n],
                sub: subColors[n]
            };
        });
    }

    static setHosts(hosts) {
        const mainColors = colorMain2.concat(colorMain1);
        const subColors = colorSub2.concat(colorSub1);

        hostColors = {};
        hosts.forEach((host, n) => {
            hostColors[host.objHash] = {
                main: mainColors[n],
                sub: subColors[n]
            };
        });
    }

    static getInstanceColors() {
        return instanceColors;
    }

    static getHostColors() {
        return hostColors;
    }

    static getMetricColor(metric) {
        if (!metricColors[metric]) {
            let inx = Object.values(metricColors).length % 10;
            let hue = Math.floor(Object.values(metricColors).length / 10);
            let color = Color(d3.schemeCategory10[inx]);
            //metricColors[metric] = color.shiftHue(20 * hue).toCSS();
            metricColors[metric] = color.darkenByRatio(0.1 * hue).toCSS();
        }

        return metricColors[metric];
    }


}

export default InstanceColor;
