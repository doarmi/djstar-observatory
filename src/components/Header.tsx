import {
  navigateTo,
} from '../lib/navigation'

const nav = [
  {
    label: '오늘의 밤하늘',
    path: '/tonight',
  },
  {
    label: '프로그램',
    path: '/programs',
  },
  {
    label: '예약',
    path: '/reservation',
  },
  {
    label: '3D 천체탐험',
    path: '/experience/telescope',
  },
  {
    label: '방문안내',
    path: '/visit',
  },
]

export default function Header() {
  const handleNavigate = (
    event: React.MouseEvent<HTMLAnchorElement>,
    path: string,
  ) => {
    event.preventDefault()

    navigateTo(path)
  }

  const handleHome = (
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    event.preventDefault()

    if (
      window.location.pathname !== '/'
    ) {
      sessionStorage.removeItem(
        'djstar-jump-to-hero',
      )

      navigateTo('/')

      window.requestAnimationFrame(
        () => {
          const hero =
            document.querySelector(
              '#main',
            ) as HTMLElement | null

          if (hero) {
            hero.scrollIntoView({
              behavior: 'auto',
              block: 'start',
            })
          }
        },
      )

      return
    }

    const hero =
      document.querySelector(
        '#main',
      ) as HTMLElement | null

    if (hero) {
      hero.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a
          className="brand"
          href="/"
          aria-label="대전시민천문대 홈"
          onClick={handleHome}
        >
          <img
            className="brand-logo"
            src="/brand/djstar-logo-horizontal.png"
            alt="DJSTAR 대전시민천문대"
          />
        </a>

        <nav
          className="gnb"
          aria-label="주요 메뉴"
        >
          {nav.map(item => (
            <a
              href={item.path}
              key={item.label}
              onClick={event =>
                handleNavigate(
                  event,
                  item.path,
                )
              }
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button
          className="reserve-btn"
          type="button"
          onClick={() =>
            navigateTo(
              '/reservation',
            )
          }
        >
          예약
        </button>
      </div>
    </header>
  )
}