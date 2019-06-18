[![Englsh](https://img.shields.io/badge/language-English-orange.svg)](README.md) [![Korean](https://img.shields.io/badge/language-Korean-blue.svg)](README_kr.md)

[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/scouter-project/scouter/issues)

# SCOUTER PAPER
SCOUTER PAPER is a dashboard software that utilizes the SCOUTER WEB API, an open source APM tool, to provide performance data over the web.
 
- Easy installation and usability
  - No installation is required, and the downloaded files are executed directly in your environment. It is also deployed directly to the WEB extension path of the installed SCOUTER just by copying the file, so that it can be accessed from any device in any external environment and used immediately.

- Responsive Web
  - It supports most modern web browsers and allows you to configure, store and manage optimal layouts for various resolutions of connected devices. Each monitoring dashboard can be configured according to the connection environment and the monitoring target.
   
- Intuitive and configurable UI
  - WYSIWYG editing based on your UX, from dashboard configuration to layout editing, is available. In addition, metrics that are optimized for the monitoring target can be combined and displayed through drag & drop.
  
- Outstanding extendable
  - You can add performance information of various software through interworking with Telegraph, including metric of SCOUTER which is basically provided, and it is possible to configure tens of thousands of combinations of dashboards by combining them.

## How to build
For build, npm must be installed first. 
 1. clone https://github.com/scouter-contrib/scouter-paper.git
 2. npm install
 3. npm run build
    
## Download
You can download the latest version from the page below.
- [Release](https://github.com/scouter-contrib/scouter-paper/releases/)
 
## Guides
- [Home Page](https://scouter-contrib.github.io/scouter-paper/)
- [User Guide](https://translate.google.co.kr/translate?sl=ko&tl=en&js=y&prev=_t&hl=ko&ie=UTF-8&u=https%3A%2F%2Fscouter-contrib.github.io%2Fscouter-paper%2Fmanual.html&edit-text=&act=url)

## DockerHub
- [scouter-paper](https://hub.docker.com/r/scouterapm/scouter-paper)
 
## Screenshots
- HOME

SCOUTER PAPER version and latest version information.
![Screen](./doc/img/1.png)

- Topology

You can see performance information between selected servers.
![Screen](./doc/img/8.png)

- PAPER

You can create your own dashboards with a variety of dedicated components. 
![Screen](./doc/img/9.png)

- Profiles

You can identify the request transaction to see the fine profile. 
![Screen](./doc/img/12.png)
 
### SCOUTER Web API version
> SCOUTER PAPER 1.X requires SCOUTER 1.8.4.1 or higher, SCOUTER PAPER 2.X requires SCOUTER 2.0 or higher. We recommend that you use SCOUTER 2.0 or higher, which has a wider monitoring area in conjunction with Telegraph.

### Supported browsers
> Some features may not work in IE.
> Windows Safari browser is not supported.

## License
Licensed under the Apache License, Version 2.0
