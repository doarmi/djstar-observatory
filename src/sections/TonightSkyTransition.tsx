import {
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
} from 'react'

import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const STAR_COUNT = 650

const constellationPoints = [
    [-3.8, 1.2],
    [-2.7, 2.1],
    [-1.4, 1.5],
    [-0.2, 2.35],
    [1.0, 1.4],
    [2.4, 2.0],
    [3.7, 0.9],
    [2.6, -0.2],
    [1.3, -1.15],
    [0.0, -0.55],
    [-1.4, -1.4],
    [-2.6, -0.5],
]

function createStarTexture() {
    const canvas =
        document.createElement('canvas')

    canvas.width = 64
    canvas.height = 64

    const ctx =
        canvas.getContext('2d')

    if (!ctx) {
        return null
    }

    const gradient =
        ctx.createRadialGradient(
            32,
            32,
            0,
            32,
            32,
            32,
        )

    gradient.addColorStop(
        0,
        'rgba(255,255,255,1)',
    )

    gradient.addColorStop(
        0.18,
        'rgba(225,235,255,.95)',
    )

    gradient.addColorStop(
        0.45,
        'rgba(155,185,255,.35)',
    )

    gradient.addColorStop(
        1,
        'rgba(100,140,255,0)',
    )

    ctx.fillStyle = gradient

    ctx.fillRect(
        0,
        0,
        64,
        64,
    )

    return new THREE.CanvasTexture(
        canvas,
    )
}

export default function TonightSkyTransition() {
    const sectionRef =
        useRef<HTMLElement>(null)

    const mountRef =
        useRef<HTMLDivElement>(null)

    const progressRef =
        useRef(0)

    const mouseRef =
        useRef({
            x: 0,
            y: 0,
        })

    const constellation =
        useMemo(
            () =>
                constellationPoints.map(
                    ([x, y]) =>
                        new THREE.Vector3(
                            x,
                            y,
                            0,
                        ),
                ),
            [],
        )

    /* =========================================
       THREE.JS
    ========================================= */

    useEffect(() => {
        const mount =
            mountRef.current

        if (!mount) {
            return
        }

        const scene =
            new THREE.Scene()

        scene.fog =
            new THREE.FogExp2(
                0x03050d,
                0.035,
            )

        const camera =
            new THREE.PerspectiveCamera(
                55,
                mount.clientWidth /
                mount.clientHeight,
                0.1,
                100,
            )

        camera.position.z = 8

        const renderer =
            new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
                powerPreference:
                    'high-performance',
            })

        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio,
                1.7,
            ),
        )

        renderer.setSize(
            mount.clientWidth,
            mount.clientHeight,
        )

        renderer.setClearColor(
            0x03050d,
            1,
        )

        mount.appendChild(
            renderer.domElement,
        )

        /* =======================================
           BACKGROUND STAR FIELD
        ======================================== */

        const positions =
            new Float32Array(
                STAR_COUNT * 3,
            )

        for (
            let i = 0;
            i < STAR_COUNT;
            i += 1
        ) {
            const i3 = i * 3

            positions[i3] =
                (Math.random() - 0.5) *
                26

            positions[i3 + 1] =
                (Math.random() - 0.5) *
                15

            positions[i3 + 2] =
                -Math.random() * 22
        }

        const geometry =
            new THREE.BufferGeometry()

        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(
                positions,
                3,
            ),
        )

        const texture =
            createStarTexture()

        const material =
            new THREE.PointsMaterial({
                size: 0.1,
                map: texture ?? undefined,
                transparent: true,
                opacity: 0.75,
                depthWrite: false,
                blending:
                    THREE.AdditiveBlending,
                color: 0xdce7ff,
                sizeAttenuation: true,
            })

        const stars =
            new THREE.Points(
                geometry,
                material,
            )

        scene.add(stars)

        /* =======================================
           CONSTELLATION STARS
        ======================================== */

        const constellationGroup =
            new THREE.Group()

        scene.add(
            constellationGroup,
        )

        const starGeometry =
            new THREE.SphereGeometry(
                0.055,
                16,
                16,
            )

        const starMaterial =
            new THREE.MeshBasicMaterial({
                color: 0xeaf1ff,
            })

        constellation.forEach(
            point => {
                const star =
                    new THREE.Mesh(
                        starGeometry,
                        starMaterial,
                    )

                star.position.copy(
                    point,
                )

                constellationGroup.add(
                    star,
                )
            },
        )

        /* =======================================
           CONSTELLATION LINE
        ======================================== */

        const linePositions =
            new Float32Array(
                constellation.length *
                3,
            )

        constellation.forEach(
            (point, index) => {
                const i3 =
                    index * 3

                linePositions[i3] =
                    point.x

                linePositions[i3 + 1] =
                    point.y

                linePositions[i3 + 2] =
                    point.z
            },
        )

        const lineGeometry =
            new THREE.BufferGeometry()

        lineGeometry.setAttribute(
            'position',
            new THREE.BufferAttribute(
                linePositions,
                3,
            ),
        )

        lineGeometry.setDrawRange(
            0,
            0,
        )

        const lineMaterial =
            new THREE.LineBasicMaterial({
                color: 0xaec7ff,
                transparent: true,
                opacity: 0.38,
            })

        const line =
            new THREE.Line(
                lineGeometry,
                lineMaterial,
            )

        constellationGroup.add(
            line,
        )

        /* =======================================
           RESIZE
        ======================================== */

        const resize = () => {
            const width =
                mount.clientWidth

            const height =
                mount.clientHeight

            camera.aspect =
                width / height

            camera.updateProjectionMatrix()

            renderer.setSize(
                width,
                height,
            )
        }

        window.addEventListener(
            'resize',
            resize,
        )

        /* =======================================
           MOUSE
        ======================================== */

        const handlePointerMove = (
            event: PointerEvent,
        ) => {
            mouseRef.current.x =
                event.clientX /
                window.innerWidth -
                0.5

            mouseRef.current.y =
                event.clientY /
                window.innerHeight -
                0.5
        }

        window.addEventListener(
            'pointermove',
            handlePointerMove,
        )

        /* =======================================
           RENDER LOOP
        ======================================== */

        let animationFrame = 0

        const render = () => {
            const progress =
                progressRef.current

            const mouse =
                mouseRef.current

            /*
             * 0 → 0.45
             * 별자리 선 생성
             */

            const drawProgress =
                THREE.MathUtils.clamp(
                    progress / 0.45,
                    0,
                    1,
                )

            const drawCount =
                Math.floor(
                    2 +
                    drawProgress *
                    (constellation.length -
                        2),
                )

            lineGeometry.setDrawRange(
                0,
                drawCount,
            )

            /*
             * 0.45 → 1
             * 카메라가 별자리 안으로 이동
             */

            const travelProgress =
                THREE.MathUtils.clamp(
                    (progress - 0.45) /
                    0.55,
                    0,
                    1,
                )

            camera.position.z =
                THREE.MathUtils.lerp(
                    8,
                    2.3,
                    travelProgress,
                )

            camera.position.x +=
                (
                    mouse.x * 0.35 -
                    camera.position.x
                ) *
                0.035

            camera.position.y +=
                (
                    -mouse.y * 0.25 -
                    camera.position.y
                ) *
                0.035

            /*
             * background star movement
             */

            stars.rotation.y =
                mouse.x * 0.035

            stars.rotation.x =
                -mouse.y * 0.025

            stars.position.z =
                progress * 4.5

            constellationGroup.rotation.z =
                Math.sin(
                    performance.now() *
                    0.00015,
                ) *
                0.015

            renderer.render(
                scene,
                camera,
            )

            animationFrame =
                requestAnimationFrame(
                    render,
                )
        }

        render()

        return () => {
            cancelAnimationFrame(
                animationFrame,
            )

            window.removeEventListener(
                'resize',
                resize,
            )

            window.removeEventListener(
                'pointermove',
                handlePointerMove,
            )

            geometry.dispose()
            material.dispose()

            starGeometry.dispose()
            starMaterial.dispose()

            lineGeometry.dispose()
            lineMaterial.dispose()

            texture?.dispose()

            renderer.dispose()

            renderer.domElement.remove()
        }
    }, [constellation])

    /* =========================================
       GSAP SCROLL
    ========================================= */

    useLayoutEffect(() => {
        const section =
            sectionRef.current

        if (!section) {
            return
        }

        const ctx =
            gsap.context(() => {
                const timeline =
                    gsap.timeline({
                        scrollTrigger: {
                            trigger: section,
                            start: 'top top',
                            end: '+=220%',
                            pin: true,
                            scrub: 0.55,
                            anticipatePin: 1,

                            onUpdate: self => {
                                progressRef.current =
                                    self.progress
                            },
                        },
                    })

                timeline
                    .fromTo(
                        '.sky-transition-kicker',
                        {
                            opacity: 0,
                            y: 18,
                        },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.15,
                        },
                    )

                    .fromTo(
                        '.sky-transition-title',
                        {
                            opacity: 0,
                            y: 45,
                        },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.22,
                        },
                        '<0.03',
                    )

                    .fromTo(
                        '.sky-transition-line',
                        {
                            scaleX: 0,
                        },
                        {
                            scaleX: 1,
                            duration: 0.18,
                        },
                    )

                    .to(
                        '.sky-transition-copy',
                        {
                            opacity: 0,
                            y: -30,
                            duration: 0.18,
                        },
                        0.66,
                    )

                    .to(
                        '.sky-transition-vignette',
                        {
                            opacity: 0.8,
                            duration: 0.2,
                        },
                        0.78,
                    )
            }, section)

        return () => {
            ctx.revert()
        }
    }, [])

    return (
        <section
            className="sky-transition"
            ref={sectionRef}
        >
            <div
                className="sky-transition-canvas"
                ref={mountRef}
                aria-hidden="true"
            />

            <div
                className="sky-transition-vignette"
                aria-hidden="true"
            />

            <div
                className="sky-transition-coordinate sky-transition-coordinate--left"
                aria-hidden="true"
            >
                36° 23′ N
            </div>

            <div
                className="sky-transition-coordinate sky-transition-coordinate--right"
                aria-hidden="true"
            >
                127° 22′ E
            </div>

            <div className="sky-transition-copy">
                <p className="sky-transition-kicker">
                    LOOK UP TONIGHT
                </p>

                <h2 className="sky-transition-title">
                    오늘 밤
                    <br />
                    어떤 우주를
                    <br />
                    만나게 될까요?
                </h2>

                <div
                    className="sky-transition-line"
                    aria-hidden="true"
                />

                <span className="sky-transition-caption">
                    DJSTAR · NIGHT SKY
                </span>
            </div>

            <div className="sky-transition-scroll">
                <span>
                    SCROLL TO EXPLORE
                </span>

                <i />
            </div>
        </section>
    )
}