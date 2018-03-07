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
                counterKey : "TPS",
                objectType : "instance"
            },
            {
                text: "Active Speed",
                mode: "nonexclusive",
                type: "counter",
                title: "Active Speed",
                counterKey : "ActiveSpeed",
                multiValue : ["L", "M", "S"],
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
                text: "SqlTime By Service",
                mode: "nonexclusive",
                type: "counter",
                title: "SqlTime By Service",
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
                text: "Heap Total Usage",
                mode: "nonexclusive",
                type: "counter",
                title: "Heap Total Usage",
                counterKey : "HeapTotUsage",
                multiValue : ["MAX", "USED"],
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
                text: "Fd Usage",
                mode: "nonexclusive",
                type: "counter",
                title: "Fd Usage",
                counterKey : "FdUsage",
                objectType : "instance"
            }
        ],

        REQUEST: [
            {
                text: "Bytes Received",
                mode: "nonexclusive",
                type: "counter",
                title: "Bytes Received",
                counterKey : "BytesReceived",
                objectType : "instance"
            },
            {
                text: "Bytes Sent",
                mode: "nonexclusive",
                type: "counter",
                title: "Bytes Sent",
                counterKey : "BytesSent",
                objectType : "instance"
            },
            {
                text: "Error Count",
                mode: "nonexclusive",
                type: "counter",
                title: "Error Count",
                counterKey : "ErrorCount",
                objectType : "instance"
            },
            {
                text: "Processing Time",
                mode: "nonexclusive",
                type: "counter",
                title: "Processing Time",
                counterKey : "ProcessingTime",
                objectType : "instance"
            },
            {
                text: "Request Count",
                mode: "nonexclusive",
                type: "counter",
                title: "Request Count",
                counterKey : "RequestCount",
                objectType : "instance"
            }

        ],

        CONTEXT: [
            {
                text: "Active Sessions",
                mode: "nonexclusive",
                type: "counter",
                title: "Active Sessions",
                counterKey : "ActiveSessions",
                objectType : "instance"
            },
            {
                text: "Session Create Rate",
                mode: "nonexclusive",
                type: "counter",
                title: "Session Create Rate",
                counterKey : "SessionCreateRate",
                objectType : "instance"
            },
            {
                text: "Session Expired Rate",
                mode: "nonexclusive",
                type: "counter",
                title: "Session Expired Rate",
                counterKey : "SessionExpiredRate",
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
                text: "MemA",
                mode: "nonexclusive",
                type: "counter",
                title: "MemA",
                counterKey : "MemA",
                objectType : "host"
            },
            {
                text: "MemU",
                mode: "nonexclusive",
                type: "counter",
                title: "MemU",
                counterKey : "MemU",
                objectType : "host"
            },
            {
                text: "MemT",
                mode: "nonexclusive",
                type: "counter",
                title: "MemT",
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
                text: "SwapU",
                mode: "nonexclusive",
                type: "counter",
                title: "SwapU",
                counterKey : "SwapU",
                objectType : "host"
            },
            {
                text: "SwapT",
                mode: "nonexclusive",
                type: "counter",
                title: "SwapT",
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
                objectType : "instance"
            },
            {
                text: "Net OutBound",
                mode: "nonexclusive",
                type: "counter",
                title: "Net OutBound",
                counterKey : "NetOutBound",
                objectType : "instance"
            },
            {
                text: "TCP Stat CLS",
                mode: "nonexclusive",
                type: "counter",
                title: "TCP Stat CLS",
                counterKey : "TcpStatCLS",
                objectType : "instance"
            },
            {
                text: "TCP Stat TIM",
                mode: "nonexclusive",
                type: "counter",
                title: "TCP Stat TIM",
                counterKey : "TcpStatTIM",
                objectType : "instance"
            },
            {
                text: "TCP Stat FIN",
                mode: "nonexclusive",
                type: "counter",
                title: "TCP Stat FIN",
                counterKey : "TcpStatFIN",
                objectType : "instance"
            },
            {
                text: "TCP Stat EST",
                mode: "nonexclusive",
                type: "counter",
                title: "TCP Stat EST",
                counterKey : "TcpStatEST",
                objectType : "instance"
            },
            {
                text: "Net Rx Bytes",
                mode: "nonexclusive",
                type: "counter",
                title: "Net Rx Bytes",
                counterKey : "NetRxBytes",
                objectType : "instance"
            },
            {
                text: "Net Tx Bytes",
                mode: "nonexclusive",
                type: "counter",
                title: "Net Tx Bytes",
                counterKey : "NetTxBytes",
                objectType : "instance"
            }
        ],

        DISK: [
            {
                text: "Disk Read Bytes",
                mode: "nonexclusive",
                type: "counter",
                title: "Disk Read Bytes",
                counterKey : "DiskReadBytes",
                objectType : "instance"
            },
            {
                text: "Disk Write Bytes",
                mode: "nonexclusive",
                type: "counter",
                title: "Disk Write Bytes",
                counterKey : "DiskWriteBytes",
                objectType : "instance"
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