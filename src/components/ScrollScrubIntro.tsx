import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const TOTAL_FRAMES = 510
const MAX_DPR = 2

const INTRO_MESSAGES = [
  {
    eyebrow: 'LOOK CLOSER',
    text: '시선이 닿지 않던 곳까지',
    start: 0.05,
    peakStart: 0.09,
    peakEnd: 0.17,
    end: 0.22,
    position: 'leftCenter',
  },
  {
    eyebrow: 'BEYOND EARTH',
    text: '익숙한 궤도를 벗어나',
    start: 0.27,
    peakStart: 0.32,
    peakEnd: 0.43,
    end: 0.48,
    position: 'rightBottom',
  },
  {
    eyebrow: 'DEEPER INTO SPACE',
    text: '더 멀리, 더 깊게',
    start: 0.53,
    peakStart: 0.58,
    peakEnd: 0.69,
    end: 0.74,
    position: 'leftTop',
  },
  {
    eyebrow: 'SATURN',
    text: '관측의 시선이 머무는 곳',
    start: 0.79,
    peakStart: 0.84,
    peakEnd: 0.94,
    end: 0.985,
    position: 'rightCenter',
  },
] as const

const getFrameUrl = (index: number) => {
  const frameNumber = String(index + 1).padStart(4, '0')
  return `/scrub/frame_${frameNumber}.webp`
}

const PLANET_DETAILS = {
  mars: {
    number: '04',
    name: 'MARS',
    subtitle: 'THE RED PLANET',
    description:
      '붉은 표면과 거대한 화산이 펼쳐진 태양계의 네 번째 행성.',
    facts: [
      ['DISTANCE FROM SUN', '227.9M KM'],
      ['DAY LENGTH', '24H 37M'],
      ['MOONS', '2'],
    ],
  },
  jupiter: {
    number: '05',
    name: 'JUPITER',
    subtitle: 'THE GIANT PLANET',
    description:
      '거대한 대기와 대적점을 품은 태양계에서 가장 큰 행성.',
    facts: [
      ['DISTANCE FROM SUN', '778.5M KM'],
      ['DAY LENGTH', '9H 56M'],
      ['TYPE', 'GAS GIANT'],
    ],
  },
  saturn: {
    number: '06',
    name: 'SATURN',
    subtitle: 'THE RINGED PLANET',
    description:
      '수많은 얼음과 암석 조각이 만든 거대한 고리로 둘러싸인 가스 행성.',
    facts: [
      ['DISTANCE FROM SUN', '1.43B KM'],
      ['DAY LENGTH', '10H 42M'],
      ['TYPE', 'GAS GIANT'],
    ],
  },
} as const

export default function ScrollScrubIntro() {
  const containerRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const messageRefs = useRef<(HTMLDivElement | null)[]>([])
  const kineticRef = useRef<HTMLDivElement>(null)

  const currentFrameRef = useRef(0)

  const imagesRef = useRef<(HTMLImageElement | null)[]>(
    Array(TOTAL_FRAMES).fill(null),
  )

  const [loadedCount, setLoadedCount] = useState(0)
  const [firstFrameReady, setFirstFrameReady] = useState(false)
  const [selectedPlanet, setSelectedPlanet] = useState<'mars' | 'jupiter' | 'saturn' | null>(null)

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  /* =========================================================
     MESSAGE OPACITY
  ========================================================= */

  const updateMessages = (progress: number) => {
    INTRO_MESSAGES.forEach((message, index) => {
      const element = messageRefs.current[index]

      if (!element) return

      let opacity = 0

      if (
        progress >= message.start &&
        progress < message.peakStart
      ) {
        opacity =
          (progress - message.start) /
          (message.peakStart - message.start)
      } else if (
        progress >= message.peakStart &&
        progress <= message.peakEnd
      ) {
        opacity = 1
      } else if (
        progress > message.peakEnd &&
        progress <= message.end
      ) {
        opacity =
          1 -
          (progress - message.peakEnd) /
          (message.end - message.peakEnd)
      }

      opacity = Math.max(
        0,
        Math.min(1, opacity),
      )

      const translateY = (1 - opacity) * 18

      element.style.opacity = String(opacity)

      /*
       * 중앙 배치 메시지는 -50% 기준을 유지하면서
       * 페이드 인 시 살짝 아래에서 올라옴
       */
      if (
        message.position === 'leftCenter' ||
        message.position === 'rightCenter'
      ) {
        element.style.transform =
          `translate3d(0, calc(-50% + ${translateY}px), 0)`
      } else {
        element.style.transform =
          `translate3d(0, ${translateY}px, 0)`
      }

      element.style.visibility =
        opacity > 0.01
          ? 'visible'
          : 'hidden'
    })
  }

  /* =========================================================
     KINETIC TYPOGRAPHY / HUD
  ========================================================= */

  const updateKineticLayer = (progress: number) => {
    const root = kineticRef.current
    if (!root) return

    const items = root.querySelectorAll<HTMLElement>('[data-kinetic]')

    items.forEach(item => {
      const start = Number(item.dataset.start ?? 0)
      const end = Number(item.dataset.end ?? 1)
      const direction = Number(item.dataset.direction ?? 1)

      const local = Math.max(
        0,
        Math.min(1, (progress - start) / Math.max(end - start, 0.0001)),
      )

      const visible = progress >= start && progress <= end
      const edgeFade = Math.min(local / 0.14, (1 - local) / 0.14, 1)
      const opacity = visible ? Math.max(0, edgeFade) : 0

      const travel = (local - 0.5) * 34 * direction

      item.style.opacity = String(opacity)
      item.style.transform = `translate3d(${travel}vw, 0, 0)`
      item.style.visibility = opacity > 0.01 ? 'visible' : 'hidden'
    })
  }

  /* =========================================================
     IMMERSIVE OVERLAY / PROGRESS / RETICLE
  ========================================================= */

  const updateImmersiveLayer = (progress: number) => {
    const root = kineticRef.current
    if (!root) return

    const section = containerRef.current
    if (section) {
      section.style.setProperty('--scrub-progress', String(progress))
    }

    const frame = MathUtilsClampFrame(
      Math.round(progress * (TOTAL_FRAMES - 1)),
    )

    const frameLabel = root.querySelector<HTMLElement>('[data-frame-label]')
    if (frameLabel) {
      frameLabel.textContent =
        `FRAME ${String(frame + 1).padStart(3, '0')} / ${TOTAL_FRAMES}`
    }

    const stageLabel = root.querySelector<HTMLElement>('[data-stage-label]')
    if (stageLabel) {
      const stage =
        progress < 0.18
          ? 'OPTICAL APPROACH'
          : progress < 0.31
            ? 'EYEPIECE ENTRY'
            : progress < 0.48
              ? 'EARTH DEPARTURE'
              : progress < 0.72
                ? 'PLANETARY PASS'
                : progress < 0.90
                  ? 'SATURN APPROACH'
                  : 'OBSERVATION READY'

      stageLabel.textContent = stage
    }

    const progressFill = root.querySelector<HTMLElement>('[data-progress-fill]')
    if (progressFill) {
      progressFill.style.transform = `scaleY(${Math.max(0.015, progress)})`
    }

    const scanline = root.querySelector<HTMLElement>('[data-scanline]')
    if (scanline) {
      scanline.style.transform =
        `translate3d(0, ${(-12 + progress * 124).toFixed(2)}vh, 0)`
      scanline.style.opacity =
        String(0.12 + Math.sin(progress * Math.PI * 8) * 0.035)
    }

    const reticle = root.querySelector<HTMLElement>('[data-reticle]')
    if (reticle) {
      const a = Math.max(0, Math.min(1, (progress - 0.08) / 0.055))
      const b = Math.max(0, Math.min(1, (0.31 - progress) / 0.075))
      const visibility = Math.min(a, b)

      reticle.style.opacity = String(visibility * 0.72)
      reticle.style.transform =
        `translate(-50%, -50%) scale(${(1.18 - progress * 0.55).toFixed(3)}) rotate(${(progress * 36).toFixed(2)}deg)`
    }

    const dust = root.querySelector<HTMLElement>('[data-space-dust]')
    if (dust) {
      const inSpace = Math.max(0, Math.min(1, (progress - 0.30) / 0.10))
      const lateFade = Math.max(0, Math.min(1, (0.93 - progress) / 0.08))
      dust.style.opacity = String(inSpace * lateFade * 0.72)
      dust.style.transform =
        `translate3d(${((progress - 0.5) * -5).toFixed(2)}vw, ${((progress - 0.5) * 4).toFixed(2)}vh, 0)`
    }

    const pulse = root.querySelector<HTMLElement>('[data-pulse]')
    if (pulse) {
      const points = [0.285, 0.47, 0.585, 0.72, 0.82]
      let strength = 0

      points.forEach(point => {
        const distance = Math.abs(progress - point)
        strength = Math.max(strength, Math.max(0, 1 - distance / 0.018))
      })

      pulse.style.opacity = String(strength * 0.28)
      pulse.style.transform =
        `translate(-50%, -50%) scale(${(0.88 + strength * 0.55).toFixed(3)})`
    }
  }

  /* =========================================================
     DRAW FRAME
  ========================================================= */

  const drawFrame = (frameIndex: number) => {
    const canvas = canvasRef.current

    if (!canvas) return

    const ctx = canvas.getContext('2d')

    if (!ctx) return

    const image = imagesRef.current[frameIndex]

    if (
      !image ||
      !image.complete ||
      image.naturalWidth === 0 ||
      image.naturalHeight === 0
    ) {
      return
    }

    const dpr = Math.min(
      window.devicePixelRatio || 1,
      MAX_DPR,
    )

    const canvasWidth = canvas.width / dpr
    const canvasHeight = canvas.height / dpr

    const imageWidth = image.naturalWidth
    const imageHeight = image.naturalHeight

    /*
     * contain 방식
     * 원본 16:9 프레임 전체 구도 유지
     */
    const scale = Math.min(
      canvasWidth / imageWidth,
      canvasHeight / imageHeight,
    )

    const drawWidth = imageWidth * scale
    const drawHeight = imageHeight * scale

    const x = (canvasWidth - drawWidth) / 2
    const y = (canvasHeight - drawHeight) / 2

    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0,
    )

    ctx.clearRect(
      0,
      0,
      canvasWidth,
      canvasHeight,
    )

    /*
     * 화면 비율이 16:9가 아닐 경우
     * 남는 공간을 우주 배경색으로 처리
     */
    ctx.fillStyle = '#02040a'

    ctx.fillRect(
      0,
      0,
      canvasWidth,
      canvasHeight,
    )

    ctx.drawImage(
      image,
      0,
      0,
      imageWidth,
      imageHeight,
      x,
      y,
      drawWidth,
      drawHeight,
    )
  }

  /* =========================================================
     CANVAS RESIZE
  ========================================================= */

  const resizeCanvas = () => {
    const canvas = canvasRef.current

    if (!canvas) return

    const dpr = Math.min(
      window.devicePixelRatio || 1,
      MAX_DPR,
    )

    const width = window.innerWidth
    const height = window.innerHeight

    canvas.width = Math.round(
      width * dpr,
    )

    canvas.height = Math.round(
      height * dpr,
    )

    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    drawFrame(
      currentFrameRef.current,
    )
  }

  /* =========================================================
     IMAGE PRELOAD
  ========================================================= */

  useEffect(() => {
    if (prefersReduced) return

    let cancelled = false

    for (
      let i = 0;
      i < TOTAL_FRAMES;
      i++
    ) {
      const image = new Image()

      image.src = getFrameUrl(i)

      image.onload = () => {
        if (cancelled) return

        imagesRef.current[i] = image

        setLoadedCount(
          count => count + 1,
        )

        if (i === 0) {
          setFirstFrameReady(true)

          requestAnimationFrame(() => {
            resizeCanvas()
            drawFrame(0)
          })
        }

        if (
          i === currentFrameRef.current
        ) {
          requestAnimationFrame(() => {
            drawFrame(i)
          })
        }
      }

      image.onerror = () => {
        if (cancelled) return

        console.warn(
          `[ScrollScrubIntro] Failed to load frame: ${getFrameUrl(i)}`,
        )
      }
    }

    return () => {
      cancelled = true
    }
  }, [prefersReduced])

  /* =========================================================
     RESIZE LISTENER
  ========================================================= */

  useEffect(() => {
    if (prefersReduced) return

    resizeCanvas()

    window.addEventListener(
      'resize',
      resizeCanvas,
    )

    return () => {
      window.removeEventListener(
        'resize',
        resizeCanvas,
      )
    }
  }, [prefersReduced])

  /* =========================================================
     GSAP SCROLL SCRUB
  ========================================================= */

  useEffect(() => {
    if (prefersReduced) return
    if (!firstFrameReady) return

    const container =
      containerRef.current

    if (!container) return

    const playhead = {
      frame: 0,
    }

    const ctx = gsap.context(() => {
      const tween = gsap.to(
        playhead,
        {
          frame: TOTAL_FRAMES - 1,

          ease: 'none',

          snap: {
            frame: 1,
          },

          onUpdate: () => {
            const frame =
              MathUtilsClampFrame(
                Math.round(
                  playhead.frame,
                ),
              )

            if (
              frame ===
              currentFrameRef.current &&
              frame !== 0
            ) {
              return
            }

            currentFrameRef.current =
              frame

            drawFrame(frame)
          },

          scrollTrigger: {
            id: 'djstar-scroll-scrub',

            trigger: container,

            start: 'top top',

            /*
             * 현재 확정한 스크럽 속도
             */
            end: () =>
              `+=${Math.max(
                window.innerHeight * 11,
                11200,
              )}`,

            scrub: 0.15,

            pin: true,

            pinSpacing: true,

            anticipatePin: 1,

            invalidateOnRefresh: true,

            onEnter: () => {
              drawFrame(
                currentFrameRef.current,
              )

              updateMessages(0)
              updateKineticLayer(0)
              updateImmersiveLayer(0)
            },

            onUpdate: self => {
              const progress =
                self.progress

              const frame =
                MathUtilsClampFrame(
                  Math.round(
                    progress *
                    (TOTAL_FRAMES - 1),
                  ),
                )

              playhead.frame = frame

              currentFrameRef.current =
                frame

              drawFrame(frame)

              updateMessages(
                progress,
              )

              updateKineticLayer(
                progress,
              )

              updateImmersiveLayer(
                progress,
              )
            },

            onLeave: () => {
              currentFrameRef.current =
                TOTAL_FRAMES - 1

              drawFrame(
                TOTAL_FRAMES - 1,
              )

              updateMessages(1)
              updateKineticLayer(1)
              updateImmersiveLayer(1)
            },

            onEnterBack: self => {
              drawFrame(
                currentFrameRef.current,
              )

              updateMessages(
                self.progress,
              )

              updateKineticLayer(
                self.progress,
              )

              updateImmersiveLayer(
                self.progress,
              )
            },

            onLeaveBack: () => {
              currentFrameRef.current =
                0

              drawFrame(0)

              updateMessages(0)
              updateKineticLayer(0)
              updateImmersiveLayer(0)
            },
          },
        },
      )

      return () => {
        tween.scrollTrigger?.kill()
        tween.kill()
      }
    }, container)

    const refreshId =
      requestAnimationFrame(() => {
        ScrollTrigger.refresh()
      })

    return () => {
      cancelAnimationFrame(
        refreshId,
      )

      ctx.revert()
    }
  }, [
    prefersReduced,
    firstFrameReady,
  ])

  /* =========================================================
     PLANET DETAIL DRAWER — SCROLL LOCK
  ========================================================= */

  useEffect(() => {
    if (!selectedPlanet) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [selectedPlanet])

  /* =========================================================
     REDUCED MOTION
  ========================================================= */

  if (prefersReduced) {
    return (
      <section
        className="scroll-scrub-intro"
        aria-label="대전시민천문대 우주 관측 인트로"
      >
        <img
          src={getFrameUrl(0)}
          alt="대전시민천문대의 천체망원경"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            background: '#02040a',
            display: 'block',
          }}
        />
      </section>
    )
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <section
      ref={containerRef}
      className="scroll-scrub-intro"
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#02040a',
      }}
    >
      <canvas
        ref={canvasRef}
        className="scroll-scrub-canvas"
      />

      {/* =====================================================
          CINEMATIC COPY
      ====================================================== */}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 5,
          pointerEvents: 'none',
        }}
      >
        {INTRO_MESSAGES.map(
          (message, index) => (
            <div
              key={message.eyebrow}
              ref={element => {
                messageRefs.current[
                  index
                ] = element
              }}
              style={{
                position: 'absolute',

                ...getMessagePosition(
                  message.position,
                ),

                opacity: 0,

                visibility:
                  'hidden',

                willChange:
                  'opacity, transform',

                textShadow:
                  '0 2px 24px rgba(0,0,0,0.75)',
              }}
            >
              <div
                style={{
                  marginBottom:
                    '14px',

                  fontSize:
                    'clamp(11px, 0.8vw, 14px)',

                  fontWeight: 600,

                  letterSpacing:
                    '0.24em',

                  color:
                    'rgba(255,255,255,0.62)',
                }}
              >
                {message.eyebrow}
              </div>

              <div
                style={{
                  fontSize:
                    'clamp(26px, 3vw, 48px)',

                  fontWeight: 500,

                  lineHeight: 1.2,

                  letterSpacing:
                    '-0.035em',

                  color: '#ffffff',

                  whiteSpace:
                    'nowrap',
                }}
              >
                {message.text}
              </div>

              <div
                style={{
                  width: '38px',
                  height: '1px',

                  marginTop:
                    '22px',

                  marginLeft:
                    message.position ===
                      'rightBottom' ||
                      message.position ===
                      'rightCenter'
                      ? 'auto'
                      : 0,

                  background:
                    'rgba(255,255,255,0.45)',
                }}
              />
            </div>
          ),
        )}
      </div>

      {/* =====================================================
          KINETIC TYPOGRAPHY / OBSERVATION HUD
      ====================================================== */}

      <div
        ref={kineticRef}
        className="scrub-kinetic"
        aria-hidden="true"
      >
        {/* ambient cinematic overlay */}
        <div className="scrub-fx__vignette" />
        <div className="scrub-fx__grain" />
        <div className="scrub-fx__grid" />

        <div
          className="scrub-fx__scanline"
          data-scanline
        />

        <div
          className="scrub-fx__reticle"
          data-reticle
        >
          <span className="scrub-fx__reticle-ring scrub-fx__reticle-ring--outer" />
          <span className="scrub-fx__reticle-ring scrub-fx__reticle-ring--inner" />
          <span className="scrub-fx__reticle-cross scrub-fx__reticle-cross--h" />
          <span className="scrub-fx__reticle-cross scrub-fx__reticle-cross--v" />
          <span className="scrub-fx__reticle-dot" />
        </div>

        <div
          className="scrub-fx__pulse"
          data-pulse
        />

        <div
          className="scrub-fx__dust"
          data-space-dust
        >
          {Array.from({ length: 28 }).map((_, index) => (
            <i
              key={index}
              style={{
                left: `${(index * 37) % 101}%`,
                top: `${(index * 61 + 17) % 97}%`,
                width: `${1 + (index % 3)}px`,
                height: `${1 + (index % 3)}px`,
                animationDelay: `${-(index % 9) * 0.37}s`,
                animationDuration: `${3.4 + (index % 6) * 0.48}s`,
              }}
            />
          ))}
        </div>

        <div className="scrub-fx__top-status">
          <span className="scrub-fx__live-dot" />
          <span>DJSTAR / LIVE OPTICAL FEED</span>
          <span className="scrub-fx__status-divider" />
          <span data-stage-label>OPTICAL APPROACH</span>
        </div>

        <div className="scrub-fx__side-index">
          <span>OBSERVATION SEQUENCE</span>
          <strong data-frame-label>FRAME 001 / 510</strong>
        </div>

        <div className="scrub-fx__progress">
          <span>00</span>
          <div className="scrub-fx__progress-track">
            <i data-progress-fill />
          </div>
          <span>100</span>
        </div>

        <div className="scrub-fx__corner scrub-fx__corner--tl" />
        <div className="scrub-fx__corner scrub-fx__corner--tr" />
        <div className="scrub-fx__corner scrub-fx__corner--bl" />
        <div className="scrub-fx__corner scrub-fx__corner--br" />

        <div
          className="scrub-kinetic__coords"
          data-kinetic
          data-start="0.015"
          data-end="0.105"
          data-direction="1"
        >
          <span>DAEJEON OBSERVATORY</span>
          <span>36°23′N · 127°22′E</span>
          <i />
          <span>BEGIN OBSERVATION</span>
        </div>

        <div
          className="scrub-kinetic__mega scrub-kinetic__mega--lens"
          data-kinetic
          data-start="0.17"
          data-end="0.31"
          data-direction="1"
        >
          BEYOND THE LENS
        </div>

        <div
          className="scrub-kinetic__route"
          data-kinetic
          data-start="0.34"
          data-end="0.48"
          data-direction="-1"
        >
          <span>01 / DEPARTURE</span>
          <i />
          <span>EARTH ORBIT</span>
          <i />
          <span>SOL SYSTEM</span>
        </div>

        <div
          className="scrub-kinetic__planet scrub-kinetic__planet--mars"
          data-kinetic
          data-start="0.46"
          data-end="0.57"
          data-direction="1"
        >
          <div className="scrub-planet-copy">
            <strong>MARS</strong>
            <span>04 · TERRESTRIAL PLANET</span>
            <p>붉은 표면과 거대한 화산이 펼쳐진<br />태양계의 네 번째 행성.</p>
            <button
              type="button"
              className="scrub-explore-btn"
              onClick={() => setSelectedPlanet('mars')}
            >
              <span>EXPLORE MARS</span>
              <i>↗</i>
            </button>
          </div>
        </div>

        <div
          className="scrub-kinetic__planet scrub-kinetic__planet--jupiter"
          data-kinetic
          data-start="0.57"
          data-end="0.69"
          data-direction="-1"
        >
          <div className="scrub-planet-copy">
            <strong>JUPITER</strong>
            <span>05 · GAS GIANT</span>
            <p>거대한 대기와 대적점을 품은<br />태양계에서 가장 큰 행성.</p>
            <button
              type="button"
              className="scrub-explore-btn"
              onClick={() => setSelectedPlanet('jupiter')}
            >
              <span>EXPLORE JUPITER</span>
              <i>↗</i>
            </button>
          </div>
        </div>

        <div
          className="scrub-kinetic__mega scrub-kinetic__mega--saturn"
          data-kinetic
          data-start="0.73"
          data-end="0.91"
          data-direction="1"
        >
          SATURN
        </div>

        <div
          className="scrub-kinetic__route scrub-kinetic__route--saturn"
          data-kinetic
          data-start="0.76"
          data-end="0.92"
          data-direction="-1"
        >
          <span>RING SYSTEM</span>
          <i />
          <span>GAS GIANT</span>
          <i />
          <span>6TH PLANET</span>
        </div>

        <div
          className="scrub-kinetic__aside scrub-kinetic__aside--focus"
          data-kinetic
          data-start="0.095"
          data-end="0.175"
          data-direction="-1"
        >
          <span>FOCUS LOCKED</span>
          <strong>빛을 따라<br />시선을 더 가까이.</strong>
        </div>

        <div
          className="scrub-kinetic__ticker"
          data-kinetic
          data-start="0.245"
          data-end="0.355"
          data-direction="-1"
        >
          THROUGH THE EYEPIECE · THROUGH THE EYEPIECE · THROUGH THE EYEPIECE
        </div>

        <div
          className="scrub-kinetic__aside scrub-kinetic__aside--departure"
          data-kinetic
          data-start="0.305"
          data-end="0.405"
          data-direction="1"
        >
          <span>LEAVE THE BLUE</span>
          <strong>렌즈 너머<br />익숙한 세계가 멀어진다.</strong>
        </div>

        <div
          className="scrub-kinetic__micro scrub-kinetic__micro--mars"
          data-kinetic
          data-start="0.475"
          data-end="0.545"
          data-direction="-1"
        >
          PASSING 04 / 붉은 행성을 지나
        </div>

        <div
          className="scrub-kinetic__micro scrub-kinetic__micro--scale"
          data-kinetic
          data-start="0.655"
          data-end="0.735"
          data-direction="1"
        >
          DISTANCE BECOMES SCALE / 거리는 숫자가 되고 우주는 깊이가 된다
        </div>

        <div
          className="scrub-planet-feature scrub-planet-feature--saturn"
          data-kinetic
          data-start="0.785"
          data-end="0.915"
          data-direction="-1"
        >
          <span>06 · RINGED GIANT</span>
          <p>
            수많은 얼음과 암석 조각이 만든<br />
            거대한 고리로 둘러싸인 행성.
          </p>
          <button
            type="button"
            className="scrub-explore-btn"
            onClick={() => setSelectedPlanet('saturn')}
          >
            <span>EXPLORE SATURN</span>
            <i>↗</i>
          </button>
        </div>

        <div
          className="scrub-kinetic__ticker scrub-kinetic__ticker--rings"
          data-kinetic
          data-start="0.845"
          data-end="0.945"
          data-direction="1"
        >
          RINGS IN SIGHT · CASSINI DIVISION · RINGS IN SIGHT · CASSINI DIVISION
        </div>

        <div
          className="scrub-kinetic__aside scrub-kinetic__aside--arrival"
          data-kinetic
          data-start="0.875"
          data-end="0.955"
          data-direction="-1"
        >
          <span>ARRIVAL / 06</span>
          <strong>마침내<br />고리의 세계 앞에.</strong>
        </div>

        <div
          className="scrub-kinetic__final"
          data-kinetic
          data-start="0.925"
          data-end="0.995"
          data-direction="1"
        >
          <span>YOUR JOURNEY BEGINS HERE</span>
          <strong>DJSTAR</strong>
        </div>
      </div>

      {/* =====================================================
          PLANET DETAIL DRAWER
      ====================================================== */}

      {selectedPlanet && (
        <div
          className="scrub-planet-overlay"
          role="presentation"
          onClick={() => setSelectedPlanet(null)}
        >
          <aside
            className={`scrub-planet-drawer scrub-planet-drawer--${selectedPlanet}`}
            role="dialog"
            aria-modal="true"
            aria-label={`${PLANET_DETAILS[selectedPlanet].name} 소개`}
            onClick={event => event.stopPropagation()}
          >
            <div className="scrub-planet-drawer__top">
              <span>
                DJSTAR · OBJECT {PLANET_DETAILS[selectedPlanet].number}
              </span>

              <button
                type="button"
                className="scrub-planet-drawer__close"
                onClick={() => setSelectedPlanet(null)}
                aria-label="소개창 닫기"
              >
                CLOSE <i>×</i>
              </button>
            </div>

            <div className="scrub-planet-drawer__index">
              {PLANET_DETAILS[selectedPlanet].number}
            </div>

            <div className="scrub-planet-drawer__content">
              <span className="scrub-planet-drawer__subtitle">
                {PLANET_DETAILS[selectedPlanet].subtitle}
              </span>

              <h2>{PLANET_DETAILS[selectedPlanet].name}</h2>

              <p className="scrub-planet-drawer__description">
                {PLANET_DETAILS[selectedPlanet].description}
              </p>

              <div className="scrub-planet-drawer__rule" />

              <div className="scrub-planet-drawer__facts">
                {PLANET_DETAILS[selectedPlanet].facts.map(([label, value]) => (
                  <div
                    className="scrub-planet-drawer__fact"
                    key={label}
                  >
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>

              <div className="scrub-planet-drawer__visual">
                <div className="scrub-orbit-data">
                  <span className="scrub-orbit-data__ring scrub-orbit-data__ring--1" />
                  <span className="scrub-orbit-data__ring scrub-orbit-data__ring--2" />
                  <span className="scrub-orbit-data__ring scrub-orbit-data__ring--3" />
                  <span className="scrub-orbit-data__axis scrub-orbit-data__axis--h" />
                  <span className="scrub-orbit-data__axis scrub-orbit-data__axis--v" />
                  <span className="scrub-orbit-data__center" />
                  <span className="scrub-orbit-data__satellite">
                    <i />
                  </span>

                  <div className="scrub-orbit-data__label">
                    <span>{PLANET_DETAILS[selectedPlanet].number}</span>
                    <strong>ORBIT DATA</strong>
                  </div>
                </div>

                <div className="scrub-planet-drawer__meta">
                  <div>
                    <span>CLASS</span>
                    <strong>
                      {selectedPlanet === 'mars'
                        ? 'TERRESTRIAL'
                        : selectedPlanet === 'saturn'
                          ? 'RINGED GIANT'
                          : 'GAS GIANT'}
                    </strong>
                  </div>
                  <div>
                    <span>SYSTEM</span>
                    <strong>SOL</strong>
                  </div>
                  <div>
                    <span>OBJECT</span>
                    <strong>{PLANET_DETAILS[selectedPlanet].number}</strong>
                  </div>
                </div>
              </div>

              <div className="scrub-planet-drawer__footer">
                <span>DAEJEON CITIZEN OBSERVATORY</span>

                <button
                  type="button"
                  onClick={() => setSelectedPlanet(null)}
                >
                  CLOSE &amp; CONTINUE JOURNEY <i>→</i>
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* =====================================================
          LOADING
      ====================================================== */}

      {!firstFrameReady && (
        <div className="scroll-scrub-loading">
          <div className="loading-text">
            관측 준비 중
          </div>

          <div className="loading-perc">
            {Math.round(
              (loadedCount /
                TOTAL_FRAMES) *
              100,
            )}
            %
          </div>
        </div>
      )}
    </section>
  )
}

/* =========================================================
   MESSAGE POSITION
========================================================= */

function getMessagePosition(
  position:
    | 'leftCenter'
    | 'rightBottom'
    | 'leftTop'
    | 'rightCenter',
) {
  const side =
    'clamp(28px, 7vw, 120px)'

  switch (position) {
    case 'leftCenter':
      return {
        left: side,
        top: '50%',
        transform:
          'translateY(-50%)',
        textAlign:
          'left' as const,
      }

    case 'rightBottom':
      return {
        right: side,
        bottom:
          'clamp(60px, 12vh, 150px)',
        textAlign:
          'right' as const,
      }

    case 'leftTop':
      return {
        left: side,
        top:
          'clamp(90px, 15vh, 170px)',
        textAlign:
          'left' as const,
      }

    case 'rightCenter':
      return {
        right: side,
        top: '50%',
        transform:
          'translateY(-50%)',
        textAlign:
          'right' as const,
      }
  }
}

/* =========================================================
   FRAME INDEX SAFETY
========================================================= */

function MathUtilsClampFrame(
  frame: number,
) {
  return Math.max(
    0,
    Math.min(
      TOTAL_FRAMES - 1,
      frame,
    ),
  )
}