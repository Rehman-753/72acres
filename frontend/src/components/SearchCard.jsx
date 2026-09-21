import { useEffect, useState } from 'react'
import { BUDGETS } from '../format.js'

// Search widget from the reference page (tabs + City / Type / Budget / Bedrooms).
// Tabs map to backend filters: Buy/Rent -> listing_type, Commercial/Plots -> property_type groups.
const TABS = [
  { key: 'buy', label: 'Buy' },
  { key: 'rent', label: 'Rent' },
  { key: 'commercial', label: 'Commercial' },
  { key: 'plots', label: 'Plots' },
]
const GROUPS = { commercial: 'office,shop', plots: 'plot,land' }

function modeFromParams(p) {
  if (p.property_type === GROUPS.commercial) return 'commercial'
  if (p.property_type === GROUPS.plots) return 'plots'
  return p.listing_type === 'rent' ? 'rent' : 'buy'
}

export default function SearchCard({ options, initial = {}, onSubmit }) {
  const [f, setF] = useState({ mode: 'buy', city: '', property_type: '', budget: '', bhk: '' })

  useEffect(() => {
    setF({
      mode: modeFromParams(initial),
      city: initial.city || '',
      property_type: Object.values(GROUPS).includes(initial.property_type) ? '' : initial.property_type || '',
      budget: initial.budget || '',
      bhk: initial.bhk || '',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initial)])

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const grouped = f.mode === 'commercial' || f.mode === 'plots'
  const cities = options?.cities || []
  const cityList = f.city && !cities.includes(f.city) ? [f.city, ...cities] : cities

  const submit = () => {
    const b = BUDGETS.find((x) => x.value === f.budget) || BUDGETS[0]
    onSubmit({
      listing_type: f.mode === 'buy' ? 'sale' : f.mode === 'rent' ? 'rent' : '',
      property_type: grouped ? GROUPS[f.mode] : f.property_type,
      city: f.city,
      bhk: f.bhk,
      min_price: b.min,
      max_price: b.max,
      budget: f.budget,
    })
  }

  return (
    <div className="search-card">
      <div className="search-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`search-tab${f.mode === t.key ? ' active' : ''}`}
            onClick={() => setF({ ...f, mode: t.key })}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="search-fields">
        <div className="search-field">
          <label>City</label>
          <select value={f.city} onChange={set('city')}>
            <option value="">Select City</option>
            {cityList.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="search-field">
          <label>Property Type</label>
          <select value={grouped ? '' : f.property_type} onChange={set('property_type')} disabled={grouped}>
            <option value="">All Types</option>
            {options?.property_type.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="search-field">
          <label>Budget</label>
          <select value={f.budget} onChange={set('budget')}>
            {BUDGETS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
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
        <button className="search-btn" id="searchSubmit" type="button" onClick={submit}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          Search
        </button>
      </div>
    </div>
  )
}
