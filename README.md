# DJSTAR — 대전시민천문대 리뉴얼

> 기존 정보 중심의 천문대 웹사이트를 사용자 경험 중심으로 재구성해, 방문 전부터 관측과 체험의 분위기를 느낄 수 있도록 만든 인터랙티브 리뉴얼 프로젝트입니다.

## 프로젝트 소개

DJSTAR는 **대전시민천문대 웹사이트 리뉴얼 프로젝트**입니다.

기존 사이트를 살펴보며 천문대는 실제로 방문해 천체를 관측하고 다양한 교육과 체험을 경험하는 공간인데, 웹사이트에서는 **어떤 체험을 할 수 있는지, 어떤 프로그램이 있는지, 방문해서 무엇을 배우고 느낄 수 있는지**를 충분히 전달하지 못하고 있다고 생각했습니다.

그래서 단순히 사이트를 보기 좋게 바꾸는 것이 아니라, **방문에 필요한 정보를 더 편리하게 제공하고 천문대에서 할 수 있는 경험을 웹에서 먼저 보여줘 실제 방문으로 이어지도록 하는 것**을 리뉴얼의 목표로 잡았습니다.

스크롤 기반 망원경 진입 연출, 3D 천체 시각화, 프로그램 탐색, 예약 UI, 멘토링 콘텐츠, 방문 정보, 실시간 기상 데이터를 하나의 사용자 흐름으로 연결해 **웹사이트 자체를 천문대를 홍보하는 사전 체험 공간**으로 구성했습니다.

## Project Links

- 🌐 **Vercel** — [배포 사이트](https://djstar-observatory.vercel.app/)
- 🎨 **Figma** — [디자인 페이지](https://www.figma.com/design/TAofx6nQEiv7iTqWg0Wct4/Untitled?node-id=0-1&t=ljdoVvNSjkbBiHlI-1)
- 🖼️ **Notefolio** — [포트폴리오 보기](https://notefolio.net/hyogu_U2)
- 📄 **Notion** — [포트폴리오 노션](https://app.notion.com/p/375cedfd0bc08356a2ae817409b561ea?source=copy_link)

---

## 주요 경험

### 1. Scroll Scrub Intro

첫 진입부에서는 망원경에서 시작해 접안렌즈를 통과하고 우주 공간으로 이동하는 장면을 사용자의 스크롤과 연결했습니다.

- WebP 이미지 프레임 기반 시퀀스
- 스크롤 위치에 따른 프레임 전환
- GSAP ScrollTrigger 기반 Scrub
- 화면 전환 및 텍스트 모션
- 인트로 이후 본문 콘텐츠와 자연스럽게 연결

단순한 영상 자동 재생이 아니라 사용자가 직접 스크롤을 움직이면서 **망원경을 통해 우주로 진입하는 듯한 경험**을 할 수 있도록 구성했습니다.

천문대라는 공간의 정체성을 첫 화면에서 설명하기보다 직접 체험하게 만드는 것을 목표로 했습니다.

---

### 2. 3D Celestial Experience

`Three.js`와 `@react-three/fiber`를 이용해 브라우저 안에서 3D 우주 장면과 천체를 렌더링했습니다.

주요 3D 요소는 다음과 같습니다.

- 별 배경과 우주 공간
- 망원경 시점 연출
- 달
- 목성
- 토성
- 베가 등 천체 콘텐츠
- 카메라 및 오브젝트 애니메이션

천체 콘텐츠에는 관측 배율을 변화시키며 살펴보는 인터랙션을 적용해 실제 천문대를 방문하기 전 **망원경으로 천체를 관측하는 경험을 웹에서 미리 느낄 수 있도록** 구성했습니다.

---

### 3. 관측 배율 체험

관측 콘텐츠에서는 `50x → 100x → 200x`와 같이 배율을 변경하며 천체를 확인할 수 있도록 구성했습니다.

사용자가 단순히 천체 이미지를 보는 데서 끝나는 것이 아니라, **망원경의 배율에 따라 관측 대상이 어떻게 보이는지를 체험하는 방식**으로 설계했습니다.

이를 통해 웹사이트가 단순 정보 제공 페이지가 아니라 실제 천문대 방문 전 기대감을 형성하는 사전 체험 역할을 하도록 했습니다.

---

### 4. 프로그램 탐색

천문대에서 실제로 어떤 활동을 경험할 수 있는지 쉽게 확인할 수 있도록 프로그램 영역을 구성했습니다.

사용자는 페이지를 탐색하면서 천체 관측과 교육·체험 프로그램을 확인할 수 있으며, 프로그램 정보에서 자연스럽게 예약 경험으로 이어질 수 있도록 설계했습니다.

기존 사이트에서 부족하다고 느꼈던 **“천문대에 가면 무엇을 할 수 있는가”**를 보다 직관적으로 전달하는 데 초점을 맞췄습니다.

---

### 5. 예약 UI

별도의 예약 화면에서 다음 순서로 예약 과정을 진행할 수 있도록 구성했습니다.

```text
프로그램 선택
      ↓
날짜 선택
      ↓
시간 선택
      ↓
인원 선택
      ↓
알림 설정
      ↓
이용 동의
      ↓
예약 완료
```

완료 단계에서는 데모용 예약번호를 생성합니다.

여러 정보를 한 화면에 한꺼번에 보여주기보다 **프로그램 → 날짜 → 시간 → 인원** 순서로 선택하도록 하여 사용자가 예약 과정을 단계적으로 이해할 수 있도록 설계했습니다.

> 현재 예약 기능은 포트폴리오용 프로토타입이며 대전시민천문대의 실제 예약 서버와 연결되어 있지는 않습니다.

---

### 6. 방문 전 알림 UX

예약 과정에는 방문 전 알림을 선택할 수 있는 UI를 구성했습니다.

기획 의도는 예약 사용자가 방문 일정을 놓치지 않도록 **방문 약 2시간 전에 알림을 제공하는 경험**을 만드는 것입니다.

현재 화면에서는 알림 옵션과 예약 흐름까지 구현되어 있으며 실제 카카오톡이나 네이버 메시지 발송 서비스와 연결된 기능은 아닙니다.

---

### 7. Astro Mentoring

천문학에 관심이 있는 어린이와 청소년을 위한 **Astro Mentoring** 콘텐츠를 새롭게 구성했습니다.

천문 관련 분야에서 활동하는 실무자의 경험과 진로 정보를 접할 수 있는 프로그램을 제안해, 단순 관측 체험에서 더 나아가 **천문학에 대한 관심이 학습과 진로 탐색으로 이어질 수 있도록** 기획했습니다.

이를 통해 천문대를 단순한 관람 공간이 아니라 교육과 진로 경험까지 제공할 수 있는 공간으로 확장해 표현했습니다.

---

### 8. 방문 정보 / 주차

방문 전에 필요한 정보를 쉽게 확인할 수 있도록 Visit 영역을 구성했습니다.

특히 대전시민천문대는 어린이와 가족 단위 방문자가 많을 수 있다는 점을 고려해 **차량 방문 시 필요한 주차 정보**를 함께 확인할 수 있도록 했습니다.

프로그램을 예약한 뒤 실제 방문까지 이어지는 과정에서 사용자가 필요한 정보를 미리 확인할 수 있도록 구성했습니다.

---

### 9. 실시간 관측 환경 데이터

`NewsSection`에서는 **Open-Meteo API**를 호출해 대전 지역의 현재 기상 데이터를 받아옵니다.

주요 데이터는 다음과 같습니다.

- 구름량
- 강수량
- 풍속
- 풍향

가져온 데이터를 프로젝트 내부 로직으로 계산해 관측 환경을 **0–100 점수와 GOOD / FAIR / POOR 단계**로 표현합니다.

당일 천문대를 방문하거나 예약한 사용자가 현재 날씨와 관측 환경을 빠르게 확인할 수 있도록 구성했습니다.

> 관측 점수는 대전시민천문대의 공식 관측 지수가 아닙니다. 실제 화면에서도 `OFFICIAL STATUS 아님`으로 구분하며, Open-Meteo의 실시간 기상 데이터를 바탕으로 프로젝트 내부에서 산출한 예상 값입니다.

---

## User Flow

```text
Scroll Scrub Intro
        ↓
Observatory Main
        ↓
3D Observation Experience
        ↓
Program Explore
        ↓
Reservation
        ↓
Astro Mentoring
        ↓
Visit / Parking
        ↓
Real-time Weather
```

핵심 목표는 **웹에서 천문대를 먼저 경험하고 필요한 정보를 확인한 뒤 실제 방문으로 이어질 수 있는 흐름을 만드는 것**입니다.

---

## Interaction

프로젝트 전반의 스크롤 및 화면 전환 연출에 GSAP을 사용했습니다.

- ScrollTrigger
- ScrollSmoother
- SplitText
- Scroll Scrub
- Section Transition
- Scroll-linked Animation

3D 영역은 `Three.js`와 `React Three Fiber`를 중심으로 구성했습니다.

---

## Tech Stack

| 구분 | 기술 |
| --- | --- |
| Frontend | React 19 |
| Language | TypeScript |
| Build | Vite |
| 3D / WebGL | Three.js |
| React 3D | @react-three/fiber |
| Motion | GSAP |
| Scroll | ScrollTrigger / ScrollSmoother |
| Text Motion | SplitText |
| Weather Data | Open-Meteo API |
| Styling | CSS |
| Deployment | Vercel |

> `zustand`는 프로젝트 dependency에 포함되어 있지만 현재 주요 구현 코드에서 사용되지 않아 핵심 기술 목록에서는 제외했습니다.

---

## 프로젝트 구조

```text
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

---

## 구현 범위

### 실제 구현된 주요 기능

- React + TypeScript 기반 웹사이트
- GSAP 기반 스크롤 인터랙션
- ScrollTrigger
- ScrollSmoother
- SplitText
- WebP 프레임 기반 Scroll Scrubbing
- Three.js / React Three Fiber 기반 3D 콘텐츠
- WebGL 우주 및 천체 렌더링
- 관측 배율 체험 UI
- 프로그램 탐색 UI
- 단계형 예약 UI
- 데모 예약번호 생성
- Astro Mentoring 콘텐츠
- Visit / Parking 정보
- Open-Meteo API 실시간 요청
- 기상 데이터 기반 자체 관측 적합도 계산
- Vercel 배포

### 프로토타입 범위에 포함되지 않는 기능

- 대전시민천문대 공식 관측 데이터 API
- 천문대 실제 예약 서버
- 실제 결제 시스템
- 실제 카카오 / 네이버 메시지 발송
- 사용자 계정 시스템
- 서버 데이터베이스

기획한 경험과 실제 외부 서비스 연동 범위를 구분해 구현 내용을 정리했습니다.

---

## 실행 방법

```bash
npm install
npm run dev
```

Production Build:

```bash
npm run build
```

Build Preview:

```bash
npm run preview
```

---

## 제작 의도

대전시민천문대는 사람들이 직접 방문해 **천체를 관측하고 다양한 교육과 체험을 경험할 수 있는 공간**입니다.

하지만 기존 사이트에서는 어떤 체험을 할 수 있는지, 어떤 프로그램이 있는지, 실제 방문을 통해 무엇을 배우고 느낄 수 있는지를 전달하는 부분이 부족하다고 생각했습니다.

그래서 DJSTAR는 단순한 디자인 변경이 아니라 **천문대에서 무엇을 경험할 수 있는지를 웹사이트 안에서 직접 보여주는 것**에 중점을 두었습니다.

망원경에서 우주로 이어지는 Scroll Scrub Intro와 3D 천체 관측 경험을 통해 방문 전부터 천문대의 분위기를 느낄 수 있도록 하고, 프로그램 탐색과 예약, 멘토링, 주차 정보, 실시간 관측 환경 정보까지 연결해 실제 방문에 필요한 사용자 경험도 함께 보완했습니다.

결과적으로 DJSTAR는 기존 사이트에서 부족하다고 느꼈던 **“천문대에서 무엇을 경험할 수 있는가”에 대한 답을 웹사이트 안에서 직접 보여주고, 웹에서의 경험이 실제 천문대 방문으로 이어질 수 있도록 리뉴얼한 프로젝트**입니다.
