import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import IntroStarfield from '../components/IntroStarfield'

type Phase = 'idle' | 'focus' | 'warp' | 'map'

export default function TelescopeIntro() {
  const sectionRef = useRef<HTMLElement>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const running = useRef(false)
  const leaving = useRef(false)

  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('.intro-kicker', { opacity: 0, y: 10, duration: 0.55 })
        .from('.viewfinder-wrap', { opacity: 0, scale: 0.965, duration: 1.05 }, '-=0.25')
        .from('.intro-label', { opacity: 0, y: 12, duration: 0.45 }, '-=0.65')
        .from('.intro-copy h1', { opacity: 0, y: 24, duration: 0.8 }, '-=0.25')
        .from('.intro-description', { opacity: 0, y: 14, duration: 0.55 }, '-=0.4')
        .from('.primary-cta', { opacity: 0, y: 10, duration: 0.45 }, '-=0.3')
        .from('.intro-hint', { opacity: 0, duration: 0.7 }, '-=0.1')

      const ring = section.querySelector<HTMLElement>('.viewfinder-ring')
      const wrap = section.querySelector<HTMLElement>('.viewfinder-wrap')
      if (!ring || !wrap) return

      const onMove = (event: PointerEvent) => {
        if (running.current) return
        const rect = wrap.getBoundingClientRect()
        const x = (event.clientX - rect.left) / rect.width - 0.5
        const y = (event.clientY - rect.top) / rect.height - 0.5
        gsap.to(ring, { x: x * 8, y: y * 8, rotationX: -y * 1.4, rotationY: x * 1.4, duration: 0.8, ease: 'power2.out' })
      }
      const onLeave = () => !running.current && gsap.to(ring, { x: 0, y: 0, rotationX: 0, rotationY: 0, duration: 0.9 })
      wrap.addEventListener('pointermove', onMove)
      wrap.addEventListener('pointerleave', onLeave)
      return () => { wrap.removeEventListener('pointermove', onMove); wrap.removeEventListener('pointerleave', onLeave) }
    }, section)

    return () => ctx.revert()
  }, [])

  const resetIntro = () => {
    const section = sectionRef.current
    if (!section) return
    gsap.set(section.querySelectorAll('.intro-copy, .scope-label, .intro-kicker, .intro-hint, .viewfinder-ring, .intro-three'), { clearProps: 'all' })
    gsap.set(section.querySelector('.intro-transition-status'), { opacity: 0, clearProps: 'transform' })
    setPhase('idle')
    running.current = false
    leaving.current = false
  }

  const exitMap = () => {
    const section = sectionRef.current
    if (!section || phase !== 'map' || leaving.current) return
    leaving.current = true

    const status = section.querySelector('.intro-transition-status')
    const three = section.querySelector('.intro-three')
    const close = section.querySelector('.intro-map-close')
    const hint = section.querySelector('.intro-map-hint')

    gsap.timeline({ defaults: { ease: 'power2.inOut' } })
      .to([status, close, hint], { opacity: 0, duration: 0.28 })
      .to(three, { opacity: 0, scale: 0.965, duration: 0.55 }, '<')
      .call(() => document.querySelector('.hero-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
      .call(() => window.setTimeout(resetIntro, 850))
  }

  useEffect(() => {
    if (phase !== 'map') return

    const onWheel = (event: WheelEvent) => {
      if (event.deltaY > 14) exitMap()
    }
    const onKey = (event: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', ' ', 'Enter', 'Escape'].includes(event.key)) exitMap()
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
    }
  }, [phase])

  const startObservation = () => {
    const section = sectionRef.current
    if (!section || running.current) return
    running.current = true

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      document.querySelector('.hero-section')?.scrollIntoView({ behavior: 'smooth' })
      running.current = false
      return
    }

    const ring = section.querySelector('.viewfinder-ring')
    const copy = section.querySelector('.intro-copy')
    const labels = section.querySelectorAll('.scope-label, .intro-kicker, .intro-hint')
    const status = section.querySelector('.intro-transition-status')
    const close = section.querySelector('.intro-map-close')
    const mapHint = section.querySelector('.intro-map-hint')
    const tl = gsap.timeline()

    setPhase('focus')
    tl.to(copy, { opacity: 0, y: 18, duration: 0.45, ease: 'power2.in' })
      .to(labels, { opacity: 0, duration: 0.35 }, '<')
      .to(ring, { scale: 0.68, rotation: -5, boxShadow: '0 0 0 3px rgba(168,208,255,.5), 0 0 150px rgba(95,135,255,.62) inset, 0 0 80px rgba(95,135,255,.3)', duration: 0.55, ease: 'power3.inOut' })
      .to(ring, { scale: 7.5, rotation: 10, borderColor: 'rgba(255,255,255,0)', duration: 1.05, ease: 'expo.in', onStart: () => setPhase('warp') })
      .to('.intro-section', { backgroundColor: '#02040b', duration: 0.35 }, '<+.25')
      .call(() => setPhase('map'))
      .fromTo('.intro-three', { scale: 1.22, filter: 'blur(10px)', opacity: 0.35 }, { scale: 1, filter: 'blur(0px)', opacity: 1, duration: 0.85, ease: 'power3.out' })
      .fromTo(status, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' })
      .fromTo([close, mapHint], { opacity: 0 }, { opacity: 1, duration: 0.4 }, '<+.1')
      .to(ring, { opacity: 0, duration: 0.35 }, '<')
  }

  return (
    <section id="top" className={`intro-section intro-phase-${phase}`} ref={sectionRef}>
      <IntroStarfield phase={phase} />
      <div className="intro-stars" aria-hidden="true" />
      <div className="container intro-inner">
        <p className="intro-kicker">DAEJEON CITIZEN OBSERVATORY</p>
        <div className="viewfinder-wrap" aria-label="망원경 뷰파인더 시뮬레이션 영역">
          <div className="viewfinder-ring"><span className="cross cross-x" /><span className="cross cross-y" /><span className="focus-dot" /></div>
          <span className="scope-label scope-label--top">AZ 134.2°</span><span className="scope-label scope-label--bottom">ALT 48.6°</span>
        </div>
        <div className="intro-copy">
          <p className="intro-label">LOOK THROUGH THE TELESCOPE</p>
          <h1>망원경 너머<br />당신의 우주를<br />만나보세요.</h1>
          <p className="intro-description">렌즈에 초점을 맞추면 대전의 밤하늘이 3D 우주 공간으로 이어집니다.</p>
          <button className="primary-cta" type="button" onClick={startObservation} disabled={phase !== 'idle'}><span>{phase === 'idle' ? '관측 시작하기' : '관측 중'}</span><span aria-hidden="true">→</span></button>
        </div>

        <div className="intro-transition-status" aria-live="polite">
          <span>CELESTIAL MAP</span>
          <strong>대전의 밤하늘을 탐색합니다</strong>
          <small>3D SPACE · LIVE OBSERVATION INTERFACE</small>
        </div>

        {phase === 'map' && (
          <>
            <button className="intro-map-close" type="button" onClick={exitMap} aria-label="3D 천체지도 닫기">×</button>
            <button className="intro-map-hint" type="button" onClick={exitMap}>SCROLL TO CONTINUE <span aria-hidden="true">↓</span></button>
          </>
        )}

        <div className="intro-hint">CLICK TO FOCUS · SCROLL TO EXPLORE</div>
      </div>
    </section>
  )
}
