import { useEffect, useMemo, useState } from 'react'
import HeroSpace from '../components/HeroSpace'
import { navigateTo } from '../lib/navigation'

const DAEJEON = {
  lat: 36.349129,
  lng: 127.384933,
}

function getKoreaDateString() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  const year = parts.find((part) => part.type === 'year')?.value ?? ''
  const month = parts.find((part) => part.type === 'month')?.value ?? ''
  const day = parts.find((part) => part.type === 'day')?.value ?? ''

  return `${year}-${month}-${day}`
}

function formatKoreaTime(iso: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(iso))
}

export default function HeroSection() {
  const [sunset, setSunset] = useState('—')
  const [sunsetStatus, setSunsetStatus] = useState('오늘 일몰 불러오는 중')

  useEffect(() => {
    const controller = new AbortController()

    async function loadSunset() {
      try {
        const date = getKoreaDateString()

        const url =
          `https://api.sunrise-sunset.org/json` +
          `?lat=${DAEJEON.lat}` +
          `&lng=${DAEJEON.lng}` +
          `&date=${date}` +
          `&formatted=0`

        const response = await fetch(url, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Sunset request failed')
        }

        const data = await response.json()

        if (data.status !== 'OK' || !data.results?.sunset) {
          throw new Error('Invalid sunset data')
        }

        setSunset(formatKoreaTime(data.results.sunset))
        setSunsetStatus('대전 기준 오늘 일몰')
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        setSunset('—')
        setSunsetStatus('일몰 정보 확인 중')
      }
    }

    loadSunset()

    return () => {
      controller.abort()
    }
  }, [])

  const quickStats = useMemo(
    () => [
      {
        label: 'TODAY',
        value: 'OPEN',
        sub: '14:00 — 22:00',
      },
      {
        label: 'SUNSET',
        value: sunset,
        sub: sunsetStatus,
      },
      {
        label: 'OBSERVING',
        value: 'GOOD',
        sub: '예상 관측 환경',
      },
    ],
    [sunset, sunsetStatus],
  )

  return (
    <section className="hero-section">
      <div className="hero-orbit" data-speed="0.93" aria-hidden="true">
        <div className="hero-planet" />
        <div className="orbit-line orbit-line--one" />
        <div className="orbit-line orbit-line--two" />
      </div>

      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="hero-kicker">
            TONIGHT AT DJSTAR
          </p>

          <h2>
            오늘 밤
            <br />
            대전의 밤 하늘을
            <br />
            확인해보세요.
          </h2>

          <p className="hero-description">
            오늘의 관측 환경부터 프로그램과 예약 방문 정보까지
            한 흐름 안에서 확인할 수 있도록 다시 설계합니다.
          </p>

          <div className="hero-actions">
            <button
              className="primary-cta"
              type="button"
              onClick={() => navigateTo('/tonight')}
            >
              오늘의 관측 확인
            </button>

            <button
              className="ghost-cta"
              type="button"
              onClick={() => navigateTo('/programs')}
            >
              프로그램 찾기
            </button>
          </div>
        </div>

        <div className="hero-visual-card" data-speed="0.97">
          <span className="visual-tag">
            3D SPACE HERO
          </span>

          <HeroSpace />

          <div className="visual-target hero-target-overlay">
            <span className="visual-target__dot" />
          </div>

          <div className="visual-caption">
            <span>OBJECT 01</span>
            <strong>CELESTIAL NODE</strong>
          </div>
        </div>
      </div>

      <div className="container stats-grid">
        {quickStats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <small>{stat.sub}</small>
          </article>
        ))}
      </div>
    </section>
  )
}
