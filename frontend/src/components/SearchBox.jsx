import { useEffect, useState } from 'react'
import { BUDGETS } from '../format.js'

// Search widget from the reference landing page. `value` is the URL-style
// filter object; `onSubmit` receives the API query params.
const TABS = [
  { value: 'sale', label: 'Buy' },
  { value: 'rent', label: 'Rent' },
  { value: 'lease', label: 'Lease' },
]

export default function SearchBox({ options, initial = {}, onSubmit }) {
  const [f, setF] = useState({
    listing_type: initial.listing_type || 'sale',
    city: initial.city || '',
    property_type: initial.property_type || '',
    budget: initial.budget || '',
    bhk: initial.bhk || '',
  })

  useEffect(() => {
    setF((prev) => ({ ...prev, ...initial, listing_type: initial.listing_type || prev.listing_type }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initial)])

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    const b = BUDGETS.find((x) => x.value === f.budget) || BUDGETS[0]
    onSubmit({
      listing_type: f.listing_type,
      city: f.city.trim(),
      property_type: f.property_type,
      bhk: f.bhk,
      min_price: b.min,
      max_price: b.max,
      budget: f.budget,
    })
  }

  return (
    <form className="search-card" onSubmit={submit}>
      <div className="search-tabs">
        {TABS.map((t) => (
          <button
            type="button"
            key={t.value}
            className={`search-tab${f.listing_type === t.value ? ' active' : ''}`}
            onClick={() => setF({ ...f, listing_type: t.value })}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="search-fields">
        <div className="search-field">
          <label>City</label>
          <input value={f.city} onChange={set('city')} placeholder="Any city" />
        </div>
        <div className="search-field">
          <label>Property Type</label>
          <select value={f.property_type} onChange={set('property_type')}>
            <option value="">All Types</option>
            {options?.property_type.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="search-field">
          <label>Budget</label>
          <select value={f.budget} onChange={set('budget')}>
            {BUDGETS.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        </div>
        <div className="search-field">
          <label>Bedrooms</label>
          <select value={f.bhk} onChange={set('bhk')}>
            <option value="">Any</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4+ BHK</option>
          </select>
        </div>
        <button className="search-btn" type="submit">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          Search
        </button>
      </div>
    </form>
  )
}
