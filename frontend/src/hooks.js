import { useEffect } from 'react'

// Reveal-on-scroll from the reference page: any .reveal / .reveal-left / .reveal-right
// element gets `.in` when it scrolls into view. A MutationObserver picks up elements
// that React renders later (e.g. property cards loaded from the API).
export function useRevealOnScroll() {
  useEffect(() => {
    const SELECTOR = '.reveal:not(.in), .reveal-left:not(.in), .reveal-right:not(.in)'
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll(SELECTOR).forEach((el) => el.classList.add('in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            io.unobserve(entry.target)
          }
        }),
      { threshold: 0.12 },
    )
    const seen = new WeakSet()
    const scan = () =>
      document.querySelectorAll(SELECTOR).forEach((el) => {
        if (!seen.has(el)) {
          seen.add(el)
          io.observe(el)
        }
      })
    scan()
    let raf = 0
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(scan)
    })
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      io.disconnect()
      mo.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])
}
