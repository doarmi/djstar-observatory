import {
  useLayoutEffect,
  useRef,
} from 'react'

import {
  Canvas,
  useFrame,
} from '@react-three/fiber'

import * as THREE from 'three'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import {
  navigateTo,
} from '../lib/navigation'

gsap.registerPlugin(ScrollTrigger)

const journey = [
  {
    number: '01',
    label: 'OBSERVE',
    title: '천체 관측',
    description:
      '망원경과 관측 장비를 통해 실제 천체를 바라보고 관측의 기본을 경험합니다.',
  },
  {
    number: '02',
    label: 'ANALYZE',
    title: '데이터 이해',
    description:
      '관측 결과와 천문 데이터를 읽으며 천문학자가 우주를 분석하는 방식을 알아봅니다.',
  },
  {
    number: '03',
    label: 'EXPLORE',
    title: '진로 탐색',
    description:
      '천문학 천체물리학 우주과학과 관련된 전공과 직업의 실제 모습을 살펴봅니다.',
  },
  {
    number: '04',
    label: 'MENTOR',
    title: '현업 멘토링',
    description:
      '천문대 현업 종사자와 직접 이야기하며 진학과 진로에 대한 궁금증을 해결합니다.',
  },
]

const topics = [
  '천문학과에서는 무엇을 배우나요?',
  '천문대에서는 어떤 일을 하나요?',
  '천문학자가 되려면 무엇을 준비해야 하나요?',
]


function MentorDataObject() {
  const rootRef =
    useRef<THREE.Group>(null)

  const innerRef =
    useRef<THREE.Group>(null)

  const pointOneRef =
    useRef<THREE.Mesh>(null)

  const pointTwoRef =
    useRef<THREE.Mesh>(null)

  useFrame(
    (
      state,
      delta,
    ) => {
      const root =
        rootRef.current

      const inner =
        innerRef.current

      if (
        !root ||
        !inner
      ) {
        return
      }

      root.rotation.y +=
        delta * 0.12

      root.rotation.x =
        THREE.MathUtils.lerp(
          root.rotation.x,
          state.pointer.y * 0.08,
          0.035,
        )

      root.rotation.z =
        THREE.MathUtils.lerp(
          root.rotation.z,
          -state.pointer.x * 0.07,
          0.035,
        )

      inner.rotation.x -=
        delta * 0.07

      inner.rotation.z +=
        delta * 0.09

      const t =
        state.clock.elapsedTime

      if (
        pointOneRef.current
      ) {
        pointOneRef.current.position.set(
          Math.cos(t * 0.55) * 1.72,
          Math.sin(t * 0.55) * 0.72,
          Math.sin(t * 0.55) * 1.05,
        )
      }

      if (
        pointTwoRef.current
      ) {
        pointTwoRef.current.position.set(
          Math.cos(
            t * 0.42 + 2.2,
          ) * 1.35,
          Math.sin(
            t * 0.42 + 2.2,
          ) * 1.28,
          Math.cos(
            t * 0.42 + 2.2,
          ) * 0.62,
        )
      }
    },
  )

  return (
    <group
      ref={rootRef}
      rotation={[
        -0.16,
        0.32,
        -0.08,
      ]}
    >
      <group ref={innerRef}>
        <mesh>
          <icosahedronGeometry
            args={[
              0.9,
              2,
            ]}
          />

          <meshBasicMaterial
            color="#9db8ff"
            wireframe
            transparent
            opacity={0.34}
          />
        </mesh>

        <mesh>
          <sphereGeometry
            args={[
              0.58,
              48,
              48,
            ]}
          />

          <meshBasicMaterial
            color="#4f6fac"
            transparent
            opacity={0.09}
          />
        </mesh>

        <mesh
          rotation={[
            Math.PI / 2,
            0,
            0,
          ]}
        >
          <torusGeometry
            args={[
              1.5,
              0.008,
              12,
              160,
            ]}
          />

          <meshBasicMaterial
            color="#7898df"
            transparent
            opacity={0.34}
          />
        </mesh>

        <mesh
          rotation={[
            0.74,
            0.2,
            0.46,
          ]}
        >
          <torusGeometry
            args={[
              1.72,
              0.008,
              12,
              160,
            ]}
          />

          <meshBasicMaterial
            color="#607fc8"
            transparent
            opacity={0.26}
          />
        </mesh>

        <mesh
          rotation={[
            -0.46,
            0.82,
            0.16,
          ]}
        >
          <torusGeometry
            args={[
              1.34,
              0.007,
              12,
              160,
            ]}
          />

          <meshBasicMaterial
            color="#b5c9ff"
            transparent
            opacity={0.18}
          />
        </mesh>
      </group>

      <mesh ref={pointOneRef}>
        <sphereGeometry
          args={[
            0.045,
            18,
            18,
          ]}
        />

        <meshBasicMaterial
          color="#f4f7ff"
        />
      </mesh>

      <mesh ref={pointTwoRef}>
        <sphereGeometry
          args={[
            0.036,
            18,
            18,
          ]}
        />

        <meshBasicMaterial
          color="#a9c6ff"
        />
      </mesh>

      <mesh>
        <sphereGeometry
          args={[
            0.11,
            24,
            24,
          ]}
        />

        <meshBasicMaterial
          color="#edf3ff"
          transparent
          opacity={0.95}
        />
      </mesh>
    </group>
  )
}

export default function AstroMentoring() {
  const sectionRef =
    useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const section =
      sectionRef.current

    if (!section) return

    if (
      window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
    ) {
      return
    }

    const ctx =
      gsap.context(() => {
        const tl =
          gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: 'top 72%',
              once: true,
            },
            defaults: {
              ease: 'power3.out',
            },
          })

        tl.from(
          '.mentoring-kicker',
          {
            opacity: 0,
            y: 14,
            duration: 0.45,
          },
        )
          .from(
            '.mentoring-title',
            {
              opacity: 0,
              y: 34,
              duration: 0.75,
            },
            '-=0.2',
          )
          .from(
            '.mentoring-lead',
            {
              opacity: 0,
              y: 20,
              duration: 0.55,
            },
            '-=0.42',
          )
          .from(
            '.mentoring-journey-card',
            {
              opacity: 0,
              y: 30,
              duration: 0.65,
              stagger: 0.09,
            },
            '-=0.24',
          )
          .from(
            '.mentoring-dashboard',
            {
              opacity: 0,
              x: 36,
              duration: 0.8,
            },
            '-=0.56',
          )
          .from(
            '.mentor-topic',
            {
              opacity: 0,
              x: 18,
              duration: 0.45,
              stagger: 0.07,
            },
            '-=0.4',
          )

      }, section)

    return () =>
      ctx.revert()
  }, [])

  const openMentoring = (
    route: string,
  ) => {

    navigateTo(route)
  }

  const openTopic = () => {
    openMentoring(
      '/mentoring',
    )
  }

  return (
    <section
      className="mentoring-section"
      id="astro-mentoring"
      ref={sectionRef}
    >
      <div className="container">
        <div className="mentoring-shell">
          {/* HEADER */}

          <div className="mentoring-header">
            <div>
              <p className="section-kicker mentoring-kicker">
                ASTRO MENTORING · CAREER LAB
              </p>

              <h2 className="mentoring-title">
                우주를 바라보는 경험에서
                <br />
                미래를 발견하는 순간까지
              </h2>
            </div>

            <p className="mentoring-lead">
              관측과 데이터 분석을 경험하고
              <br />
              천문대 현업 종사자와 이야기를 나누며
              <br />
              천문·우주 분야의 진로를
              구체적으로 탐색합니다.
            </p>
          </div>

          {/* MAIN */}

          <div className="mentoring-main">
            {/* LEFT */}

            <div className="mentoring-journey">
              <div className="mentoring-journey-head">
                <span>
                  CAREER JOURNEY
                </span>

                <small>
                  04 STEPS
                </small>
              </div>

              <div className="mentoring-journey-grid">
                {journey.map(
                  item => (
                    <article
                      className="mentoring-journey-card"
                      key={item.number}
                    >
                      <div className="mentor-step-top">
                        <span>
                          {item.number}
                        </span>

                        <small>
                          {item.label}
                        </small>
                      </div>

                      <div className="mentor-step-line">
                        <span />
                      </div>

                      <h3>
                        {item.title}
                      </h3>

                      <p>
                        {
                          item.description
                        }
                      </p>
                    </article>
                  ),
                )}
              </div>
            </div>

            {/* RIGHT */}

            <aside className="mentoring-dashboard">
              <div className="mentor-dashboard-top">
                <div>
                  <span>
                    CURRENT MENTOR SESSION
                  </span>

                  <strong>
                    ASTRONOMY
                    <br />
                    CAREER MENTOR
                  </strong>
                </div>

                <button
                  type="button"
                  className="mentor-status"
                  onClick={() =>
                    openMentoring(
                      '/mentoring',
                    )
                  }
                  aria-label="현재 멘토링 자세히 보기"
                >
                  OPEN
                </button>
              </div>

              {/* 3D MENTOR DATA OBJECT */}

              <div
                className="mentor-orbit-visual mentor-3d-visual"
                aria-hidden="true"
              >
                <div className="mentor-3d-grid" />

                <Canvas
                  className="mentor-3d-canvas"
                  camera={{
                    position: [
                      0,
                      0,
                      4.8,
                    ],
                    fov: 38,
                  }}
                  dpr={[
                    1,
                    1.5,
                  ]}
                  gl={{
                    alpha: true,
                    antialias: true,
                  }}
                >
                  <MentorDataObject />
                </Canvas>

                <div className="mentor-3d-core-label">
                  <span>
                    MENTOR
                  </span>

                  <small>
                    DJSTAR
                  </small>
                </div>

                <span className="mentor-field mentor-field--one">
                  OBSERVATION
                </span>

                <span className="mentor-field mentor-field--two">
                  ASTROPHYSICS
                </span>

                <span className="mentor-field mentor-field--three">
                  SPACE SCIENCE
                </span>

              </div>

              {/* MENTOR INFO */}

              <div className="mentor-session-info">
                <div>
                  <span>
                    ROLE
                  </span>

                  <strong>
                    천문대 관측 담당자
                  </strong>
                </div>

                <div>
                  <span>
                    SESSION
                  </span>

                  <strong>
                    01
                  </strong>
                </div>

                <div>
                  <span>
                    DURATION
                  </span>

                  <strong>
                    60 MIN
                  </strong>
                </div>

                <div>
                  <span>
                    CAPACITY
                  </span>

                  <strong>
                    8 SEATS
                  </strong>
                </div>
              </div>

              {/* TOPICS */}

              <div className="mentor-topics">
                <div className="mentor-topics-head">
                  <span>
                    MENTOR TOPICS
                  </span>

                  <small>
                    Q&A
                  </small>
                </div>

                {topics.map(
                  (
                    topic,
                    index,
                  ) => (
                    <div
                      className="mentor-topic"
                      key={topic}
                      role="link"
                      tabIndex={0}
                      onClick={openTopic}
                      onKeyDown={event => {
                        if (
                          event.key === 'Enter' ||
                          event.key === ' '
                        ) {
                          event.preventDefault()
                          openTopic()
                        }
                      }}
                      style={{
                        cursor: 'pointer',
                      }}
                    >
                      <span>
                        0
                        {index + 1}
                      </span>

                      <p>
                        {topic}
                      </p>

                      <b aria-hidden="true">
                        ↗
                      </b>
                    </div>
                  ),
                )}
              </div>

              {/* ACTION */}

              <div className="mentor-dashboard-actions">
                <button
                  className="primary-cta"
                  type="button"
                  onClick={() =>
                    openMentoring(
                      '/mentoring/apply',
                    )
                  }
                >
                  멘토링 신청
                </button>

                <button
                  className="ghost-cta"
                  type="button"
                  onClick={() =>
                    openMentoring(
                      '/mentoring',
                    )
                  }
                >
                  자세히 보기 →
                </button>
              </div>
            </aside>
          </div>

          {/* APPLICATION FLOW */}

          <div className="mentoring-bottom">
            <span>
              APPLICATION FLOW
            </span>

            <div className="mentoring-flow-track">
              <div>
                <small>
                  STEP 01
                </small>

                <strong>
                  관심 분야 선택
                </strong>
              </div>

              <i aria-hidden="true" />

              <div>
                <small>
                  STEP 02
                </small>

                <strong>
                  멘토·주제 확인
                </strong>
              </div>

              <i aria-hidden="true" />

              <div>
                <small>
                  STEP 03
                </small>

                <strong>
                  회차 선택
                </strong>
              </div>

              <i aria-hidden="true" />

              <div>
                <small>
                  STEP 04
                </small>

                <strong>
                  신청 완료
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}