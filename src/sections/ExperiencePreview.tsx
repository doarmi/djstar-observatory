import {
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

import gsap from 'gsap'
import {
  ScrollTrigger,
} from 'gsap/ScrollTrigger'
import {
  SplitText,
} from 'gsap/SplitText'

import SaturnTelescope from '../components/SaturnTelescope'

import {
  navigateTo,
} from '../lib/navigation'

const previewItems = [
  {
    title:
      '망원경 배율 체험',

    meta:
      'OBSERVE · 50x / 100x / 200x',

    route:
      '/experience/telescope',

    desc: (
      <>
        배율에 따라 천체가 어떻게 다르게 보이는지
        <br />
        방문 전에 미리 체험합니다.
      </>
    ),
  },

  {
    title:
      '천체투영관 프리뷰',

    meta:
      'DOME · CONSTELLATION',

    route:
      '/experience/dome',

    desc: (
      <>
        돔 내부에 펼쳐지는 별자리와 밤하늘을
        <br />
        짧은 인터랙션으로 경험합니다.
      </>
    ),
  },

  {
    title:
      '어린이 별자리 체험',

    meta:
      'FAMILY · MINI EXPERIENCE',

    route:
      '/experience/kids',

    desc: (
      <>
        별을 연결하며 별자리와 천체 정보를
        <br />
        자연스럽게 알아가는 체험입니다.
      </>
    ),
  },
]

const magnifications = [
  50,
  100,
  200,
]

gsap.registerPlugin(
  ScrollTrigger,
  SplitText,
)

export default function ExperiencePreview() {
  const sectionRef =
    useRef<HTMLElement>(
      null,
    )

  const [
    magnification,
    setMagnification,
  ] = useState(100)

  useLayoutEffect(() => {
    const section =
      sectionRef.current

    if (
      !section ||
      window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
    ) {
      return
    }

    const ctx =
      gsap.context(
        () => {
          const title =
            section.querySelector(
              '.section-head h2',
            )

          const split =
            title
              ? SplitText.create(
                title,
                {
                  type:
                    'lines',

                  linesClass:
                    'split-line',
                },
              )
              : null

          const tl =
            gsap.timeline({
              scrollTrigger: {
                trigger:
                  section,

                start:
                  'top 70%',

                once:
                  true,
              },

              defaults: {
                ease:
                  'power3.out',
              },
            })

          tl.from(
            '.section-kicker',
            {
              opacity: 0,

              y: 10,

              duration:
                0.42,
            },
          )
            .from(
              split?.lines ??
              [],
              {
                opacity: 0,

                yPercent:
                  55,

                duration:
                  0.7,

                stagger:
                  0.1,
              },
              '-=0.15',
            )
            .from(
              '.section-summary',
              {
                opacity: 0,

                y: 16,

                duration:
                  0.5,
              },
              '-=0.36',
            )
            .from(
              '.preview-main',
              {
                opacity: 0,

                y: 34,

                scale:
                  0.985,

                duration:
                  0.8,
              },
              '-=0.12',
            )
            .from(
              '.preview-mini',
              {
                opacity: 0,

                x: 18,

                duration:
                  0.48,

                stagger:
                  0.09,
              },
              '-=0.36',
            )

          return () =>
            split?.revert()
        },
        section,
      )

    return () =>
      ctx.revert()
  }, [])

  const changeMagnification = (
    value: number,
  ) => {
    setMagnification(
      value,
    )

    const section =
      sectionRef.current

    if (!section) {
      return
    }

    gsap.fromTo(
      section.querySelector(
        '.scope-sim__ring',
      ),
      {
        scale:
          0.97,

        opacity:
          0.72,
      },
      {
        scale:
          1,

        opacity:
          1,

        duration:
          0.42,

        ease:
          'power2.out',
      },
    )
  }

  const openPreview = (
    route: string,
  ) => {
    /*
     * 상세페이지에서 BACK TO DJSTAR를 누르면
     * 이 EXPERIENCE PREVIEW 섹션으로 복귀.
     */

    navigateTo(route)
  }

  return (
    <section
      className="preview-section experience-preview"
      id="experience-preview"
      ref={sectionRef}
    >
      <div className="container">
        <div className="section-head compact">
          <div>
            <p className="section-kicker">
              EXPERIENCE PREVIEW
            </p>

            <h2>
              망원경을 직접 조작해
              <br />
              오늘의 천체를 미리
              <br />
              만나보세요.
            </h2>
          </div>

          <p className="section-summary">
            설명만 읽는 프로그램 안내에서 벗어나
            <br />
            실제 관측 전에 망원경의
            <br />
            배율과 시야 변화를
            <br />
            직접 체험할 수 있도록 구성합니다.
          </p>
        </div>

        <div className="preview-grid">
          <article className="preview-main">
            <div className="preview-scene">
              <div className="scope-sim">
                <div className="scope-sim__ring">
                  <SaturnTelescope
                    magnification={
                      magnification
                    }
                  />
                </div>

                <div className="magnification-control">
                  <span>
                    MAGNIFICATION
                  </span>

                  <div
                    className="magnification-scale"
                    role="group"
                    aria-label="망원경 배율 선택"
                  >
                    {magnifications.map(
                      value => (
                        <button
                          key={
                            value
                          }
                          type="button"
                          className={
                            value ===
                              magnification
                              ? 'active'
                              : ''
                          }
                          aria-pressed={
                            value ===
                            magnification
                          }
                          onClick={() =>
                            changeMagnification(
                              value,
                            )
                          }
                        >
                          {value}x
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="preview-main__copy">
              <span>
                FEATURED PREVIEW
              </span>

              <h3>
                망원경 배율 체험
              </h3>

              <p>
                배율을 변경하면서 천체의 크기와 시야가 어떻게 달라지는지
                직접 확인해보세요.
              </p>

              <button
                className="primary-cta"
                type="button"
                onClick={() =>
                  openPreview(
                    '/experience/telescope',
                  )
                }
              >
                체험 시작하기
              </button>
            </div>
          </article>

          <div className="preview-list">
            {previewItems.map(
              (
                item,
                index,
              ) => (
                <article
                  className={`preview-mini ${index ===
                      0
                      ? 'is-active'
                      : ''
                    }`}
                  key={
                    item.title
                  }
                  role="link"
                  tabIndex={0}
                  onClick={() =>
                    openPreview(
                      item.route,
                    )
                  }
                  onKeyDown={
                    event => {
                      if (
                        event.key ===
                        'Enter' ||
                        event.key ===
                        ' '
                      ) {
                        event.preventDefault()

                        openPreview(
                          item.route,
                        )
                      }
                    }
                  }
                  style={{
                    cursor:
                      'pointer',
                  }}
                >
                  <span>
                    {item.meta}
                  </span>

                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {item.desc}
                  </p>
                </article>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  )
}