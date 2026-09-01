import {
  useEffect,
  useState,
} from 'react'

import Header from './components/Header'
import HeroSection from './sections/HeroSection'
import ObservationSection from './sections/ObservationSection'
import ExperienceFinder from './sections/ExperienceFinder'
import ExperiencePreview from './sections/ExperiencePreview'
import FeaturedPrograms from './sections/FeaturedPrograms'
import DeepSpaceBreak from './sections/DeepSpaceBreak'
import AstroMentoring from './sections/AstroMentoring'
import VisitSection from './sections/VisitSection'
import NewsSection from './sections/NewsSection'
import SiteFooter from './sections/SiteFooter'
import ScrollMotion from './components/ScrollMotion'
import ScrollScrubIntro from './components/ScrollScrubIntro'
import TonightSkyTransition from './sections/TonightSkyTransition'
import SpaceOutro from './sections/SpaceOutro'
import ReservationPage from './sections/ReservationPage'

type PageData = {
  eyebrow: string
  title: string
  description: string
}

const pages: Record<
  string,
  PageData
> = {
  '/tonight': {
    eyebrow: 'TONIGHT AT DJSTAR',
    title: '오늘의 관측',
    description: '오늘 운영시간과 일몰 관측 환경 관측 가능한 천체를 확인해보세요.',
  },

  '/programs': {
    eyebrow: 'DJSTAR PROGRAMS',
    title: '프로그램',
    description: '관측 천체투영관 가족 프로그램과 특별 프로그램을 만나보세요.',
  },

  '/programs/observation': {
    eyebrow: 'OBSERVATION',
    title: '야간 천체관측',
    description: '망원경을 통해 오늘의 밤하늘과 주요 천체를 직접 관측하는 프로그램입니다.',
  },

  '/programs/dome': {
    eyebrow: 'DOME',
    title: '천체투영관 별자리 이야기',
    description: '천체투영관에서 계절별 별자리와 밤하늘 이야기를 만나보는 프로그램입니다.',
  },

  '/programs/concert': {
    eyebrow: 'SPECIAL',
    title: '토요 별 음악회',
    description: '별과 음악을 함께 즐기는 대전시민천문대의 특별 프로그램입니다.',
  },

  '/experience/family': {
    eyebrow: 'FAMILY EXPERIENCE',
    title: '아이와 함께',
    description: '어린이와 가족에게 맞는 천문대 체험 프로그램을 만나보세요.',
  },

  '/experience/group': {
    eyebrow: 'GROUP EXPERIENCE',
    title: '학교·단체',
    description: '현장체험학습과 학교 단체 방문에 맞는 프로그램을 확인해보세요.',
  },

  '/experience/observe': {
    eyebrow: 'OBSERVE',
    title: '별을 직접 보고 싶어요',
    description: '망원경을 통해 실제 밤하늘을 만나는 관측 프로그램을 확인해보세요.',
  },

  '/experience/deep-space': {
    eyebrow: 'DEEP SPACE',
    title: '천문학을 더 깊게',
    description: '강연과 심화 천문 콘텐츠를 통해 우주를 더 깊이 탐험해보세요.',
  },

  '/experience/career': {
    eyebrow: 'ASTRO CAREER',
    title: '천문학을 진로로',
    description: '천문학 진학과 현업을 알아보는 진로 프로그램을 확인해보세요.',
  },

  '/experience/telescope': {
    eyebrow: 'TELESCOPE EXPERIENCE',
    title: '망원경 배율 체험',
    description: '망원경의 배율에 따라 달라지는 천체의 모습을 직접 체험해보세요.',
  },

  '/experience/dome': {
    eyebrow: 'DOME EXPERIENCE',
    title: '천체투영관 프리뷰',
    description: '돔 스크린에 펼쳐지는 별자리와 밤하늘을 미리 경험해보세요.',
  },

  '/experience/kids': {
    eyebrow: 'FAMILY EXPERIENCE',
    title: '어린이 별자리 체험',
    description: '별을 직접 연결하며 별자리와 천체를 쉽고 재미있게 알아보세요.',
  },

  '/mentoring': {
    eyebrow: 'ASTRO MENTORING',
    title: '천문 진로 멘토링',
    description: '관측 데이터 진로 탐색 현업 멘토링으로 이어지는 프로그램입니다.',
  },

  '/mentoring/apply': {
    eyebrow: 'MENTORING APPLICATION',
    title: '멘토링 신청',
    description: '천문 진로 멘토링 일정과 신청 정보를 확인해보세요.',
  },

  '/visit': {
    eyebrow: 'PLAN YOUR VISIT',
    title: '방문안내',
    description: '운영시간 위치 주차 대중교통 등 방문에 필요한 정보를 확인해보세요.',
  },

  '/news': {
    eyebrow: 'NEWS & NOTICE',
    title: '천문대 소식',
    description: '운영 안내 행사 프로그램과 대전시민천문대의 새로운 소식을 확인해보세요.',
  },

  '/reservation': {
    eyebrow: 'RESERVATION',
    title: '프로그램 예약',
    description: '관측과 체험 프로그램의 일정 및 예약 정보를 확인해보세요.',
  },
}

function HomePage() {
  return (
    <>
      <ScrollMotion />

      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <ScrollScrubIntro />

            <div id="main">
              <HeroSection />
            </div>

            <ObservationSection />
            <TonightSkyTransition />
            <ExperienceFinder />
            <ExperiencePreview />
            <FeaturedPrograms />
            <DeepSpaceBreak />
            <AstroMentoring />
            <VisitSection />
            <NewsSection />
            <SpaceOutro />
          </main>

          <SiteFooter />
        </div>
      </div>
    </>
  )
}

function SubPage({
  eyebrow,
  title,
  description,
}: PageData) {
  const goHome = () => {
    /*
     * 상세페이지를 닫을 때 메인 페이지는 다시 만들지 않는다.
     * HomePage가 뒤에서 계속 살아 있으므로 URL만 / 로 바꾸면
     * 사용자가 출발했던 정확한 스크롤 위치가 그대로 유지된다.
     */
    sessionStorage.removeItem(
      'djstar-return-target',
    )
    sessionStorage.removeItem(
      'djstar-return-scroll',
    )
    sessionStorage.removeItem(
      'djstar-home-return-target',
    )
    sessionStorage.removeItem(
      'djstar-jump-to-saved-scroll',
    )
    sessionStorage.removeItem(
      'djstar-jump-to-hero',
    )
    sessionStorage.removeItem(
      'djstar-jump-to-experience',
    )
    sessionStorage.removeItem(
      'djstar-jump-to-preview',
    )
    sessionStorage.removeItem(
      'djstar-jump-to-programs',
    )
    sessionStorage.removeItem(
      'djstar-jump-to-mentoring',
    )

    window.history.pushState(
      {},
      '',
      '/',
    )

    window.dispatchEvent(
      new PopStateEvent(
        'popstate',
      ),
    )
  }

  return (
    <main
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 40,
        overflowY: 'auto',
        minHeight: '100vh',
        background: '#02050d',
        color: '#fff',
        padding: 'clamp(140px, 17vh, 190px) clamp(32px, 7vw, 120px)',
      }}
    >
      <button
        type="button"
        onClick={goHome}
        style={{
          border: 0,
          padding: 0,
          background: 'transparent',
          color: 'rgba(210,225,245,.55)',
          fontSize: '11px',
          letterSpacing: '.12em',
          cursor: 'pointer',
        }}
      >
        ← BACK TO DJSTAR
      </button>

      <div
        style={{
          marginTop: 'clamp(100px, 15vh, 170px)',
          maxWidth: '1100px',
        }}
      >
        <p
          style={{
            marginBottom: '24px',
            color: 'rgba(151,190,240,.7)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '.24em',
          }}
        >
          {eyebrow}
        </p>

        <h1
          style={{
            margin: 0,
            fontSize: 'clamp(60px, 8vw, 130px)',
            lineHeight: '.95',
            letterSpacing: '-.065em',
            wordBreak: 'keep-all',
          }}
        >
          {title}
        </h1>

        <p
          style={{
            maxWidth: '580px',
            marginTop: '38px',
            color: 'rgba(215,228,245,.58)',
            fontSize: 'clamp(14px, 1vw, 17px)',
            lineHeight: 1.8,
            wordBreak: 'keep-all',
          }}
        >
          {description}
        </p>
      </div>
    </main>
  )
}

export default function App() {
  const [
    pathname,
    setPathname,
  ] = useState(
    window.location.pathname,
  )

  useEffect(() => {
    const handlePopState =
      () => {
        setPathname(
          window.location.pathname,
        )
      }

    window.addEventListener(
      'popstate',
      handlePopState,
    )

    return () => {
      window.removeEventListener(
        'popstate',
        handlePopState,
      )
    }
  }, [])

  useEffect(() => {
    /*
     * 상세페이지는 메인 위에 fixed overlay로 열린다.
     * 뒤쪽 메인의 ScrollSmoother/ScrollTrigger/현재 위치는
     * 절대 해제하거나 다시 초기화하지 않는다.
     */
    const previousOverflow =
      document.body.style.overflow

    if (pathname !== '/') {
      document.body.style.overflow =
        'hidden'
    }

    return () => {
      document.body.style.overflow =
        previousOverflow
    }
  }, [pathname])

  const page =
    pages[pathname]

  const closeOverlay =
    () => {
      sessionStorage.removeItem(
        'djstar-return-target',
      )
      sessionStorage.removeItem(
        'djstar-return-scroll',
      )
      sessionStorage.removeItem(
        'djstar-home-return-target',
      )
      sessionStorage.removeItem(
        'djstar-jump-to-saved-scroll',
      )
      sessionStorage.removeItem(
        'djstar-jump-to-hero',
      )
      sessionStorage.removeItem(
        'djstar-jump-to-experience',
      )
      sessionStorage.removeItem(
        'djstar-jump-to-preview',
      )
      sessionStorage.removeItem(
        'djstar-jump-to-programs',
      )
      sessionStorage.removeItem(
        'djstar-jump-to-mentoring',
      )

      window.history.pushState(
        {},
        '',
        '/',
      )

      window.dispatchEvent(
        new PopStateEvent(
          'popstate',
        ),
      )
    }

  return (
    <>
      <Header />

      <HomePage />

      {pathname ===
        '/reservation' ? (
        <ReservationPage
          onClose={
            closeOverlay
          }
        />
      ) : (
        pathname !== '/' && (
          page ? (
            <SubPage
              eyebrow={page.eyebrow}
              title={page.title}
              description={page.description}
            />
          ) : (
            <SubPage
              eyebrow="404 / LOST IN SPACE"
              title="페이지를 찾을 수 없습니다."
              description="아직 연결되지 않은 페이지입니다."
            />
          )
        )
      )}
    </>
  )
}
