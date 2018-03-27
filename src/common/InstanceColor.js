import * as d3 from "d3";

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
}

export default InstanceColor;
