import {
  navigateTo,
} from '../lib/navigation'

const columns = [
  {
    title: 'OBSERVATORY',
    items: [
      {
        label: '천문대 소개',
        path: '/visit',
      },
      {
        label: '시설안내',
        path: '/visit',
      },
      {
        label: '조직·현황',
        path: '/visit',
      },
    ],
  },
  {
    title: 'NEWS',
    items: [
      {
        label: '공지사항',
        path: '/news',
      },
      {
        label: '행사사진',
        path: '/news',
      },
      {
        label: '천문정보',
        path: '/tonight',
      },
    ],
  },
  {
    title: 'SUPPORT',
    items: [
      {
        label: 'Q&A',
        path: '/mentoring',
      },
      {
        label: '예약확인',
        path: '/reservation',
      },
      {
        label: '이용문의',
        path: '/visit',
      },
    ],
  },
]

export default function SiteFooter() {
  const handleNavigate = (
    event: React.MouseEvent<
      HTMLAnchorElement
    >,
    path: string,
  ) => {
    event.preventDefault()

    navigateTo(path)
  }

  const handleRelatedSite = (
    event: React.ChangeEvent<
      HTMLSelectElement
    >,
  ) => {
    const url =
      event.target.value

    if (url) {
      window.open(
        url,
        '_blank',
        'noopener,noreferrer',
      )

      event.target.value = ''
    }
  }

  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div className="footer-brand-area">
          <span className="footer-brand">
            DJSTAR
          </span>

          <p>
            DAEJEON CITIZEN OBSERVATORY
            <br />
            INTERACTIVE RENEWAL CONCEPT
          </p>
        </div>

        <div className="footer-cols">
          {columns.map(
            column => (
              <div
                key={
                  column.title
                }
              >
                <span>
                  {column.title}
                </span>

                <ul>
                  {column.items.map(
                    item => (
                      <li
                        key={
                          item.label
                        }
                      >
                        <a
                          href={
                            item.path
                          }
                          onClick={
                            event =>
                              handleNavigate(
                                event,
                                item.path,
                              )
                          }
                        >
                          {
                            item.label
                          }
                        </a>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            ),
          )}
        </div>
      </div>

      <div className="container footer-bottom">
        <small>
          대전시민천문대 웹 리뉴얼
          포트폴리오 프로젝트
        </small>

        <div className="footer-related">
          <span className="footer-related-label">
            관련 기관 바로가기
          </span>

          <div className="related-select-wrap">
            <select
              id="related-site"
              className="related-select"
              defaultValue=""
              onChange={
                handleRelatedSite
              }
              aria-label="관련 기관 바로가기"
            >
              <option
                value=""
                disabled
              >
                관련 기관
              </option>

              <option value="https://www.kasi.re.kr/">
                한국천문연구원
              </option>

              <option value="https://www.kari.re.kr/">
                한국항공우주연구원
              </option>

              <option value="https://www.science.go.kr/">
                국립중앙과학관
              </option>

              <option value="https://www.daejeon.go.kr/">
                대전광역시
              </option>
            </select>

            <span
              className="related-select-arrow"
              aria-hidden="true"
            >
              ↓
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}