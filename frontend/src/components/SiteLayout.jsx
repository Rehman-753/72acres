import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useRevealOnScroll } from '../hooks.js'
import ContactModal from './ContactModal.jsx'
import FloatStack from './FloatStack.jsx'
import Footer from './Footer.jsx'
import Header from './Header.jsx'
import PageLoader from './PageLoader.jsx'

export default function SiteLayout() {
  const { pathname, hash, key } = useLocation()
  const isHome = pathname === '/'
  useRevealOnScroll()

  // Scroll to a #section on the home page, otherwise to the top on navigation.
  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => {
        document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
      }, 80)
      return () => clearTimeout(t)
    }
    window.scrollTo(0, 0)
  }, [pathname, hash, key])

  return (
    <>
      <PageLoader />
      <Header />
      <main className={isHome ? '' : 'page-top'}>
        <Outlet />
      </main>
      <Footer />
      <ContactModal />
      <FloatStack />
    </>
  )
}
