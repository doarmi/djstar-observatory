import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

import gsap from 'gsap'
import {
  ScrollTrigger,
} from 'gsap/ScrollTrigger'

import {
  navigateTo,
} from '../lib/navigation'

gsap.registerPlugin(
  ScrollTrigger,
)

const DAEJEON = {
  lat: 36.349129,
  lng: 127.384933,
}

const featuredNotice = {
  category: 'IMPORTANT NOTICE',
  date: 'TODAY',
  title: '오늘 운영 및\n관측 안내',
  desc:
    '대전의 현재 기상 데이터를 바탕으로 오늘의 예상 관측 환경을 함께 확인할 수 있습니다.',
}

const news = [
  {
    number: '01',
    category: 'EVENT',
    date: '2026.08.28',
    title: '이번 달 특별 천체관측 프로그램 안내',
    desc: '시민과 함께하는 특별 관측 프로그램',
    route: '/programs',
  },
  {
    number: '02',
    category: 'PROGRAM',
    date: '2026.08.24',
    title: '가족과 함께하는 주말 천문 프로그램',
    desc: '어린이와 가족을 위한 천문 체험',
    route: '/programs',
  },
  {
    number: '03',
    category: 'NOTICE',
    date: '2026.08.19',
    title: '대전시민천문대 관람 및 이용 안내',
    desc: '방문 전 확인해야 할 이용 정보',
    route: '/visit',
  },
  {
    number: '04',
    category: 'NEWS',
    date: '2026.08.12',
    title: '대전의 밤하늘에서 만나는 여름철 별자리',
    desc: '이번 달 밤하늘 관측 포인트',
    route: '/tonight',
  },
]

type WeatherState = {
  cloud: number | null
  precipitation: number | null
  wind: number | null
  windDirection: number | null
  condition:
  | 'GOOD'
  | 'FAIR'
  | 'POOR'
  | 'LOADING'
}

function getCondition(
  cloud: number,
  precipitation: number,
  wind: number,
) {
  if (
    precipitation > 0.2 ||
    cloud >= 80 ||
    wind >= 30
  ) {
    return 'POOR' as const
  }

  if (
    cloud >= 50 ||
    precipitation > 0 ||
    wind >= 20
  ) {
    return 'FAIR' as const
  }

  return 'GOOD' as const
}

function formatMetric(
  value: number | null,
  suffix: string,
) {
  if (
    value === null
  ) {
    return '—'
  }

  return `${Math.round(value)}${suffix}`
}


function getObservationScore(
  cloud: number | null,
  precipitation: number | null,
  wind: number | null,
) {
  if (
    cloud === null ||
    precipitation === null ||
    wind === null
  ) {
    return null
  }

  const cloudPenalty =
    cloud * 0.62

  const rainPenalty =
    Math.min(
      30,
      precipitation * 22,
    )

  const windPenalty =
    Math.max(
      0,
      wind - 8,
    ) * 0.65

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        100 -
        cloudPenalty -
        rainPenalty -
        windPenalty,
      ),
    ),
  )
}

export default function NewsSection() {
  const sectionRef =
    useRef<HTMLElement>(null)

  const [
    weather,
    setWeather,
  ] =
    useState<WeatherState>({
      cloud: null,
      precipitation: null,
      wind: null,
      windDirection: null,
      condition: 'LOADING',
    })


  const observationScore =
    getObservationScore(
      weather.cloud,
      weather.precipitation,
      weather.wind,
    )

  useEffect(() => {
    const controller =
      new AbortController()

    async function loadWeather() {
      try {
        const url =
          'https://api.open-meteo.com/v1/forecast' +
          `?latitude=${DAEJEON.lat}` +
          `&longitude=${DAEJEON.lng}` +
          '&current=cloud_cover,precipitation,wind_speed_10m,wind_direction_10m' +
          '&timezone=Asia%2FSeoul'

        const response =
          await fetch(
            url,
            {
              signal:
                controller.signal,
            },
          )

        if (
          !response.ok
        ) {
          throw new Error(
            'Weather request failed',
          )
        }

        const data =
          await response.json()

        const cloud =
          Number(
            data.current
              ?.cloud_cover,
          )

        const precipitation =
          Number(
            data.current
              ?.precipitation,
          )

        const wind =
          Number(
            data.current
              ?.wind_speed_10m,
          )

        const windDirection =
          Number(
            data.current
              ?.wind_direction_10m,
          )

        if (
          !Number.isFinite(
            cloud,
          ) ||
          !Number.isFinite(
            precipitation,
          ) ||
          !Number.isFinite(
            wind,
          ) ||
          !Number.isFinite(
            windDirection,
          )
        ) {
          throw new Error(
            'Invalid weather data',
          )
        }

        setWeather({
          cloud,
          precipitation,
          wind,
          windDirection,
          condition:
            getCondition(
              cloud,
              precipitation,
              wind,
            ),
        })
      } catch (error) {
        if (
          error instanceof
          DOMException &&
          error.name ===
          'AbortError'
        ) {
          return
        }

        setWeather({
          cloud: null,
          precipitation:
            null,
          wind: null,
          windDirection: null,
          condition:
            'LOADING',
        })
      }
    }

    loadWeather()

    return () => {
      controller.abort()
    }
  }, [])

  useLayoutEffect(() => {
    const section =
      sectionRef.current

    if (!section) {
      return
    }

    const reducedMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

    if (reducedMotion) {
      return
    }

    const ctx =
      gsap.context(() => {
        const tl =
          gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: 'top 78%',
              once: true,
            },

            defaults: {
              ease: 'power3.out',
            },
          })

        tl.from(
          '.news-kicker',
          {
            opacity: 0,
            y: 12,
            duration: 0.45,
          },
        )
          .from(
            '.news-title',
            {
              opacity: 0,
              y: 30,
              duration: 0.72,
            },
            '-=0.22',
          )
          .from(
            '.news-summary-wrap',
            {
              opacity: 0,
              y: 18,
              duration: 0.58,
            },
            '-=0.42',
          )

        gsap.fromTo(
          '.news-dashboard',
          {
            y: 20,
          },
          {
            y: 0,
            duration: 0.9,
            ease: 'power3.out',

            scrollTrigger: {
              trigger:
                '.news-dashboard',
              start: 'top 88%',
              once: true,
            },
          },
        )
      }, section)

    return () => {
      ctx.revert()
    }
  }, [])

  return (
    <section
      className="news-section"
      ref={sectionRef}
      id="news-section"
    >
      <div className="container">
        {/* =========================
            SECTION HEADER
        ========================= */}

        <div className="section-head compact">
          <div>
            <p className="section-kicker news-kicker">
              NEWS &amp; NOTICE
            </p>

            <h2 className="news-title">
              오늘의 하늘과
              <br />
              천문대 소식.
            </h2>
          </div>

          <div className="news-summary-wrap">
            <p className="section-summary news-summary">
              운영 안내부터 특별 관측 행사
              <br />
              교육 프로그램과 새로운 소식까지
              <br />
              지금 확인해야 할 정보를 전합니다.
            </p>

            <button
              className="news-all-link"
              type="button"
              onClick={() =>
                navigateTo(
                  '/news',
                )
              }
            >
              ALL NEWS

              <span>
                ↗
              </span>
            </button>
          </div>
        </div>

        {/* =========================
            NEWS CONTENT
        ========================= */}

        <div className="news-dashboard">
          {/* =========================
              FEATURED NOTICE
          ========================= */}

          <article
            className="news-featured news-featured--interactive"
            onClick={() =>
              navigateTo(
                '/tonight',
              )
            }
          >
            <div className="news-featured-top">
              <span>
                {featuredNotice.category}
              </span>

              <span className="news-featured-status">
                <i />

                {featuredNotice.date}
              </span>
            </div>

            {/* =========================
                LIVE WEATHER VISUAL
            ========================= */}

            <div
              className="news-featured-visual news-weather-panel"
              aria-hidden="true"
              style={{
                '--cloud-opacity':
                  weather.cloud === null
                    ? 0.16
                    : Math.min(
                      0.62,
                      0.08 +
                      weather.cloud /
                      170,
                    ),
                '--wind-angle':
                  `${weather.windDirection ?? 0}deg`,
                '--score-pos':
                  `${observationScore ?? 50}%`,
              } as React.CSSProperties}
            >
              <div className="news-weather-panel__grid" />

              {/* LEFT — SCORE */}

              <div className="news-weather-score">
                <div className="news-weather-score__head">
                  <strong>
                    예상 관측 환경
                  </strong>

                  <span>
                    OBSERVING CONDITION
                  </span>
                </div>

                <div className="news-weather-score__value">
                  <strong>
                    {
                      observationScore ===
                        null
                        ? '--'
                        : observationScore
                    }
                  </strong>

                  <span>
                    / 100
                  </span>
                </div>

                <div className="news-weather-score__divider" />

                <div
                  className={`news-weather-grade news-weather-grade--${weather.condition.toLowerCase()}`}
                >
                  <i />

                  <strong>
                    {
                      weather.condition ===
                        'LOADING'
                        ? 'CHECKING'
                        : weather.condition
                    }
                  </strong>
                </div>

                <p>
                  {
                    weather.condition ===
                      'GOOD'
                      ? '대체로 맑은 하늘이 예상됩니다.'
                      : weather.condition ===
                        'FAIR'
                        ? '일부 구름이나 바람의 영향이 예상됩니다.'
                        : weather.condition ===
                          'POOR'
                          ? '관측에 불리한 기상 조건이 예상됩니다.'
                          : '현재 기상 데이터를 확인하고 있습니다.'
                  }
                  <br />
                  천체 관측하기 좋은 조건인지 확인해 보세요.
                </p>

                <small>
                  OFFICIAL STATUS 아님
                </small>
              </div>

              {/* CENTER — SKY DOME */}

              <div className="news-weather-sky">
                <div className="news-weather-sky__top">
                  <div>
                    <strong>
                      SKY SCAN · DAEJEON
                    </strong>

                    <span>
                      LIVE OBSERVATION DATA
                    </span>
                  </div>

                  <span className="news-weather-live">
                    <i />

                    LIVE
                  </span>
                </div>

                <div className="news-weather-dome">
                  <div className="news-weather-dome__stars">
                    {[
                      [10, 28],
                      [18, 38],
                      [27, 20],
                      [36, 31],
                      [46, 18],
                      [55, 34],
                      [63, 25],
                      [72, 42],
                      [82, 24],
                      [90, 36],
                      [16, 60],
                      [28, 68],
                      [39, 55],
                      [52, 72],
                      [66, 58],
                      [79, 67],
                      [88, 55],
                    ].map(
                      (
                        [
                          left,
                          top,
                        ],
                        index,
                      ) => (
                        <i
                          key={`${left}-${top}`}
                          style={{
                            left: `${left}%`,
                            top: `${top}%`,
                            animationDelay:
                              `${index * 0.14}s`,
                          }}
                        />
                      ),
                    )}
                  </div>

                  <div className="news-weather-dome__cloud news-weather-dome__cloud--one" />
                  <div className="news-weather-dome__cloud news-weather-dome__cloud--two" />

                  <div className="news-weather-dome__arc news-weather-dome__arc--one" />
                  <div className="news-weather-dome__arc news-weather-dome__arc--two" />
                  <div className="news-weather-dome__arc news-weather-dome__arc--three" />

                  <div className="news-weather-dome__axis news-weather-dome__axis--x" />
                  <div className="news-weather-dome__axis news-weather-dome__axis--y" />

                  <span className="news-weather-dir news-weather-dir--n">
                    N
                  </span>

                  <span className="news-weather-dir news-weather-dir--e">
                    E
                  </span>

                  <span className="news-weather-dir news-weather-dir--s">
                    S
                  </span>

                  <span className="news-weather-dir news-weather-dir--w">
                    W
                  </span>

                  <div className="news-weather-scanline">
                    <i />
                  </div>

                  <div className="news-weather-horizon">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>

                  {(
                    weather.precipitation ??
                    0
                  ) > 0 && (
                      <div className="news-weather-rain">
                        {Array.from({
                          length: 10,
                        }).map(
                          (
                            _,
                            index,
                          ) => (
                            <i
                              key={index}
                              style={{
                                left: `${8 + index * 9}%`,
                                animationDelay:
                                  `${index * 0.11}s`,
                              }}
                            />
                          ),
                        )}
                      </div>
                    )}
                </div>

                <div className="news-weather-scale">
                  <span className="news-weather-scale__poor">
                    POOR
                  </span>

                  <span className="news-weather-scale__fair">
                    FAIR
                  </span>

                  <span className="news-weather-scale__good">
                    GOOD
                  </span>

                  <div className="news-weather-scale__bar">
                    <i />
                  </div>
                </div>

                <p className="news-weather-disclaimer">
                  실시간 기상 데이터를 기반으로 산출된 예상 값입니다.
                </p>
              </div>

              {/* RIGHT — METRIC CARDS */}

              <div className="news-weather-metrics">
                <article className="news-weather-metric">
                  <span className="news-weather-metric__icon">
                    ☁
                  </span>

                  <div>
                    <strong>
                      구름량
                    </strong>

                    <small>
                      CLOUD COVER
                    </small>
                  </div>

                  <b>
                    {
                      formatMetric(
                        weather.cloud,
                        '%',
                      )
                    }
                  </b>

                  <em>
                    {
                      weather.cloud ===
                        null
                        ? '확인 중'
                        : weather.cloud <
                          30
                          ? '낮음'
                          : weather.cloud <
                            65
                            ? '보통'
                            : '높음'
                    }
                  </em>
                </article>

                <article className="news-weather-metric">
                  <span className="news-weather-metric__icon">
                    ⋮
                  </span>

                  <div>
                    <strong>
                      강수량
                    </strong>

                    <small>
                      PRECIPITATION
                    </small>
                  </div>

                  <b>
                    {
                      weather.precipitation ===
                        null
                        ? '—'
                        : `${weather.precipitation.toFixed(
                          1,
                        )} mm`
                    }
                  </b>

                  <em>
                    {
                      (
                        weather.precipitation ??
                        0
                      ) > 0
                        ? '강수 감지'
                        : '비 없음'
                    }
                  </em>
                </article>

                <article className="news-weather-metric">
                  <span className="news-weather-metric__icon">
                    ≋
                  </span>

                  <div>
                    <strong>
                      풍속
                    </strong>

                    <small>
                      WIND SPEED
                    </small>
                  </div>

                  <b>
                    {
                      weather.wind ===
                        null
                        ? '—'
                        : `${Math.round(
                          weather.wind,
                        )} km/h`
                    }
                  </b>

                  <em>
                    {
                      weather.wind ===
                        null
                        ? '확인 중'
                        : weather.wind <
                          15
                          ? '약한 바람'
                          : weather.wind <
                            25
                            ? '보통 바람'
                            : '강한 바람'
                    }
                  </em>
                </article>

                <article className="news-weather-metric news-weather-metric--direction">
                  <span className="news-weather-metric__icon news-weather-metric__arrow">
                    ↑
                  </span>

                  <div>
                    <strong>
                      풍향
                    </strong>

                    <small>
                      WIND DIRECTION
                    </small>
                  </div>

                  <b>
                    {
                      weather.windDirection ===
                        null
                        ? '—'
                        : `${Math.round(
                          weather.windDirection,
                        )}°`
                    }
                  </b>

                  <em>
                    CURRENT
                  </em>
                </article>
              </div>
            </div>

            {/* =========================
                FEATURED COPY
            ========================= */}

            <div className="news-featured-copy">
              <div>
                <span className="news-featured-index">
                  01 / FEATURED
                </span>

                <h3>
                  {featuredNotice.title
                    .split('\n')
                    .map(
                      (
                        line,
                        index,
                      ) => (
                        <span key={line}>
                          {line}

                          {index ===
                            0 && (
                              <br />
                            )}
                        </span>
                      ),
                    )}
                </h3>

                <p>
                  {
                    featuredNotice.desc
                  }
                </p>

                <div className="news-weather-summary">
                  <span>
                    예상 관측 환경
                  </span>

                  <strong>
                    {
                      weather.condition ===
                        'LOADING'
                        ? '확인 중'
                        : weather.condition
                    }
                  </strong>

                  <small>
                    실시간 기상 기반 예상값
                  </small>
                </div>
              </div>

              <button
                className="news-featured-link"
                type="button"
                aria-label="오늘 운영 및 관측 안내 자세히 보기"
                onClick={event => {
                  event.stopPropagation()

                  navigateTo(
                    '/tonight',
                  )
                }}
              >
                <span>
                  자세히 보기
                </span>

                <b aria-hidden="true">
                  ↗
                </b>
              </button>
            </div>
          </article>

          {/* =========================
              NEWSROOM
          ========================= */}

          <div className="news-list">
            <div className="news-list-head">
              <span>
                LATEST UPDATE
              </span>

              <span>
                04 ARTICLES
              </span>
            </div>

            <div className="news-list-rows">
              {news.map(
                item => (
                  <article
                    className="news-list-item news-list-item--interactive"
                    key={item.number}
                    onClick={() =>
                      navigateTo(
                        item.route,
                      )
                    }
                  >
                    <span className="news-number">
                      {item.number}
                    </span>

                    <div className="news-list-copy">
                      <div className="news-meta">
                        <span>
                          {
                            item.category
                          }
                        </span>

                        <time>
                          {item.date}
                        </time>
                      </div>

                      <h3>
                        {item.title}
                      </h3>

                      <p>
                        {item.desc}
                      </p>
                    </div>

                    <button
                      className="news-row-arrow"
                      type="button"
                      aria-label={`${item.title} 자세히 보기`}
                      onClick={event => {
                        event.stopPropagation()

                        navigateTo(
                          item.route,
                        )
                      }}
                    >
                      ↗
                    </button>
                  </article>
                ),
              )}
            </div>

            <div className="news-list-footer">
              <span>
                DJSTAR · NEWSROOM
              </span>

              <button
                type="button"
                className="text-link"
                onClick={() =>
                  navigateTo(
                    '/news',
                  )
                }
              >
                전체 소식 보기

                <span>
                  →
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
