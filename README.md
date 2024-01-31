# Repository_name : DdukSang

## 🍕 공공API 토이프로젝트

### 📍 Project Role
- Front-End :  first-lounge (Jang-Hyun-Lim)
- Back-End : zidh1(Ki-Uk-Kim)

### 📍 Language for Project
- Front-End : Html, Java Script
- Back-End : Java(FrameWork : Spring Boot) 


### 📍 Development Schedule
- JIRA 기반 Git 관리
- AWS EC2 & RDS
- Github Action or jenkins [미정]

<hr>

### 📕 구현 예정 기능
- [x] __ 시 검색 기능
- [x] __ 동 검색 기능
- [x] 매매 데이터 표시(12월만)

<hr>

### 팀 관련 게시판


<hr>

## Git Convention

### 포맷

```
type: subject

body
```

#### type

- 하나의 커밋에 여러 타입이 존재하는 경우 상위 우선순위의 타입을 사용한다.
- fix: 버스 픽스
- feat: 새로운 기능 추가
- refactor: 리팩토링 (버그픽스나 기능추가없는 코드변화)
- docs: 문서만 변경
- style: 코드의 의미가 변경 안 되는 경우 (띄어쓰기, 포맷팅, 줄바꿈 등)
- test: 테스트코드 추가/수정
- chore: 빌드 테스트 업데이트, 패키지 매니저를 설정하는 경우 (프로덕션 코드 변경 X)

#### subject


#### body (optional)


<hr>

## 프로젝트 진행하면서 알게된 점들
1. '==' 와 '===' 차이
   - '=='는 피연산자 값의 타입이 서로 다르면 자동으로 타입을 반환해준다.
   - '==='는 피연산자 값의 타입이 서로 달라도 변환하지 않고 원래의 값을 비교해준다.

2. 한글 입력으로 이벤트가 2번 호출되는 경우
   - 한글의 특성으로 인해 글자가 조합중인지, 조합이 끝난 상태인지를 알 수 없기 때문에 발생한다.
   - KeyboardEvent.isComposing이 true일 때는 실행 안 되도록 작성하면 된다.
