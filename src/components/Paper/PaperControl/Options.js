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
                    value: "Y"
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

        WAS: [
            {
                text: "TPS",
                mode: "nonexclusive",
                type: "counter",
                title: "TPS",
                counterKey : "TPS"
            },
            {
                text: "Active Speed",
                mode: "nonexclusive",
                type: "counter",
                title: "Active Speed",
                counterKey : "ActiveSpeed",
                multiValue : ["L", "M", "S"]
            },
            {
                text: "Elapsed Time",
                mode: "nonexclusive",
                type: "counter",
                title: "Elapsed Time",
                counterKey : "ElapsedTime"
            },
            {
                text: "Service Count",
                mode: "nonexclusive",
                type: "counter",
                title: "Service Count",
                counterKey : "ServiceCount"
            },
            {
                text: "Error Rate",
                mode: "nonexclusive",
                type: "counter",
                title: "Error Rate",
                counterKey : "ErrorRate"
            },
            {
                text: "Active Service",
                mode: "nonexclusive",
                type: "counter",
                title: "Active Service",
                counterKey : "ActiveService"
            },
            {
                text: "Recent User",
                mode: "nonexclusive",
                type: "counter",
                title: "Recent User",
                counterKey : "RecentUser"
            },
            {
                text: "SqlTime By Service",
                mode: "nonexclusive",
                type: "counter",
                title: "SqlTime By Service",
                counterKey : "SqlTimeByService"
            },
            {
                text: "API Time By Service",
                mode: "nonexclusive",
                type: "counter",
                title: "API Time By Service",
                counterKey : "ApiTimeByService"
            },
            {
                text: "Queuing Time",
                mode: "nonexclusive",
                type: "counter",
                title: "Queuing Time",
                counterKey : "QueuingTime"
            },
            {
                text: "SQL Time",
                mode: "nonexclusive",
                type: "counter",
                title: "SQL Time",
                counterKey : "SqlTime"
            },
            {
                text: "SQL TPS",
                mode: "nonexclusive",
                type: "counter",
                title: "SQL TPS",
                counterKey : "SqlTPS"
            },
            {
                text: "SQL Error Rate",
                mode: "nonexclusive",
                type: "counter",
                title: "SQL Error Rate",
                counterKey : "SqlErrorRate"
            },
            {
                text: "API Time",
                mode: "nonexclusive",
                type: "counter",
                title: "API Time",
                counterKey : "ApiTime"
            },
            {
                text: "API TPS",
                mode: "nonexclusive",
                type: "counter",
                title: "API TPS",
                counterKey : "ApiTPS"
            },
            {
                text: "API Error Rate",
                mode: "nonexclusive",
                type: "counter",
                title: "API Error Rate",
                counterKey : "ApiErrorRate"
            }
        ],

        JAVA: [
            {
                text: "GC Count",
                mode: "nonexclusive",
                type: "counter",
                title: "GC Count",
                counterKey : "GcCount"
            },
            {
                text: "GC Time",
                mode: "nonexclusive",
                type: "counter",
                title: "GC Time",
                counterKey : "GcTime"
            },
            {
                text: "Heap Total Usage",
                mode: "nonexclusive",
                type: "counter",
                title: "Heap Total Usage",
                counterKey : "HeapTotUsage",
                multiValue : ["MAX", "USED"]
            },
            {
                text: "Heap Used",
                mode: "nonexclusive",
                type: "counter",
                title: "Heap Used",
                counterKey : "HeapUsed"
            },
            {
                text: "CPU Time",
                mode: "nonexclusive",
                type: "counter",
                title: "CPU Time",
                counterKey : "CpuTime"
            },
            {
                text: "Perm Used",
                mode: "nonexclusive",
                type: "counter",
                title: "Perm Used",
                counterKey : "PermUsed"
            },
            {
                text: "Perm Percent",
                mode: "nonexclusive",
                type: "counter",
                title: "Perm Percent",
                counterKey : "PermPercent"
            },
            {
                text: "Process Cpu",
                mode: "nonexclusive",
                type: "counter",
                title: "Process Cpu",
                counterKey : "ProcCpu"
            },
            {
                text: "Fd Usage",
                mode: "nonexclusive",
                type: "counter",
                title: "Fd Usage",
                counterKey : "FdUsage"
            }
        ],

        REQUEST: [
            {
                text: "Bytes Received",
                mode: "nonexclusive",
                type: "counter",
                title: "Bytes Received",
                counterKey : "BytesReceived"
            },
            {
                text: "Bytes Sent",
                mode: "nonexclusive",
                type: "counter",
                title: "Bytes Sent",
                counterKey : "BytesSent"
            },
            {
                text: "Error Count",
                mode: "nonexclusive",
                type: "counter",
                title: "Error Count",
                counterKey : "ErrorCount"
            },
            {
                text: "Processing Time",
                mode: "nonexclusive",
                type: "counter",
                title: "Processing Time",
                counterKey : "ProcessingTime"
            },
            {
                text: "Request Count",
                mode: "nonexclusive",
                type: "counter",
                title: "Request Count",
                counterKey : "RequestCount"
            }

        ],

        CONTEXT: [
            {
                text: "Active Sessions",
                mode: "nonexclusive",
                type: "counter",
                title: "Active Sessions",
                counterKey : "ActiveSessions"
            },
            {
                text: "Session Create Rate",
                mode: "nonexclusive",
                type: "counter",
                title: "Session Create Rate",
                counterKey : "SessionCreateRate"
            },
            {
                text: "Session Expired Rate",
                mode: "nonexclusive",
                type: "counter",
                title: "Session Expired Rate",
                counterKey : "SessionExpiredRate"
            }
        ],

        DATASOURCE: [
            {
                text: "Conn Active",
                mode: "nonexclusive",
                type: "counter",
                title: "Conn Active",
                counterKey : "ConnActive"
            },
            {
                text: "Conn Idle",
                mode: "nonexclusive",
                type: "counter",
                title: "Conn Idle",
                counterKey : "ConnIdle"
            },
            {
                text: "Conn Max",
                mode: "nonexclusive",
                type: "counter",
                title: "Conn Max",
                counterKey : "ConnMax"
            }
        ],

        HOST: [
            {
                text: "Cpu",
                mode: "nonexclusive",
                type: "counter",
                title: "Cpu",
                counterKey : "Cpu"
            },
            {
                text: "Sys Cpu",
                mode: "nonexclusive",
                type: "counter",
                title: "Sys Cpu",
                counterKey : "SysCpu"
            },
            {
                text: "User Cpu",
                mode: "nonexclusive",
                type: "counter",
                title: "User Cpu",
                counterKey : "UserCpu"
            },
            {
                text: "Mem",
                mode: "nonexclusive",
                type: "counter",
                title: "Mem",
                counterKey : "Mem"
            },
            {
                text: "MemA",
                mode: "nonexclusive",
                type: "counter",
                title: "MemA",
                counterKey : "MemA"
            },
            {
                text: "MemU",
                mode: "nonexclusive",
                type: "counter",
                title: "MemU",
                counterKey : "MemU"
            },
            {
                text: "MemT",
                mode: "nonexclusive",
                type: "counter",
                title: "MemT",
                counterKey : "MemT"
            },
            {
                text: "Page In",
                mode: "nonexclusive",
                type: "counter",
                title: "Page In",
                counterKey : "PageIn"
            },
            {
                text: "Page Out",
                mode: "nonexclusive",
                type: "counter",
                title: "Page Out",
                counterKey : "PageOut"
            },
            {
                text: "Swap",
                mode: "nonexclusive",
                type: "counter",
                title: "Swap",
                counterKey : "Swap"
            },
            {
                text: "SwapU",
                mode: "nonexclusive",
                type: "counter",
                title: "SwapU",
                counterKey : "SwapU"
            },
            {
                text: "SwapT",
                mode: "nonexclusive",
                type: "counter",
                title: "SwapT",
                counterKey : "SwapT"
            }
        ],

        NETWORK: [
            {
                text: "Net InBound",
                mode: "nonexclusive",
                type: "counter",
                title: "Net InBound",
                counterKey : "NetInBound"
            },
            {
                text: "Net OutBound",
                mode: "nonexclusive",
                type: "counter",
                title: "Net OutBound",
                counterKey : "NetOutBound"
            },
            {
                text: "TCP Stat CLS",
                mode: "nonexclusive",
                type: "counter",
                title: "TCP Stat CLS",
                counterKey : "TcpStatCLS"
            },
            {
                text: "TCP Stat TIM",
                mode: "nonexclusive",
                type: "counter",
                title: "TCP Stat TIM",
                counterKey : "TcpStatTIM"
            },
            {
                text: "TCP Stat FIN",
                mode: "nonexclusive",
                type: "counter",
                title: "TCP Stat FIN",
                counterKey : "TcpStatFIN"
            },
            {
                text: "TCP Stat EST",
                mode: "nonexclusive",
                type: "counter",
                title: "TCP Stat EST",
                counterKey : "TcpStatEST"
            },
            {
                text: "Net Rx Bytes",
                mode: "nonexclusive",
                type: "counter",
                title: "Net Rx Bytes",
                counterKey : "NetRxBytes"
            },
            {
                text: "Net Tx Bytes",
                mode: "nonexclusive",
                type: "counter",
                title: "Net Tx Bytes",
                counterKey : "NetTxBytes"
            }
        ],

        DISK: [
            {
                text: "Disk Read Bytes",
                mode: "nonexclusive",
                type: "counter",
                title: "Disk Read Bytes",
                counterKey : "DiskReadBytes"
            },
            {
                text: "Disk Write Bytes",
                mode: "nonexclusive",
                type: "counter",
                title: "Disk Write Bytes",
                counterKey : "DiskWriteBytes"
            }
        ],

        /*BATCH: [
            {
                text: "Batch Service",
                mode: "nonexclusive",
                type: "counter",
                title: "Batch Service",
                counterKey : "BatchService"
            },
            {
                text: "Batch Start",
                mode: "nonexclusive",
                type: "counter",
                title: "Batch Start",
                counterKey : "BatchStart"
            },
            {
                text: "Batch End",
                mode: "nonexclusive",
                type: "counter",
                title: "Batch End",
                counterKey : "BatchEnd"
            },
            {
                text: "Batch End No Signal",
                mode: "nonexclusive",
                type: "counter",
                title: "Batch End No Signal",
                counterKey : "BatchEndNoSignal"
            }
        ]*/

    }
}