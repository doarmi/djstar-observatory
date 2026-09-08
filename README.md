# DJSTAR --- 대전시민천문대 리뉴얼

> 스크롤 인터랙션과 3D 천체 시각화로 관측 경험을 웹에서 미리 체험할 수
> 있도록 재구성한 대전시민천문대 리뉴얼 프로젝트입니다.

## 프로젝트 소개

DJSTAR는 천문대의 정보를 단순히 나열하는 방식에서 벗어나, 사용자가
**망원경을 통해 우주로 진입하는 듯한 흐름**을 경험하도록 설계한
인터랙티브 웹 프로젝트입니다.

스크롤 기반 이미지 시퀀스, WebGL 3D 천체, 실제 기상 API를 이용한 관측
환경 정보, 프로그램 탐색과 예약 데모를 하나의 사용자 흐름으로
구성했습니다.

> 이 README는 제출된 `djstar_re_BACK_FIXED` 소스코드를 기준으로
> 작성했으며, 기획 단계의 기능과 실제 구현을 구분했습니다.

------------------------------------------------------------------------

## 주요 경험

### 1. Scroll Scrub Intro

망원경에서 우주로 진입하는 연출을 스크롤 진행도와 연결했습니다.

-   WebP 이미지 프레임 기반 시퀀스
-   스크롤 위치에 따른 프레임 전환
-   GSAP ScrollTrigger 기반 Scrub
-   화면 전환 및 텍스트 모션
-   인트로 이후 본문 경험과 자연스럽게 연결

단순 동영상 자동 재생이 아니라 사용자의 스크롤에 맞춰 장면이 진행되는
인터랙션입니다.

### 2. 3D Celestial Experience

`Three.js`와 `@react-three/fiber`를 사용해 브라우저 안에서 3D 우주
장면과 천체를 렌더링합니다.

실제 코드에는 다음과 같은 3D/WebGL 요소가 포함되어 있습니다.

-   별 배경과 우주 공간
-   망원경 시점 연출
-   달
-   목성
-   토성
-   베가 등 천체 콘텐츠
-   카메라 및 오브젝트 애니메이션

### 3. 실시간 관측 환경 데이터

`NewsSection`에서 **Open-Meteo API**를 호출해 대전 지역의 현재 기상
데이터를 받아옵니다.

사용되는 주요 데이터:

-   구름량
-   강수량
-   풍속
-   풍향

받아온 데이터를 프로젝트 내부 로직으로 계산해 관측 환경을 **0--100
점수와 GOOD / FAIR / POOR** 단계로 표현합니다.

> 이 점수는 대전시민천문대의 공식 관측 지수가 아닙니다. 실제 화면에서도
> `OFFICIAL STATUS 아님`으로 구분하며, 실시간 기상 데이터를 바탕으로
> 프로젝트 내부에서 산출한 예상 값입니다.

### 4. 프로그램 탐색

천문대에서 경험할 수 있는 프로그램과 관측 콘텐츠를 여러 섹션을 통해
탐색하도록 구성했습니다.

정보 전달뿐 아니라 페이지를 내려가는 과정 자체가 하나의 천문 관측
여정처럼 느껴지도록 콘텐츠와 인터랙션을 연결했습니다.

### 5. 예약 UI 데모

별도의 예약 화면에서 다음 흐름을 체험할 수 있습니다.

``` text
프로그램 선택
→ 날짜 / 시간 선택
→ 인원 선택
→ 알림 설정
→ 이용 동의
→ 예약 완료
```

완료 단계에서는 데모용 예약번호도 생성합니다.

> 실제 천문대 예약 서버, 결제 시스템 또는 카카오/네이버 메시지 발송
> 서비스와 연결된 기능은 아닙니다.

------------------------------------------------------------------------

## Interaction

프로젝트 전반의 스크롤 연출에 GSAP을 실제 사용합니다.

-   `ScrollTrigger`
-   `ScrollSmoother`
-   `SplitText`
-   Scroll Scrub
-   Section Transition
-   Scroll-linked animation

3D 영역은 `Three.js`와 `React Three Fiber`를 중심으로 구성했습니다.

------------------------------------------------------------------------

## Tech Stack

  구분           기술
  -------------- --------------------------------
  Frontend       React 19
  Language       TypeScript
  Build          Vite
  3D / WebGL     Three.js
  React 3D       @react-three/fiber
  Motion         GSAP
  Scroll         ScrollTrigger / ScrollSmoother
  Text Motion    SplitText
  Weather Data   Open-Meteo API
  Styling        CSS

`zustand`는 프로젝트 dependency에 포함되어 있지만 현재 `src` 코드에서
실제 사용은 확인되지 않아 주요 사용 기술에서는 제외했습니다.

------------------------------------------------------------------------

## 프로젝트 구조

``` text
DJSTAR/
├── public/
│   ├── brand/
│   ├── images/
│   ├── scrub/
│   │   ├── frame_0001.webp
│   │   ├── frame_0002.webp
│   │   └── ... (scroll sequence)
│   └── og-djstar.png
├── src/
│   ├── components/
│   │   ├── CelestialViewer.tsx
│   │   ├── Header.tsx
│   │   ├── HeroSpace.tsx
│   │   ├── IntroStarfield.tsx
│   │   ├── SaturnTelescope.tsx
│   │   ├── ScrollMotion.tsx
│   │   └── ScrollScrubIntro.tsx
│   ├── sections/
│   │   ├── AstroMentoring.tsx
│   │   ├── ExperienceFinder.tsx
│   │   ├── FeaturedPrograms.tsx
│   │   ├── NewsSection.tsx
│   │   ├── ObservationSection.tsx
│   │   ├── ReservationPage.tsx
│   │   ├── TelescopeIntro.tsx
│   │   └── VisitSection.tsx
│   ├── lib/
│   │   └── navigation.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

> 수백 장의 스크롤 시퀀스 프레임은 가독성을 위해 일부만 표시했습니다.

------------------------------------------------------------------------

## 구현 범위

### 실제 코드에서 확인되는 구현

-   React + TypeScript 기반 웹사이트
-   GSAP 기반 스크롤 인터랙션
-   ScrollTrigger
-   ScrollSmoother
-   SplitText
-   WebP 프레임 기반 Scroll Scrubbing
-   Three.js / React Three Fiber 기반 3D 콘텐츠
-   WebGL 우주 및 천체 렌더링
-   Open-Meteo API 실시간 요청
-   기상 데이터 기반 자체 관측 적합도 계산
-   프로그램 탐색 UI
-   단계형 예약 UI
-   데모 예약번호 생성

### 실제 연동으로 확인되지 않는 기능

-   대전시민천문대 공식 관측 데이터 API
-   천문대 실제 예약 서버
-   실제 결제
-   카카오 / 네이버 메시지 발송
-   사용자 계정 시스템
-   서버 데이터베이스

------------------------------------------------------------------------

## 실행 방법

``` bash
npm install
npm run dev
```

Production Build:

``` bash
npm run build
```

Build 결과 미리보기:

``` bash
npm run preview
```

------------------------------------------------------------------------

## 제작 의도

기존 공공시설 웹사이트에서 흔히 볼 수 있는 정보 중심 구조를 넘어,
천문대를 방문하기 전부터 **관측이라는 경험 자체를 웹에서 느낄 수 있는
사이트**를 만드는 데 초점을 맞췄습니다.

망원경에서 시작해 우주 공간과 천체로 이어지는 스크롤 연출, 3D 시각화,
실제 기상 데이터를 이용한 관측 환경 정보, 프로그램과 예약 흐름을 연결해
정보 전달과 몰입형 인터랙션을 함께 구현했습니다.
