import { Link } from 'react-router-dom'
import { useUi } from '../context.jsx'
import { formatArea, formatPrice } from '../format.js'

// Card markup copied from the reference page; only the values come from the backend.
export default function PropertyCard({ p, to }) {
  const { favs, toggleFav } = useUi()
  const meta = [
    { v: p.bhk_label || p.property_type_label, l: p.bhk_label ? 'Bedrooms' : 'Category' },
    p.bathrooms
      ? { v: p.bathrooms, l: 'Bathrooms' }
      : { v: p.construction_status_label, l: 'Status' },
    { v: formatArea(p.carpet_area, p.area_unit_label), l: 'Carpet Area' },
  ]

  return (
    <Link to={to || `/properties/${p.id}`} className="property-card reveal">
      <div className="property-photo">
        {p.images[0] && <img src={p.images[0]} alt={p.title} loading="lazy" />}
        <div className="property-tags"><span className="ptag verified">Verified</span><span className="ptag brokerage">0 Brokerage</span></div>
        <button
          type="button"
          className={`fav-btn${favs.has(p.id) ? ' active' : ''}`}
          aria-label="Save property"
          onClick={(e) => {
            e.preventDefault() // don't follow the card link
            toggleFav(p.id)
          }}
        >
          <svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
        </button>
        <div className="property-price-tag">{formatPrice(p.price)}</div>
      </div>
      <div className="property-body">
        <div className="property-loc">📍 {p.locality}, {p.city}</div>
        <h4>{p.title}</h4>
        <div className="property-meta">
          {meta.map((m) => (
            <div key={m.l}><b>{m.v}</b><span>{m.l}</span></div>
          ))}
        </div>
      </div>
    </Link>
  )
}
