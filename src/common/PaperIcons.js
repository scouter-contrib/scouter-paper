export function getObjectIcon(icon) {
    if (ObjectIcons[icon]) {
        return ObjectIcons[icon];
    } else {
        return ObjectIcons["___default"];
    }
}

export const ObjectIcons = {
    less: {
        fontFamily: "technology-icons",
        text: "icon-less",
        color: "rgb(33,70,116)",
        bgColor: "white"
    }, sass: {
        fontFamily: "technology-icons",
        text: "icon-sass",
        color: "rgb(204,102,153)",
        bgColor: "white"
    }, cassandra: {
        fontFamily: "technology-icons",
        text: "icon-cassandra",
        color: "rgb(31,133,181)",
        bgColor: "white"
    }, database: {
        fontFamily: "technology-icons",
        text: "icon-database",
        color: "rgb(67,139,198)",
        bgColor: "white"
    }, datasource: {
        fontFamily: "technology-icons",
        text: "icon-database",
        color: "rgb(67,139,198)",
        bgColor: "white"
    }, reqproc: {
        fontFamily: "text",
        text: "REQP",
        color: "#333",
        bgColor: "white"
    }, hadoop: {
        fontFamily: "technology-icons",
        text: "icon-hadoop",
        color: "rgb(32,99,162)",
        bgColor: "white"
    }, mariadb: {
        fontFamily: "technology-icons",
        text: "icon-mariadb",
        color: "rgb(27,54,98)",
        bgColor: "white"
    }, mongodb: {
        fontFamily: "technology-icons",
        text: "icon-mongodb",
        color: "rgb(80,150,70)",
        bgColor: "white"
    }, mysql: {
        fontFamily: "technology-icons",
        text: "icon-mysql-alt",
        color: "rgb(0, 150, 230)",
        bgColor: "white"
    }, postgres: {
        fontFamily: "technology-icons",
        text: "icon-postgres",
        color: "rgb(50,102,144)",
        bgColor: "white"
    }, sql: {
        fontFamily: "technology-icons",
        text: "icon-sql",
        color: "#333",
        bgColor: "white"
    }, express: {
        fontFamily: "technology-icons",
        text: "icon-express",
        color: "#333",
        bgColor: "white"
    }, grails: {
        fontFamily: "technology-icons",
        text: "icon-grails",
        color: "#333",
        bgColor: "white"
    }, grailsalt: {
        fontFamily: "technology-icons",
        text: "icon-grailsalt",
        color: "#333",
        bgColor: "white"
    }, playframework: {
        fontFamily: "technology-icons",
        text: "icon-playframework",
        color: "rgb(135,190,63)",
        bgColor: "white"
    }, rails: {
        fontFamily: "technology-icons",
        text: "icon-rails-alt",
        color: "#333",
        bgColor: "white"
    }, jira: {
        fontFamily: "technology-icons",
        text: "icon-jira-alt",
        color: "rgb(22,42,75)",
        bgColor: "white"
    }, angular: {
        fontFamily: "technology-icons",
        text: "icon-angular",
        color: "#333",
        bgColor: "white"
    }, backbone: {
        fontFamily: "technology-icons",
        text: "icon-backbone",
        color: "#333",
        bgColor: "white"
    }, d3: {
        fontFamily: "technology-icons",
        text: "icon-d3",
        color: "#333",
        bgColor: "white"
    }, ember: {
        fontFamily: "technology-icons",
        text: "icon-ember",
        color: "#333",
        bgColor: "white"
    }, react: {
        fontFamily: "technology-icons",
        text: "icon-react",
        color: "#333",
        bgColor: "white"
    }, c: {
        fontFamily: "technology-icons",
        text: "icon-c",
        color: "#333",
        bgColor: "white"
    }, cplusplus: {
        fontFamily: "technology-icons",
        text: "icon-cplusplus",
        color: "#333",
        bgColor: "white"
    }, csharp: {
        fontFamily: "technology-icons",
        text: "icon-csharp",
        color: "#333",
        bgColor: "white"
    }, java: {
        fontFamily: "technology-icons",
        text: "icon-java",
        color: "rgb(111,156,243)",
        bgColor: "white"
    }, javaee: {
        fontFamily: "technology-icons",
        text: "icon-java",
        color: "rgb(111,156,243)",
        bgColor: "white"
    }, nodejs: {
        fontFamily: "technology-icons",
        text: "icon-nodejs",
        color: "#333",
        bgColor: "white"
    }, objectivec: {
        fontFamily: "technology-icons",
        text: "icon-objectivec",
        color: "#333",
        bgColor: "white"
    }, perl: {
        fontFamily: "technology-icons",
        text: "icon-perl",
        color: "#333",
        bgColor: "white"
    }, php: {
        fontFamily: "icon-php",
        text: "icon-csharp",
        color: "#333",
        bgColor: "white"
    }, python: {
        fontFamily: "technology-icons",
        text: "icon-python",
        color: "#333",
        bgColor: "white"
    }, ruby: {
        fontFamily: "technology-icons",
        text: "icon-ruby",
        color: "#333",
        bgColor: "white"
    }, scala: {
        fontFamily: "technology-icons",
        text: "icon-scala",
        color: "rgb(215,48,45)",
        bgColor: "white"
    }, debian: {
        fontFamily: "technology-icons",
        text: "icon-debian",
        color: "rgb(208,7,78)",
        bgColor: "white"
    }, fedora: {
        fontFamily: "technology-icons",
        text: "icon-fedora",
        color: "rgb(0,67,122)",
        bgColor: "white"
    }, freebsd: {
        fontFamily: "technology-icons",
        text: "icon-freebsd",
        color: "rgb(247,49,0)",
        bgColor: "white"
    }, mint: {
        fontFamily: "technology-icons",
        text: "icon-linux-mint",
        color: "#333",
        bgColor: "white"
    }, netbsd: {
        fontFamily: "technology-icons",
        text: "icon-netbsd",
        color: "#333",
        bgColor: "white"
    }, redhat: {
        fontFamily: "technology-icons",
        text: "icon-redhat",
        color: "rgb(217,47,38)",
        bgColor: "white"
    }, solaris: {
        fontFamily: "technology-icons",
        text: "icon-solaris",
        color: "rgb(231,111,19)",
        bgColor: "white"
    }, suse: {
        fontFamily: "technology-icons",
        text: "icon-suse",
        color: "rgb(111,180,36)",
        bgColor: "white"
    }, ubuntu: {
        fontFamily: "technology-icons",
        text: "icon-ubuntu",
        color: "rgb(246,107,14)",
        bgColor: "white"
    }, autoit: {
        fontFamily: "technology-icons",
        text: "icon-autoit",
        color: "#333",
        bgColor: "white"
    }, confluence: {
        fontFamily: "technology-icons",
        text: "icon-confluence",
        color: "rgb(22,42,75)",
        bgColor: "white"
    }, dynamicweb: {
        fontFamily: "technology-icons",
        text: "icon-dynamicweb",
        color: "#333",
        bgColor: "white"
    }, babel: {
        fontFamily: "technology-icons",
        text: "icon-babel",
        color: "#333",
        bgColor: "white"
    }, webpack: {
        fontFamily: "technology-icons",
        text: "icon-webpack",
        color: "#333",
        bgColor: "white"
    }, osx: {
        fontFamily: "technology-icons",
        text: "icon-osx",
        color: "rgb(156,157,162)",
        bgColor: "white"
    }, codeignitor: {
        fontFamily: "technology-icons",
        text: "icon-codeignitor",
        color: "#333",
        bgColor: "white"
    }, apache: {
        fontFamily: "technology-icons",
        text: "icon-apache",
        color: "rgb(172,16,64)",
        bgColor: "white"
    }, jetty: {
        fontFamily: "technology-icons",
        text: "icon-jetty",
        color: "rgb(244,54,14)",
        bgColor: "white"
    }, memcached: {
        fontFamily: "technology-icons",
        text: "icon-memcached",
        color: "#333",
        bgColor: "white"
    }, nginx: {
        fontFamily: "technology-icons",
        text: "icon-nginx-alt",
        color: "rgb(29,144,69)",
        bgColor: "white"
    }, redis: {
        fontFamily: "technology-icons",
        text: "icon-redis",
        color: "rgb(216,47,39)",
        bgColor: "white"
    }, tomcat: {
        fontFamily: "technology-icons",
        text: "icon-tomcat",
        color: "#734A12",
        bgColor: "white"
    }, ec3: {
        fontFamily: "technology-icons",
        text: "icon-ec3",
        color: "#333",
        bgColor: "white"
    }, github: {
        fontFamily: "technology-icons",
        text: "icon-github-circle-alt",
        color: "#333",
        bgColor: "white"
    }, git: {
        fontFamily: "technology-icons",
        text: "icon-git-squared",
        color: "#333",
        bgColor: "white"
    }, jboss: {
        fontFamily: "text",
        text: "jboss",
        color: "rgb(198,0,0)",
        bgColor: "white"
    }, resin: {
        fontFamily: "text",
        text: "resin",
        color: "rgb(0,44,95)",
        bgColor: "white"
    }, batch: {
        fontFamily: "text",
        text: "batch",
        color: "#333",
        bgColor: "white"
    }, aws: {
        fontFamily: "FontAwesome",
        text: "fa fa-amazon",
        color: "#333",
        bgColor: "white"
    } , linux: {
        fontFamily: "FontAwesome",
        text: "fa fa-linux",
        color: "#333",
        bgColor: "white"
    }, windows: {
        fontFamily: "FontAwesome",
        text: "fa fa-windows",
        color: "#333",
        bgColor: "white"
    }, ___default: {
        fontFamily: "FontAwesome",
        text: "fa fa-server",
        color: "#333",
        bgColor: "white"
    }

};