import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { get } from '../api.js'
import PropertyCard from '../components/PropertyCard.jsx'
import PropertyInfo from '../components/PropertyInfo.jsx'

export default function PropertyDetail() {
  const { id } = useParams()
  const [p, setP] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setP(null)
    setNotFound(false)
    get(`/api/properties/${id}/`).then(setP).catch(() => setNotFound(true))
  }, [id])

  if (notFound)
    return (
      <div className="wrap"><div className="empty">
        <h2>Property not found</h2>
        <p><Link to="/properties" className="btn-primary" style={{ marginTop: 20 }}>Back to Properties</Link></p>
      </div></div>
    )
  if (!p) return <div className="loading">Loading…</div>

  return (
    <>
      <div className="wrap">
        <div className="crumbs">
          <Link to="/">Home</Link> / <Link to="/properties">Properties</Link> / {p.title}
        </div>
        <PropertyInfo p={p} />
      </div>

      {p.related.length > 0 && (
        <section className="related">
          <div className="wrap">
            <div className="section-head">
              <div>
                <div className="eyebrow">You may also like</div>
                <h2>Related <em className="hl">Properties</em></h2>
              </div>
            </div>
            <div className="property-grid">
              {p.related.map((r) => <PropertyCard key={r.id} p={r} />)}
            </div>
          </div>
        </section>
      )}
      <div style={{ height: p.related.length ? 0 : 80 }} />
    </>
  )
}
