import { useState } from 'react'
import { formatArea, formatDate, formatPrice } from '../format.js'

// Full property information. Used by the public detail page and the lister's own view.
export default function PropertyInfo({ p }) {
  const [active, setActive] = useState(0)
  const facts = [
    ['Property Type', p.property_type_label],
    ['Listing Type', p.listing_type_label],
    ['Carpet Area', formatArea(p.carpet_area, p.area_unit_label)],
    p.built_up_area && ['Built-up Area', formatArea(p.built_up_area, p.area_unit_label)],
    p.bhk_label && ['BHK', p.bhk_label],
    p.bathrooms_label && ['Bathrooms', p.bathrooms_label],
    p.balconies_label && ['Balconies', p.balconies_label],
    p.floor_label && ['Floor', p.floor_label],
    p.total_floors_label && ['Total Floors', p.total_floors_label],
    p.furnishing_label && ['Furnishing', p.furnishing_label],
    p.parking_label && ['Parking', p.parking_label],
    ['Construction Status', p.construction_status_label],
    p.possession_date && ['Possession Date', formatDate(p.possession_date)],
    ['RERA Registered', p.rera_registered ? 'Yes' : 'No'],
    p.rera_registered && p.rera_number && ['RERA Number', p.rera_number],
  ].filter(Boolean)

  return (
    <>
      <div className="detail-top">
        <div>
          <div className="gallery-main">
            {p.images[active] && <img src={p.images[active]} alt={p.title} />}
          </div>
          {p.images.length > 1 && (
            <div className="gallery-thumbs">
              {p.images.map((src, i) => (
                <button key={src} className={i === active ? 'active' : ''} onClick={() => setActive(i)}>
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="detail-summary">
          <div className="chips">
            <span className="chip solid">{p.listing_type_label}</span>
            <span className="chip">{p.property_type_label}</span>
            {p.rera_registered && <span className="chip">RERA</span>}
          </div>
          <h1>{p.title}</h1>
          <div className="property-loc">📍 {p.locality}, {p.city}, {p.state}</div>
          <div className="detail-price">{formatPrice(p.price)}</div>
          <p>{p.address}{p.landmark ? ` · Near ${p.landmark}` : ''} — {p.pincode}</p>
        </div>
      </div>

      <div className="detail-section">
        <h3>Property Details</h3>
        <div className="facts">
          {facts.map(([k, v]) => (
            <div className="fact" key={k}><span>{k}</span><b>{v}</b></div>
          ))}
        </div>
      </div>

      <div className="detail-section">
        <h3>Description</h3>
        <p style={{ whiteSpace: 'pre-line' }}>{p.description}</p>
      </div>

      {p.amenity_labels.length > 0 && (
        <div className="detail-section">
          <h3>Amenities</h3>
          <ul className="amenity-list">
            {p.amenity_labels.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </div>
      )}
    </>
  )
}
