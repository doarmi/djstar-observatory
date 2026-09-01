import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { navigateTo } from '../lib/navigation'

gsap.registerPlugin(ScrollTrigger)

const STAR_COUNT = 850

export default function SpaceOutro() {
    const sectionRef = useRef<HTMLElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const mainRef = useRef<HTMLDivElement>(null)
    const brandRef = useRef<HTMLDivElement>(null)
    const progressRef = useRef<HTMLSpanElement>(null)

    useEffect(() => {
        const section = sectionRef.current
        const canvas = canvasRef.current

        if (!section || !canvas) return

        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches

        if (reducedMotion) return

        const scene = new THREE.Scene()
        scene.background = new THREE.Color('#02050b')

        const camera = new THREE.PerspectiveCamera(
            56,
            window.innerWidth / window.innerHeight,
            0.1,
            240,
        )
        camera.position.z = 16

        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            powerPreference: 'high-performance',
        })

        renderer.setPixelRatio(
            Math.min(window.devicePixelRatio || 1, 1.7),
        )
        renderer.setSize(
            window.innerWidth,
            window.innerHeight,
            false,
        )
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1

        const geometry = new THREE.BufferGeometry()
        const positions = new Float32Array(STAR_COUNT * 3)
        const sizes = new Float32Array(STAR_COUNT)

        for (let i = 0; i < STAR_COUNT; i++) {
            const i3 = i * 3
            const angle = Math.random() * Math.PI * 2
            const radius = 8 + Math.pow(Math.random(), 0.55) * 72

            positions[i3] = Math.cos(angle) * radius
            positions[i3 + 1] =
                Math.sin(angle) * radius * 0.58
            positions[i3 + 2] =
                -10 - Math.random() * 130

            sizes[i] = 0.55 + Math.random() * 1.55
        }

        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(positions, 3),
        )
        geometry.setAttribute(
            'aSize',
            new THREE.BufferAttribute(sizes, 1),
        )

        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexShader: `
        attribute float aSize;
        varying float vFade;

        void main() {
          vec4 mvPosition =
            modelViewMatrix * vec4(position, 1.0);

          vFade = clamp(
            1.0 - (-mvPosition.z / 170.0),
            0.25,
            1.0
          );

          gl_PointSize =
            aSize *
            (155.0 / max(1.0, -mvPosition.z));

          gl_Position =
            projectionMatrix * mvPosition;
        }
      `,
            fragmentShader: `
        varying float vFade;

        void main() {
          float d =
            distance(gl_PointCoord, vec2(0.5));

          float alpha =
            smoothstep(0.5, 0.0, d);

          vec3 color =
            mix(
              vec3(0.58, 0.72, 1.0),
              vec3(0.98, 0.99, 1.0),
              vFade
            );

          gl_FragColor =
            vec4(color, alpha * vFade);
        }
      `,
        })

        const stars = new THREE.Points(
            geometry,
            material,
        )
        scene.add(stars)

        const glowTexture = createGlowTexture()

        const glowMaterial =
            new THREE.SpriteMaterial({
                map: glowTexture,
                color: '#789fe8',
                transparent: true,
                opacity: 0.22,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            })

        const glow = new THREE.Sprite(
            glowMaterial,
        )
        glow.position.set(0, 2, -85)
        glow.scale.set(36, 36, 1)
        scene.add(glow)

        const pointer = new THREE.Vector2()
        const targetPointer = new THREE.Vector2()

        const onPointerMove = (
            event: PointerEvent,
        ) => {
            targetPointer.x =
                (event.clientX / window.innerWidth - 0.5) * 2
            targetPointer.y =
                (event.clientY / window.innerHeight - 0.5) * 2
        }

        window.addEventListener(
            'pointermove',
            onPointerMove,
            { passive: true },
        )

        let progress = 0

        const ctx = gsap.context(() => {
            gsap.set(brandRef.current, {
                opacity: 0,
                scale: 0.96,
            })

            const trigger =
                ScrollTrigger.create({
                    trigger: section,
                    start: 'top top',
                    end: '+=180%',
                    pin: true,
                    pinSpacing: true,
                    scrub: 0.6,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,

                    onUpdate: self => {
                        progress = self.progress

                        if (progressRef.current) {
                            progressRef.current.textContent =
                                `${Math.round(
                                    self.progress * 100,
                                )
                                    .toString()
                                    .padStart(2, '0')}`
                        }

                        if (mainRef.current) {
                            const mainOut =
                                1 -
                                smoothstep(
                                    0.55,
                                    0.78,
                                    self.progress,
                                )

                            mainRef.current.style.opacity =
                                String(mainOut)

                            mainRef.current.style.transform =
                                `translate3d(
                  0,
                  ${-self.progress * 36}px,
                  0
                )
                scale(${1 - self.progress * 0.035})`
                        }

                        if (brandRef.current) {
                            const brandIn =
                                smoothstep(
                                    0.69,
                                    0.87,
                                    self.progress,
                                )

                            brandRef.current.style.opacity =
                                String(brandIn)

                            brandRef.current.style.transform =
                                `translate(-50%, -50%)
                 scale(${0.96 + brandIn * 0.04})`
                        }
                    },
                })

            return () => trigger.kill()
        }, section)

        let raf = 0
        const clock = new THREE.Clock()

        const render = () => {
            const time = clock.getElapsedTime()

            pointer.lerp(
                targetPointer,
                0.035,
            )

            camera.position.x =
                pointer.x * 0.28
            camera.position.y =
                -pointer.y * 0.2

            camera.position.z =
                16 - progress * 18

            stars.rotation.z =
                time * 0.0015

            stars.rotation.x =
                pointer.y * 0.006

            const spread =
                1 + progress * 0.22

            stars.scale.set(
                spread,
                spread,
                1,
            )

            const pulse =
                1 +
                Math.sin(time * 0.75) * 0.025

            glow.scale.set(
                36 * pulse +
                progress * 18,
                36 * pulse +
                progress * 18,
                1,
            )

            glowMaterial.opacity =
                0.18 +
                progress * 0.15

            renderer.render(
                scene,
                camera,
            )

            raf = requestAnimationFrame(render)
        }

        render()

        const onResize = () => {
            camera.aspect =
                window.innerWidth /
                window.innerHeight
            camera.updateProjectionMatrix()

            renderer.setPixelRatio(
                Math.min(
                    window.devicePixelRatio || 1,
                    1.7,
                ),
            )
            renderer.setSize(
                window.innerWidth,
                window.innerHeight,
                false,
            )

            ScrollTrigger.refresh()
        }

        window.addEventListener(
            'resize',
            onResize,
        )

        return () => {
            cancelAnimationFrame(raf)

            window.removeEventListener(
                'resize',
                onResize,
            )
            window.removeEventListener(
                'pointermove',
                onPointerMove,
            )

            ctx.revert()
            geometry.dispose()
            material.dispose()
            glowTexture.dispose()
            glowMaterial.dispose()
            renderer.dispose()
        }
    }, [])

    return (
        <section
            ref={sectionRef}
            className="space-outro"
            aria-label="대전시민천문대 방문 안내"
        >
            <canvas
                ref={canvasRef}
                className="space-outro__canvas"
            />

            <div className="space-outro__vignette" />

            <div className="space-outro__top">
                <span>DJSTAR · NIGHT OBSERVATION</span>
                <i />
                <span>
                    JOURNEY <b ref={progressRef}>00</b>%
                </span>
            </div>

            <div
                ref={mainRef}
                className="space-outro__main"
            >
                <p className="space-outro__eyebrow">
                    THE NIGHT IS WAITING
                </p>

                <h2>
                    밤하늘은
                    <br />
                    <strong>여기서 더 가까워집니다.</strong>
                </h2>

                <p className="space-outro__description">
                    대전시민천문대에서
                    <br />
                    당신의 우주를 발견해 보세요.
                </p>

                <button
                    className="space-outro__cta"
                    type="button"
                    onClick={() =>
                        navigateTo('/reservation')
                    }
                >
                    <span>관측 프로그램 예약하기</span>
                    <b>↗</b>
                </button>
            </div>

            <div
                ref={brandRef}
                className="space-outro__brand"
            >
                <span>THE JOURNEY CONTINUES</span>
                <strong>DJSTAR</strong>
                <p>DAEJEON CITIZEN OBSERVATORY</p>
            </div>

            <div className="space-outro__coordinates">
                <span>36°23′N</span>
                <i />
                <span>127°22′E</span>
            </div>

            <div className="space-outro__scroll">
                <span>TO THE OBSERVATORY</span>
                <i />
            </div>
        </section>
    )
}

function createGlowTexture() {
    const size = 256
    const canvas =
        document.createElement('canvas')

    canvas.width = size
    canvas.height = size

    const context =
        canvas.getContext('2d')!

    const gradient =
        context.createRadialGradient(
            size / 2,
            size / 2,
            0,
            size / 2,
            size / 2,
            size / 2,
        )

    gradient.addColorStop(
        0,
        'rgba(220,235,255,.9)',
    )
    gradient.addColorStop(
        0.2,
        'rgba(120,165,240,.48)',
    )
    gradient.addColorStop(
        0.55,
        'rgba(64,105,190,.14)',
    )
    gradient.addColorStop(
        1,
        'rgba(30,60,120,0)',
    )

    context.fillStyle = gradient
    context.fillRect(0, 0, size, size)

    return new THREE.CanvasTexture(
        canvas,
    )
}

function smoothstep(
    edge0: number,
    edge1: number,
    value: number,
) {
    const x = Math.max(
        0,
        Math.min(
            1,
            (value - edge0) /
            (edge1 - edge0),
        ),
    )

    return x * x * (3 - 2 * x)
}
