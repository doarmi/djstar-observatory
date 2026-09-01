import {
  navigateTo,
} from '../lib/navigation'

const programs = [
  {
    label: 'OBSERVATION',
    title: '야간 천체관측',
    target: '초등학생 이상',
    time: '약 40분',
    reserve: '예약',
    image: '/images/program-observation.png',
    imageAlt: '별이 가득한 밤하늘 아래 천체망원경으로 관측하는 모습',
    focal: '50% 48%',
    motion: 'left',
    route: '/programs/observation',
  },
  {
    label: 'DOME',
    title: '천체투영관 별자리 이야기',
    target: '가족·일반',
    time: '약 30분',
    reserve: '현장/안내',
    image: '/images/program-dome.png',
    imageAlt: '별자리와 우주가 투영된 천체투영관 내부',
    focal: '50% 50%',
    motion: 'center',
    route: '/programs/dome',
  },
  {
    label: 'SPECIAL',
    title: '토요 별 음악회',
    target: '만 7세 이상',
    time: '프로그램별 상이',
    reserve: '예약',
    image: '/images/program-concert.png',
    imageAlt: '별빛 아래에서 진행되는 야외 음악 공연',
    focal: '50% 48%',
    motion: 'right',
    route: '/programs/concert',
  },
] as const

export default function FeaturedPrograms() {
  const openProgram = (
    route: string,
  ) => {

    navigateTo(route)
  }

  const openReservation = () => {

    navigateTo(
      '/reservation',
    )
  }

  const openAllPrograms = () => {

    navigateTo(
      '/programs',
    )
  }

  return (
    <section
      className="programs-section"
      id="featured-programs"
    >
      <div className="container">
        <div className="section-head compact">
          <div>
            <p className="section-kicker">
              FEATURED PROGRAMS
            </p>

            <h2>
              지금 예약 가능한
              <br />
              시민 관측 & 교육 프로그램
            </h2>
          </div>

          <p className="section-summary">
            대상과 소요시간 및 예약 여부를 한눈에 확인하고
            <br />
            원하는 프로그램의 상세 정보와 예약으로
            바로 이동할 수 있습니다.
          </p>
        </div>

        <div className="program-card-grid">
          {programs.map(
            program => (
              <article
                className="program-card"
                key={program.title}
              >
                <div className="program-visual program-visual--photo">
                  <img
                    src={program.image}
                    alt={program.imageAlt}
                    className={`program-photo program-photo--${program.motion}`}
                    style={{
                      objectPosition:
                        program.focal,
                    }}
                  />

                  <div
                    className="program-photo-overlay"
                    aria-hidden="true"
                  />

                  <div
                    className="program-photo-vignette"
                    aria-hidden="true"
                  />

                  <span className="program-visual-label">
                    {program.label}
                  </span>
                </div>

                <div className="program-copy">
                  <span className="program-label">
                    {program.label}
                  </span>

                  <h3>
                    {program.title}
                  </h3>

                  <div className="program-meta">
                    <span>
                      {program.target}
                    </span>

                    <span>
                      {program.time}
                    </span>

                    <span>
                      {program.reserve}
                    </span>
                  </div>

                  <div className="program-actions">
                    <button
                      className="ghost-cta"
                      type="button"
                      onClick={() =>
                        openProgram(
                          program.route,
                        )
                      }
                    >
                      자세히 보기
                    </button>

                    <button
                      className="primary-cta"
                      type="button"
                      onClick={
                        openReservation
                      }
                    >
                      예약하기
                    </button>
                  </div>
                </div>
              </article>
            ),
          )}
        </div>

        <div className="section-more">
          <button
            className="ghost-cta"
            type="button"
            onClick={
              openAllPrograms
            }
          >
            전체 프로그램 보기 →
          </button>
        </div>
      </div>
    </section>
  )
}