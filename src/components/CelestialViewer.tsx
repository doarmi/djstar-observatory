import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  DoubleSide,
  Group,
  MathUtils,
  Points,
  SRGBColorSpace,
  TextureLoader,
} from 'three'
import { createPortal } from 'react-dom'
import { useEffect, useMemo, useRef, useState } from 'react'

type CelestialKey = 'MOON' | 'SATURN' | 'JUPITER' | 'VEGA'

/* =========================================================
   BACKGROUND STARS
========================================================= */

function BackgroundStars() {
  const farRef = useRef<Points>(null)
  const nearRef = useRef<Points>(null)

  const far = useMemo(() => {
    const count = 520
    const data = new Float32Array(count * 3)

    for (let i = 0; i < count; i += 1) {
      data[i * 3] = (Math.random() - 0.5) * 15
      data[i * 3 + 1] = (Math.random() - 0.5) * 10
      data[i * 3 + 2] = -2 - Math.random() * 12
    }

    return data
  }, [])

  const near = useMemo(() => {
    const count = 110
    const data = new Float32Array(count * 3)

    for (let i = 0; i < count; i += 1) {
      data[i * 3] = (Math.random() - 0.5) * 11
      data[i * 3 + 1] = (Math.random() - 0.5) * 7
      data[i * 3 + 2] = -1 - Math.random() * 7
    }

    return data
  }, [])

  useFrame((_, delta) => {
    if (farRef.current) farRef.current.rotation.y += delta * 0.0012
    if (nearRef.current) nearRef.current.rotation.y -= delta * 0.0018
  })

  return (
    <>
      <points ref={farRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[far, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#b8d8ff"
          size={0.021}
          transparent
          opacity={0.72}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      <points ref={nearRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[near, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#ffffff"
          size={0.037}
          transparent
          opacity={0.86}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </>
  )
}

/* =========================================================
   SHARED GLOW
========================================================= */

function Glow({
  radius = 1,
  scale = 1.45,
  color,
  opacity = 0.08,
}: {
  radius?: number
  scale?: number
  color: string
  opacity?: number
}) {
  return (
    <mesh scale={scale}>
      <sphereGeometry args={[radius, 64, 64]} />
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

/* =========================================================
   MOON — NASA LRO COLOR MAP
   public/textures/moon.jpg
========================================================= */

function Moon() {
  const texture = useLoader(TextureLoader, '/textures/moon.jpg')

  useEffect(() => {
    texture.colorSpace = SRGBColorSpace
    texture.anisotropy = 16
    texture.needsUpdate = true
  }, [texture])

  return (
    <group rotation={[0.03, -0.28, -0.025]}>
      <Glow radius={1.08} scale={1.14} color="#90b7e8" opacity={0.025} />

      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1.08, 160, 160]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.96}
          metalness={0}
        />
      </mesh>
    </group>
  )
}

/* =========================================================
   JUPITER — NASA TEXTURE
   public/textures/jupiter.jpg
========================================================= */

function Jupiter() {
  const texture = useLoader(TextureLoader, '/textures/jupiter.jpg')

  useEffect(() => {
    texture.colorSpace = SRGBColorSpace
    texture.anisotropy = 16
    texture.needsUpdate = true
  }, [texture])

  return (
    <group rotation={[0.035, -0.48, -0.035]}>
      <Glow radius={1.08} scale={1.09} color="#d8a36f" opacity={0.025} />

      <mesh scale={[1, 0.935, 1]} castShadow receiveShadow>
        <sphereGeometry args={[1.08, 160, 160]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.98}
          metalness={0}
        />
      </mesh>
    </group>
  )
}

/* =========================================================
   SATURN RING SHADER
========================================================= */

const ringVertexShader = `
  varying vec2 vPosition;

  void main() {
    vPosition = position.xy;

    gl_Position =
      projectionMatrix *
      modelViewMatrix *
      vec4(position, 1.0);
  }
`

const ringFragmentShader = `
  precision highp float;

  varying vec2 vPosition;

  float hash(float n) {
    return fract(sin(n) * 43758.5453123);
  }

  void main() {
    float radius = length(vPosition);
    float innerRadius = 1.22;
    float outerRadius = 2.14;

    float r = clamp(
      (radius - innerRadius) /
      (outerRadius - innerRadius),
      0.0,
      1.0
    );

    float fine = sin(r * 930.0) * 0.5 + 0.5;
    float medium = sin(r * 175.0) * 0.5 + 0.5;
    float broad = sin(r * 38.0) * 0.5 + 0.5;
    float grain = hash(floor(r * 420.0));

    float brightness =
      0.26 +
      fine * 0.12 +
      medium * 0.17 +
      broad * 0.15 +
      grain * 0.10;

    float cassiniA = smoothstep(0.54, 0.555, r);
    float cassiniB = 1.0 - smoothstep(0.59, 0.605, r);
    float cassini = cassiniA * cassiniB;
    brightness *= 1.0 - cassini * 0.94;

    float cRing = 1.0;
    if (r < 0.20) cRing = 0.52;

    float innerFade = smoothstep(0.0, 0.045, r);
    float outerFade = 1.0 - smoothstep(0.91, 1.0, r);

    float alpha =
      brightness *
      cRing *
      innerFade *
      outerFade;

    vec3 darkWarm = vec3(0.31, 0.25, 0.18);
    vec3 pale = vec3(0.86, 0.79, 0.66);
    vec3 color = mix(darkWarm, pale, brightness);

    gl_FragColor = vec4(color, alpha * 0.88);
  }
`

/* =========================================================
   SATURN — NASA TEXTURE
   public/textures/saturn.jpg
========================================================= */

function Saturn() {
  const texture = useLoader(TextureLoader, '/textures/saturn.jpg')

  useEffect(() => {
    texture.colorSpace = SRGBColorSpace
    texture.anisotropy = 16
    texture.needsUpdate = true
  }, [texture])

  return (
    <group rotation={[0.05, -0.1, -0.18]}>
      <Glow radius={0.94} scale={1.11} color="#c9ad7b" opacity={0.02} />

      <mesh rotation={[0.05, 0.45, 0]} scale={[1, 0.91, 1]} castShadow receiveShadow>
        <sphereGeometry args={[0.94, 160, 160]} />
        <meshStandardMaterial
          map={texture}
          roughness={1}
          metalness={0}
        />
      </mesh>

      <mesh rotation={[Math.PI / 2.18, 0.05, -0.05]}>
        <ringGeometry args={[1.22, 2.14, 420]} />
        <shaderMaterial
          vertexShader={ringVertexShader}
          fragmentShader={ringFragmentShader}
          transparent
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
    </group>
  )
}

/* =========================================================
   VEGA — STAR SHADER
========================================================= */

const vegaVertexShader = `
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;

    gl_Position =
      projectionMatrix *
      modelViewMatrix *
      vec4(position, 1.0);
  }
`

const vegaFragmentShader = `
  precision highp float;

  varying vec3 vNormal;
  varying vec2 vUv;

  uniform float uTime;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
      (c - a) * u.y * (1.0 - u.x) +
      (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amp = 0.5;

    for (int i = 0; i < 5; i++) {
      value += noise(p) * amp;
      p *= 2.05;
      amp *= 0.5;
    }

    return value;
  }

  void main() {
    float n1 = fbm(vUv * 13.0 + vec2(uTime * 0.012, -uTime * 0.009));
    float n2 = fbm(vUv * 38.0 + vec2(-uTime * 0.018, uTime * 0.014));
    float surface = mix(n1, n2, 0.42);

    float limb = clamp(
      dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)),
      0.0,
      1.0
    );

    vec3 cool = vec3(0.38, 0.64, 1.0);
    vec3 pale = vec3(0.78, 0.90, 1.0);
    vec3 white = vec3(1.0, 1.0, 1.0);

    vec3 color = mix(cool, pale, 0.42 + surface * 0.46);
    color = mix(color, white, pow(limb, 0.55) * 0.62);
    color *= 1.05 + surface * 0.25;

    gl_FragColor = vec4(color, 1.0);
  }
`

function Vega() {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    [],
  )

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime
  })

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewNormal;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vViewNormal = normalize(normalMatrix * normal);

      gl_Position =
        projectionMatrix *
        modelViewMatrix *
        vec4(position, 1.0);
    }
  `

  const fragmentShader = `
    precision highp float;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewNormal;

    uniform float uTime;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);

      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));

      vec2 u = f * f * (3.0 - 2.0 * f);

      return mix(a, b, u.x) +
        (c - a) * u.y * (1.0 - u.x) +
        (d - b) * u.x * u.y;
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amp = 0.5;

      for (int i = 0; i < 5; i++) {
        value += noise(p) * amp;
        p *= 2.03;
        amp *= 0.5;
      }

      return value;
    }

    void main() {
      float n1 = fbm(vUv * 18.0 + vec2(uTime * 0.012, -uTime * 0.008));
      float n2 = fbm(vUv * 52.0 + vec2(-uTime * 0.018, uTime * 0.011));
      float surface = n1 * 0.62 + n2 * 0.38;

      float facing = clamp(vViewNormal.z, 0.0, 1.0);
      float limb = pow(facing, 0.38);

      // Vega is a rapidly rotating A-type star:
      // keep the poles subtly brighter than the equatorial region.
      float latitude = abs(vUv.y - 0.5) * 2.0;
      float gravityBrightening = mix(0.88, 1.08, pow(latitude, 1.35));

      vec3 edge = vec3(0.34, 0.63, 0.96);
      vec3 mid = vec3(0.68, 0.84, 1.0);
      vec3 core = vec3(0.93, 0.97, 1.0);

      vec3 color = mix(edge, mid, limb);
      color = mix(color, core, pow(limb, 2.0) * 0.72);

      float granulation = (surface - 0.5) * 0.10;
      color += granulation;
      color *= gravityBrightening;

      // Avoid clipping to a flat white disk.
      color *= 0.88;

      gl_FragColor = vec4(color, 1.0);
    }
  `

  return (
    <group rotation={[0.08, 0.28, -0.06]}>
      {/* very soft distant halo */}
      <mesh scale={[1.52, 1.42, 1.52]}>
        <sphereGeometry args={[0.74, 64, 64]} />
        <meshBasicMaterial
          color="#4d8fd1"
          transparent
          opacity={0.018}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* close corona */}
      <mesh scale={[1.19, 1.12, 1.19]}>
        <sphereGeometry args={[0.74, 64, 64]} />
        <meshBasicMaterial
          color="#8fc9ff"
          transparent
          opacity={0.055}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* rapidly rotating, slightly oblate photosphere */}
      <mesh scale={[1.04, 0.91, 1.0]}>
        <sphereGeometry args={[0.74, 128, 128]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
        />
      </mesh>

      {/* restrained stellar illumination */}
      <pointLight
        intensity={5.2}
        distance={9}
        color="#9fd1ff"
      />
    </group>
  )
}

function CameraRig({ zoom }: { zoom: number }) {
  const { camera } = useThree()

  useFrame(() => {
    camera.position.z = MathUtils.lerp(camera.position.z, zoom, 0.085)
    camera.lookAt(0, 0, 0)
  })

  return null
}

/* =========================================================
   OBJECT CONTROLLER
========================================================= */

function ViewerObject({
  object,
  rotation,
  dragging,
}: {
  object: CelestialKey
  rotation: { x: number; y: number }
  dragging: boolean
}) {
  const ref = useRef<Group>(null)

  useFrame((_, delta) => {
    if (!ref.current) return

    if (!dragging) {
      rotation.y += delta * (object === 'VEGA' ? 0.045 : 0.025)
    }

    ref.current.rotation.x = MathUtils.lerp(
      ref.current.rotation.x,
      rotation.x,
      0.105,
    )

    ref.current.rotation.y = MathUtils.lerp(
      ref.current.rotation.y,
      rotation.y,
      0.105,
    )
  })

  return (
    <group ref={ref}>
      {object === 'MOON' && <Moon />}
      {object === 'SATURN' && <Saturn />}
      {object === 'JUPITER' && <Jupiter />}
      {object === 'VEGA' && <Vega />}
    </group>
  )
}

/* =========================================================
   COPY
========================================================= */

const labelMap: Record<CelestialKey, string> = {
  MOON: '달',
  SATURN: '토성',
  JUPITER: '목성',
  VEGA: '베가',
}

const descMap: Record<CelestialKey, string> = {
  MOON: 'LRO 관측 데이터를 기반으로 달의 밝고 어두운 지형과 크레이터 분포를 살펴보세요.',
  SATURN: '토성의 대기 띠와 카시니 간극을 포함한 고리 구조를 360°로 살펴보세요.',
  JUPITER: '목성의 실제 대기 띠가 담긴 NASA 텍스처를 회전시키며 관찰해보세요.',
  VEGA: '청백색 항성 베가를 광구와 코로나의 빛 표현으로 감상해보세요.',
}

const initialZoomMap: Record<CelestialKey, number> = {
  MOON: 4.25,
  SATURN: 5.15,
  JUPITER: 4.35,
  VEGA: 4.05,
}

/* =========================================================
   CELESTIAL VIEWER
========================================================= */

export default function CelestialViewer({
  object,
  onClose,
}: {
  object: CelestialKey
  onClose: () => void
}) {
  const [zoom, setZoom] = useState(initialZoomMap[object])
  const [isDragging, setIsDragging] = useState(false)

  const rotation = useRef({
    x: -0.08,
    y: 0.2,
  })

  const last = useRef({
    x: 0,
    y: 0,
  })

  useEffect(() => {
    setZoom(initialZoomMap[object])
    rotation.current = {
      x: -0.08,
      y: 0.2,
    }
  }, [object])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKey)

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [onClose])

  const content = (
    <div
      className="celestial-viewer-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`${labelMap[object]} 3D 보기`}
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="celestial-viewer-panel">
        <div className="celestial-viewer-head">
          <div>
            <span>3D CELESTIAL VIEWER</span>
            <strong>{object}</strong>
            <small>
              {labelMap[object]} · DRAG 360° · WHEEL TO ZOOM
            </small>
            <p>{descMap[object]}</p>
          </div>

          <button
            type="button"
            className="celestial-viewer-close"
            onClick={onClose}
            aria-label="3D 뷰어 닫기"
          >
            ×
          </button>
        </div>

        <div
          className="celestial-viewer-stage"
          onPointerDown={event => {
            setIsDragging(true)

            last.current = {
              x: event.clientX,
              y: event.clientY,
            }

            event.currentTarget.setPointerCapture(event.pointerId)
          }}
          onPointerMove={event => {
            if (!isDragging) return

            const dx = event.clientX - last.current.x
            const dy = event.clientY - last.current.y

            last.current = {
              x: event.clientX,
              y: event.clientY,
            }

            rotation.current.y += dx * 0.012
            rotation.current.x = MathUtils.clamp(
              rotation.current.x + dy * 0.009,
              -1.4,
              1.4,
            )
          }}
          onPointerUp={event => {
            setIsDragging(false)

            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId)
            }
          }}
          onPointerCancel={() => {
            setIsDragging(false)
          }}
          onWheel={event => {
            event.preventDefault()

            setZoom(value =>
              MathUtils.clamp(
                value + event.deltaY * 0.0032,
                2.55,
                7.2,
              ),
            )
          }}
        >
          <Canvas
            camera={{
              position: [0, 0, initialZoomMap[object]],
              fov: 40,
              near: 0.1,
              far: 60,
            }}
            dpr={[1.35, 2]}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: 'high-performance',
            }}
            onCreated={({ gl }) => {
              gl.toneMapping = ACESFilmicToneMapping
              gl.toneMappingExposure = object === 'VEGA' ? 0.95 : 1.08
              gl.outputColorSpace = SRGBColorSpace
            }}
          >
            <color attach="background" args={['#01030a']} />
            <fog attach="fog" args={['#01030a', 8, 22]} />

            <ambientLight
              intensity={object === 'VEGA' ? 0.035 : 0.16}
              color="#8091a7"
            />

            {object !== 'VEGA' && (
              <>
                <directionalLight
                  position={[4.8, 3.4, 5.5]}
                  intensity={4.2}
                  color="#fff4df"
                />
                <pointLight
                  position={[-4, 1.5, 3]}
                  intensity={0.65}
                  color="#6197ff"
                />
              </>
            )}

            <BackgroundStars />

            <ViewerObject
              object={object}
              rotation={rotation.current}
              dragging={isDragging}
            />

            <CameraRig zoom={zoom} />
          </Canvas>

          <div
            className="celestial-viewer-vignette"
            aria-hidden="true"
          />
        </div>

        <div className="celestial-viewer-controls">
          <span>
            드래그 360° 회전 · 휠 확대/축소 · ESC 닫기
          </span>

          <div>
            <button
              type="button"
              onClick={() =>
                setZoom(value => Math.max(2.55, value - 0.45))
              }
            >
              ＋ 확대
            </button>

            <button
              type="button"
              onClick={() =>
                setZoom(value => Math.min(7.2, value + 0.45))
              }
            >
              － 축소
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
