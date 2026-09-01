import {
    useMemo,
    useState,
} from 'react'

type ProgramId =
    | 'observation'
    | 'dome'
    | 'concert'
    | 'mentoring'

type AlertProvider =
    | 'kakao'
    | 'naver'

type ReservationProgram = {
    id: ProgramId
    category: string
    title: string
    description: string
    duration: string
    age: string
    times: string[]
}

const programs: ReservationProgram[] = [
    {
        id: 'observation',
        category: 'OBSERVATION',
        title: '야간 천체관측',
        description:
            '망원경으로 달과 행성 주요 천체를 직접 관측하는 프로그램입니다.',
        duration: '약 40분',
        age: '초등학생 이상',
        times: [
            '19:00',
            '20:00',
            '21:00',
        ],
    },
    {
        id: 'dome',
        category: 'DOME',
        title: '천체투영관 별자리 이야기',
        description:
            '돔 스크린으로 계절별 별자리와 밤하늘을 체험합니다.',
        duration: '약 30분',
        age: '가족 · 일반',
        times: [
            '15:00',
            '16:00',
            '17:00',
            '19:00',
        ],
    },
    {
        id: 'concert',
        category: 'SPECIAL',
        title: '토요 별 음악회',
        description:
            '별과 음악을 함께 즐기는 특별 프로그램입니다.',
        duration: '프로그램별 상이',
        age: '만 7세 이상',
        times: [
            '18:00',
            '20:00',
        ],
    },
    {
        id: 'mentoring',
        category: 'MENTORING',
        title: '천문 진로 멘토링',
        description:
            '천문 분야 진로와 현업 이야기를 함께 나누는 소규모 멘토링입니다.',
        duration: '약 60분',
        age: '청소년 · 일반',
        times: [
            '14:00',
            '16:00',
        ],
    },
]

function formatDateLabel(
    date: string,
) {
    if (!date) {
        return '날짜 미선택'
    }

    const parsed =
        new Date(`${date}T00:00:00`)

    return new Intl.DateTimeFormat(
        'ko-KR',
        {
            month: 'long',
            day: 'numeric',
            weekday: 'short',
        },
    ).format(parsed)
}

function getAlertTime(
    date: string,
    time: string,
) {
    if (
        !date ||
        !time
    ) {
        return ''
    }

    const target =
        new Date(
            `${date}T${time}:00`,
        )

    target.setHours(
        target.getHours() - 2,
    )

    return new Intl.DateTimeFormat(
        'ko-KR',
        {
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        },
    ).format(target)
}

function makeReservationCode() {
    return `DJ-${Math.random()
        .toString(36)
        .slice(2, 7)
        .toUpperCase()}`
}

type Props = {
    onClose: () => void
}

export default function ReservationPage({
    onClose,
}: Props) {
    const [
        selectedProgram,
        setSelectedProgram,
    ] =
        useState<ProgramId>(
            'observation',
        )

    const [
        date,
        setDate,
    ] =
        useState('')

    const [
        time,
        setTime,
    ] =
        useState('')

    const [
        people,
        setPeople,
    ] =
        useState(2)

    const [
        alertEnabled,
        setAlertEnabled,
    ] =
        useState(true)

    const [
        alertProvider,
        setAlertProvider,
    ] =
        useState<AlertProvider>(
            'kakao',
        )

    const [
        agreed,
        setAgreed,
    ] =
        useState(false)

    const [
        completed,
        setCompleted,
    ] =
        useState(false)

    const [
        reservationCode,
        setReservationCode,
    ] =
        useState('')

    const selected =
        useMemo(
            () =>
                programs.find(
                    item =>
                        item.id ===
                        selectedProgram,
                ) ?? programs[0],
            [selectedProgram],
        )

    const minDate =
        useMemo(
            () => {
                const now =
                    new Date()

                const year =
                    now.getFullYear()

                const month =
                    String(
                        now.getMonth() + 1,
                    ).padStart(
                        2,
                        '0',
                    )

                const day =
                    String(
                        now.getDate(),
                    ).padStart(
                        2,
                        '0',
                    )

                return `${year}-${month}-${day}`
            },
            [],
        )

    const canSubmit =
        Boolean(
            date &&
            time &&
            people > 0 &&
            agreed,
        )

    const alertTime =
        getAlertTime(
            date,
            time,
        )

    const completeReservation =
        () => {
            if (!canSubmit) {
                return
            }

            setReservationCode(
                makeReservationCode(),
            )

            setCompleted(true)

            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            })
        }

    if (completed) {
        return (
            <main className="reservation-page">
                <div className="reservation-shell">
                    <button
                        className="reservation-back"
                        type="button"
                        onClick={onClose}
                    >
                        ← BACK TO DJSTAR
                    </button>

                    <section className="reservation-complete">
                        <div className="reservation-complete__orb">
                            <span>
                                ✓
                            </span>
                        </div>

                        <p className="reservation-kicker">
                            RESERVATION COMPLETE
                        </p>

                        <h1>
                            예약이
                            <br />
                            완료되었습니다.
                        </h1>

                        <p className="reservation-complete__lead">
                            실제 결제·메시지 발송이 아닌
                            DJSTAR 포트폴리오용 예약 데모입니다.
                        </p>

                        <div className="reservation-complete__grid">
                            <article>
                                <span>
                                    RESERVATION
                                </span>

                                <strong>
                                    {reservationCode}
                                </strong>

                                <small>
                                    예약번호
                                </small>
                            </article>

                            <article>
                                <span>
                                    PROGRAM
                                </span>

                                <strong>
                                    {selected.title}
                                </strong>

                                <small>
                                    {selected.duration}
                                </small>
                            </article>

                            <article>
                                <span>
                                    DATE &amp; TIME
                                </span>

                                <strong>
                                    {formatDateLabel(
                                        date,
                                    )}
                                </strong>

                                <small>
                                    {time} · {people}명
                                </small>
                            </article>

                            <article>
                                <span>
                                    VISIT ALERT
                                </span>

                                <strong>
                                    {alertEnabled
                                        ? alertProvider ===
                                            'kakao'
                                            ? '카카오톡'
                                            : '네이버'
                                        : '알림 없음'}
                                </strong>

                                <small>
                                    {alertEnabled
                                        ? `${alertTime} 예정`
                                        : '알림을 신청하지 않았습니다.'}
                                </small>
                            </article>
                        </div>

                        {alertEnabled && (
                            <div className="reservation-alert-preview">
                                <div>
                                    <span>
                                        2 HOURS BEFORE
                                    </span>

                                    <strong>
                                        방문 준비 알림
                                    </strong>
                                </div>

                                <p>
                                    날씨 · 예상 관측 환경 · 주차 현황을
                                    예약 2시간 전에 함께 안내합니다.
                                </p>

                                <span className="reservation-demo-badge">
                                    DEMO
                                </span>
                            </div>
                        )}

                        <div className="reservation-complete__actions">
                            <button
                                type="button"
                                className="reservation-primary"
                                onClick={onClose}
                            >
                                DJSTAR로 돌아가기
                                <span>
                                    ↗
                                </span>
                            </button>

                            <button
                                type="button"
                                className="reservation-secondary"
                                onClick={() =>
                                    setCompleted(false)
                                }
                            >
                                예약 내용 수정
                            </button>
                        </div>
                    </section>
                </div>
            </main>
        )
    }

    return (
        <main className="reservation-page">
            <div className="reservation-shell">
                <button
                    className="reservation-back"
                    type="button"
                    onClick={onClose}
                >
                    ← BACK TO DJSTAR
                </button>

                <header className="reservation-head">
                    <div>
                        <p className="reservation-kicker">
                            DJSTAR RESERVATION
                        </p>

                        <h1>
                            오늘의 밤하늘을
                            <br />
                            예약하세요.
                        </h1>
                    </div>

                    <div className="reservation-head__summary">
                        <span>
                            01 프로그램
                        </span>

                        <i />

                        <span>
                            02 일정
                        </span>

                        <i />

                        <span>
                            03 인원
                        </span>

                        <i />

                        <span>
                            04 알림
                        </span>
                    </div>
                </header>

                <div className="reservation-layout">
                    <div className="reservation-form">
                        {/* STEP 01 */}

                        <section className="reservation-block">
                            <div className="reservation-step-head">
                                <span>
                                    STEP 01
                                </span>

                                <h2>
                                    프로그램 선택
                                </h2>

                                <p>
                                    참여하고 싶은 프로그램을 선택하세요.
                                </p>
                            </div>

                            <div className="reservation-program-grid">
                                {programs.map(
                                    item => {
                                        const active =
                                            item.id ===
                                            selectedProgram

                                        return (
                                            <button
                                                type="button"
                                                key={item.id}
                                                className={
                                                    active
                                                        ? 'reservation-program is-active'
                                                        : 'reservation-program'
                                                }
                                                onClick={() => {
                                                    setSelectedProgram(
                                                        item.id,
                                                    )

                                                    setTime('')
                                                }}
                                            >
                                                <div>
                                                    <span>
                                                        {item.category}
                                                    </span>

                                                    <i>
                                                        {active
                                                            ? '✓'
                                                            : ''}
                                                    </i>
                                                </div>

                                                <h3>
                                                    {item.title}
                                                </h3>

                                                <p>
                                                    {item.description}
                                                </p>

                                                <footer>
                                                    <span>
                                                        {item.duration}
                                                    </span>

                                                    <span>
                                                        {item.age}
                                                    </span>
                                                </footer>
                                            </button>
                                        )
                                    },
                                )}
                            </div>
                        </section>

                        {/* STEP 02 */}

                        <section className="reservation-block">
                            <div className="reservation-step-head">
                                <span>
                                    STEP 02
                                </span>

                                <h2>
                                    날짜와 시간
                                </h2>

                                <p>
                                    방문 날짜와 프로그램 시작 시간을 선택하세요.
                                </p>
                            </div>

                            <div className="reservation-date-row">
                                <label className="reservation-field">
                                    <span>
                                        DATE
                                    </span>

                                    <input
                                        type="date"
                                        min={minDate}
                                        value={date}
                                        onChange={event =>
                                            setDate(
                                                event.target.value,
                                            )
                                        }
                                    />
                                </label>

                                <div className="reservation-time-field">
                                    <span>
                                        AVAILABLE TIME
                                    </span>

                                    <div className="reservation-time-grid">
                                        {selected.times.map(
                                            slot => (
                                                <button
                                                    type="button"
                                                    key={slot}
                                                    className={
                                                        slot ===
                                                            time
                                                            ? 'is-active'
                                                            : ''
                                                    }
                                                    onClick={() =>
                                                        setTime(
                                                            slot,
                                                        )
                                                    }
                                                >
                                                    {slot}
                                                </button>
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* STEP 03 */}

                        <section className="reservation-block">
                            <div className="reservation-step-head">
                                <span>
                                    STEP 03
                                </span>

                                <h2>
                                    인원 선택
                                </h2>

                                <p>
                                    함께 방문할 인원수를 입력하세요.
                                </p>
                            </div>

                            <div className="reservation-people">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setPeople(
                                            value =>
                                                Math.max(
                                                    1,
                                                    value - 1,
                                                ),
                                        )
                                    }
                                    aria-label="인원 줄이기"
                                >
                                    −
                                </button>

                                <div>
                                    <strong>
                                        {people}
                                    </strong>

                                    <span>
                                        PEOPLE
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setPeople(
                                            value =>
                                                Math.min(
                                                    8,
                                                    value + 1,
                                                ),
                                        )
                                    }
                                    aria-label="인원 늘리기"
                                >
                                    +
                                </button>
                            </div>

                            <p className="reservation-people-note">
                                한 번에 최대 8명까지 예약할 수 있습니다.
                            </p>
                        </section>

                        {/* STEP 04 */}

                        <section className="reservation-block">
                            <div className="reservation-step-head">
                                <span>
                                    STEP 04
                                </span>

                                <h2>
                                    2시간 전 방문 알림
                                </h2>

                                <p>
                                    예약 시간 2시간 전에 날씨와 주차 현황을 함께 안내받을 수 있습니다.
                                </p>
                            </div>

                            <div className="reservation-alert-toggle">
                                <div>
                                    <strong>
                                        방문 알림 받기
                                    </strong>

                                    <span>
                                        알림 예정 · {alertTime}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className={
                                        alertEnabled
                                            ? 'reservation-switch is-on'
                                            : 'reservation-switch'
                                    }
                                    onClick={() =>
                                        setAlertEnabled(
                                            value =>
                                                !value,
                                        )
                                    }
                                    aria-pressed={
                                        alertEnabled
                                    }
                                >
                                    <span />
                                </button>
                            </div>

                            {alertEnabled && (
                                <div className="reservation-provider-grid">
                                    <button
                                        type="button"
                                        className={
                                            alertProvider ===
                                                'kakao'
                                                ? 'reservation-provider is-active'
                                                : 'reservation-provider'
                                        }
                                        onClick={() =>
                                            setAlertProvider(
                                                'kakao',
                                            )
                                        }
                                    >
                                        <div className="reservation-provider__brand">
                                            <span className="reservation-provider__mark">
                                                K
                                            </span>

                                            <div>
                                                <strong>
                                                    카카오톡
                                                </strong>

                                                <small>
                                                    KAKAO TALK
                                                </small>
                                            </div>
                                        </div>

                                        <span>
                                            {alertProvider ===
                                                'kakao'
                                                ? '✓'
                                                : ''}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        className={
                                            alertProvider ===
                                                'naver'
                                                ? 'reservation-provider is-active'
                                                : 'reservation-provider'
                                        }
                                        onClick={() =>
                                            setAlertProvider(
                                                'naver',
                                            )
                                        }
                                    >
                                        <div className="reservation-provider__brand">
                                            <span className="reservation-provider__mark">
                                                N
                                            </span>

                                            <div>
                                                <strong>
                                                    네이버
                                                </strong>

                                                <small>
                                                    NAVER
                                                </small>
                                            </div>
                                        </div>

                                        <span>
                                            {alertProvider ===
                                                'naver'
                                                ? '✓'
                                                : ''}
                                        </span>
                                    </button>
                                </div>
                            )}

                            <div className="reservation-demo-note">
                                <span>
                                    DEMO NOTICE
                                </span>

                                <p>
                                    현재 포트폴리오 버전에서는 카카오·네이버 실제 메시지를 발송하지 않습니다.
                                    실제 서비스에서는 각 플랫폼 알림 API 및 사용자 인증 연동이 필요합니다.
                                </p>
                            </div>
                        </section>

                        {/* CONSENT */}

                        <label className="reservation-consent">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={event =>
                                    setAgreed(
                                        event.target.checked,
                                    )
                                }
                            />

                            <span>
                                예약 정보와 방문 알림 설정 내용을 확인했습니다.
                            </span>
                        </label>
                    </div>

                    {/* SUMMARY */}

                    <aside className="reservation-summary">
                        <div className="reservation-summary__top">
                            <span>
                                RESERVATION SUMMARY
                            </span>

                            <b>
                                DJSTAR
                            </b>
                        </div>

                        <div className="reservation-summary__program">
                            <span>
                                {selected.category}
                            </span>

                            <h2>
                                {selected.title}
                            </h2>

                            <p>
                                {selected.description}
                            </p>
                        </div>

                        <dl className="reservation-summary__list">
                            <div>
                                <dt>
                                    DATE
                                </dt>

                                <dd>
                                    {formatDateLabel(
                                        date,
                                    )}
                                </dd>
                            </div>

                            <div>
                                <dt>
                                    TIME
                                </dt>

                                <dd>
                                    {time ||
                                        '시간 미선택'}
                                </dd>
                            </div>

                            <div>
                                <dt>
                                    PEOPLE
                                </dt>

                                <dd>
                                    {people}명
                                </dd>
                            </div>

                            <div>
                                <dt>
                                    DURATION
                                </dt>

                                <dd>
                                    {selected.duration}
                                </dd>
                            </div>
                        </dl>

                        <div className="reservation-summary__alert">
                            <div>
                                <span>
                                    2 HOURS BEFORE
                                </span>

                                <strong>
                                    방문 알림
                                </strong>
                            </div>

                            <b>
                                {alertEnabled
                                    ? 'ON'
                                    : 'OFF'}
                            </b>

                            <p>
                                {alertEnabled
                                    ? `${alertProvider ===
                                        'kakao'
                                        ? '카카오톡'
                                        : '네이버'} · ${alertTime}`
                                    : '알림을 받지 않습니다.'}
                            </p>
                        </div>

                        <button
                            type="button"
                            className="reservation-submit"
                            disabled={
                                !canSubmit
                            }
                            onClick={
                                completeReservation
                            }
                        >
                            예약 확정하기

                            <span>
                                ↗
                            </span>
                        </button>

                        {!canSubmit && (
                            <p className="reservation-submit-hint">
                                날짜 · 시간 · 동의 항목을 확인해 주세요.
                            </p>
                        )}

                        <div className="reservation-summary__bottom">
                            <span>
                                DEMO RESERVATION
                            </span>

                            <span>
                                NO PAYMENT
                            </span>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    )
}
