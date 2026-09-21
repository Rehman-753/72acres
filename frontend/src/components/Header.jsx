import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import { useUi } from '../context.jsx'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { favs } = useUi()
  const { user } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const close = () => setOpen(false)
  const cls = [scrolled && 'scrolled', open && 'nav-open'].filter(Boolean).join(' ')

  return (
    <>
      <div className="nav-overlay" id="navOverlay" onClick={close}></div>
      <header id="siteHeader" className={cls}>
        <div className="wrap">
          <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Link to="/" className="logo" aria-label="72acres home" onClick={close}>
              <span className="logo-badge"><b>72</b><i>acres</i></span>
            </Link>

            <ul className="nav-links">
              <li><Link to="/properties?listing_type=sale" onClick={close}>Buy</Link></li>
              <li><Link to="/properties?listing_type=rent" onClick={close}>Rent</Link></li>
              <li><Link to="/#why" onClick={close}>Why Us</Link></li>
              <li><Link to="/#cities" onClick={close}>Cities</Link></li>
              <li><Link to="/#emi" onClick={close}>EMI Calculator</Link></li>
              <li><Link to="/#agents" onClick={close}>Agents</Link></li>
              <li><Link to="/#faq" onClick={close}>FAQ</Link></li>
            </ul>

            <div className="nav-right">
              <button className="nav-fav" id="favBtn" aria-label="Saved properties">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
                <span className="fav-count" id="favCount">{favs.size}</span>
              </button>
              <Link to={user ? '/lister/dashboard' : '/lister/login'} className="nav-cta" onClick={close}>
                {user ? 'My Dashboard' : 'List Your Property'}
              </Link>
              <div className="burger" id="burger" onClick={() => setOpen((o) => !o)}><span></span><span></span><span></span></div>
            </div>
          </nav>
        </div>
      </header>
    </>
  )
}
