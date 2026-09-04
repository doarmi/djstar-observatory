import {
  KeyboardEvent,
} from 'react'

import {
  navigateTo,
} from '../lib/navigation'

const cards = [
  {
    code: 'FAMILY',
    ko: '아이와 함께',
    desc: '어린이와 가족에게 맞는 체험 프로그램',
    tag: '가족 추천',
    image:
      '/images/experience-family.png',
    route:
      '/experience/family',
  },

  {
    code: 'GROUP',
    ko: '학교·단체',
    desc: '현장체험학습과 단체 방문 프로그램',
    tag: '교육·단체',
    image:
      '/images/experience-group.png',
    route:
      '/experience/group',
  },

  {
    code: 'OBSERVE',
    ko: '별을 직접 보고 싶어요',
    desc: '망원경으로 직접 밤하늘을 만나는 관측 체험',
    tag: '관측 체험',
    image:
      '/images/experience-observe.png',
    route:
      '/experience/observe',
  },

  {
    code: 'DEEP SPACE',
    ko: '천문학을 더 깊게',
    desc: '강연과 심화 천문 콘텐츠를 통해 더 깊이 탐구',
    tag: '심화 탐구',
    image:
      '/images/experience-deep-space.png',
    route:
      '/experience/deep-space',
  },

  {
    code: 'ASTRO CAREER',
    ko: '천문학을 진로로',
    desc: '천문학 진학과 현업을 알아보는 진로 프로그램',
    tag: '진로 멘토링',
    image:
      '/images/experience-career.png',
    route:
      '/experience/career',
  },
] as const

export default function ExperienceFinder() {
  const openExperience = (
    route: string,
  ) => {
    /*
     * 이 상세페이지에서 BACK TO DJSTAR를 누르면
     * Experience Finder로 돌아오도록 출발 위치를 기억한다.
     */

    navigateTo(route)
  }

  const handleKeyDown = (
    event: KeyboardEvent<HTMLElement>,
    route: string,
  ) => {
    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault()

      openExperience(route)
    }
  }

  return (
    <section
      className="experience-section"
      id="experience-finder"
    >
      <div className="container">
        <div className="section-head compact">
          <div>
            <p className="section-kicker">
              FIND YOUR EXPERIENCE
            </p>

            <h2>
              누구와 함께 오시나요?
              <br />
              당신에게 맞는 프로그램을
              <br />
              추천해 드려요.
            </h2>
          </div>

          <p className="section-summary">
            프로그램 이름을 몰라도 괜찮아요.
            <br />
            방문 목적과 관심 분야를 선택하면
            <br />
            나에게 맞는 천문대 경험을 빠르게 찾을 수 있습니다.
          </p>
        </div>

        <div className="experience-cards">
          {cards.map(
            (
              card,
              index,
            ) => (
              <article
                className={`experience-card exp-${index + 1}`}
                key={card.code}
                role="link"
                tabIndex={0}
                onClick={() =>
                  openExperience(
                    card.route,
                  )
                }
                onKeyDown={event =>
                  handleKeyDown(
                    event,
                    card.route,
                  )
                }
              >
                <div className="experience-visual">
                  <img
                    src={card.image}
                    alt={card.ko}
                    loading="lazy"
                    draggable={false}
                  />

                  <div className="experience-visual-shade" />
                </div>

                <div className="experience-content">
                  <span className="experience-code">
                    {card.code}
                  </span>

                  <h3>
                    {card.ko}
                  </h3>

                  <p>
                    {card.desc}
                  </p>

                  <div className="experience-bottom">
                    <span className="mini-badge">
                      {card.tag}
                    </span>

                    <button
                      type="button"
                      className="round-arrow"
                      aria-label={`${card.ko} 프로그램 보기`}
                      onClick={event => {
                        event.stopPropagation()

                        openExperience(
                          card.route,
                        )
                      }}
                    >
                      <img
                        src="/images/nav-arrow.png"
                        alt=""
                        className="round-arrow-icon"
                      />
                    </button>
                  </div>
                </div>
              </article>
            ),
          )}
        </div>
      </div>
    </section>
  )
}