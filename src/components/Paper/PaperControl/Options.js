export function options() {
    return {
        clock: {
            icon: "fa-clock-o",
            mode: "exclusive",
            type: "clock",
            title: "CLOCK",
            config: {
                timezone: {
                    name : 'TIMEZONE',
                    type: "selector",
                    data: ["Asia/Seoul", "UCT", "US/Central", "US/Pacific", "Europe/Paris", "Asia/Tokyo", "Australia/Sydney"],
                    value: "Asia/Seoul"
                },
                format: {
                    name : 'TIME FORMAT',
                    type: "input",
                    value: "HH:mm:ss",
                    tooltip: {
                        type : "link",
                        content : "https://momentjs.com/docs/#/displaying/format/"
                    }
                }
            }
        },
        flash: {
            icon: "fa-ellipsis-h",
            mode: "exclusive",
            type: "xlogBar",
            title: "XLOG BAR",
            config: {
                count: {
                    name : 'SHOW COUNT',
                    type: "checkbox",
                    value: false
                },
                history: {
                    name : 'HISTORY COUNT',
                    type: "selector",
                    data: [1,2,3,4,5],
                    value: 1
                }
            }
        },
        xlog: {
            //text: "XLOG",
            icon : "fa-bullseye",
            mode: "exclusive",
            type: "xlog",
            title: "XLOG",
            config: {
                count: {
                    name : 'SHOW COUNT',
                    type: "checkbox",
                    value: false
                },
                history: {
                    name : 'HISTORY COUNT',
                    type: "selector",
                    data: [1,2,3,4,5],
                    value: 1
                }
            }
        }

    }
}