import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { get, qs } from '../api.js'
import PropertyCard from '../components/PropertyCard.jsx'
import SearchBox from '../components/SearchBox.jsx'

export default function Home() {
  const navigate = useNavigate()
  const [options, setOptions] = useState(null)
  const [featured, setFeatured] = useState(null)

  useEffect(() => {
    get('/api/options/').then(setOptions).catch(() => {})
    get('/api/properties/?page_size=6')
      .then((d) => setFeatured(d.results))
      .catch(() => setFeatured([]))
  }, [])

  return (
    <>
      <section className="hero">
        <div className="wrap hero-inner">
          <div>
            <h1>A house is built of walls. A <em className="hl">home</em> is built of dreams.</h1>
            <p className="hero-lede">
              Browse properties for sale, rent and lease. Find the right address at the right price.
            </p>
            <div className="hero-ctas">
              <Link to="/properties" className="btn-primary">Explore Properties &nbsp;→</Link>
            </div>
          </div>
          <SearchBox
            options={options}
            onSubmit={(params) => navigate(`/properties${qs(params)}`)}
          />
        </div>
      </section>

      <section style={{ borderTop: '1px solid var(--grey)' }}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="eyebrow">Latest Listings</div>
              <h2>Featured <em className="hl">Properties</em></h2>
            </div>
          </div>
          {featured === null ? (
            <div className="loading">Loading…</div>
          ) : featured.length === 0 ? (
            <div className="empty">No properties listed yet.</div>
          ) : (
            <>
              <div className="property-grid">
                {featured.map((p) => <PropertyCard key={p.id} p={p} />)}
              </div>
              <div className="center">
                <Link to="/properties" className="btn-primary">View All Properties</Link>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}
