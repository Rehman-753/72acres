import { useEffect, useState } from 'react'

export default function FloatStack() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="float-stack">
      <a href="https://wa.me/911800123456" target="_blank" rel="noopener noreferrer" className="float-btn fb-whatsapp" aria-label="Chat on WhatsApp">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.2h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.8 14.1c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.8-.11a16 16 0 0 1-1.65-.6c-2.9-1.25-4.8-4.16-4.94-4.36-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.4.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.65.5.24.6.83 2.06.9 2.21.07.15.12.32.02.51-.1.19-.15.31-.3.48-.15.17-.31.38-.44.5-.15.15-.3.3-.13.6.17.29.76 1.25 1.62 2.03 1.12 1 2.06 1.31 2.36 1.46.29.15.47.13.64-.08.17-.2.72-.84.92-1.13.19-.28.39-.24.65-.14.27.1 1.7.8 1.99.94.29.15.48.22.55.34.07.13.07.71-.17 1.39z" /></svg>
      </a>
      <button className={`float-btn fb-top${show ? ' show' : ''}`} id="backTop" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
      </button>
    </div>
  )
}
