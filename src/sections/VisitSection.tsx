import {
  KeyboardEvent,
  useEffect,
  useState,
} from 'react'

import {
  navigateTo,
} from '../lib/navigation'

const OBSERVATORY_NAME =
  '대전시민천문대'

const OBSERVATORY_ADDRESS =
  '대전광역시 유성구 과학로 213-48'

const MAP_EMBED_URL =
  'https://www.google.com/maps?q=%EB%8C%80%EC%A0%84%EC%8B%9C%EB%AF%BC%EC%B2%9C%EB%AC%B8%EB%8C%80&output=embed'

const MAP_LARGE_URL =
  'https://map.naver.com/p/search/%EB%8C%80%EC%A0%84%EC%8B%9C%EB%AF%BC%EC%B2%9C%EB%AC%B8%EB%8C%80'

const DIRECTIONS_URL =
  'https://www.google.com/maps/dir/?api=1&destination=%EB%8C%80%EC%A0%84%EC%8B%9C%EB%AF%BC%EC%B2%9C%EB%AC%B8%EB%8C%80'

const TRANSIT_URL =
  'https://www.google.com/maps/dir/?api=1&destination=%EB%8C%80%EC%A0%84%EC%8B%9C%EB%AF%BC%EC%B2%9C%EB%AC%B8%EB%8C%80&travelmode=transit'

const PARKING_CAPACITY = 24

function getInitialParkingOccupied() {
  const now =
    new Date()

  const minutes =
    now.getHours() * 60 +
    now.getMinutes()

  const wave =
    Math.sin(
      minutes / 47,
    )

  return Math.max(
    7,
    Math.min(
      21,
      Math.round(
        14 + wave * 5,
      ),
    ),
  )
}

const visitInfo = [
  {
    number: '01',
    label: 'HOURS',
    title: '운영시간',
    value: '14:00 — 22:00',
    desc: '프로그램별 운영시간은 일정에 따라 달라질 수 있습니다.',
    action: 'visit',
  },
  {
    number: '02',
    label: 'LOCATION',
    title: '위치',
    value: OBSERVATORY_NAME,
    desc: OBSERVATORY_ADDRESS,
    action: 'map',
  },
  {
    number: '03',
    label: 'PARKING',
    title: '주차',
    value: '실시간 주차 현황',
    desc: '현재 주차 가능 면수를 실시간 형식으로 확인하세요.',
    action: 'visit',
  },
] as const

const transport = [
  {
    label: 'PUBLIC TRANSPORT',
    title: '대중교통',
    value: '버스 + 도보 이동',
    desc: '가까운 정류장에서 하차 후 천문대까지 도보로 이동할 수 있습니다.',
    action: 'transit',
  },
  {
    label: 'RESERVATION',
    title: '프로그램 예약',
    value: '방문 전 예약 확인',
    desc: '관측 및 체험 프로그램은 방문 전에 운영 여부와 예약 상태를 확인해 주세요.',
    action: 'reservation',
  },
] as const

function openExternal(
  url: string,
) {
  window.open(
    url,
    '_blank',
    'noopener,noreferrer',
  )
}

export default function VisitSection() {
  const [
    parkingOccupied,
    setParkingOccupied,
  ] = useState(
    getInitialParkingOccupied,
  )

  const [
    parkingUpdatedAt,
    setParkingUpdatedAt,
  ] = useState(
    () => new Date(),
  )

  useEffect(() => {
    const interval =
      window.setInterval(
        () => {
          setParkingOccupied(
            current => {
              const delta =
                Math.random() > 0.5
                  ? 1
                  : -1

              return Math.max(
                6,
                Math.min(
                  PARKING_CAPACITY - 2,
                  current + delta,
                ),
              )
            },
          )

          setParkingUpdatedAt(
            new Date(),
          )
        },
        12000,
      )

    return () => {
      window.clearInterval(
        interval,
      )
    }
  }, [])

  const parkingAvailable =
    PARKING_CAPACITY -
    parkingOccupied

  const parkingPercent =
    Math.round(
      (
        parkingOccupied /
        PARKING_CAPACITY
      ) * 100,
    )

  const parkingStatus =
    parkingAvailable >= 10
      ? '여유'
      : parkingAvailable >= 5
        ? '보통'
        : '혼잡'

  const handleVisitInfo =
    (
      action:
        | 'visit'
        | 'map',
    ) => {
      if (action === 'map') {
        openExternal(
          MAP_LARGE_URL,
        )

        return
      }

      navigateTo(
        '/visit',
      )
    }

  const handleTransport =
    (
      action:
        | 'transit'
        | 'reservation',
    ) => {
      if (
        action ===
        'transit'
      ) {
        openExternal(
          TRANSIT_URL,
        )

        return
      }

      navigateTo(
        '/reservation',
      )
    }

  const handleKeyDown =
    (
      event:
        KeyboardEvent<HTMLElement>,
      action: () => void,
    ) => {
      if (
        event.key === 'Enter' ||
        event.key === ' '
      ) {
        event.preventDefault()
        action()
      }
    }

  return (
    <section
      className="visit-section"
      id="visit-section"
    >
      <div className="container">
        {/* =========================================
            SECTION HEADER
        ========================================== */}

        <div className="section-head compact">
          <div>
            <p className="section-kicker">
              PLAN YOUR VISIT
            </p>

            <h2>
              오늘 밤 천문대로
              <br />
              향하기 전에.
            </h2>
          </div>

          <p className="section-summary">
            운영시간과 위치부터
            <br />
            교통 주차 프로그램 예약까지
            <br />
            방문에 필요한 정보를 확인하세요.
          </p>
        </div>

        {/* =========================================
            VISIT DASHBOARD
        ========================================== */}

        <div className="visit-dashboard">
          {/* =======================================
              LEFT — REAL MAP
          ======================================== */}

          <article className="visit-access-card">
            <div className="visit-access-head">
              <div>
                <span className="visit-micro-label">
                  ACCESS MAP
                </span>

                <h3>
                  대전시민천문대
                </h3>

                <p>
                  DAEJEON OBSERVATORY
                </p>
              </div>

              <span className="visit-location-status">
                DAEJEON
              </span>
            </div>

            {/* REAL MAP */}

            <div className="visit-map-visual visit-map-visual--real">
              <iframe
                className="visit-map-frame"
                src={MAP_EMBED_URL}
                title="대전시민천문대 위치 지도"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />

              <div
                className="visit-map-shade"
                aria-hidden="true"
              />


              <div className="visit-map-coordinate">
                <span>
                  DAEJEON
                </span>

                <strong>
                  36° 23′ N
                </strong>

                <span>
                  127° 22′ E
                </span>
              </div>
            </div>

            {/* ADDRESS */}

            <div className="visit-address">
              <div>
                <span>
                  ADDRESS
                </span>

                <strong>
                  대전광역시 유성구
                  <br />
                  과학로 213-48
                </strong>
              </div>

              <div className="visit-address-actions">
                <button
                  className="primary-cta"
                  type="button"
                  onClick={() =>
                    openExternal(
                      DIRECTIONS_URL,
                    )
                  }
                >
                  길찾기
                </button>

                <button
                  className="ghost-cta"
                  type="button"
                  onClick={() =>
                    openExternal(
                      MAP_LARGE_URL,
                    )
                  }
                >
                  지도 크게 보기 ↗
                </button>
              </div>
            </div>
          </article>

          {/* =======================================
              RIGHT
          ======================================== */}

          <div className="visit-info-panel">
            {/* OPEN STATUS */}

            <article
              className="visit-open-card visit-clickable"
              role="button"
              tabIndex={0}
              onClick={() =>
                navigateTo(
                  '/visit',
                )
              }
              onKeyDown={event =>
                handleKeyDown(
                  event,
                  () =>
                    navigateTo(
                      '/visit',
                    ),
                )
              }
            >
              <div className="visit-open-top">
                <span>
                  TODAY
                </span>

                <span className="visit-open-indicator">
                  <i />
                  OPEN
                </span>
              </div>

              <div className="visit-open-time">
                <strong>
                  14:00
                </strong>

                <span>
                  —
                </span>

                <strong>
                  22:00
                </strong>
              </div>

              <p>
                오늘 운영시간
              </p>
            </article>

            {/* BASIC INFO */}

            <div className="visit-info-list">
              {visitInfo.map(
                item => {
                  const action =
                    () =>
                      handleVisitInfo(
                        item.action,
                      )

                  if (
                    item.label ===
                    'PARKING'
                  ) {
                    return (
                      <article
                        className="visit-info-item visit-parking-live"
                        key={item.label}
                      >
                        <div className="visit-info-number">
                          {item.number}
                        </div>

                        <div className="visit-info-content">
                          <div className="visit-parking-head">
                            <span>
                              PARKING
                            </span>

                            <span className="visit-parking-live-badge">
                              <i />
                              LIVE · DEMO
                            </span>
                          </div>

                          <h3>
                            주차 현황
                          </h3>

                          <div className="visit-parking-count">
                            <strong>
                              {parkingAvailable}
                            </strong>

                            <span>
                              / {PARKING_CAPACITY}
                            </span>

                            <b
                              data-status={
                                parkingStatus
                              }
                            >
                              {parkingStatus}
                            </b>
                          </div>

                          <div
                            className="visit-parking-meter"
                            aria-label={`주차장 사용률 ${parkingPercent}%`}
                          >
                            <span
                              style={{
                                width:
                                  `${parkingPercent}%`,
                              }}
                            />
                          </div>

                          <div className="visit-parking-meta">
                            <span>
                              사용 {parkingOccupied}면
                            </span>

                            <span>
                              가능 {parkingAvailable}면
                            </span>

                            <span>
                              {parkingUpdatedAt.toLocaleTimeString(
                                'ko-KR',
                                {
                                  hour:
                                    '2-digit',
                                  minute:
                                    '2-digit',
                                  second:
                                    '2-digit',
                                },
                              )}
                            </span>
                          </div>

                          <p>
                            실제 센서 연동 전 포트폴리오용
                            실시간 시뮬레이션입니다.
                          </p>
                        </div>
                      </article>
                    )
                  }

                  return (
                    <article
                      className="visit-info-item visit-clickable"
                      key={item.label}
                      role="button"
                      tabIndex={0}
                      onClick={action}
                      onKeyDown={event =>
                        handleKeyDown(
                          event,
                          action,
                        )
                      }
                    >
                      <div className="visit-info-number">
                        {item.number}
                      </div>

                      <div className="visit-info-content">
                        <span>
                          {item.label}
                        </span>

                        <h3>
                          {item.title}
                        </h3>

                        <strong>
                          {item.value}
                        </strong>

                        <p>
                          {item.desc}
                        </p>
                      </div>

                      <span
                        className="visit-info-arrow"
                        aria-hidden="true"
                      >
                        ↗
                      </span>
                    </article>
                  )
                },
              )}
            </div>
          </div>
        </div>

        {/* =========================================
            BOTTOM INFORMATION
        ========================================== */}

        <div className="visit-bottom-grid">
          {transport.map(
            item => {
              const action =
                () =>
                  handleTransport(
                    item.action,
                  )

              return (
                <article
                  className="visit-transport-card visit-clickable"
                  key={item.label}
                  role="button"
                  tabIndex={0}
                  onClick={action}
                  onKeyDown={event =>
                    handleKeyDown(
                      event,
                      action,
                    )
                  }
                >
                  <div>
                    <span>
                      {item.label}
                    </span>

                    <h3>
                      {item.title}
                    </h3>
                  </div>

                  <div>
                    <strong>
                      {item.value}
                    </strong>

                    <p>
                      {item.desc}
                    </p>
                  </div>

                  <span
                    className="visit-transport-arrow"
                    aria-hidden="true"
                  >
                    ↗
                  </span>
                </article>
              )
            },
          )}

          <article className="visit-guide-card">
            <div>
              <span>
                VISITOR GUIDE
              </span>

              <h3>
                방문 준비가
                <br />
                끝났나요?
              </h3>
            </div>

            <button
              className="primary-cta"
              type="button"
              onClick={() =>
                navigateTo(
                  '/visit',
                )
              }
            >
              방문안내 자세히 보기 →
            </button>
          </article>
        </div>
      </div>
    </section>
  )
}
