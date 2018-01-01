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
        }
    }
}