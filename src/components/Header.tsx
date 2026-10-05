import type { MouseEvent } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

function Header() {
  const location = useLocation()

  function handleBrandClick(event: MouseEvent<HTMLAnchorElement>) {
    const isPlainClick =
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey
    const isExactHome =
      location.pathname === '/' &&
      location.search === '' &&
      location.hash === ''

    if (isPlainClick && isExactHome) {
      window.scrollTo(0, 0)
    }
  }

  return (
    <header className="site-header">
      <NavLink
        className="brand"
        to="/"
        aria-label="Kanto Field Guide home"
        onClick={handleBrandClick}
      >
        <span className="brand-mark" aria-hidden="true">
          K
        </span>
        <span>
          <strong>Kanto</strong>
          <small>Field Guide</small>
        </span>
      </NavLink>

      <nav className="main-nav" aria-label="Main navigation">
        <NavLink to="/" end>
          List
        </NavLink>
        <NavLink to="/gallery">Gallery</NavLink>
      </nav>
    </header>
  )
}

export default Header
