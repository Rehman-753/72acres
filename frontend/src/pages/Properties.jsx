import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { get, qs } from '../api.js'
import PropertyCard from '../components/PropertyCard.jsx'
import SearchCard from '../components/SearchCard.jsx'

const FILTER_KEYS = ['listing_type', 'city', 'property_type', 'bhk', 'min_price', 'max_price', 'budget']

export default function Properties() {
  const [params, setParams] = useSearchParams()
  const [options, setOptions] = useState(null)
  const [data, setData] = useState(null)

  const filters = useMemo(() => {
    const o = {}
    FILTER_KEYS.forEach((k) => {
      if (params.get(k)) o[k] = params.get(k)
    })
    return o
  }, [params])
  const page = Number(params.get('page') || 1)

  useEffect(() => {
    get('/api/options/').then(setOptions).catch(() => {})
  }, [])

  useEffect(() => {
    setData(null)
    const { budget, ...apiFilters } = filters // `budget` only restores the dropdown
    get(`/api/properties/${qs({ ...apiFilters, page })}`)
      .then(setData)
      .catch(() => setData({ results: [], count: 0, page: 1, num_pages: 1 }))
  }, [filters, page])

  const goPage = (n) => {
    const next = new URLSearchParams(params)
    next.set('page', n)
    setParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="wrap">
      <div className="search-page-head">
        <div className="eyebrow">Browse</div>
        <h1>All <em style={{ fontStyle: 'normal', background: 'linear-gradient(transparent 62%,var(--grey) 62%)', padding: '0 4px' }}>Properties</em></h1>
      </div>
      <div className="filter-bar">
        <SearchCard
          options={options}
          initial={filters}
          onSubmit={(p) => setParams(Object.fromEntries(Object.entries(p).filter(([, v]) => v !== '')))}
        />
      </div>

      {data === null ? (
        <div className="loading">Loading properties…</div>
      ) : data.results.length === 0 ? (
        <div className="empty">No properties match your search.</div>
      ) : (
        <>
          <p style={{ marginBottom: 20 }}>{data.count} propert{data.count === 1 ? 'y' : 'ies'} found</p>
          <div className="property-grid">
            {data.results.map((p) => <PropertyCard key={p.id} p={p} />)}
          </div>
          {data.num_pages > 1 && (
            <div className="pager">
              <button disabled={data.page <= 1} onClick={() => goPage(data.page - 1)}>← Prev</button>
              <span>Page {data.page} of {data.num_pages}</span>
              <button disabled={data.page >= data.num_pages} onClick={() => goPage(data.page + 1)}>Next →</button>
            </div>
          )}
        </>
      )}
      <div style={{ height: 90 }} />
    </div>
  )
}
