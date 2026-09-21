import { useEffect, useState } from 'react'

export default function PageLoader() {
  const [done, setDone] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 350)
    return () => clearTimeout(t)
  }, [])
  return (
    <div id="pageLoader" className={done ? 'done' : ''}>
      <div className="loader-mark">
        <span className="logo-badge lg"><b>72</b><i>acres</i></span>
        <div className="loader-bar"></div>
      </div>
    </div>
  )
}
