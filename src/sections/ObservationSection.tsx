import { Suspense, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  DoubleSide,
  Group,
  MathUtils,
  SRGBColorSpace,
  TextureLoader,
} from 'three'
import CelestialViewer from '../components/CelestialViewer'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { navigateTo } from '../lib/navigation'

const weather = [
  ['CLOUD', '12%', '구름량'],
  ['HUMIDITY', '58%', '습도'],
  ['RAIN', '10%', '강수확률'],
  ['SUNSET', '19:XX', '일몰'],
  ['MOON', 'Waxing', '월령'],
]

const objects = [
  {
    en: 'MOON',
    ko: '달',
    desc: '밝고 선명한 표면 관측',
    detail: '달의 크레이터와 명암 경계를 선명하게 확인하기 좋은 관측 대상입니다.',
  },
  {
    en: 'SATURN',
    ko: '토성',
    desc: '고리 관측 추천',
    detail: '관측 조건이 좋을 때 고리 형태를 확인할 수 있는 대표 천체입니다.',
  },
  {
    en: 'JUPITER',
    ko: '목성',
    desc: '위성 관측 가능',
    detail: '밝은 목성과 주변의 갈릴레이 위성을 함께 확인해볼 수 있습니다.',
  },
  {
    en: 'VEGA',
    ko: '베가',
    desc: '여름철 대표 밝은 별',
    detail: '여름철 밤하늘에서 비교적 쉽게 찾을 수 있는 밝은 별입니다.',
  },
] as const

type CelestialKey = (typeof objects)[number]['en']

gsap.registerPlugin(ScrollTrigger, SplitText)

/* =========================================================
   MINI 3D PREVIEW
========================================================= */

function MiniGlow({
  radius,
  color,
  opacity,
}: {
  radius: number
  color: string
  opacity: number
}) {
  return (
    <mesh scale={radius}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </mesh>
  )
}

function MiniMoon() {
  const texture = useLoader(TextureLoader, '/textures/moon.jpg')

  useMemo(() => {
    texture.colorSpace = SRGBColorSpace
    texture.anisotropy = 8
    texture.needsUpdate = true
  }, [texture])

  return (
    <group rotation={[0.06, 0.48, -0.035]}>
      <MiniGlow radius={1.18} color="#9fc7ef" opacity={0.018} />

      <mesh>
        <sphereGeometry args={[0.91, 128, 128]} />
        <meshStandardMaterial
          map={texture}
          bumpMap={texture}
          bumpScale={0.028}
          roughness={0.96}
          metalness={0}
        />
      </mesh>
    </group>
  )
}

function MiniJupiter() {
  const texture = useLoader(TextureLoader, '/textures/jupiter.jpg')

  useMemo(() => {
    texture.colorSpace = SRGBColorSpace
    texture.anisotropy = 8
    texture.needsUpdate = true
  }, [texture])

  return (
    <group rotation={[0.025, -0.62, -0.018]}>
      <MiniGlow radius={1.09} color="#e0b887" opacity={0.018} />

      <mesh scale={[1, 0.94, 1]}>
        <sphereGeometry args={[1.02, 128, 128]} />
        <meshStandardMaterial
          map={texture}
          bumpMap={texture}
          bumpScale={0.006}
          roughness={0.83}
          metalness={0}
        />
      </mesh>
    </group>
  )
}

const saturnRingVertexShader = `
  varying vec2 vRingPosition;

  void main() {
    vRingPosition = position.xy;

    gl_Position =
      projectionMatrix *
      modelViewMatrix *
      vec4(position, 1.0);
  }
`

const saturnRingFragmentShader = `
  precision highp float;

  varying vec2 vRingPosition;

  float hash(float n) {
    return fract(sin(n * 1234.567) * 43758.5453);
  }

  void main() {
    float r = length(vRingPosition);

    const float innerRadius = 0.79;
    const float outerRadius = 1.49;

    float t = clamp(
      (r - innerRadius) /
      (outerRadius - innerRadius),
      0.0,
      1.0
    );

    float edgeFade =
      smoothstep(0.0, 0.035, t) *
      (1.0 - smoothstep(0.94, 1.0, t));

    float broad =
      sin(t * 42.0) * 0.5 +
      sin(t * 93.0 + 1.2) * 0.28 +
      sin(t * 181.0 + 0.4) * 0.12;

    float fine =
      sin(t * 520.0) * 0.06 +
      sin(t * 890.0 + 0.7) * 0.035;

    float grain =
      (hash(floor(t * 720.0)) - 0.5) * 0.055;

    float cassini =
      1.0 -
      smoothstep(
        0.012,
        0.028,
        abs(t - 0.64)
      );

    float innerC =
      smoothstep(0.02, 0.16, t) *
      (1.0 - smoothstep(0.16, 0.29, t));

    vec3 darkRing = vec3(0.29, 0.235, 0.17);
    vec3 warmRing = vec3(0.76, 0.64, 0.46);
    vec3 brightRing = vec3(0.91, 0.82, 0.65);

    float band =
      clamp(
        0.56 +
        broad * 0.17 +
        fine +
        grain,
        0.0,
        1.0
      );

    vec3 color =
      mix(darkRing, warmRing, band);

    color =
      mix(
        color,
        brightRing,
        smoothstep(0.34, 0.82, band) * 0.34
      );

    color *= mix(0.72, 1.0, 1.0 - innerC);
    color *= mix(0.12, 1.0, cassini);

    float alpha =
      edgeFade *
      mix(0.46, 0.82, band) *
      mix(0.38, 1.0, cassini);

    gl_FragColor = vec4(color, alpha);
  }
`

function MiniSaturn() {
  const texture = useLoader(TextureLoader, '/textures/saturn.jpg')

  useMemo(() => {
    texture.colorSpace = SRGBColorSpace
    texture.anisotropy = 8
    texture.needsUpdate = true
  }, [texture])

  return (
    <group rotation={[0.035, 0.12, -0.18]}>
      <MiniGlow radius={1.12} color="#d4b87e" opacity={0.016} />

      <mesh scale={[1, 0.92, 1]}>
        <sphereGeometry args={[0.69, 128, 128]} />
        <meshStandardMaterial
          map={texture}
          bumpMap={texture}
          bumpScale={0.004}
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      <mesh rotation={[Math.PI / 2.17, 0.08, -0.045]}>
        <ringGeometry args={[0.79, 1.49, 360]} />
        <shaderMaterial
          vertexShader={saturnRingVertexShader}
          fragmentShader={saturnRingFragmentShader}
          transparent
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function MiniVega() {
  const pulseRef = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (!pulseRef.current) return

    const pulse =
      1 +
      Math.sin(clock.elapsedTime * 1.15) *
      0.006

    pulseRef.current.scale.setScalar(pulse)
  })

  return (
    <group ref={pulseRef}>
      <MiniGlow radius={1.48} color="#4e8dcb" opacity={0.012} />
      <MiniGlow radius={1.08} color="#8ecbff" opacity={0.035} />

      <mesh scale={[1.04, 0.95, 1]}>
        <sphereGeometry args={[0.64, 96, 96]} />
        <meshStandardMaterial
          color="#b8d9f8"
          emissive="#78b6eb"
          emissiveIntensity={1.35}
          roughness={0.5}
          metalness={0}
          toneMapped
        />
      </mesh>

      <pointLight
        intensity={3.6}
        distance={6}
        color="#9ed1ff"
      />
    </group>
  )
}

function MiniCelestialObject({
  object,
}: {
  object: CelestialKey
}) {
  const ref = useRef<Group>(null)

  useFrame((_, delta) => {
    if (!ref.current) return

    ref.current.rotation.y +=
      delta *
      (object === 'VEGA' ? 0.055 : 0.035)
  })

  return (
    <group ref={ref}>
      {object === 'MOON' && <MiniMoon />}
      {object === 'SATURN' && <MiniSaturn />}
      {object === 'JUPITER' && <MiniJupiter />}
      {object === 'VEGA' && <MiniVega />}
    </group>
  )
}

function PreviewStars() {
  const { positions, sizes } = useMemo(() => {
    const count = 150
    const p = new Float32Array(count * 3)
    const s = new Float32Array(count)

    for (let i = 0; i < count; i += 1) {
      p[i * 3] =
        (Math.random() - 0.5) * 5.7

      p[i * 3 + 1] =
        (Math.random() - 0.5) * 3.9

      p[i * 3 + 2] =
        -1.0 - Math.random() * 4.3

      s[i] = Math.random()
    }

    return {
      positions: p,
      sizes: s,
    }
  }, [])

  return (
    <>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>

        <pointsMaterial
          color="#dbeaff"
          size={0.017}
          transparent
          opacity={0.48}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      <points scale={1.002}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(
                Array.from(
                  { length: Math.floor(sizes.length / 5) * 3 },
                  (_, index) =>
                    positions[
                    Math.floor(index / 3) * 15 +
                    (index % 3)
                    ] ?? 0,
                ),
              ),
              3,
            ]}
          />
        </bufferGeometry>

        <pointsMaterial
          color="#ffffff"
          size={0.032}
          transparent
          opacity={0.72}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </>
  )
}

function SelectedObjectPreview({
  object,
}: {
  object: CelestialKey
}) {
  return (
    <div
      className="selected-object-preview"
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: '50%',
        right: '3%',
        width: '48%',
        height: '92%',
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
      }}
    >
      <Canvas
        key={object}
        camera={{
          position: [
            0,
            0,
            object === 'SATURN' ? 4.0 : 3.55,
          ],
          fov: 38,
          near: 0.1,
          far: 30,
        }}
        dpr={[1.25, 1.85]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = SRGBColorSpace
          gl.toneMapping = ACESFilmicToneMapping
          gl.toneMappingExposure =
            object === 'MOON'
              ? 1.05
              : object === 'SATURN'
                ? 1.18
                : object === 'JUPITER'
                  ? 1.12
                  : 0.92
        }}
      >
        <ambientLight
          intensity={
            object === 'VEGA'
              ? 0.08
              : object === 'JUPITER'
                ? 0.2
                : 0.13
          }
          color="#72849c"
        />

        <directionalLight
          position={[3.8, 2.8, 4.8]}
          intensity={object === 'VEGA' ? 0.25 : 3.15}
          color="#fff0d7"
        />

        <directionalLight
          position={[-3.4, -1.0, 1.6]}
          intensity={
            object === 'VEGA'
              ? 0.12
              : object === 'JUPITER'
                ? 0.52
                : 0.36
          }
          color="#5b8fcf"
        />

        <pointLight
          position={[0.4, 2.6, -1.5]}
          intensity={object === 'VEGA' ? 0.18 : 0.22}
          color="#b8d7ff"
        />

        <PreviewStars />

        <Suspense fallback={null}>
          <MiniCelestialObject object={object} />
        </Suspense>
      </Canvas>

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: '8% 4%',
          borderRadius: '50%',
          background:
            'radial-gradient(circle at center, rgba(125,157,201,.08) 0%, rgba(35,55,88,.025) 48%, rgba(2,5,13,0) 72%)',
          filter: 'blur(8px)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

/* =========================================================
   OBSERVATION SECTION
========================================================= */

export default function ObservationSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [selectedIndex, setSelectedIndex] = useState(1)
  const [viewerOpen, setViewerOpen] = useState(false)
  const selected = objects[selectedIndex]

  useLayoutEffect(() => {
    const section = sectionRef.current
    if (
      !section ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    const ctx = gsap.context(() => {
      const title = section.querySelector('.section-head h2')
      const split = title
        ? SplitText.create(title, {
          type: 'lines',
          linesClass: 'split-line',
        })
        : null

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 72%',
          once: true,
        },
        defaults: {
          ease: 'power3.out',
        },
      })

      tl.from('.section-kicker', {
        opacity: 0,
        y: 12,
        duration: 0.45,
      })
        .from(
          split?.lines ?? [],
          {
            opacity: 0,
            yPercent: 55,
            duration: 0.72,
            stagger: 0.1,
          },
          '-=0.18',
        )
        .from(
          '.section-summary',
          {
            opacity: 0,
            y: 18,
            duration: 0.55,
          },
          '-=0.38',
        )
        .from(
          '.score-panel, .objects-panel',
          {
            opacity: 0,
            y: 34,
            duration: 0.75,
            stagger: 0.12,
          },
          '-=0.18',
        )
        .from(
          '.weather-item',
          {
            opacity: 0,
            y: 12,
            duration: 0.4,
            stagger: 0.055,
          },
          '-=0.28',
        )
        .from(
          '.object-card',
          {
            opacity: 0,
            y: 14,
            duration: 0.42,
            stagger: 0.07,
          },
          '-=0.32',
        )

      gsap.fromTo(
        '.score-ring',
        {
          '--score-angle': '0deg',
          scale: 0.82,
          rotation: -12,
        },
        {
          '--score-angle': '316.8deg',
          scale: 1,
          rotation: 0,
          duration: 1.65,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.score-ring',
            start: 'top 82%',
            once: true,
          },
        },
      )

      gsap.fromTo(
        '.score-ring__inner',
        {
          scale: 1.08,
        },
        {
          scale: 1,
          duration: 1.4,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.score-ring',
            start: 'top 82%',
            once: true,
          },
        },
      )

      const score = {
        value: 0,
      }

      gsap.to(score, {
        value: 88,
        duration: 1.35,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.score-ring',
          start: 'top 82%',
          once: true,
        },
        onUpdate: () => {
          const node =
            section.querySelector<HTMLElement>('[data-score]')

          if (node) {
            node.textContent =
              String(Math.round(score.value))
          }
        },
      })

      return () => split?.revert()
    }, section)

    return () => ctx.revert()
  }, [])

  const selectObject = (index: number) => {
    const section = sectionRef.current

    if (
      !section ||
      index === selectedIndex
    ) {
      return
    }

    setSelectedIndex(index)

    gsap.fromTo(
      section.querySelector('.selected-object'),
      {
        opacity: 0.35,
        y: 8,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: 'power2.out',
      },
    )

    gsap.fromTo(
      section.querySelector('.selected-object-preview'),
      {
        opacity: 0,
        scale: 0.93,
      },
      {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: 'power3.out',
      },
    )
  }

  return (
    <section
      className="observation-section"
      id="observation-section"
      ref={sectionRef}
    >
      <div className="container">
        <div className="section-head">
          <div>
            <p className="section-kicker">
              TODAY&apos;S OBSERVATION
            </p>

            <h2>
              오늘 하늘은
              <br />
              별을 보기 좋은
              <br />
              날일까요?
            </h2>
          </div>

          <p className="section-summary">
            오늘의 관측 환경을 한눈에 확인하고 지금 볼 수 있는
            천체와 관련 프로그램까지 바로 만나보세요.
          </p>
        </div>

        <div className="observation-grid">
          <article className="score-panel">
            <div className="score-topline">
              <span>OBSERVING INDEX</span>
            </div>

            <div className="score-ring">
              <div className="score-ring__inner">
                <strong data-score>
                  0
                </strong>
                <span>/ 100</span>
              </div>
            </div>

            <div className="score-copy">
              <strong>GOOD</strong>
              <p>
                오늘은 관측하기 좋은 밤이에요.
              </p>
            </div>

            <div className="weather-grid">
              {weather.map(
                ([key, value, label]) => (
                  <div
                    className="weather-item"
                    key={key}
                  >
                    <span>{key}</span>
                    <strong>{value}</strong>
                    <small>{label}</small>
                  </div>
                ),
              )}
            </div>
          </article>

          <article className="objects-panel">
            <div className="objects-head">
              <div>
                <span>
                  TONIGHT&apos;S OBJECTS
                </span>
                <h3>
                  오늘 볼 수 있는 천체
                </h3>
              </div>

              <button
                className="ghost-cta small"
                type="button"
                onClick={() =>
                  navigateTo('/tonight')
                }
              >
                전체 보기
              </button>
            </div>

            <div
              className="objects-stage"
              style={{
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <SelectedObjectPreview
                object={selected.en}
              />

              <div
                className="selected-object"
                style={{
                  position: 'relative',
                  zIndex: 2,
                  width: '52%',
                }}
              >
                <span className="object-eyebrow">
                  SELECTED OBJECT
                </span>

                <strong>
                  {selected.en}
                </strong>

                <p>
                  {selected.detail}
                </p>

                <div className="object-actions">
                  <button
                    className="primary-cta"
                    type="button"
                    onClick={() =>
                      setViewerOpen(true)
                    }
                  >
                    3D로 보기
                  </button>

                  <button
                    className="ghost-cta"
                    type="button"
                    onClick={() =>
                      navigateTo(
                        '/programs/observation',
                      )
                    }
                  >
                    관련 프로그램
                  </button>
                </div>
              </div>
            </div>

            <div className="object-list">
              {objects.map(
                (object, index) => (
                  <button
                    className={`object-card ${index === selectedIndex
                      ? 'is-active'
                      : ''
                      }`}
                    type="button"
                    key={object.en}
                    onClick={() =>
                      selectObject(index)
                    }
                  >
                    <span
                      className="object-icon"
                      aria-hidden="true"
                    >
                      {index === selectedIndex
                        ? '✓'
                        : ''}
                    </span>

                    <span className="object-text">
                      <b>{object.ko}</b>
                      <small>{object.en}</small>
                      <em>{object.desc}</em>
                    </span>
                  </button>
                ),
              )}
            </div>
          </article>
        </div>
      </div>

      {viewerOpen && (
        <CelestialViewer
          object={selected.en}
          onClose={() =>
            setViewerOpen(false)
          }
        />
      )}
    </section>
  )
}
