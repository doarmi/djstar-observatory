import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  CanvasTexture,
  DoubleSide,
  Group,
  MathUtils,
  Points,
  SRGBColorSpace,
  TextureLoader,
} from 'three'
import { useEffect, useMemo, useRef, useState } from 'react'

/* =========================================================
   LABEL
========================================================= */

function makeLabel(text: string) {
  const canvas = document.createElement('canvas')

  canvas.width = 512
  canvas.height = 96

  const ctx = canvas.getContext('2d')!

  ctx.clearRect(0, 0, 512, 96)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '600 22px Arial'
  ctx.fillStyle = 'rgba(220,228,238,.72)'

  ctx.fillText(text, 256, 48)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace

  return texture
}

function Label({
  text,
  position,
  scale = 0.4,
}: {
  text: string
  position: [number, number, number]
  scale?: number
}) {
  const texture = useMemo(() => makeLabel(text), [text])

  useEffect(() => {
    return () => texture.dispose()
  }, [texture])

  return (
    <sprite
      position={position}
      scale={[scale, scale * 0.19, 1]}
    >
      <spriteMaterial
        map={texture}
        transparent
        opacity={0.72}
        depthWrite={false}
      />
    </sprite>
  )
}


type CelestialObject =
  | 'SUN'
  | 'SATURN'
  | 'JUPITER'
  | 'MARS'
  | 'VEGA'

type InteractiveObjectProps = {
  hovered: boolean
  selected: boolean
  onHover: (
    object: CelestialObject | null,
  ) => void
  onSelect: (
    object: CelestialObject,
  ) => void
}

const objectMeta: Record<
  CelestialObject,
  {
    label: string
    description: string
  }
> = {
  SUN: {
    label: 'SUN',
    description: '태양계의 중심',
  },
  SATURN: {
    label: 'SATURN',
    description: '고리로 둘러싸인 가스 행성',
  },
  JUPITER: {
    label: 'JUPITER',
    description: '태양계에서 가장 큰 행성',
  },
  MARS: {
    label: 'MARS',
    description: '붉은 표면의 네 번째 행성',
  },
  VEGA: {
    label: 'VEGA',
    description: '여름 밤하늘의 밝은 별',
  },
}

function useInteractiveScale(
  ref: {
    current: Group | null
  },
  baseScale: number,
  hovered: boolean,
  selected: boolean,
) {
  useFrame(() => {
    if (!ref.current) return

    const multiplier =
      hovered
        ? 1.065
        : selected
          ? 1.035
          : 1

    const next =
      MathUtils.lerp(
        ref.current.scale.x,
        baseScale * multiplier,
        0.12,
      )

    ref.current.scale.setScalar(next)
  })
}

/* =========================================================
   STAR FIELD
========================================================= */

function StarField({
  count,
  spread,
  size,
  opacity,
}: {
  count: number
  spread: number
  size: number
  opacity: number
}) {
  const ref = useRef<Points>(null)

  const positions = useMemo(() => {
    const data = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const zDepth = Math.pow(Math.random(), 0.65)

      data[i * 3] =
        (Math.random() - 0.5) * spread

      data[i * 3 + 1] =
        (Math.random() - 0.5) * spread * 0.7

      data[i * 3 + 2] =
        -1 - zDepth * spread * 1.4
    }

    return data
  }, [count, spread])

  useFrame((_, delta) => {
    if (!ref.current) return

    ref.current.rotation.y +=
      delta * 0.00065
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>

      <pointsMaterial
        color="#ffffff"
        size={size}
        transparent
        opacity={opacity}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

/* =========================================================
   ORBIT
========================================================= */

function Orbit({
  radius,
  rotation,
  opacity,
}: {
  radius: number
  rotation: [number, number, number]
  opacity: number
}) {
  return (
    <mesh
      rotation={rotation}
      scale={[1.18, 0.86, 1]}
    >
      <ringGeometry
        args={[
          radius - 0.002,
          radius + 0.002,
          256,
        ]}
      />

      <meshBasicMaterial
        color="#677688"
        transparent
        opacity={opacity}
        depthWrite={false}
        side={DoubleSide}
      />
    </mesh>
  )
}

/* =========================================================
   SUN SHADER
========================================================= */

const sunVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);

    gl_Position =
      projectionMatrix *
      modelViewMatrix *
      vec4(position, 1.0);
  }
`

const sunFragmentShader = `
  precision highp float;

  varying vec2 vUv;
  varying vec3 vNormal;

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

    vec2 u =
      f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
      (c - a) * u.y * (1.0 - u.x) +
      (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);

      p *= 2.04;
      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    vec2 uv = vUv;

    float large =
      fbm(
        uv * 9.0 +
        vec2(
          uTime * 0.008,
          -uTime * 0.006
        )
      );

    float detail =
      fbm(
        uv * 34.0 +
        vec2(
          -uTime * 0.013,
          uTime * 0.009
        )
      );

    float surface =
      large * 0.58 +
      detail * 0.42;

    vec3 warm =
      vec3(
        1.0,
        0.69,
        0.24
      );

    vec3 white =
      vec3(
        1.0,
        0.97,
        0.78
      );

    vec3 color =
      mix(
        warm,
        white,
        0.42 +
        surface * 0.52
      );

    float limb =
      clamp(
        dot(
          normalize(vNormal),
          vec3(0.0, 0.0, 1.0)
        ),
        0.0,
        1.0
      );

    color *=
      mix(
        0.68,
        1.15,
        pow(limb, 0.42)
      );

    gl_FragColor =
      vec4(
        color,
        1.0
      );
  }
`

function Sun({
  hovered,
  selected,
  onHover,
  onSelect,
}: InteractiveObjectProps) {
  const groupRef = useRef<Group>(null)

  useInteractiveScale(
    groupRef,
    1.22,
    hovered,
    selected,
  )

  const uniforms = useMemo(
    () => ({
      uTime: {
        value: 0,
      },
    }),
    [],
  )

  useFrame(({ clock }) => {
    uniforms.uTime.value =
      clock.elapsedTime
  })

  return (
    <group
      ref={groupRef}
      position={[0, -0.08, 0.15]}
      scale={1.22}
      onPointerOver={event => {
        event.stopPropagation()
        onHover('SUN')
      }}
      onPointerOut={event => {
        event.stopPropagation()
        onHover(null)
      }}
      onClick={event => {
        event.stopPropagation()

        if (event.delta <= 5) {
          onSelect('SUN')
        }
      }}
    >
      {/* very soft outer corona */}

      <mesh scale={3.4}>
        <sphereGeometry
          args={[0.16, 48, 48]}
        />

        <meshBasicMaterial
          color="#e4a54e"
          transparent
          opacity={0.012}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>

      <mesh scale={2.4}>
        <sphereGeometry
          args={[0.16, 48, 48]}
        />

        <meshBasicMaterial
          color="#f1c16a"
          transparent
          opacity={0.026}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>

      <mesh scale={1.55}>
        <sphereGeometry
          args={[0.16, 48, 48]}
        />

        <meshBasicMaterial
          color="#fff0b4"
          transparent
          opacity={
            hovered
              ? 0.11
              : selected
                ? 0.085
                : 0.07
          }
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>

      {/* photosphere */}

      <mesh>
        <sphereGeometry
          args={[0.16, 96, 96]}
        />

        <shaderMaterial
          vertexShader={sunVertexShader}
          fragmentShader={sunFragmentShader}
          uniforms={uniforms}
        />
      </mesh>

      {/* main solar illumination */}

      <pointLight
        intensity={7}
        distance={7}
        decay={1.7}
        color="#fff0c4"
      />

      <Label
        text="SUN"
        position={[0, 0.3, 0]}
        scale={0.34}
      />
    </group>
  )
}

/* =========================================================
   JUPITER — NASA TEXTURE
========================================================= */

function Jupiter({
  hovered,
  selected,
  onHover,
  onSelect,
}: InteractiveObjectProps) {
  const groupRef = useRef<Group>(null)

  useInteractiveScale(
    groupRef,
    1.42,
    hovered,
    selected,
  )

  const texture = useLoader(
    TextureLoader,
    '/textures/jupiter.jpg',
  )

  useEffect(() => {
    texture.colorSpace =
      SRGBColorSpace

    texture.needsUpdate = true
  }, [texture])

  return (
    <group
      ref={groupRef}
      position={[
        1.18,
        0.66,
        -0.12,
      ]}
      scale={1.42}
      onPointerOver={event => {
        event.stopPropagation()
        onHover('JUPITER')
      }}
      onPointerOut={event => {
        event.stopPropagation()
        onHover(null)
      }}
      onClick={event => {
        event.stopPropagation()

        if (event.delta <= 5) {
          onSelect('JUPITER')
        }
      }}
    >
      {/* subtle atmospheric glow */}

      <mesh scale={1.06}>
        <sphereGeometry
          args={[0.18, 64, 64]}
        />

        <meshBasicMaterial
          color="#d0b48b"
          transparent
          opacity={0.022}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>

      <mesh
        rotation={[
          0.04,
          -0.55,
          -0.05,
        ]}
        scale={[
          1,
          0.935,
          1,
        ]}
      >
        <sphereGeometry
          args={[0.18, 96, 96]}
        />

        <meshStandardMaterial
          map={texture}
          roughness={0.97}
          metalness={0}
          emissive="#d8c09a"
          emissiveIntensity={
            hovered
              ? 0.11
              : selected
                ? 0.065
                : 0
          }
        />
      </mesh>

      <Label
        text="JUPITER"
        position={[
          0,
          0.31,
          0,
        ]}
        scale={0.39}
      />
    </group>
  )
}

/* =========================================================
   MARS — NASA TEXTURE
========================================================= */

function Mars({
  hovered,
  selected,
  onHover,
  onSelect,
}: InteractiveObjectProps) {
  const groupRef = useRef<Group>(null)

  useInteractiveScale(
    groupRef,
    1.25,
    hovered,
    selected,
  )

  const texture = useLoader(
    TextureLoader,
    '/textures/mars.jpg',
  )

  useEffect(() => {
    texture.colorSpace =
      SRGBColorSpace

    texture.needsUpdate = true
  }, [texture])

  return (
    <group
      ref={groupRef}
      position={[
        1.48,
        -0.78,
        0.05,
      ]}
      scale={1.25}
      onPointerOver={event => {
        event.stopPropagation()
        onHover('MARS')
      }}
      onPointerOut={event => {
        event.stopPropagation()
        onHover(null)
      }}
      onClick={event => {
        event.stopPropagation()

        if (event.delta <= 5) {
          onSelect('MARS')
        }
      }}
    >
      <mesh
        rotation={[
          0.16,
          0.7,
          0.04,
        ]}
      >
        <sphereGeometry
          args={[0.095, 80, 80]}
        />

        <meshStandardMaterial
          map={texture}
          roughness={1}
          metalness={0}
          emissive="#a65b3b"
          emissiveIntensity={
            hovered
              ? 0.14
              : selected
                ? 0.075
                : 0
          }
        />
      </mesh>

      <Label
        text="MARS"
        position={[
          0,
          0.21,
          0,
        ]}
        scale={0.32}
      />
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
    return fract(
      sin(n) *
      43758.5453123
    );
  }

  void main() {
    float radius =
      length(vPosition);

    float innerRadius = 0.205;
    float outerRadius = 0.455;

    float r =
      clamp(
        (
          radius -
          innerRadius
        ) /
        (
          outerRadius -
          innerRadius
        ),
        0.0,
        1.0
      );

    float fine =
      sin(
        r * 830.0
      ) * 0.5 + 0.5;

    float medium =
      sin(
        r * 145.0
      ) * 0.5 + 0.5;

    float broad =
      sin(
        r * 31.0
      ) * 0.5 + 0.5;

    float randomBand =
      hash(
        floor(
          r * 360.0
        )
      );

    float brightness =
      0.25 +
      fine * 0.14 +
      medium * 0.19 +
      broad * 0.15 +
      randomBand * 0.12;

    /*
      Cassini Division
    */

    float cassiniStart =
      smoothstep(
        0.515,
        0.527,
        r
      );

    float cassiniEnd =
      1.0 -
      smoothstep(
        0.565,
        0.578,
        r
      );

    float cassini =
      cassiniStart *
      cassiniEnd;

    brightness *=
      1.0 -
      cassini * 0.9;

    /*
      inner C-ring
    */

    if (r < 0.20) {
      brightness *= 0.48;
    }

    float innerFade =
      smoothstep(
        0.0,
        0.045,
        r
      );

    float outerFade =
      1.0 -
      smoothstep(
        0.88,
        1.0,
        r
      );

    float alpha =
      brightness *
      innerFade *
      outerFade;

    vec3 darkWarm =
      vec3(
        0.34,
        0.29,
        0.23
      );

    vec3 pale =
      vec3(
        0.82,
        0.76,
        0.64
      );

    vec3 color =
      mix(
        darkWarm,
        pale,
        brightness
      );

    gl_FragColor =
      vec4(
        color,
        alpha
      );
  }
`

/* =========================================================
   SATURN — NASA TEXTURE
========================================================= */

function Saturn({
  hovered,
  selected,
  onHover,
  onSelect,
}: InteractiveObjectProps) {
  const groupRef = useRef<Group>(null)

  useInteractiveScale(
    groupRef,
    1.42,
    hovered,
    selected,
  )

  const texture = useLoader(
    TextureLoader,
    '/textures/saturn.jpg',
  )

  useEffect(() => {
    texture.colorSpace =
      SRGBColorSpace

    texture.needsUpdate = true
  }, [texture])

  return (
    <group
      ref={groupRef}
      position={[
        -1.22,
        0.72,
        0.28,
      ]}
      rotation={[
        0.02,
        -0.08,
        -0.16,
      ]}
      scale={1.42}
      onPointerOver={event => {
        event.stopPropagation()
        onHover('SATURN')
      }}
      onPointerOut={event => {
        event.stopPropagation()
        onHover(null)
      }}
      onClick={event => {
        event.stopPropagation()

        if (event.delta <= 5) {
          onSelect('SATURN')
        }
      }}
    >
      {/* atmosphere */}

      <mesh scale={1.055}>
        <sphereGeometry
          args={[0.19, 64, 64]}
        />

        <meshBasicMaterial
          color="#c8ad79"
          transparent
          opacity={0.02}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>

      {/* Saturn body */}

      <mesh
        rotation={[
          0.05,
          0.5,
          0,
        ]}
        scale={[
          1,
          0.91,
          1,
        ]}
      >
        <sphereGeometry
          args={[0.19, 96, 96]}
        />

        <meshStandardMaterial
          map={texture}
          roughness={1}
          metalness={0}
          emissive="#c8ad79"
          emissiveIntensity={
            hovered
              ? 0.105
              : selected
                ? 0.06
                : 0
          }
        />
      </mesh>

      {/* rings */}

      <mesh
        rotation={[
          Math.PI / 2.18,
          0.12,
          -0.08,
        ]}
      >
        <ringGeometry
          args={[
            0.205,
            0.455,
            360,
          ]}
        />

        <shaderMaterial
          vertexShader={ringVertexShader}
          fragmentShader={ringFragmentShader}
          transparent
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>

      <Label
        text="SATURN"
        position={[
          0,
          0.42,
          0,
        ]}
        scale={0.38}
      />
    </group>
  )
}

/* =========================================================
   VEGA
========================================================= */

function Vega({
  hovered,
  selected,
  onHover,
  onSelect,
}: InteractiveObjectProps) {
  const groupRef = useRef<Group>(null)

  useInteractiveScale(
    groupRef,
    1,
    hovered,
    selected,
  )

  return (
    <group
      ref={groupRef}
      position={[
        -1.65,
        -0.72,
        -1.1,
      ]}
      onPointerOver={event => {
        event.stopPropagation()
        onHover('VEGA')
      }}
      onPointerOut={event => {
        event.stopPropagation()
        onHover(null)
      }}
      onClick={event => {
        event.stopPropagation()

        if (event.delta <= 5) {
          onSelect('VEGA')
        }
      }}
    >
      <mesh scale={5}>
        <sphereGeometry
          args={[0.028, 24, 24]}
        />

        <meshBasicMaterial
          color="#85bbec"
          transparent
          opacity={0.018}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>

      <mesh scale={2.4}>
        <sphereGeometry
          args={[0.028, 24, 24]}
        />

        <meshBasicMaterial
          color="#bfe0ff"
          transparent
          opacity={
            hovered
              ? 0.16
              : selected
                ? 0.12
                : 0.09
          }
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>

      <mesh>
        <sphereGeometry
          args={[0.028, 28, 28]}
        />

        <meshBasicMaterial
          color="#edf7ff"
        />
      </mesh>

      <Label
        text="VEGA"
        position={[
          0,
          0.16,
          0,
        ]}
        scale={0.3}
      />
    </group>
  )
}

/* =========================================================
   CAMERA
========================================================= */

function CameraRig({
  zoom,
}: {
  zoom: number
}) {
  const { camera } = useThree()

  useFrame(() => {
    camera.position.z =
      MathUtils.lerp(
        camera.position.z,
        zoom,
        0.075,
      )

    camera.lookAt(0, 0, 0)
  })

  return null
}

/* =========================================================
   ENTIRE SYSTEM
========================================================= */

function SpaceSystem({
  target,
  dragging,
  hoveredObject,
  selectedObject,
  onHover,
  onSelect,
}: {
  target: {
    x: number
    y: number
  }

  dragging: boolean
  hoveredObject: CelestialObject | null
  selectedObject: CelestialObject | null
  onHover: (
    object: CelestialObject | null,
  ) => void
  onSelect: (
    object: CelestialObject,
  ) => void
}) {
  const ref = useRef<Group>(null)

  useFrame((_, delta) => {
    if (!ref.current) return

    if (!dragging) {
      target.y +=
        delta * 0.012
    }

    ref.current.rotation.x =
      MathUtils.lerp(
        ref.current.rotation.x,
        target.x,
        0.07,
      )

    ref.current.rotation.y =
      MathUtils.lerp(
        ref.current.rotation.y,
        target.y,
        0.07,
      )
  })

  return (
    <group
      ref={ref}
      rotation={[
        0.1,
        -0.08,
        0.01,
      ]}
    >
      <Orbit
        radius={1.05}
        rotation={[
          Math.PI / 2.15,
          0.14,
          0.08,
        ]}
        opacity={0.04}
      />

      <Orbit
        radius={1.62}
        rotation={[
          Math.PI / 2.08,
          -0.09,
          -0.12,
        ]}
        opacity={0.026}
      />

      <Orbit
        radius={2.18}
        rotation={[
          Math.PI / 2.24,
          0.08,
          0.23,
        ]}
        opacity={0.016}
      />

      <Sun
        hovered={hoveredObject === 'SUN'}
        selected={selectedObject === 'SUN'}
        onHover={onHover}
        onSelect={onSelect}
      />

      <Saturn
        hovered={hoveredObject === 'SATURN'}
        selected={selectedObject === 'SATURN'}
        onHover={onHover}
        onSelect={onSelect}
      />

      <Jupiter
        hovered={hoveredObject === 'JUPITER'}
        selected={selectedObject === 'JUPITER'}
        onHover={onHover}
        onSelect={onSelect}
      />

      <Mars
        hovered={hoveredObject === 'MARS'}
        selected={selectedObject === 'MARS'}
        onHover={onHover}
        onSelect={onSelect}
      />

      <Vega
        hovered={hoveredObject === 'VEGA'}
        selected={selectedObject === 'VEGA'}
        onHover={onHover}
        onSelect={onSelect}
      />
    </group>
  )
}

/* =========================================================
   HERO SPACE
========================================================= */

export default function HeroSpace() {
  const [dragging, setDragging] =
    useState(false)

  const [
    hoveredObject,
    setHoveredObject,
  ] =
    useState<CelestialObject | null>(
      null,
    )

  const [
    selectedObject,
    setSelectedObject,
  ] =
    useState<CelestialObject | null>(
      null,
    )

  const target = useRef({
    x: 0.17,
    y: -0.13,
  })

  const last = useRef({
    x: 0,
    y: 0,
  })

  const [zoom, setZoom] =
    useState(4.05)

  const containerRef =
    useRef<HTMLDivElement>(null)

  /*
    IMPORTANT
    기존에 정상 작동하던 native wheel zoom
    그대로 유지
  */

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    const handleWheel = (
      e: WheelEvent,
    ) => {
      e.preventDefault()
      e.stopPropagation()

      setZoom(v =>
        MathUtils.clamp(
          v +
          e.deltaY *
          0.003,
          1.8,
          7.0,
        ),
      )
    }

    container.addEventListener(
      'wheel',
      handleWheel,
      {
        passive: false,
      },
    )

    return () => {
      container.removeEventListener(
        'wheel',
        handleWheel,
      )
    }
  }, [])

  /*
    R3F의 pointer 이벤트는 내부 Raycaster를 사용한다.
    기존 드래그 / wheel zoom과 분리해서 커서만 보정한다.
  */

  useEffect(() => {
    const container =
      containerRef.current

    if (!container) return

    container.style.cursor =
      dragging
        ? 'grabbing'
        : hoveredObject
          ? 'pointer'
          : 'grab'

    return () => {
      container.style.cursor = ''
    }
  }, [
    dragging,
    hoveredObject,
  ])

  const activeObject =
    hoveredObject ??
    selectedObject

  const activeMeta =
    activeObject
      ? objectMeta[activeObject]
      : null

  return (
    <div
      ref={containerRef}
      className="hero-space-canvas hero-space-interactive"
      aria-label="마우스로 드래그해 회전하고 휠로 확대할 수 있는 3D 천체 공간"
      onPointerDown={e => {
        setDragging(true)

        last.current = {
          x: e.clientX,
          y: e.clientY,
        }

        e.currentTarget.setPointerCapture(
          e.pointerId,
        )
      }}
      onPointerMove={e => {
        if (!dragging) return

        const dx =
          e.clientX -
          last.current.x

        const dy =
          e.clientY -
          last.current.y

        last.current = {
          x: e.clientX,
          y: e.clientY,
        }

        target.current.y +=
          dx * 0.01

        target.current.x =
          MathUtils.clamp(
            target.current.x +
            dy * 0.008,
            -1.15,
            1.15,
          )
      }}
      onPointerUp={e => {
        setDragging(false)

        if (
          e.currentTarget.hasPointerCapture(
            e.pointerId,
          )
        ) {
          e.currentTarget.releasePointerCapture(
            e.pointerId,
          )
        }
      }}
      onPointerCancel={() => {
        setDragging(false)
      }}
    >
      <Canvas
        camera={{
          position: [
            0,
            0,
            4.05,
          ],
          fov: 41,
          near: 0.1,
          far: 60,
        }}
        dpr={[1.25, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference:
            'high-performance',
        }}
        onPointerMissed={() => {
          setSelectedObject(null)
        }}
        onCreated={({ gl }) => {
          gl.toneMapping =
            ACESFilmicToneMapping

          gl.toneMappingExposure =
            1.05

          gl.outputColorSpace =
            SRGBColorSpace
        }}
      >
        <color
          attach="background"
          args={['#010208']}
        />

        <fog
          attach="fog"
          args={[
            '#010208',
            10,
            25,
          ]}
        />

        {/* minimal ambient fill */}

        <ambientLight
          intensity={0.055}
          color="#8793a1"
        />

        {/* deep background */}

        <StarField
          count={360}
          spread={15}
          size={0.011}
          opacity={0.65}
        />

        <StarField
          count={120}
          spread={20}
          size={0.006}
          opacity={0.56}
        />

        <StarField
          count={42}
          spread={11}
          size={0.021}
          opacity={0.17}
        />

        <SpaceSystem
          target={target.current}
          dragging={dragging}
          hoveredObject={hoveredObject}
          selectedObject={selectedObject}
          onHover={setHoveredObject}
          onSelect={object => {
            setSelectedObject(
              current =>
                current === object
                  ? null
                  : object,
            )
          }}
        />

        <CameraRig
          zoom={zoom}
        />
      </Canvas>

      <div
        className={[
          'hero-object-hud',
          activeObject
            ? 'is-visible'
            : '',
          selectedObject === activeObject &&
            activeObject
            ? 'is-selected'
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-live="polite"
        aria-hidden={!activeObject}
      >
        <span className="hero-object-hud__kicker">
          {selectedObject === activeObject &&
            activeObject
            ? 'SELECTED OBJECT'
            : 'OBJECT IN VIEW'}
        </span>

        <strong>
          {activeMeta?.label ?? ''}
        </strong>

        <p>
          {activeMeta?.description ?? ''}
        </p>

        <i aria-hidden="true" />
      </div>

      <div
        className="hero-space-hint"
        aria-hidden="true"
      >
        DRAG 360° · WHEEL TO ZOOM · CLICK TO SELECT
      </div>
    </div>
  )
}