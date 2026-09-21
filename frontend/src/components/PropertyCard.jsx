import { Link } from 'react-router-dom'
import { formatArea, formatPrice } from '../format.js'

// Card structure from the reference design: photo (tags + price), location, title, 3 meta stats.
export default function PropertyCard({ p, to }) {
  const meta = [
    { v: p.bhk_label || p.property_type_label, l: p.bhk_label ? 'Bedrooms' : 'Type' },
    p.bathrooms_label
      ? { v: p.bathrooms, l: 'Bathrooms' }
      : { v: p.construction_status_label, l: 'Status' },
    { v: formatArea(p.carpet_area, p.area_unit_label), l: 'Carpet Area' },
  ]

  return (
    <Link to={to || `/properties/${p.id}`} className="property-card">
      <div className="property-photo">
        {p.images[0] && <img src={p.images[0]} alt={p.title} loading="lazy" />}
        <div className="property-tags">
          <span className="ptag">{p.listing_type_label}</span>
          {p.rera_registered && <span className="ptag alt">RERA</span>}
        </div>
        <div className="property-price-tag">{formatPrice(p.price)}</div>
      </div>
      <div className="property-body">
        <div className="property-loc">📍 {p.locality}, {p.city}</div>
        <h4>{p.title}</h4>
        <div className="property-meta">
          {meta.map((m) => (
            <div key={m.l}>
              <b>{m.v}</b>
              <span>{m.l}</span>
            </div>
          ))}
        </div>
      </div>
    </Link>
  )
}
