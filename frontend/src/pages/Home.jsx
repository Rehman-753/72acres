import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { get, qs } from '../api.js'
import { useUi } from '../context.jsx'
import PropertyCard from '../components/PropertyCard.jsx'
import SearchCard from '../components/SearchCard.jsx'
import {
  AgentsSection, CitiesSection, CtaBanner, EmiSection, FaqSection,
  ProcessSection, StatsBand, TestimonialsSection, TrustStrip, WhySection,
} from '../components/home/StaticSections.jsx'

// Filter chips from the reference page, mapped onto backend property types.
const CHIPS = [
  { key: 'all', label: 'All Properties', types: '' },
  { key: 'apartment', label: 'Apartments', types: 'apartment,flat,penthouse,studio_apartment' },
  { key: 'villa', label: 'Villas', types: 'villa,farmhouse' },
  { key: 'plot', label: 'Plots', types: 'plot,land' },
  { key: 'commercial', label: 'Commercial', types: 'office,shop' },
]

export default function Home() {
  const navigate = useNavigate()
  const { openContact } = useUi()
  const [options, setOptions] = useState(null)
  const [chip, setChip] = useState('all')
  const [featured, setFeatured] = useState(null)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    get('/api/options/').then(setOptions).catch(() => {})
  }, [])

  useEffect(() => {
    setFeatured(null)
    const types = CHIPS.find((c) => c.key === chip).types
    get(`/api/properties/${qs({ property_type: types, page_size: 6 })}`)
      .then((d) => {
        setFeatured(d.results)
        setTotal(d.count)
      })
      .catch(() => setFeatured([]))
  }, [chip])

  return (
    <>
      <a id="top"></a>
      <section className="hero">
        <div className="wrap hero-inner split">
          <div className="hero-copy">
            <div className="hero-badge"><span className="dot"></span> RERA Registered · 0% Brokerage · Verified Only</div>
            <h1>A house is built of walls. A <em>home</em> is built of dreams.</h1>
            <p className="hero-lede">Buy, rent or sell verified properties directly with owners and trusted builders. No middlemen, no hidden brokerage, just the right address at the right price.</p>
            <div className="hero-ctas">
              <Link to="/#properties" className="btn-primary">Explore Properties &nbsp;→</Link>
              <a href="#" className="btn-ghost open-contact" onClick={(e) => { e.preventDefault(); openContact() }}>Talk to an Advisor</a>
            </div>
            <div className="hero-trust">
              <div><b>42,000+</b><span>Verified Listings</span></div>
              <div><b>25 Cities</b><span>Pan-India Presence</span></div>
              <div><b>40K+</b><span>Trusted by Families</span></div>
              <div><b>0%</b><span>Brokerage, Always</span></div>
            </div>
          </div>

          <SearchCard options={options} onSubmit={(p) => navigate(`/properties${qs(p)}`)} />
        </div>
      </section>

      <TrustStrip />
      <StatsBand />

      <section id="properties" className="ivory">
        <div className="wrap">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow">Handpicked For You</div>
              <h2>Featured <em>Properties</em></h2>
            </div>
            <p>Every listing on 72acres is personally verified for ownership, legal clarity and pricing so what you see is exactly what you get.</p>
          </div>

          <div className="filter-chips reveal" id="filterChips">
            {CHIPS.map((c) => (
              <button key={c.key} className={`filter-chip${chip === c.key ? ' active' : ''}`} onClick={() => setChip(c.key)}>
                {c.label}
              </button>
            ))}
          </div>

          {featured === null ? (
            <div className="loading">Loading properties…</div>
          ) : featured.length === 0 ? (
            <div className="empty">No properties listed here yet.</div>
          ) : (
            <div className="property-grid" id="propertyGrid">
              {featured.map((p) => <PropertyCard key={p.id} p={p} />)}
            </div>
          )}

          <div className="view-more-wrap reveal">
            <Link to={`/properties${qs({ property_type: CHIPS.find((c) => c.key === chip).types })}`} className="btn-dark">
              View All {total || ''} Properties &nbsp;→
            </Link>
          </div>
        </div>
      </section>

      <WhySection />
      <ProcessSection />
      <CitiesSection />
      <EmiSection />
      <AgentsSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaBanner />
    </>
  )
}
