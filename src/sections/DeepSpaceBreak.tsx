import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const STAR_COUNT = 1200
const STREAK_COUNT = 90

export default function DeepSpaceBreak() {
    const sectionRef = useRef<HTMLElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const copyRef = useRef<HTMLDivElement>(null)
    const eyebrowRef = useRef<HTMLDivElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)
    const koreanRef = useRef<HTMLParagraphElement>(null)
    const footerRef = useRef<HTMLDivElement>(null)
    const progressRef = useRef<HTMLSpanElement>(null)

    useEffect(() => {
        const section = sectionRef.current
        const canvas = canvasRef.current
        const copy = copyRef.current

        if (!section || !canvas || !copy) return

        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches

        if (reducedMotion) return

        const scene = new THREE.Scene()
        scene.background = new THREE.Color('#02050c')
        scene.fog = new THREE.FogExp2('#02050c', 0.027)

        const camera = new THREE.PerspectiveCamera(
            58,
            window.innerWidth / window.innerHeight,
            0.1,
            300,
        )

        camera.position.set(0, 0, 13)

        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
        })

        renderer.setPixelRatio(
            Math.min(window.devicePixelRatio || 1, 1.8),
        )

        renderer.setSize(
            window.innerWidth,
            window.innerHeight,
            false,
        )

        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.05

        /* =========================================================
           STAR FIELD
        ========================================================= */

        const starGeometry = new THREE.BufferGeometry()
        const starPositions = new Float32Array(STAR_COUNT * 3)
        const starSizes = new Float32Array(STAR_COUNT)

        for (let i = 0; i < STAR_COUNT; i++) {
            const i3 = i * 3

            const radius = 18 + Math.random() * 92
            const angle = Math.random() * Math.PI * 2
            const spread = Math.pow(Math.random(), 0.62)

            starPositions[i3] =
                Math.cos(angle) * radius * spread

            starPositions[i3 + 1] =
                Math.sin(angle) * radius * spread * 0.62

            starPositions[i3 + 2] =
                -18 - Math.random() * 160

            starSizes[i] = 0.45 + Math.random() * 1.8
        }

        starGeometry.setAttribute(
            'position',
            new THREE.BufferAttribute(starPositions, 3),
        )

        starGeometry.setAttribute(
            'aSize',
            new THREE.BufferAttribute(starSizes, 1),
        )

        const starMaterial = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexShader: `
        attribute float aSize;
        varying float vDepth;

        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vDepth = clamp((-mvPosition.z) / 150.0, 0.0, 1.0);

          gl_PointSize =
            aSize *
            (170.0 / max(1.0, -mvPosition.z));

          gl_Position = projectionMatrix * mvPosition;
        }
      `,
            fragmentShader: `
        varying float vDepth;

        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          float alpha = smoothstep(0.5, 0.0, d);

          vec3 cool = vec3(0.60, 0.76, 1.0);
          vec3 white = vec3(0.96, 0.985, 1.0);
          vec3 color = mix(white, cool, vDepth * 0.62);

          gl_FragColor = vec4(color, alpha * 0.94);
        }
      `,
        })

        const starField = new THREE.Points(
            starGeometry,
            starMaterial,
        )

        scene.add(starField)

        /* =========================================================
           FORWARD STREAKS
        ========================================================= */

        const streakGroup = new THREE.Group()

        for (let i = 0; i < STREAK_COUNT; i++) {
            const geometry = new THREE.BufferGeometry()

            const x = (Math.random() - 0.5) * 48
            const y = (Math.random() - 0.5) * 28
            const z = -25 - Math.random() * 115
            const len = 1 + Math.random() * 5

            geometry.setAttribute(
                'position',
                new THREE.Float32BufferAttribute(
                    [
                        x, y, z,
                        x * 1.018, y * 1.018, z + len,
                    ],
                    3,
                ),
            )

            const material = new THREE.LineBasicMaterial({
                color: new THREE.Color(
                    i % 5 === 0 ? '#88aef9' : '#d9ebff',
                ),
                transparent: true,
                opacity: 0.08 + Math.random() * 0.18,
                blending: THREE.AdditiveBlending,
            })

            const line = new THREE.Line(
                geometry,
                material,
            )

            streakGroup.add(line)
        }

        scene.add(streakGroup)

        /* =========================================================
           CENTRAL LIGHT / PORTAL
        ========================================================= */

        const glowTexture = createGlowTexture()

        const glowMaterial = new THREE.SpriteMaterial({
            map: glowTexture,
            color: '#b6d4ff',
            transparent: true,
            opacity: 0.52,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        })

        const glow = new THREE.Sprite(glowMaterial)
        glow.position.set(0, 0, -78)
        glow.scale.set(17, 17, 1)
        scene.add(glow)

        const coreMaterial = new THREE.SpriteMaterial({
            map: glowTexture,
            color: '#f4fbff',
            transparent: true,
            opacity: 0.74,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        })

        const core = new THREE.Sprite(coreMaterial)
        core.position.set(0, 0, -76)
        core.scale.set(5.5, 5.5, 1)
        scene.add(core)

        /* =========================================================
           POINTER PARALLAX
        ========================================================= */

        const pointer = new THREE.Vector2(0, 0)
        const targetPointer = new THREE.Vector2(0, 0)

        const handlePointerMove = (
            event: PointerEvent,
        ) => {
            targetPointer.x =
                (event.clientX / window.innerWidth - 0.5) * 2

            targetPointer.y =
                (event.clientY / window.innerHeight - 0.5) * 2
        }

        window.addEventListener(
            'pointermove',
            handlePointerMove,
            { passive: true },
        )

        /* =========================================================
           SCROLL PROGRESS
        ========================================================= */

        let scrollProgress = 0

        const ctx = gsap.context(() => {
            gsap.set(
                [
                    eyebrowRef.current,
                    titleRef.current,
                    koreanRef.current,
                    footerRef.current,
                ],
                {
                    opacity: 0,
                    y: 24,
                },
            )

            const trigger = ScrollTrigger.create({
                trigger: section,
                start: 'top top',
                end: '+=220%',
                pin: true,
                pinSpacing: true,
                scrub: 0.55,
                anticipatePin: 1,
                invalidateOnRefresh: true,

                onUpdate: self => {
                    scrollProgress = self.progress

                    if (progressRef.current) {
                        progressRef.current.textContent =
                            `${Math.round(self.progress * 100)
                                .toString()
                                .padStart(2, '0')}`
                    }

                    const copyIn = smoothstep(
                        0.10,
                        0.28,
                        self.progress,
                    )

                    const copyOut =
                        1 -
                        smoothstep(
                            0.76,
                            0.94,
                            self.progress,
                        )

                    const copyOpacity =
                        copyIn * copyOut

                    if (copyRef.current) {
                        copyRef.current.style.opacity =
                            String(copyOpacity)

                        copyRef.current.style.transform =
                            `translate3d(
                0,
                ${(1 - copyIn) * 34 - self.progress * 8}px,
                0
              )`
                    }

                    if (eyebrowRef.current) {
                        eyebrowRef.current.style.opacity =
                            String(
                                smoothstep(
                                    0.12,
                                    0.24,
                                    self.progress,
                                ) *
                                copyOut,
                            )
                    }

                    if (titleRef.current) {
                        titleRef.current.style.opacity =
                            String(
                                smoothstep(
                                    0.18,
                                    0.33,
                                    self.progress,
                                ) *
                                copyOut,
                            )
                    }

                    if (koreanRef.current) {
                        koreanRef.current.style.opacity =
                            String(
                                smoothstep(
                                    0.26,
                                    0.40,
                                    self.progress,
                                ) *
                                copyOut,
                            )
                    }

                    if (footerRef.current) {
                        footerRef.current.style.opacity =
                            String(
                                smoothstep(
                                    0.34,
                                    0.48,
                                    self.progress,
                                ) *
                                copyOut,
                            )
                    }
                },
            })

            return () => {
                trigger.kill()
            }
        }, section)

        /* =========================================================
           RENDER LOOP
        ========================================================= */

        let raf = 0
        const clock = new THREE.Clock()

        const render = () => {
            const elapsed = clock.getElapsedTime()

            pointer.lerp(
                targetPointer,
                0.045,
            )

            camera.position.x =
                pointer.x * 0.42

            camera.position.y =
                -pointer.y * 0.28

            const travel =
                easeInOutCubic(
                    scrollProgress,
                )

            camera.position.z =
                13 - travel * 62

            camera.fov =
                58 - travel * 9

            camera.updateProjectionMatrix()

            starField.rotation.z =
                elapsed * 0.003 +
                pointer.x * 0.014

            starField.rotation.x =
                pointer.y * 0.008

            streakGroup.rotation.z =
                -elapsed * 0.002

            const streakScale =
                0.72 +
                scrollProgress * 2.7

            streakGroup.scale.set(
                1,
                1,
                streakScale,
            )

            const glowPulse =
                1 +
                Math.sin(elapsed * 1.55) * 0.055

            glow.scale.set(
                17 * glowPulse +
                scrollProgress * 18,
                17 * glowPulse +
                scrollProgress * 18,
                1,
            )

            core.scale.set(
                5.5 +
                scrollProgress * 12,
                5.5 +
                scrollProgress * 12,
                1,
            )

            glowMaterial.opacity =
                0.36 +
                scrollProgress * 0.48

            coreMaterial.opacity =
                0.58 +
                scrollProgress * 0.34

            renderer.render(
                scene,
                camera,
            )

            raf =
                requestAnimationFrame(
                    render,
                )
        }

        render()

        /* =========================================================
           RESIZE
        ========================================================= */

        const handleResize = () => {
            camera.aspect =
                window.innerWidth /
                window.innerHeight

            camera.updateProjectionMatrix()

            renderer.setPixelRatio(
                Math.min(
                    window.devicePixelRatio || 1,
                    1.8,
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
            handleResize,
        )

        return () => {
            cancelAnimationFrame(raf)

            window.removeEventListener(
                'resize',
                handleResize,
            )

            window.removeEventListener(
                'pointermove',
                handlePointerMove,
            )

            ctx.revert()

            starGeometry.dispose()
            starMaterial.dispose()

            streakGroup.children.forEach(
                child => {
                    const line =
                        child as THREE.Line

                    line.geometry.dispose()

                    const material =
                        line.material as THREE.Material

                    material.dispose()
                },
            )

            glowTexture.dispose()
            glowMaterial.dispose()
            coreMaterial.dispose()
            renderer.dispose()
        }
    }, [])

    return (
        <section
            ref={sectionRef}
            className="deep-space-break"
            aria-label="우주 관측과 진로 탐색을 연결하는 전환 구간"
        >
            <canvas
                ref={canvasRef}
                className="deep-space-break__canvas"
            />

            <div className="deep-space-break__vignette" />
            <div className="deep-space-break__grain" />

            <div className="deep-space-break__hud deep-space-break__hud--top">
                <span>DJSTAR · DEEP SPACE</span>
                <i />
                <span>
                    TRAVEL <b ref={progressRef}>00</b>%
                </span>
            </div>

            <div className="deep-space-break__crosshair">
                <i />
                <i />
                <span />
            </div>

            <div
                ref={copyRef}
                className="deep-space-break__copy"
            >
                <div
                    ref={eyebrowRef}
                    className="deep-space-break__eyebrow"
                >
                    FROM OBSERVATION
                    <span />
                    TO IMAGINATION
                </div>

                <h2
                    ref={titleRef}
                    className="deep-space-break__title"
                >
                    <span>우주를 보는 것에서</span>
                    <strong>우주를 꿈꾸는 것으로.</strong>
                </h2>

                <p
                    ref={koreanRef}
                    className="deep-space-break__description"
                >
                    관측은 끝이 아니라
                    <br />
                    더 먼 질문의 시작입니다.
                </p>

                <div
                    ref={footerRef}
                    className="deep-space-break__footer-copy"
                >
                    <span>OBSERVE</span>
                    <i />
                    <span>DISCOVER</span>
                    <i />
                    <span>DREAM</span>
                </div>
            </div>

            <div className="deep-space-break__edge-text">
                NEXT / ASTRO MENTORING
            </div>

            <div className="deep-space-break__scroll">
                <span>KEEP SCROLLING</span>
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

    const ctx =
        canvas.getContext('2d')!

    const gradient =
        ctx.createRadialGradient(
            size / 2,
            size / 2,
            0,
            size / 2,
            size / 2,
            size / 2,
        )

    gradient.addColorStop(
        0,
        'rgba(255,255,255,1)',
    )

    gradient.addColorStop(
        0.14,
        'rgba(214,235,255,.95)',
    )

    gradient.addColorStop(
        0.38,
        'rgba(118,170,255,.48)',
    )

    gradient.addColorStop(
        1,
        'rgba(55,100,210,0)',
    )

    ctx.fillStyle = gradient
    ctx.fillRect(
        0,
        0,
        size,
        size,
    )

    return new THREE.CanvasTexture(
        canvas,
    )
}

function smoothstep(
    edge0: number,
    edge1: number,
    value: number,
) {
    const x =
        Math.max(
            0,
            Math.min(
                1,
                (value - edge0) /
                (edge1 - edge0),
            ),
        )

    return x * x * (3 - 2 * x)
}

function easeInOutCubic(
    value: number,
) {
    return value < 0.5
        ? 4 * value * value * value
        : 1 -
        Math.pow(
            -2 * value + 2,
            3,
        ) /
        2
}
