export function navigateTo(
  path: string,
) {
  const currentPath =
    window.location.pathname

  if (currentPath === path) {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })

    return
  }

  window.history.pushState(
    {},
    '',
    path,
  )

  window.dispatchEvent(
    new PopStateEvent(
      'popstate',
    ),
  )
}
