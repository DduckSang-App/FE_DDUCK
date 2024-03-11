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
- [x] 검색 기능
- [x] 매매 데이터 표시(12월만)
- [x] 상단 중앙에 현재 위치 표시 기능

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
- fix: 버그 픽스
- feat: 새로운 기능 및 디자인 추가
- refactor: 리팩토링 (버그픽스나 기능추가없는 코드변화)
- docs: 문서만 변경
- style: 코드의 의미가 변경 안 되는 경우 (띄어쓰기, 포맷팅, 줄바꿈 등)
- test: 테스트코드 추가/수정
- chore: 빌드 테스트 업데이트, 패키지 매니저를 설정하는 경우 (프로덕션 코드 변경 X)

#### subject


#### body (optional)


<hr>

## 프로젝트 진행하면서 알게된 점들
**1. '==' 와 '===' 차이**
   - '=='는 피연산자 값의 타입이 서로 다르면 자동으로 타입을 반환해준다.
   - '==='는 피연산자 값의 타입이 서로 달라도 변환하지 않고 원래의 값을 비교해준다.

**2. 한글 입력으로 이벤트가 2번 호출 & 'Enter' 입력 시 끝 글자가 나오는 경우**

   2-1) 이벤트 2번 호출되는 경우
   - IME 과정에서 keydown 이벤트 발생 시, OS와 브라우저에서 이벤트를 처리해서 중복 발생
   
   2-2) 'Enter' 입력 시
   - 한글의 특성으로 인해 글자가 조합중인지, 조합이 끝난 상태인지를 알 수 없기 때문에 발생한다.

   해결방법)
   - 글자가 변환 중인지 알려주는 KeyboardEvent의 isComposing값을 활용하여
     이벤트가 한 번만 발생하도록 개선하였습니다.

**3. forEach 사용 시 순차 처리가 되지 않는 이유**

