import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth.jsx'

function Logo() {
  return (
    <Link to="/" className="logo-badge" aria-label="72acres home">
      <b>72</b>
      <i>acres</i>
    </Link>
  )
}

export default function SiteLayout() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const { user } = useAuth()

  useEffect(() => {
    setOpen(false)
    window.scrollTo(0, 0)
  }, [pathname])

  const portalLink = user ? '/lister/dashboard' : '/lister/login'
  const portalLabel = user ? 'My Dashboard' : 'Lister Login'

  return (
    <>
      <header className={`site${open ? ' open' : ''}`}>
        <div className="wrap">
          <Logo />
          <ul className="nav-links">
            <li><NavLink to="/" end>Home</NavLink></li>
            <li><NavLink to="/properties">Properties</NavLink></li>
            <li className="only-mobile"><Link to={portalLink}>{portalLabel}</Link></li>
          </ul>
          <Link to={portalLink} className="nav-cta desk">{portalLabel}</Link>
          <button className="burger" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
            <span /><span /><span />
          </button>
        </div>
      </header>

      <main className="page">
        <Outlet />
      </main>

      <footer className="site">
        <div className="wrap">
          <div className="foot">
            <Logo />
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/properties">Properties</Link></li>
              <li><Link to={portalLink}>{portalLabel}</Link></li>
            </ul>
          </div>
          <div className="foot-bottom">© {new Date().getFullYear()} 72acres. All rights reserved.</div>
        </div>
      </footer>
    </>
  )
}
