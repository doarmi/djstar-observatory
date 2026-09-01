import {
  Canvas,
  useFrame,
  useLoader,
} from '@react-three/fiber'

import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  DoubleSide,
  Group,
  SRGBColorSpace,
  TextureLoader,
} from 'three'

import {
  useMemo,
  useRef,
} from 'react'

/* =========================================================
   SATURN RING SHADER
========================================================= */

const ringVertexShader = `
  varying vec2 vRingPosition;

  void main() {
    vRingPosition = position.xy;

    gl_Position =
      projectionMatrix *
      modelViewMatrix *
      vec4(position, 1.0);
  }
`

const ringFragmentShader = `
  precision highp float;

  varying vec2 vRingPosition;

  float hash(float n) {
    return fract(
      sin(n * 1234.567) *
      43758.5453
    );
  }

  void main() {
    float r = length(vRingPosition);

    const float innerRadius = 1.28;
    const float outerRadius = 2.06;

    float t = clamp(
      (r - innerRadius) /
      (outerRadius - innerRadius),
      0.0,
      1.0
    );

    float edgeFade =
      smoothstep(
        0.0,
        0.025,
        t
      ) *
      (
        1.0 -
        smoothstep(
          0.965,
          1.0,
          t
        )
      );

    float bands =
      sin(t * 46.0) * 0.16 +
      sin(t * 112.0 + 0.8) * 0.09 +
      sin(t * 265.0 + 1.4) * 0.045 +
      sin(t * 610.0) * 0.025;

    float grain =
      (
        hash(
          floor(
            t * 900.0
          )
        ) -
        0.5
      ) *
      0.05;

    float cassini =
      smoothstep(
        0.018,
        0.035,
        abs(t - 0.64)
      );

    float cRing =
      smoothstep(
        0.0,
        0.14,
        t
      ) *
      (
        1.0 -
        smoothstep(
          0.20,
          0.32,
          t
        )
      );

    float brightness =
      clamp(
        0.59 +
        bands +
        grain,
        0.0,
        1.0
      );

    vec3 darkRing =
      vec3(
        0.255,
        0.235,
        0.205
      );

    vec3 warmRing =
      vec3(
        0.64,
        0.59,
        0.50
      );

    vec3 brightRing =
      vec3(
        0.82,
        0.78,
        0.69
      );

    vec3 color =
      mix(
        darkRing,
        warmRing,
        brightness
      );

    color =
      mix(
        color,
        brightRing,
        smoothstep(
          0.52,
          0.88,
          brightness
        ) *
        0.42
      );

    color *=
      mix(
        0.72,
        1.0,
        1.0 - cRing
      );

    color *=
      mix(
        0.18,
        1.0,
        cassini
      );

    float alpha =
      edgeFade *
      mix(
        0.44,
        0.78,
        brightness
      ) *
      mix(
        0.32,
        1.0,
        cassini
      );

    gl_FragColor =
      vec4(
        color,
        alpha
      );
  }
`

/* =========================================================
   SATURN
========================================================= */

function Saturn({
  magnification,
}: {
  magnification: number
}) {
  const wholeRef =
    useRef<Group>(null)

  const planetRef =
    useRef<Group>(null)

  const texture =
    useLoader(
      TextureLoader,
      '/textures/saturn.jpg',
    )

  useMemo(() => {
    texture.colorSpace =
      SRGBColorSpace

    texture.anisotropy =
      8

    texture.needsUpdate =
      true
  }, [texture])

  /* =========================================================
     MAGNIFICATION SCALE
  ========================================================= */

  const targetScale =
    useMemo(() => {
      if (
        magnification >= 200
      ) {
        return 2.05
      }

      if (
        magnification >= 100
      ) {
        return 1.48
      }

      return 1
    }, [magnification])

  /* =========================================================
     Y POSITION
     배율별 중심 보정
  ========================================================= */

  const targetY =
    useMemo(() => {
      if (
        magnification >= 200
      ) {
        return 1.12
      }

      if (
        magnification >= 100
      ) {
        return 0.88
      }

      return 1.15
    }, [magnification])

  useFrame(
    (
      _,
      delta,
    ) => {
      /* 토성 본체만 자전 */

      if (
        planetRef.current
      ) {
        planetRef.current.rotation.y +=
          delta * 0.035
      }

      /* 전체 확대 + 위치 보정 */

      if (
        wholeRef.current
      ) {
        const currentScale =
          wholeRef.current.scale.x

        const nextScale =
          currentScale +
          (
            targetScale -
            currentScale
          ) *
          Math.min(
            1,
            delta * 4.5,
          )

        wholeRef.current.scale.setScalar(
          nextScale,
        )

        wholeRef.current.position.y +=
          (
            targetY -
            wholeRef.current.position.y
          ) *
          Math.min(
            1,
            delta * 4.5,
          )
      }
    },
  )

  return (
    <group
      ref={wholeRef}
      position={[
        0,
        1.15,
        0,
      ]}
      scale={1}
    >
      {/* =====================================================
          SATURN BODY
      ===================================================== */}

      <group
        ref={planetRef}
        rotation={[
          0,
          0,
          -0.24,
        ]}
      >
        <mesh
          scale={[
            1,
            0.92,
            1,
          ]}
        >
          <sphereGeometry
            args={[
              1,
              128,
              128,
            ]}
          />

          <meshStandardMaterial
            map={texture}
            bumpMap={texture}
            bumpScale={0.0018}
            roughness={0.78}
            metalness={0}
          />
        </mesh>

        <mesh
          scale={1.1}
        >
          <sphereGeometry
            args={[
              1,
              64,
              64,
            ]}
          />

          <meshBasicMaterial
            color="#d4b477"
            transparent
            opacity={0.012}
            depthWrite={false}
            blending={
              AdditiveBlending
            }
          />
        </mesh>
      </group>

      {/* =====================================================
          SATURN RINGS
      ===================================================== */}

      <mesh
        rotation={[
          Math.PI / 2.08,
          0.08,
          -0.24,
        ]}
      >
        <ringGeometry
          args={[
            1.28,
            2.06,
            420,
          ]}
        />

        <shaderMaterial
          vertexShader={
            ringVertexShader
          }
          fragmentShader={
            ringFragmentShader
          }
          transparent
          side={
            DoubleSide
          }
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

/* =========================================================
   STAR FIELD
========================================================= */

function FieldStars() {
  const {
    faint,
    bright,
  } = useMemo(() => {
    const faintCount =
      220

    const brightCount =
      28

    const faintData =
      new Float32Array(
        faintCount * 3,
      )

    const brightData =
      new Float32Array(
        brightCount * 3,
      )

    for (
      let i = 0;
      i < faintCount;
      i += 1
    ) {
      faintData[
        i * 3
      ] =
        (
          Math.random() -
          0.5
        ) *
        11

      faintData[
        i * 3 + 1
      ] =
        (
          Math.random() -
          0.5
        ) *
        7

      faintData[
        i * 3 + 2
      ] =
        -1 -
        Math.random() *
        6
    }

    for (
      let i = 0;
      i < brightCount;
      i += 1
    ) {
      brightData[
        i * 3
      ] =
        (
          Math.random() -
          0.5
        ) *
        10

      brightData[
        i * 3 + 1
      ] =
        (
          Math.random() -
          0.5
        ) *
        6

      brightData[
        i * 3 + 2
      ] =
        -1.2 -
        Math.random() *
        5
    }

    return {
      faint:
        faintData,

      bright:
        brightData,
    }
  }, [])

  return (
    <>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              faint,
              3,
            ]}
          />
        </bufferGeometry>

        <pointsMaterial
          color="#cbdcf3"
          size={0.022}
          transparent
          opacity={0.42}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              bright,
              3,
            ]}
          />
        </bufferGeometry>

        <pointsMaterial
          color="#f5f9ff"
          size={0.038}
          transparent
          opacity={0.72}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </>
  )
}

/* =========================================================
   TELESCOPE SCENE
========================================================= */

function TelescopeScene({
  magnification,
}: {
  magnification: number
}) {
  return (
    <>
      <ambientLight
        intensity={0.085}
        color="#8c9198"
      />

      <directionalLight
        position={[
          4.2,
          2.7,
          5.2,
        ]}
        intensity={2.65}
        color="#fff7e8"
      />

      <directionalLight
        position={[
          -3.2,
          -1.2,
          1.8,
        ]}
        intensity={0.12}
        color="#8394aa"
      />

      <pointLight
        position={[
          0.8,
          2.8,
          -1.2,
        ]}
        intensity={0.07}
        color="#d9e4f1"
      />

      <FieldStars />

      <Saturn
        magnification={
          magnification
        }
      />
    </>
  )
}

/* =========================================================
   SATURN TELESCOPE
========================================================= */

export default function SaturnTelescope({
  magnification,
}: {
  magnification: number
}) {
  return (
    <div
      className={`saturn-canvas magnification-${magnification}`}
      aria-label={`토성 ${magnification}배 관측 시뮬레이션`}
      style={{
        position:
          'absolute',

        inset: 0,

        overflow:
          'hidden',

        borderRadius:
          '50%',

        background:
          'radial-gradient(circle at center, rgba(12,20,35,.28) 0%, rgba(2,6,15,.82) 72%, rgba(0,0,0,1) 100%)',
      }}
    >
      <Canvas
        camera={{
          position: [
            0,
            0,
            9.15,
          ],

          fov: 42,

          near: 0.1,

          far: 30,
        }}
        dpr={[
          1.5,
          2,
        ]}
        gl={{
          antialias:
            true,

          alpha:
            true,

          powerPreference:
            'high-performance',
        }}
        onCreated={({
          gl,
        }) => {
          gl.outputColorSpace =
            SRGBColorSpace

          gl.toneMapping =
            ACESFilmicToneMapping

          gl.toneMappingExposure =
            0.98
        }}
      >
        <TelescopeScene
          magnification={
            magnification
          }
        />
      </Canvas>

      {/* =====================================================
          TELESCOPE VIGNETTE
      ===================================================== */}

      <div
        aria-hidden="true"
        style={{
          position:
            'absolute',

          inset: 0,

          borderRadius:
            '50%',

          pointerEvents:
            'none',

          boxShadow:
            magnification >=
              200
              ? 'inset 0 0 50px 19px rgba(0,0,0,.78), inset 0 0 8px rgba(130,165,210,.12)'
              : 'inset 0 0 46px 18px rgba(0,0,0,.74), inset 0 0 8px rgba(130,165,210,.1)',
        }}
      />

      {/* =====================================================
          ATMOSPHERIC SOFTNESS
      ===================================================== */}

      <div
        aria-hidden="true"
        style={{
          position:
            'absolute',

          inset:
            magnification >=
              200
              ? '1%'
              : '0',

          borderRadius:
            '50%',

          pointerEvents:
            'none',

          opacity:
            magnification >=
              200
              ? 0.075
              : magnification >=
                100
                ? 0.025
                : 0,

          backdropFilter:
            magnification >=
              200
              ? 'blur(0.35px)'
              : magnification >=
                100
                ? 'blur(0.1px)'
                : 'none',
        }}
      />
    </div>
  )
}