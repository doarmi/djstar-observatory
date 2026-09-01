import {
  useLayoutEffect,
} from 'react'

import gsap from 'gsap'
import {
  ScrollTrigger,
} from 'gsap/ScrollTrigger'
import {
  ScrollSmoother,
} from 'gsap/ScrollSmoother'

gsap.registerPlugin(
  ScrollTrigger,
  ScrollSmoother,
)

export default function ScrollMotion() {
  useLayoutEffect(() => {
    const reduced =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

    const desktopFinePointer =
      window.matchMedia(
        '(min-width: 769px) and (pointer: fine)',
      ).matches

    let smoother:
      | ScrollSmoother
      | null = null

    let restartFrame = 0
    let destroyed = false
    let restartingIntro = false

    /* =====================================================
       SCROLL SMOOTHER
    ===================================================== */

    if (
      !reduced &&
      desktopFinePointer
    ) {
      document.documentElement.classList.add(
        'smoother-active',
      )

      smoother =
        ScrollSmoother.create({
          wrapper:
            '#smooth-wrapper',

          content:
            '#smooth-content',

          smooth: 0.7,

          effects: true,

          normalizeScroll:
            false,
        })
    }

    /* =====================================================
       SECTION ANIMATIONS
    ===================================================== */

    const ctx = gsap.context(() => {
      if (reduced) {
        return
      }

      gsap.utils
        .toArray<HTMLElement>(
          '.programs-section, .mentoring-section, .visit-section, .news-section',
        )
        .forEach(
          section => {
            const targets =
              section.querySelectorAll<HTMLElement>(
                '.section-head, article, .preview-list, .visit-grid, .news-grid',
              )

            if (
              !targets.length
            ) {
              return
            }

            gsap.from(
              targets,
              {
                opacity: 0,
                y: 24,

                duration:
                  0.72,

                stagger:
                  0.065,

                ease:
                  'power2.out',

                scrollTrigger: {
                  trigger:
                    section,

                  start:
                    'top 84%',

                  once:
                    true,
                },
              },
            )
          },
        )
    })

    /* =====================================================
       INTRO RESTART COVER

       메인에서 다시 최상단으로 올라왔을 때
       토성 프레임을 거꾸로 통과하지 않도록
       Hero 화면 위에서 먼저 화면을 가린 뒤
       인트로 시작점으로 순간 이동한다.
    ===================================================== */

    const restartCover =
      document.createElement(
        'div',
      )

    restartCover.setAttribute(
      'aria-hidden',
      'true',
    )

    Object.assign(
      restartCover.style,
      {
        position: 'fixed',
        inset: '0',
        zIndex: '999999',
        background: '#02040a',
        opacity: '0',
        visibility: 'hidden',
        pointerEvents: 'none',
        transition:
          'opacity 140ms ease-out',
      },
    )

    document.body.appendChild(
      restartCover,
    )

    const showRestartCover = () => {
      restartCover.style.transition =
        'none'

      restartCover.style.visibility =
        'visible'

      restartCover.style.opacity =
        '1'
    }

    const hideRestartCover = () => {
      /*
       * 첫 인트로 프레임이 실제로 paint 된 뒤
       * 가림막을 제거한다.
       */
      restartCover.style.transition =
        'opacity 180ms ease-out'

      restartCover.style.opacity =
        '0'

      window.setTimeout(
        () => {
          if (
            !destroyed &&
            restartCover.style.opacity ===
            '0'
          ) {
            restartCover.style.visibility =
              'hidden'
          }
        },
        200,
      )
    }

    /* =====================================================
       MAIN TOP → INTRO 처음부터 다시 시작

       핵심:
       Intro의 onEnterBack에서 처리하지 않는다.

       사용자가 아래쪽 메인 콘텐츠에서 위로 올라와
       #main(Hero)의 상단에 도착하는 순간,
       아직 Intro 끝부분으로 들어가기 전에
       Intro 시작점으로 이동시킨다.

       따라서:
       메인 → 토성 역재생 → 첫 장면
       이 아니라

       메인 최상단 → 첫 장면
       으로 동작한다.
    ===================================================== */

    const restartIntroFromBeginning =
      () => {
        if (
          destroyed ||
          restartingIntro
        ) {
          return
        }

        const introTrigger =
          ScrollTrigger.getById(
            'djstar-scroll-scrub',
          )

        if (!introTrigger) {
          return
        }

        restartingIntro = true

        /*
         * Hero가 아직 화면에 있을 때 먼저 가린다.
         * 그래서 순간 이동 과정의 Saturn frame은
         * 사용자에게 보이지 않는다.
         */
        showRestartCover()

        /*
         * CSS 적용을 먼저 확정시킨다.
         */
        void restartCover.offsetHeight

        const target =
          Math.max(
            0,
            introTrigger.start + 1,
          )

        restartFrame =
          window.requestAnimationFrame(
            () => {
              if (destroyed) {
                return
              }

              if (smoother) {
                smoother.scrollTo(
                  target,
                  false,
                )
              } else {
                window.scrollTo({
                  top: target,
                  behavior: 'auto',
                })
              }

              ScrollTrigger.update()

              /*
               * 두 프레임을 기다려
               * ScrollTrigger progress 0과
               * canvas 첫 프레임이 화면에 확정되게 한다.
               */
              restartFrame =
                window.requestAnimationFrame(
                  () => {
                    ScrollTrigger.update()

                    restartFrame =
                      window.requestAnimationFrame(
                        () => {
                          ScrollTrigger.update()

                          hideRestartCover()

                          restartingIntro =
                            false
                        },
                      )
                  },
                )
            },
          )
      }

    /*
     * #main은 Hero 시작점이다.
     *
     * 아래에서 위로 올라와 Hero 상단이 viewport 상단에
     * 도달하는 순간 onLeaveBack이 실행된다.
     *
     * 이 시점은 아직 Intro의 마지막 Saturn 구간을
     * 화면에 보여주기 전이므로 여기서 restart한다.
     */
    let mainBoundaryTrigger:
      | ScrollTrigger
      | null = null

    const createMainBoundaryTrigger =
      () => {
        /*
         * BACK TO DJSTAR 복귀 점프 중에는
         * Hero 경계 trigger를 만들지 않는다.
         * 점프 도중 생성되면 onLeaveBack이 즉시 반응해
         * 사용자를 Intro 시작점으로 다시 끌고 갈 수 있다.
         */
        if (restartingIntro) {
          return
        }

        const main =
          document.querySelector(
            '#main',
          ) as HTMLElement | null

        if (!main) {
          return
        }

        mainBoundaryTrigger =
          ScrollTrigger.create({
            id:
              'djstar-main-intro-restart',

            trigger:
              main,

            start:
              'top top',

            /*
             * 아래로 처음 Intro를 끝내고 Hero로 들어올 때는
             * 아무 것도 하지 않는다.
             *
             * 메인 아래쪽에서 위로 돌아와 Hero의 시작점을
             * 다시 넘어가려는 순간에만 실행한다.
             */
            onLeaveBack: () => {
              restartIntroFromBeginning()
            },
          })
      }

    /*
     * ScrollScrubIntro가 pinSpacing을 만든 다음
     * #main의 실제 위치를 기준으로 trigger를 생성한다.
     */
    let boundaryRetry = 0

    const waitForIntroAndCreateBoundary =
      () => {
        if (destroyed) {
          return
        }

        const introTrigger =
          ScrollTrigger.getById(
            'djstar-scroll-scrub',
          )

        const main =
          document.querySelector(
            '#main',
          )

        if (
          introTrigger &&
          main
        ) {
          ScrollTrigger.refresh()

          restartFrame =
            window.requestAnimationFrame(
              () => {
                if (destroyed) {
                  return
                }

                createMainBoundaryTrigger()

                ScrollTrigger.refresh()
              },
            )

          return
        }

        boundaryRetry += 1

        if (
          boundaryRetry < 600
        ) {
          restartFrame =
            window.requestAnimationFrame(
              waitForIntroAndCreateBoundary,
            )
        }
      }

    if (!reduced) {
      restartFrame =
        window.requestAnimationFrame(
          waitForIntroAndCreateBoundary,
        )
    }

    /* =====================================================
       CLEANUP
    ===================================================== */

    return () => {
      destroyed = true


      if (restartFrame) {
        window.cancelAnimationFrame(
          restartFrame,
        )
      }

      mainBoundaryTrigger?.kill()

      restartCover.remove()

      ctx.revert()

      smoother?.kill()

      document.documentElement.classList.remove(
        'smoother-active',
      )
    }
  }, [])

  return null
}
