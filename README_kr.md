[![Englsh](https://img.shields.io/badge/language-English-orange.svg)](README.md) [![Korean](https://img.shields.io/badge/language-Korean-blue.svg)](README_kr.md)

[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/scouter-project/scouter/issues)

# 스카우터 페이퍼
스카우터 페이퍼는 오픈 소스 APM 도구인 스카우터 WEB API를 활용하여, 성능 데이터를 웹을 통해 확인할 수 있도록 제공하는 대시보드 소프트웨어입니다.
 
쉬운 설치와 빠른 사용성
- 설치 없이 다운로드한 파일을 통해 사용자 환경에서 바로 실행합니다. 또한 설치된 스카우터의 WEB 확장 경로에 파일 복사만으로 바로 디플로이되어, 외부의 어떤 환경의 어떤 디바이스에서도 접근하여 바로 사용할 수 있습니다.

반응형 웹
- 대부분의 모던 웹 브라우저를 지원하며, 접속하는 디바이스의 다양한 해상도에 맞는 최적의 레이아웃을 구성하고, 저장 및 관리 할 수 있습니다. 접속 환경, 모니터링 대상에 따른 각각의 모니터링 대시보드를 구성할 수 있습니다.
   
직관적이고 자유로운 UI
- 대시보드의 구성부터 레이아웃의 편집까지 사용자의 UX에 기반한 WYSIWYG 편집이 가능합니다. 또한 모니터링 대상에 최적화된 형태의 메트릭을 드래그 & 드롭 방식을 통해 조합하여 표현할 수 있습니다.
  
뛰어난 확장성
- 기본적으로 제공되는 스카우터의 메트릭을 포함하여, 텔레그래프와의 연동을 통해 다양한 소프트웨어의 성능 정보를 추가할 수 있으며, 이를 조합하여 수만가지 조합의 대시보드를 구성할 수 있습니다.

## 빌드하기
build를 위해서 먼저 npm이 설치되어 있어야합니다. 
 1. clone https://github.com/scouter-contrib/scouter-paper.git
 2. npm install
 3. npm run build
    
## 다운로드
아래 페이지에서 최신 버전을 다운로드 할 수 있습니다.
- [Release](https://github.com/scouter-contrib/scouter-paper/releases/)
 
## 가이드
- [소개 페이지](https://scouter-contrib.github.io/scouter-paper/)
- [사용자 가이드](./build/help/manual.html)

## 도커허브 
- [scouter-paper](https://hub.docker.com/r/scouterapm/scouter-paper) 

## 주요 화면
- HOME

스카우터 페이퍼의 버전 및 최신 버전의 정보를 제공합니다.
![Screen](./doc/img/1.png)

- 토폴로지 

선택된 서버들간의 성능 정보를 파악할 수 있습니다.
![Screen](./doc/img/8.png)

- 페이퍼

다양한 전용 컴포넌트로 성능 모니터링 대시보드를 만들 수 있습니다. 
![Screen](./doc/img/9.png)

- 프로파일

트랜잭션을 특정하여 세밀한 프로파일을 확인 할 수 있습니다. 
![Screen](./doc/img/12.png)
 
### 스카우터 웹 API 버전
> SCOUTER PAPER 1.X는 SCOUTER 1.8.4.1 이상의 버전이 필요하며, SCOUTER PAPER 2.X는 SCOUTER 2.0 이상의 버전이 필요합니다. 텔레그라프와의 연동으로 모니터링 영역이 대폭 넓어진 SCOUTER 2.0 이상을 사용하시는 것을 권장드립니다.

### 지원하는 브라우저
> IE에서 일부 기능이 동작하지 않을 수 있습니다.
> 윈도우 Safari 브라우저는 지원하지 않습니다.

## 라이선스
Licensed under the Apache License, Version 2.0
