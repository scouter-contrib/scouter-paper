## 1. 빌드 요구 사항  
 - docker version 
    - Docker version 18.09.6 이상 
### 1.2 docker-compose을 이용하여 빌드
- .env 파일에 Scouter Paper 릴리스 버전 변경 후
   
```
$ docker-compose build
```   
### 1.3 dockerhub 저장소에 Push 
 
```
# docker hub 로그인 
$ docker login
$ docker-compose push  
```      
