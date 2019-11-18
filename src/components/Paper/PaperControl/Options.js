export function options() {
    return {
        clock: {
            icon: "fa-clock-o",
            mode: "exclusive",
            type: "clock",
            title: "CLOCK",
            config: {
                timezone: {
                    name: 'TIMEZONE',
                    type: "selector",
                    data: ["Asia/Seoul", "UCT", "US/Central", "US/Pacific", "Europe/Paris", "Asia/Tokyo", "Australia/Sydney"],
                    value: "Asia/Seoul"
                },
                format: {
                    name: 'TIME FORMAT',
                    type: "input",
                    value: "HH:mm:ss",
                    tooltip: {
                        type: "link",
                        content: "https://momentjs.com/docs/#/displaying/format/"
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
                    name: 'SHOW COUNT',
                    type: "checkbox",
                    value: false
                },
                history: {
                    name: 'HISTORY COUNT',
                    type: "selector",
                    data: [1, 2, 3, 4, 5],
                    value: 1
                }
            }
        },
        xlog: {
            //text: "XLOG",
            icon: "fa-bullseye",
            mode: "exclusive",
            type: "xlog",
            title: "XLOG",
            config: {
                showPreview: {
                    name: 'SHOW PROCESS',
                    type: "selector",
                    data: ["Y", "N"],
                    value: "N"
                },
                showClassicMode : {
                    name :'CLASSIC MODE',
                    type: "selector",
                    data: ["Y", "N"],
                    value: "N"
                }

            }
        },
        visitor: {
            icon: "fa-child",
            mode: "exclusive",
            type: "visitor",
            title: "VISITOR",
            config: {
                showNumber: {
                    name: 'SHOW NUMBER',
                    type: "checkbox",
                    value: true
                },
                showGraph: {
                    name: 'SHOW GRAPH',
                    type: "checkbox",
                    value: false
                },
                showAxis: {
                    name: 'AXIS',
                    type: "selector",
                    data: ["BOTH", "LEFT", "RIGHT", "NONE"],
                    value: "BOTH"
                },
                range: {
                    name: 'Range',
                    type: "input",
                    value: "60",
                    tooltip: {
                        type: "text",
                        content: "seconds"
                    }
                }
            }
        },
        diskUsage: {
            icon: "fa-hdd-o",
            mode: "exclusive",
            type: "diskUsage",
            title: "Disk Usage",
            config: {

            }
        },
        activeSpeed: {
            icon: "fa-bars",
            mode: "exclusive",
            type: "ActiveSpeed",
            title: "Active Speed",
            counterKey : "ActiveSpeed",
            config: {
                instanceNameWidth: {
                    name: 'Instance Name Width',
                    type: "selector",
                    data: ["10%", "20%", "30%", "40%", "50%", "60%", "70%"],
                    value: "20%"
                },
                maxValue: {
                    name: 'MAX VALUE',
                    type: "input",
                    value: "50",
                    tooltip: {
                        type: "text",
                        content: "cnt"
                    }
                },
                singleLine: {
                    name: 'SINGLE LINE',
                    type: "checkbox",
                    value: false
                },
                showCnt: {
                    name: 'SHOW COUNT',
                    type: "checkbox",
                    value: false
                }
            }
        },
        lineChart: {
            icon: "fa-line-chart",
            mode: "nonexclusive",
            type: "counter",
            title: "LINE CHART",
            config: {
                chartType : {
                    name: "Chart Type",
                    type: "selector",
                    data: ["LINE", "LINE FILL", "STACK AREA"],
                    value: "LINE"
                }
            }
        }

        /*,
        WAS: [
            {
                text: "TPS",
                mode: "nonexclusive",
                type: "counter",
                title: "TPS",
                counterKey : "TPS",
                objectType : "instance"
            },
            {
                text: "Elapsed Time",
                mode: "nonexclusive",
                type: "counter",
                title: "Elapsed Time",
                counterKey : "ElapsedTime",
                objectType : "instance"
            },
            {
                text: "Top 90% Elapsed Time",
                mode: "nonexclusive",
                type: "counter",
                title: "Top 90% Elapsed Time",
                counterKey : "Elapsed90%",
                objectType : "instance"
            },
            {
                text: "Service Count",
                mode: "nonexclusive",
                type: "counter",
                title: "Service Count",
                counterKey : "ServiceCount",
                objectType : "instance"
            },
            {
                text: "Error Rate",
                mode: "nonexclusive",
                type: "counter",
                title: "Error Rate",
                counterKey : "ErrorRate",
                objectType : "instance"
            },
            {
                text: "Active Service",
                mode: "nonexclusive",
                type: "counter",
                title: "Active Service",
                counterKey : "ActiveService",
                objectType : "instance"
            },
            {
                text: "Recent User",
                mode: "nonexclusive",
                type: "counter",
                title: "Recent User",
                counterKey : "RecentUser",
                objectType : "instance"
            },
            {
                text: "Sql Time By Service",
                mode: "nonexclusive",
                type: "counter",
                title: "Sql Time By Service",
                counterKey : "SqlTimeByService",
                objectType : "instance"
            },
            {
                text: "API Time By Service",
                mode: "nonexclusive",
                type: "counter",
                title: "API Time By Service",
                counterKey : "ApiTimeByService",
                objectType : "instance"
            },
            {
                text: "Queuing Time",
                mode: "nonexclusive",
                type: "counter",
                title: "Queuing Time",
                counterKey : "QueuingTime",
                objectType : "instance"
            },
            {
                text: "SQL Time",
                mode: "nonexclusive",
                type: "counter",
                title: "SQL Time",
                counterKey : "SqlTime",
                objectType : "instance"
            },
            {
                text: "SQL TPS",
                mode: "nonexclusive",
                type: "counter",
                title: "SQL TPS",
                counterKey : "SqlTPS",
                objectType : "instance"
            },
            {
                text: "SQL Error Rate",
                mode: "nonexclusive",
                type: "counter",
                title: "SQL Error Rate",
                counterKey : "SqlErrorRate",
                objectType : "instance"
            },
            {
                text: "API Time",
                mode: "nonexclusive",
                type: "counter",
                title: "API Time",
                counterKey : "ApiTime",
                objectType : "instance"
            },
            {
                text: "API TPS",
                mode: "nonexclusive",
                type: "counter",
                title: "API TPS",
                counterKey : "ApiTPS",
                objectType : "instance"
            },
            {
                text: "API Error Rate",
                mode: "nonexclusive",
                type: "counter",
                title: "API Error Rate",
                counterKey : "ApiErrorRate",
                objectType : "instance"
            }
        ],

        JAVA: [
            {
                text: "GC Count",
                mode: "nonexclusive",
                type: "counter",
                title: "GC Count",
                counterKey : "GcCount",
                objectType : "instance"
            },
            {
                text: "GC Time",
                mode: "nonexclusive",
                type: "counter",
                title: "GC Time",
                counterKey : "GcTime",
                objectType : "instance"
            },
            {
                text: "Heap Used",
                mode: "nonexclusive",
                type: "counter",
                title: "Heap Used",
                counterKey : "HeapUsed",
                objectType : "instance"
            },
            {
                text: "Heap Total",
                mode: "nonexclusive",
                type: "counter",
                title: "Heap Total",
                counterKey : "HeapTotal",
                objectType : "instance"
            },
            {
                text: "CPU Time",
                mode: "nonexclusive",
                type: "counter",
                title: "CPU Time",
                counterKey : "CpuTime",
                objectType : "instance"
            },
            {
                text: "Perm Used",
                mode: "nonexclusive",
                type: "counter",
                title: "Perm Used",
                counterKey : "PermUsed",
                objectType : "instance"
            },
            {
                text: "Perm Percent",
                mode: "nonexclusive",
                type: "counter",
                title: "Perm Percent",
                counterKey : "PermPercent",
                objectType : "instance"
            },
            {
                text: "Process Cpu",
                mode: "nonexclusive",
                type: "counter",
                title: "Process Cpu",
                counterKey : "ProcCpu",
                objectType : "instance"
            },
            {
                text: "FD Usage",
                mode: "nonexclusive",
                type: "counter",
                title: "FD Usage",
                counterKey : "FdUsage",
                objectType : "instance"
            }
        ],

        DATASOURCE: [
            {
                text: "Conn Active",
                mode: "nonexclusive",
                type: "counter",
                title: "Conn Active",
                counterKey : "ConnActive",
                objectType : "instance"
            },
            {
                text: "Conn Idle",
                mode: "nonexclusive",
                type: "counter",
                title: "Conn Idle",
                counterKey : "ConnIdle",
                objectType : "instance"
            },
            {
                text: "Conn Max",
                mode: "nonexclusive",
                type: "counter",
                title: "Conn Max",
                counterKey : "ConnMax",
                objectType : "instance"
            }
        ],

        HOST: [
            {
                text: "Cpu",
                mode: "nonexclusive",
                type: "counter",
                title: "Cpu",
                counterKey : "Cpu",
                objectType : "host"
            },
            {
                text: "Sys Cpu",
                mode: "nonexclusive",
                type: "counter",
                title: "Sys Cpu",
                counterKey : "SysCpu",
                objectType : "host"
            },
            {
                text: "User Cpu",
                mode: "nonexclusive",
                type: "counter",
                title: "User Cpu",
                counterKey : "UserCpu",
                objectType : "host"
            },
            {
                text: "Mem",
                mode: "nonexclusive",
                type: "counter",
                title: "Mem",
                counterKey : "Mem",
                objectType : "host"
            },
            {
                text: "Mem Available",
                mode: "nonexclusive",
                type: "counter",
                title: "Mem Available",
                counterKey : "MemA",
                objectType : "host"
            },
            {
                text: "Mem Used",
                mode: "nonexclusive",
                type: "counter",
                title: "Mem Used",
                counterKey : "MemU",
                objectType : "host"
            },
            {
                text: "Mem Total",
                mode: "nonexclusive",
                type: "counter",
                title: "Mem Total",
                counterKey : "MemT",
                objectType : "host"
            },
            {
                text: "Page In",
                mode: "nonexclusive",
                type: "counter",
                title: "Page In",
                counterKey : "PageIn",
                objectType : "host"
            },
            {
                text: "Page Out",
                mode: "nonexclusive",
                type: "counter",
                title: "Page Out",
                counterKey : "PageOut",
                objectType : "host"
            },
            {
                text: "Swap",
                mode: "nonexclusive",
                type: "counter",
                title: "Swap",
                counterKey : "Swap",
                objectType : "host"
            },
            {
                text: "Swap Used",
                mode: "nonexclusive",
                type: "counter",
                title: "Swap Used",
                counterKey : "SwapU",
                objectType : "host"
            },
            {
                text: "Swap Total",
                mode: "nonexclusive",
                type: "counter",
                title: "Swap Total",
                counterKey : "SwapT",
                objectType : "host"
            }
        ],

        NETWORK: [
            {
                text: "Net InBound",
                mode: "nonexclusive",
                type: "counter",
                title: "Net InBound",
                counterKey : "NetInBound",
                objectType : "host"
            },
            {
                text: "Net OutBound",
                mode: "nonexclusive",
                type: "counter",
                title: "Net OutBound",
                counterKey : "NetOutBound",
                objectType : "host"
            },
            {
                text: "TCP Stat CLOSE_WAIT",
                mode: "nonexclusive",
                type: "counter",
                title: "TCP Stat CLOSE_WAIT",
                counterKey : "TcpStatCLS",
                objectType : "host"
            },
            {
                text: "TCP Stat TIME_WAIT",
                mode: "nonexclusive",
                type: "counter",
                title: "TCP Stat TIME_WAIT",
                counterKey : "TcpStatTIM",
                objectType : "host"
            },
            {
                text: "TCP Stat FIN_WAIT",
                mode: "nonexclusive",
                type: "counter",
                title: "TCP Stat FIN_WAIT",
                counterKey : "TcpStatFIN",
                objectType : "host"
            },
            {
                text: "TCP Stat ESTABLISHED",
                mode: "nonexclusive",
                type: "counter",
                title: "TCP Stat ESTABLISHED",
                counterKey : "TcpStatEST",
                objectType : "host"
            },
            {
                text: "Net Rx Bytes",
                mode: "nonexclusive",
                type: "counter",
                title: "Net Rx Bytes",
                counterKey : "NetRxBytes",
                objectType : "host"
            },
            {
                text: "Net Tx Bytes",
                mode: "nonexclusive",
                type: "counter",
                title: "Net Tx Bytes",
                counterKey : "NetTxBytes",
                objectType : "host"
            }
        ],

        DISK: [
            {
                text: "Disk Read Bytes",
                mode: "nonexclusive",
                type: "counter",
                title: "Disk Read Bytes",
                counterKey : "DiskReadBytes",
                objectType : "host"
            },
            {
                text: "Disk Write Bytes",
                mode: "nonexclusive",
                type: "counter",
                title: "Disk Write Bytes",
                counterKey : "DiskWriteBytes",
                objectType : "host"
            }
        ]*/
    }
}
